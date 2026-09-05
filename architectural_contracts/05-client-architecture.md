# Client Architecture

- **Applicability:** CONDITIONAL
- **Intent:** Keep components declarative, orchestration in hooks, and authority off the client.
- **Applies when:** adding or changing components, hooks, client state, forms, async state, error and loading rendering, interaction or accessibility behavior.
- **Does not imply:** a remote-data-fetching library, a global store, or a component library. See §4 and §5 for when each is justified; none is a default.
- **Related:** [02-runtime-boundaries.md](02-runtime-boundaries.md), [06-data-contracts-and-validation.md](06-data-contracts-and-validation.md), [08-agent-architecture.md](08-agent-architecture.md) §6, [15-ui-styling-and-component-system.md](15-ui-styling-and-component-system.md) (styling and shared primitives), [16-design-prototype-porting.md](16-design-prototype-porting.md) (porting a prototype)

The browser runtime owns **interaction**: rendering, input, view state, optimistic feedback, and calling the server. It owns nothing authoritative. See [02-runtime-boundaries.md](02-runtime-boundaries.md).

## 1. Kinds of client code

| Kind | Lives in | Contains | Tested by |
|---|---|---|---|
| **Components** | `features/<x>/components/`, `src/components/ui/` | JSX, styling, event wiring, rendering of states | Component/interaction tests, visual review |
| **Flows and hooks** | `features/<x>/hooks/` | View state, sequencing, calling Server Actions or `client/` adapters, mapping results to UI states | Hook tests without rendering markup |
| **Feature stores** | `features/<x>/hooks/` | Transient client state shared by several components of one feature, when §5 justifies it | Store tests without rendering markup |

A component asks a hook *what to show* and tells it *what happened*. The hook decides *what to do next*. The server decides *whether it is allowed and what it means*.

## 2. Components

- Server Components by default. A component becomes `"use client"` only when it handles events, uses React state/effects, or needs a browser API. A feature being interactive *somewhere* does not make its tree client code: the directive goes on the interactive leaves, and server-rendered structure keeps composing around them ([02-runtime-boundaries.md](02-runtime-boundaries.md) §1–§2).
- Components render declaratively. Orchestration, state machines, and request logic are not written inside a visual component, however convenient the JSX makes it.
- A component SHOULD be under roughly 150 lines. Past that, split by rendering concern (list vs row vs toolbar), not by lifecycle phase.
- Splitting has a lower bound too. A component extracted with no independent rendering concern, no reuse, and no boundary — a wrapper around three elements used once — adds indirection without adding structure. Prefer boundaries that match how the feature is actually composed.
- Components MUST NOT contain: business rules (pricing, eligibility, validity beyond schema), `fetch`, request sequencing, retry loops, or integration imports.
- Components MAY contain: derived display values (formatting a money DTO, pluralizing), conditional rendering on view state, local ephemeral state (open/closed, hover) that no other component needs.
- Props are the interface. Feature components receive DTOs and callbacks; they do not reach into context or a store for data unless the feature provides a documented provider or the state genuinely qualifies under §5.

Prohibited: the "smart component" that fetches, validates, computes, and renders. Its orchestration belongs in a hook, its computation on the server or in a pure function under `schemas/` or `server/domain/`.

Styling, shared primitives, and when a component is promoted to `src/components/ui/`: [15-ui-styling-and-component-system.md](15-ui-styling-and-component-system.md).

## 3. Hooks and flows

Hooks are the client orchestration layer. Naming:

| Pattern | Purpose | Example |
|---|---|---|
| `use-<noun>-flow.ts` | Multi-step process with explicit state machine | `use-create-proposal-flow.ts` |
| `use-<verb>-<noun>.ts` | One operation (submit, load, retry) | `use-submit-proposal.ts` |
| `use-<noun>-view-state.ts` | Derived or local view state without I/O | `use-proposal-filters.ts` |
| `use-<noun>-store.ts` | Feature-scoped store, when §5 justifies one | `use-proposal-session-store.ts` |

Rules:

- A hook exposes a **state value** and **intent functions** (`submit`, `retry`, `cancel`, `edit`). It does not expose setters.
- A hook that performs I/O calls a Server Action from `server/actions.ts` or an adapter from `client/`. It never calls `fetch` to an external host and never imports integration clients.
- A hook MUST represent its async status explicitly. A discriminated union is the required shape:

```ts
type FlowState =
  | { status: "idle" }
  | { status: "submitting"; input: CreateProposalInput }
  | { status: "success"; data: ProposalSummaryDto }
  | { status: "error"; error: ErrorDto; input: CreateProposalInput; retryable: boolean };
```

  Booleans like `isLoading` + `isError` + `data?` are prohibited because they admit impossible combinations.
- Hooks MUST NOT contain business rules. "Can this proposal be sent?" is asked of the server or of a shared schema; the hook only stores the answer.

When a hook is appropriate: any time two or more components need the same view state, any time an operation has more than one step, any time async status must be represented. When it is not: a single local toggle inside one component.

When interaction logic outgrows one component, the coordination moves **out** of the component into the feature's `hooks/` — a flow hook, a reducer, or a store (§5) — not into a larger component and not into a generic framework. The boundary to aim for is feature-cohesive: one module that owns one workflow's client coordination, named after that workflow.

## 4. Where async request orchestration belongs

| Situation | Mechanism |
|---|---|
| Initial page data | Server Component fetches through the feature's `server/` and passes DTOs down as props |
| User-triggered mutation from this app's UI | Server Action called from a hook |
| Streaming (agent progress, tokens) | Route Handler streaming response, consumed by a `client/` adapter, driven by a hook |
| File upload | Route Handler, `client/` adapter, hook |
| Polling or re-fetch after mutation | `router.refresh()` / `revalidatePath` from the Server Action, or a hook re-calling a Server Action. Not a hand-rolled cache |

**These mechanisms are the default and are sufficient for the current product.** A client-side remote-state library (TanStack Query and equivalents) is **not** part of the architecture and is not added by default. TanStack Router and TanStack Start are not applicable at all: Next.js App Router owns routing and the application runtime.

TanStack Query is **conditionally allowed**, on evidence. It becomes justified when a concrete product requirement needs machinery the mechanisms above do not provide:

- background refetch or polling of server data,
- optimistic mutations that must reconcile against a shared cache,
- one server resource cached and synchronized across several client components,
- infinite queries or client-driven pagination,
- repeated client-side invalidation of interdependent queries.

Introducing it requires the named requirement, recorded in [README.md](README.md) "Resolved decisions" per [13-decision-checklist.md](13-decision-checklist.md) §5. "It is what I usually use" and "we will need caching eventually" are not requirements. If it is introduced, it is confined to `hooks/` and `client/`: components consume the hook's flow state, not the library's API ([12-anti-patterns.md](12-anti-patterns.md) "Structure and abstraction").

## 5. State: what the client may own

Client state is separated by **who is authoritative for it**, not by which component happens to render it. Three kinds coexist in the browser and MUST NOT be collapsed into one untyped object.

| Kind | Example in this product | Authority | Shape |
|---|---|---|---|
| **Workflow / domain state** | the proposal workflow state: brief, information items, clarification round, current proposition with provenance, draft reference | The server. The client holds a typed copy | A feature schema in `schemas/`, parsed |
| **Conversational context** | prior human instructions and application-rendered assistant summaries, so "the second one" resolves | Nobody — it is context, never authority | A feature schema in `schemas/`, bounded |
| **UI state** | active tab, panel width, selected panel, open dialog, scroll position, draft input before submission | The client, entirely | Plain local state, a hook, or a feature store |

Rules:

- **Server-authoritative data**: anything an external system holds (proposals, content) and anything the server has validated or decided (an approval result, an execution result). The client holds a **copy** received as a DTO and never mutates it locally except as an explicit optimistic step reconciled on the server's response.
- **The browser is never trusted for consequential execution.** Holding a copy of workflow state is a convenience for rendering and for round-tripping it to the next turn. Anything consequential crossing back to the server is parsed, validated, and authorized there, every time, regardless of what the client believed ([02-runtime-boundaries.md](02-runtime-boundaries.md) §6, [10-security-and-trust-boundaries.md](10-security-and-trust-boundaries.md)).
- **One owner per value.** A value does not exist simultaneously as a server response, a store copy, and a component copy. If two places genuinely need it, one owns it and the other derives it. Duplicated state with no written synchronization rule is a defect, not a performance strategy.
- Agent-prepared data stays **proposed** until approved: approval sends the full payload to the server, which re-validates it (§9, [08-agent-architecture.md](08-agent-architecture.md) §6).
- Never store secrets, tokens, or integration identifiers in client state, `localStorage`, or URL query parameters.

### 5.1 The tooling ladder

Reach for the smallest mechanism that holds:

| Use | When |
|---|---|
| `useState` | State one component owns, or that its children receive as props |
| `useReducer` | One component or one surface with meaningful, deterministic transitions worth naming and testing |
| Feature store (**Zustand**) | Transient client state that several components of one feature must share, or that coordinates a feature workflow, where prop-passing or a common ancestor has stopped being honest |

Zustand is the ratified store library ([README.md](README.md) "Resolved decisions"). It is **not** the default for state; it is the answer to the third row only.

- Stores are **feature-scoped**, one concern each, in `features/<x>/hooks/use-<noun>-store.ts`. A single global application store is prohibited.
- Plausible stores in this product: the active in-memory proposal session, conversation context, the question queue, panel/layout state, tab state, transient workflow coordination — each on its own merits, not as a set.
- A store is client state. It is not a domain layer, not a service layer, and never the authority for a decision the server owns. Server-authoritative data is not copied into a store because a store exists.
- A store holds no derived data that a selector can compute, and no persistence middleware (§5.2).
- Cross-cutting concerns that are not feature state (toasts, current user) use a small React context near the root, not a store.

### 5.2 Session model: page lifetime

For the MVP, a proposal session lives for the **browser page lifetime**. There is no application database ([09-database-and-persistence.md](09-database-and-persistence.md)), and there is no client-side persistence either.

- `localStorage`, `sessionStorage`, IndexedDB, cookies-as-storage, cross-device sync, and account-based session restore are **not** introduced.
- A refresh intentionally destroys the session. The UI MUST make that visible rather than implying durability — an unapproved draft that a reload would lose is presented as such.
- Do not design around persistence that does not exist: no rehydration paths, no "restore last session" affordances, no store shapes justified only by future serialization.
- This can be expanded later. Doing so is an architectural decision recorded in [README.md](README.md) "Resolved decisions", and durable application-owned state additionally requires [09-database-and-persistence.md](09-database-and-persistence.md) §14.

## 6. Errors, loading, retry

- Loading: represent per operation, via the flow state union, and render with dedicated components (`<Skeleton>`, `<Spinner>`) from `src/components/ui/`. Use `loading.tsx` and `Suspense` for route-level loading of Server Components.
- Errors: the client receives `ErrorDto` (see [04-server-architecture.md](04-server-architecture.md) §6). Hooks map `code` to UI behavior; components render `message`. Components MUST NOT invent messages for known codes; they MAY add a generic fallback for unknown codes.
- Retry: offered only when `retryable` is true (integration timeouts, rate limits). Validation errors are never "retried"; they are corrected. Retry re-invokes the same intent with the same input and idempotency key.
- Route-level failures use `error.tsx` boundaries per route segment. Boundaries render, log a client-side breadcrumb, and offer navigation; they do not attempt recovery logic.
- Never swallow an error into a generic "Something went wrong" when a specific `ErrorDto` is available.

## 7. Accessibility and predictable interaction

Accessibility is part of implementing an interactive element, not a pass made afterwards. A component that is not keyboard-operable is not finished.

- Every interactive element is a native control (`button`, `a`, `input`, `select`) or a `src/components/ui/` primitive built on one. No click handlers on `div`s.
- Do not re-implement semantics the platform already provides. A native control with the right element beats an ARIA reconstruction of it. For composite widgets (dialog, tabs, popover, combobox), use a shared primitive that owns the behavior; when none exists, [15-ui-styling-and-component-system.md](15-ui-styling-and-component-system.md) §5 decides whether to build it or adopt an accessible primitive.
- Every form control has a label. Every async action has a visible pending state and disables re-submission while pending. For consequential mutations this is the first line of duplicate protection ([04-server-architecture.md](04-server-architecture.md) §8), so it is required, not cosmetic.
- Focus is managed and visible: on route change, dialog open/close, and after an action completes or fails (focus the error summary or the next logical control). The focus indicator is never removed without an equivalent replacement.
- Destructive or consequential actions (anything that ends in an external system) require an explicit confirmation step that shows **the exact data** to be sent. This is the same review surface the agent lifecycle uses ([08-agent-architecture.md](08-agent-architecture.md) §6).
- Keyboard operation must work for every flow. Colors are never the only carrier of state.
- Interaction must be predictable: the same input in the same state yields the same visible result. No hidden auto-submits, no actions triggered by hover alone, no silent background mutations.

## 8. Types, schemas, and client-side validation

- Client code MUST NOT hand-write a shape that a schema already defines. Types come from the feature's `schemas/` by inference ([06-data-contracts-and-validation.md](06-data-contracts-and-validation.md) §1). Hand-written types are for genuinely UI-only shapes: component props, view-state unions.
- Components consume values that are **already valid**. Parsing happens at the boundary the data crossed — the Server Action, the `client/` adapter, the store's entry point — not repeatedly during render.
- Vendor wire shapes never reach the presentation layer. External data is mapped to application-owned types inside `src/lib/<system>/` before a feature sees it ([06-data-contracts-and-validation.md](06-data-contracts-and-validation.md) §7).
- Casting (`as`) to make a component compile against a mismatched shape is prohibited. A type mismatch at a boundary is a design question, not a syntax problem.
- Forms MAY validate with the **same** Zod schema exported from `features/<x>/schemas/` to give immediate feedback. This is a convenience.
- The server re-parses every input. The server's result is authoritative and MUST be rendered even when the client thought the input was valid.
- Domain rules that need server data (availability, existing recipients, pricing) are not validated on the client at all; the client shows the server's answer.
- The client MUST NOT contain a hand-written copy of a schema. Import the schema. If a client-only refinement is needed (e.g. "confirm password matches"), extend the shared schema in the client file; never fork it.

## 9. Components that render agent output

Anything a model produced is displayed as **proposed** until a human approves it. Components rendering agent-prepared actions MUST show every consequential field (recipients, quantities, prices, dates, obligations) as editable review data, MUST visually distinguish model assumptions from user-provided facts, and MUST route approval through the approval action, never through a generic "save". Details in [08-agent-architecture.md](08-agent-architecture.md).
