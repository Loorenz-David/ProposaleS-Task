# Security and Trust Boundaries

- **Applicability:** CROSS-CUTTING
- **Intent:** State what is trusted and the rules that follow: secrets server-side, authorization server-side, untrusted inputs parsed, least capability.
- **Applies when:** handling any input from browser, model, external API, or webhook; touching secrets or env; adding an endpoint, tool, redirect, log line, or dependency; scoping an operation.
- **Does not imply:** adding authentication; the application has none by decision.
- **Related:** [02-runtime-boundaries.md](02-runtime-boundaries.md), [06-data-contracts-and-validation.md](06-data-contracts-and-validation.md), [08-agent-architecture.md](08-agent-architecture.md), [07-integrations.md](07-integrations.md)

Security in this codebase is a consequence of the runtime boundary and the validation rules, applied consistently. This document lists the trust assumptions and the rules that follow from them. It does not replace a security review before production.

## 1. What is trusted and what is not

| Source | Trust | Consequence |
|---|---|---|
| Our server code and validated configuration | Trusted | May hold secrets, make decisions |
| The browser (requests, Server Action arguments, cookies, headers, form data) | **Untrusted** | Parse everything; authorize everything; assume hostile |
| AI model output (text, tool arguments, structured output) | **Untrusted** | Parse everything; never execute, fetch, or mutate based on it without validation and, for consequential actions, approval |
| External API responses (Proposales, provider) | **Untrusted until validated** | Parse with schemas; strip unknown fields; do not forward raw |
| Inbound webhooks | **Untrusted until authenticated** | Verify signature or secret before parsing |
| Environment variables | Trusted after schema validation at startup | Server-only |
| Third-party packages | Conditionally trusted | See §11 |

## 2. Secrets

- Secrets exist only in server runtime and are read only in `src/lib/env/server.ts`. See [02-runtime-boundaries.md](02-runtime-boundaries.md) §8.
- `NEXT_PUBLIC_*` variables are public. Nothing sensitive is ever named that way.
- Secrets MUST NOT be: logged, included in error `message` or `details`, sent to the model in any prompt or tool result, placed in URLs, stored in client state, or committed. `.env` is ignored; `.env.example` has no values.
- Integration clients hold the credential in module scope on the server and attach it inside `http.ts`. No function outside `src/lib/<system>/` ever receives a token as an argument.

## 3. Authorization is server-side

- Every Route Handler, Server Action, and agent tool that reads or changes data MUST establish who is calling and whether they may do this, before calling a service, and the service MUST re-check anything scope-related (for example the `companyId` the operation targets).
- The application has **no application-level authentication requirement** (resolved in [README.md](README.md)). Authentication is not introduced as conventional infrastructure. All secrets and privileged operations remain server-side regardless. Deployment-level access protection (for example Vercel deployment protection), if configured, is separate from application authentication and is not relied upon by code. If the product becomes multi-user or multi-tenant, authentication and authorization receive their own architecture decision before implementation, and the `AuthenticationError`/`AuthorizationError` codes in the taxonomy are ready for it.
- UI conditions (hidden buttons, disabled fields) are not authorization. They are convenience. The server decides.
- Scope narrowing is the default: an operation runs against the deployment's configured company (`PROPOSALES_COMPANY_ID`, single company per deployment by decision) and nothing wider. A tool's `ctx` fixes the scope; the model cannot widen it by passing a different id.

## 4. Input validation

Every trust boundary parses with a schema before use. The complete list is in [06-data-contracts-and-validation.md](06-data-contracts-and-validation.md) §2. Additional security-specific rules:

- Length limits on every string that reaches storage, a prompt, or an external system.
- Identifiers validated by format (uuid, positive integer) before being interpolated into any path or query, and always URL-encoded at the transport layer.
- Free text is data. It is never interpreted as HTML, Markdown-with-HTML, a template, a URL to fetch, or a command. Rendering user or model text as rich content requires a sanitizer and a decision recorded in the feature plan.

## 5. Mutation approval boundary

Consequential mutations pass through the approval lifecycle in [08-agent-architecture.md](08-agent-architecture.md) §6. Security properties of that boundary:

- The approval Server Action re-validates the payload it receives and rejects a payload that still carries `missing` entries or consequential assumptions. Where the application keeps prepared-action state (transient in the MVP), it SHOULD refuse a second execution of the same `preparedActionId` within that state's lifetime with `ConflictError`; durable cross-session protection is not claimed unless persistence exists ([09-database-and-persistence.md](09-database-and-persistence.md) §11).
- The payload the human approved is re-validated on the server. Client-side edits are input, not truth.
- Execution is by ordinary code with no model in the path, so prompt injection cannot alter an approved payload.
- The executing service accepts only an `ApprovedAction`; a consequential mutation reached through any other path is refused with `ApprovalRequiredError`. The result is returned as an `ExecutionResult` to the caller and logged with its ids. Durable audit storage of that result is not required by this contract; see [08-agent-architecture.md](08-agent-architecture.md) §6.

## 6. Prompt injection and model-mediated attacks

Content the model reads (user messages, proposal text, content library descriptions, external API fields) may contain instructions. Therefore:

- Tool results and user content are placed in the prompt as labeled data, never concatenated into instructions.
- The model's authority is limited to the tool kinds it has been given. Injection can at most cause a wasted read or a bad prepared action, which the human reviews. It cannot cause a mutation.
- Tool outputs never include secrets, internal URLs, or other users' data outside scope, so exfiltration through model output has nothing to carry.
- Model output rendered in the UI is text, not markup, unless sanitized.

## 7. Logging

- Use the structured logger in `src/lib/logger.ts` on the server. Log events, not sentences: `{ event, runId, traceId, proposalUuid, durationMs, outcome }`.
- Never log: secrets, `Authorization` headers, full request or response bodies from external systems, prompt text, model output text, personal data beyond what is needed to correlate (prefer ids over names and emails).
- Redaction is centralized: the logger applies a denylist of key names (`authorization`, `apiKey`, `token`, `password`, `secret`, `email` unless explicitly allowed) before emitting.
- Errors are logged once, at the transport layer, with `cause` chain and `code`. Services do not log-and-rethrow.

## 8. SSRF, injection, and tool inputs

- No tool, service, or Route Handler fetches a URL supplied by the browser or the model. External hosts are fixed inside integration clients. If a feature genuinely needs user-supplied URLs (an image link, a website), the plan MUST specify an allowlist of hosts and schemes and the fetch happens through a dedicated integration module that validates against it.
- Path and query parameters built from input are encoded by the transport layer, never by string concatenation in services or tools.
- Tool argument schemas are narrow: enums instead of free strings where possible, bounded numbers, no "raw filter expression" fields.
- Filenames, ids, and keys from any untrusted source are validated against a pattern before being used in paths, keys, or lookups. The existing `scripts/update-proposales-api-docs.sh` demonstrates the standard: it rejects `..` and absolute segments before writing files.

## 9. Least capability

- A feature's agent receives only the tools it needs for that feature. There is no global tool registry exposed wholesale.
- Tools are `read` by default. `prepare` is added when drafting is the purpose. `mutate` requires an explicit statement in the feature plan and is limited to reversible, low-consequence operations.
- Route Handlers expose one resource each. Server Action files export only the actions the UI calls.
- Integration clients expose only the endpoints the application uses. Do not wrap the entire vendor API "for completeness".

## 10. Redirects and external links

- Server-side redirects go only to paths within this application or to an allowlisted set of external origins defined in one constant. Never redirect to a URL taken from input without matching the allowlist.
- Links rendered to external systems (for example a proposal in Proposales) are built from validated ids and a fixed base URL, never from an upstream-provided arbitrary URL, unless the upstream field is documented as a URL and it is validated to match the expected origin.
- External links use `rel="noopener noreferrer"`.

## 11. Dependencies

- Adding a package requires a reason in the pull request: what it does that the platform or existing dependencies do not.
- Prefer packages that are widely used, actively maintained, typed, and small. Avoid packages that pull in a server runtime into the client graph or the reverse.
- Pin versions via the lockfile; upgrade deliberately; read changelogs for anything touching validation, auth, HTTP, or the AI provider.
- Run a vulnerability audit in CI. A `server-only` module MAY depend on Node-specific packages; a shared or client module MUST NOT.
- Never install a package to run code from the model or the user (eval, sandboxes, template engines with code execution).

## 12. Headers and platform

- Set a restrictive `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and `Permissions-Policy` in `next.config` headers once the app is scaffolded; tighten as features settle.
- Server Actions carry framework CSRF protection based on origin checks; do not disable it. Route Handlers that accept browser POSTs from this app SHOULD verify `Origin`/`Sec-Fetch-Site` or accept only same-origin calls.
- Webhook Route Handlers are the only endpoints that accept cross-origin POSTs, and they authenticate by signature.
