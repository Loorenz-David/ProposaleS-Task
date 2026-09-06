# Proposal Copilot

An AI-assisted workflow for turning incomplete commercial intent (briefs, meeting notes, requirements) into a structured proposal that is ready for human review in [Proposales](https://proposales.com). Built as a Next.js App Router application on the Proposales API.

## Status

**Foundation established, product workflow not yet implemented.** The repository has a working Next.js scaffold with typecheck, lint, unit, end-to-end, and build steps running locally and in CI, a complete set of normative architecture contracts, agent bootstrap for Claude Code and Codex, and a vendored Proposales API reference. The application currently provides a bare root layout, a neutral `/` route, and the production visual foundation established ahead of any component: a Tailwind theme layer defining every visual value once, base element typography, and a global focus and reduced-motion treatment. No shared UI primitive exists yet; one is created only when a second feature genuinely needs it ([15-ui-styling-and-component-system.md](architectural_contracts/15-ui-styling-and-component-system.md) §4). The `/` route is intentionally neutral until the product UI is ported. No proposal generation, agent, Proposales integration, schema, or business flow exists yet.

## Intended workflow

This is the architecture the product will follow. None of it is implemented.

```
Human intent (brief, notes, requirements)
  → AI reasons and gathers information
  → AI prepares a structured proposal
  → human reviews and corrects
  → human approves
  → deterministic Proposales mutation with the exact approved payload
  → human finishes editing and sends in Proposales
```

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
| AI layer | Vercel AI SDK (`ai`) installed; no model provider configured yet |
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
npm test             # vitest run (unit and component tests)
npm run test:watch   # vitest in watch mode
npm run test:e2e     # playwright test
```

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs typecheck, lint, unit tests, end-to-end tests, and the production build on every push and pull request.

## Testing strategy

- **Vitest and React Testing Library** cover everything below the browser: pure functions, schemas, domain rules, services, adapters with mocked HTTP, and component tests. Every `*.test.ts(x)` under `src/` or `test/` is claimed by exactly one project: the `jsdom` project claims every `.tsx` test and every `.ts` test under a feature's `hooks/`; the `node` project claims everything else (`src/lib/**`, `src/styles/**`, `src/app/**`, `src/features/**` outside `hooks/`, `test/**`). Vitest excludes `e2e/` and `*.live.test.ts` so the default projects never overlap with end-to-end or opt-in live tests.
- **Playwright** covers critical browser-level flows from `e2e/`. It starts `npm run dev` itself and runs against Chromium. Today `e2e/bootstrap.spec.ts` checks the document title, that `/` renders without a client or server error, the global focus and reduced-motion treatment, and that every custom property read by `globals.css` resolves.
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

A refresh detects possible contract drift; a dependency-aware review of the diff decides whether the application must change. Only vendor changes that touch behavior the application relies on (adapter assumptions, schemas, tests, known quirks) require action. The rule is in that folder's README. How this application uses the API will be documented in `src/lib/proposales/README.md` once the adapter exists.

## Repository structure

```
.
├── src/app/                     # Next.js routes: root layout and neutral root route
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

Feature code lives under `src/features/<feature>/` and integrations under `src/lib/<system>/` per [03-feature-architecture.md](architectural_contracts/03-feature-architecture.md); `src/features/proposal-preparation` exists today only as phase 01's test-collection sentinels (no component, hook, or product surface yet).

## Deployment

The baseline deploys to Vercel. Environment variables are configured in the Vercel project, never in the repository.

## Current scope

Established:

- Next.js scaffold, TypeScript, lint, unit and end-to-end test harnesses, CI.
- A bare root layout, a neutral root route, and the production visual foundation (Tailwind theme layer, base typography, focus and reduced-motion treatment). No shared UI primitive exists yet.
- Architecture contracts and agent bootstrap.
- Vendored Proposales reference and refresh workflow.

Decided and deliberately absent:

- Single Proposales company per deployment.
- No application database ([09-database-and-persistence.md](architectural_contracts/09-database-and-persistence.md)).
- No application-level authentication.
- No client-side persistence: a session lives for the browser page lifetime ([05-client-architecture.md](architectural_contracts/05-client-architecture.md) §5.2).
- No client data-fetching library and no component library; neither is forbidden, neither is earned yet ([05-client-architecture.md](architectural_contracts/05-client-architecture.md) §4, [15-ui-styling-and-component-system.md](architectural_contracts/15-ui-styling-and-component-system.md) §5).

Decided for the frontend:

- Tailwind CSS as the production styling mechanism. Visual values are defined once, in the Tailwind theme layer at `src/styles/theme.css` ([15-ui-styling-and-component-system.md](architectural_contracts/15-ui-styling-and-component-system.md)).
- Zustand for feature-scoped client stores only, above `useState` and `useReducer` ([05-client-architecture.md](architectural_contracts/05-client-architecture.md) §5.1).

Future product implementation (not started): brief intake, agent reasoning and tools, prepared-proposal review and approval, the Proposales adapter, and the editor handoff.

## Documentation map

- Engineering contracts: [architectural_contracts/README.md](architectural_contracts/README.md)
- Which contracts apply to a task: [01-implementation-contract-guide.md](architectural_contracts/01-implementation-contract-guide.md)
- How documentation is organized and maintained: [14-documentation-principles.md](architectural_contracts/14-documentation-principles.md)
- Feature documentation will live at `src/features/<feature>/README.md`; intentions, plans, decisions, and investigations under `docs/`. Neither exists yet.
