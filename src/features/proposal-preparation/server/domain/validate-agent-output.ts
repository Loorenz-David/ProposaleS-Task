import "server-only";

import type { z } from "zod";

import type { AgentOutput, agentOutputSchemaFor } from "../../schemas/agent-output";
import type { Proposition } from "../../schemas/proposition";
import { hasRetrieved, type RetrievalRecord } from "./retrieval-record";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSourcedLeaf(value: Record<string, unknown>): value is Record<string, unknown> & {
  source: string;
  ref?: { variationId?: string; questionId?: string; turnId?: string; quote?: string };
} {
  if (typeof value.source !== "string") return false;
  if (value.ref === undefined) return true;
  return isRecord(value.ref);
}

function valueAtPath(value: unknown, path: readonly string[]): unknown {
  let cursor = value;
  for (const segment of path) {
    if (Array.isArray(cursor)) {
      if (!(segment in cursor)) return undefined;
      cursor = cursor[Number(segment)];
      continue;
    }
    if (!isRecord(cursor) || !(segment in cursor)) return undefined;
    cursor = cursor[segment];
  }
  return cursor;
}

function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function validateAgentOutput(
  raw: unknown,
  ctx: {
    schema: ReturnType<typeof agentOutputSchemaFor>;
    retrieval: RetrievalRecord;
    answeredQuestionIds: string[];
    currentProposition?: Proposition;
    currentTurn?: { turnId: string; text: string };
  },
): { ok: true; output: AgentOutput } | { ok: false; issues: Array<{ path: string[]; message: string }> } {
  const parsed = ctx.schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((issue) => ({ path: issue.path.map(String), message: issue.message })),
    };
  }

  const issues: Array<{ path: string[]; message: string }> = [];
  const issueKeys = new Set<string>();
  const addIssue = (path: string[], message: string) => {
    const key = JSON.stringify(path);
    if (!issueKeys.has(key)) {
      issueKeys.add(key);
      issues.push({ path, message });
    }
  };

  const visit = (value: unknown, path: string[]): void => {
    if (Array.isArray(value)) {
      value.forEach((entry, index) => visit(entry, [...path, String(index)]));
      return;
    }
    if (!isRecord(value)) return;

    if (isSourcedLeaf(value)) {
      const leaf = value;
      if (leaf.source === "proposales_content") {
        if (leaf.ref?.variationId === undefined || !hasRetrieved(ctx.retrieval, leaf.ref.variationId)) {
          addIssue(path, "Content provenance does not reference catalog content retrieved in this run.");
        }
      }
      if (leaf.source === "human") {
        const byQuestion = leaf.ref?.questionId !== undefined && ctx.answeredQuestionIds.includes(leaf.ref.questionId);
        const current = ctx.currentProposition === undefined ? undefined : valueAtPath(ctx.currentProposition, path);
        const byCurrent = isRecord(current) && current.source === "human" && sameValue(current.value, leaf.value);
        const quote = leaf.ref?.quote?.trim();
        const byTurn = quote !== undefined
          && ctx.currentTurn !== undefined
          && leaf.ref?.turnId === ctx.currentTurn.turnId
          && ctx.currentTurn.text.includes(quote);
        if (!byQuestion && !byCurrent && !byTurn) {
          addIssue(path, "Human provenance does not reference an answered question, a preserved human value, or the current instruction.");
        }
      }
      return;
    }

    for (const [key, entry] of Object.entries(value)) visit(entry, [...path, key]);
  };

  visit(parsed.data, []);
  if (parsed.data.kind === "proposition") {
    parsed.data.blocks.forEach((block, index) => {
      if (!hasRetrieved(ctx.retrieval, block.contentId.value)) {
        addIssue(["blocks", String(index), "contentId"], "Content id was not retrieved in this run.");
      }
    });
  }

  return issues.length === 0
    ? { ok: true, output: parsed.data }
    : { ok: false, issues };
}
