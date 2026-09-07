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

/**
 * A conforming model proposition, in the compact evidence-citing contract.
 *
 * It deliberately cites no brief: evidence is resolved against the brief the turn actually carries,
 * so a default fixture that quoted one would only work for tests using that exact text, and would
 * silently assert something about a brief it cannot see. Presentational wording is the model's own
 * and every consequential value is absent, which is valid for any brief. Tests that exercise
 * brief-sourced or answer-sourced values state that evidence themselves — see `briefRecipient`.
 */
export function modelPropositionOutput(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    kind: "proposition",
    language: { value: "en", evidence: { kind: "inferred" as const } },
    title: { value: "Consulting and training proposal", evidence: { kind: "inferred" as const } },
    descriptionNarrative: { value: "A short narrative for review.", evidence: { kind: "inferred" as const } },
    agentRationale: { value: "Selected the closest catalog match.", evidence: { kind: "inferred" as const } },
    recipient: null,
    blocks: [modelBlock()],
    commercialNotes: [],
    commercialAssumptions: [],
    assumptions: [],
    warnings: [],
    requestedOverrides: [],
    ...overrides,
  };
}

/** A recipient sourced from `BRIEFS.englishSimple`; every quote below appears in that text. */
export function briefRecipient(): Record<string, unknown> {
  return {
    firstName: { value: "Anna", evidence: { kind: "brief" as const, quote: "Anna Berg" } },
    lastName: { value: "Berg", evidence: { kind: "brief" as const, quote: "Anna Berg" } },
    email: { value: "anna.berg@northwind.example", evidence: { kind: "brief" as const, quote: "anna.berg@northwind.example" } },
    phone: null,
    companyName: { value: "Northwind AB", evidence: { kind: "brief" as const, quote: "Northwind AB" } },
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

export const STRONG_QUERY = "consulting training workshop";

/**
 * Whether the turn being scripted still has to derive its language. A first turn does; a turn that
 * carries a language — from the state's `derivedLanguage` or from the proposition under revision —
 * makes no derivation call at all, so scripting one would put a step the run never asks for at the
 * front of the script.
 */
export type LanguageDerivation = { deriveLanguage?: boolean };

function leadingSteps({ deriveLanguage = true }: LanguageDerivation): GenerateStepResult[] {
  return deriveLanguage ? [languageStep("en")] : [];
}

/**
 * A block in the compact contract, built on a `FIXTURE_CATALOG` identity. Everything a script does
 * not state here — the source, the ref, the catalog title, the pricing — is the application's to
 * supply, which is the point: a script cannot accidentally assert that the model authored it.
 */
export function modelBlock(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    variationId: "1",
    selectedBy: { kind: "catalog" as const },
    quantity: null,
    optional: null,
    reviewerComment: null,
    alternatives: [{ variationId: "2", reason: { value: "A close alternative.", evidence: { kind: "inferred" as const } } }],
    ...overrides,
  };
}

export function clarifyRecipient(options: LanguageDerivation = {}): GenerateStepResult[] {
  return [...leadingSteps(options), finalStep(agentClarificationOutput())];
}

export function proposeStrong(options: LanguageDerivation = {}): GenerateStepResult[] {
  return [...leadingSteps(options), searchStep(STRONG_QUERY), finalStep(modelPropositionOutput())];
}

export function proposeWithoutRecipient(options: LanguageDerivation = {}): GenerateStepResult[] {
  return [
    ...leadingSteps(options),
    searchStep(STRONG_QUERY),
    finalStep(modelPropositionOutput({ recipient: null })),
  ];
}

/**
 * The model attributing an email to a clarification answer. It cites the alias, not the question's
 * id: under this contract the id is the application's to resolve, and a script that stated one
 * would be asserting the model can know it.
 */
export function proposeWithHumanEmail(alias = "Q1", options: LanguageDerivation = {}): GenerateStepResult[] {
  const recipient = {
    firstName: null,
    lastName: null,
    email: { value: "anna@example.se", evidence: { kind: "answer" as const, ref: alias } },
    phone: null,
    companyName: null,
  };
  return [...leadingSteps(options), searchStep(STRONG_QUERY), finalStep(modelPropositionOutput({ recipient }))];
}

export function proposeWithSekNote(options: LanguageDerivation = {}): GenerateStepResult[] {
  return [
    ...leadingSteps(options),
    searchStep(STRONG_QUERY),
    finalStep(modelPropositionOutput({
      commercialNotes: [{
        text: { value: "The brief states around 120 000 SEK.", evidence: { kind: "brief", quote: "around 120 000 SEK" } },
        amount: null,
        currency: { value: "SEK", evidence: { kind: "brief", quote: "120 000 SEK" } },
        taxBasis: { value: "including_tax", evidence: { kind: "brief", quote: "including tax" } },
      }],
    })),
  ];
}

export function selectSecondAlternative(): GenerateStepResult[] {
  return [finalStep(modelPropositionOutput({
    blocks: [modelBlock({ variationId: "3", alternatives: [] })],
  }))];
}

export function selectPrevious(): GenerateStepResult[] {
  return [
    getContentStep("1", "call-get-previous"),
    finalStep(modelPropositionOutput({ blocks: [modelBlock({ alternatives: [] })] })),
  ];
}
