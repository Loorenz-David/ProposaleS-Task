import { describe, expect, it } from "vitest";

import { getAiClient } from "@/lib/ai";
import { createLogger } from "@/lib/logger";
import { createFakeProposalesClient } from "@/lib/proposales";

import { BRIEFS } from "../../fixtures/briefs";
import { FIXTURE_CATALOG } from "../../fixtures/catalog";
import { emptyConversation } from "../domain/conversation";
import { answerClarification } from "../services/answer-clarification";
import { prepareFromBrief, type PrepareDeps } from "../services/prepare-from-brief";
import { runPreparationAgent } from "./preparation.agent";

/**
 * Opt-in live evaluation against the real AI provider. Proposales stays faked, so this suite reads
 * the catalog fixture and writes nothing anywhere: the only real thing about it is the model.
 *
 * The offline suite proves the application's behaviour with a scripted client, which cannot show
 * whether a real model can follow the system prompt, pick the read tools, and produce output the
 * strict agent schema accepts. That is all this suite is for. It is a judgement of the prompt, not
 * of the code, so it is not part of the offline gate.
 */
const enabled = process.env.LIVE_SMOKE === "1";
const describeLive = enabled ? describe : describe.skip;

type AnyRecord = Record<string, unknown>;

/** Every leaf carrying its own `source`, paired with the path it sits at. */
function sourcedLeaves(value: unknown, path: string[] = [], found: Array<{ path: string[]; source: unknown }> = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => sourcedLeaves(entry, [...path, String(index)], found));
    return found;
  }
  if (value !== null && typeof value === "object") {
    const record = value as AnyRecord;
    if (Object.prototype.hasOwnProperty.call(record, "source")) {
      found.push({ path, source: record.source });
      return found;
    }
    for (const [key, nested] of Object.entries(record)) sourcedLeaves(nested, [...path, key], found);
  }
  return found;
}

/**
 * The leaves whose source policy is `consequential`. `title`, `descriptionNarrative`, `language`,
 * `reviewerComment` and `agentRationale` are presentational and may legitimately be `inferred`, so
 * a blanket scan would fail a run that behaved correctly. An assumption is consequential for every
 * kind but `other`, and its type makes an `inferred` one unrepresentable, so it needs no path entry.
 * (`assumptions` is a different field entirely: `{ path, note }`, whose note is presentational.)
 */
const CONSEQUENTIAL_LEAF = [
  /^recipient\.value\.[a-zA-Z]+$/,
  /^blocks\.\d+\.(contentId|quantity|optional)$/,
  /^commercialNotes\.\d+\.(amount|currency|taxBasis)$/,
  /^emptyDraftConfirmation$/,
];

function isConsequential(path: string[]): boolean {
  const joined = path.join(".");
  return CONSEQUENTIAL_LEAF.some((pattern) => pattern.test(joined));
}

function liveDeps() {
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
    logger: createLogger(),
    editorOrigin: "https://proposales.test",
  };
  return { proposales, deps };
}

describeLive("preparation live evaluation", () => {
  it("L1 reaches the catalog through a read tool before it answers", async () => {
    const { deps } = liveDeps();

    const agent = await runPreparationAgent({
      mode: "prepare",
      brief: BRIEFS.englishSimple,
      conversation: emptyConversation(),
      catalog: FIXTURE_CATALOG,
      companyId: 1,
      language: null,
      allowClarification: true,
    }, deps);

    const searches = agent.run.toolCalls.filter((call) => call.name === "search_content" && call.ok);
    console.log(`  live eval tool calls: ${agent.run.toolCalls.map((call) => `${call.name}${call.ok ? "" : " (failed)"}`).join(", ") || "none"}`);
    console.log(`  live eval usage: ${JSON.stringify(agent.usage)}`);

    // The model cannot name a content id it has not been shown: every id it emits is checked
    // against this run's retrieval record. A read tool is therefore the only way to a proposition.
    expect(searches.length).toBeGreaterThan(0);
    expect(agent.language).toBe("en");
  });

  it("L1 reaches a proposition whose consequential facts all carry a real source", async () => {
    const { proposales, deps } = liveDeps();

    // A first turn may legitimately answer with a clarification: the model is told it may ask when
    // something consequential cannot be derived, and this brief states no quantities. Demanding a
    // proposition here would assert a behaviour the design deliberately does not guarantee. What is
    // guaranteed is the round after it — `answerClarification` runs with clarification disallowed,
    // so the model must commit. Driving both turns also exercises answer binding and the
    // asks-once rule, which a single-turn assertion never reached.
    const first = await prepareFromBrief({ brief: BRIEFS.englishSimple }, deps);
    console.log(`  live eval first turn: ${first.result.status}`);

    let turn = first;
    if (first.result.status === "clarification") {
      const questions = first.result.questions;
      console.log(`  live eval asked: ${questions.map((question) => `${question.itemKey} — ${question.text}`).join(" | ")}`);

      turn = await answerClarification({
        state: first.state,
        conversation: first.conversation,
        answers: questions.map((question) => ({
          questionId: question.questionId,
          answer: {
            kind: "answer" as const,
            text: "Northwind AB, contact Anna Berg (anna.berg@northwind.example). "
              + "Include one consulting engagement and one training workshop, quantity 1 each.",
          },
        })),
      }, deps);
      console.log(`  live eval second turn: ${turn.result.status}`);
    }

    if (turn.result.status === "failed") {
      console.log(`  live eval failure: ${JSON.stringify(turn.result.failure)}`);
    }
    expect(turn.result.status).toBe("proposition");
    if (turn.result.status !== "proposition") return;

    if (first.result.status === "clarification") {
      // The round is closed: every question the model asked is recorded as answered, and the turn
      // that followed could not ask again.
      expect(turn.state.clarification?.answers).toHaveLength(first.result.questions.length);
    }

    const proposition = turn.result.proposition;
    expect(proposition.blocks.length).toBeGreaterThan(0);

    // `inferred` is barred from consequential leaves by the proposition schema, so an assembled
    // proposition cannot carry one. Asserting it anyway is what makes this an evaluation of the
    // model's output rather than of the schema: a run that reached here at all satisfied it.
    const leaves = sourcedLeaves(proposition);
    const consequential = leaves.filter((leaf) => isConsequential(leaf.path));
    // The scan found leaves to judge: an empty list would make the next assertion vacuous.
    expect(consequential.length).toBeGreaterThan(0);
    expect(consequential.filter((leaf) => leaf.source === "inferred").map((leaf) => leaf.path.join("."))).toEqual([]);

    // `commercialAssumptions` needs no scan: for every kind but `other`, `statedValue.source` is
    // typed `"brief" | "human"`, so an `inferred` deadline or term is unrepresentable rather than
    // merely rejected. A model that emitted one would fail the parse and never reach a proposition.

    for (const block of proposition.blocks) {
      expect(FIXTURE_CATALOG.map((item) => item.variationId)).toContain(block.contentId.value);
      expect(block.pricing).toBe("library");
    }

    console.log(`  live eval blocks: ${proposition.blocks.map((block) => `${block.contentId.value} (${block.title.value})`).join(", ")}`);
    console.log(`  live eval warnings: ${proposition.warnings.map((warning) => warning.kind).join(", ") || "none"}`);
    expect(proposales.writes).toBe(0);
  });
});
