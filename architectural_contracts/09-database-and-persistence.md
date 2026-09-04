# Database and Persistence

- **Applicability:** CONDITIONAL
- **Intent:** Record that there is no application database, and govern how application-owned persistence would be introduced.
- **Applies when:** introducing durable application-owned state; adding database access, an ORM, migrations, durable idempotency, or workflow/audit records; being tempted to cache or mirror Proposales data.
- **Does not imply:** the application requires or should get a database. The feature requirement must justify persistence first; this contract governs only how.
- **Related:** [04-server-architecture.md](04-server-architecture.md), [06-data-contracts-and-validation.md](06-data-contracts-and-validation.md), [10-security-and-trust-boundaries.md](10-security-and-trust-boundaries.md), [11-testing-principles.md](11-testing-principles.md)

The current application has **no application database**. That is a deliberate decision, not an omission. This document records why, what the application relies on instead, and the contract any future feature MUST follow if it introduces application-owned persistence.

It does not prescribe a database, client, or ORM. It exists so that selection can happen later, against real requirements, without the decision being made by accident inside a feature.

## 1. Current decision: no application database

Proposal Copilot (the MVP) relies on:

- **Browser and application state** for transient work: a brief being entered, an agent-prepared proposal under review, corrections before approval, the in-flight status of a mutation.
- **Proposales as the system of record** for every proposal, proposal version, and content-library resource the application creates or reads.
- **Stable correlation metadata** where useful: a `generation_id` attached to a created proposal through Proposales' app-owned `data` metadata, which runtime testing confirmed is filterable through `/v3/proposal-search`, so a creation can later be recognized ([04-server-architecture.md](04-server-architecture.md) §8). This is duplicate detection, not exactly-once execution; §11 governs the durable form if it is ever required.

The following MUST NOT be added unless a future approved requirement establishes a persistence need through the decision record in §14: PostgreSQL, SQLite, Redis, any ORM, migration tooling, or a hosted database service.

Rationale: the product's durable state already lives in Proposales. Introducing storage now would create a second source of truth with no owner, consistency rules, or operational plan.

## 2. Core principle

Persistence is infrastructure that serves domain and application requirements. **The database MUST NOT become the architecture.** Application and domain logic MUST remain understandable and testable without knowledge of storage mechanics. A reader of a service should be able to tell what business decision it makes before caring where its data is kept.

## 3. When persistence is justified

A database SHOULD be introduced only when application-owned state must survive beyond a request or browser session **and** cannot appropriately live in an external system of record.

Examples that can justify persistence:

- durable user-owned drafts;
- authentication or session data;
- multi-user or multi-tenant state, tenant configuration;
- durable approval and execution records required by product, security, or compliance;
- workflow state that must survive restarts;
- audit or history requirements;
- scheduled or background work;
- application-specific data Proposales does not own;
- reliable cross-request idempotency state;
- analytics or events that genuinely belong to this product.

Examples that do **not** by themselves justify a database:

- storing secrets;
- mirroring the Proposales API;
- caching without a demonstrated need;
- storing state "because it might be useful later";
- persisting temporary UI state;
- adopting an ORM because it is conventional;
- keeping local copies of external resources without ownership or consistency rules.

## 4. Data ownership

Every persisted model MUST have an explicit owner. Distinguish **application-owned data** from **external-system-owned data**:

| Proposal Copilot may own | Proposales owns |
|---|---|
| generation and approval metadata | the proposal resource and its versions |
| app-specific workflow records | proposal lifecycle and status |
| correlation identifiers | content-library resources |

Shadow copies of external entities are prohibited without a documented reason. When external data is stored or referenced, the model MUST state which of these it is:

| Mode | Meaning | Consistency rule required |
|---|---|---|
| **External id only** | The application stores the identifier and reads the entity from the external system when needed | None beyond id validity |
| **Snapshot** | A point-in-time copy for record-keeping; never updated | State what moment it captures and that it may diverge |
| **Cache** | A copy with a TTL or invalidation rule, never authoritative | State the invalidation rule |
| **Denormalized projection** | Selected fields kept for querying or display, refreshed by a defined process | State the refresh trigger and staleness tolerance |
| **Authoritative local copy** | The application, not the external system, is the source of truth | Requires an explicit decision that the external system is subordinate |

Default is **external id only**.

## 5. Layer boundaries

```
UI
 ↓
application / service layer
 ↓
domain rules
 ↓
repository / persistence port        (interface owned by the feature or by src/lib/db)
 ↓
database adapter                     (server-only; the only code that knows the client or ORM)
 ↓
database
```

Rules:

- Business logic MUST NOT be embedded in queries, ORM models, or Route Handlers unless the rule is intrinsically a storage invariant (uniqueness, referential integrity).
- Route Handlers, Server Actions, and React components MUST NOT perform database access. Services call explicit persistence functions.
- Location, when introduced: the client or adapter lives in `src/lib/db/` (`server-only`, configuration read from `src/lib/env/server.ts`); persistence functions or repository ports for a feature live in `features/<x>/server/persistence/`. See [03-feature-architecture.md](03-feature-architecture.md) §3.
- Do not build a generic repository abstraction for a single trivial table. A module of named functions (`saveGeneration`, `findGenerationById`) is enough. Once multiple features depend on persistence behavior, ownership and boundaries MUST remain clear and a port interface with a test double becomes justified.
- Agent tools never reach the persistence layer directly; they call services (§13).

## 6. Storage models vs domain models

An ORM entity or a row type is not automatically the application's domain model. Separate storage representation from application representation when they have different responsibilities:

```
database row  ──(mapper)──▶  application entity
```

Separation is appropriate when storage naming differs from domain naming, nullable storage columns differ from domain invariants, persistence metadata (version columns, soft-delete flags) must not leak into business logic, or domain values need transformation (money objects, branded ids). When none of these apply, use the row type directly; mapping layers added mechanically are prohibited. The same rule that governs external API shapes in [06-data-contracts-and-validation.md](06-data-contracts-and-validation.md) §7 applies here.

## 7. Schema evolution and migrations

If a relational database is introduced:

- Schema changes MUST be expressed as committed migrations. Production schema MUST NOT depend on ORM auto-sync or "push" behavior.
- Migrations MUST be deterministic and reviewable in a diff.
- Destructive migrations (drop, narrow, rename) require explicit consideration of existing data in the pull request.
- Backfills SHOULD be separate from schema changes when operational risk justifies it.
- Migrations applied to a shared environment MUST NOT be rewritten unless the migration tool explicitly supports that workflow.
- Development convenience MUST NOT weaken production discipline: a local auto-sync mode, if used at all, never runs against a shared environment.

## 8. Identifiers

Do not overload one identifier with several meanings. Keep these distinct:

| Identifier | Role | Example column |
|---|---|---|
| application primary key | row identity, application-owned | `id` |
| public identifier | what the UI or URLs expose, if different from the primary key | `public_id` |
| external-system identifier | reference into the system of record | `proposal_uuid`, `series_uuid`, `company_id` |
| correlation identifier | ties a workflow across systems and requests | `generation_id` |

Proposales identifiers are stored explicitly under their own names and typed with the same branded types used in the integration module ([06-data-contracts-and-validation.md](06-data-contracts-and-validation.md) §6). A proposal uuid is never stored in a column called `external_id` "for flexibility".

## 9. Timestamps

- Timestamp semantics MUST be explicit. Store application timestamps in the normalized representation appropriate to the chosen database and runtime (for most relational databases, a timezone-aware type in UTC).
- External timestamps are normalized at the integration boundary before persistence. Ambiguous third-party units never reach a table; the Proposales adapter owns that conversion ([06-data-contracts-and-validation.md](06-data-contracts-and-validation.md) §6).
- Keep created time, updated time, external status-change time, approval time, and execution time as distinct columns when those concepts matter to the product. Do not add `created_at`/`updated_at` to every table by reflex; add them where they answer a question someone will ask.

## 10. Transactions and consistency with external systems

- Use a transaction when multiple writes must succeed or fail together to preserve an invariant: an approval state transition plus its execution record, consuming an idempotency token while recording the resulting mutation, updating related rows that must stay consistent.
- Do not wrap every operation in a transaction as ceremony.
- **An external API call is never part of a database transaction.** A workflow that touches both the database and Proposales MUST document its consistency strategy explicitly. Acceptable strategies include: an explicit state machine with `pending` / `executed` / `failed` states, retryable jobs, reconciliation against the external system, and idempotent operations. Claiming distributed atomicity is prohibited.

Typical shape for a consequential mutation, when durable records exist:

```
1. write: execution record  status = pending          (transaction A)
2. call:  Proposales create                            (no transaction; may time out with unknown outcome)
3. write: execution record  status = executed | failed, external uuid  (transaction B)
4. on unknown outcome: reconcile by searching Proposales for the generation_id before retrying
```

## 11. Idempotency and duplicate protection

If durable persistence is later introduced for idempotency, use a stable application-level correlation identifier:

```
generation_id → approved mutation → execution record → external proposal uuid
```

The system must then be able to distinguish **never attempted**, **currently executing**, **successfully executed**, and **failed / retryable**, enforced by a unique constraint on the correlation identifier rather than by application code alone. Exactly-once claims without a mechanism are prohibited; design for detectable and retry-safe behavior. Until such persistence exists, the MVP rules in [04-server-architecture.md](04-server-architecture.md) §8 apply.

## 12. Concurrency, constraints, and integrity

- Any persisted mutable state MUST state its concurrency expectation: which race is possible and what prevents it. Mechanisms include unique constraints, transactions, optimistic version columns, row locks, and idempotency keys. Choose by the invariant; do not add locking without naming the race.
- Database constraints (NOT NULL, unique, foreign keys, uniqueness boundaries such as "one execution record per generation") SHOULD protect critical invariants at the storage layer where practical.
- Zod and application validation remain necessary. Constraints and validation are complementary, not substitutes: validation gives good errors, constraints give guarantees under concurrency.

## 13. Secrets, minimization, logging, and agent access

- **Secrets**: deployment secrets (Proposales API key, model provider key) remain server-side configuration and are never stored in ordinary tables. If user-provided third-party credentials are ever stored, encryption at rest, access control, key management, rotation, and logging restrictions MUST be designed first as their own decision.
- **Data minimization**: persist only what the product requires. Full prompts, full model transcripts, raw external payloads, tool-call histories, and personal data are not stored by default. If required, the decision record states why, the retention period, and the privacy and security implications.
- **Logging is not persistence**: application logs are not a substitute for durable business records, and tables are not a substitute for structured logs. Keep operational logs, audit records, domain history, and analytics events distinct in both purpose and storage.
- **Agent tools**: the model never receives database access. Tools expose domain capabilities (`get_approved_draft`, `find_generation`, `list_relevant_proposals`) that call services; tools such as `execute_sql` or `query_database` are prohibited. Least capability per [08-agent-architecture.md](08-agent-architecture.md) §3.

## 14. Persistence decision record

The first feature that genuinely requires a database MUST document the decision before implementation, and the decision MUST be linked from the [README.md](README.md) "Resolved decisions" table. The record states:

1. why persistence is required;
2. what data the application owns;
3. why the external system cannot own it;
4. required durability;
5. required consistency;
6. expected access patterns;
7. concurrency requirements;
8. retention and security considerations;
9. chosen database;
10. chosen client or ORM;
11. Vercel and runtime implications (§15);
12. migration strategy;
13. local, test, and production database strategy, environment configuration, migration execution, and backup/restore expectations where appropriate.

Persistence introduced incidentally inside a feature change, without this record, is rejected in review.

## 15. Serverless and Vercel considerations

Any database decision MUST be evaluated against the deployed runtime, not a long-running Node server. Before selecting a database or client, verify: runtime compatibility (Node vs Edge), connection behavior per invocation, serverless connection limits and pooling requirements, transaction support through the chosen driver or pooler, the deployment environment's networking, and how migrations execute in CI or deploy. A configuration copied from a traditional server deployment is not acceptable evidence.

No provider is selected now. That is the point of this document.

## 16. Testing persistence

If a database is introduced, tests MUST cover persistence mappings, database constraints, repository or persistence-function behavior where relied upon, migration correctness for significant schema changes, transaction-sensitive invariants, and idempotency and concurrency behavior where it matters. Pure domain and application logic remains testable without a live database. Do not mock storage so heavily that the behavior the application relies on (constraints, uniqueness, transactions) is never exercised. Tooling per [11-testing-principles.md](11-testing-principles.md).
