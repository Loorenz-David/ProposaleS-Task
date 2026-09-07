import { z } from "zod";

import { isoTimestampSchema } from "@/lib/values/timestamp";
import { uuidV4Schema } from "@/lib/values/uuid";

import { MAX_INSTRUCTION_CHARS, boundedText } from "./shared";

export const MAX_CONVERSATION_TURNS = 12;
export const MAX_TURN_TEXT_CHARS = MAX_INSTRUCTION_CHARS + 1000;

const humanTurnSchema = z.strictObject({
  role: z.literal("human"),
  turnId: uuidV4Schema,
  at: isoTimestampSchema,
  text: boundedText(MAX_TURN_TEXT_CHARS),
});

const assistantTurnSchema = z.strictObject({
  role: z.literal("assistant"),
  turnId: uuidV4Schema,
  at: isoTimestampSchema,
  kind: z.enum(["clarification", "proposition", "failed"]),
  text: boundedText(MAX_TURN_TEXT_CHARS),
  propositionVersion: z.number().int().min(1).optional(),
}).superRefine((turn, ctx) => {
  if (turn.kind === "proposition" && turn.propositionVersion === undefined) {
    ctx.addIssue({ code: "custom", path: ["propositionVersion"], message: "proposition turns require propositionVersion" });
  }
  if (turn.kind !== "proposition" && turn.propositionVersion !== undefined) {
    ctx.addIssue({ code: "custom", path: ["propositionVersion"], message: "only proposition turns may carry propositionVersion" });
  }
});

export const conversationTurnSchema = z.discriminatedUnion("role", [humanTurnSchema, assistantTurnSchema]);
export type HumanTurn = z.infer<typeof humanTurnSchema>;
export type AssistantTurn = z.infer<typeof assistantTurnSchema>;
export type ConversationTurn = HumanTurn | AssistantTurn;

export const conversationContextSchema = z.strictObject({
  turns: z.array(conversationTurnSchema).max(MAX_CONVERSATION_TURNS),
  omittedTurns: z.number().int().nonnegative(),
});
export type ConversationContext = z.infer<typeof conversationContextSchema>;
