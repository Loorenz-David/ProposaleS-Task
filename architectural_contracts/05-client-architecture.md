# Client Architecture

- **Applicability:** CONDITIONAL
- **Intent:** Keep components declarative, orchestration in hooks, and authority off the client.
- **Applies when:** adding or changing components, hooks, forms, async state, error and loading rendering, interaction or accessibility behavior.
- **Does not imply:** a data-fetching or state library; none is part of the contract.
- **Related:** [02-runtime-boundaries.md](02-runtime-boundaries.md), [06-data-contracts-and-validation.md](06-data-contracts-and-validation.md), [08-agent-architecture.md](08-agent-architecture.md) §6

The browser runtime owns **interaction**: rendering, input, view state, optimistic feedback, and calling the server. It owns nothing authoritative. See [02-runtime-boundaries.md](02-runtime-boundaries.md).

## 1. Two kinds of client code

| Kind | Lives in | Contains | Tested by |
|---|---|---|---|
| **Components** | `features/<x>/components/`, `src/components/ui/` | JSX, styling, event wiring, rendering of states | Component/interaction tests, visual review |
| **Flows and hooks** | `features/<x>/hooks/` | View state, sequencing, calling Server Actions or `client/` adapters, mapping results to UI states | Hook tests without rendering markup |

A component asks a hook *what to show* and tells it *what happened*. The hook decides *what to do next*. The server decides *whether it is allowed and what it means*.

## 2. Components

- Server Components by default. A component becomes `"use client"` only when it handles events, uses React state/effects, or needs a browser API.
- A component SHOULD be under roughly 150 lines. Past that, split by rendering concern (list vs row vs toolbar), not by lifecycle phase.
- Components MUST NOT contain: business rules (pricing, eligibility, validity beyond schema), `fetch`, request sequencing, retry loops, or integration imports.
- Components MAY contain: derived display values (formatting a money DTO, pluralizing), conditional rendering on view state, local ephemeral state (open/closed, hover) that no other component needs.
- Props are the interface. Feature components receive DTOs and callbacks; they do not reach into context for data unless the feature provides a documented provider.

Prohibited: the "smart component" that fetches, validates, computes, and renders. Its orchestration belongs in a hook, its computation on the server or in a pure function under `schemas/` or `server/domain/`.

## 3. Hooks and flows

Hooks are the client orchestration layer. Naming:

| Pattern | Purpose | Example |
|---|---|---|
| `use-<noun>-flow.ts` | Multi-step process with explicit state machine | `use-create-proposal-flow.ts` |
| `use-<verb>-<noun>.ts` | One operation (submit, load, retry) | `use-submit-proposal.ts` |
| `use-<noun>-view-state.ts` | Derived or local view state without I/O | `use-proposal-filters.ts` |

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

## 4. Where async request orchestration belongs

| Situation | Mechanism |
|---|---|
| Initial page data | Server Component fetches through the feature's `server/` and passes DTOs down as props |
| User-triggered mutation from this app's UI | Server Action called from a hook |
| Streaming (agent progress, tokens) | Route Handler streaming response, consumed by a `client/` adapter, driven by a hook |
| File upload | Route Handler, `client/` adapter, hook |
| Polling or re-fetch after mutation | `router.refresh()` / `revalidatePath` from the Server Action, or a hook re-calling a Server Action. Not a hand-rolled cache |

No data-fetching or global state library is part of the contract. If one is introduced later it MUST be recorded in [README.md](README.md) and wrapped so components do not depend on its API directly. Until then, the mechanisms above are sufficient and simpler.

## 5. Local UI state vs server-authoritative state

- **Server-authoritative**: anything an external system holds (proposals, content) and anything the server has validated or decided (an approval result, an execution result). The client holds a **copy** received as a DTO and never mutates it locally except as an explicit optimistic step that is reconciled on the server's response.
- **Transient workflow state**: in the MVP there is no application database, so an agent-prepared proposal under review, the human's corrections, and the pending status of a mutation live in application or client state for the duration of the session. That is acceptable and deliberate ([README.md](README.md) "Resolved decisions"). The client still treats the prepared data as *proposed*: approval sends the full payload to the server, which re-validates it; a page reload may lose an unapproved draft, and the UI must make that visible rather than pretend durability.
- **Local UI state**: selection, expansion, draft input before submission, wizard step, scroll. Lives in the hook or component that owns it. Lifted only as far as the nearest common ancestor that needs it.
- Global client state (an app-wide store) is not permitted without a recorded architectural decision. Cross-cutting concerns that seem to need it (toasts, current user) are provided by a small React context near the root, not a store.
- Never store secrets, tokens, or integration identifiers in client state, `localStorage`, or URL query parameters.

## 6. Errors, loading, retry

- Loading: represent per operation, via the flow state union, and render with dedicated components (`<Skeleton>`, `<Spinner>`) from `src/components/ui/`. Use `loading.tsx` and `Suspense` for route-level loading of Server Components.
- Errors: the client receives `ErrorDto` (see [04-server-architecture.md](04-server-architecture.md) §6). Hooks map `code` to UI behavior; components render `message`. Components MUST NOT invent messages for known codes; they MAY add a generic fallback for unknown codes.
- Retry: offered only when `retryable` is true (integration timeouts, rate limits). Validation errors are never "retried"; they are corrected. Retry re-invokes the same intent with the same input and idempotency key.
- Route-level failures use `error.tsx` boundaries per route segment. Boundaries render, log a client-side breadcrumb, and offer navigation; they do not attempt recovery logic.
- Never swallow an error into a generic "Something went wrong" when a specific `ErrorDto` is available.

## 7. Accessibility and predictable interaction

- Every interactive element is a native control (`button`, `a`, `input`, `select`) or a `src/components/ui/` primitive built on one. No click handlers on `div`s.
- Every form control has a label. Every async action has a visible pending state and disables re-submission while pending. For consequential mutations this is the first line of duplicate protection ([04-server-architecture.md](04-server-architecture.md) §8), so it is required, not cosmetic.
- Focus is managed on route change, dialog open/close, and after an action completes or fails (focus the error summary or the next logical control).
- Destructive or consequential actions (anything that ends in an external system) require an explicit confirmation step that shows **the exact data** to be sent. This is the same review surface the agent lifecycle uses ([08-agent-architecture.md](08-agent-architecture.md) §6).
- Keyboard operation must work for every flow. Colors are never the only carrier of state.
- Interaction must be predictable: the same input in the same state yields the same visible result. No hidden auto-submits, no actions triggered by hover alone, no silent background mutations.

## 8. Client-side validation is UX only

- Forms MAY validate with the **same** Zod schema exported from `features/<x>/schemas/` to give immediate feedback. This is a convenience.
- The server re-parses every input. The server's result is authoritative and MUST be rendered even when the client thought the input was valid.
- Domain rules that need server data (availability, existing recipients, pricing) are not validated on the client at all; the client shows the server's answer.
- The client MUST NOT contain a hand-written copy of a schema. Import the schema. If a client-only refinement is needed (e.g. "confirm password matches"), extend the shared schema in the client file; never fork it.

## 9. Components that render agent output

Anything a model produced is displayed as **proposed** until a human approves it. Components rendering agent-prepared actions MUST show every consequential field (recipients, quantities, prices, dates, obligations) as editable review data, MUST visually distinguish model assumptions from user-provided facts, and MUST route approval through the approval action, never through a generic "save". Details in [08-agent-architecture.md](08-agent-architecture.md).
