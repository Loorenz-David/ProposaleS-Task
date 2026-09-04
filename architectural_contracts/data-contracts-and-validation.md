# Data Contracts and Validation

- **Applicability:** CROSS-CUTTING
- **Intent:** Runtime validation at every trust boundary; schemas are the source of truth for types.
- **Applies when:** data enters from the browser, a model, an external API, a webhook, storage, or env; defining a DTO; handling money, dates, enums, ids, nullable or unknown fields; mapping wire shapes.
- **Does not imply:** wrapping purely internal function calls in schemas.
- **Related:** [server-architecture.md](server-architecture.md), [integrations.md](integrations.md), [agent-architecture.md](agent-architecture.md), [security-and-trust-boundaries.md](security-and-trust-boundaries.md)

TypeScript types describe what the compiler may assume. They vanish at runtime. Every value that enters the application from outside the current process is `unknown` until a runtime schema says otherwise. This document defines where that happens and how contracts are shared.

## 1. Two kinds of contract

| Contract | Tool | Exists at | Purpose |
|---|---|---|---|
| Compile-time | TypeScript | build only | Catch mistakes inside our own code paths |
| Runtime | Zod | every execution | Reject or normalize data from outside our code paths |

Rule: a **runtime schema is the source of truth** and the TypeScript type is inferred from it (`type X = z.infer<typeof xSchema>`). Hand-written types for data that crosses a boundary are prohibited because they drift from what is actually checked.

Hand-written types are appropriate for purely internal shapes: component props, view-state unions, function options, branded ids.

## 2. Trust boundaries that MUST validate

| Boundary | Where the parse happens | Schema location |
|---|---|---|
| HTTP request into a Route Handler | first lines of the handler | `features/<x>/schemas/` |
| Server Action argument | first lines of the action | `features/<x>/schemas/` |
| Form submission (client) | hook, for UX; server, authoritatively | same schema, imported in both |
| External API response (Proposales) | inside the integration client, before returning | `src/lib/<system>/schemas.ts` |
| Inbound webhook body | Route Handler, after signature verification | `src/lib/<system>/schemas.ts` |
| AI model output (tool arguments, structured output) | tool `execute` entry and structured-output parser | tool `input` schema; feature `schemas/` |
| Environment variables | `src/lib/env/*` at module load | there |
| Data restored from any storage or cache | at read time | owning feature's `schemas/` |
| Mutation payload after human approval | in the executing service, before the integration call | `features/<x>/schemas/` |

If a value crosses one of these lines without a `parse`/`safeParse`, the code is wrong regardless of how confident the types look.

Rationale: the framework, the model, and the external API all produce data we do not control. The Proposales API explicitly states that new keys may be added without a version bump and that entire responses should not be forwarded unvalidated. A model can return any string. A user can craft any request.

## 3. Parsing unknown input

- Entry points accept `unknown` (or `Request`), never the target type.
- Use `safeParse` at transport boundaries so the error can be turned into an `ErrorDto` with field paths. Use `parse` inside services where a failure is a programming error.
- Zod's default behavior of **stripping unknown keys** is the required default. `.passthrough()` is prohibited on any schema whose output is stored, forwarded, or rendered. `.strict()` SHOULD be used on inbound mutation payloads at our own API boundary so that misspelled fields fail loudly instead of being ignored.
- Coercion (`z.coerce.*`) is allowed only at boundaries where the transport is known to stringify (query parameters, form data). Never coerce model output; require the correct type and treat a mismatch as the model being wrong.

## 4. Shared schemas

- Schemas live in `features/<x>/schemas/` (feature contracts) or `src/lib/<system>/schemas.ts` (external-system contracts). They are runtime-neutral: no React, no `server-only`, no `"use client"`, no environment access, no I/O.
- A schema file exports the schema and its inferred type together. Name pairs consistently: `createProposalInputSchema` / `CreateProposalInput`, `proposalSummaryDtoSchema` / `ProposalSummaryDto`.
- Suffixes carry meaning:
  - `Input` — what a caller sends to us (form, action, tool argument).
  - `Dto` — what we send to the client or return from a service. Shaped for consumption, safe to serialize.
  - `Response` / `Request` (in `src/lib/<system>/`) — the external system's wire shape. Never leaves the integration module.
- A schema that is only used server-side may still live in `schemas/` for consistency; it does not gain server dependencies just because its consumers are server-side.

## 5. Never trust a shape because TypeScript expects it

The following are all `unknown` and MUST be parsed even when a type annotation is available from a library or generated code:

- the JSON body of any HTTP response,
- the arguments a model supplies to a tool,
- structured output a model was "asked" to return,
- JSON parsed from any string,
- `FormData` and `URLSearchParams` values,
- anything read back from a cache, KV, or storage,
- anything received from another runtime (client → server, server → client).

A generated OpenAPI type for the Proposales API is a **hint** for writing the Zod schema, not a substitute for it.

## 6. Intentional handling of specific value kinds

| Kind | Rule |
|---|---|
| **Money** | Represent as `{ amountMinor: integer, currency: ISO-4217 string }` in domain and DTOs. Never floats in arithmetic. Proposales unit values are documented as integer cents; parse them as `z.number().int()`. Fields the external API documents as decimal `number` (for example package split values) are converted to minor units inside the integration mapper, with the rounding rule stated in a comment. Formatting for display happens in components only. |
| **Dates and times** | Cross every boundary as ISO 8601 strings with an explicit offset or `Z`. Convert to `Date` (or a temporal library if one is adopted) only at the point of computation. Proposales timestamps such as `expires_at` and `archived_at` are typed int64 in the public OpenAPI, which does not establish the epoch unit; runtime observations are millisecond-scale. The Proposales adapter's mapper owns that interpretation, converts to ISO strings, and is the only place the unit is assumed; application code never sees an epoch integer or reasons about units. If application persistence is ever added, timestamps are normalized here before they are stored ([database-and-persistence.md](database-and-persistence.md) §9). |
| **Enums** | Model with `z.enum([...])`. For **inbound external** values where the upstream may add variants (`ProposalStatus`, `TaxMode`), decide per field: either fail the parse (default, for values that drive logic) or map unknown values to an explicit `"unknown"` variant that the UI can render (only for display-only fields). Silent coercion to a default variant is prohibited. Our own inbound enums always fail on unknown values. |
| **Nullable vs optional** | `null` means "known to be empty"; `undefined`/absent means "not provided". Do not collapse them at the boundary unless the domain genuinely does not distinguish, and then do it in the mapper with a comment. Proposales marks many fields `nullable`; DTOs SHOULD convert `null` to `undefined` only when the field is optional in our domain. |
| **Identifiers** | Brand them at the type level (`type ProposalUuid = string & { __brand: "ProposalUuid" }`) via a Zod `.brand()` so a company id cannot be passed where a proposal uuid is expected. Proposales uses integer ids for companies/contacts and uuids for proposals; keep them distinct types. |
| **Unknown fields** | Stripped by default. If a feature needs to preserve opaque data (for example Proposales `data` metadata, which is a free-form object), type it as `z.record(z.string(), z.unknown())` on that one field and never inspect it without a further parse. |
| **Free text from models** | `z.string()` with a maximum length. Trimmed. Never interpreted as markup without sanitization. |

## 7. Domain representation vs external representation

The application has **its own** representation of a proposal, a recipient, a line item. The Proposales wire shape is not it, and neither is the AI provider's message shape.

```
Proposales wire shape  ──(parse: ProposalResponseSchema)──▶  Proposales typed response
                       ──(map: toProposalSummary)──────────▶  Domain / DTO shape used by features
Feature input          ──(map: toCreateProposalRequest)────▶  Proposales request shape
```

Rules:

- Mapping functions live in `src/lib/<system>/mappers.ts`. They are pure and unit-tested.
- Feature code MUST NOT import `*Response` or `*Request` types from an integration module. If a feature "needs" a raw field, the DTO grows to include it, deliberately.
- Naming stays in each world's convention: snake_case on the Proposales side, camelCase in our domain. The mapper is the only place both appear.
- Rationale: when the external API changes shape (which its documentation says it will), only the integration module changes. When we swap or add a provider, features do not notice.

## 8. Validation errors as data

Validation failures MUST produce a `ValidationError` whose `details` contains a list of `{ path: string[]; message: string }`. Zod's `error.issues` maps directly. The client renders them next to fields using the same paths as the schema. No string parsing of error messages anywhere.

## 9. What not to do

- No `as SomeType` on parsed JSON, fetched data, or model output.
- No `z.any()` except on a field explicitly documented as opaque, and then only as `z.unknown()`.
- No schema defined inline inside a component, action, or route; schemas are exported from `schemas/` so they can be shared and tested.
- No schema duplicated between client and server "for convenience".
- No use of a third-party response type as a function parameter outside `src/lib/<system>/`.
