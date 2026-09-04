# Feature Architecture

- **Applicability:** CROSS-CUTTING
- **Intent:** Organize code by feature with explicit runtime folders and a downward dependency direction.
- **Applies when:** creating a feature; adding a folder; deciding whether code belongs in a feature, `src/lib/`, or `src/components/ui/`; importing across features.
- **Does not imply:** creating every listed folder; a feature has only the folders it uses.
- **Related:** [02-runtime-boundaries.md](02-runtime-boundaries.md), [14-documentation-principles.md](14-documentation-principles.md) §6

Code is organized by **feature** (a vertical slice of one business capability), not by technical layer across the whole app. A global `frontend/` vs `backend/` split is prohibited because it hides which server code exists to serve which UI and encourages generic "utils" piles.

Runtime boundaries inside a feature are still explicit: each feature has clearly client, clearly server, and clearly shared folders. See [02-runtime-boundaries.md](02-runtime-boundaries.md).

## 1. Default feature structure

```
src/features/<feature>/
├── components/     # React rendering and interaction. Server Components by default, "use client" on leaves.
├── hooks/          # Client orchestration: flows, controllers, view-state hooks. Always "use client".
├── client/         # Optional. Browser-safe transport adapters (fetch wrappers to our own Route Handlers).
├── server/         # Authority. Services, domain rules, Server Actions, agent tools. server-only.
├── schemas/        # Runtime contracts (Zod). Shared. Runtime-neutral.
├── types/          # Compile-time-only contracts where a schema is not warranted. Shared.
├── README.md       # Durable feature documentation for meaningful features. Contract: 14-documentation-principles.md §6
└── index.ts        # Optional public surface for other features. See §4.
```

Do not create empty folders. A feature with no client interactivity has no `hooks/`. A feature that only calls Server Actions has no `client/`. A feature whose types are all inferred from schemas has no `types/`. A trivial feature has no `README.md`; a meaningful one has exactly one, describing current behavior only ([14-documentation-principles.md](14-documentation-principles.md) §6).

Larger `server/` folders MAY be subdivided by responsibility, and MUST be when the folder exceeds roughly a dozen files:

```
server/
├── actions.ts          # "use server". Thin. One export per Server Action.
├── services/           # Application orchestration: one use case per file.
├── domain/             # Pure business rules and invariants. No I/O.
├── tools/              # Agent tools for this feature. One tool per file.
├── agent/              # Agent definition(s) for this feature: prompt assembly, tool set, run entry point.
└── index.ts            # Public server surface for other features.
```

Naming: feature folders are kebab-case nouns (`proposals`, `content-library`, `proposal-assistant`). Files are kebab-case. Exported React components are PascalCase; everything else is camelCase.

## 2. Responsibilities per folder

| Folder | Owns | Must not contain |
|---|---|---|
| `components/` | Markup, styling, composition, wiring events to hooks, rendering loading/empty/error states | Business rules, request orchestration, `fetch`, `process.env`, integration imports, multi-step state machines |
| `hooks/` | UI orchestration and view state: form flows, multi-step wizards, optimistic updates, calling Server Actions or `client/` adapters, mapping error DTOs to UI states | Business invariants, pricing, authorization decisions, direct external-system calls |
| `client/` | Typed wrappers around **our own** Route Handlers when a Server Action is not appropriate (streaming, file upload, third-party webhooks calling us). Parses responses with schemas | Calls to external services, secrets, business logic |
| `server/` | Application services, domain rules, Server Actions, Route Handler bodies, agent tools and agents, privileged operations, authorization checks | React, `"use client"`, browser APIs |
| `schemas/` | Zod schemas for inputs, outputs, view DTOs, and their inferred types | I/O, React, environment access, anything not importable from both runtimes |
| `types/` | Pure TypeScript types not derived from schemas: UI props unions, discriminated view states, ids | Runtime code |

Rationale for `hooks/` versus `components/`: components are the hardest layer to test and the easiest to bloat. Keeping orchestration in hooks keeps components declarative and lets orchestration be tested without rendering.

Rationale for `server/` being one folder rather than `api/`, `services/`, `domain/` at the top level: the feature is the unit of ownership. An engineer opening `features/proposals/` sees everything the capability needs, and the runtime split inside it is unambiguous.

## 3. Where code lives when it is not a feature

| Kind of code | Location | Notes |
|---|---|---|
| External-system adapters (Proposales, AI provider) | `src/lib/<system>/` | One folder per external system. Reusable across features. `server-only`. See [07-integrations.md](07-integrations.md) |
| Agent runtime primitives (tool definition helper, approval envelope, run loop) | `src/lib/agent/` | Feature-agnostic. Feature-specific agents and tools live in `features/<feature>/server/` |
| Environment access | `src/lib/env/` | Only place that reads `process.env` |
| Database adapter (does not exist today) | `src/lib/db/` if ever justified | `server-only`; feature persistence functions would live in `features/<x>/server/persistence/`. Introduction requires the decision record in [09-database-and-persistence.md](09-database-and-persistence.md) §14 |
| Error taxonomy and serialization | `src/lib/errors/` | Shared between server and client (the DTO half is runtime-neutral) |
| Logging | `src/lib/logger.ts` | Server-side structured logger; client uses `console` sparingly |
| Shared presentational primitives (Button, Dialog, Field) | `src/components/ui/` | No domain knowledge, no data fetching, no feature imports |
| Route entry points | `src/app/` | Layouts, pages, `route.ts`. Thin: import from features, render, return |

A module goes to `src/lib/` only when **at least two features need it or it wraps an external system**. "It might be reused later" is not a reason. Move it when the second consumer appears.

An integration goes to `src/lib/<system>/` rather than inside a feature because its lifecycle (auth, base URL, rate limits, schema drift) is tied to the external system, not to any one capability. The Proposales client serves proposals, content, templates, and the agent tools alike.

## 4. Dependency direction

Within the application the allowed direction is strictly downward:

```
src/app/  →  features/<x>/{components,server}  →  features/<x>/{hooks,client,schemas,types}  →  src/lib/*  →  node_modules
```

Rules:

- `src/app/` imports from features and `components/ui`. Nothing imports from `src/app/`.
- `components/` import `hooks/`, `client/`, `schemas/`, `types/`, `components/ui/`. They MAY be Server Components importing `server/` **only when they are themselves server components that fetch data for rendering** (a page-level data component). A `"use client"` component never imports `server/`.
- `hooks/` import `client/`, `schemas/`, `types/`, and Server Actions from `server/actions.ts` (the one sanctioned client→server import; it is safe because Next.js replaces the import with an RPC stub).
- `server/` imports `lib/`, `schemas/`, `types/`, and other features' `server/index.ts`. Never `components/` or `hooks/`.
- `schemas/` and `types/` import only zod, other schemas/types, and pure runtime-neutral utilities.
- `src/lib/` never imports from `features/` or `src/app/`. An integration client knows nothing about features.

Cross-feature imports:

- A feature MAY import another feature's `schemas/`, `types/`, and `server/index.ts`.
- A feature MUST NOT import another feature's `components/` internals, `hooks/`, or `server/services/*` directly. Export what is intended to be shared from `index.ts` (client surface) or `server/index.ts` (server surface).
- Circular feature dependencies are prohibited. If two features need each other, the shared part is a third concept: extract it or merge them.

Prohibited imports, restated for lint:

| From | Must not import |
|---|---|
| any `"use client"` file | `**/server/**` (except `server/actions.ts`), `@/lib/proposales`, `@/lib/ai`, `@/lib/agent`, `@/lib/env/server` |
| `**/schemas/**`, `**/types/**` | React, `next/*`, `@/lib/env/*`, anything with `server-only` or `"use client"` |
| `@/lib/**` | `@/features/**`, `@/app/**` |
| anything | `process.env` (only `@/lib/env/*` may) |

## 5. Small worked example

Feature: create a proposal draft from a form.

```
src/features/proposals/
├── components/
│   ├── create-proposal-form.tsx        # "use client": fields, submit button, renders flow state
│   └── proposal-summary.tsx            # Server Component: renders a ProposalSummaryDto
├── hooks/
│   └── use-create-proposal-flow.ts     # "use client": form state, calls createProposalAction, maps result to UI
├── server/
│   ├── actions.ts                      # "use server": createProposalAction(input) → validate → service → result
│   ├── services/create-proposal.ts     # orchestrates: domain checks → proposalesClient.createProposal → view DTO
│   └── domain/proposal-rules.ts        # pure: e.g. "a draft needs a recipient or a template", currency checks
└── schemas/
    └── proposal.ts                     # createProposalInputSchema, proposalSummaryDtoSchema, inferred types
```

The form never sees the Proposales response. The service never sees React. The domain file has no imports beyond types. The schema file runs in both runtimes.

## 6. When to split or merge features

- Split when a folder has two clearly different owners of change (different user goals, different external systems, different approval rules).
- Merge when two "features" always change together and share most schemas.
- Do not create a feature for a single utility or a single component. Put it where it is used.
