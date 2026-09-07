# Agent payload and latency investigation

Research status: complete on commit `bbdc632beaa8e396f5e49654994b7bedd1960ef9` (`fix: stabilize live proposition generation`). This investigation changed no production code, prompt, model setting, timeout, budget, or test. Its only persistent files are in this directory. The live measurements used OpenAI `gpt-5.6-luna`, `FIXTURE_CATALOG`, and the fake Proposales client; all runs recorded zero Proposales writes and retained no model output.

## 1. Executive summary

Proposal Copilot sends about 48 KB because its main model output is not a compact control/result DTO. It is almost the complete semantic portion of the rich proposition domain object, including repeated `known`, `source`, and provenance `ref` unions at every sourced leaf. Zod's current JSON Schema conversion inlines reusable acyclic schemas. The resulting `allowClarification: true` schema contains 169 object-schema occurrences, 653 property declarations, 41 `oneOf` nodes, and 68 occurrences each of `source`, `ref`, and every optional provenance-ref field. The proposition branch is 47,899 of the 48,800 raw characters (98.15%). Clarification itself is only 568 characters.

The current run loop resends that complete schema on every main-model call, including calls that return only `search_content` or `get_content` tool calls. It also resends the system prompt, both tool descriptors, the initial messages, and the growing tool-call/result history. The representative clarification-answer turn made three main calls. Their provider-reported input rose from 7,387 to 7,877 to 8,077 tokens as history grew; each carried the same 48,231-character raw schema. The final proposition call took 9.8 seconds and emitted 847 output tokens. The whole second turn took 17.2 seconds. A second successful sample took about 34.9 seconds because it used an additional tool round trip and one output-correction retry.

The measured evidence supports four distinct conclusions:

1. Schema generation and domain validation inside the application are not material latency sources: schema generation averaged about 1.4 ms and a successful Zod parse about 0.01 ms locally.
2. Repeated schema transport is the dominant measured input-token component. In a controlled short clarification request, the current schema produced 6,464 input tokens; a clarification-only 625-character schema produced 129. This approximately 6.3k-token delta agrees with the 7–8k inputs seen in the real workflow.
3. Input size is not proven to be the sole or even dominant wall-latency source. Output length, model reasoning, number of inference round trips, correction retries, and provider variance all matter. The single-sample small-schema call was not faster, so no latency claim should be derived from that experiment.
4. Phase-specific schemas and a distinct model DTO are technically plausible within the repository's architecture, but neither is a configuration-only change. Phase splitting requires a real orchestration boundary because the current main call may either call tools or terminate. A model DTO requires a deterministic, testable evidence-resolution adapter; provenance cannot safely be reconstructed from a naked value alone.

The domain contract should not be made poorer to suit the provider. The architectural question is how much of that contract the model must physically serialize.

## 2. Current architecture

### End-to-end path

The relevant flow is:

```text
prepareFromBrief / answerClarification / reviseProposition
  -> load catalog and company state
  -> runPreparationAgent
       -> when language is unknown: run(language derivation)
            tools: none
            output: { language: string | null } (222 chars)
       -> run(main preparation agent)
            tools: search_content, get_content
            output: AgentOutput for this mode/clarification flag (~48 KB)
              -> zero or more tool-call steps
              -> final clarification or proposition
              -> up to two output-correction attempts when invalid
  -> validateAgentOutput
       -> Zod shape validation
       -> retrieved-content and human-provenance checks
  -> assembleProposition
       -> deterministic domain enrichment
  -> PreparedProposal for review
  -> only a later explicit approval may cross the mutation boundary
```

The language derivation is already phase-specific. It runs through the same generic [`run()`](../../../../src/lib/agent/run.ts) mechanism but has no tools and receives only [`languageDerivationOutputSchema`](../../../../src/features/proposal-preparation/schemas/agent-output.ts). When a first turn returns clarification, the derived language is not a `currentProposition` value, so `answerClarification` derives language again. Both live workflow samples did so.

The main loop is not divided into “tool selection” and “final generation.” [`runPreparationAgent`](../../../../src/features/proposal-preparation/server/agent/preparation.agent.ts) invokes one `run()` with two tools and one output schema. On each loop iteration, `run()`:

1. checks wall/tool/token budgets;
2. serializes the same Zod output schema with `z.toJSONSchema(..., { io: "input" })`;
3. sends the full system prompt, all accumulated messages, both tool descriptors, and the output schema to `AiClient.generateStep`;
4. either executes returned tool calls and appends calls/results to `messages`, accepts a valid final output, or appends correction feedback and tries again.

The client path is [`createAiClient`](../../../../src/lib/ai/client.ts). For OpenAI it adapts the schema through [`openai-schema.ts`](../../../../src/lib/ai/openai-schema.ts), wraps it in AI SDK `Output.object`, and sets `providerOptions.openai.strictJsonSchema: false`. The installed `@ai-sdk/openai` Responses provider puts the response schema in `text.format` on that provider request and includes tools separately. The application supplies neither `previousResponseId` nor an OpenAI conversation identifier. Therefore each application `generateStep` is a fresh provider call containing the complete accumulated input assembled for that step.

The rich domain object is not entirely model-authored even today. [`assembleProposition`](../../../../src/features/proposal-preparation/server/domain/assemble-proposition.ts) already supplies or resolves `generationId`, `version`, `preparedAt`, block `productId`, catalog-verbatim block title/description, `pricing: "library"`, alternative product/title/strength/score, unresolved items, application-owned warnings, and `emptyDraftConfirmation`. This is important precedent: “model output” and “domain proposition” are already distinct contracts, just not as distinct as they could theoretically be.

### Architectural invariants that constrain any later plan

The applicable architecture contracts are [`02-runtime-and-boundaries`](../../../../architectural_contracts/02-runtime-and-boundaries.md), [`04-server-and-domain`](../../../../architectural_contracts/04-server-and-domain.md), [`06-data-and-contracts`](../../../../architectural_contracts/06-data-and-contracts.md), [`07-integrations`](../../../../architectural_contracts/07-integrations.md), [`08-agent-and-tooling`](../../../../architectural_contracts/08-agent-and-tooling.md), [`10-security`](../../../../architectural_contracts/10-security.md), and [`11-testing`](../../../../architectural_contracts/11-testing-and-quality-gates.md), plus the feature contract in [`proposal-preparation/README.md`](../../../../src/features/proposal-preparation/README.md).

Their load-bearing constraints for this research are:

- Model output remains untrusted until runtime schema validation and domain/evidence checks pass.
- `PreparedProposal != ApprovedProposal`; approval remains the mutation boundary and makes no model call.
- Approved structured state remains authoritative. `ConversationContext` is linguistic continuity only.
- Consequential commercial facts cannot be silently inferred. Unknown, human, brief, catalog, and inferred origins must remain distinguishable.
- Catalog pricing stays catalog-owned; the AI may not author or write prices.
- Provider-specific representation belongs at the provider boundary. It should not degrade the internal domain contract.
- Tools remain read-only during preparation and return validated, bounded results.

## 3. Post-fix baseline

### Schema sizes

All character counts are compact `JSON.stringify` counts. These schemas contain ASCII only in the measured form, so UTF-8 byte and JavaScript character counts are equal.

| Schema | Raw chars/bytes | OpenAI-adapted chars/bytes | Branches | Notes |
|---|---:|---:|---:|---|
| Language derivation | 222 | 222 | one object | No tools; already phase-specific |
| Prepare, `allowClarification: true` | 48,800 | 48,859 | proposition + clarification | OpenAI adapter removes one `propertyNames` and adds root wrapper |
| Prepare, `allowClarification: false` | 48,231 | 48,290 | proposition only | Still serialized as a one-member top-level `oneOf` by Zod |
| Difference | 569 | 569 | one branch | Clarification branch is 568 chars; one separator accounts for the remaining char |

The model-exact schema-only token count is not exposed separately by the provider. A controlled same-task comparison gives a useful approximation: a short request with the 48,800-character schema reported 6,464 input tokens, while the same request with a 625-character clarification-only schema reported 129. The approximately 6,335-token delta is attributable primarily to the model-facing schema/envelope difference. It is an approximation, not a tokenizer-derived exact count.

### Representative complete workflow

Fixture: `BRIEFS.vagueScope` plus `FIXTURE_CATALOG`. The first turn returned two clarification questions. The answer turn supplied explicit fixture-only answers. Real OpenAI was used; Proposales was fake; writes were zero.

| Turn | Result | Model steps | Tool calls | Input tokens | Output tokens | Turn latency |
|---|---|---:|---:|---:|---:|---:|
| First, clarification allowed | clarification | 2 | 0 | 7,425 | 131 | 5.300 s |
| Second, clarification disabled | proposition | 4 | 5 | 23,691 | 1,120 | 17.216 s |
| Complete workflow | success | 6 | 5 | 31,116 | 1,251 | 22.516 s |

Per-model-step detail:

| Step | Purpose/outcome | Schema chars | Input | Output | Latency |
|---|---|---:|---:|---:|---:|
| 1 | first-turn language derivation, final | 222 | 152 | 43 | 1.872 s |
| 2 | first-turn main call, clarification | 48,800 | 7,273 | 88 | 3.416 s |
| 3 | answer-turn language derivation, final | 222 | 350 | 40 | 1.483 s |
| 4 | main call, two `search_content` calls | 48,231 | 7,387 | 73 | 2.341 s |
| 5 | main call, three `get_content` calls | 48,231 | 7,877 | 160 | 3.550 s |
| 6 | main call, proposition | 48,231 | 8,077 | 847 | 9.800 s |

“Proposition generation latency” in this table means the final model call that emitted the proposition: 9.8 seconds. “Clarification generation latency” means the main call that emitted clarification: 3.416 seconds. The complete service turn includes language derivation, model/tool round trips, deterministic work, and overhead.

A second successful workflow sample provided variance/retry evidence: approximately 9.16 seconds to clarification, 34.86 seconds from answers to proposition, and 44.0 seconds total. Its answer turn made five catalog tool calls and needed one output-correction retry. The two final calls took approximately 12.94 and 7.40 seconds. Because its per-step input/output split was not retained, it is not used as the primary token baseline.

These new measurements do not invalidate the reliability handoff's wider observed 24.4–41.5-second proposition range. They add one faster successful sample and one comparable 34.9-second sample, and demonstrate substantial run-to-run and path variance.

## 4. Anatomy of the ~48 KB schema

### Actual dependency map

```text
agentOutputSchemaFor({ mode, allowClarification })
├─ proposition branch: agentPropositionSchema
│  ├─ language/title/descriptionNarrative/agentRationale
│  │  └─ sourcedOrAbsent(presentationalSchema(value))
│  │     ├─ known=true × sources: brief/content/human/inferred
│  │     │  └─ value + source literal + optional/required refSchema
│  │     └─ known=false
│  ├─ recipient
│  │  └─ knownOrAbsent(recipientLeavesSchema)
│  │     └─ firstName/lastName/email/phone/companyName
│  │        └─ sourcedOrAbsent(consequentialSchema(value, brief|human))
│  ├─ blocks[]: agentBlockSchema
│  │  ├─ contentId: consequentialSchema(id, content|human)
│  │  ├─ quantity/optional: sourcedOrAbsent(consequentialSchema(...))
│  │  ├─ reviewerComment: sourcedOrAbsent(presentationalSchema(text))
│  │  └─ alternatives[]: variationId + presentational reason
│  ├─ commercialNotes[]
│  │  ├─ text: presentational
│  │  ├─ amount/currency: sourcedOrAbsent consequential
│  │  └─ taxBasis: consequential
│  ├─ commercialAssumptions[]
│  │  └─ kind union (deadline/term/scope_commitment/other) + sourced value
│  ├─ assumptions[]: path + presentational note
│  ├─ warnings[]: narrowed agent-owned warningSchema
│  │  ├─ kind + presentational text
│  │  ├─ optional path/reason
│  │  └─ optional before/after: recursive bareWarningValue
│  │     └─ string/number/boolean/null/array/record ($defs + propertyNames)
│  └─ requestedOverrides[]: path + reason (max 0 in prepare mode)
└─ clarification branch, only when allowed
   └─ kind + questions[] { itemKey, text }
```

[`shared.ts`](../../../../src/features/proposal-preparation/schemas/shared.ts) is the main expansion point. `sourcedSchema` creates one strict object branch for every allowed source. A presentational value has four branches. Each branch includes the value schema, a literal source, and a full `refSchema`; `proposales_content` makes `variationId` required while other sources make the whole ref optional. `sourcedOrAbsent` then extends every source branch again with `known: true` and adds `{ known: false }`. This accurately expresses the domain invariants, but it is expensive when inlined at every leaf.

Zod's default `z.toJSONSchema` reuse behavior is `inline` for acyclic reused schemas. Only the recursive warning value must become a definition. Consequently the current clarification-enabled schema has only one `$defs` entry and four `$ref` occurrences, despite extensive reuse in the TypeScript/Zod graph.

Quantitative shape counts for `allowClarification: true`:

| Generated feature | Occurrences |
|---|---:|
| Object schema nodes | 169 |
| Declared properties | 653 |
| Entries repeated in `required` arrays | 263 |
| `oneOf` nodes | 41 |
| `anyOf` nodes | 1 |
| `known` property declarations | 54 |
| `value` property declarations | 69 |
| `source` declarations | 68 |
| `ref` declarations | 68 |
| Each ref field (`questionId`, `editTurn`, `turnId`, `quote`) | 68 |
| `variationId` declarations | 69 |
| `$defs` / `$ref` | 1 / 4 |

Top-level proposition-property subtrees provide a useful, though non-additive, attribution:

| Proposition subtree | Serialized chars | Share of 47,899-char branch |
|---|---:|---:|
| `blocks` | 9,526 | 19.9% |
| `recipient` | 7,721 | 16.1% |
| `commercialNotes` | 6,990 | 14.6% |
| `commercialAssumptions` | 6,590 | 13.8% |
| `warnings` | 2,890 | 6.0% |
| `descriptionNarrative` | 2,728 | 5.7% |
| `agentRationale` | 2,728 | 5.7% |
| `title` | 2,724 | 5.7% |
| `language` | 2,696 | 5.6% |
| `assumptions` | 2,581 | 5.4% |
| `requestedOverrides` | 250 | 0.5% |
| `kind` | 39 | 0.1% |

The subtrees sum to 47,463 characters. The remaining 436 characters are proposition object/container metadata such as property keys, the root `properties`/`required`/`additionalProperties` structures, delimiters, and array/object wrappers. Attribution is inherently non-additive if a future conversion moves shared structures into `$defs`; the table describes the current inline representation.

Notably, `warnings`' recursive record is the source of the lone definition and `propertyNames`, but it is not the main size cause. `requestedOverrides` and clarification are also small. The strongest source is repeated inline known/source/ref structure across blocks, recipient, notes, assumptions, and presentational fields.

### Controlled `$ref` representation measurement

Without changing production, the analysis script invoked the supported Zod conversion option `reused: "ref"`:

| Representation | Clarification allowed | Clarification disabled | Definitions | Refs |
|---|---:|---:|---:|---:|
| Current inline | 48,800 | 48,231 | 1 | 4 |
| Experimental reused refs | 28,638 | 28,026 | 56 | 206 |

This is a 41.3% serialized-character reduction in the clarification-enabled schema. It is not equivalent to a 41.3% provider-token reduction: the one-pair live experiment reported 6,464 input tokens for inline and 5,859 for the ref-heavy form, only 605 tokens (9.4%) fewer. The reason for this token/character mismatch was not established; repeated `$ref` paths and provider serialization/accounting are plausible contributors. The experiment proves size behavior, not production suitability or latency benefit.

## 5. `allowClarification: true` vs `false`

[`agentOutputSchemaFor`](../../../../src/features/proposal-preparation/schemas/agent-output.ts) first constructs the mode-specific proposition. In prepare mode, `requestedOverrides` is constrained to a maximum length of zero. It then returns:

- clarification allowed: `z.discriminatedUnion("kind", [proposition, clarification])`;
- clarification disabled: `z.discriminatedUnion("kind", [proposition])`.

Thus `allowClarification: false` really does make clarification invalid. The resulting raw JSON Schema has one top-level `oneOf` member and contains no indirect clarification definition. Nothing clarification-specific is accidentally retained. The size barely changes because:

- proposition branch: 47,899 characters in both modes;
- clarification branch: 568 characters only in the allowed mode;
- shared recursive warning `$defs`: 254 characters in both modes;
- document/union overhead: approximately 79 versus 78 characters.

The exact reduction is 569 characters. Disabling clarification cannot materially reduce payload while the proposition itself is approximately 48 KB.

One nuance matters for future phase splitting: extracting a clarification-only object from the current branch produced a 625-character standalone schema (branch plus document wrapper), versus 48,800 for the present union. Merely switching from “proposition or clarification” to “proposition only” saves almost nothing; knowing that a call can only clarify saves nearly all of it.

## 6. Per-inference requirements

The current main loop is capability-based, not phase-based. A call that happens to select a tool is also permitted to terminate with a final output. “Actually required” below distinguishes semantic needs from what the existing orchestration must support.

| Inference situation | Purpose | Tools | Current output schema | Semantically needed | Final proposition possible now? | Clarification possible now? |
|---|---|---|---|---|---|---|
| Language derivation | Select a catalog language or report ambiguity | none | 222-char language object | language/null only | no | no; service may later ask |
| First main call, clarification allowed | Decide whether to clarify, retrieve, or propose | search/get | 48,800-char proposition-or-clarification union | clarification DTO if asking; tool arguments if retrieving; proposition contract if terminating | yes | yes |
| Main call, clarification disabled | Retrieve or propose after answers | search/get | 48,231-char proposition-only union | tool arguments if retrieving; proposition contract if terminating | yes | schema makes clarification impossible |
| Main call after search result | Inspect candidates, retrieve detail, or propose | search/get | same 48,231/48,800 chars | tool arguments if retrieving; final contract if terminating | yes | according to turn flag |
| Main call after detail result | Retrieve more or propose | search/get | same full schema | usually final semantic proposition, but more tools remain legal | yes | according to turn flag |
| Output-correction call | Correct invalid complete output | search/get still present | same full schema | complete corrected final output plus compact validation feedback | yes | only if turn allows; tools also remain technically legal |

Under the current `run()` interface, intermediate calls genuinely need the full schema in the limited sense that the model is allowed to finish on any of them. They do not need to *emit* that structure when they return tool calls. Removing the schema from tool calls therefore requires changing the orchestration contract: the application must know before calling whether a final answer is legal, or use a smaller explicit control result whose transitions lead to a separate final-generation call.

The AI abstraction already permits `outputJsonSchema` to be absent, and the client omits `Output.object` in that case. This makes phase-specific calls technically possible. It does not answer how to guarantee forward progress, carry retrieval context, handle a model that returns prose rather than a tool call, retain read/tool budgets, or avoid adding extra round trips.

## 7. Repeated request/context overhead

The measured compact component sizes are not exact HTTP wire bytes. They are stable application-level size estimates before AI SDK conversion. Provider input tokens are exact values reported for each call.

| Representative call | System chars | Schema chars | Tool chars | Message/history chars | Sum of measured components | Provider input tokens |
|---|---:|---:|---:|---:|---:|---:|
| First-turn language | 363 | 222 | 2 | 235 | 822 | 152 |
| First-turn clarification | 3,334 | 48,800 | 792 | 258 | 53,184 | 7,273 |
| Answer-turn language | 363 | 222 | 2 | 834 | 1,421 | 350 |
| Answer-turn first main/tool call | 3,335 | 48,231 | 792 | 857 | 53,215 | 7,387 |
| After two search results | 3,335 | 48,231 | 792 | 3,263 | 55,621 | 7,877 |
| After three detail results/final | 3,335 | 48,231 | 792 | 4,354 | 56,712 | 8,077 |

The schema is 85–91% of these measured character sums for main calls. History growth of 2,406 characters after search increased reported input by 490 tokens; another 1,091 characters after details increased it by 200 tokens. The full schema did not shrink and was present while the model was choosing tools and after each result.

The run loop appends:

- assistant tool-call messages containing call IDs, names, and arguments;
- tool messages containing complete validated tool results;
- on correction, a user validation message and, when serializable under the cap, as much as 20,000 characters of the previous invalid candidate.

The system prompt and tool definitions are also repeated. The application does not use `previous_response_id` or a provider conversation, so it cannot assume server-side conversational continuation. OpenAI may apply automatic prompt caching, but the current `Usage` type does not retain cached-token detail and this investigation did not establish cache hits, cache billing, or cache latency effects.

In the primary answer turn, three repetitions of the main schema alone represent 144,693 raw schema characters supplied across calls. In the slower successful sample, five main calls (three tool-selection steps, an invalid final, and its correction) imply roughly 241,155 raw schema characters across the turn, before system text, tools, history, or correction candidate.

## 8. Model responsibility vs deterministic responsibility

This classification is about responsibility, not a proposed wire format. A deterministic adapter may fill only facts whose derivation is mechanically checkable; it must never infer a consequential fact from a value that merely looks plausible.

| Field/responsibility | Classification | Evidence and boundary |
|---|---|---|
| Language identification | A: semantic judgment, then deterministic resolution | Model derives language; application resolves it against catalog languages. |
| Proposal title, narrative, rationale | A | Presentational wording may be inferred; the model chooses it. Wrappers can be mechanical once evidence/source is explicit. |
| Recipient leaf values | A | Extracting/mapping name, company, email, phone from brief/answers is semantic. `known` and concrete human ref can be constructed only if the model returns an unambiguous evidence selector. |
| Content search queries | A | Semantic retrieval intent. |
| Selected content/alternative IDs | A for selection; C for enrichment | The model chooses among retrieved IDs. Application already supplies product ID, title, description, price policy, strength, and score from retrieval/catalog. |
| `contentId.ref.variationId` | C once selection is explicit | It must equal a retrieved identity. The application can copy/verify it; current model physically repeats it. |
| Quantities and optional flags | A for value/absence and evidence choice | These are consequential. The model must not guess. `known`/`source`/question ID can be mechanical only from an explicit verified evidence reference. |
| Reviewer comments and block alternative reasons | A | Presentational semantic content. Empty arrays/default absence can be D. |
| Commercial note text, amount, currency, tax basis | A | Recognizing and interpreting a stated expectation is semantic and commercially consequential. The existing contract explicitly avoids naïve number parsing. Provenance construction can be deterministic from a stable evidence selector. |
| Commercial assumptions | A | Classifying deadline, term, scope commitment, or other and extracting stated text requires semantic judgment. |
| Agent-owned warning kinds/text | A/E | Conflicting statements, uncovered scope, weak/no acceptable semantic match need model/retrieval judgment. Their structural defaults are mechanical. |
| Application-owned warnings | D/C | Currency mismatch, human-value preservation/override, non-strong selection, and no-acceptable-match consequences are already assembled from structured facts/retrieval. |
| `requestedOverrides` | A in revise; D in prepare | Intentional replacement path and reason require model judgment during revision. Prepare mode deterministically requires `[]`. |
| `generationId`, version, `preparedAt` | D | Already application-supplied. |
| Block product/title/description/pricing | C | Already catalog-supplied; `pricing` is always `library`. |
| Alternative product/title/strength/score | C | Already retrieval-supplied. |
| `unresolvedItems` | D | Already derived from authoritative workflow information items. |
| `emptyDraftConfirmation` default | D | Already assembled as unknown unless an authorized human path provides it. |
| Presence of always-present arrays | D | `warnings`, `requestedOverrides`, alternatives, assumptions, and note collections can default to `[]` when semantic output says none. |
| `known: true/false` wrapper | D only after A establishes presence/absence | The syntax is bookkeeping; the decision that a consequential value is known is not. |
| Provenance `source` and `ref` | Mixed A + C/D | Evidence selection/source attribution is semantic; resolving a selected question/content/turn alias to its real UUID/ref is deterministic. A naked value is insufficient. |

The most credible model/domain split is therefore not “model returns values; code guesses provenance.” It is “model returns values plus explicit evidence selectors; code resolves those selectors against authoritative input/retrieval state and builds the repetitive domain wrapper.” Examples of stable evidence already exist: question IDs, current-instruction turn ID plus a verified quote, and retrieved variation IDs. Brief provenance is less resolved: the current domain permits an optional ref for a brief-sourced value, and runtime validation does not currently verify a brief quote. A smaller DTO would need an explicit decision about brief span/quote identifiers if it is to preserve or improve trust rather than silently weaken it.

Unknown/known is similarly two-layered. The model may decide that an underspecified field has no supported value; the adapter can encode that decision as `{ known: false }`. The adapter cannot turn a missing DTO field into “unknown” unless the DTO contract makes that omission unambiguous and strict validation prevents accidental drops.

## 9. Strict structured-output compatibility

The current model supports structured outputs, but OpenAI accepts only a subset of JSON Schema. Current official guidance says the root must be an object, all object properties must be required (optionality is represented with nullable unions), `additionalProperties: false` is required, and `$defs`/`$ref` are supported. See OpenAI's [Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs) and [`gpt-5.6-luna` model page](https://developers.openai.com/api/docs/models/gpt-5.6-luna).

The repository also has stronger empirical evidence from the original live integration in [`master-plan.md` §13.3a](../../../initial_core_feature_proposales/master-plan.md):

- strict mode rejected `propertyNames` emitted by `bareWarningValue`'s recursive `z.record`;
- the Responses endpoint required a root `type: "object"`;
- it rejected top-level combinators such as the `oneOf` produced by `AgentOutput`;
- strict mode would next reject the many optional properties in `refSchema` and warnings.

The current provider adapter removes `propertyNames` and wraps the root union beneath required property `result`, adding 59 net characters. Those adaptations make the schema acceptable in non-strict mode; they do not make it strict-compatible.

An offline structural scan of the OpenAI-adapted current inline schema found 126 object-schema occurrences with at least one property absent from `required`, comprising 390 optional-property occurrences. These are representation occurrences, not 390 distinct domain concepts. Most come from repeated provenance shapes:

- `ref` itself is optional for most sources;
- `variationId`, `questionId`, `editTurn`, `turnId`, and `quote` are selectively present within `refSchema`;
- warning `path`, `before`, `after`, and `reason` are optional.

Origins and necessity:

| Blocker | Zod/domain origin | Domain necessity | Model-representation necessity |
|---|---|---|---|
| Root `oneOf` | proposition-or-clarification discriminated union | Outcomes must remain exclusive | Not necessary if phases have separate object schemas or use a strict object envelope with an allowed nested union |
| Optional ref fields | one rich `refSchema` covers content/question/edit/turn/quote references | Domain needs source-specific provenance without meaningless nulls | A model DTO could use explicit required nullable selectors or source-specific evidence objects |
| Optional `ref` | some sources need no ref; content must have one | Domain shape is intentional | A DTO could always require an `evidence` field whose value is a strict union including `null`, if semantics remain unambiguous |
| `propertyNames` | recursive arbitrary bare warning `before`/`after` record | Domain warning values may be arbitrary JSON; the emitted key constraint itself is vacuous | A model DTO could omit application-owned before/after snapshots or use a bounded strict warning payload |
| Optional warning metadata | warning shape supports several producers | Useful domain flexibility | Phase/model-specific warning variants could make every field required/nullable |

A small strict-compatible model DTO is technically plausible if it has a plain object root, every key required, `additionalProperties: false`, bounded nesting, and no unsupported record/composition constructs. It could encode optional semantics as explicit null/absent variants without changing the rich domain schema. That proposition has not been tested live and strict mode must not be enabled on the current schema.

The potential gain is provider-constrained conformance before application validation, fewer malformed-output retries, and possibly a much smaller schema. The cost is a second contract and adapter whose correctness becomes security/commercially load-bearing. Existing Zod/domain validation must remain after normalization; strict provider output would supplement, not replace, repository authority checks.

## 10. Latency analysis

### Measured contributors

| Contributor | Evidence | Interpretation |
|---|---|---|
| Application schema serialization | ~1.44 ms (`true`), ~1.39 ms (`false`) over 250 local iterations | Negligible versus seconds of model latency; schema *processing by the provider* was not isolated |
| Successful Zod parse | ~0.01 ms over 2,000 local parses | Domain parsing itself is negligible in the observed path |
| Fake tool execution | 0–2 ms each in retained successful sample | Tool code is negligible; each tool phase still costs another model round trip |
| Language derivation | 1.48–2.84 s in fresh samples | Small schema/input, but repeated after clarification in current state flow |
| Tool-selection model calls | 2.34–6.05 s in observed samples | Primarily model/provider round-trip time; outputs were only 73–160 tokens in the retained run |
| Clarification main call | 3.42 s retained; 6.32 s second sample | Full schema despite only 88-ish output tokens in retained run |
| Final proposition call | 9.80 s retained; ~12.94 s invalid attempt in slower sample | More output (847 tokens retained) and more semantic work than tool/clarification calls |
| Correction retry | ~7.40 s in slower sample | Adds another full schema/context request plus correction feedback/candidate |
| History growth | main input 7,387 -> 7,877 -> 8,077 | Tool results add tokens; schema remains fixed and repeated |

### Controlled schema variants

One request per variant used the same short clarification instruction/brief and no tools. Outputs were not retained.

| Variant | Schema chars | Input tokens | Output tokens | Latency |
|---|---:|---:|---:|---:|
| Current inline proposition-or-clarification | 48,800 | 6,464 | 139 | 3.317 s |
| Experimental Zod shared definitions | 28,638 | 5,859 | 223 | 5.343 s |
| Experimental clarification-only | 625 | 129 | 324 | 5.745 s |

This is strong evidence about input-token reduction and weak evidence about latency. The outputs differed substantially, only one call was made per variant, and provider/model variance was uncontrolled. The smallest input was slowest in this sample. Therefore the investigation does **not** claim that reducing schema tokens by X will reduce latency by Y.

### Causal assessment

- **Input tokens/schema processing:** certainly drive request size and token cost; plausibly affect prefill/schema handling latency. The experiment did not isolate a wall-time effect.
- **Output tokens:** correlate with longer semantic final calls in the representative workflow, but output complexity and reasoning are confounded.
- **Model reasoning:** proposition assembly and source attribution are more complex than asking two questions; hidden reasoning-token detail is not exposed by the current `Usage` abstraction.
- **Tool round trips:** a direct source of elapsed time. Tools themselves were near-zero latency, but two tool-selection inferences added 5.89 seconds in the retained answer turn.
- **Retries:** can add a full proposition-length inference and another repeated payload. This explains much of the slower 34.9-second answer turn.
- **Conversation/tool growth:** measured and modest relative to the schema for this small fixture; it will grow with larger catalog results, conversation windows, current propositions, and correction candidates.
- **Provider variance:** material across the two new complete samples and the three controlled calls.
- **AI SDK/provider behavior:** every application step constructs a complete Responses request. Provider-side schema compilation, caching, network time, and parse time were not separately observable.
- **Application work:** local schema generation, validation, and fake tools are orders of magnitude smaller than model latency. Catalog/network tools could differ in production, but were intentionally faked here.

## 11. Candidate optimization families

These are research findings for planning, not a selected solution.

### A — Optimize the current schema representation

**Mechanism.** Keep model output approximately equal to `AgentProposition`, but use shared definitions/refs, remove representation-only redundancy, or otherwise change JSON Schema serialization without weakening the Zod/domain schema.

**Measured/expected benefit.** Zod `reused: "ref"` reduced raw size from 48,800 to 28,638 characters (41.3%). In one provider call it reduced input from 6,464 to 5,859 tokens (9.4%), far less than the character reduction. Manual, named definitions might tokenize/model-read differently from Zod's generated `__schemaN` graph, but that was not measured.

**Architectural impact.** Low if confined to provider serialization and proven semantically equivalent. No domain object or approval boundary needs to change.

**Correctness risk.** Provider acceptance and model adherence to a graph with 206 refs must be evaluated. A byte-smaller schema can be cognitively less direct for a non-strict model. Strict mode remains blocked by root/optional/propertyNames issues.

**Implementation complexity.** Low for trying the Zod option; medium or higher for stable, manually curated definitions and cross-provider behavior.

**Likely test changes.** Schema-adapter equivalence, `$defs` preservation, provider dialect tests, offline parse equivalence, prompt/model evals, and live token/adherence/latency samples.

**Open questions.** Why did 41% fewer characters yield only 9% fewer input tokens? Do named refs behave better? Does OpenAI cache/compile schemas by value? Does the ref-heavy schema change malformed-output frequency?

### B — Phase-specific output schemas

**Mechanism.** Give language, clarification, retrieval/control, proposition, and correction phases contracts matching only their legal output. Tool acquisition could use no final schema or a small control DTO; a distinct final call would receive the proposition schema.

**Measured/expected benefit.** A clarification-only schema is 625 characters and produced 129 input tokens in the controlled request versus 6,464 with the current union. Tool-only steps could avoid roughly 6k schema-related tokens each. A proposition-only phase remains 48,231 characters unless combined with A or C. Simply toggling `allowClarification` saves only 569 characters.

**Architectural impact.** Medium/high. The current loop permits terminal output on every main step. Phase separation requires explicit transitions and a handoff of validated retrieval evidence, while preserving budgets, read-only tooling, correction behavior, and provider abstraction.

**Correctness risk.** Forced phases may create extra round trips, lose model continuity, terminate incorrectly when no tool is needed, or let retrieval/control text escape validation. The application must remain authoritative over when clarification is permitted and when a proposition is required.

**Implementation complexity.** Medium/high. The `AiClient` already supports no output schema, but the agent loop and preparation orchestration do not expose a tool-only terminal contract.

**Likely test changes.** State-transition tests, no-final-on-tool-phase tests, tool budget accounting across phases, retrieval-record handoff, correction-only phase tests, clarification once-only tests, and live multi-step evaluations.

**Open questions.** What is the smallest number of forced calls? Can the model decide “clarify vs retrieve” with a small control output? When can retrieval be declared complete? Should a direct proposition remain possible without tools for empty/known-state cases?

### C — Model DTO distinct from domain DTO

**Mechanism.** Define a bounded AI-facing semantic result. The model returns semantic values/decisions plus stable evidence selectors. A deterministic adapter resolves selectors against brief/answers/current instruction/retrieval and constructs the rich `AgentProposition`/`Proposition`, followed by all existing schema and authority validation.

**Expected benefit.** Potentially much larger than A because it removes repeated `known`/source/ref serialization rather than only deduplicating it. It could also make every AI-facing field required/nullable and eliminate arbitrary warning records, making strict decoding plausible. No credible full-size estimate exists until the DTO's evidence contract is specified.

**Architectural impact.** Medium/high but compatible in principle with the existing contracts: contract 06 explicitly distinguishes provider shapes from domain shapes, and deterministic assembly already exists. The adapter becomes a new load-bearing domain boundary.

**Correctness risk.** Highest if provenance is inferred from a value, if missing fields silently become unknown, or if DTO/domain semantics drift. Commercial extraction must remain model-owned where semantic. The adapter must reject unknown/stale evidence IDs and validate every reconstructed source/ref.

**Implementation complexity.** High. It needs a naming/evidence registry, DTO schemas, normalization, exhaustive field mapping, validation, revision/override support, and likely prompt changes.

**Likely test changes.** Exhaustive DTO-to-domain mapping, invalid evidence references, absence semantics, every provenance source, human-value preservation, catalog identity/value mismatch, commercial notes/assumptions, warnings, revision overrides, mutation tests, and strict/live model evals.

**Open questions.** How are brief spans identified? Are compact per-request aliases safe and worth using for UUIDs/content IDs? Which warning metadata is genuinely model-owned? Does the model return one evidence selector per leaf or reusable extracted facts? How are current-proposition human values represented during revision?

### Combinations and adjacent directions

**B + C.** Separate small clarification and proposition model DTOs, with a tool/control phase and deterministic domain normalization. This offers the largest theoretical repeated-input reduction and the clearest route to strict schemas. It also has the largest orchestration and adapter surface.

**A + B.** Keep the rich proposition output but avoid sending it during clarification/tool-only phases; use refs only for the final schema. This limits domain change but leaves final-generation complexity and strict blockers.

**A + C.** Use a smaller semantic DTO and still deduplicate any repeated evidence/value structures. The incremental benefit of refs may be small if C is already compact.

**Provider continuation/caching.** The current app does not use Responses `previous_response_id`, conversation state, or explicit prompt-cache options. These might reduce retransmission/billing or provider work, but they introduce provider-specific state, security/retention, error recovery, and portability questions. They must not make provider conversation state authoritative over `ProposalWorkflowState`. This direction was traced but not experimentally evaluated.

No option changes the invariant that the final rich proposition is Zod-validated and provenance-validated before review, or that approval is the only write boundary.

## 12. Recommended planning questions for Claude

Claude should resolve these decisions before producing an implementation plan:

1. Is the primary objective input cost, p50/p95 latency, malformed-output rate, or all three, and what measurable success thresholds apply?
2. Is a low-risk representation experiment (A) valuable even if it saves only the observed ~9% tokens, or should planning target a phase/DTO boundary directly?
3. What are the explicit main-agent states and legal transitions if tool selection is separated from terminal generation?
4. Can a control phase return `clarify`, `retrieve`, or `ready` without duplicating model reasoning or adding more round trips than it removes?
5. What exact semantic facts must the proposition model DTO contain, and which domain fields are filled from catalog, workflow state, defaults, or timestamps?
6. What is the evidence-selector contract for brief text, human answers, current instruction, current proposition, and retrieved catalog content?
7. How will the adapter prove rather than infer `known`, `source`, and `ref`?
8. Which agent warnings remain model-authored, and can model-facing warning metadata be bounded without reducing domain expressiveness?
9. Should prepare and revise use distinct DTOs, especially because `requestedOverrides` is deterministically empty in prepare but semantic in revise?
10. Must a new DTO be strict-compatible from day one, or should strict compatibility be an independently gated outcome?
11. How will cross-provider equivalence be maintained if OpenAI uses strict schemas and Anthropic uses a different mechanism?
12. What live evaluation matrix and sample count are sufficient to judge adherence, p50/p95 latency, tool behavior, and retry rate without excessive cost?
13. Should derived language be persisted across the clarification boundary, and can that be done without changing the authority semantics of `ProposalWorkflowState`?
14. Is provider continuation/prompt caching in scope, and what retention/recovery/portability constraints apply?
15. Which optimization is reversible enough to ship independently, and what telemetry is required before/after it?

## 13. Measurements / evidence index

Persistent artifacts:

- [`schema-analysis.ts`](schema-analysis.ts): imports the real schemas, measures current and experimental JSON Schema forms, scans repeated structure/strict blockers, and benchmarks local serialization/parse work. Run with `npx tsx build_docs/under_constroction/debuging_live_agent/payload_and_latency/schema-analysis.ts`.
- [`schema-analysis-summary.json`](schema-analysis-summary.json): stable concise output from the analysis.
- [`live-baseline.json`](live-baseline.json): sanitized per-step live metrics, the second workflow's variance/retry observation, and the schema-variant comparison. It contains no generated proposal or clarification text.
- [`../README.md`](../README.md) and [`../evidence/`](../evidence/): prior reliability diagnosis and historical malformed provider outputs. Those files were not changed.

Primary source paths:

- [`schemas/agent-output.ts`](../../../../src/features/proposal-preparation/schemas/agent-output.ts): model output composition and clarification switch.
- [`schemas/proposition.ts`](../../../../src/features/proposal-preparation/schemas/proposition.ts): rich proposition, recipient, blocks, assumptions, warnings, and recursive warning value.
- [`schemas/shared.ts`](../../../../src/features/proposal-preparation/schemas/shared.ts): source unions, `known` unions, and provenance refs.
- [`server/agent/preparation.agent.ts`](../../../../src/features/proposal-preparation/server/agent/preparation.agent.ts): language then main run orchestration.
- [`lib/agent/run.ts`](../../../../src/lib/agent/run.ts): repeated schema construction, tool history, correction retry, and budgets.
- [`lib/ai/client.ts`](../../../../src/lib/ai/client.ts): AI SDK request construction and strict-off setting.
- [`lib/ai/openai-schema.ts`](../../../../src/lib/ai/openai-schema.ts): provider dialect cleanup/wrapper.
- [`build-messages.ts`](../../../../src/features/proposal-preparation/server/agent/build-messages.ts): repeated brief, answers, current proposition, and conversation material.
- [`assemble-proposition.ts`](../../../../src/features/proposal-preparation/server/domain/assemble-proposition.ts): current deterministic model-to-domain enrichment.
- [`validate-agent-output.ts`](../../../../src/features/proposal-preparation/server/domain/validate-agent-output.ts): Zod plus provenance/retrieval checks.
- [`preparation.live.test.ts`](../../../../src/features/proposal-preparation/server/agent/preparation.live.test.ts): maintained real-model/fake-Proposales workflow gate.
- [`master-plan.md` §13.3a](../../../initial_core_feature_proposales/master-plan.md): historical live strict-schema failures and rationale for the current provider adapter.

Experiments performed:

1. Exact current schema serialization in both clarification modes, before and after mirroring the OpenAI adapter.
2. Structural counts and top-level subtree contribution analysis.
3. Controlled Zod shared-definition conversion without production changes.
4. Local schema-generation and Zod-validation benchmarks.
5. Two real-model, fake-Proposales clarification-to-proposition workflows. Both succeeded; one retained complete per-step telemetry, and one demonstrated correction-retry variance.
6. Three single-sample real-model clarification requests comparing current inline, shared-definition, and clarification-only schemas.
7. Static tracing of AI SDK/OpenAI request construction, tool/history accumulation, and absence of provider response continuation.

The temporary live instrumentation test was deleted after measurement. Ordinary live/CI suites were not changed.

## 14. Unknowns

This investigation did not establish:

- exact HTTP wire bytes or an exact tokenizer-only count for the schema in isolation;
- cached versus uncached input-token counts, prompt-cache hit rate, or cache impact;
- statistically credible p50/p95 latency for any schema variant;
- whether refs, phase splitting, or a smaller DTO improves malformed-output/retry rates;
- whether an actual proposed DTO is accepted by OpenAI strict mode; no DTO was designed and strict mode was not enabled;
- the smallest safe model DTO or its expected serialized size;
- a complete evidence-selector design for brief quotes/spans and revision-time preserved human values;
- whether phase splitting saves wall time after accounting for potentially forced additional calls;
- provider schema-compilation time versus ordinary input prefill/model reasoning time;
- hidden reasoning-token usage, because the repository's `Usage` abstraction records only input/output/total;
- behavior for much larger catalogs, maximum conversation windows, a full current proposition on revision, or a 20,000-character correction candidate;
- Anthropic token/latency behavior for the same schemas;
- whether OpenAI `previous_response_id`, conversation state, or explicit caching is compatible with the repository's provider portability and data-retention requirements;
- a chosen architecture or implementation sequence. Those are deliberately left for planning.

The evidence is sufficient to explain the current 48 KB, identify where it repeats, show which calls pay for it, and bound the viable design families without weakening any domain invariant.
