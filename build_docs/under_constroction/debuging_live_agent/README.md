# Debugging the live agent: slow second turn and invalid draft

Status: investigated, not fixed. No code was changed in the investigating session.
Investigated: 2026-09-07, branch `proposal-copilot-integration`.
Provider at the time: `AI_PROVIDER=openai`, `AI_MODEL=gpt-5.6-luna`.

This is a handoff. Section 1 is what was observed, section 2 is the evidence, section
3 is the diagnosis, section 4 is the proposed fix, section 5 is what a fixing session
must do before it starts changing code.

---

## 1. Reported symptoms

Two symptoms were reported from manual testing at `localhost:3000`, both on the turn
that follows the clarification round:

1. **Timeout.** The offsite brief produced five questions. After answering them, the
   server action returned
   `{"ok":false,"error":{"code":"integration_error","details":{"reason":"timeout","operation":"generateStep","retryable":true}}}`.
2. **Invalid draft.** A different brief (`what content blocks i have ?`) produced one
   question. After answering `all`, the action returned
   `{"status":"failed","failure":{"reason":"model_output_invalid","issues":[{"path":[]}]}}`,
   which the UI renders as "The agent returned an invalid draft" followed by an empty
   `Check:` list.

The user's summary was that it fails on any answer that is not itself a question. That
framing is close but not exact: it fails on any turn where the model must actually
**write a proposition**, which is exactly the turn after answers, because
`answerClarification` runs with `allowClarification: false`.

## 2. Reproduction and evidence

All three symptoms reproduce outside the browser. The method was a temporary
`*.live.test.ts` file run under the existing live config:

```
LIVE_SMOKE=1 npx vitest run --config vitest.live.config.mts <file>
```

`vitest.live.config.mts` loads real credentials from `.env` and does not install the
offline fetch guard. Proposales stays faked (`createFakeProposalesClient` over
`FIXTURE_CATALOG`), so nothing was written anywhere; only the model was real.

The reproduction injected a `generateText` dependency into `createAiClient` to log each
step's duration, finish reason, tool-call count and usage, and to write each final text
to disk. `createAiClient(env, deps)` already accepts that seam, so no production code
was touched.

### 2.1 Timings

Three runs of the same offsite brief, driving `prepareFromBrief` then
`answerClarification`:

| Run | Clarification steps | Proposition attempt 1 | Proposition attempt 2 (retry) | Outcome |
|---|---|---|---|---|
| As shipped (45 s call timeout) | 2.0 s, 3.7 s, 6.0 s, 8.4 s | aborted at 45.0 s | never reached | `timeout` |
| No call timeout, default effort | 3.4 s, 4.5 s, 6.6 s | 17.7 s | 18.9 s | `model_output_invalid` |
| No call timeout, `reasoningEffort: "low"` | 2.2 s, 4.9 s, 5.4 s | 17.1 s | 15.9 s | `model_output_invalid` |

Reading of those numbers:

- Clarification steps are cheap. Proposition steps are not: 15 to 19 seconds each in
  the reproductions, and one run exceeded 45 seconds.
- Lowering reasoning effort did **not** meaningfully speed up the proposition step.
  Output token counts stayed around 1300 to 2000. The cost is the output, not the
  reasoning.
- Every step re-sends a 48 KB output JSON schema. Measured:
  `agentOutputSchemaFor({ mode: "prepare", allowClarification: true })` serialises to
  48800 characters; `allowClarification: false` to 48231. The two tool descriptors are
  377 and 412 characters, so the schema is essentially the entire request overhead.
  Input token counts confirm this: roughly 7000 to 8000 input tokens per step against a
  fixture catalog of trivial size.

### 2.2 Captured model outputs

`evidence/` holds three real final texts from one reproduction run:

- `clarification-turn1.json` — the first turn's clarification. Valid.
- `proposition-attempt-1.json` — the second turn's first proposition attempt. Invalid.
- `proposition-attempt-2-retry.json` — the retry after the issue-path feedback. Invalid,
  and worse than the first attempt.

Note these are the raw provider texts including the OpenAI wrapper: the real document is
under the top-level `result` key, applied by `src/lib/ai/openai-schema.ts`.

### 2.3 Exact validation failures

Parsing the captured attempt 1 against
`agentOutputSchemaFor({ mode: "prepare", allowClarification: false })`:

```
blocks.0.alternatives : Invalid input: expected array, received undefined
warnings              : Invalid input: expected array, received undefined
requestedOverrides    : Invalid input: expected array, received undefined
(root)                : Unrecognized keys: "reviewerComment", "alternatives"
```

Parsing the captured retry, attempt 2:

```
language.known                  : Invalid discriminator value. Expected 'true' | 'false'
title.known                     : (same)
descriptionNarrative.known      : (same)
recipient.value.firstName.known : (same)
recipient.value.lastName.known  : (same)
recipient.value.companyName.known : (same)
agentRationale.known            : (same)
blocks.0.contentId.ref          : Invalid input: expected object, received undefined
blocks.0.quantity.known         : Invalid discriminator value. Expected 'true' | 'false'
blocks.0.optional.known         : (same)
blocks.0.alternatives           : Invalid input: expected array, received undefined
warnings                        : Invalid input: expected array, received undefined
requestedOverrides              : Invalid input: expected array, received undefined
(root)                          : Unrecognized keys: "reviewerComment", "alternatives"
```

Three distinct mistakes, all reproducible:

1. **Block fields hoisted to the root.** The model emits top-level `reviewerComment` and
   `alternatives`, and omits `alternatives` from inside each block. Because
   `agentPropositionSchema` is built from strict objects, this surfaces as a single
   root-level `unrecognized_keys` issue whose `path` is `[]`.
2. **Required arrays omitted.** `warnings` and `requestedOverrides` are never emitted.
3. **The `known` discriminator dropped on the retry.** Attempt 2 writes
   `{ value, source }` where the schema requires `{ known: true, value, source }`, and
   drops `ref` from `contentId`. The retry regressed rather than improved.

The `what content blocks i have ?` run failed the same way. Its recorded issue list was
`[{"path":[]}]`, which is failure 1 alone.

## 3. Diagnosis

### 3.1 The empty `Check:` list is a feedback bug, not a display bug

`src/lib/agent/run.ts` retries an invalid output by sending the model only the issue
**paths**:

```ts
messages.push({ role: "user", content: `The structured output was invalid. Correct these issue paths and return a valid structured output: ${JSON.stringify(paths)}` });
```

An `unrecognized_keys` issue carries its offending key names in the **message**, not in
the path; its path is `[]`. So the model is literally told to correct `[[]]`, which
names nothing. The same empty path then reaches
`toRunFailureTurn` in `src/features/proposal-preparation/client/view-models/failure.ts`,
which maps issues to `issue.path.join(" › ")` — an empty string — producing the empty
`Check:` list in the UI.

This is why the retry does not converge, and why the second attempt is worse than the
first: the model gets no usable signal and re-guesses the shape.

### 3.2 The budget cannot fit the work

`src/lib/ai/config.ts`:

```ts
export const DEFAULT_RUN_BUDGETS = { wallTimeMs: 60_000, maxToolCalls: 12, maxTokens: 60_000 };
export const AI_CALL_TIMEOUT_MS = 45_000;
```

`run.ts` derives each call's timeout as
`Math.min(AI_CALL_TIMEOUT_MS, budgets.wallTimeMs - elapsed)`.

A second turn does: a language derivation step, one or two tool-calling steps, then a
proposition step, then a retry proposition step. With proposition steps measured at 15
to 19 seconds and occasionally over 45, neither budget fits. The 60 second wall budget
would fail the run even if no single call timed out.

Nothing above this layer imposes a shorter deadline: the Next.js server action has no
timeout of its own, so the budget is the only constraint.

### 3.3 The model is not constrained to the schema

`src/lib/ai/client.ts` sends `providerOptions: { openai: { strictJsonSchema: false } }`.
That is deliberate and documented in the file: OpenAI's strict constrained-decode mode
rejected this schema (it forbids `propertyNames` and requires every key in `required`,
which the optional provenance shapes violate). With strict off, the 48 KB schema is a
**hint**, not a constraint, so the shape rules live entirely in the prompt.

`preparationSystemPromptV1` states the `known` rule in prose, which already reflects an
earlier live failure on the same leaves. It does **not** say:

- that `warnings` and `requestedOverrides` are always-present arrays,
- that `alternatives` belongs on each block and not at the root,
- that `reviewerComment` belongs on a block and not at the root.

Those are exactly the three mistakes observed.

### 3.4 A masked failure mode worth knowing about

`client.ts` catches `NoObjectGeneratedError` and, unless the finish reason is
`content-filter`, returns `{ kind: "final", output: error.text }` — the raw text. The run
then fails that text against the Zod schema and reports a root-path issue. So a
provider-side parse failure and a genuinely malformed document are indistinguishable
downstream, and the reviewer never sees what the model actually said. This did not cause
the reported bugs, but it made them harder to diagnose and should be logged at minimum.

### 3.5 The live suite already disagrees with main

`src/features/proposal-preparation/server/agent/preparation.live.test.ts`, test
"L1 reaches a proposition whose consequential facts all carry a real source", asserts
that the turn after the clarification reaches a proposition. It fails today against
`gpt-5.6-luna` for the reasons above. The commit `d61108f Record the live suites passing
and close the sprint` predates whatever changed. A fixing session should treat that test
as the regression gate, not as a passing baseline.

## 4. Proposed fix

Ordered by leverage. Items 1 and 3 address correctness; item 2 addresses the timeout;
item 4 is a hedge.

### 4.1 Feed the retry the issue messages, not just the paths

In `src/lib/agent/run.ts`, carry each Zod issue's `message` (and, for
`unrecognized_keys`, the offending keys) into the retry turn. An issue with an empty path
must still say something actionable. Consider carrying the same enriched issue through
`RunFailure` so the UI's `Check:` list is never empty.

Design constraint: `RunFailure.issues` is currently `Array<{ path: string[] }>`. Widening
it touches `failure.ts` in the client view models and any test asserting on it. Keep the
path field; add rather than replace.

### 4.2 Raise the budgets to fit two proposition attempts

`AI_CALL_TIMEOUT_MS` of 45 s and `wallTimeMs` of 60 s are both too small. Measured work
for a second turn with one retry is roughly 40 to 60 seconds of model time plus tool
steps. Something like 120 s per call and 240 s per run covers it with margin. Confirm
against `architectural_contracts/` before changing: the budget is a stated boundary, and
the change should be justified in the file's own comment, not silently bumped.

Consider also whether a proposition step deserves a larger per-call allowance than a
clarification step, since only the former is slow.

### 4.3 Tighten the system prompt for the proposition shape

Add to `preparationSystemPromptV1`, next to the existing `known` paragraph:

- `warnings` and `requestedOverrides` are always present, as arrays, possibly empty.
- Each block carries its own `alternatives` array and its own `reviewerComment`.
- The proposition root has no `reviewerComment` and no `alternatives`.

A compact worked example of one valid block would likely do more than more prose, given
the model has now got the same family of shapes wrong three ways.

### 4.4 Allow more than one output retry

`MAX_OUTPUT_RETRIES` is 1. With better feedback (4.1) a second retry becomes worth
having. Do not raise it before 4.1, or it just buys more of the same regression.

### 4.5 Optional: log the raw text on a provider parse failure

See 3.4. At minimum log `error.text` when `NoObjectGeneratedError` is swallowed, so the
next investigation does not need instrumentation to see it.

## 5. Instructions for the fixing session

1. Follow the repository's Architecture Context policy before designing the fix. This
   change touches agent behavior, run budgets, schemas and prompt contracts, so route
   through `architectural_contracts/01-implementation-contract-guide.md` and read what it
   selects. The budget values in `src/lib/ai/config.ts` and the strict-mode decision in
   `src/lib/ai/client.ts` are both documented decisions; do not overwrite either without
   reading its rationale first.
2. Reproduce before fixing. The reproduction recipe is section 2: a temporary
   `*.live.test.ts` driving `prepareFromBrief` then `answerClarification`, with an
   injected `generateText` that logs timings and dumps final texts. It costs a few cents
   per run.
3. Verify against the real model, not only offline tests. The offline suite uses a
   scripted client and cannot show whether the model follows the prompt. The gate is
   `npm run test:live` with `LIVE_SMOKE=1`.
4. Delete any scratch test files before closing. The investigating session left none.

## 6. Files that matter

| File | Why |
|---|---|
| `src/lib/agent/run.ts` | Retry feedback (line ~119), budget derivation (line ~100), failure construction |
| `src/lib/ai/config.ts` | `AI_CALL_TIMEOUT_MS`, `DEFAULT_RUN_BUDGETS` |
| `src/lib/ai/client.ts` | Strict-mode decision, `NoObjectGeneratedError` swallowing (line ~191) |
| `src/lib/ai/openai-schema.ts` | The `result` wrapper the captured evidence shows |
| `src/features/proposal-preparation/schemas/agent-output.ts` | The strict schema the model keeps missing |
| `src/features/proposal-preparation/server/agent/prompts/preparation-system-prompt.v1.ts` | Where the shape rules must be stated |
| `src/features/proposal-preparation/client/view-models/failure.ts` | The empty `Check:` list (line ~103) |
| `src/features/proposal-preparation/server/agent/preparation.live.test.ts` | The regression gate, currently failing |

## 7. What was not established

- Whether the same failures occur under `AI_PROVIDER=anthropic`. Not tested. Anthropic
  takes the schema unchanged and its strict behavior differs, so the shape failures may
  be provider-specific.
- Whether a real (non-fixture) catalog changes the timings. All reproductions used
  `FIXTURE_CATALOG`, which is small; a larger catalog means more tool results in context
  and probably slower steps.
- Whether the live suite ever passed against `gpt-5.6-luna` specifically, or passed
  against a different model or a different prompt revision.
