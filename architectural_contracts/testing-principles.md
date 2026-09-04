# Testing Principles

- **Applicability:** CROSS-CUTTING
- **Intent:** Test each layer at the lowest layer that can prove it; Vitest below the browser, Playwright for critical flows.
- **Applies when:** deciding what to test and where; adding tests for a schema, service, adapter, handler, component, or agent; changing a critical flow.
- **Does not imply:** every change needs a Playwright test, or coverage numbers are a target.
- **Related:** the contract governing the layer under test

Tests exist to make the architecture checkable. Each layer in [feature-architecture.md](feature-architecture.md) has a test layer that proves its contract without depending on layers above it. The layering rule is: **if a thing can be tested one layer lower, test it there.**

## 1. Tooling

Decided, recorded in [README.md](README.md):

- **Vitest** is the runner for everything below the browser: pure functions, schemas, domain rules, application services, agent tools, integration adapters with mocked HTTP or fixtures, Route Handler behavior where valuable, and component/hook tests with React Testing Library.
- **Playwright** is the tool for critical browser-level and end-to-end flows. It is used where end-to-end behavior is materially valuable, not for every feature.
- Scripts run through npm (`npm test`, `npm run test:e2e`). No second runner is added without removing the first.
- Tests live next to the code they test as `<name>.test.ts(x)`, except end-to-end tests, which live in `e2e/` at the repo root.
- CI runs lint, typecheck, Vitest, and build on every pull request. Playwright runs at least before deploy to production, and on pull requests that touch a critical flow.

## 2. Test layers

| Layer | Target | Style | Doubles |
|---|---|---|---|
| Domain / pure unit | `server/domain/*`, mappers, pure utilities | Input → output assertions. Fast. Exhaustive on edge cases (money rounding, dates, enums) | None |
| Schema / validation | `schemas/*`, `src/lib/<system>/schemas.ts`, env schemas | Valid samples parse; invalid samples fail with the expected paths; unknown keys are stripped; `.strict()` rejects extras | None |
| Service / application | `server/services/*` | Call the service with typed input and a fake integration client; assert on the returned DTO, thrown `AppError` subclass, and calls made to the fake | Fake clients from `src/lib/<system>/` (same interface) |
| Integration client | `src/lib/<system>/client.ts`, `http.ts`, `errors.ts` | Mock HTTP at the fetch level or use recorded fixtures; assert request shape (path, headers minus secret values, body), response parsing, error translation, timeout and retry behavior | Mocked `fetch` or an HTTP mocking layer; recorded fixtures under `fixtures/` |
| Route Handler / Server Action boundary | `route.ts`, `actions.ts` | Only where valuable: input rejection produces the right status and `ErrorDto`; success calls the service once and maps the result. Do not re-test service logic here | Mocked service module |
| Component / interaction | `components/*`, `hooks/*` | Render with props or a hook harness; assert on visible states for each flow-state variant; keyboard and focus behavior for interactive components | Mocked Server Actions or `client/` adapters |
| End-to-end (Playwright) | Critical user flows only | Real browser, real app, external systems replaced by a stub server or a sandbox account | Stubbed Proposales and AI provider |
| Agent evals | `server/agent/*`, `server/tools/*` | See §4 | Scripted provider responses; fake services |

## 3. What each layer must prove

- **Domain**: every invariant has at least one failing case test. Money never uses floats. Proposales epoch conversion is verified in the adapter's mapper tests against a recorded fixture, with the assumed unit stated in the test name.
- **Schemas**: each shared schema has a valid fixture and at least one invalid fixture per consequential field. External response schemas are tested against a recorded real response so drift is caught when fixtures are refreshed.
- **Services**: orchestration order, error translation (integration 404 becomes domain `NotFoundError` where intended), idempotency behavior, and that the service never calls the model or the network directly.
- **Integration clients**: authorization header presence (assert the header exists; never assert the secret value from a real env), `company_id` placement per endpoint, timeouts throw `IntegrationError` with `retryable`, retries happen only for idempotent operations, schema mismatch throws with the operation name.
- **Boundaries**: malformed body → 400 with field paths; thrown `AppError` → mapped status; unknown error → 500 with generic message and no leakage.
- **Components and hooks**: every variant of the flow-state union renders something intentional; error DTO messages are shown, not replaced; retry appears only when `retryable`.
- **End-to-end**: the human-in-the-loop lifecycle for the primary feature. The critical flows that warrant Playwright coverage are: entering a brief; receiving an agent-prepared proposal; reviewing and correcting it; approving it; executing the Proposales mutation (against a stub that asserts it received exactly the approved payload); and receiving the external editor handoff. Secondary screens and cosmetic behavior are covered lower in the pyramid, not here.

## 4. Agent tests and evals

Agents are tested at two levels.

**Deterministic tests** (unit-level, no real model):

- Tool input validation: malformed arguments are rejected with a structured tool error, never executed.
- Tool output shaping: results are bounded, contain no secrets or raw upstream fields, and validate against the `output` schema.
- Approval gate: a `PreparedAction` with `missing` entries or consequential assumptions cannot be approved; approval with a corrected payload records the diff; execution uses the approved payload byte-for-byte (compare the fake client's received request with the approved payload through the mapper).
- Run loop: budgets end the run; a scripted provider that keeps calling tools hits the cap and returns `clarification` or `failed`, never a fabricated action.
- Provider independence: the run loop is tested against the `@/lib/ai` interface with a scripted fake, proving no vendor SDK is required.

**Evals** (with a real or recorded model, run on a schedule or before prompt changes, not on every commit):

- Tool selection: given scenarios, the agent chooses `read` tools before preparing; never attempts a `mutate` tool that is not offered.
- Missing-information behavior: scenarios with absent recipient, price, or quantity produce a `clarification` naming the missing path.
- No-hallucination: scenarios where consequential data is absent from tool results produce no invented values; every consequential field in the prepared action has provenance `user` or `tool:*`.
- Assumption labeling: harmless copy assumptions are listed in `assumptions`; consequential fields never appear there.
- Injection resistance: content containing instructions in a tool result does not change the prepared action's consequential fields.

Evals are scored by code (schema and provenance checks), not by another model, wherever possible. Store eval scenarios as fixtures beside the agent.

## 5. Rules

- A test MUST NOT call a real external system or a real model unless it is explicitly an eval or an end-to-end run against a sandbox, and then it MUST be skipped when the required environment variables are absent.
- Tests never read `.env`. They construct configuration explicitly.
- No snapshot tests of large DOM trees or large JSON; assert on the fields that matter.
- Fixtures for external responses are refreshed deliberately, reviewed in the diff, and scrubbed of real customer data.
- A bug fix comes with a test at the lowest layer that could have caught it.
- Coverage numbers are not a target. Untested consequential paths (money, approval, execution) are a blocker; untested presentational details are not.
- If application persistence is ever introduced, the additional expectations in [database-and-persistence.md](database-and-persistence.md) §16 apply.
