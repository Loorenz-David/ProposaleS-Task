import type { CallFailure } from "../../types/session";
import type { DomainResult } from "../../schemas/turn-result";

type RunFailure = Extract<DomainResult, { status: "failed" }>["failure"];

export type ErrorTreatmentKey =
  | "validation_error"
  | "unauthenticated"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "approval_required"
  | "integration_error"
  | "rate_limited"
  | "internal_error"
  | "unknown";

export type CallFailureViewModel = {
  key: ErrorTreatmentKey;
  message: string;
  canRetry: boolean;
  detail: string | null;
};

export type CreationFailureViewModel = CallFailureViewModel & {
  headline: string;
  nothingSentStatement: string;
  existingDraft: { identifier: string; editorUrl: string } | null;
};

const KNOWN_KEYS = new Set<ErrorTreatmentKey>([
  "validation_error",
  "unauthenticated",
  "forbidden",
  "not_found",
  "conflict",
  "approval_required",
  "integration_error",
  "rate_limited",
  "internal_error",
]);

function detailText(details: Record<string, unknown> | undefined) {
  if (!details) return null;
  const issues = Array.isArray(details.issues) ? details.issues : [];
  const messages = issues.flatMap((issue) => {
    if (!issue || typeof issue !== "object") return [];
    const message = "message" in issue ? issue.message : null;
    return typeof message === "string" ? [message] : [];
  });
  return messages.length > 0 ? messages.join(" ") : null;
}

export function toCallFailureViewModel(failure: CallFailure): CallFailureViewModel {
  const code = failure.error.code as string;
  const key = KNOWN_KEYS.has(code as ErrorTreatmentKey)
    ? (code as ErrorTreatmentKey)
    : "unknown";
  return {
    key,
    message:
      key === "unknown" && !failure.error.message
        ? "An unexpected error occurred."
        : failure.error.message,
    canRetry: failure.error.details?.retryable === true && key !== "validation_error",
    detail: detailText(failure.error.details),
  };
}

export function toCreationFailureViewModel(failure: CallFailure): CreationFailureViewModel {
  const base = toCallFailureViewModel(failure);
  const proposalUuid = failure.error.details?.proposalUuid;
  const editorUrl = failure.error.details?.editorUrl;
  return {
    ...base,
    headline: "Could not create the draft",
    nothingSentStatement: "Nothing was sent, and your reviewed proposition is still here.",
    existingDraft:
      typeof proposalUuid === "string" && typeof editorUrl === "string"
        ? { identifier: proposalUuid, editorUrl }
        : null,
  };
}

export function toRunFailureTurn(failure: RunFailure): {
  headline: string;
  detail: string | null;
  issuePaths: string[];
} {
  if (failure.reason === "budget_exhausted") {
    return {
      headline: "The agent reached its working limit",
      detail: "Your brief and any proposition remain available.",
      issuePaths: [],
    };
  }
  if (failure.reason === "model_output_invalid") {
    return {
      headline: "The agent returned an invalid draft",
      detail: "Review the affected information and try again.",
      // `issues` is optional: absent means the run reported no issues, which is a fact about the
      // failure rather than a value to default. This is the one `??` the adapter needs.
      issuePaths: (failure.issues ?? []).map((issue) => {
        const location = issue.path.length === 0 ? "Root" : issue.path.join(" › ");
        return `${location}: ${issue.message}`;
      }),
    };
  }
  // `tool_output_invalid` and the test-only `script_exhausted` are the same thing to a reader:
  // the run could not use what it was given, and nothing was sent.
  return {
    headline: "A catalog result could not be used",
    detail: "Nothing was sent and your existing work remains available.",
    issuePaths: [],
  };
}
