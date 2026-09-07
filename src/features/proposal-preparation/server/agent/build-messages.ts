import "server-only";

import type { AgentMessage } from "@/lib/ai";

import type { ClarificationAnswer } from "../../schemas/clarification";
import type { Proposition } from "../../schemas/proposition";
import type { ConversationContext } from "../../schemas/conversation";
import type { ModelPropositionView } from "../domain/model-view";

export type PreparationAnswer = ClarificationAnswer & { itemKey: string };

/**
 * An answer as the model sees it. `label` is how the answer is named in the block, and therefore
 * how the model must refer back to it: a short per-round alias under the evidence-citing contract,
 * the question's own id under the older one, which asked the model to repeat that id verbatim.
 */
export type RenderedAnswer = PreparationAnswer & { label?: string };

export type PreparationMessageInput = {
  brief: string;
  catalogLanguages: ReadonlyArray<string>;
  language: string | null;
  answers?: ReadonlyArray<RenderedAnswer>;
  /** The proposition under revision, in whichever vocabulary the run's output contract uses. */
  currentProposition?: Proposition | ModelPropositionView;
  conversation: ConversationContext;
  instruction?: { turnId: string; text: string };
};

export function labeledBlock(name: string, text: string): string {
  const escape = (value: string) => value.replaceAll("<<<", "< < <").replaceAll(">>>", "> > >");
  return `<<<${escape(name)} (untrusted data)\n${escape(text)}\n>>>`;
}

function userBlock(name: string, body: string): AgentMessage {
  return { role: "user", content: labeledBlock(name, body) };
}

function renderCatalogLanguages(languages: ReadonlyArray<string>, language: string | null): string {
  const lines = [`catalog languages: ${languages.join(", ")}`];
  if (language !== null) lines.push(`proposal language: ${language}`);
  return lines.join("\n");
}

function renderAnswers(answers: ReadonlyArray<RenderedAnswer>): string {
  return answers.map(({ questionId, itemKey, answer, label }) => {
    const value = answer.kind === "skip" ? "skipped" : answer.text;
    return `[${label ?? questionId}] ${itemKey}: ${value}`;
  }).join("\n");
}

function renderHistory(conversation: ConversationContext): string {
  const lines: string[] = [];
  if (conversation.omittedTurns > 0) lines.push(`earlier turns omitted: ${conversation.omittedTurns}`);
  conversation.turns.forEach((turn, index) => {
    lines.push(`--- turn ${index + 1} · ${turn.role} · ${turn.turnId} ---`);
    lines.push(turn.text);
  });
  return lines.join("\n");
}

export function buildPreparationMessages(input: PreparationMessageInput): AgentMessage[] {
  const messages: AgentMessage[] = [
    userBlock("brief", input.brief),
    userBlock("catalog_languages", renderCatalogLanguages(input.catalogLanguages, input.language)),
  ];
  if (input.answers !== undefined) messages.push(userBlock("clarification_answers", renderAnswers(input.answers)));
  if (input.currentProposition !== undefined) messages.push(userBlock("current_proposition", JSON.stringify(input.currentProposition)));
  if (input.conversation.turns.length > 0) messages.push(userBlock("conversation_history", renderHistory(input.conversation)));
  if (input.instruction !== undefined) {
    messages.push(userBlock(`current_instruction · turn ${input.instruction.turnId}`, input.instruction.text));
  }
  return messages;
}
