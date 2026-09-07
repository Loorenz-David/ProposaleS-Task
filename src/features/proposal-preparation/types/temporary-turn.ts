import type { ErrorDto } from "@/lib/errors/error-dto";
import type { Money } from "@/lib/values/money";

export type TemporarySource = "brief" | "proposales_content" | "human" | "inferred";
export type TemporaryLeaf<T> =
  | { known: true; value: T; source: TemporarySource }
  | { known: false };

export type TemporaryAlternative = {
  variationId: string;
  title: string;
  matchStrength: "weak" | "possible" | "strong";
  reason: string;
};

export type TemporaryBlock = {
  contentId: { value: string; source: "proposales_content" | "human" };
  title: string;
  description: TemporaryLeaf<string>;
  quantity: TemporaryLeaf<number>;
  optional: TemporaryLeaf<boolean>;
  reviewerComment: TemporaryLeaf<string>;
  alternatives: TemporaryAlternative[];
};

export type TemporaryProposition = {
  version: number;
  language: TemporaryLeaf<string>;
  title: TemporaryLeaf<string>;
  descriptionNarrative: TemporaryLeaf<string>;
  recipient:
    | {
        known: true;
        firstName: TemporaryLeaf<string>;
        lastName: TemporaryLeaf<string>;
        email: TemporaryLeaf<string>;
        phone: TemporaryLeaf<string>;
        companyName: TemporaryLeaf<string>;
      }
    | { known: false };
  blocks: TemporaryBlock[];
  commercialNotes: Array<{
    text: string;
    amount: TemporaryLeaf<Money>;
    taxBasis: TemporaryLeaf<"including_tax" | "excluding_tax" | "unstated">;
  }>;
  commercialAssumptions: Array<{
    kind: "deadline" | "term" | "scope_commitment" | "other";
    statedValue: TemporaryLeaf<string>;
  }>;
  unresolvedItems: Array<{
    itemKey: string;
    resolution: "unresolved" | "deferred_by_user";
  }>;
  assumptions: Array<{ path: string[]; note: string }>;
  warnings: Array<{ kind: string; text: string; path?: string[] }>;
  agentRationale: TemporaryLeaf<string>;
};

export type TemporaryClarification = {
  questions: Array<{ questionId: string; itemKey: string; text: string }>;
  answers: Array<{
    questionId: string;
    answer: { kind: "answer"; text: string } | { kind: "skip" };
  }>;
};

export type TemporaryAppliedPricing =
  | {
      available: true;
      totalWithoutTax: Money;
      totalWithTax: Money;
      currency: string;
      blocks: Array<{
        contentId: string;
        quantity: number;
        optional: boolean;
        unitValueWithDiscountWithoutTax: Money;
        unitValueWithDiscountWithTax: Money;
      }>;
      warnings: Array<{ kind: "block_currency_differs"; contentId: string }>;
    }
  | {
      available: false;
      reason:
        | "read_failed_upstream"
        | "read_failed_timeout"
        | "read_failed_schema_mismatch"
        | "read_budget_exhausted";
    };

export type TemporaryDraftResult = {
  proposalUuid: string;
  editorUrl: string;
  newlyCreated: boolean;
  appliedPricing: TemporaryAppliedPricing;
  notices: Array<{ kind: "inline_recipient_may_duplicate_contact" }>;
};

export type TemporaryRunFailure =
  | { reason: "budget_exhausted"; budget: "wall_time" | "tool_calls" | "tokens" }
  | { reason: "model_output_invalid"; issues: Array<{ path: string[] }> }
  | { reason: "tool_output_invalid" };

export type TemporaryDomainResult =
  | { status: "clarification"; clarification: TemporaryClarification }
  | { status: "proposition"; proposition: TemporaryProposition }
  | { status: "failed"; failure: TemporaryRunFailure }
  | { status: "created"; draftResult: TemporaryDraftResult }
  | { status: "recovered"; draftResult: TemporaryDraftResult };

export type TemporaryWorkflowState = {
  currentProposition?: TemporaryProposition;
  clarification?: TemporaryClarification;
  draftReference?: { proposalUuid: string; editorUrl: string };
};

export type TemporaryEditOperation =
  | { op: "set_leaf"; path: string[]; value: string | number | boolean }
  | { op: "remove_block"; index: number }
  | { op: "replace_block"; index: number; variationId: string }
  | { op: "unset_recipient" }
  | { op: "confirm_empty_draft" };

export type TemporaryTurnInput =
  | { kind: "brief"; text: string }
  | { kind: "answers"; answers: TemporaryClarification["answers"] }
  | { kind: "edit"; operation: TemporaryEditOperation }
  | { kind: "revision"; instruction: string; scope: string | null }
  | {
      kind: "approval";
      workflow: TemporaryWorkflowState;
      proposition: TemporaryProposition;
      acknowledgment: { statementId: string; wording: string };
    };

export type TemporaryTurnOutcome =
  | { ok: true; result: TemporaryDomainResult; workflow: TemporaryWorkflowState }
  | { ok: false; error: ErrorDto };
