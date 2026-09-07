import type { SessionRuntimeRecord } from "../../types/session";
import type {
  TemporaryLeaf,
  TemporaryProposition,
} from "../../types/temporary-turn";
import { TEMPORARY_FIXTURE_PRICING_ACKNOWLEDGMENT } from "./created";
import { toMoneyDisplay } from "./money";

export type ProvenanceViewModel =
  | { class: "absent"; text: string }
  | { class: "human"; text: "Set by you" }
  | { class: "inferred"; text: "Assumed by the agent" }
  | { class: "sourced"; text: null };

export type EditableLeafViewModel = {
  path: string[];
  label: string;
  kind: "text" | "number" | "boolean";
  display: string;
  isAbsent: boolean;
  provenance: ProvenanceViewModel;
  editStatus:
    | { status: "idle" }
    | { status: "saving" }
    | { status: "failed"; message: string };
  validationMessage: string | null;
};

export type FieldViewModel = { leaf: EditableLeafViewModel; canAsk: boolean };
export type AlternativeViewModel = {
  variationId: string;
  title: string;
  matchStrength: string;
  reason: string;
};
export type BlockViewModel = {
  index: number;
  contentId: string;
  title: string;
  description: string | null;
  replacedByHuman: boolean;
  quantity: EditableLeafViewModel;
  optional: EditableLeafViewModel;
  reviewerComment: EditableLeafViewModel;
  pricingStatement: string;
  alternatives: AlternativeViewModel[];
};
export type ReadinessViewModel = {
  unresolved: number;
  deferred: number;
  summary: string;
  nothingSentStatement: string;
};
export type NotesViewModel = {
  commercialNotes: Array<{
    text: string;
    amountDisplay: string | null;
    amountProvenance: ProvenanceViewModel;
    taxBasis: string;
  }>;
  commercialAssumptions: Array<{
    kind: string;
    statedValue: string;
    provenance: ProvenanceViewModel;
  }>;
  assumptions: Array<{ pathLabel: string; note: string }>;
  warnings: Array<{ kind: string; text: string }>;
  unresolvedItems: Array<{
    itemLabel: string;
    resolution: "unresolved" | "deferred_by_user";
    resolutionText: string;
  }>;
};
export type ReviewSurfaceViewModel = {
  title: string;
  clientLabel: string | null;
  version: number;
  fields: FieldViewModel[];
  blocks: BlockViewModel[];
  notes: NotesViewModel;
  readiness: ReadinessViewModel;
  surfaceErrors: string[];
  acknowledgment: { statementId: string; wording: string };
};

export function toProvenanceViewModel(leaf: TemporaryLeaf<unknown>): ProvenanceViewModel {
  if (!leaf.known) return { class: "absent", text: "Not set" };
  if (leaf.source === "human") return { class: "human", text: "Set by you" };
  if (leaf.source === "inferred") {
    return { class: "inferred", text: "Assumed by the agent" };
  }
  return { class: "sourced", text: null };
}

function samePath(left: string[], right: string[]) {
  return left.length === right.length && left.every((part, index) => part === right[index]);
}

function displayLeaf(
  leaf: TemporaryLeaf<string | number | boolean>,
  absentText: string,
) {
  if (!leaf.known) return absentText;
  if (typeof leaf.value === "boolean") return leaf.value ? "Yes" : "No";
  return String(leaf.value);
}

function toEditableLeaf(
  record: SessionRuntimeRecord,
  leaf: TemporaryLeaf<string | number | boolean>,
  path: string[],
  label: string,
  kind: EditableLeafViewModel["kind"],
  validation: Array<{ path: string[]; message: string }>,
  absentText = "Not set",
): EditableLeafViewModel {
  const validationMessage = validation.find((issue) => samePath(issue.path, path))?.message ?? null;
  const failedEdit =
    record.callFailure?.site.kind === "edit" && samePath(record.callFailure.site.path, path)
      ? record.callFailure.error.message
      : null;
  const isSaving = record.inFlightTurn?.kind === "edit" && samePath(record.inFlightTurn.path, path);
  const provenance = toProvenanceViewModel(leaf);
  if (!leaf.known && provenance.class === "absent") provenance.text = absentText;
  return {
    path,
    label,
    kind,
    display: displayLeaf(leaf, absentText),
    isAbsent: !leaf.known,
    provenance,
    editStatus: isSaving
      ? { status: "saving" }
      : failedEdit
        ? { status: "failed", message: failedEdit }
        : { status: "idle" },
    validationMessage,
  };
}

function propositionFrom(record: SessionRuntimeRecord): TemporaryProposition {
  const proposition = record.workflow?.currentProposition;
  if (!proposition) throw new Error("Review presentation requires a current proposition.");
  return proposition;
}

function countResolutions(proposition: TemporaryProposition) {
  let unresolved = 0;
  let deferred = 0;
  for (const item of proposition.unresolvedItems) {
    if (item.resolution === "unresolved") unresolved += 1;
    if (item.resolution === "deferred_by_user") deferred += 1;
  }
  return { unresolved, deferred };
}

function displayKnownString(leaf: TemporaryLeaf<string>) {
  return leaf.known ? leaf.value : "Not set";
}

export function toReviewSurfaceViewModel(
  record: SessionRuntimeRecord,
  validation: Array<{ path: string[]; message: string }> = [],
): ReviewSurfaceViewModel {
  const proposition = propositionFrom(record);
  const fields: FieldViewModel[] = [
    { leaf: toEditableLeaf(record, proposition.title, ["title"], "Title", "text", validation), canAsk: true },
    { leaf: toEditableLeaf(record, proposition.language, ["language"], "Language", "text", validation), canAsk: true },
    {
      leaf: toEditableLeaf(
        record,
        proposition.descriptionNarrative,
        ["descriptionNarrative"],
        "Introduction",
        "text",
        validation,
      ),
      canAsk: true,
    },
  ];

  if (proposition.recipient.known) {
    const recipientRows = [
      ["firstName", "First name", proposition.recipient.firstName],
      ["lastName", "Last name", proposition.recipient.lastName],
      ["email", "Email", proposition.recipient.email],
      ["phone", "Phone", proposition.recipient.phone],
      ["companyName", "Company", proposition.recipient.companyName],
    ] as const;
    for (const [key, label, leaf] of recipientRows) {
      fields.push({
        leaf: toEditableLeaf(record, leaf, ["recipient", key], label, "text", validation),
        canAsk: true,
      });
    }
  } else {
    fields.push({
      leaf: toEditableLeaf(record, proposition.recipient, ["recipient"], "Recipient", "text", validation),
      canAsk: true,
    });
  }

  const blocks = proposition.blocks.map((block, index): BlockViewModel => ({
    index,
    contentId: block.contentId.value,
    title: block.title,
    description: block.description.known ? block.description.value : null,
    replacedByHuman: block.contentId.source === "human",
    quantity: toEditableLeaf(
      record,
      block.quantity,
      ["blocks", String(index), "quantity"],
      `${block.title} quantity`,
      "number",
      validation,
      "Not set — Proposales applies its default",
    ),
    optional: toEditableLeaf(
      record,
      block.optional,
      ["blocks", String(index), "optional"],
      `${block.title} optional`,
      "boolean",
      validation,
      "Not set — Proposales applies its default",
    ),
    reviewerComment: toEditableLeaf(
      record,
      block.reviewerComment,
      ["blocks", String(index), "reviewerComment"],
      `${block.title} reviewer comment`,
      "text",
      validation,
    ),
    pricingStatement: "Pricing comes from the content library and is applied by Proposales.",
    alternatives: block.alternatives.map((alternative) => ({ ...alternative })),
  }));

  const { unresolved, deferred } = countResolutions(proposition);
  const renderedPaths = [
    ...fields.map((field) => field.leaf.path),
    ...blocks.flatMap((block) => [block.quantity.path, block.optional.path, block.reviewerComment.path]),
  ];

  return {
    title: proposition.title.known ? proposition.title.value : "Untitled proposal",
    clientLabel:
      proposition.recipient.known && proposition.recipient.companyName.known
        ? proposition.recipient.companyName.value
        : null,
    version: proposition.version,
    fields,
    blocks,
    notes: {
      commercialNotes: proposition.commercialNotes.map((note) => ({
        text: note.text,
        amountDisplay: note.amount.known ? toMoneyDisplay(note.amount.value) : null,
        amountProvenance: toProvenanceViewModel(note.amount),
        taxBasis: displayKnownString(note.taxBasis),
      })),
      commercialAssumptions: proposition.commercialAssumptions.map((assumption) => ({
        kind: assumption.kind,
        statedValue: displayKnownString(assumption.statedValue),
        provenance: toProvenanceViewModel(assumption.statedValue),
      })),
      assumptions: proposition.assumptions.map((assumption) => ({
        pathLabel: assumption.path.join(" › "),
        note: assumption.note,
      })),
      warnings: proposition.warnings.map((warning) => ({ kind: warning.kind, text: warning.text })),
      unresolvedItems: proposition.unresolvedItems.map((item) => ({
        itemLabel: item.itemKey,
        resolution: item.resolution,
        resolutionText: item.resolution === "unresolved" ? "Open" : "Deferred by you",
      })),
    },
    readiness: {
      unresolved,
      deferred,
      summary: `${unresolved} open · ${deferred} deferred · nothing sent yet`,
      nothingSentStatement: "Nothing has been sent. Approval creates a draft in Proposales.",
    },
    surfaceErrors: validation
      .filter((issue) => !renderedPaths.some((path) => samePath(path, issue.path)))
      .map((issue) => issue.message),
    acknowledgment: TEMPORARY_FIXTURE_PRICING_ACKNOWLEDGMENT,
  };
}
