# Implementation Contract Guide

**Role:** the routing layer between an implementation intent and this repository's normative engineering contracts. Read this first; it tells you which contracts to read next. Agents reach this guide through the Architecture Context policy (`agent-skills/policy/architecture-context-policy.md`), which `CLAUDE.md` and `AGENTS.md` invoke on every run; the policy owns *when* to route, this guide owns *where*. It is a set of descriptions and decision rules for a coding agent, planner, or reviewer. It performs no automatic retrieval, injection, or enforcement.

The [README.md](README.md) is the human-readable map and holds precedence, scaffold decisions, and resolved decisions. This guide is the operational counterpart: how to go from "what am I changing" to "which contracts govern that change".

## 1. Core principle

**Load architectural context by applicability, not by reading everything.** Every contract in this folder constrains decisions in its concern. None of them creates a requirement by existing.

Reading a contract does not imply introducing the capability it governs:

| Reading | Does not mean |
|---|---|
| [database-and-persistence.md](database-and-persistence.md) | adding a database |
| [agent-architecture.md](agent-architecture.md) | every feature needs an LLM |
| [security-and-trust-boundaries.md](security-and-trust-boundaries.md) | adding authentication |
| [testing-principles.md](testing-principles.md) | every change needs a Playwright test |
| [integrations.md](integrations.md) | adding abstraction layers without a real boundary |

The target is **minimum sufficient authoritative context**: not the whole corpus by default, and never less than what clearly applies. Context efficiency is not a reason to skip an applicable contract.

## 2. Protocol

Apply before planning, before implementing, and (in reverse, §8) before reviewing.

1. Understand the requested intention and the expected behavior.
2. Read this guide.
3. Classify the task by the concerns it touches (§4).
4. Identify the applicable contracts (§4, §5). Add the current feature's README if the feature exists (§7).
5. Read those contracts, and only the sections relevant to the task, before producing a plan.
6. Treat applicable MUST statements as constraints and SHOULD statements as defaults; deviate from a SHOULD only for a concrete, stated reason.
7. Do not import capabilities or infrastructure because a contract exists for them.
8. If applicable contracts conflict with each other, with the approved intention, or with existing code, surface the conflict before implementing (§6).
9. Implement, then verify actual behavior.
10. Run the documentation impact question from [documentation-principles.md](documentation-principles.md) §8 before closeout.

## 3. Applicability vocabulary

Three labels, used in the entries below and at the top of each contract:

| Label | Meaning |
|---|---|
| **ALWAYS** | Nearly every meaningful change consults it, at least the relevant section. |
| **CROSS-CUTTING** | Relevant across many kinds of change; check whether the task touches its concern. |
| **CONDITIONAL** | Relevant only when a specific concern is touched. |

## 4. Routing table

Routing is many-to-many: one change usually touches several concerns, and one concern is often governed by more than one contract.

| Task involves | Read |
|---|---|
| React components, hooks, forms, view state, loading/error/retry UI, accessibility | [client-architecture.md](client-architecture.md) |
| Where a file runs: Server vs Client Components, `"use client"`, `server-only`, `"use server"`, what crosses the boundary, env vars | [runtime-boundaries.md](runtime-boundaries.md) |
| Route Handlers, Server Actions, services, domain rules, error taxonomy, idempotency, deterministic mutation | [server-architecture.md](server-architecture.md) + [runtime-boundaries.md](runtime-boundaries.md) |
| Creating or reorganizing a feature, deciding where a module lives, cross-feature imports | [feature-architecture.md](feature-architecture.md) |
| Zod schemas, parsing input, DTO shapes, money, dates, enums, ids, mapping wire shapes to domain shapes | [data-contracts-and-validation.md](data-contracts-and-validation.md) |
| Proposales, the AI provider, any external HTTP, webhooks, retries, timeouts, error translation | [integrations.md](integrations.md) |
| LLM reasoning, prompts, tools, prepared actions, approval, human-in-the-loop, provider adapter | [agent-architecture.md](agent-architecture.md) |
| Secrets, authorization, trust of inputs, logging, SSRF, redirects, dependencies, least capability | [security-and-trust-boundaries.md](security-and-trust-boundaries.md) |
| Durable application-owned state, database, ORM, migrations, durable idempotency or audit records | [database-and-persistence.md](database-and-persistence.md) |
| What to test, at which layer, with which tool; agent evals | [testing-principles.md](testing-principles.md) |
| Root README, feature README, integration README, plans vs current-state docs, closeout | [documentation-principles.md](documentation-principles.md) |
| Any new file, dependency, or feature (pre-work questions) | [decision-checklist.md](decision-checklist.md) |
| Any meaningful change (what reviewers reject) | [anti-patterns.md](anti-patterns.md), the sections matching the concerns above |

Example of overlap: adding `POST /api/proposals` involves server-architecture (thin handler, service, errors), runtime-boundaries (`server-only`, serialization), data-contracts-and-validation (input schema, DTO), security-and-trust-boundaries (untrusted input, scope), integrations (the Proposales call), and testing-principles (boundary and service tests). It does not involve database-and-persistence unless it stores application-owned state.

## 5. Contract entries

### Runtime Boundaries
- **Contract:** [runtime-boundaries.md](runtime-boundaries.md) · **CROSS-CUTTING**
- **Intent:** Keep browser and server runtimes explicit and defensible; define what may cross between them.
- **Read when:** creating any file that could be reached from a `"use client"` graph; adding `"use client"`, `server-only`, or `"use server"`; passing data between server and client; reading environment variables; choosing Node vs Edge.
- **Governs:** directive placement, import reachability, serialization rules, env access, secret placement.
- **Does not imply:** that every component must be a Client Component, or that every module needs a directive.
- **Related:** feature-architecture, server-architecture, security-and-trust-boundaries.

### Feature Architecture
- **Contract:** [feature-architecture.md](feature-architecture.md) · **CROSS-CUTTING**
- **Intent:** Organize code by feature with explicit runtime folders and a downward dependency direction.
- **Read when:** creating a feature; adding a folder; deciding whether code goes in a feature, `src/lib/`, or `src/components/ui/`; importing across features.
- **Governs:** folder responsibilities, dependency direction, prohibited imports, when to split or merge features, where integrations live.
- **Does not imply:** creating every listed folder; a feature has only the folders it uses.
- **Related:** runtime-boundaries, documentation-principles (feature README).

### Server Architecture
- **Contract:** [server-architecture.md](server-architecture.md) · **CONDITIONAL**
- **Intent:** Keep transport thin and put authority in services and domain rules, with a shared error taxonomy.
- **Read when:** adding or changing a Route Handler, Server Action, service, domain rule, or error; designing a mutation; handling repeats and retries.
- **Governs:** layer order, entry-point validation, `AppError` codes and HTTP mapping, idempotency approach, deterministic execution after approval.
- **Does not imply:** that a feature needs a Route Handler (Server Actions are the default for the app's own UI) or a `domain/` folder without a rule.
- **Related:** runtime-boundaries, data-contracts-and-validation, integrations, agent-architecture.

### Client Architecture
- **Contract:** [client-architecture.md](client-architecture.md) · **CONDITIONAL**
- **Intent:** Keep components declarative, orchestration in hooks, and authority off the client.
- **Read when:** adding or changing components, hooks, forms, async state, error and loading rendering, interaction or accessibility behavior.
- **Governs:** component vs hook responsibilities, flow-state unions, local vs server-authoritative vs transient state, UX-only validation, accessibility rules.
- **Does not imply:** a data-fetching or state library; none is part of the contract.
- **Related:** runtime-boundaries, data-contracts-and-validation, agent-architecture (rendering prepared actions).

### Data Contracts and Validation
- **Contract:** [data-contracts-and-validation.md](data-contracts-and-validation.md) · **CROSS-CUTTING**
- **Intent:** Runtime validation at every trust boundary; schemas are the source of truth for types.
- **Read when:** data enters from the browser, a model, an external API, a webhook, storage, or env; defining a DTO; handling money, dates, enums, ids, nullable or unknown fields; mapping wire shapes.
- **Governs:** where `parse` happens, schema location and naming, strip vs strict, value-kind rules, domain vs external representation.
- **Does not imply:** wrapping purely internal function calls in schemas.
- **Related:** server-architecture, integrations, agent-architecture, security-and-trust-boundaries.

### Integrations
- **Contract:** [integrations.md](integrations.md) · **CONDITIONAL**
- **Intent:** One server-only client module per external system owns auth, HTTP, validation, mapping, and error translation.
- **Read when:** calling Proposales or the AI provider; adding any external HTTP; receiving a webhook; changing retry, timeout, or error behavior of an adapter; adding a new external system.
- **Governs:** module layout, what the client hides, response validation, error translation, retries and timeouts, configuration ownership, integration README.
- **Does not imply:** wrapping unused endpoints or adding adapters for systems the application does not call.
- **Related:** server-architecture, data-contracts-and-validation, security-and-trust-boundaries, agent-architecture (tools call clients).

### Agent Architecture
- **Contract:** [agent-architecture.md](agent-architecture.md) · **CONDITIONAL**
- **Intent:** Server-only agents with explicit, kinded tools; consequential mutations pass through human approval and execute deterministically.
- **Read when:** adding or changing prompts, tools, agent runs, prepared actions, approval or execution flows, provider usage, or UI that renders model output.
- **Governs:** tool contract and kinds, consequential fields and provenance, clarification, the HITL lifecycle, prompt rules, provider independence, run budgets.
- **Does not imply:** that a feature involves a model, or that durable audit storage is required.
- **Related:** server-architecture, integrations, security-and-trust-boundaries, database-and-persistence (only if durable records are introduced).

### Database and Persistence
- **Contract:** [database-and-persistence.md](database-and-persistence.md) · **CONDITIONAL**
- **Intent:** Record that there is no application database, and govern how application-owned persistence would be introduced.
- **Read when:** introducing durable application-owned state; adding database access, an ORM, migrations, durable idempotency, or workflow/audit records; being tempted to cache or mirror Proposales data.
- **Governs:** justification, data ownership modes, layer boundaries, migrations, identifiers, timestamps, transactions and consistency with Proposales, concurrency, secrets, minimization, agent access, the decision record, serverless constraints.
- **Does not imply:** that the application requires or should get a database. The feature requirement must justify persistence first; this contract only governs how.
- **Related:** server-architecture, data-contracts-and-validation, security-and-trust-boundaries, testing-principles.

### Security and Trust Boundaries
- **Contract:** [security-and-trust-boundaries.md](security-and-trust-boundaries.md) · **CROSS-CUTTING**
- **Intent:** State what is trusted and the rules that follow: secrets server-side, authorization server-side, untrusted inputs parsed, least capability.
- **Read when:** handling any input from browser, model, external API, or webhook; touching secrets or env; adding an endpoint, tool, redirect, log line, or dependency; scoping an operation.
- **Governs:** trust table, secret handling, authorization placement, logging redaction, SSRF and injection, tool capability, redirects, dependencies, headers.
- **Does not imply:** adding authentication; the application has none by decision.
- **Related:** runtime-boundaries, data-contracts-and-validation, agent-architecture, integrations.

### Testing Principles
- **Contract:** [testing-principles.md](testing-principles.md) · **CROSS-CUTTING**
- **Intent:** Test each layer at the lowest layer that can prove it; Vitest below the browser, Playwright for critical flows.
- **Read when:** deciding what to test and where; adding tests for a schema, service, adapter, handler, component, or agent; changing a critical flow.
- **Governs:** test layers, what each must prove, doubles, agent tests and evals, rules on real systems.
- **Does not imply:** that every change needs a Playwright test or that coverage numbers are a target.
- **Related:** every contract whose layer is being tested.

### Documentation Principles
- **Contract:** [documentation-principles.md](documentation-principles.md) · **ALWAYS** (the closeout question), CONDITIONAL for the rest
- **Intent:** Documentation as part of the engineering system: one owner per fact, current-state documents patched in place, impact review after verification.
- **Read when:** finishing any change (closeout question); writing or changing the root README, a feature README, an integration README, a plan, an investigation, or a decision record.
- **Governs:** hierarchy, artifact classes and authority, ownership table, README and feature README contracts, closeout checklist, writing standard, agent constraints.
- **Does not imply:** rewriting documentation because files changed.
- **Related:** feature-architecture, integrations, this guide (§7, §9).

### Decision Checklist
- **Contract:** [decision-checklist.md](decision-checklist.md) · **ALWAYS**
- **Intent:** The questions to answer before adding a file, dependency, or feature, plus naming and dependency-direction summaries.
- **Read when:** before creating anything; when unsure which layer a piece of logic belongs to.
- **Governs:** nothing new; it routes to the contracts above and makes their questions explicit.
- **Related:** all.

### Anti-Patterns
- **Contract:** [anti-patterns.md](anti-patterns.md) · **ALWAYS** (the sections matching the task's concerns)
- **Intent:** What reviewers reject, with the replacement for each.
- **Read when:** planning and reviewing any meaningful change; read the sections for the concerns touched, not the whole file.
- **Governs:** nothing new; it is the negative image of the contracts above.
- **Related:** all.

## 6. Conflicts and precedence

Precedence is defined once, in [README.md](README.md) "Precedence": intentional, documented feature overrides win; otherwise the contracts apply; the contract wins over existing code for new work; the more specific contract wins between two contracts and the disagreement is fixed in the same change.

What to do when something does not line up:

| Situation | Action |
|---|---|
| Two applicable contracts appear inconsistent | Apply the more specific one, and fix the inconsistency in the same change or report it if the fix is out of scope. Do not pick silently. |
| The approved intention conflicts with a MUST | Stop and surface it. Either the intention records an explicit, reasoned override in its plan, or the intention changes. Never weaken the contract to fit. |
| Existing code contradicts a contract | Existing code is evidence of current behavior, not authority. Decide which of three cases applies: the code is legacy or debt (follow the contract for new work, record the conflict in README "Known conflicts"); the contract is stale (patch the contract in its own change, with rationale); or the requested change intentionally alters the architecture (record the decision). Do not copy the inconsistency forward. |
| A contract appears stale or wrong | Report it with the evidence. Patch it in a dedicated change, not as a side effect of feature work. |

Never silently choose, silently weaken, or silently normalize.

## 7. Context sources and their authority

Contracts explain **how** the system must be built. Feature documentation explains **what** a feature currently does. The approved intention explains **what should change**. Implementation context is the combination:

```
applicable architecture contracts  +  current feature README  +  approved intention  →  implementation context
```

Authority of each artifact class, using the terms from [documentation-principles.md](documentation-principles.md) §3:

| Artifact | Authority |
|---|---|
| Architecture contract (this folder) | Normative engineering constraint. |
| Feature README (`src/features/<feature>/README.md`) | Authoritative description of current approved feature behavior. Never overrides a contract. |
| Integration README (`src/lib/<system>/README.md`) | Authoritative description of how this application uses an external system. |
| Approved intention (`docs/intentions/`) | Authoritative desired outcome for the current change. |
| Implementation plan (`docs/implementation/<project>/`) | Proposed execution strategy, subordinate to intention and contracts. Not evidence of implemented behavior. |
| Investigation (`docs/investigations/`) | Evidence and findings; may hold unresolved or superseded hypotheses. Check "established" vs "not yet established". |
| Decision record (`docs/decisions/`) | Historical rationale. Useful for *why*; the current rule is still the contract. |
| Vendor reference (`api-documentation/`) | The vendor's own statements. Not our interpretation. |

When modifying an existing feature: check whether it has a README; read it as current feature context; combine with the applicable contracts and the intention; after verified implementation, update the README if its current truth changed.

## 8. Using the guide by role

- **Planning.** A plan is architecture-aware only when it lists its applicable contracts by filename (an `Applicable contracts` section) and its tasks and acceptance criteria visibly incorporate their relevant MUSTs. The plan does not reproduce the contracts.
- **Implementation.** Follow §2. Read the plan's applicable-contracts list, add any the plan missed, and say so in the review log.
- **Review.** Run the protocol in reverse: from the diff, identify the concerns changed, route to the contracts, and review against them. A review that cites no contract for a boundary-touching change is incomplete.
- **Refactoring.** The same routing applies; a refactor that preserves behavior still has to respect boundary contracts and may still change durable documentation (rarely).
- **Closeout.** Verified implementation → "could durable documentation now be false or incomplete?" → yes: apply [documentation-principles.md](documentation-principles.md) §8; no: no mechanical rewrite.

## 9. Scoping: prevent over-application

Applicability is scoped to the concern being changed, not to the feature as a whole.

A feature with a React form, a Server Action, an agent, and a Proposales mutation plausibly needs client-architecture, runtime-boundaries, server-architecture, data-contracts-and-validation, agent-architecture, integrations, security-and-trust-boundaries, testing-principles, and documentation-principles. It does not need database-and-persistence unless it stores application-owned durable state.

A CSS-only change to one component needs client-architecture (accessibility and state rendering rules) and the closeout question. It does not need the rest of the corpus.

## 10. Routing scenarios

**A. Add a proposal-generation agent.** Concerns: feature organization, client interaction (brief entry, review UI), server authority (prepare, approve, execute), runtime placement, schemas for inputs, prepared actions and DTOs, tools and HITL, the Proposales call, trust of model output, tests and evals, feature README. Read: feature-architecture, client-architecture, runtime-boundaries, server-architecture, data-contracts-and-validation, agent-architecture, integrations, security-and-trust-boundaries, testing-principles, documentation-principles. Not database-and-persistence: prepared state is transient by decision.

**B. Introduce application persistence later.** Concerns: persistence justification and ownership, service and persistence layering, storage vs domain shapes, secrets and minimization, tests against real constraints, serverless runtime, decision record and documentation. Read: database-and-persistence first, then server-architecture, data-contracts-and-validation, security-and-trust-boundaries, testing-principles, runtime-boundaries (deployment implications), documentation-principles. The contract's applicability does not justify the database; the feature requirement and the §14 decision record must.

**C. Adjust a component's visual layout.** Read: client-architecture (interaction, accessibility, state rendering). Then the closeout question; the feature README changes only if documented behavior changed. Do not load persistence, agent, or integration contracts.

**D. Change the Proposales adapter (new endpoint, changed mapping).** Concerns: adapter layout and error translation, wire vs domain shapes, timestamp and money handling, secrets and scope, fixture-based tests, integration README. Read: integrations, data-contracts-and-validation, server-architecture (error taxonomy, idempotency if a write), security-and-trust-boundaries, testing-principles, documentation-principles (integration README, vendor reference untouched).

These show routing, not implementation.

## 11. Maintaining this guide

This guide is infrastructure for agents. It changes when a contract is added, removed, or renamed; when a contract's applicability changes; when precedence changes; or when the implementation lifecycle changes. It does not change when a feature is implemented; feature truth belongs in feature READMEs. When a contract is added, add its entry here, its row in the routing table, and its applicability block at the top of the contract, in the same change.
