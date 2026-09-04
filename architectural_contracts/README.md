# Architectural Contracts

This folder is the normative architecture for the Proposales application: a Next.js App Router application written in TypeScript, deployed on Vercel, integrating with the Proposales API and running AI agents server-side.

These documents are **contracts, not tutorials**. Any engineer or coding agent modifying this repository MUST follow them. They describe durable principles, runtime boundaries, structural rules, and implementation constraints. They do not describe features, UI decisions, or product requirements.

## Status of the codebase

At the time this contract was written the repository contains only reference material (`api-documentation/`), a refresh script (`scripts/`), and environment files. **The Next.js application has not been scaffolded yet.** This contract is therefore ahead of the code: the scaffold MUST be created to satisfy it, and the "Scaffold decisions record" below MUST be completed when that happens.

## Precedence

1. A feature specification MAY override a rule in this folder **only** when the override is intentional, written down in that feature's plan, and states which rule is being overridden and why.
2. In every other case these contracts apply, including when a feature plan is silent.
3. When a contract and existing code disagree, the contract wins for new work. Existing code is not silently refactored; the conflict is recorded (see "Known conflicts") and resolved deliberately.
4. When two contract documents appear to disagree, the more specific document wins, and the disagreement MUST be fixed in the same change that discovered it.

## The three-sentence architecture

> **Client code owns interaction. Server code owns authority. Shared code owns contracts.**

One repository, one deployment unit, two runtimes. The browser renders and coordinates interaction. The server holds secrets, calls external systems, runs agents, enforces business rules, and performs mutations. Schemas and types sit between them and are safe in both runtimes.

## Start here

Implementation, planning, and review agents read [implementation-contract-guide.md](implementation-contract-guide.md) first. Reading it is mandatory bootstrap behavior for Claude Code and Codex through the shared Architecture Context policy in [`agent-skills/policy/architecture-context-policy.md`](../agent-skills/policy/architecture-context-policy.md), auto-loaded via `CLAUDE.md` and `AGENTS.md`. It is the routing layer from "what am I changing" to "which contracts apply", so that a task loads the contracts it needs and not the whole folder. This README is the human-readable map; the guide is the operational protocol. They link to the same documents and do not duplicate each other.

## Index

| Document | Responsibility |
|---|---|
| [implementation-contract-guide.md](implementation-contract-guide.md) | First read for agents: contract descriptions, applicability, concern-based routing table, conflict handling, role-specific use, scenarios |
| [runtime-boundaries.md](runtime-boundaries.md) | Browser vs server runtime, `"use client"`, `server-only`, `"use server"`, what may cross the boundary, secrets |
| [feature-architecture.md](feature-architecture.md) | Feature folder structure, responsibilities per folder, dependency direction, where integrations live |
| [server-architecture.md](server-architecture.md) | Thin Route Handlers and Server Actions, services, domain rules, error taxonomy, idempotency, deterministic mutations |
| [client-architecture.md](client-architecture.md) | Components vs flows/hooks, request orchestration, UI state vs server state, loading/error/retry, accessibility |
| [data-contracts-and-validation.md](data-contracts-and-validation.md) | TypeScript vs Zod, validation at trust boundaries, shared schemas, money/dates/enums/unknown fields, external model isolation |
| [integrations.md](integrations.md) | One client module per external system, configuration ownership, typed responses, retries and error translation |
| [agent-architecture.md](agent-architecture.md) | Server-only agents, explicit tools, read vs prepare vs mutate, human-in-the-loop lifecycle, deterministic execution after approval |
| [database-and-persistence.md](database-and-persistence.md) | No application database today, and the normative contract for introducing application-owned persistence later: ownership, boundaries, migrations, ids, consistency with Proposales, serverless constraints |
| [security-and-trust-boundaries.md](security-and-trust-boundaries.md) | Untrusted inputs, secrets, authorization, logging, SSRF/injection, least capability, safe redirects, dependencies |
| [testing-principles.md](testing-principles.md) | Test layers, what each layer proves, agent evals |
| [anti-patterns.md](anti-patterns.md) | Prohibited and strongly discouraged patterns |
| [decision-checklist.md](decision-checklist.md) | Questions to answer before adding a file or feature; naming and dependency direction summary |
| [documentation-principles.md](documentation-principles.md) | Documentation governance: hierarchy, ownership and single sources of truth, root README and feature README contracts, current-state vs planning/investigation/decision artifacts, documentation impact at closeout |

Read order for a new human contributor: this file, runtime-boundaries, feature-architecture, then the document matching the layer being touched. Agents route through the implementation contract guide instead of reading in order. The decision checklist is the short form for day-to-day use; documentation-principles governs what to write down and where when work is done.

Every contract opens with a short applicability block (Applicability, Intent, Applies when, Does not imply, Related) so that once opened it says whether it applies to the task at hand.

## Scaffold decisions record

These are fixed by this contract and MUST be honored when the application is scaffolded.

| Decision | Value |
|---|---|
| Framework | Next.js, App Router only. No `pages/` directory. |
| Language | TypeScript with `strict: true`. No `any` outside explicitly justified adapter code. |
| Source root | `src/`. Path alias `@/*` → `src/*`. No other aliases. |
| Runtime validation | Zod. One library for all runtime schemas. |
| Server-only guard | The `server-only` package on every module that must not reach the client graph. |
| Lint | ESLint with the Next.js config plus the boundary rules described in [runtime-boundaries.md](runtime-boundaries.md). |
| Formatting | Prettier, default config, enforced in CI. |
| Package manager | npm. One `package-lock.json`, committed. No other lockfiles. |
| Unit / integration test runner | Vitest. See [testing-principles.md](testing-principles.md). |
| Browser / end-to-end testing | Playwright, for critical flows only. See [testing-principles.md](testing-principles.md). |
| Node.js version | Pinned by the repository at initialization in `package.json` `engines` and matched to the Vercel project setting. The value is the concrete version the runtime establishes when the app is created, not a number chosen in advance. |
| Application database | None. Deliberate. See "Resolved decisions" and [database-and-persistence.md](database-and-persistence.md). |
| Authentication system | None. Deliberate. See "Resolved decisions". |
| Global state library | None. See [client-architecture.md](client-architecture.md). |

## Resolved decisions

Decisions that were open questions and are now closed. Reopening one requires a new entry here, not a silent change elsewhere.

| Topic | Decision |
|---|---|
| **Persistence** | The MVP has no application database. Transient browser/application state holds in-progress work; Proposales is the system of record for proposals and content; stable correlation metadata is attached where useful. Introducing a database requires the decision record in [database-and-persistence.md](database-and-persistence.md) §14. Do not add PostgreSQL, SQLite, Redis, an ORM, migration tooling, or a hosted database until then. |
| **HITL traceability** | The system MUST preserve the integrity of the transition prepared → reviewed → approved → executed for consequential mutations ([agent-architecture.md](agent-architecture.md) §6). Durable audit storage is not required for every interaction; it MAY be introduced when product, security, compliance, debugging, or operational needs justify it. Transient application/client state is acceptable for prepared proposal state in the MVP. |
| **Proposales timestamps** | The public OpenAPI types the relevant timestamps as int64 without establishing the epoch unit; runtime observations are millisecond-scale. Parsing is isolated in the Proposales adapter and assumptions about units never spread into application code ([data-contracts-and-validation.md](data-contracts-and-validation.md) §6). Not architecture-blocking. |
| **Proposales create idempotency** | No public idempotency-key mechanism exists. The UI MUST block duplicate submission while a mutation is pending; the server SHOULD attach a stable `generation_id` through app-owned `proposal.data` metadata. Runtime testing confirmed that such metadata can participate in `/v3/proposal-search` filtering via `filter[<key>]`, so the server MAY use it as a lightweight recovery and duplicate-detection mechanism. Not an exactly-once guarantee; not a substitute for durable persistence if stronger cross-session guarantees are ever required; no claim that arbitrary keys or value shapes are filterable ([server-architecture.md](server-architecture.md) §8). |
| **Company scope** | Single company per deployment. `PROPOSALES_COMPANY_ID` is server-side deployment configuration. Multi-company or multi-tenant support is out of scope; if introduced, company identity moves into authenticated server-side tenant context under a dedicated architecture decision. |
| **Vendor documentation drift** | The Proposales snapshot is refreshed mechanically; the diff is reviewed against what the application relies on, and only affected adapter assumptions, schemas, tests, and integration documentation are re-evaluated. No full API audit per refresh. Rule lives in [`api-documentation/proposales/README.md`](../api-documentation/proposales/README.md). |
| **Project name** | "Proposal Copilot" is the current working name. Repository labeling, not an architectural invariant: if renamed, patch the root README and other authoritative references in place; no aliases or naming history. |
| **Authentication** | No application-level authentication requirement. Secrets and privileged operations stay server-side regardless. Deployment-level access protection, if configured, is separate from application authentication. Multi-user or multi-tenant product scope requires its own authentication/authorization decision before implementation. |

## Repository layout the contract assumes

```
.
├── README.md                       # Entry point and map of the repository (documentation-principles.md §5)
├── CLAUDE.md                       # Claude Code bootstrap: invokes the Architecture Context policy on every run
├── AGENTS.md                       # Codex bootstrap: same guarantee
├── agent-skills/                   # Shared agent policies (authoritative behavior); see agent-skills/README.md
├── .claude/skills/                 # Claude adapters to shared policies
├── .codex/skills/                  # Codex adapters to shared policies
├── api-documentation/proposales/   # Vendored Proposales docs and openapi.json (reference, not source)
├── architectural_contracts/        # This folder
├── docs/                           # Intentions, implementation plans, decisions, investigations (created on first need)
├── scripts/                        # Repo maintenance scripts
├── src/
│   ├── app/                        # Next.js routes: layouts, pages, route handlers. Thin.
│   ├── features/<feature>/         # Vertical slices. See feature-architecture.md; README.md per meaningful feature
│   ├── lib/                        # Cross-cutting infrastructure and external-system adapters
│   │   ├── env/                    # Validated environment access (server.ts, client.ts)
│   │   ├── errors/                 # Error taxonomy and serialization
│   │   ├── proposales/             # Proposales integration client (server-only); README.md documents how we use it
│   │                           # (a future src/lib/db/ adapter, if ever justified, sits beside these; see database-and-persistence.md)
│   │   ├── ai/                     # AI provider adapter (server-only)
│   │   └── agent/                  # Agent runtime primitives: tool definition, approval envelope (server-only)
│   └── components/ui/              # Shared presentational primitives with no domain knowledge
└── .env.example                    # Committed. Lists every variable, no values.
```

Feature-specific planning, implementation notes, phase plans, and trackers do NOT live in this folder. They live under `docs/` as defined in [documentation-principles.md](documentation-principles.md) §2 and reference these contracts by link.

## How to update this contract

- Patch the stable guidance in place. Do not append "as of <date> we now do X" paragraphs. A reader must never have to reconcile historical layers.
- One change, one reason. State the rationale in the document, not in the commit message alone.
- If a rule is removed, remove it everywhere it is referenced. Search the folder for the rule's key terms before merging.
- If a contract is added, removed, or renamed, or its applicability changes, update its entry and routing row in [implementation-contract-guide.md](implementation-contract-guide.md) and its applicability block in the same change.
- If an architectural change invalidates existing code, list the affected code under "Known conflicts" here and open the refactor as separate work.
- Never add product decisions, screen designs, or feature requirements to these documents.
- These contracts are current-state governance documents under [documentation-principles.md](documentation-principles.md): patched in place, never appended with history. Rationale for a superseded rule goes to `docs/decisions/` if it has lasting value.

## Known conflicts

Recorded, not yet resolved. Each entry names the conflict, the contract rule, and the intended resolution.

| Conflict | Contract rule | Intended resolution |
|---|---|---|
| `.env.example` is listed in `.gitignore` | `.env.example` MUST be committed so every variable is discoverable ([runtime-boundaries.md](runtime-boundaries.md)) | Remove it from `.gitignore` and commit it with empty values. |
| Repository branch is `master`; tooling reports the main branch as `main` | Not an architectural rule; noted to avoid confusion in CI and PR automation | Align the default branch name in one direction when CI is set up. |
| No application code exists | Entire contract | Scaffold according to the "Scaffold decisions record". Pin the Node.js version at that moment. |
