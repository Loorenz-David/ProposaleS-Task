# Proposal Copilot

An AI-assisted workflow for turning incomplete commercial intent (briefs, meeting notes, requirements) into a structured proposal that is ready for human review in [Proposales](https://proposales.com). Built as a Next.js App Router application on the Proposales API.

## Status

**Backend workflow complete; frontend complete on fixtures; the two are not yet integrated.** The proposal preparation workflow exists end to end on the server and is proven offline by the test suite: a brief becomes a structured proposition, a human edits and approves it, and the approved payload is executed deterministically as a Proposales draft whose applied pricing is read back and returned with the editor URL. It is reachable today only from server code through [`src/features/proposal-preparation/server/index.ts`](src/features/proposal-preparation/README.md) — there is no Server Action or Route Handler wired to it yet.

Separately, the full human-in-the-loop workflow is also implemented end to end on the client, against era-marked fixtures. The root route renders the two-pane Proposal Preparation shell with named landmarks, a keyboard- and pointer-operable divider, and a keyboard-accessible, reorderable, closable session tab strip. Inside that shell, a session can be driven through a full cycle — a brief, a structured clarification exchange, a reviewable proposition with provenance and a client preview, inline edits and line-item replacement, and an approval that produces a created or failed draft presentation — entirely against a scripted, in-memory turn adapter under `client/fixtures/*.temporary-fixture.ts`. That adapter stands in for both the AI agent and the Proposales backend: it returns fixed results by turn kind, never reads what the user typed, and computes nothing against the real server workflow described above. The production visual foundation is a Tailwind theme layer defining every visual value once, with base element typography and global focus and reduced-motion treatment. The session strip uses Radix Tabs and the review surface's field-level dialog uses Radix Popover; no shared local UI wrapper exists.

The two halves coexist in this repository but are not wired together: the frontend does not call the backend workflow, and no persistence exists on either side. Connecting them is the next sprint's work, not something this merge performs.

## The workflow

Every step below is implemented and tested today — the reasoning and mutation logic on the server, the presentation shape on the client — but the two halves are not yet wired together (see Status). The frontend currently drives this shape against fixtures, not against the server implementation.

```
Human intent (brief, notes, requirements)
  → AI reasons and gathers information
  → AI prepares a structured proposal
  → human reviews and corrects
  → human approves
  → deterministic Proposales mutation with the exact approved payload
  → human finishes editing and sends in Proposales
```

The human reviews and sends from Proposales; **this application never sends a proposal**, and the Proposales adapter exposes no operation that could.

The principle: AI prepares, the human decides. Consequential mutations stay human-controlled, the approved payload is executed without model reinterpretation, and Proposales remains the final editing and sending environment. The full rules are in [08-agent-architecture.md](architectural_contracts/08-agent-architecture.md).

## Architecture in three sentences

Client code owns interaction. Server code owns authority. Shared code owns contracts.

One repository, one Vercel deployment, two runtimes. Secrets, external calls, agent execution, and mutations stay on the server. Everything else about how the system must be built lives in [architectural_contracts/](architectural_contracts/README.md). Start with [01-implementation-contract-guide.md](architectural_contracts/01-implementation-contract-guide.md), which routes a task to the contracts that govern it; the contracts README records precedence, scaffold decisions, and resolved decisions.

## Tech stack

Verified against `package.json`.

| Concern | Choice |
|---|---|
| Framework | Next.js 16, App Router, React 19 |
| Language | TypeScript, `strict` |
| AI layer | Vercel AI SDK (`ai`) with Anthropic/OpenAI provider boundary in `src/lib/ai/` |
| Runtime validation | Zod 4 |
| Unit and component tests | Vitest 5 with React Testing Library and jest-dom; node project for server tests, jsdom project for app/component tests |
| End-to-end tests | Playwright, Chromium |
| Headless interaction primitives | Radix Tabs 1.1.21 (with Roving Focus 1.1.19), Radix Popover 1.1.23 |
| Icons | Lucide React 1.41.0; session controls use native text glyphs where sufficient |
| Lint | ESLint 9 with `eslint-config-next` |
| Hosting | Vercel |

## Requirements and installation

- Node.js 22 (the version CI uses) and npm.
- Clone, then from the repository root:

```
npm install
npx playwright install chromium   # once, for end-to-end tests
```

## Environment

All variables are read by server code only. Nothing is exposed to the browser.

| Variable | Purpose | Required | Kind | Safe example |
|---|---|---|---|---|
| `PROPOSALES_API_KEY` | Bearer token for the Proposales API | yes | server-only secret | `test-placeholder-not-a-key` |
| `PROPOSALES_COMPANY_ID` | The single Proposales company this deployment operates on | yes | server-only configuration | `1` |
| `PROPOSALES_EDITOR_ORIGIN` | Exact HTTPS origin for human-facing proposal editor URLs | yes | server-only configuration | `https://proposales.example` |
| `AI_PROVIDER` | Provider selected for AI generation | yes | server-only configuration | `anthropic` |
| `AI_MODEL` | Provider-specific model identifier | yes | server-only configuration | `test-placeholder-model` |
| `ANTHROPIC_API_KEY` | Anthropic credential when Anthropic is selected | conditional | server-only secret | `test-placeholder-not-a-key` |
| `OPENAI_API_KEY` | OpenAI credential when OpenAI is selected | conditional | server-only secret | `test-placeholder-not-a-key` |

Copy `.env.example` to `.env` and fill in the values. `.env` is ignored by git.

`.env.example` is committed and is the inventory of configuration: every variable the application reads, every value empty, one comment per variable. Adding a variable means adding it there, to the validation schema in `src/lib/env/` once it exists, and to the Vercel project, in the same change. Real values live only in `.env` or `.env.local`, which are never committed. Nothing sensitive is ever named `NEXT_PUBLIC_*`, because that prefix inlines the value into the browser bundle. Rule and rationale: [02-runtime-boundaries.md](architectural_contracts/02-runtime-boundaries.md) §8.

## Development

Run from the repository root.

```
npm run dev          # local development server on http://localhost:3000
npm run build        # production build
npm start            # serve the production build
```

## Quality

```
npm run typecheck    # tsc --noEmit
npm run lint         # eslint .
npm test             # vitest run (unit and component tests, fully offline)
npm run test:watch   # vitest in watch mode
npm run test:e2e     # playwright test
npm run test:live    # opt-in live suites; a no-op unless LIVE_SMOKE=1
```

`npm test` never touches the network: its setup installs an offline fetch guard and seeds placeholder configuration. The live suites are separate, excluded from the default projects, and skipped unless `LIVE_SMOKE=1` is set:

```
LIVE_SMOKE=1 npm run test:live
```

They read real credentials from `.env`. One of them **creates a real Proposales draft**, titled `[DISPOSABLE COPILOT SMOKE] <timestamp>`, and prints its uuid so it can be deleted by hand; it also prints the observed editor-URL origin, which is how `PROPOSALES_EDITOR_ORIGIN` should be set. The other runs the real AI provider against a fixture catalog with Proposales faked, and writes nothing anywhere. Both pass; neither runs in CI, because one of them writes.

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs typecheck, lint, unit tests, end-to-end tests, and the production build on every push and pull request.

## Testing strategy

- **Vitest and React Testing Library** cover everything below the browser: pure functions, schemas, domain rules, services, adapters with mocked HTTP, and component tests. Every `*.test.ts(x)` under `src/` or `test/` is claimed by exactly one project: the `jsdom` project claims every `.tsx` test and every `.ts` test under a feature's `hooks/`; the `node` project claims everything else (`src/lib/**`, `src/styles/**`, `src/app/**`, `src/features/**` outside `hooks/`, `test/**`). Vitest excludes `e2e/` and `*.live.test.ts` so the default projects never overlap with end-to-end or opt-in live tests.
- **Playwright** covers critical browser-level flows from `e2e/`. It starts `npm run dev` itself and runs against Chromium. Today `e2e/workspace.spec.ts` checks the workspace landmarks, skip link, divider interactions, narrow-width containment, idle state, and the carried visual-foundation checks; `e2e/session-tabs.spec.ts` checks session-tab geometry, focus, hit targets, elision, and URL stability.
- Layers, what each must prove, and the rules for agent evals: [11-testing-principles.md](architectural_contracts/11-testing-principles.md).

## Agent development

Claude Code and Codex are routed through a shared Architecture Context policy before any material planning, implementation, review, debugging, or refactoring decision. The policy makes the agent classify the task, read the implementation contract guide, and load only the applicable contracts. Reading a contract never implies introducing the capability it governs.

| Layer | Path |
|---|---|
| Behavior (authoritative) | [agent-skills/policy/architecture-context-policy.md](agent-skills/policy/architecture-context-policy.md) |
| Claude adapter | [.claude/skills/architecture-context/SKILL.md](.claude/skills/architecture-context/SKILL.md) |
| Codex adapter | [.codex/skills/architecture-context/SKILL.md](.codex/skills/architecture-context/SKILL.md) |
| Auto-loaded bootstrap | [CLAUDE.md](CLAUDE.md), [AGENTS.md](AGENTS.md) |

How the layers relate and how to add a skill: [agent-skills/README.md](agent-skills/README.md).

## Proposales API reference

First-party Proposales documentation and the OpenAPI spec are vendored under [api-documentation/proposales/](api-documentation/proposales/README.md) and refreshed with:

```
./scripts/update-proposales-api-docs.sh
```

A refresh detects possible contract drift; a dependency-aware review of the diff decides whether the application must change. Only vendor changes that touch behavior the application relies on (adapter assumptions, schemas, tests, known quirks) require action. The rule is in that folder's README. How this application uses the API is documented in [src/lib/proposales/README.md](src/lib/proposales/README.md).

## Repository structure

```
.
├── src/app/                     # Next.js routes: root layout and Proposal Preparation workspace route
├── src/features/                # Feature code; today: proposal-preparation
├── src/lib/                     # Integrations and shared primitives: proposales, ai, agent, env, errors, values
├── src/styles/                  # Tailwind theme layer (visual values, defined once) and global base styles
├── e2e/                         # Playwright specs
├── architectural_contracts/     # Normative engineering contracts (numbered in read order)
├── agent-skills/                # Shared agent policies
├── .claude/skills/, .codex/     # Platform adapters for those policies
├── api-documentation/proposales # Vendored Proposales reference (never hand-edited)
├── scripts/                     # Repository maintenance scripts
├── .github/workflows/ci.yml     # CI pipeline
└── .env.example                 # Configuration inventory
```

Feature code lives under `src/features/<feature>/` and integrations under `src/lib/<system>/` per [03-feature-architecture.md](architectural_contracts/03-feature-architecture.md). Today that is one feature, [proposal-preparation](src/features/proposal-preparation/README.md), over four server-side integrations: [proposales](src/lib/proposales/README.md), [ai](src/lib/ai/README.md), `agent`, and `env`. Within the feature, `server/` holds the real workflow described under Status; `client/` owns the persistent workspace shell, page-lifetime session runtime and tab strip, and the full presentation and interaction layer, driven for now by the scripted fixtures under `client/fixtures/`. `client/view-models/` holds the presentation boundary that will absorb the real server contracts unchanged once the two are wired together.

## Deployment

The baseline deploys to Vercel. Environment variables are configured in the Vercel project, never in the repository.

## Current scope

Established:

- Next.js scaffold, TypeScript, lint, unit and end-to-end test harnesses, CI.
- The persistent Proposal Preparation workspace shell: fixed agent surface, session-controlled main-surface seam, user-controlled divider, named landmarks, skip link, and honest idle state. The divider width is page-lifetime state and is not persisted. No shared UI primitive exists yet.
- The page-lifetime session runtime and tab strip: independent session records, creation, activation, keyboard/pointer reorder, close focus destinations, active-tab reveal, and explicit non-wrapping Radix tab mechanics. Session state is not persisted.
- The full presentation and interaction layer of the proposal-preparation workflow, against era-marked fixtures: brief submission and a scripted working state; a structured clarification exchange (single and batch, answer or explicit skip, never both); a review surface with per-leaf provenance, absence, unresolved-information, and validation-error presentation; inline field edits and line-item replacement from retained alternatives; a field-scoped "ask the agent" instruction on a Radix Popover; a read-only client preview with its approximation disclosure; and an approval flow producing a created, recovered, or failed draft presentation with Applied Pricing rendered exactly as returned. Every domain object behind this is a hand-written, explicitly temporary type in `types/temporary-turn.ts`, populated by one scripted adapter in `client/fixtures/turns.temporary-fixture.ts` that returns fixed results by turn kind and never reads, parses, or reasons about what the user typed. Session close and discard are guarded by a meaningful-work predicate with a native confirmation dialog; a departure warning covers an in-flight draft creation; retained context (the fields/preview toggle, an opened line-item replacement) is restored independently per session on switch.
- Architecture contracts and agent bootstrap.
- Vendored Proposales reference and refresh workflow.
- The Proposales adapter: transport with retries, content reads, draft creation, recovery search by generation id, and Applied Pricing read-back.
- The AI provider boundary and the agent runtime: tool definitions, a bounded run loop, budgets, and a read-only tool gate.
- The proposal preparation workflow: preparation, clarification, edits, revision, approval validation, and deterministic execution.

Not yet built:

- The seam between the two halves above. The backend workflow and the frontend's presentation layer are each complete and tested independently, but nothing yet calls the backend workflow from the browser: the frontend's scripted fixture adapter (`client/fixtures/turns.temporary-fixture.ts`) has not been replaced with a real call to `src/features/proposal-preparation/server/index.ts`.

Decided and deliberately absent:

- Single Proposales company per deployment.
- No application database ([09-database-and-persistence.md](architectural_contracts/09-database-and-persistence.md)).
- No application-level authentication.
- No client-side persistence: a session lives for the browser page lifetime ([05-client-architecture.md](architectural_contracts/05-client-architecture.md) §5.2).
- No client data-fetching library and no component library; neither is forbidden, neither is earned yet ([05-client-architecture.md](architectural_contracts/05-client-architecture.md) §4, [15-ui-styling-and-component-system.md](architectural_contracts/15-ui-styling-and-component-system.md) §5).

Decided for the frontend:

- Tailwind CSS as the production styling mechanism. Visual values are defined once, in the Tailwind theme layer at `src/styles/theme.css` ([15-ui-styling-and-component-system.md](architectural_contracts/15-ui-styling-and-component-system.md)).
- Zustand for feature-scoped client stores only, above `useState` and `useReducer` ([05-client-architecture.md](architectural_contracts/05-client-architecture.md) §5.1).

Deliberately absent from the workflow itself: the application never sends a proposal, never writes a price, and never lets a model touch an approved payload. Those are enforced in code and pinned by tests, not conventions; the rules and where each is enforced are in the [feature README](src/features/proposal-preparation/README.md).

Future integration work: replacing the frontend's scripted fixture adapter with the browser-to-server transport boundary and a real call into the server workflow above, so that the AI agent reasoning, the real Proposales adapter and mutation, and the real editor handoff URL — all of which already exist on the server — become reachable from the UI.

## Documentation map

- Engineering contracts: [architectural_contracts/README.md](architectural_contracts/README.md)
- Which contracts apply to a task: [01-implementation-contract-guide.md](architectural_contracts/01-implementation-contract-guide.md)
- How documentation is organized and maintained: [14-documentation-principles.md](architectural_contracts/14-documentation-principles.md)
- Feature documentation: [src/features/proposal-preparation/README.md](src/features/proposal-preparation/README.md).
- Integration documentation: [src/lib/proposales/README.md](src/lib/proposales/README.md), [src/lib/ai/README.md](src/lib/ai/README.md).
