import { describe, expect, it, vi } from "vitest";

import { createScriptedAiClient } from "@/lib/ai";
import { createLogger } from "@/lib/logger";

import { FIXTURE_CATALOG } from "../../fixtures/catalog";
import { agentPropositionOutput, finalStep, languageStep, searchStep } from "../../fixtures/scripts";
import { validState } from "../../fixtures/states";
import { propositionWithAlternatives } from "../../fixtures/propositions";
import { parseProposalWorkflowState } from "../../schemas/workflow-state";
import { emptyConversation } from "../domain/conversation";
import { PREPARATION_TOOLS } from "../tools";
import { buildPreparationMessages } from "./build-messages";
import { runPreparationAgent } from "./preparation.agent";

describe("runPreparationAgent", () => {
  it("P12 passes message assembly and tool descriptors through unchanged", async () => {
    const proposition = propositionWithAlternatives();
    const state = parseProposalWorkflowState(
      validState({ currentProposition: proposition, preparedProposition: proposition }),
      "https://proposales.test",
    );
    const conversation = emptyConversation();
    const ai = createScriptedAiClient([finalStep(agentPropositionOutput({ blocks: [{ ...(agentPropositionOutput().blocks as any[])[0], alternatives: [] }] }))]);
    await runPreparationAgent({
      mode: "revise",
      brief: state.brief.text,
      state,
      conversation,
      catalog: FIXTURE_CATALOG,
      companyId: 1,
      language: "en",
      allowClarification: false,
    }, { ai, now: () => 0, logger: createLogger({ sink: vi.fn() }), newRunId: () => "run-1" });

    expect(ai.calls[0].messages).toEqual(buildPreparationMessages({
      brief: state.brief.text,
      catalogLanguages: ["en", "sv"],
      language: "en",
      currentProposition: state.currentProposition,
      conversation,
    }));
    expect(ai.calls[0].tools).toEqual(PREPARATION_TOOLS.map((tool) => tool.descriptor()));
    expect(ai.calls[0].system).not.toContain(state.brief.text);
    expect(ai.calls[0].system).not.toContain("<<<brief");
  });

  it("P5 records successful search results for contextual output validation", async () => {
    const ai = createScriptedAiClient([searchStep("consulting training workshop"), finalStep(agentPropositionOutput())]);
    const result = await runPreparationAgent({
      mode: "prepare",
      brief: "brief",
      conversation: emptyConversation(),
      catalog: FIXTURE_CATALOG,
      companyId: 1,
      language: "en",
      allowClarification: true,
    }, { ai, now: () => 0, logger: createLogger({ sink: vi.fn() }), newRunId: () => "run-1" });
    expect(result.retrieval.candidates.has("1")).toBe(true);
    expect(result.run.status).toBe("output");
  });

  it("keeps language derivation and proposition generation inside one wall budget", async () => {
    const ai = createScriptedAiClient([languageStep("en"), finalStep(agentPropositionOutput())]);
    let now = -100;

    await runPreparationAgent({
      mode: "prepare",
      brief: "brief",
      conversation: emptyConversation(),
      catalog: FIXTURE_CATALOG,
      companyId: 1,
      language: null,
      allowClarification: false,
      budgets: { wallTimeMs: 1000, maxToolCalls: 5, maxTokens: 1000 },
    }, {
      ai,
      now: () => { now += 100; return now; },
      logger: createLogger({ sink: vi.fn() }),
      newRunId: () => "run-1",
    });

    expect(ai.stepOptions.map((options) => options.timeoutMs)).toEqual([800, 300]);
  });
});
