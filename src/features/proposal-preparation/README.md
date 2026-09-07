# Proposal preparation

Turns a free-form commercial brief into a structured proposition a human reviews, corrects and approves, then executes that approved payload deterministically as a Proposales draft and hands back the editor URL.

**Status: implemented, backend only, no transport.** Every service below is exercised through `server/index.ts` with plain arguments and a fake Proposales client. There is no Server Action, Route Handler or UI in this feature: `server/actions.ts` is owned by the frontend stream. Phases 11–15 were built as one collapsed submission sprint rather than under the repository's phase-gated workflow; what that waived and what stayed binding is recorded in the master plan's §13.

## The flow

```
brief
  → agent reasoning over read-only catalog tools
  → clarification, when something consequential cannot be derived
  → structured proposition for review
  → human edits, revision, cross-turn references
  → explicit human approval, with a pricing acknowledgment
  → approved immutable payload
  → deterministic Proposales draft creation
  → read back the pricing Proposales applied
  → editor URL
```

The human reviews and sends from Proposales. **This application never sends a proposal**, and `ProposalesClient` exposes no operation that could.

## Public surface

`server/index.ts` is the only entry point. It exports seven services, each taking `unknown` and validating it, plus a `deps` object that defaults to `server/services/default-deps.ts`.

| Service | What it does |
|---|---|
| `prepareFromBrief` | First turn. Mints the generation id, reads the catalog and company once, runs the agent, returns a clarification or a proposition. |
| `answerClarification` | Binds answers and skips to information items, then runs again — and cannot ask a second time. |
| `editProposition` | Applies closed deterministic edits. No model, no Proposales. |
| `reviseProposition` | Runs the agent over the current proposition with the conversation history and one human instruction. |
| `searchContentForHuman` | Bounded ranked catalog candidates for a human-driven search. |
| `approveProposition` | Validates the envelope in binding order, then executes. |
| `executeApprovedProposal` | The deterministic half on its own: recovery search, one create, one read-back. |

Types the frontend needs (`TurnResult`, `DomainResult`, `ApprovalResult`, `ApprovedProposal`, `DraftResult`, `ProposalWorkflowState`, `ConversationContext`) are re-exported there, and every schema behind them lives under `schemas/`, which is runtime-neutral and safe to import from client code.

## The two caller-held objects

They are never merged, and the distinction is the feature's central rule.

- **`ProposalWorkflowState` is authority.** It holds the generation id, the brief, information-item resolutions, the clarification round, the prepared and current propositions, and — once a draft exists — the draft reference. Approval and execution read this and nothing else.
- **`ConversationContext` is linguistic continuity only.** It exists so the model can resolve "use the second one" against what was said. It is a bounded window of turns, it never becomes commercial authority, and neither `approveProposition` nor `executeApprovedProposal` accepts it. The approval envelope is strict, so a `conversation` key on it is a validation error rather than an ignored field.

## Result states

`DomainResult` is a five-member union: `clarification`, `proposition`, `failed`, `created`, `recovered`. A `failed` result is a domain outcome, not an exception — a run that exhausts its budget returns a clarification or a failure, never a fabricated proposition.

## Provenance

Every consequential leaf carries its own `source` inside the leaf, never in a side map. Three policies are enforced by the schema itself:

- **consequential** — `brief`, `proposales_content` or `human`. Never `inferred`. Recipient details, content ids, quantities, optional flags, money and tax fields, stated deadlines and terms.
- **catalog_verbatim** — `proposales_content` only. Block titles and descriptions are copied, never authored.
- **presentational** — all four, including `inferred`. Proposal title, narrative, reviewer comments, rationale.

`{ known: false }` is a value meaning "deliberately absent", not a missing key. Nothing on the omission path uses `??`, `||` or a default parameter: "absent" and "Proposales will apply 1" are different facts, and a default turns the second into the first before the request is even built.

## Safety boundaries

1. **No price writes.** The create request carries language, title, description, recipient and blocks of `{ content_id, quantity, optional }` — and nothing else. Library pricing applies on creation; the human acknowledges that before approving; the applied pricing is read back afterwards and reported. The outbound request schema is strict, so a price-bearing key is a loud failure rather than a silent write.
2. **The approval boundary is real.** A proposition is not approved because the model produced it. Approval validates the exact proposition under review against the state's prepared record, in a fixed check order, and records the human's diff.
3. **No model after approval.** `executeApprovedProposal` has no `ai` dependency at all. Its tests pass a client that throws on any call.
4. **Content identity.** Every content id and every `proposales_content` reference the model emits is checked against this run's retrieval record — the ids seeded from the current proposition plus the ids this run actually read. A model-invented id cannot cross into state. Both halves are checked: the reference that is cited, and the value that becomes `content_id`.
5. **Terminality.** Once a draft exists, approval refuses with a conflict. No second create, no recovery search, no patch: Proposales is the editing environment from that point.
6. **Best-effort recovery.** A create is attempted exactly once and never retried. The generation id in the draft's metadata is the recovery mechanism, searched before creating. This is recovery, not exactly-once — the public API does not offer that, and nothing here pretends otherwise.
7. **Server-only.** Everything under `server/` starts with `import "server-only"`. Secrets, the Proposales client, the AI provider, approval and execution never reach the browser.

## Testing

`npm test` runs everything offline: no network, no provider call, no real draft. The AI client is scripted with the same step shapes the agent runtime's own tests use, and Proposales is faked.

`workflow.test.ts` is the end-to-end proof: clarification → skip → proposition → human edit → revision → approval → created draft → applied pricing → editor URL, with one write and no price-bearing key anywhere in the request.

Two opt-in live suites sit behind `LIVE_SMOKE=1 npm run test:live` and are excluded from the default suite. Both **pass** against the real Proposales API and the real AI provider:

- `src/lib/proposales/smoke.live.test.ts` creates **one real draft** prefixed `[DISPOSABLE COPILOT SMOKE]`, reads it back, and prints its uuid for manual deletion along with the observed editor-URL origin.
- `server/agent/preparation.live.test.ts` runs the real provider against the fixture catalog with Proposales faked, and writes nothing anywhere.

## Limitations

- No transport, no UI, no persistence: a workflow lives for as long as the caller holds its state.
- Revision resolves references through the conversation window; turns older than the window are gone, and the omitted count is reported rather than silently dropped.
- The read-back can fail without failing the turn. A created draft with `appliedPricing.available: false` and a reason is the correct outcome — losing the draft would be worse than reporting no pricing.
- A misconfigured `PROPOSALES_EDITOR_ORIGIN` returns the created draft with a notice; the returned state then fails its next strict parse, which is loud and intended.
- Under OpenAI, the provider is not asked to constrain decoding to the output schema: its structured-output dialect cannot express a top-level union, which this agent's output is. `src/lib/ai/openai-schema.ts` absorbs the difference, and the model's output is validated and retried afterwards rather than guaranteed by the vendor. Exhausting the retries is a `failed` turn, never a fabricated proposition.
