# Design Prototype Porting

- **Applicability:** CONDITIONAL
- **Intent:** Turn an external interactive prototype into production code without letting the prototype become the architecture.
- **Applies when:** porting UI from an external prototype (Claude Design canvas, a generated app, a spike, a design tool export); replacing a mock adapter with a real service; deciding whether a concept the prototype invented is real.
- **Does not imply:** that a prototype must be rebuilt from scratch, or that its product decisions are up for re-litigation.
- **Related:** [05-client-architecture.md](05-client-architecture.md), [15-ui-styling-and-component-system.md](15-ui-styling-and-component-system.md), [03-feature-architecture.md](03-feature-architecture.md), [06-data-contracts-and-validation.md](06-data-contracts-and-validation.md)

An interactive prototype is a **real source**, not a screenshot. It encodes layout, interaction behavior, and product decisions that were made deliberately and are expensive to rediscover. It is also, by construction, written without this folder's constraints.

> **A prototype is evidence of what the product should do. It is never authority over how the system is built.**

## 1. The two directions of authority

| The prototype is authoritative for | The prototype is *not* authoritative for |
|---|---|
| Visual hierarchy, layout, spacing rhythm, density | Styling mechanism ([15](15-ui-styling-and-component-system.md)) |
| Interaction behavior: what happens on click, drag, submit, cancel | Where that behavior lives in code ([05](05-client-architecture.md)) |
| Discovered state transitions and edge cases the prototype had to solve | The shape and ownership of state ([05](05-client-architecture.md) §5) |
| Information architecture: panels, tabs, ordering, disclosure | Data shapes, DTOs, schemas ([06](06-data-contracts-and-validation.md)) |
| Copy, labels, empty states, affordances | Anything server-side, privileged, or consequential |

Two failure modes are equally prohibited:

- **Copying the prototype's architecture forward** — porting a monolithic component, its mock data layer, or its ad-hoc state object into `src/` because it works.
- **Redesigning the product during the port** — changing layout, flow, or behavior because the implementation conventions changed. A visual or behavioral change during a port is a product decision and needs the owner, not a refactor rationale.

## 2. Port protocol

Per screen or coherent surface, in order:

1. **Inventory.** List the prototype's components, interaction rules, state transitions, and design constants for that surface.
2. **Classify every piece of state** (§3). This happens before any code is written; it is the step that decides the whole port.
3. **Map to contracts.** Which feature owns this surface; what is a Server Component and what is a client island ([02](02-runtime-boundaries.md) §1–§2); which behavior is a hook, which is a store ([05](05-client-architecture.md) §3, §5); which values are already typed by a feature schema ([06](06-data-contracts-and-validation.md)).
4. **Preserve the product decisions.** Layout, hierarchy, interaction, and copy carry over unchanged unless the owner changes them.
5. **Translate the implementation** (§4).
6. **Substitute the seams.** Prototype mock data is replaced by real server data through the mechanisms in [05](05-client-architecture.md) §4 — progressively is acceptable, but a mock that survives the port MUST be an explicit, named placeholder, never an unmarked hard-coded value pretending to be data.
7. **Test what was ported**: every branch of the flow-state union renders, keyboard operation works, error DTO messages are shown ([11-testing-principles.md](11-testing-principles.md) §2–§3).

## 3. Classifying prototype state

Every stateful concept in the prototype — sessions, tabs, drafts, question queues, background progress, agent thread state — is classified as exactly one of:

| Class | Meaning | Destination |
|---|---|---|
| **Domain / workflow state** | The authoritative structure of the work being done | A feature schema, owned server-side; the client holds a typed copy ([05](05-client-architecture.md) §5) |
| **Conversational context** | Ephemeral linguistic continuity ("this one", "the previous") | The feature's conversation context object; context, never authority |
| **UI state** | Interface mechanics: active tab, panel width, open dialog, scroll | Component, hook, or feature-scoped store ([05](05-client-architecture.md) §5) |
| **Prototype mechanism** | Scaffolding that existed to make the prototype run standalone: fake latency, seeded ids, local "backend", replay timers | Deleted. Replaced by the real mechanism, or by nothing |
| **Mock data** | Stand-in content | Deleted or replaced by a named fixture/placeholder |

Rules:

- The classification is written down in the port's plan. An unclassified stateful concept is not ported.
- **The domain model does not bend to the prototype.** If the prototype's state shape disagrees with the feature's schemas, the schemas win. The prototype's shape may be *evidence* that the domain model is missing something — that is a change to the intention and the schema, made deliberately, not an untyped field added to the UI.
- A single untyped bag holding all of it is prohibited, however convenient the prototype found it.

## 4. Translation table

| Prototype shape | Production shape |
|---|---|
| One large component owning fetch, state, transitions, and markup | Declarative components + a feature hook or store ([05](05-client-architecture.md) §2–§3) |
| `useState` soup with `isLoading` / `error` / `data` booleans | Discriminated flow-state union ([05](05-client-architecture.md) §3) |
| Inline `style={{...}}` objects for static styling | Tailwind classes; `style` only for runtime-computed values ([15](15-ui-styling-and-component-system.md) §3) |
| Hard-coded hex, px, and font values | Tokens ([15](15-ui-styling-and-component-system.md) §2) |
| `div` + `onClick`, hand-rolled dropdowns and dialogs | Native controls or shared primitives; accessible semantics ([05](05-client-architecture.md) §7, [15](15-ui-styling-and-component-system.md) §5) |
| Mock API module, in-file fixtures, simulated latency | Server Components, Server Actions, or `client/` adapters ([05](05-client-architecture.md) §4) |
| Everything client-side because the prototype had no server | Server Components by default; `"use client"` on the interactive leaves ([02](02-runtime-boundaries.md) §2) |
| Ad-hoc types written next to the UI | Types inferred from the feature's schemas ([06](06-data-contracts-and-validation.md) §1) |
| Prototype-generated ids, timestamps, prices | Values with provenance from a user or a tool; never invented in the client |

## 5. What must never be ported

- Any privileged behavior: API keys, direct external calls, authorization decisions, or a mutation the client performs itself ([02](02-runtime-boundaries.md), [10-security-and-trust-boundaries.md](10-security-and-trust-boundaries.md)).
- Business rules the prototype hard-coded to make a screen work (pricing math, eligibility, validity). They belong to a server domain rule or a schema, and the UI renders the answer ([05](05-client-architecture.md) §2).
- Client-side persistence the prototype used to survive its own reloads. The session model is page-lifetime by decision ([05](05-client-architecture.md) §5).
- A generic framework the prototype grew (event bus, generic session engine, store factory). [12-anti-patterns.md](12-anti-patterns.md) "Structure and abstraction".

## 6. Documentation of a port

A port is implementation work, documented like any other: the feature README states the behavior that now exists ([14-documentation-principles.md](14-documentation-principles.md) §6). The prototype is not a documentation artifact of this repository, is not vendored into it, and is never cited as the reason a rule was bent. If the port established a product decision worth keeping, it belongs in the intention or a decision record — not in a comment saying "matches the prototype".
