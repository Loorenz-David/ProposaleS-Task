import "server-only";

import type { CreateProposalDraftInput } from "@/lib/proposales";
import type { KnownOrAbsent } from "@/lib/values/absence";

import type { ApprovedProposal } from "../../schemas/approval";
import type { Proposition } from "../../schemas/proposition";

type MaybeKnownLeaf = { known: boolean; value?: unknown };

/**
 * Copies a leaf's own `known` flag; it never defaults one. No `??`, `||`, or default parameter
 * appears on this path: "absent" and "Proposales applies 1" are different facts, and a default
 * here would turn the second into the first before the request is even built (§17A.5).
 */
function knownValue<T>(leaf: unknown): KnownOrAbsent<T> {
  const field = leaf as MaybeKnownLeaf;
  return field.known ? { known: true, value: field.value as T } : { known: false };
}

function knownString(leaf: unknown): string | undefined {
  const field = leaf as MaybeKnownLeaf;
  return field.known ? (field.value as string) : undefined;
}

function recipientOf(proposition: Proposition): CreateProposalDraftInput["recipient"] {
  if (!proposition.recipient.known) return { known: false };
  const leaves = proposition.recipient.value;
  const value = {
    ...(knownString(leaves.firstName) === undefined ? {} : { firstName: knownString(leaves.firstName) }),
    ...(knownString(leaves.lastName) === undefined ? {} : { lastName: knownString(leaves.lastName) }),
    ...(knownString(leaves.email) === undefined ? {} : { email: knownString(leaves.email) }),
    ...(knownString(leaves.phone) === undefined ? {} : { phone: knownString(leaves.phone) }),
    ...(knownString(leaves.companyName) === undefined ? {} : { companyName: knownString(leaves.companyName) }),
  };
  // Every leaf absent is an absent recipient, never `recipient: {}` — an empty object asserts an
  // empty contact and a strict vendor schema may reject it (§17A.5).
  return Object.keys(value).length === 0 ? { known: false } : { known: true, value };
}

/**
 * The feature's half of the two-seam mapping (master §5 R10): approved proposition → the
 * lib-owned create input, which knows nothing about propositions. The lib maps that input to the
 * wire, where the strict request schema makes every price field unrepresentable.
 *
 * `language` and `titleMd` are read without a fallback because approvability has already refused
 * an approval that lacks either (§17A.6).
 */
export function toCreateDraftInput(approved: ApprovedProposal): CreateProposalDraftInput {
  const proposition = approved.proposition;
  const language = knownString(proposition.language);
  const title = knownString(proposition.title);
  const description = knownString(proposition.descriptionNarrative);

  if (language === undefined || title === undefined) {
    throw new Error("approved proposition reached execution without a language or a title");
  }

  return {
    language,
    titleMd: title,
    ...(description === undefined ? {} : { descriptionMd: description }),
    recipient: recipientOf(proposition),
    blocks: proposition.blocks.map((block) => ({
      contentId: block.contentId.value,
      quantity: knownValue<number>(block.quantity),
      optional: knownValue<boolean>(block.optional),
    })),
    generationId: approved.generationId,
  };
}
