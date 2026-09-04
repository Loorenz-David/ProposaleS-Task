# Runtime Boundaries

- **Applicability:** CROSS-CUTTING
- **Intent:** Keep browser and server runtimes explicit and defensible; define what may cross between them.
- **Applies when:** creating any file reachable from a `"use client"` graph; adding `"use client"`, `server-only`, or `"use server"`; passing data between server and client; reading environment variables; choosing Node vs Edge.
- **Does not imply:** every component is a Client Component, or every module needs a directive.
- **Related:** [03-feature-architecture.md](03-feature-architecture.md), [04-server-architecture.md](04-server-architecture.md), [10-security-and-trust-boundaries.md](10-security-and-trust-boundaries.md)

One repository, one Vercel deployment, two runtimes that must never be confused:

| Runtime | Executes | Trust level | Owns |
|---|---|---|---|
| **Browser** | Client Components, hooks, browser event handlers, client transport adapters | Untrusted | Interaction, view state, optimistic UI |
| **Server** | Server Components, Route Handlers, Server Actions, services, integrations, agents | Trusted | Authority: secrets, authorization, business rules, external calls, mutations |

Between them sits **shared code**: schemas, types, pure functions with no runtime dependency. Shared code owns contracts and MUST execute correctly in both runtimes.

> **Client code owns interaction. Server code owns authority. Shared code owns contracts.**

Every rule below is a consequence of that sentence.

## 1. Server Components vs Client Components

- Every file under `src/app/` and every component is a **Server Component by default**. That is the correct default: it keeps secrets, data access, and heavy dependencies off the client bundle.
- A component becomes a Client Component only by carrying the `"use client"` directive at the top of its file, or by being imported from a file that does. The directive marks a **bundle boundary**, not a single component: everything imported below it becomes client code.
- Server Components MAY render Client Components and pass them serializable props. Client Components MUST NOT import Server Components; they MAY receive them as `children` or other React-node props.

## 2. `"use client"`

`"use client"` MUST be used only where browser interactivity requires it: event handlers, `useState`/`useEffect`/`useRef`, browser APIs, or third-party UI libraries that require the DOM.

Rules:

- Place the directive on the **smallest leaf** that needs it. A page that has one interactive button gets a small client `SubmitButton`, not a client page.
- A `"use client"` file MUST NOT import anything from a `server/` folder, from `src/lib/proposales/`, `src/lib/ai/`, `src/lib/agent/`, or `src/lib/env/server.ts`. The build fails on `server-only` imports; the lint rule (see §7) fails on the rest.
- `"use client"` does not mean "this only renders in the browser". Client Components are still server-rendered for the initial HTML. Browser-only APIs MUST be guarded inside effects or event handlers.

## 3. `server-only`

The `server-only` package throws at build time when a module is imported into the client graph. It is the primary mechanism for making the boundary **defensible instead of inferred**.

`import "server-only";` MUST be the first line of:

- every module under `src/lib/env/server.ts`,
- every integration client (`src/lib/proposales/**`, `src/lib/ai/**`),
- every agent runtime module (`src/lib/agent/**`),
- every `features/<feature>/server/**` module,
- any module that reads `process.env`, holds a credential, or calls an external system.

Rationale: without this guard, a refactor that moves an import one file up can silently ship a secret-bearing module to the browser. The framework will not always catch it. `server-only` turns that mistake into a build failure.

## 4. `"use server"`

`"use server"` is **not** the inverse of `"use client"`. It does one thing: it marks a file (or function) as containing **Server Actions**, which are server functions callable from client code via an RPC endpoint that Next.js generates.

Rules:

- Use `"use server"` only in files that export Server Actions, and only at the top of those files. Recommended location: `features/<feature>/server/actions.ts`.
- Every export from a `"use server"` file is a public network endpoint. Such a file MUST export only async functions intended to be called from the client, and each function MUST validate its input and check authorization ([04-server-architecture.md](04-server-architecture.md) §3).
- Never add `"use server"` to a service, domain, or integration module "to make it server-side". Those modules are server-side because they are only imported by server code and carry `server-only`. Adding `"use server"` there would expose every export as an endpoint.

## 5. Import reachability

The question is never "where did I write this file" but "**what can reach it**".

```
src/app/page.tsx (server)            ── may import ──▶ features/x/server/*, features/x/components/*, lib/*
features/x/components/Form.tsx ("use client")
                                      ── may import ──▶ features/x/hooks/*, features/x/client/*, features/x/schemas/*, features/x/types/*, components/ui/*
                                      ── MUST NOT ──▶ features/x/server/*, lib/proposales/*, lib/ai/*, lib/agent/*, lib/env/server.ts
features/x/server/*.ts (server-only) ── may import ──▶ lib/*, features/x/schemas/*, features/x/types/*, other features' server/index.ts
features/x/schemas/*.ts (shared)     ── may import ──▶ zod, other schemas, pure utilities
                                      ── MUST NOT ──▶ anything with "use client", "server-only", React, or process.env
```

Valid direction examples:

```ts
// features/proposals/components/proposal-form.tsx   ("use client")
import { createProposalInputSchema } from "@/features/proposals/schemas/proposal";   // ✅ shared contract
import { useCreateProposalFlow } from "@/features/proposals/hooks/use-create-proposal-flow"; // ✅ client orchestration

// features/proposals/server/services/create-proposal.ts   (server-only)
import { proposalesClient } from "@/lib/proposales";        // ✅ server → integration
import { createProposalInputSchema } from "@/features/proposals/schemas/proposal"; // ✅ server → shared
```

Invalid direction examples:

```ts
// features/proposals/components/proposal-form.tsx   ("use client")
import { proposalesClient } from "@/lib/proposales";        // ❌ integration in client graph; build fails on server-only
import { createProposal } from "@/features/proposals/server/services/create-proposal"; // ❌ authority in client graph

// features/proposals/schemas/proposal.ts   (shared)
import { serverEnv } from "@/lib/env/server";              // ❌ shared code must be runtime-neutral
```

## 6. What may cross the boundary

Data crossing from server to client (Server Component props, Server Action arguments and return values, Route Handler bodies) MUST be **plain, JSON-compatible data**:

| Allowed | Not allowed |
|---|---|
| objects, arrays, strings, numbers, booleans, `null` | class instances (including `Error`), functions, `Map`/`Set`, `Symbol`, `undefined` inside arrays |
| ISO 8601 strings for dates and times | `Date` objects (technically serializable by React, but banned here for consistency with Route Handlers and schemas) |
| error DTOs `{ code, message, details? }` | thrown errors expected to be caught on the client with their class intact |
| the fields the client needs | whole third-party response objects |

Consequences:

- Server Actions MUST return a discriminated result (`{ ok: true, data } | { ok: false, error: ErrorDto }`) rather than throwing for expected failures. See [04-server-architecture.md](04-server-architecture.md) §6.
- Data returned to the client MUST be explicitly shaped (a "view DTO"), never the raw object returned by an integration. See [06-data-contracts-and-validation.md](06-data-contracts-and-validation.md) §7.
- Anything the client sends back is untrusted input and MUST be re-validated on the server, even if the client validated it first.

## 7. Enforcement

The boundary is enforced by three layers, in order of strength:

1. **Build**: `server-only` on every authority module.
2. **Lint**: an ESLint `no-restricted-imports` (or equivalent boundary plugin) rule that forbids the "MUST NOT" edges in §5 and forbids `process.env` outside `src/lib/env/`. This rule MUST be added when the app is scaffolded.
3. **Review**: the [13-decision-checklist.md](13-decision-checklist.md) question "Does this dependency direction violate the runtime boundary?"

Framework inference (Next.js deciding what is server or client based on where a file is imported) is treated as a **safety net**, not the design. Every boundary MUST be readable from the file itself: the directive at the top, the `server-only` import, or the folder it lives in.

## 8. Secrets and environment variables

- Secrets exist only in server runtime. There is no such thing as a client-side secret.
- `process.env` MUST be read in exactly one place: `src/lib/env/`. Everything else imports validated, typed values from there.
  - `src/lib/env/server.ts` — `import "server-only"`, parses all server variables with a Zod schema at module load, fails fast with the **names** of missing variables (never their values).
  - `src/lib/env/client.ts` — parses only `NEXT_PUBLIC_*` variables. These are inlined into the client bundle at build time and are therefore **public by definition**. A value that must not be public MUST NOT be `NEXT_PUBLIC_*`.
- `.env.example` MUST be committed and list every variable the application reads, with empty values and a one-line comment each. `.env` and `.env.local` MUST be ignored.
- Current server variables: `PROPOSALES_API_KEY` (secret), `PROPOSALES_COMPANY_ID` (configuration, not secret, still server-only because it has no client use). Adding a variable means adding it to the schema, to `.env.example`, and to the Vercel project.
- Secrets MUST NOT appear in logs, error messages, error `details`, URLs, or client-visible state. See [10-security-and-trust-boundaries.md](10-security-and-trust-boundaries.md).

## 9. Vercel-specific notes that affect architecture

- Route Handlers and Server Actions run as serverless or edge functions. Module-level state is not shared across invocations and MUST NOT be used as a cache or a store of record.
- Prefer the Node.js runtime for anything that touches integrations or agents. Do not opt a route into the Edge runtime unless its full dependency graph is verified edge-compatible; `server-only` modules that use Node APIs will break there.
- Long-running agent work must respect function duration limits. Design agent runs to be resumable or bounded rather than assuming unlimited execution time. See [08-agent-architecture.md](08-agent-architecture.md) §9.
