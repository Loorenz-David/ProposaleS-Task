---
plan: plans/phase-09-agent-runtime.md
role: implement
state: IMPLEMENTED
date: 2026-09-07
actor: Codex
---

# Phase 9 round 1 implementer handoff

## Gate, architecture context, and baseline

All seven prompt gates passed: the intention is `RATIFIED` through §23 round 18; master rows
1–8 are `APPROVED` and row 9 was `PROMPT_READY`; the phase plan was `PROMPT_READY` with 7
criteria / 34 rows / 13 mutations; the closed `ToolErrorCode` and `ToolInvokeResult` registries,
`RecordedToolCall`, `contentDetailSchema`, `toolContext`, rules 17–18, and the closed phase-8
owner card were present; and the target runtime/tool directories were absent.

Architecture context applied: `02-runtime-boundaries.md`, `03-feature-architecture.md`,
`06-data-contracts-and-validation.md`, `07-integrations.md`, `08-agent-architecture.md`,
`10-security-and-trust-boundaries.md`, `11-testing-principles.md`, `12-anti-patterns.md`,
`13-decision-checklist.md`, and `14-documentation-principles.md`. The implementation is
server-only, keeps `src/lib/agent` feature-independent, validates model/tool boundaries with
Zod, and keeps operational logs to ids/counts/outcomes.

The required pre-production full-suite baseline was not captured; the honest pre-edit baseline
that was captured after transcribing the phase tests was the targeted phase command: **3 failed
suites / 0 tests**, because the planned modules did not yet exist. No baseline was reconstructed
afterward. The phase-8 recorded comparator was 28 files / 383 tests, but it was not presented as
a new baseline run for this session.

## What was built

`defineTool` validates input before `execute`, applies `requires`, validates output, emits a
provider-neutral descriptor, and lets programming errors thrown by `execute` propagate. `run`
implements a `while` loop with wall-time, tool-call, and token budgets; null-propagating reported
usage plus a separate zero-for-budget token counter; live `remainingBudget`; per-call timeout
ceilings; labeled correlated tool-result messages; one bounded output retry; read-only gating;
and id/count/outcome logging. `search_content` and `get_content` are read-only, context-scoped,
localized, bounded, and output-shaped. The scripted fake now records timeout options.

Delegated choices:

- Internal control flow is a `while` loop because budgets and tool dispatch are checked between
  each provider call and each tool invocation.
- `invoke` is `async` so synchronous and asynchronous `execute` functions share one contract;
  it does not catch an `execute` throw.
- Retry text is exactly: `The structured output was invalid. Correct these issue paths and
  return a valid structured output: <JSON issue paths>`; it carries paths and no model text.
- Zod issue paths use `issue.path.map(String)`, matching the four existing call sites named by
  the prompt.
- `run` always passes `outputJsonSchema`; both runtime output conversion and tool descriptor
  conversion use `z.toJSONSchema(schema, { io: "input" })`. No additional options were needed.

## Coverage map — every acceptance row

Each line names the executable case and whether its assertion matches the row's required shape.

- C1(a) → `define-tool.test.ts` invalid-arguments case → exact invalid code, string paths, and execute-not-called assertion.
- C1(b) → `define-tool.test.ts` invalid-output case → exact `invalid_tool_output` arm.
- C1(c) → `define-tool.test.ts` descriptor case → exact three-key descriptor for both shipped tools.
- C1(d) → `define-tool.test.ts` schema-bound case → both descriptors are callable and `maxLength` equals the imported shared constant.
- C2(a) → `tools.test.ts` read-only set case → exact two names, all `read`, assertion does not throw.
- C2(b) → `tools.test.ts` write-tool proof → assertion throws and names the write tool.
- C2(c) → `run.test.ts` non-read run case → rejects before a model call; fake call list is empty.
- C2(d) → `tools.test.ts` perimeter scan → same `hasForbiddenForm` symbol and exact five-file listing; no forbidden form matches.
- C2(e) → `tools.test.ts` scanner instrument proof → same predicate flags each listed synthetic form and permits the control.
- C3(a) → `run.test.ts` tool-call budget case → failed/tool_calls, exactly three calls and records.
- C3(b) → `run.test.ts` wall-boundary case → exact-boundary wall failure after one prior step and one model call.
- C3(c) → `run.test.ts` token-budget case → token failure before the next provider call.
- C3(d) → `run.test.ts` same tool-budget case → explicitly asserts no `output` key.
- C3(e) → `run.test.ts` before-dispatch case → one execute invocation when a step contains two calls.
- C3(f) → `run.test.ts` timeout case plus `scripted.test.ts` recording seam → timeout is within `[1, remaining]`.
- C3(g) → `run.test.ts` dual-exhaustion case → wall-time wins over tokens after the step.
- C3(h) → `run.test.ts` live-context case → second tool sees a smaller remaining tool budget than the first and neither sees the initial value.
- C4(a) → `run.test.ts` success usage case → exact summed three-field usage.
- C4(b) → `run.test.ts` failure usage case → exact summed usage on budget failure.
- C4(c) → `run.test.ts` null-propagation case → input count is null while reported fields sum.
- C4(d) → `run.test.ts` unreported-token budget case → token failure with `usage.totalTokens === null`.
- C5(a) → `run.test.ts` one-retry case → raw-string fixture, two calls, issue paths in the retry user message, valid output.
- C5(b) → `run.test.ts` repeated-invalid case → model-output failure and every issue path is `string[]`.
- C5(c) → `run.test.ts` retry-bound case → exactly two calls and no script exhaustion.
- C5(d) → `run.test.ts` sentinel case → sentinel absent from retry message and serialized result.
- C6(a) → `tools.test.ts` search case → concrete variation id, score, and match strength asserted by value.
- C6(b) → `tools.test.ts` get case → known detail, unknown id null, and unlocalized title null.
- C6(c) → `tools.test.ts` output-shape case → exact candidate keys and explicit absence of `createdAt`/`images`.
- C6(d) → `tools.test.ts` language-precondition case → exact error and a throwing catalog getter proves execute was not reached.
- C6(e) → `tools.test.ts` shared-bound case → exact-bound acceptance and over-bound rejection on both schemas/paths.
- C7(a) → `run.test.ts` message case → assistant tool-call and labeled tool-result forms share `toolCallId` and output value.
- C7(b) → `run.test.ts` bad-call case → structured invalid-argument result is returned to the model and the next call occurs.
- C7(c) → `run.test.ts` bad-output case → exact `tool_output_invalid` failure and no further provider call.
- C7(d) → `run.test.ts` logger case → start/end carry run ids and tool-call count; sentinel is absent from every record.

Reverse trace: every test in the four phase test files is named above against at least one row;
the two existing scripted-fake tests are both C3(f) evidence, and no orphan phase test remains.

## Mutation ledger

Declared = 13; executed = 13; red = 13; restored = 13. `run.ts` restored digest:
`69b8e6071a694c6f0db502c3faf5c3627081b39843400bd3b92e9202ba3ce452`; shared scanner digest:
`9984871828e35d5e87c39e5c4db5e4b8795591edba93a23c6faa03bd872a73bc`; search-tool digest:
`56864b3fe918d0d1132647ac471a9789786591e617eabed883a870a3ec38b994`; phase-7 ranking digest:
`a086a84652c55c7347820a68a9cd9e7450912bf24b01cf433319e20bb45a745b`.

| ID | Probe command/site | Observed red | Restored |
|---|---|---|---|
| MUT-09-1 | `npm test -- --run src/lib/agent/run.test.ts -t 'refuses a non-read'`; delete the run read-only guard | C2(c), promise resolved and model was called | run.ts digest above |
| MUT-09-2 | `npm test -- --run src/lib/agent/run.test.ts -t 'checks the tool-call budget before each dispatch'`; move check after invoke | C3(e), execute called twice instead of once | run.ts digest above |
| MUT-09-3 | `npm test -- --run src/lib/agent/run.test.ts -t 'propagates an unreported usage'`; map null input usage to 0 | C4(c), null became 0 | run.ts digest above |
| MUT-09-4 | `npm test -- --run src/lib/agent/run.test.ts -t 'does not send or report model text'`; append raw output to retry text | C5(d), sentinel appeared in retry message | run.ts digest above |
| MUT-09-5 | `npm test -- --run src/features/proposal-preparation/server/tools/tools.test.ts -t 'proves the shared scanner'`; retain one scanner alternative | C2(e), synthetic node-import form was not flagged | scanner digest above |
| MUT-09-6 | `npm test -- --run src/features/proposal-preparation/server/tools/tools.test.ts -t 'complete agent perimeter'`; replace shared constant with literal `200` | C2(d), search tool was flagged | search-tool digest above |
| MUT-09-7 | `npm test -- --run src/lib/agent/run.test.ts -t 'separate numeric token budget'`; compare reported nullable usage instead of numeric counter | C4(d), scripted client exhausted instead of token budget failing | run.ts digest above |
| MUT-09-8 | `npm test -- --run src/lib/agent/run.test.ts -t 'ends on invalid tool output'`; return invalid output to model instead of ending | C7(c), run returned output instead of tool-output failure | run.ts digest above |
| MUT-09-9 | `npm test -- --run src/lib/agent/run.test.ts -t 'appends correlated tool results'`; drop tool-result message append | C7(a), expected labeled result message was absent | run.ts digest above |
| MUT-09-10 | `npm test -- --run src/features/proposal-preparation/server/tools/tools.test.ts -t 'validates the output shape'`; add `createdAt` in `rank-candidates.ts` | C6(c), tool output failed validation | ranking digest above |
| MUT-09-11 | `npm test -- --run src/lib/agent/run.test.ts -t 'logs operational ids'`; include final model text in step logging | C7(d), sentinel appeared in operational records | run.ts digest above; rerun after the strengthened C7(d) fixture remained red |
| MUT-09-12 | `npm test -- --run src/lib/agent/run.test.ts -t 'stops at one retry'`; widen retry comparison by one | C5(c), call count became three | run.ts digest above |
| MUT-09-13 | `npm test -- --run src/lib/agent/run.test.ts -t 'fresh remaining budget'`; pass initial budgets into tool context | C3(h), both tool calls saw the initial budget | run.ts digest above |

The mutation probes touched only the four files named by the ledger (with MUT-09-10 touching
the approved phase-7 file); every probe edit was applied and reverted. The test fixtures were
strengthened during implementation before the final focused run; the affected retained mutation
rows were re-run as required.

## Closing L4 stamp

The single authoritative closing stamp on the corrected tree is green:

- `npm test` → **31 files / 416 tests passed**.
- `npm run typecheck` → exit 0.
- `npm run lint` → exit 0.

No `npm run build` was run. No network, provider call, `.env` read, or `npm install` was run.
Typecheck rewrote tracked `tsconfig.tsbuildinfo`; it was attributed and restored before
checkpointing, rather than swept into the implementation commit. The initial lint attempt found
five static imports from feature code in `src/lib` tests; those were converted to dynamic
test-local imports, and the final stamp above is after that correction.

## Full write perimeter

Intended implementation/test changes:

1. `src/lib/agent/types.ts`
2. `src/lib/agent/define-tool.ts`
3. `src/lib/agent/define-tool.test.ts`
4. `src/lib/agent/run.ts`
5. `src/lib/agent/run.test.ts`
6. `test/helpers/agent-boundary-scan.ts`
7. `src/features/proposal-preparation/server/tools/search-content.tool.ts`
8. `src/features/proposal-preparation/server/tools/get-content.tool.ts`
9. `src/features/proposal-preparation/server/tools/tools.test.ts`
10. `src/features/proposal-preparation/server/tools/index.ts`
11. `src/lib/ai/scripted.ts`
12. `src/lib/ai/scripted.test.ts`
13. `src/features/proposal-preparation/schemas/content-candidate.ts`

Pipeline artifacts changed: `plans/phase-09-agent-runtime.md` (state and Review log),
`master-plan.md` (tracker row 9), and this handoff. Mutation-only perimeter: the four ledger
files listed above; all mutation edits were reverted. `tsconfig.tsbuildinfo` was generated by
typecheck, recorded as such, and restored. No package manifest, lockfile, env example, README,
or unrelated source file changed.

No owner decision card is required. No plan defect or semantic conflict was found.
