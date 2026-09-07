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

function cutToBudget(versionLine: string, blockLines: ReadonlyArray<ReadonlyArray<string>>, blockCount: number): string {
  const blockOnlyLines = [versionLine];
  let renderedBlocks = 0;
  for (const currentBlockLines of blockLines) {
    const remainingBlocks = blockCount - (renderedBlocks + 1);
    const marker = `… ${remainingBlocks} more blocks not summarised.`;
    const candidate = [...blockOnlyLines, ...currentBlockLines, marker].join("\n");
    if (candidate.length > MAX_TURN_TEXT_CHARS) break;
    blockOnlyLines.push(...currentBlockLines);
    renderedBlocks += 1;
  }
  const marker = `… ${blockCount - renderedBlocks} more blocks not summarised.`;
  const content = blockOnlyLines.join("\n");
  return `${content}${" ".repeat(MAX_TURN_TEXT_CHARS - content.length - marker.length - 1)}\n${marker}`;
}

function renderProposition(proposition: Proposition): string {
  const versionLine = `Proposed version ${proposition.version}.`;
  const blockLines = proposition.blocks.map((block, blockIndex) => [
    `Block ${blockIndex + 1}: ${block.title.value} (content ${block.contentId.value})`,
    ...block.alternatives.map((alternative, alternativeIndex) => `  alternative ${alternativeIndex + 1}: ${alternative.title} (content ${alternative.variationId}, ${alternative.matchStrength})`),
  ]);
  const warnings = proposition.warnings.map((warning) => warning.kind).sort();
  const unresolved = proposition.unresolvedItems.map((item) => item.itemKey).sort();
  const suffix: string[] = [];
  if (warnings.length > 0) suffix.push(`Warnings: ${warnings.join(", ")}`);
  if (unresolved.length > 0) suffix.push(`Unresolved: ${unresolved.join(", ")}`);
  const rationale = proposition.agentRationale as { known: boolean; value?: string };
  if (rationale.known && rationale.value !== undefined) suffix.push(rationale.value);
  const complete = [versionLine, ...blockLines.flat(), ...suffix].join("\n");
  if (complete.length <= MAX_TURN_TEXT_CHARS) return complete;
  return cutToBudget(versionLine, blockLines, proposition.blocks.length);
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
  return rendered;
}
