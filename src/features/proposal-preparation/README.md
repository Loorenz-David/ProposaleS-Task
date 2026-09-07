# Proposal preparation

Turns a free-form commercial brief typed in the browser into a structured proposition a human reviews, corrects and approves, then executes that approved payload deterministically as a Proposales draft and hands back the editor URL.

**Status: implemented (integrated; no persistence).** A brief entered in the workspace reaches the agent through a Server Action, and clarification, proposition, human edits, revision, explicit approval, deterministic draft creation and the editor handoff all work end to end. Nothing is stored: a workflow lives for as long as the browser page does.

## The flow

```
browser: brief typed into the workspace
  → Server Action (server/actions.ts), input untrusted
  → service (server/index.ts), which parses it strictly
  → agent reasoning over read-only catalog tools
  → clarification, when something consequential cannot be derived
  → structured proposition for review
  → human edits, revision, cross-turn references
  → explicit human approval, with a pricing acknowledgment
  → approved immutable payload
  → deterministic Proposales draft creation
  → read back the pricing Proposales applied
  → editor URL, opened by the human in Proposales
```

The human reviews and sends from Proposales. **This application never sends a proposal**, and `ProposalesClient` exposes no operation that could.

## Responsibilities

The feature owns the whole vertical slice, split by runtime:

- **The browser owns presentation and page-lifetime session mechanics**: what is on screen, which session is active, tab and divider state, retained context, composer drafts, and the in-flight turn. It holds a typed *copy* of the workflow state so it can round-trip it to the next turn. It is authority for none of it.
- **The server owns everything consequential**: parsing, the agent, catalog reads, domain rules, approval validation and execution. Every service re-parses the state the browser sends, every time, regardless of what the browser believed.

## Public surface

Two entry points, and they are layered.

`server/actions.ts` is the browser's only way in. It carries `"use server"` and exports six thin actions, each `(input: unknown) => ActionResult<…>`: `prepareTurnAction`, `answerClarificationAction`, `editPropositionAction`, `revisePropositionAction`, `approveProposalAction` — the five that carry a turn or an approval — and `blockImagesAction`, which carries neither and only reads the images of line items already on screen. An action adds no schema of its own — it hands the raw input to one service, which parses it — catches every `AppError` into an `ErrorDto`, and logs the failure once with codes and reasons only.

`server/index.ts` is the service surface, callable with plain arguments and a fake Proposales client. It exports eight services, each taking `unknown` and validating it, plus a `deps` object defaulting to `server/services/default-deps.ts`.

| Service | What it does |
|---|---|
| `prepareFromBrief` | First turn. Mints the generation id, reads the catalog and company once, runs the agent, returns a clarification or a proposition. |
| `answerClarification` | Binds answers and skips to information items, then runs again — and cannot ask a second time. |
| `editProposition` | Applies closed deterministic edits. No model, no Proposales. |
| `reviseProposition` | Runs the agent over the current proposition with the conversation history and one human instruction. |
| `searchContentForHuman` | Bounded ranked catalog candidates for a human-driven search. Not exposed in the UI. |
| `getBlockImages` | The first catalog image of each named variation, for the review surface. One vendor read per variation, off the generation path. |
| `approveProposition` | Validates the envelope in binding order, then executes. |
| `executeApprovedProposal` | The deterministic half on its own: recovery search, one create, one read-back. |

## Client/server behaviour

`client/` holds the browser's only importers of `server/actions`: nothing under `components/` or `hooks/` calls an action itself. `client/turn-transport.ts` owns everything consequential and is the only place that knows both vocabularies; `client/block-images-transport.ts` sits beside it for line-item images, which decide nothing and therefore map nothing. Components dispatch **intents** (`TurnInput`) — "the human approved", "the human replaced this line item" — and the transport composes the service envelope from the state the record held when the intent was dispatched. Two consequences worth knowing:

- **Approval is an intent, not a payload.** The component says the human approved; the transport builds `{ state, proposition, pricingAcknowledgment }` from the held state and the acknowledgment constants in `schemas/approval.ts`, so the wording on screen and the id in the envelope cannot drift apart.
- **`replace_block` is a client intent with no backend counterpart.** The transport sends `remove_block` + `add_block` in one `edits` array, reading the candidate from the block's retained alternatives.
- **Line-item images are presentational and arrive late.** Proposales returns content images only for a single-variation query, so they are absent from the catalog read the agent works from. `hooks/use-block-images.ts` asks for them once per variation *after* a proposition is on screen; they never enter the workflow state, the approval envelope, or any decision, and a failed request costs a thumbnail. Removing a line item is confirmed first, in the dialog `components/workspace/confirm-dialog.tsx` owns.

Everything under `server/` starts with `import "server-only"`. `server/actions.ts` carries `"use server"` first and `server-only` second, which `test/isolation-scan.ts` admits explicitly and nothing else may.

## The two caller-held objects

They are never merged, and the distinction is the feature's central rule.

- **`ProposalWorkflowState` is authority.** It holds the generation id, the brief, information-item resolutions, the clarification round, the prepared and current propositions, and — once a draft exists — the draft reference. Approval and execution read this and nothing else.
- **`ConversationContext` is linguistic continuity only.** It exists so the model can resolve "use the second one" against what was said. It is a bounded window of turns, it never becomes commercial authority, and neither `approveProposition` nor `executeApprovedProposal` accepts it. The approval envelope is strict, so a `conversation` key on it is a validation error rather than an ignored field. The browser holds both side by side on its session record and sends the conversation only on brief, answers, edit and revision turns.

The state also carries `derivedLanguage`, the proposal language an earlier turn derived. It exists to save an inference, not to decide anything: every turn re-checks it against the catalog it just read, a human answer about language outranks it, and the proposition's own `language` leaf still carries its own source. A carried code the catalog no longer offers is discarded and derived again. Before it existed, answering a clarification round cost a second derivation call for a question already settled.

## Result states

`DomainResult` is a five-member union: `clarification`, `proposition`, `failed`, `created`, `recovered`. A `failed` result is a domain outcome, not an exception — a run that exhausts its budget returns a clarification or a failure, never a fabricated proposition.

Failures reach the browser through **two channels, deliberately**. A `failed` *result* is a turn that completed and has something to say, so it renders in the thread; model-validation issues carry a compact path and message, with `Root` naming document-level failures. A thrown `AppError` becomes an `ErrorDto` on `{ ok: false }` and renders as a call failure with a retry offered only when the DTO says `retryable`.

## What the model writes, and what the application writes

The model does not author provenance. It states a value and cites the **evidence** for it — a quote from the brief, `Q1` for the first clarification question, a quote from the current instruction, "unchanged from the current proposition", a retrieved catalog id, or "my own wording" for presentational text. `server/domain/evidence-record.ts` holds what may be cited this turn and `server/domain/normalize-model-output.ts` resolves each selector against it, building the `known` wrapper, the `source` and the `ref` from what it proves. Evidence that does not resolve — an alias for a question nobody answered, a quote that is not in the brief, an id no tool returned — is reported back to the model as a correction, and fails the turn if it survives the bounded retries.

Two consequences are worth stating plainly. A consequential value can no longer be marked `inferred`, because the evidence union for those leaves has no such member: it is unrepresentable rather than rejected. And the model cannot name a question id, a turn id or an edit turn at all, so it cannot forge one — the application resolves the alias to the id.

`schemas/model-output.ts` is that contract. It serializes to about 11 KB against the 48 KB of the domain-shaped one it replaced, and it is shaped to be eligible for a provider's constrained decoding — every key required, absence written `null`, no open records — though that is switched on separately. `schemas/agent-output.ts` remains the domain-shaped contract the adapter targets and `validateAgentOutput` checks; `preparation.agent.ts` can still be pointed back at it with `outputContract: "rich"`, which is the migration's rollback.

## Provenance

Every consequential leaf carries its own `source` inside the leaf, never in a side map. Three policies are enforced by the schema itself:

- **consequential** — `brief`, `proposales_content` or `human`. Never `inferred`. Recipient details, content ids, quantities, optional flags, money and tax fields, stated deadlines and terms.
- **catalog_verbatim** — `proposales_content` only. Block titles and descriptions are copied, never authored.
- **presentational** — all four, including `inferred`. Proposal title, narrative, reviewer comments, rationale.

`{ known: false }` is a value meaning "deliberately absent", not a missing key. Nothing on the omission path uses `??`, `||` or a default parameter: "absent" and "Proposales will apply 1" are different facts, and a default turns the second into the first before the request is even built.

The presentation layer reads these leaves through `client/view-models/leaf.ts`. That module exists because `sourcedOrAbsent()` in `schemas/shared.ts` erases its leaf type, so absence-capable leaves infer as `unknown`; `readLeaf` recovers the two arms the schema admits and throws on anything else. It validates nothing — the server already did — and it copies no schema.

## Data contracts

Everything crossing the boundary is defined in [`schemas/`](schemas/), which is runtime-neutral and safe to import from client code: `workflow-state.ts`, `conversation.ts`, `proposition.ts`, `clarification.ts`, `edits.ts`, `approval.ts`, `draft-result.ts`, `turn-result.ts`. Client code imports **types** from there and two **values**: `LIBRARY_PRICING_STATEMENT_ID` and `LIBRARY_PRICING_STATEMENT_TEXT`. `types/turn.ts` holds the UI-only intent and outcome shapes, which no schema owns.

Service results need no DTO conversion: every one is built from strict Zod schemas with no `Date`, `Map`, class instance or function, timestamps as ISO strings, and optional keys omitted rather than set to `undefined`.

## Invariants

- Consequential commercial values are never invented by the model; each carries provenance from the user or a tool result.
- Human approval precedes every Proposales mutation, and the approved payload is executed without model reinterpretation.
- The browser is never authority. Anything it sends is parsed and authorized on the server, every time.
- The session id and the generation id are different things and never substitute for each other; no payload the browser sends contains a session id.
- No money arithmetic happens in the browser. `client/view-models/money.ts` formats a `Money` for display and is the only money operation on the client.
- Once a draft exists the session is terminal: it offers no further turn, and `useTurnDispatch` refuses one.
- Nothing persists. A reload destroys the workspace, and the UI says so rather than implying durability.

## Safety boundaries

1. **No price writes.** The create request carries language, title, description, recipient and blocks of `{ content_id, quantity, optional }` — and nothing else. Library pricing applies on creation; the human acknowledges that before approving; the applied pricing is read back afterwards and reported. The outbound request schema is strict, so a price-bearing key is a loud failure rather than a silent write.
2. **The approval boundary is real.** A proposition is not approved because the model produced it. Approval validates the exact proposition under review against the state's prepared record, in a fixed check order, and records the human's diff.
3. **No model after approval.** `executeApprovedProposal` has no `ai` dependency at all. Its tests pass a client that throws on any call.
4. **Content identity.** Every content id and every `proposales_content` reference the model emits is checked against this run's retrieval record — the ids seeded from the current proposition plus the ids this run actually read. A model-invented id cannot cross into state.
5. **Terminality.** Once a draft exists, approval refuses with a conflict. No second create, no recovery search, no patch: Proposales is the editing environment from that point.
6. **Best-effort recovery.** A create is attempted exactly once and never retried. The generation id in the draft's metadata is the recovery mechanism, searched before creating. This is recovery, not exactly-once — the public API does not offer that, and nothing here pretends otherwise.
7. **Server-only.** Everything under `server/` starts with `import "server-only"`. Secrets, the Proposales client, the AI provider, approval and execution never reach the browser.

## Security and trust

Server Actions are public endpoints: every export of `server/actions.ts` should be read as if it were listed in an API reference. Browser input is untrusted in every posture, and each service's strict `safeParse` is the first thing that touches it.

`COPILOT_LIVE_MUTATIONS` (`enabled` | `disabled`, required, server-only) gates `approveProposalAction` alone. When `disabled`, the action returns `forbidden` **before** the service is called and the review surface renders that message with no retry offered. This is an operational decision about a deployment, not application authorization: every contract above is enforced identically in both settings. It does not gate preparation or revision, which spend AI budget and read the catalog but mutate nothing.

## Testing

`npm test` runs everything offline: no network, no provider call, no real draft.

- [`workflow-ui.test.tsx`](workflow-ui.test.tsx) is the vertical slice. It types a brief into the real components and follows it through the real transport, the real action functions and the real services, with only `defaultDeps` replaced: clarification, proposition, human edit, revision, approval, created and recovered drafts, applied pricing, and every approval failure the backend can return.
- [`workflow.test.ts`](workflow.test.ts) is the same proof one layer down, server-side only.
- [`server/actions.test.ts`](server/actions.test.ts) covers the boundary: malformed input, expected failures as data, one service call per action, the exposure switch, and a JSON round-trip of every result.
- [`client/turn-transport.test.ts`](client/turn-transport.test.ts) covers envelope composition, including `replace_block` becoming two operations and approval carrying no conversation.
- [`retirement.test.ts`](retirement.test.ts) holds the graph guards: no fixture on a shipping path, no privileged import in the browser graph, no persistence API, and the client transports as the only browser importers of the actions. Each runs against a planted source that must trip it.

Two opt-in live suites sit behind `LIVE_SMOKE=1 npm run test:live`, and `LIVE_SMOKE=1 npm run test:e2e` adds the live critical flow. All three are excluded from the default suites; the Playwright one **creates a real draft**.

## Limitations and excluded scope

- **No persistence.** A reload loses the workspace, by decision.
- **Replacement appends.** `add_block` puts the replacement block at the end of the list, so a replaced line item moves. This is backend semantics and no client-side reorder is attempted.
- **No progress reporting.** A typical real turn takes roughly 15–60 seconds behind one honest label; there is no streaming and no step display. The bounded worst-case agent allowance is 240 seconds so one slow proposition and up to two corrective attempts can complete.
- **An absent recipient still shows its five fields.** Setting any one of them materializes the recipient server-side, so each row is a real affordance.
- **The read-back can fail without failing the turn.** A created draft with `appliedPricing.available: false` and a reason is the correct outcome — losing the draft would be worse than reporting no pricing.
- **`searchContentForHuman` is unexposed.** There is no human search UI in this version.
- Under OpenAI, the provider is not asked to constrain decoding to the output schema: its structured-output dialect cannot express a top-level union, which this agent's output is. `src/lib/ai/openai-schema.ts` absorbs the difference, and the model's output is validated and corrected afterwards rather than guaranteed by the vendor. `strictBlockers()` there reports what would stop a schema being sent under constrained decoding, and the model-facing contract is kept clear of all of it, but the setting itself is still off and turning it on is its own verified change. Recovery can restore only a missing `known: true` discriminator when that exact leaf already contains both `value` and `source`; every consequential value and provenance ref still has to pass the authoritative schema and domain validation. Exhausting the retries is a `failed` turn, never a fabricated proposition.
