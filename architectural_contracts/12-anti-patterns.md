# Anti-Patterns

- **Applicability:** ALWAYS, for the sections matching the task's concerns
- **Intent:** What reviewers reject, with the replacement for each.
- **Applies when:** planning or reviewing any meaningful change; read the sections for the concerns touched, not the whole file.
- **Does not imply:** a new rule; each entry is the negative image of a contract.
- **Related:** all contracts

Patterns that are prohibited or strongly discouraged in this repository. Each entry names the pattern, why it is harmful here, and what to do instead. "Prohibited" means a reviewer rejects it. "Discouraged" means it requires a written justification in the change.

## Runtime boundary

| Pattern | Status | Instead |
|---|---|---|
| Importing anything from `**/server/**`, `@/lib/proposales`, `@/lib/ai`, `@/lib/agent`, or `@/lib/env/server` into a `"use client"` file | Prohibited | Call a Server Action or a `client/` adapter. [02-runtime-boundaries.md](02-runtime-boundaries.md) §5 |
| Reading `process.env` outside `src/lib/env/` | Prohibited | Import the validated value |
| Exposing a secret as `NEXT_PUBLIC_*` | Prohibited | It is not a secret anymore. Move the call server-side |
| `"use client"` on a page or layout to make one button work | Prohibited | Push the directive to the leaf component |
| `"use server"` on a service, domain, or integration file | Prohibited | Use `server-only`; `"use server"` creates public endpoints. [02-runtime-boundaries.md](02-runtime-boundaries.md) §4 |
| Relying on the framework to infer that a module is server-side | Discouraged | Add `server-only` so the boundary is a build failure, not a hope |
| Passing class instances, `Date`, `Map`, or thrown errors across the client/server boundary | Prohibited | Plain JSON data, ISO strings, `ErrorDto` |

## Components and client

| Pattern | Status | Instead |
|---|---|---|
| Giant Client Component that fetches, validates, computes, and renders | Prohibited | Hook for orchestration, server for authority, component for rendering. [05-client-architecture.md](05-client-architecture.md) |
| Business rules embedded in JSX (`price * 1.25`, eligibility conditions, "can send" logic) | Prohibited | Server domain rule or shared schema; component renders the result |
| `isLoading` / `isError` / `data?` boolean soup | Prohibited | Discriminated flow-state union |
| Unnecessary global state (a store for data one screen uses) | Prohibited | Local state in the owning hook; lift only as far as needed |
| Hand-rolled cache of server data in client state | Discouraged | Re-fetch via Server Component, `router.refresh()`, or a re-called action |
| Raw `fetch("https://external...")` in a component or hook | Prohibited | The server calls integrations. [07-integrations.md](07-integrations.md) |
| Client-side validation that differs from the server schema | Prohibited | Import the shared schema |
| Catching an error and rendering "Something went wrong" when an `ErrorDto` with a message exists | Prohibited | Render the DTO message; generic fallback only for unknown codes |
| `div` with `onClick` as a button | Prohibited | Native control or `components/ui` primitive |

## Server

| Pattern | Status | Instead |
|---|---|---|
| Giant `route.ts` or `actions.ts` with business logic, loops over external calls, or `switch(action)` | Prohibited | Thin transport; one service per use case. [04-server-architecture.md](04-server-architecture.md) §2–3 |
| Business rules duplicated in UI and Route Handler / service | Prohibited | One owner in `server/domain/` or `schemas/` |
| Server Action parameter typed as the trusted shape instead of `unknown` | Prohibited | Accept `unknown`, parse |
| Catching an error and rethrowing a generic one without `cause` | Prohibited | Add context, keep the cause; the transport layer serializes |
| Logging with `console.log` in server code or logging request bodies, tokens, prompts | Prohibited | Structured logger with redaction. [10-security-and-trust-boundaries.md](10-security-and-trust-boundaries.md) §7 |
| Module-level mutable state used as storage across requests | Prohibited | Serverless functions do not share memory; use the application's actual state |
| Introducing a database, auth system, queue, or cache infrastructure inside a feature change | Prohibited | Architectural decision recorded in [README.md](README.md) first; for storage, the decision record in [09-database-and-persistence.md](09-database-and-persistence.md) §14 |
| Retrying a non-idempotent external write automatically | Prohibited | Surface the failure; let a human or flow decide |

## Data and validation

| Pattern | Status | Instead |
|---|---|---|
| Relying on TypeScript types for data from HTTP, models, storage, or forms | Prohibited | Zod at the boundary. [06-data-contracts-and-validation.md](06-data-contracts-and-validation.md) |
| `as SomeType` on parsed JSON | Prohibited | `schema.parse` |
| `.passthrough()` on a schema whose output is stored, rendered, or forwarded | Prohibited | Strip by default; opaque fields as `z.record(z.string(), z.unknown())` |
| Third-party response types used as parameters or props outside `src/lib/<system>/` | Prohibited | Map to a domain/DTO shape in the integration module |
| Floats for money, epoch integers for dates in the domain, silently defaulted enums | Prohibited | Minor-unit integers with currency, ISO strings, explicit unknown handling |
| Schema defined inline in a component, action, or route | Discouraged | Export from `schemas/` so it can be shared and tested |

## Integrations

| Pattern | Status | Instead |
|---|---|---|
| Raw external API calls scattered through features, tools, or components | Prohibited | One client per system in `src/lib/<system>/` |
| Tokens passed as function arguments outside the integration module | Prohibited | The module reads its own configuration |
| Forwarding an entire upstream response to the client or the model | Prohibited | Parse, map, shape |
| A request without a timeout | Prohibited | Every request has one |
| Wrapping the whole vendor API "for completeness" | Discouraged | Wrap what is used |

## Agents

| Pattern | Status | Instead |
|---|---|---|
| Model output directly triggering a consequential mutation | Prohibited | `prepare` tool → human approval → deterministic execution. [08-agent-architecture.md](08-agent-architecture.md) §6 |
| Model regenerating, reformatting, or "cleaning" data after human approval | Prohibited | Execute the approved payload exactly |
| Model inventing prices, recipients, quantities, dates, terms, or ids | Prohibited | Provenance from user or tool, or a clarification |
| A single tool that both reads and writes, or a tool whose kind is unclear | Prohibited | One kind per tool |
| Tools implementing their own HTTP | Prohibited | Tools call services or integration clients |
| Business rules that exist only in a prompt | Prohibited | Enforce in schema or domain; the prompt may mention it |
| Coupling features or the run loop to a specific AI provider SDK | Prohibited | `@/lib/ai` adapter |
| Sending secrets, env values, internal URLs, or out-of-scope data into a prompt or tool result | Prohibited | DTOs only, scoped by `ctx` |
| Unbounded tool loops or runs that assume unlimited execution time | Prohibited | Budgets, bounded turns, resumable state |
| Agent runtime code in a `"use client"` graph or a shared folder | Prohibited | `server-only` under `features/<x>/server/agent` and `src/lib/agent` |

## Persistence

The MVP has no application database. These apply the moment one is proposed. [09-database-and-persistence.md](09-database-and-persistence.md)

| Pattern | Status | Instead |
|---|---|---|
| Adding a database "for later" or to satisfy HITL vocabulary | Prohibited | Persistence decision record with a real durability requirement |
| Introducing PostgreSQL, SQLite, Redis, an ORM, migration tooling, or a hosted database without the decision record | Prohibited | §14 decision record first |
| Treating ORM models as the domain architecture | Prohibited | Storage representation mapped to application representation where responsibilities differ |
| Raw database access inside React components | Prohibited | Services call persistence functions; components receive DTOs |
| Raw database access scattered across Route Handlers or Server Actions | Prohibited | Thin transport → service → persistence function |
| Business invariants duplicated across queries, services, and UI | Prohibited | One owner; constraints and validation as complementary layers |
| Mirroring Proposales entities without ownership semantics (id-only, snapshot, cache, projection, authoritative) | Prohibited | State the mode and its consistency rule |
| Storing secrets in ordinary tables to avoid environment configuration | Prohibited | Server-side configuration; encrypted credential storage only under its own design |
| JSON blobs to avoid modeling known relational invariants | Discouraged | Model the relation, or justify the blob in the decision record |
| Claiming exactly-once execution without a mechanism | Prohibited | Detectable, retry-safe design; unique constraint on the correlation id when persisted |
| Storing every LLM conversation, prompt, or tool-call history by default | Prohibited | Data minimization; store only with a documented product, debug, or audit need and a retention rule |
| `execute_sql` / `query_database` style agent tools | Prohibited | Domain-capability tools that call services |
| Schema auto-sync or "push" against production | Prohibited | Committed, reviewable migrations |
| Introducing Redis alongside a database without an explicit requirement | Prohibited | Name the requirement (cache, queue, lock) and the race or latency it addresses |
| Copying a long-running-server database configuration into the Vercel serverless runtime | Prohibited | Verify pooling, connection limits, and transaction support for the actual runtime |

## Documentation

Governed by [14-documentation-principles.md](14-documentation-principles.md); the entries here are the ones reviewers most often catch.

| Pattern | Status | Instead |
|---|---|---|
| Documenting planned or intended behavior as implemented | Prohibited | Label it planned in an intention or plan; feature READMEs describe verified behavior only |
| Appending "originally X, then Y, now Z" history to a current-state document | Prohibited | State Z; move the reasoning to a decision record or plan review log if it has lasting value |
| A second copy of commands, environment variables, architecture rules, or endpoint behavior | Prohibited | Link to the single owner |
| Inventing commands, scripts, or environment variables that do not exist in the repository | Prohibited | Verify in `package.json`, `.env.example`, and `src/lib/env/` first |
| Editing files under `api-documentation/` by hand | Prohibited | Refresh with the script; write our interpretation in `src/lib/<system>/README.md` |
| Updating documentation mechanically because files changed, or skipping it when behavior changed | Prohibited | Documentation impact review after verification |

## Structure and abstraction

| Pattern | Status | Instead |
|---|---|---|
| Feature folders holding arbitrary miscellaneous utilities (`utils.ts` with twelve unrelated helpers) | Prohibited | Put a helper next to its only consumer; move to `src/lib/` when a second feature needs it |
| Global `frontend/` vs `backend/` split | Prohibited | Feature-oriented organization with explicit runtime folders. [03-feature-architecture.md](03-feature-architecture.md) |
| Premature generic repositories, base services, or abstract "managers" with one implementation and no boundary | Prohibited | Plain functions; add an interface when a second implementation or a test double is real |
| Dependency-injection containers, decorators, or reflection-based wiring | Prohibited | Function parameters with defaults |
| Framework magic with unclear ownership (implicit middleware side effects, hidden global providers, auto-registered modules) | Discouraged | Explicit imports and explicit call sites |
| Circular imports between features | Prohibited | Extract the shared concept or merge |
| Deep imports into another feature's internals | Prohibited | `index.ts` / `server/index.ts` |
| Creating folders, layers, or files "because the structure says so" when they would be empty | Prohibited | Create on first need |
| Copying a pattern from a different stack's contract (a Vite SPA store, a Flask service context) without checking it fits the runtime model here | Discouraged | Apply this folder's rules; adapt deliberately |
