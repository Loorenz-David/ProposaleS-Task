import {
  LIBRARY_PRICING_STATEMENT_ID,
  LIBRARY_PRICING_STATEMENT_TEXT,
} from "../../schemas/approval";
import type { Proposition } from "../../schemas/proposition";
import type { SessionRuntimeRecord } from "../../types/session";
import { readLeaf, sourcedToLeaf, type MaybeLeaf } from "./leaf";
import { toMoneyDisplay } from "./money";

/**
 * The exact wording the human acknowledges, and the id that names it. Both come from the schema
 * module that owns the approval envelope, so the wording on screen and the id in the payload
 * cannot drift apart.
 */
export const PRICING_ACKNOWLEDGMENT = {
  statementId: LIBRARY_PRICING_STATEMENT_ID,
  wording: LIBRARY_PRICING_STATEMENT_TEXT,
} as const;

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

export function toProvenanceViewModel(leaf: MaybeLeaf<unknown>): ProvenanceViewModel {
  if (!leaf.known) return { class: "absent", text: "Not set" };
  if (leaf.source === "human") return { class: "human", text: "Set by you" };
  if (leaf.source === "inferred") {
    return { class: "inferred", text: "Assumed by the agent" };
  }
  return { class: "sourced", text: null };
}

/**
 * Types the value the human typed for the leaf it belongs to. `apply-edits.ts` re-parses a
 * `set_leaf` value with the leaf's own schema, so a quantity must arrive as a JSON number and an
 * optional flag as a JSON boolean; anything else is sent as the raw string and the server reports
 * the type error at the path. This is JSON typing for the wire, not locale parsing or reformatting.
 */
export function toLeafValue(
  kind: EditableLeafViewModel["kind"],
  text: string | number | boolean,
): unknown {
  // The inline editor hands back what the human typed. A value that is already a number or a
  // boolean needs no interpretation and is passed through.
  if (typeof text !== "string") return text;
  const trimmed = text.trim();
  if (kind === "number" && /^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (kind === "boolean") {
    const lowered = trimmed.toLowerCase();
    if (lowered === "yes" || lowered === "true") return true;
    if (lowered === "no" || lowered === "false") return false;
  }
  return text;
}

function samePath(left: string[], right: string[]) {
  return left.length === right.length && left.every((part, index) => part === right[index]);
}

/** Finds the leaf kind a rendered path was given, so a committed edit can be typed for the wire. */
export function leafKindForPath(
  review: ReviewSurfaceViewModel,
  path: string[],
): EditableLeafViewModel["kind"] | null {
  const leaves = [
    ...review.fields.map((field) => field.leaf),
    ...review.blocks.flatMap((block) => [block.quantity, block.optional, block.reviewerComment]),
  ];
  return leaves.find((leaf) => samePath(leaf.path, path))?.kind ?? null;
}

function displayLeaf(leaf: MaybeLeaf<string | number | boolean>, absentText: string) {
  if (!leaf.known) return absentText;
  if (typeof leaf.value === "boolean") return leaf.value ? "Yes" : "No";
  return String(leaf.value);
}

function toEditableLeaf(
  record: SessionRuntimeRecord,
  leaf: MaybeLeaf<string | number | boolean>,
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

function propositionFrom(record: SessionRuntimeRecord): Proposition {
  const proposition = record.workflow?.currentProposition;
  if (!proposition) throw new Error("Review presentation requires a current proposition.");
  return proposition;
}

function countResolutions(proposition: Proposition) {
  let unresolved = 0;
  let deferred = 0;
  for (const item of proposition.unresolvedItems) {
    if (item.resolution === "unresolved") unresolved += 1;
    if (item.resolution === "deferred_by_user") deferred += 1;
  }
  return { unresolved, deferred };
}

const RECIPIENT_ROWS = [
  ["firstName", "First name"],
  ["lastName", "Last name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["companyName", "Company"],
] as const;

export function toReviewSurfaceViewModel(
  record: SessionRuntimeRecord,
  validation: Array<{ path: string[]; message: string }> = [],
): ReviewSurfaceViewModel {
  const proposition = propositionFrom(record);
  const title = readLeaf<string>(proposition.title);
  const fields: FieldViewModel[] = [
    { leaf: toEditableLeaf(record, title, ["title"], "Title", "text", validation), canAsk: true },
    {
      leaf: toEditableLeaf(record, readLeaf<string>(proposition.language), ["language"], "Language", "text", validation),
      canAsk: true,
    },
    {
      leaf: toEditableLeaf(
        record,
        readLeaf<string>(proposition.descriptionNarrative),
        ["descriptionNarrative"],
        "Introduction",
        "text",
        validation,
      ),
      canAsk: true,
    },
  ];

  /**
   * An absent recipient still gets its five rows, each at its own leaf path. `apply-edits.ts`
   * materializes the recipient when one of those leaves is set, so every row is editable; a single
   * "Recipient: Not set" row would have been an affordance with no operation behind it.
   */
  const recipientLeaves: Record<string, unknown> | undefined = proposition.recipient.known
    ? proposition.recipient.value
    : undefined;
  for (const [key, label] of RECIPIENT_ROWS) {
    fields.push({
      leaf: toEditableLeaf(
        record,
        recipientLeaves === undefined ? { known: false } : readLeaf<string>(recipientLeaves[key]),
        ["recipient", "value", key],
        label,
        "text",
        validation,
      ),
      canAsk: true,
    });
  }

  const blocks = proposition.blocks.map((block, index): BlockViewModel => {
    const blockTitle = block.title.value;
    const description = readLeaf<string>(block.description);
    return {
      index,
      contentId: block.contentId.value,
      title: blockTitle,
      description: description.known ? description.value : null,
      replacedByHuman: block.contentId.source === "human",
      quantity: toEditableLeaf(
        record,
        readLeaf<number>(block.quantity),
        ["blocks", String(index), "quantity"],
        `${blockTitle} quantity`,
        "number",
        validation,
        "Not set — Proposales applies its default",
      ),
      optional: toEditableLeaf(
        record,
        readLeaf<boolean>(block.optional),
        ["blocks", String(index), "optional"],
        `${blockTitle} optional`,
        "boolean",
        validation,
        "Not set — Proposales applies its default",
      ),
      reviewerComment: toEditableLeaf(
        record,
        readLeaf<string>(block.reviewerComment),
        ["blocks", String(index), "reviewerComment"],
        `${blockTitle} reviewer comment`,
        "text",
        validation,
      ),
      pricingStatement: "Pricing comes from the content library and is applied by Proposales.",
      alternatives: block.alternatives.map((alternative) => ({
        variationId: alternative.variationId,
        title: alternative.title,
        matchStrength: alternative.matchStrength,
        reason: alternative.reason.value,
      })),
    };
  });

  const { unresolved, deferred } = countResolutions(proposition);
  const renderedPaths = [
    ...fields.map((field) => field.leaf.path),
    ...blocks.flatMap((block) => [block.quantity.path, block.optional.path, block.reviewerComment.path]),
  ];
  const companyName = proposition.recipient.known
    ? readLeaf<string>(proposition.recipient.value.companyName)
    : { known: false as const };

  return {
    title: title.known ? title.value : "Untitled proposal",
    clientLabel: companyName.known ? companyName.value : null,
    version: proposition.version,
    fields,
    blocks,
    notes: {
      commercialNotes: proposition.commercialNotes.map((note) => {
        const amount = readLeaf<{ amountMinor: number; currency: string }>(note.amount);
        return {
          text: note.text.value,
          amountDisplay: amount.known ? toMoneyDisplay(amount.value) : null,
          amountProvenance: toProvenanceViewModel(amount),
          taxBasis: note.taxBasis.value,
        };
      }),
      commercialAssumptions: proposition.commercialAssumptions.map((assumption) => ({
        kind: assumption.kind,
        statedValue: assumption.statedValue.value,
        provenance: toProvenanceViewModel(sourcedToLeaf(assumption.statedValue)),
      })),
      assumptions: proposition.assumptions.map((assumption) => ({
        pathLabel: assumption.path.join(" › "),
        note: assumption.note.value,
      })),
      warnings: proposition.warnings.map((warning) => ({
        kind: warning.kind,
        text: warning.text.value,
      })),
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
    acknowledgment: PRICING_ACKNOWLEDGMENT,
  };
}
