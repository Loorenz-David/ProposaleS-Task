# Server Architecture

- **Applicability:** CONDITIONAL
- **Intent:** Keep transport thin and put authority in services and domain rules, with one error taxonomy.
- **Applies when:** adding or changing a Route Handler, Server Action, service, domain rule, or error; designing a mutation; handling repeats and retries.
- **Does not imply:** a feature needs a Route Handler (Server Actions are the default for the app's own UI) or a `domain/` folder without a rule.
- **Related:** [02-runtime-boundaries.md](02-runtime-boundaries.md), [06-data-contracts-and-validation.md](06-data-contracts-and-validation.md), [07-integrations.md](07-integrations.md), [08-agent-architecture.md](08-agent-architecture.md)

The server side of this application is a conventional layered backend that happens to be hosted inside Next.js. The framework provides transport; it does not provide architecture.

## 1. Concept map

| Next.js / this repo | Traditional backend | Responsibility |
|---|---|---|
| Route Handler (`src/app/**/route.ts`) | Controller / HTTP adapter | Parse the request, validate, call one service, translate the result to HTTP |
| Server Action (`features/<x>/server/actions.ts`) | RPC controller | Same as above, over the Server Action transport |
| Service (`features/<x>/server/services/*`) | Application service / use case | Orchestrate: authorization, domain rules, integration calls, result shaping |
| Domain rules (`features/<x>/server/domain/*`) | Domain model / business invariants | Pure decisions about business data. No I/O |
| Integration client (`src/lib/<system>/`) | External adapter / gateway | Talk to one external system. See [07-integrations.md](07-integrations.md) |
| Agent and tools (`features/<x>/server/{agent,tools}/`) | Application service with an LLM in the loop | See [08-agent-architecture.md](08-agent-architecture.md) |

The layers are ordered. Transport calls services. Services call domain rules and integrations. Domain rules call nothing. Nothing calls transport.

## 2. Thin Route Handlers

A Route Handler MUST do only these things, in this order:

1. Extract raw input (body, query, params, headers).
2. Parse it with a schema from `features/<x>/schemas/`. On failure return 400 with the error DTO.
3. Establish the caller context (who is calling, if applicable).
4. Call **one** service function.
5. Map the service result or thrown `AppError` to an HTTP response using the shared mapper in `src/lib/errors/http.ts`.

```ts
// src/app/api/proposals/route.ts
import { NextResponse } from "next/server";
import { createProposalInputSchema } from "@/features/proposals/schemas/proposal";
import { createProposal } from "@/features/proposals/server";
import { toHttpError } from "@/lib/errors/http";

export async function POST(request: Request) {
  const parsed = createProposalInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return toHttpError(parsed.error);
  try {
    const result = await createProposal(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return toHttpError(error);
  }
}
```

A `route.ts` file SHOULD stay under about 60 lines. If it is longer, logic has leaked in. Prefer one `route.ts` per resource and HTTP method set; never a single `route.ts` that switches on an `action` field.

When to use a Route Handler instead of a Server Action: inbound webhooks from external systems, streaming responses, file uploads, or any caller that is not this application's own UI.

## 3. Thin Server Actions

Server Actions are the default transport for the application's own UI mutations. Rules:

- Live in `features/<x>/server/actions.ts` with `"use server"` at the top. Nothing else in `server/` carries that directive.
- Each action: parse input with a schema, call one service, return a **result object**, never throw for expected failures.

```ts
// features/proposals/server/actions.ts
"use server";
import { createProposalInputSchema, type ProposalSummaryDto } from "@/features/proposals/schemas/proposal";
import { createProposal } from "./services/create-proposal";
import { toActionResult, type ActionResult } from "@/lib/errors/action-result";

export async function createProposalAction(rawInput: unknown): Promise<ActionResult<ProposalSummaryDto>> {
  return toActionResult(async () => {
    const input = createProposalInputSchema.parse(rawInput);
    return createProposal(input);
  });
}
```

- Inputs arrive as `unknown`. Never type the parameter as the trusted shape; the client can send anything.
- Server Actions are public endpoints. Treat every one as if it were listed in an API reference. See [10-security-and-trust-boundaries.md](10-security-and-trust-boundaries.md).
- A Server Action MAY call `revalidatePath`/`revalidateTag` after a successful mutation. That is transport concern and belongs here, not in the service.

## 4. Application services

A service is one use case, one exported function, one file. It:

- receives already-validated input and a caller context,
- checks authorization (when the application has a notion of identity),
- applies domain rules,
- calls integration clients,
- shapes the result into a DTO defined in `schemas/`,
- throws `AppError` subclasses for failures.

Services MUST NOT know about HTTP, React, `NextResponse`, cookies, or headers. They MUST be callable from a test with plain arguments and a fake integration client. This is what makes them callable from a Route Handler, a Server Action, and an agent tool without duplication.

Dependency injection is done by **function parameters with defaults**, not by containers:

```ts
export async function createProposal(
  input: CreateProposalInput,
  deps: { proposales: ProposalesClient; now: () => Date } = { proposales: proposalesClient, now: () => new Date() },
): Promise<ProposalSummaryDto> { ... }
```

## 5. Domain rules

Business invariants live in pure functions under `server/domain/`. They take data, return data or a decision, and throw `DomainRuleError` (a `ValidationError` subtype) when an invariant is violated.

Examples of domain rules: "a proposal sent to a recipient must have a currency", "quantities are positive integers", "a discount cannot exceed the line value". These MUST exist in exactly one place. The client MAY mirror a rule for UX (disabled button, inline hint) but MUST NOT be the only place it is enforced, and the mirror MUST be derived from the same schema where possible ([05-client-architecture.md](05-client-architecture.md) §8).

Do not create a "domain" folder to hold types. Create it when there is a rule.

## 6. Error taxonomy

All server errors extend one base class in `src/lib/errors/app-error.ts`:

```ts
export abstract class AppError extends Error {
  abstract readonly code: ErrorCode;          // stable, machine-readable
  abstract readonly httpStatus: number;
  readonly details?: Record<string, unknown>; // safe to send to the client
  readonly cause?: unknown;                   // server-only; never serialized
}
```

| Class | Code | HTTP | Use |
|---|---|---|---|
| `ValidationError` | `validation_error` | 400 | Input failed schema or domain rule. `details` carries field paths |
| `AuthenticationError` | `unauthenticated` | 401 | Caller identity missing or invalid (when identity exists) |
| `AuthorizationError` | `forbidden` | 403 | Caller identified but not permitted |
| `NotFoundError` | `not_found` | 404 | Resource does not exist or is not visible to the caller |
| `ConflictError` | `conflict` | 409 | State conflict, detected duplicate, already-executed approval |
| `ApprovalRequiredError` | `approval_required` | 409 | A mutation was attempted without a valid approval ([08-agent-architecture.md](08-agent-architecture.md)) |
| `IntegrationError` | `integration_error` | 502 | External system failed. `details.system`, `details.status`, `details.retryable` |
| `RateLimitedError` | `rate_limited` | 429 | Ours or upstream |
| `InternalError` | `internal_error` | 500 | Anything else. Message is generic; `cause` is logged |

Rules:

- `message` MUST be safe to display. It may mention the domain ("proposal not found"), never internals, secrets, stack traces, or upstream URLs with tokens.
- `details` MUST be structured and safe. Field paths, ids, the external system name and status: yes. Raw upstream bodies: no.
- The **serialized form** `ErrorDto = { code, message, details? }` is defined by a Zod schema in `src/lib/errors/error-dto.ts` (runtime-neutral) so the client can parse it.
- Catching an error and rethrowing a generic one **without attaching the original as `cause`** is prohibited. Context is only ever added, never removed, until the transport layer serializes.
- Unknown errors are wrapped as `InternalError` at the transport layer only. Services let them propagate.

## 7. Validation at entry points

Every server entry point (Route Handler, Server Action, agent tool `execute`, webhook receiver) MUST parse its input with a Zod schema before doing anything else. Services trust their typed input **because** the entry point validated it. If a service is also reachable from a place that did not validate, that place is wrong, not the service.

See [06-data-contracts-and-validation.md](06-data-contracts-and-validation.md) for the boundaries list.

## 8. Idempotency

Serverless transports retry, users double-click, and agents re-run. No public Proposales idempotency-key mechanism has been established, so duplicate protection is layered:

- **UI (required).** While a consequential mutation is pending, the client MUST disable re-submission and MUST NOT fire the same intent twice ([05-client-architecture.md](05-client-architecture.md) §7). This removes the trivial double-click case.
- **Correlation metadata (required where supported).** Each prepared action carries a stable `generation_id` (UUID, created when the action is prepared). The service SHOULD attach it to the created proposal through Proposales' app-owned `data` metadata, so the created resource is recognizable as the product of that generation.
- **Recovery by search (MAY).** Runtime testing confirmed that app-owned custom `proposal.data` metadata can participate in `GET /v3/proposal-search` filtering using `filter[<key>]=<value>` for the keys tested. On retry after an unknown outcome (timeout, lost response), the service MAY therefore search for the `generation_id` before creating again and reuse the existing proposal if found. This is a lightweight duplicate-detection mechanism, not an exactly-once guarantee, and it does not replace durable application persistence if future requirements need stronger cross-session execution guarantees. Do not assume every key or value shape is filterable; the public contract does not establish that, and the adapter's tests cover only the keys the application uses.
- **Reads** are naturally idempotent and need nothing.

Rules:

- Non-idempotent external writes are never auto-retried by the integration client ([07-integrations.md](07-integrations.md) §5). The failure is surfaced and the human or flow decides.
- Do not introduce persistent infrastructure for theoretical exactly-once semantics. The MVP guarantees *detectable* duplicates, not impossible ones.
- If a future requirement needs durable cross-session idempotency (a persisted record distinguishing never attempted, executing, executed, failed), follow [09-database-and-persistence.md](09-database-and-persistence.md) §11 rather than inventing a ledger inside a feature.

## 9. Deterministic mutations

A mutation that has been reviewed and approved by a human MUST execute **exactly the reviewed data**, with no model in the path between approval and execution.

Concretely: the approved payload is a validated, serialized object. The executing service receives that object and calls the integration client with it. It MUST NOT call an LLM, re-derive fields, "clean up" text, or fill gaps. If the payload is incomplete, execution fails with `ValidationError` and the flow returns to preparation. Full lifecycle in [08-agent-architecture.md](08-agent-architecture.md) §6.

## 10. Rules that are absolute

- No secret-backed external API call from client code. All external calls go through `src/lib/<system>/` on the server.
- No `route.ts` or `actions.ts` that contains business rules, loops over external calls, or exceeds roughly 60 lines.
- No business rule duplicated between a UI component and a Route Handler or service. One owner, in `server/domain/` or `schemas/`.
- No `fetch` to an external host outside `src/lib/<system>/`.
- No module-level mutable state used as storage across requests.
- No application database access of any kind exists today; if persistence is ever introduced it follows [09-database-and-persistence.md](09-database-and-persistence.md), and services call persistence functions, never Route Handlers or components.
- No `console.log` in server code; use the structured logger in `src/lib/logger.ts` with redaction ([10-security-and-trust-boundaries.md](10-security-and-trust-boundaries.md) §7).
