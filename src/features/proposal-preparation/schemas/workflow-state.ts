import { z } from "zod";

import { ValidationError } from "@/lib/errors/app-error";
import { isoTimestampSchema } from "@/lib/values/timestamp";
import { uuidV4Schema } from "@/lib/values/uuid";

import { clarificationSchema } from "./clarification";
import { informationItemsRecordSchema } from "./information-items";
import { propositionSchema } from "./proposition";
import { MAX_BRIEF_CHARS, boundedText } from "./shared";

export const MAX_WORKFLOW_STATE_BYTES = 1048576;

const briefSchema = z.strictObject({
  text: boundedText(MAX_BRIEF_CHARS),
  receivedAt: isoTimestampSchema,
});

function draftReferenceSchemaFor(editorOrigin: string) {
  return z.strictObject({
    proposalUuid: uuidV4Schema,
    editorUrl: z.url().refine((url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" && parsed.origin === editorOrigin;
      } catch {
        return false;
      }
    }),
  });
}

export function proposalWorkflowStateSchemaFor(editorOrigin: string) {
  return z.strictObject({
    generationId: uuidV4Schema,
    brief: briefSchema,
    items: informationItemsRecordSchema,
    clarification: clarificationSchema.optional(),
    preparedProposition: propositionSchema.optional(),
    currentProposition: propositionSchema.optional(),
    draftReference: draftReferenceSchemaFor(editorOrigin).optional(),
  });
}

export type ProposalWorkflowState = z.infer<ReturnType<typeof proposalWorkflowStateSchemaFor>>;

function serializationError(): ValidationError {
  return new ValidationError({
    reason: "domain_rule",
    issues: [{ path: [], message: "workflow state must be JSON-serializable" }],
  });
}

function zodIssues(error: z.ZodError) {
  return error.issues.flatMap((issue) => {
    if (issue.code === "unrecognized_keys") {
      return issue.keys.map((key) => ({
        path: [...issue.path.map(String), key],
        message: issue.message,
      }));
    }
    return [{ path: issue.path.map(String), message: issue.message }];
  });
}

export function parseProposalWorkflowState(raw: unknown, editorOrigin: string): ProposalWorkflowState {
  let serialized: string | undefined;
  try {
    serialized = JSON.stringify(raw);
  } catch {
    throw serializationError();
  }
  if (serialized === undefined) throw serializationError();

  const byteLength = new TextEncoder().encode(serialized).length;
  if (byteLength > MAX_WORKFLOW_STATE_BYTES) {
    throw new ValidationError({
      reason: "workflow_state_too_large",
      issues: [{ path: [], message: `workflow state exceeds ${MAX_WORKFLOW_STATE_BYTES} bytes` }],
    });
  }
  const parsed = proposalWorkflowStateSchemaFor(editorOrigin).safeParse(raw);
  if (!parsed.success) {
    throw new ValidationError({ issues: zodIssues(parsed.error) });
  }
  return parsed.data;
}
