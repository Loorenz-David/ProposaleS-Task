import type { GenerateStepResult, Usage } from "@/lib/ai/types";

/**
 * Scripted model steps are data (§9.1 rule 5): a script states what the model returned, never what
 * the application should conclude. Each builder mirrors one arm of `GenerateStepResult`, using the
 * same shapes `src/lib/agent/run.test.ts` drives the real loop with.
 */
export function usage(inputTokens = 10, outputTokens = 5, totalTokens = 15): Usage {
  return { inputTokens, outputTokens, totalTokens };
}

/** A final structured output. The run loop parses it against the run's output schema. */
export function finalStep(output: unknown, stepUsage: Usage = usage()): GenerateStepResult {
  return { kind: "final", output, usage: stepUsage };
}

/** One step in which the model calls tools. Ids are stable so assertions can name them. */
export function toolCallStep(
  calls: ReadonlyArray<{ toolCallId: string; name: string; input: unknown }>,
  stepUsage: Usage = usage(),
): GenerateStepResult {
  return { kind: "tool_calls", calls: [...calls], usage: stepUsage };
}

/** The derivation step that precedes the main run whenever the proposal language is unknown. */
export function languageStep(language: string | null): GenerateStepResult {
  return finalStep({ language });
}

/** A `search_content` call the model makes before proposing. */
export function searchStep(query: string, toolCallId = "call-search-1"): GenerateStepResult {
  return toolCallStep([{ toolCallId, name: "search_content", input: { query } }]);
}

/** A `get_content` call, which is how an identity not on the proposition enters the record. */
export function getContentStep(variationId: string, toolCallId = "call-get-1"): GenerateStepResult {
  return toolCallStep([{ toolCallId, name: "get_content", input: { variationId } }]);
}

/**
 * A conforming `proposition` output, built on `FIXTURE_CATALOG` identities so a run that retrieved
 * them accepts it. Every consequential leaf carries an admissible source; the application supplies
 * the catalog-verbatim title, the alternative's ranking, `pricing`, and the version.
 */
export function agentPropositionOutput(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    kind: "proposition",
    language: { known: true, value: "en", source: "brief" },
    title: { known: true, value: "Consulting and training proposal", source: "inferred" },
    descriptionNarrative: { known: true, value: "A short narrative for review.", source: "inferred" },
    recipient: {
      known: true,
      value: {
        firstName: { known: true, value: "Anna", source: "brief" },
        lastName: { known: true, value: "Berg", source: "brief" },
        email: { known: true, value: "anna.berg@northwind.example", source: "brief" },
        phone: { known: false },
        companyName: { known: true, value: "Northwind AB", source: "brief" },
      },
    },
    blocks: [{
      contentId: { value: "1", source: "proposales_content", ref: { variationId: "1" } },
      quantity: { known: false },
      optional: { known: false },
      reviewerComment: { known: false },
      alternatives: [{ variationId: "2", reason: { value: "A close alternative.", source: "inferred" } }],
    }],
    commercialNotes: [],
    commercialAssumptions: [],
    assumptions: [],
    warnings: [],
    agentRationale: { known: true, value: "Selected the closest catalog match.", source: "inferred" },
    requestedOverrides: [],
    ...overrides,
  };
}

/** A conforming `clarification` output naming one item. */
export function agentClarificationOutput(itemKey = "recipient_identity", text = "Who should receive this proposal?"): Record<string, unknown> {
  return { kind: "clarification", questions: [{ itemKey, text }] };
}

/** A model that never finishes: every step asks for another search, so the budget decides. */
export function keepCallingTools(count: number, query = "consulting"): GenerateStepResult[] {
  return Array.from({ length: count }, (_, index) => searchStep(query, `call-loop-${index + 1}`));
}
