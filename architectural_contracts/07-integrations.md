# Integrations

- **Applicability:** CONDITIONAL
- **Intent:** One server-only client module per external system owns authentication, HTTP, validation, mapping, and error translation.
- **Applies when:** calling Proposales or the AI provider; adding any external HTTP; receiving a webhook; changing an adapter's retry, timeout, or error behavior; adding a new external system.
- **Does not imply:** wrapping unused endpoints or adding adapters for systems the application does not call.
- **Related:** [04-server-architecture.md](04-server-architecture.md), [06-data-contracts-and-validation.md](06-data-contracts-and-validation.md), [10-security-and-trust-boundaries.md](10-security-and-trust-boundaries.md), [08-agent-architecture.md](08-agent-architecture.md) §3

Every external system the application talks to is wrapped by exactly one integration module. Feature code, services, and agent tools call that module. Nothing else in the codebase knows the external system's URL, authentication, wire format, or error shape.

Proposales is the concrete example throughout; the rules apply to every external system, including the AI provider.

## 1. One boundary per system

```
src/lib/proposales/
├── index.ts        # Public surface: the client instance/factory and domain-facing types. Nothing else is imported from outside.
├── client.ts       # import "server-only". Typed methods: getProposal, createProposal, searchProposals, listContent, ...
├── http.ts         # Transport mechanics: base URL, auth header, timeout, retry, JSON, error translation
├── schemas.ts      # Zod schemas for request and response wire shapes (runtime-neutral file, server-only consumers)
├── mappers.ts      # Wire shape ⇄ domain/DTO shape. Pure.
├── errors.ts       # ProposalesError extends IntegrationError; maps upstream status/message
└── fixtures/       # Optional: recorded responses for tests
```

Rules:

- The folder is `server-only`. Its `index.ts` MUST import `server-only` so the entire module fails the build if it enters the client graph.
- There is one client per external system, not one per feature and not one per endpoint. Features share it.
- Authentication and configuration are read **inside** the module from `src/lib/env/server.ts`. Callers never pass tokens.
- The module exposes **operations named after what they do for the domain**, not after HTTP verbs: `createProposalDraft(input)`, not `post("/v3/proposals", body)`.
- No `fetch` to an external host exists anywhere outside `src/lib/<system>/http.ts`. This is lint-enforced by restricting `fetch` usage patterns in review and by the folder rule in [03-feature-architecture.md](03-feature-architecture.md) §4.

## 2. What the client hides

| Concern | Owned by | Callers see |
|---|---|---|
| Base URL, per-endpoint versions (`/v1/attachments`, `/v3/proposals`) | `http.ts` / `client.ts` | Nothing |
| `Authorization: Bearer <token>` | `http.ts` | Nothing |
| `company_id` injection (query string or body, per endpoint) | `client.ts` | An optional override where the domain needs it |
| JSON encoding, `Content-Type` | `http.ts` | Nothing |
| Timeouts | `http.ts` (default per client, override per call) | A thrown `IntegrationError` with `retryable` |
| Retries | `http.ts`: idempotent reads only, bounded, with backoff; never retry unsafe writes automatically | Nothing |
| Response validation | `client.ts` with `schemas.ts` | Typed, validated data |
| Wire naming (snake_case, int64 epoch timestamps of observed millisecond scale, cents) | `mappers.ts` | Domain naming (camelCase, ISO strings, money objects) |
| Upstream error bodies | `errors.ts` | `IntegrationError` subclass with safe `message`, `details.system`, `details.status`, `details.retryable`, `details.upstreamCode?` |

## 3. Typed and validated responses

Every method:

1. builds the request from a typed input,
2. sends it via `http.ts`,
3. parses the body with the response schema from `schemas.ts` (`safeParse`; on failure throw `IntegrationError` with `details.reason = "schema_mismatch"` and log the issue paths, never the body),
4. maps it to the domain shape with `mappers.ts`,
5. returns the domain shape.

```ts
// src/lib/proposales/client.ts
import "server-only";
export async function getProposal(uuid: ProposalUuid): Promise<Proposal> {
  const raw = await proposalesHttp.get(`/v3/proposals/${encodeURIComponent(uuid)}`);
  const parsed = proposalResponseSchema.safeParse(raw);
  if (!parsed.success) throw ProposalesError.schemaMismatch("getProposal", parsed.error);
  return toProposal(parsed.data);
}
```

The Proposales documentation states that response objects may gain keys without a version bump and that only the keys the application needs should be read. Zod's strip-by-default behavior implements that rule; schemas MUST NOT use `.passthrough()`.

Schemas, mappers, and fixtures are derived from the vendored snapshot in `api-documentation/proposales/`. When that snapshot is refreshed, the post-refresh drift review in [its README](../api-documentation/proposales/README.md) decides whether this module's assumptions, schemas, tests, or README need re-evaluation.

## 4. Error translation

- Upstream 4xx/5xx MUST become an `IntegrationError` (or subclass) before leaving the module. Raw `Response` objects, `fetch` errors, and `AbortError` never escape.
- The Proposales error body is `{ error: { message } }` and its messages are documented as safe for user interfaces. The module MAY forward `error.message` into `IntegrationError.message`. Other systems' messages are NOT assumed safe; default to a generic message and keep the upstream message in `cause` for logging.
- Map upstream status to semantics where the meaning is clear: 404 → `NotFoundError` from the domain's perspective is acceptable **only** when the service decides so; the client itself reports `IntegrationError` with `details.status = 404` and lets the service translate. This keeps "the proposal does not exist" (a domain fact) separate from "the upstream said 404" (an integration fact).
- 429 and 5xx set `retryable = true`. 4xx other than 429 set `retryable = false`.

## 5. Retries, timeouts, and budgets

- Every request has a timeout. No exceptions. Default is a per-client constant; agent tool calls MAY set a shorter one.
- Retries apply only to operations declared idempotent in the client (reads, and writes that carry an idempotency key the upstream honors). A create without upstream idempotency support is never auto-retried; the failure is surfaced and the caller (human or flow) decides.
- Backoff is bounded (small attempt count, capped delay). Serverless execution time is finite; a retry loop is not a queue.
- Rate limits and pagination are handled inside the client. The Proposales API currently documents no pagination; when it appears, the client absorbs it and exposes an iterator or a complete list, never page tokens to features.

## 6. Configuration ownership

- `PROPOSALES_API_KEY` and `PROPOSALES_COMPANY_ID` are read by `src/lib/env/server.ts` and consumed only by `src/lib/proposales/`. The deployment is single-company by decision ([README.md](README.md) "Resolved decisions"); the client injects the configured company id and exposes no per-call company override. If multi-company support is ever introduced, company identity moves into authenticated server-side tenant context under its own architecture decision, and only then does the client gain a `companyId` parameter. Features never read these variables.
- Correlation metadata: the proposal `data` object accepts app-owned metadata, and runtime testing confirmed that `GET /v3/proposal-search` can filter on such keys with `filter[<key>]=<value>` for the keys tested. The client exposes a typed way to attach the application's `generation_id` on create and to search by it ([04-server-architecture.md](04-server-architecture.md) §8). The mapper owns the key name; features pass the id, not the wire shape. The adapter's fixture tests cover the specific keys the application relies on; nothing broader is assumed about which keys or value shapes are filterable.
- A test double (`createFakeProposalesClient()`) lives beside the real client so services and tools can be tested without HTTP. It implements the same interface, which is exported as a type from `index.ts`.

## 7. Agent tools and integrations

Agent tools (see [08-agent-architecture.md](08-agent-architecture.md)) MUST call feature services or integration client methods. A tool MUST NOT contain `fetch`, construct URLs, or hold credentials. The tool shapes the result for the model; the client shapes the result for the application. Two different responsibilities, two different modules.

## 8. The AI provider is an integration

`src/lib/ai/` wraps the model provider with the same discipline: `server-only`, configuration owned inside, a provider-neutral interface (`generate`, `generateStructured`, `stream`, tool-call plumbing), provider error translation, timeouts, and budget enforcement. Features and agents import from `@/lib/ai`, never from a vendor SDK directly. Replacing or adding a provider touches this folder only.

## 9. Inbound integrations (webhooks)

When an external system calls us:

- One Route Handler per webhook source under `src/app/api/webhooks/<system>/route.ts`.
- Verify authenticity first (signature, shared secret, or allowlisted source as the system supports), then parse the body with a schema from `src/lib/<system>/schemas.ts`, then call one service.
- Respond fast; do heavy work in the service with bounded time. Never trust webhook payload fields to be authoritative without re-reading from the source when the decision is consequential.

## 10. Adding a new external system

1. Create `src/lib/<system>/` with the files in §1 that are actually needed.
2. Add its variables to `src/lib/env/server.ts` and `.env.example`.
3. Write schemas for exactly the endpoints used, from the vendor's spec (for Proposales: `api-documentation/proposales/openapi.json`).
4. Write mappers and their tests.
5. Export a client interface type and a fake.
6. Only then write the service that uses it.
7. Write `src/lib/<system>/README.md` describing how this application uses the system: endpoints used, configuration ownership, quirks, mapping and error-translation decisions ([14-documentation-principles.md](14-documentation-principles.md) §9). Vendor documentation is linked, not paraphrased.
