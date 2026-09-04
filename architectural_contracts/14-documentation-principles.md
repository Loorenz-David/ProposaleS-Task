# Documentation Principles

- **Applicability:** ALWAYS for the closeout question; CONDITIONAL for the rest
- **Intent:** Documentation as part of the engineering system: one owner per fact, current-state documents patched in place, impact review after verification.
- **Applies when:** finishing any change; writing or changing the root README, a feature README, an integration README, a plan, an investigation, or a decision record.
- **Does not imply:** rewriting documentation because files changed.
- **Related:** [03-feature-architecture.md](03-feature-architecture.md), [07-integrations.md](07-integrations.md) §10, [01-implementation-contract-guide.md](01-implementation-contract-guide.md)

Documentation is part of the engineering system. It MUST remain synchronized with approved, verified implementation, and it is governed by the same ownership discipline as code: one authoritative home per durable fact, patched in place when the truth changes.

This document governs repository-level documentation, feature documentation, documentation maintenance during implementation, the separation of current truth from planning and history, and documentation ownership. It changes only when documentation *policy* changes (§12), not when product behavior changes.

## 1. Philosophy

- Documentation accumulates **stable knowledge**, not outdated assumptions.
- A document describes the **current approved system** unless it is explicitly an intention, plan, investigation, or decision record.
- Every durable fact has **one obvious authoritative owner** (§4). Other documents link to it.
- Documentation is part of **implementation completion** whenever an implementation changes durable developer knowledge (§8).
- Optimize for correctness, discoverability, progressive disclosure, concise explanation, useful examples, clear ownership, links instead of duplication, synchronization with implementation, and readability by a developer who has never seen the codebase.
- Obsolete behavior is **removed** from current-state documents, not preserved because it used to be true. When implementation supersedes documentation, the authoritative document is patched or consolidated. Historical reasoning goes to a decision record or plan when it is genuinely useful (§7).

## 2. Hierarchy

Progressive disclosure: a developer starts at the root README and navigates toward detail without searching the repository blindly.

```
README.md                                   ← entry point: overview, capabilities, architecture map, setup, run, test, deploy, navigation
    │
    ▼
architectural_contracts/                    ← normative principles and boundaries (this folder)
    │
    ▼
src/features/<feature>/README.md            ← durable feature documentation: what the feature does now
    │
    ▼
src/lib/<system>/README.md                  ← integration documentation: how *we* use an external system
api-documentation/<vendor>/                 ← vendored vendor reference (read-only snapshot, refreshed by script)
    │
    ▼
docs/                                       ← intentions, implementation plans, decisions, investigations
    ├── intentions/<project>.md
    ├── implementation/<project>/            (master plan at root, plans/, prompts/, handoffs/, archive/ — pipeline charter layout)
    ├── decisions/NNNN-<slug>.md
    └── investigations/<topic>.md
    │
    ▼
source code and tests                       ← the final authority on what the code does
```

Rules:

- Each level summarizes the level below and links to it. A level MUST NOT restate substantial content from another level.
- Folders in this hierarchy are created on first need. An empty `docs/decisions/` is not created to look complete; a feature README is not written for a feature that does not exist.
- The `docs/implementation/<project>/` internal layout is owned by the pipeline charter that drives multi-session builds; this contract governs only *where* that folder lives and that its contents are planning artifacts, never current-state documentation.

## 3. Artifact classes

| Class | Answers | Lives in | Describes | May be messy? |
|---|---|---|---|---|
| **Current-state documentation** | What does the approved system do now? | root README, `architectural_contracts/`, feature READMEs, integration READMEs | Verified behavior only | No |
| **Intention** | Why are we building this? | `docs/intentions/` | User need, desired outcome, constraints, product intent | Evolves until resolved |
| **Plan** | What are we proposing to build and how? | `docs/implementation/<project>/` | Sequencing, alternatives, acceptance criteria, unresolved decisions, review logs | Yes, it is a working artifact |
| **Investigation** | What did we observe while trying to understand something? | `docs/investigations/` | Experiments, hypotheses, raw API observations, temporary uncertainty | Yes, during discovery |
| **Decision record (ADR)** | Why did we choose this important direction? | `docs/decisions/` | Context, options, decision, consequences, at the time of deciding | No, but it is frozen once accepted |
| **Vendor reference** | What does the vendor say their system does? | `api-documentation/<vendor>/` | The vendor's own documentation | Never edited by hand, except the folder's own README, which carries the refresh and drift-review rule |

A plan is not documentation of implemented behavior. An intention is not a specification of what was built. An investigation is not a fact sheet until its findings are consolidated into a current-state document.

## 4. Ownership: single source of truth

| Durable knowledge | Authoritative home | Everything else |
|---|---|---|
| How to install, run, test, and deploy | root `README.md` | links |
| Repository structure | root `README.md` (map) and [README.md](README.md) "Repository layout" (contract) | links |
| Environment variables: name, purpose, required, server-only vs public | root `README.md` "Environment", kept consistent with `.env.example` and `src/lib/env/` | links; never a second list |
| Runtime boundaries, feature layout, server/client rules, validation, security | the matching contract in `architectural_contracts/` | links |
| Which contracts apply to a given task, and their applicability | [01-implementation-contract-guide.md](01-implementation-contract-guide.md) | contracts carry a matching applicability block; nothing else lists applicability |
| How agents are made to consult the guide (bootstrap behavior) | `agent-skills/policy/architecture-context-policy.md` | `CLAUDE.md`, `AGENTS.md`, and the two `SKILL.md` adapters only point to it |
| Agent safety and human-in-the-loop principles | [08-agent-architecture.md](08-agent-architecture.md) | feature READMEs state feature-specific invariants and link |
| Persistence rules and the no-database decision | [09-database-and-persistence.md](09-database-and-persistence.md) | links |
| Resolved architecture decisions (summary) | [README.md](README.md) "Resolved decisions" | an ADR only when rationale exceeds a table row; the row links to it |
| How this application uses Proposales (endpoints used, quirks, mappings, error handling) | `src/lib/proposales/README.md` | feature READMEs link; never re-document endpoints |
| What Proposales' API is | `api-documentation/proposales/` | never paraphrased at length elsewhere |
| Refreshing the snapshot and reviewing vendor drift | `api-documentation/proposales/README.md` | integration README links to it |
| The project's working name (Proposal Copilot) | root `README.md` heading | labeling, not an architectural invariant; renamed in place, no aliases or naming history |
| Current behavior of a feature | `src/features/<feature>/README.md` | root README summarizes in one paragraph and links |
| Why a major direction was chosen | `docs/decisions/` | current-state docs state the rule and link |
| Temporary observations | `docs/investigations/` | consolidated into an owner when established |

Prohibited duplicates: commands, environment variable definitions, architecture rules, external API behavior, feature behavior. A document MAY give a one-sentence summary of something owned elsewhere; it MUST link for the rest. Duplication creates drift; drift is a defect.

## 5. Root README contract

The root `README.md` is the primary entry point for technical reviewers, developers unfamiliar with the project, future maintainers, and coding agents. It is a **map** of the repository and the system: it summarizes and links, it does not explain in depth.

It SHOULD contain, where applicable and only when true today:

| Section | Content |
|---|---|
| Name and description | One paragraph. What the system is, for whom. |
| Problem and motivation | Why it exists, in a few sentences. |
| Current capabilities | What works now. Planned work is labeled planned or omitted. |
| User flow | The important lifecycle, as a short diagram. |
| Architecture | The three-sentence architecture, the runtime split, a pointer to `architectural_contracts/`. |
| Important engineering decisions | The few decisions a reviewer must know, each one sentence with a link. |
| Technology stack | Framework, language, validation, testing, hosting. |
| Repository structure | Annotated tree of top-level folders. |
| Local setup, environment, commands | Verified commands only (§10.4); the environment table (§10.5). |
| Testing | How to run each layer, linking to [11-testing-principles.md](11-testing-principles.md). |
| Deployment | How and where it deploys, once it does. |
| External integrations | Named at a high level, linking to `src/lib/<system>/README.md`. |
| Known limitations and current scope | What is deliberately not there. |
| Navigation | Links to the deeper authoritative documents. |

Empty or ceremonial sections are prohibited. The README MUST NOT become an encyclopedia, a changelog, an implementation-detail dump, an API reference, an investigation notebook, a duplicate of architecture documentation, or marketing copy that obscures technical reality.

For review as a take-home: a reviewer should be able to follow problem → solution → current capabilities → user flow → architecture → important decisions → how to run → how to test → where deeper documentation lives, in that order, without the README becoming verbose or defensive. Technical clarity over apparent scale: do not make the project look artificially enterprise-grade.

## 6. Feature documentation contract

### 6.1 Location and scope

Durable feature documentation lives at `src/features/<feature>/README.md`. Rationale: the feature folder is the unit of ownership ([03-feature-architecture.md](03-feature-architecture.md)); a developer opening the folder finds the explanation beside the code, and the document moves, renames, and dies with the feature.

- Every **meaningful, non-trivial** feature SHOULD have exactly one feature README. A feature is meaningful when another developer needs to understand its behavior, states, or invariants to maintain or extend it safely.
- No feature README is required for a button, a component, a styling change, or an implementation detail.
- No feature README is written for a feature that does not yet exist. Planned features are described in `docs/intentions/` and `docs/implementation/`.
- Shared UI primitives (`src/components/ui/`) and cross-cutting libraries (`src/lib/env`, `src/lib/errors`) get a README only when their usage is non-obvious from types and names.

### 6.2 Content

A feature README answers, **where relevant** (omit sections that add nothing):

| Section | Answers |
|---|---|
| Purpose | What problem does this feature solve? |
| Status | `implemented`, `experimental`, or `partial` with what is missing. Use a label only when it adds information; never present planned behavior as implemented. |
| User flow | The important lifecycle, as a concise diagram when useful. |
| Responsibilities | What the feature owns, and what it explicitly does not own. |
| Important states | Meaningful states and transitions, where the feature has them. |
| Invariants | Rules another developer must not accidentally violate, with the *why* when non-obvious. |
| Client/server behavior | Significant runtime-boundary facts specific to this feature. Generic rules are linked, not repeated. |
| Data contracts | Important inputs, outputs, and state, linking to `schemas/` for the definitions. |
| External dependencies | Which systems, linking to `src/lib/<system>/README.md`. |
| Failure behavior | Meaningful failures and recovery a developer must understand. |
| Security and trust | Feature-specific implications only; repository-wide principles are linked. |
| Testing | What behavior matters enough to verify and where those tests are. Not a list of every test file. |
| Limitations and excluded scope | Boundaries that stop a future developer mistaking missing behavior for a bug. |

Example of an invariants section for an agent-driven feature:

```
## Invariants
- Consequential commercial values (prices, recipients, quantities, dates, terms) are never invented by the model;
  each carries provenance from the user or a tool result.
- Human approval precedes every Proposales mutation.
- The approved payload is executed without model reinterpretation.
- Proposales remains authoritative for the proposal's lifecycle after creation.
See architectural_contracts/08-agent-architecture.md §4 and §6 for the general rules.
```

### 6.3 Feature READMEs are current-state documents

A feature README describes **current approved behavior**. When behavior changes, the description is replaced, not appended to.

```
BAD                                              GOOD
Originally the feature did X.                    The feature does Z.
Then it changed to Y.
Update: it now does Z.
```

If the evolution X → Y → Z carries architectural reasoning worth keeping, it goes to a decision record, the implementation plan's review log, or an investigation note. A developer never reconstructs current truth from chronology.

## 7. Intention, planning, investigation, and decision artifacts

### 7.1 Established vs not yet established

Investigation documents MUST separate what is **established** (observed, reproducible, or confirmed by the vendor) from what is **not yet established** (hypothesis, single observation, inference). A hypothesis never becomes a fact by being written down.

When an open question is answered:

1. update the authoritative current-state document (the owner in §4);
2. remove or mark resolved the obsolete TBD wherever it appears;
3. keep the experimental history only if it remains useful, and mark it as history.

Consolidate knowledge; do not accumulate contradictions.

### 7.2 Decision records

Write a decision record only when preserving the rationale has lasting value: a reader a year from now would otherwise reasonably undo the decision. Minor implementation choices belong in the plan's review log, not in an ADR. The [README.md](README.md) "Resolved decisions" table remains the index; a row links to its ADR when one exists.

Format: `docs/decisions/NNNN-<slug>.md` with sections *Context*, *Options considered*, *Decision*, *Consequences*, and a status line (`accepted`, `superseded by NNNN`). Accepted records are not edited; they are superseded.

### 7.3 Precedence

If a plan, intention, or investigation disagrees with a current-state document about **what the system does**, the current-state document plus the code are the truth and the older artifact is stale. If they disagree about **what should be built**, the intention wins over the plan, per the pipeline charter. Neither case is resolved by editing the historical artifact; the current-state owner is patched and the historical artifact is left as history.

## 8. Documentation lifecycle and impact review

```
Intention → Planning → Implementation → Verification → Documentation impact review → Patch authoritative documentation → Feature closeout
```

- Documentation impact review happens **after** the implementation's actual behavior is verified (tests run, behavior observed). Intended behavior is never documented as completed behavior.
- Before closeout, the implementing agent answers one question: **Did this implementation make any durable documentation false, incomplete, or misleading?** If yes, the authoritative document is updated in the same change. If no, documentation is not touched mechanically.

### 8.1 Changes that SHOULD trigger an impact evaluation

New feature or capability · changed user flow · new environment variable · changed setup or command · new external integration · changed integration contract · architecture boundary change · new persistence · authentication or authorization change · deployment change · new agent capability or tool · changed human-in-the-loop behavior · new important limitation · changed business invariant · new developer workflow.

### 8.2 Changes that usually do NOT

Private helper rename · internal refactor preserving behavior · formatting · CSS-only adjustment · test refactoring · internal optimization with no developer-facing implication.

Judgment applies. "Files changed" is not a trigger.

### 8.3 Standard closeout instruction

Implementation prompts SHOULD include this sentence verbatim:

> Before closing implementation, evaluate documentation impact according to `architectural_contracts/14-documentation-principles.md`. Update any authoritative documentation made false, incomplete, or misleading by the verified implementation. Do not modify documentation merely because files changed.

In pipeline-driven builds this step belongs after verification and before the tracker row is marked implemented; the plan's review log records what was evaluated and what was patched, so a reviewer can check the claim.

### 8.4 Documentation closeout checklist

```
Documentation closeout
[ ] Did this change alter documented behavior?
[ ] Is the root README still accurate (capabilities, flow, commands, environment, limitations)?
[ ] Is the feature's README accurate, and does one exist if the feature is now meaningful?
[ ] Did architecture or integration behavior change? Is the owning contract or integration README patched?
[ ] Are diagrams and examples still true?
[ ] Are internal links valid?
[ ] Did planned behavior become implemented? Is it no longer labeled planned anywhere?
[ ] Did an old statement become obsolete? Is it removed, not annotated?
[ ] Did I patch the authoritative source rather than add a copy?
[ ] Did I document a hypothesis as fact?
[ ] Can a developer unfamiliar with this feature understand its important behavior?
```

This is the only documentation checklist in the repository. [13-decision-checklist.md](13-decision-checklist.md) points here rather than repeating it.

## 9. Integration documentation

- Each `src/lib/<system>/` has a `README.md` once the adapter exists. It documents how **this application** uses the system: endpoints used and why, authentication and configuration ownership, known quirks (for Proposales: per-endpoint versions, `company_id` placement, int64 timestamps of observed millisecond scale, error body shape, response keys added without version bumps), mapping decisions, error translation, and retry policy. It links to the vendored reference for the vendor's own documentation.
- `api-documentation/<vendor>/` is a read-only snapshot refreshed by script. Vendor files are never hand-edited and never the place for our interpretation. The folder's own `README.md` is ours: it documents how to refresh and the post-refresh drift review (refresh detects possible contract drift; dependency-aware review decides whether application action is required). See [`api-documentation/proposales/README.md`](../api-documentation/proposales/README.md).
- Feature READMEs name the systems they depend on and link to the integration README. Endpoint documentation is never reproduced across feature documents.
- The root README names major external systems in one line each and links.

## 10. Writing standard

### 10.1 Prose

Meaningful headings, short paragraphs, explicit statements, concrete terminology, examples where they reduce ambiguity, and a one-sentence rationale wherever a future developer might otherwise reasonably make the wrong decision. No filler, no promotional language, no generic framework tutorials, no unnecessary jargon, no duplicated explanations, no prose that merely translates code.

```
GOOD: Proposal creation stays behind explicit human approval because the model may prepare
      commercial data but is not authorized to execute consequential mutations autonomously.
```

### 10.2 Examples

Include examples when they materially reduce ambiguity: request and response shapes, environment configuration, folder structures, commands, lifecycle diagrams, agent tool inputs, failure scenarios. Every example MUST match verified current behavior, contain no real secrets, avoid real personal or customer data, stay minimal, and demonstrate intended use. An incorrect example is a documentation defect.

### 10.3 Diagrams

Use a diagram when it shows a relationship more clearly than prose. Prefer concise ASCII or text diagrams; Mermaid MAY be used where the rendering context supports it. A diagram shows actual architecture or behavior, never decoration. When the represented behavior changes, the diagram changes in the same commit.

### 10.4 Commands

A documented command MUST exist in the repository at the time of writing. Before documenting `npm install`, `npm run dev`, `npm test`, `npm run test:e2e`, `npm run lint`, or `npm run build`, verify the script in `package.json`. Conventional commands are not invented. If a command must run from a particular directory, say so. Today the only runnable command in this repository is `./scripts/update-proposales-api-docs.sh`.

### 10.5 Environment variables

The root README carries one table: name, purpose, required or optional, **server-only secret** vs **server-only configuration** vs **public (`NEXT_PUBLIC_*`)**, and a safe example value. It MUST agree with `.env.example` and the schema in `src/lib/env/`, and with the rules in [02-runtime-boundaries.md](02-runtime-boundaries.md) §8 and [10-security-and-trust-boundaries.md](10-security-and-trust-boundaries.md) §2. Real credentials never appear anywhere.

### 10.6 Links

All links are relative repository links. The root README links down; feature READMEs link to contracts and integration READMEs instead of copying them; contracts link sideways to related contracts. Ownership must stay clear: no circular chain in which two documents each defer to the other for the same fact. A broken link is a defect and is checked at closeout.

### 10.7 Code comments vs documentation

| Documentation explains | Comments explain |
|---|---|
| architecture, behavior, developer workflows, integration contracts, feature invariants, non-obvious system decisions | local non-obvious constraints, unusual implementation reasoning, edge cases, invariants that structure and naming cannot make obvious |

Comments do not compensate for unclear architecture, and README paragraphs are not pasted into source files.

## 11. Constraints on agent-written documentation

Coding agents maintain this repository. An agent MUST NOT:

- document an unimplemented feature as implemented, or intended architecture as actual architecture;
- invent environment variables, commands, or scripts;
- claim tests passed without running them, or that deployment works without evidence;
- present guessed third-party API behavior as fact;
- add generic Next.js or AI explanations unrelated to this repository;
- leave stale documentation after changing established behavior.

Every documentation claim is grounded in one of: verified implementation, repository configuration, an established architecture decision, verified external behavior, or a clearly marked plan or TBD. When grounding is missing, the claim is written as a TBD or an investigation note, not as fact.

## 12. Maintenance rhythms

| Rhythm | Documents | Trigger |
|---|---|---|
| Frequently updated current-state documentation | root README, feature READMEs, integration READMEs, setup and configuration, architecture facts affected by approved changes | Any verified implementation that changes durable developer knowledge (§8) |
| Rarely updated governance | this document, [01-implementation-contract-guide.md](01-implementation-contract-guide.md) | Only when documentation policy, hierarchy, ownership model, maintenance process, or the set and applicability of contracts changes |

Product changes update the documentation this contract governs. Policy changes update this contract. The two are never mixed in one edit.
