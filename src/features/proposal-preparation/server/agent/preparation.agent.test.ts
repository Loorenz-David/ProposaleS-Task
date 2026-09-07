import { describe, expect, it, vi } from "vitest";

import { createScriptedAiClient } from "@/lib/ai";
import { createLogger } from "@/lib/logger";

import { FIXTURE_CATALOG } from "../../fixtures/catalog";
import { agentPropositionOutput, finalStep, languageStep, modelBlock, modelPropositionOutput, searchStep } from "../../fixtures/scripts";
import { validState } from "../../fixtures/states";
import { propositionWithAlternatives } from "../../fixtures/propositions";
import { parseProposalWorkflowState } from "../../schemas/workflow-state";
import { emptyConversation } from "../domain/conversation";
import { PREPARATION_TOOLS } from "../tools";
import { toModelPropositionView } from "../domain/model-view";
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
    const ai = createScriptedAiClient([finalStep(modelPropositionOutput({ blocks: [modelBlock({ alternatives: [] })] }))]);
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

    // The proposition under revision is shown in the vocabulary the model answers in, not as the
    // stored object: the model never has to read past wrappers and refs it must not reproduce.
    expect(ai.calls[0].messages).toEqual(buildPreparationMessages({
      brief: state.brief.text,
      catalogLanguages: ["en", "sv"],
      language: "en",
      currentProposition: toModelPropositionView(state.currentProposition!),
      conversation,
    }));
    const rendered = ai.calls[0].messages.find((message) => "content" in message && message.content.includes("current_proposition"));
    const renderedContent = rendered && "content" in rendered ? rendered.content : "";
    expect(renderedContent).not.toContain("preparedAt");
    expect(renderedContent).not.toContain("\"known\"");
    expect(ai.calls[0].tools).toEqual(PREPARATION_TOOLS.map((tool) => tool.descriptor()));
    expect(ai.calls[0].system).not.toContain(state.brief.text);
    expect(ai.calls[0].system).not.toContain("<<<brief");
  });

  it("P5 records successful search results for contextual output validation", async () => {
    const ai = createScriptedAiClient([searchStep("consulting training workshop"), finalStep(modelPropositionOutput())]);
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

  it("P13 answers in the compact contract by default, and still in the rich one on request", async () => {
    // The migration seam. Both contracts produce the same `AgentOutput`, so the change can be
    // reverted here without reverting anything around it; what differs is what the model is asked
    // to serialize, which is the whole point of the change.
    const base = {
      mode: "prepare" as const,
      brief: "brief",
      conversation: emptyConversation(),
      catalog: FIXTURE_CATALOG,
      companyId: 1,
      language: "en",
      allowClarification: false,
    };
    const deps = (ai: ReturnType<typeof createScriptedAiClient>) => ({ ai, now: () => 0, logger: createLogger({ sink: vi.fn() }), newRunId: () => "run-1" });

    const compactAi = createScriptedAiClient([searchStep("consulting training workshop"), finalStep(modelPropositionOutput())]);
    const compact = await runPreparationAgent(base, deps(compactAi));
    expect(compact.run.status).toBe("output");

    const richAi = createScriptedAiClient([searchStep("consulting training workshop"), finalStep(agentPropositionOutput())]);
    const rich = await runPreparationAgent({ ...base, outputContract: "rich" }, deps(richAi));
    expect(rich.run.status).toBe("output");

    // Same domain output from both, and the schema the model was sent is far smaller under the
    // contract now in use.
    expect(compact.run.status === "output" && rich.run.status === "output"
      && (compact.run.output as { kind: string }).kind).toBe("proposition");
    const size = (client: typeof compactAi) => JSON.stringify(client.calls.at(-1)!.outputJsonSchema).length;
    expect(size(compactAi)).toBeLessThan(size(richAi) / 4);
  });

  it("keeps language derivation and proposition generation inside one wall budget", async () => {
    const ai = createScriptedAiClient([languageStep("en"), finalStep(modelPropositionOutput({ blocks: [] }))]);
    // A clock that advances per model call, not per reading of it: what this asserts is that time
    // spent deriving the language comes out of the budget the main run is given, and that claim
    // should not depend on how many times the loop happens to read the clock.
    const elapsedPerCall = 100;

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
      now: () => ai.calls.length * elapsedPerCall,
      logger: createLogger({ sink: vi.fn() }),
      newRunId: () => "run-1",
    });

    // The derivation gets the whole budget; the main run gets what the derivation left of it.
    expect(ai.stepOptions.map((options) => options.timeoutMs)).toEqual([1000, 1000 - elapsedPerCall]);
  });
});
