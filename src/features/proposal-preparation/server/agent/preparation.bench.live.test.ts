import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { getAiClient } from "@/lib/ai";
import { createLogger } from "@/lib/logger";
import { createFakeProposalesClient } from "@/lib/proposales";

import { BRIEFS } from "../../fixtures/briefs";
import { FIXTURE_CATALOG } from "../../fixtures/catalog";
import type { OutputContract } from "./preparation.agent";
import { answerClarification } from "../services/answer-clarification";
import { prepareFromBrief, type PrepareDeps } from "../services/prepare-from-brief";
import { reviseProposition } from "../services/revise-proposition";

/**
 * The before/after measurement for the model-facing payload work. It is not a gate: it asserts only
 * that the workflow still succeeds and that nothing was written, and its product is a JSON file of
 * per-call measurements to compare across contracts.
 *
 * It is opt-in twice over. `LIVE_SMOKE=1` is the repository's existing switch for suites that spend
 * real money; `LIVE_BENCH=1` is this file's own, because the matrix below is far more expensive
 * than the live regression gate and should never be dragged along by it. Proposales stays faked, so
 * the only real thing here is the model.
 *
 *   LIVE_SMOKE=1 LIVE_BENCH=1 npm run test:live
 *   LIVE_SMOKE=1 LIVE_BENCH=1 BENCH_CONTRACT=rich BENCH_LABEL=before npm run test:live
 *
 * Every figure it records is provider-reported or measured locally. Nothing here estimates.
 */
const enabled = process.env.LIVE_SMOKE === "1" && process.env.LIVE_BENCH === "1";
const describeBench = enabled ? describe : describe.skip;

const CONTRACT: OutputContract = process.env.BENCH_CONTRACT === "rich" ? "rich" : "compact";
const LABEL = process.env.BENCH_LABEL ?? CONTRACT;
const REPEATS = Number(process.env.BENCH_REPEATS ?? "3");
const RESULTS_DIR = path.join(
  process.cwd(),
  "build_docs/under_constroction/debuging_live_agent/payload_and_latency/results",
);

type StepRecord = {
  label?: string;
  kind: string;
  schemaChars: number;
  latencyMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  cachedInputTokens: number | null;
  reasoningTokens: number | null;
  toolCallCount: number;
  outputRetries: number;
};

/** Reads the run loop's own step log, which is where the per-call measurements already exist. */
function collector() {
  const steps: StepRecord[] = [];
  const logger = createLogger({
    sink: (line: string) => {
      const record = JSON.parse(line) as Record<string, unknown>;
      if (record.event !== "agent.run.step") return;
      steps.push({
        ...(typeof record.label === "string" ? { label: record.label } : {}),
        kind: String(record.kind),
        schemaChars: Number(record.schemaChars ?? 0),
        latencyMs: Number(record.latencyMs ?? 0),
        inputTokens: (record.inputTokens ?? null) as number | null,
        outputTokens: (record.outputTokens ?? null) as number | null,
        cachedInputTokens: (record.cachedInputTokens ?? null) as number | null,
        reasoningTokens: (record.reasoningTokens ?? null) as number | null,
        toolCallCount: Number(record.toolCallCount ?? 0),
        outputRetries: Number(record.outputRetries ?? 0),
      });
    },
  });
  return { steps, logger };
}

function benchDeps() {
  const { steps, logger } = collector();
  const proposales = createFakeProposalesClient({
    catalog: FIXTURE_CATALOG,
    company: { companyId: 1, currency: "EUR", taxMode: "standard" },
  });
  const deps: PrepareDeps = {
    proposales,
    ai: getAiClient(),
    now: () => Date.now(),
    newGenerationId: () => crypto.randomUUID(),
    newQuestionId: () => crypto.randomUUID(),
    newTurnId: () => crypto.randomUUID(),
    newRunId: () => crypto.randomUUID(),
    logger,
    editorOrigin: "https://proposales.test",
  };
  return { steps, proposales, deps };
}

function summarize(steps: StepRecord[]) {
  const sum = (read: (step: StepRecord) => number | null) =>
    steps.reduce((total, step) => total + (read(step) ?? 0), 0);
  return {
    modelCalls: steps.length,
    inputTokens: sum((step) => step.inputTokens),
    outputTokens: sum((step) => step.outputTokens),
    cachedInputTokens: sum((step) => step.cachedInputTokens),
    reasoningTokens: sum((step) => step.reasoningTokens),
    toolCalls: sum((step) => step.toolCallCount),
    corrections: Math.max(0, ...steps.map((step) => step.outputRetries)),
    maxSchemaChars: Math.max(0, ...steps.map((step) => step.schemaChars)),
    latencyMs: sum((step) => step.latencyMs),
  };
}

const scenarios = [
  { id: "S1", brief: BRIEFS.vagueScope, answer: "Onboarding for twelve people: one consulting engagement and one training workshop, quantity 1 each. Send it to Anna Berg, anna.berg@northwind.example, at Northwind AB." },
  { id: "S2", brief: BRIEFS.englishSimple, answer: "One consulting engagement and one training workshop, quantity 1 each." },
  { id: "S3", brief: BRIEFS.multiDomain, answer: "Include consulting, the training workshop and the analytics dashboard, quantity 1 each." },
  { id: "S4", brief: BRIEFS.noCatalogMatch, answer: "Nothing in the catalog fits; propose what is closest and flag it." },
  { id: "S5", brief: BRIEFS.sekExpectation, answer: "One consulting engagement and one training workshop, quantity 1 each." },
  { id: "S7", brief: BRIEFS.swedishSimple, answer: "En konsultinsats och en utbildningsworkshop, kvantitet 1 vardera." },
] as const;

describeBench(`preparation payload bench (${LABEL})`, () => {
  it("measures the scenario matrix and writes the comparison file", async () => {
    const runs: unknown[] = [];

    for (const scenario of scenarios) {
      const repeats = scenario.id === "S1" ? Math.max(REPEATS, 5) : REPEATS;
      for (let attempt = 1; attempt <= repeats; attempt += 1) {
        const { steps, proposales, deps } = benchDeps();
        const first = await prepareFromBrief({ brief: scenario.brief }, { ...deps, outputContract: CONTRACT });
        const firstTurn = summarize(steps);
        const afterFirst = steps.length;

        let second: ReturnType<typeof summarize> | null = null;
        let turn = first;
        if (first.result.status === "clarification") {
          turn = await answerClarification({
            state: first.state,
            conversation: first.conversation,
            answers: first.result.questions.map((question) => ({
              questionId: question.questionId,
              answer: { kind: "answer" as const, text: scenario.answer },
            })),
          }, { ...deps, outputContract: CONTRACT });
          second = summarize(steps.slice(afterFirst));
        }

        let revision: ReturnType<typeof summarize> | null = null;
        if (scenario.id === "S2" && turn.result.status === "proposition") {
          const before = steps.length;
          await reviseProposition(
            { state: turn.state, conversation: turn.conversation, instruction: "Make the training workshop optional." },
            { ...deps, outputContract: CONTRACT },
          );
          revision = summarize(steps.slice(before));
        }

        runs.push({
          scenario: scenario.id,
          attempt,
          contract: CONTRACT,
          firstTurnStatus: first.result.status,
          finalStatus: turn.result.status,
          firstTurn,
          secondTurn: second,
          revision,
          steps: steps.map((step) => ({ ...step })),
          proposalesWrites: proposales.writes,
        });

        expect(proposales.writes).toBe(0);
      }
    }

    mkdirSync(RESULTS_DIR, { recursive: true });
    const file = path.join(RESULTS_DIR, `${new Date().toISOString().slice(0, 10)}-${LABEL}.json`);
    writeFileSync(file, `${JSON.stringify({ label: LABEL, contract: CONTRACT, model: getAiClient().model, runs }, null, 2)}\n`);
    console.log(`  bench results: ${file}`);

    // The bench judges payload, not correctness, so it asserts only what would invalidate the
    // numbers: every scenario produced a real turn, and nothing was written anywhere.
    expect(runs.length).toBeGreaterThan(0);
  }, 45 * 60 * 1000);
});
