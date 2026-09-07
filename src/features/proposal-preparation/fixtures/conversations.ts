import { MAX_CONVERSATION_TURNS } from "../schemas/conversation";

const turnId = (index: number) => `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
const timestamp = (index: number) => `2026-01-01T00:00:${String(index).padStart(2, "0")}.000Z`;

export function conversationWith(count: number) {
  return {
    turns: Array.from({ length: count }, (_, index) => {
      const ordinal = index + 1;
      if (index % 2 === 0) {
        return {
          role: "human" as const,
          turnId: turnId(ordinal),
          at: timestamp(index),
          text: `Human turn ${ordinal}`,
        };
      }
      return {
        role: "assistant" as const,
        turnId: turnId(ordinal),
        at: timestamp(index),
        kind: "clarification" as const,
        text: `Assistant turn ${ordinal}`,
      };
    }),
    omittedTurns: 0,
  };
}

export function fullConversation() {
  return conversationWith(MAX_CONVERSATION_TURNS);
}
