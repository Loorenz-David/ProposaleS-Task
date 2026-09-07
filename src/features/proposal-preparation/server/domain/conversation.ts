import "server-only";

import type { RunFailureReason } from "@/lib/agent/types";

import type { Proposition } from "../../schemas/proposition";
import {
  MAX_CONVERSATION_TURNS,
  MAX_TURN_TEXT_CHARS,
  type AssistantTurn,
  type ConversationContext,
  type ConversationTurn,
  type HumanTurn,
} from "../../schemas/conversation";

export type RenderableResult =
  | { status: "proposition" }
  | { status: "clarification"; questions: ReadonlyArray<{ questionId: string; itemKey: string }> }
  | { status: "failed"; failure: { reason: RunFailureReason } };

export function emptyConversation(): ConversationContext {
  return { turns: [], omittedTurns: 0 };
}

export function appendTurns(context: ConversationContext, turns: ReadonlyArray<ConversationTurn>): ConversationContext {
  const combined = [...context.turns, ...turns];
  const dropped = Math.max(0, combined.length - MAX_CONVERSATION_TURNS);
  return {
    turns: dropped === 0 ? combined : combined.slice(dropped),
    omittedTurns: context.omittedTurns + dropped,
  };
}

export function humanTurn(input: Omit<HumanTurn, "role">): HumanTurn {
  return { role: "human", ...input };
}

export function assistantTurn(input: Omit<AssistantTurn, "role">): AssistantTurn {
  return { role: "assistant", ...input };
}

function cutToBudget(text: string): string {
  const marker = " […]";
  if (text.length <= MAX_TURN_TEXT_CHARS) return text;
  return `${text.slice(0, MAX_TURN_TEXT_CHARS - marker.length)}${marker}`;
}

function renderProposition(proposition: Proposition): string {
  const lines = [`Proposed version ${proposition.version}.`];
  proposition.blocks.forEach((block, blockIndex) => {
    lines.push(`Block ${blockIndex + 1}: ${block.title.value} (content ${block.contentId.value})`);
    block.alternatives.forEach((alternative, alternativeIndex) => {
      lines.push(`  alternative ${alternativeIndex + 1}: ${alternative.title} (content ${alternative.variationId}, ${alternative.matchStrength})`);
    });
  });
  lines.push(`Warnings: ${proposition.warnings.map((warning) => warning.kind).sort().join(", ")}`);
  lines.push(`Unresolved: ${proposition.unresolvedItems.map((item) => item.itemKey).sort().join(", ")}`);
  const rationale = proposition.agentRationale as { known: boolean; value?: string };
  if (rationale.known && rationale.value !== undefined) lines.push(rationale.value);
  return lines.join("\n");
}

function renderClarification(result: Extract<RenderableResult, { status: "clarification" }>): string {
  return [
    `Asked ${result.questions.length} question(s):`,
    ...result.questions.map((question) => `  [${question.questionId}] ${question.itemKey}`),
  ].join("\n");
}

export function renderAssistantTurn(result: RenderableResult, proposition?: Proposition): string {
  let rendered: string;
  if (result.status === "proposition") {
    rendered = proposition === undefined ? "Proposed version unavailable." : renderProposition(proposition);
  } else if (result.status === "clarification") {
    rendered = renderClarification(result);
  } else {
    rendered = `Preparation failed: ${result.failure.reason}`;
  }
  return cutToBudget(rendered);
}
