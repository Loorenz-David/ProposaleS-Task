# Proposal Copilot

An AI-assisted workflow for turning incomplete commercial intent (briefs, meeting notes, requirements) into a structured proposal that is ready for human review in [Proposales](https://proposales.com). Built as a Next.js App Router application on the Proposales API.

## Status

**Backend workflow implemented; no transport and no product UI yet.** The proposal preparation workflow exists end to end on the server and is proven offline by the test suite: a brief becomes a structured proposition, a human edits and approves it, and the approved payload is executed deterministically as a Proposales draft whose applied pricing is read back and returned with the editor URL. It is reachable today only from server code through [`src/features/proposal-preparation/server/index.ts`](src/features/proposal-preparation/README.md) — there is no Server Action, Route Handler, or UI wired to it. The `/` route is still the neutral shell: a product-neutral root layout, a small styling foundation, and three shared primitives (`Button`, `Input`, `Textarea`).

## The workflow

Everything below the transport line is implemented and tested.

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

- **Vitest and React Testing Library** cover everything below the browser: pure functions, schemas, domain rules, services, adapters with mocked HTTP, and component tests. The node project collects `src/lib/**`, `src/features/**`, and `test/setup/node.test.ts`; the jsdom project collects `src/app/**` and `src/components/**`. Vitest excludes `e2e/` and `*.live.test.ts` so the default projects never overlap with end-to-end or opt-in live tests.
- **Playwright** covers critical browser-level flows from `e2e/`. It starts `npm run dev` itself and runs against Chromium. Today it has one spec that checks the application shell renders and the skip link works.
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
├── src/app/                     # Next.js routes: root layout (application shell) and neutral root route
├── src/components/ui/           # Shared presentational primitives with no domain knowledge
├── src/features/                # Feature code; today: proposal-preparation
├── src/lib/                     # Integrations and shared primitives: proposales, ai, agent, env, errors, values
├── src/styles/                  # Design tokens and global base styles
├── e2e/                         # Playwright specs
├── architectural_contracts/     # Normative engineering contracts (numbered in read order)
├── agent-skills/                # Shared agent policies
├── .claude/skills/, .codex/     # Platform adapters for those policies
├── api-documentation/proposales # Vendored Proposales reference (never hand-edited)
├── scripts/                     # Repository maintenance scripts
├── .github/workflows/ci.yml     # CI pipeline
└── .env.example                 # Configuration inventory
```

Feature code lives under `src/features/<feature>/` and integrations under `src/lib/<system>/` per [03-feature-architecture.md](architectural_contracts/03-feature-architecture.md). Today that is one feature, [proposal-preparation](src/features/proposal-preparation/README.md), over four integrations: [proposales](src/lib/proposales/README.md), [ai](src/lib/ai/README.md), `agent`, and `env`.

## Deployment

The baseline deploys to Vercel. Environment variables are configured in the Vercel project, never in the repository.

## Current scope

Established:

- Next.js scaffold, TypeScript, lint, unit and end-to-end test harnesses, CI.
- Application shell, styling foundation, and shared UI primitives.
- Architecture contracts and agent bootstrap.
- Vendored Proposales reference and refresh workflow.
- The Proposales adapter: transport with retries, content reads, draft creation, recovery search by generation id, and Applied Pricing read-back.
- The AI provider boundary and the agent runtime: tool definitions, a bounded run loop, budgets, and a read-only tool gate.
- The proposal preparation workflow: preparation, clarification, edits, revision, approval validation, and deterministic execution.

Not yet built:

- Transport. Nothing calls the workflow from the browser; `server/actions.ts` is the frontend stream's next step.
- Product UI. The `/` route is still neutral.

Decided and deliberately absent:

- Single Proposales company per deployment.
- No application database ([09-database-and-persistence.md](architectural_contracts/09-database-and-persistence.md)).
- No application-level authentication.
- No client-side persistence: a session lives for the browser page lifetime ([05-client-architecture.md](architectural_contracts/05-client-architecture.md) §5.2).
- No client data-fetching library and no component library; neither is forbidden, neither is earned yet ([05-client-architecture.md](architectural_contracts/05-client-architecture.md) §4, [15-ui-styling-and-component-system.md](architectural_contracts/15-ui-styling-and-component-system.md) §5).

Decided for the frontend:

- Tailwind CSS as the default production styling mechanism, with `src/styles/tokens.css` as the single definition of visual values. The existing CSS Modules are converted only when their components are touched by production UI work ([15-ui-styling-and-component-system.md](architectural_contracts/15-ui-styling-and-component-system.md)).
- Zustand for feature-scoped client stores only, above `useState` and `useReducer` ([05-client-architecture.md](architectural_contracts/05-client-architecture.md) §5.1).

Deliberately absent from the workflow itself: the application never sends a proposal, never writes a price, and never lets a model touch an approved payload. Those are enforced in code and pinned by tests, not conventions; the rules and where each is enforced are in the [feature README](src/features/proposal-preparation/README.md).

## Documentation map

- Engineering contracts: [architectural_contracts/README.md](architectural_contracts/README.md)
- Which contracts apply to a task: [01-implementation-contract-guide.md](architectural_contracts/01-implementation-contract-guide.md)
- How documentation is organized and maintained: [14-documentation-principles.md](architectural_contracts/14-documentation-principles.md)
- Feature documentation: [src/features/proposal-preparation/README.md](src/features/proposal-preparation/README.md).
- Integration documentation: [src/lib/proposales/README.md](src/lib/proposales/README.md), [src/lib/ai/README.md](src/lib/ai/README.md).
