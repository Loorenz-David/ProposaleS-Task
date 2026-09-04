# Agent Architecture

- **Applicability:** CONDITIONAL
- **Intent:** Server-only agents with explicit, kinded tools; consequential mutations pass through human approval and execute deterministically.
- **Applies when:** adding or changing prompts, tools, agent runs, prepared actions, approval or execution flows, provider usage, or UI that renders model output.
- **Does not imply:** a feature involves a model, or durable audit storage is required.
- **Related:** [server-architecture.md](server-architecture.md), [integrations.md](integrations.md), [security-and-trust-boundaries.md](security-and-trust-boundaries.md), [database-and-persistence.md](database-and-persistence.md) only if durable records are introduced

This application runs AI agents that read business data, prepare actions, and, after human approval, cause mutations in an external commercial system. The model is a reasoning component inside a deterministic application. It is never the application itself.

## 1. Principles

1. **Agent reasoning is server-only.** Prompts, tool loops, provider calls, and tool execution run in `features/<x>/server/agent/` and `src/lib/agent/`, guarded by `server-only`. The browser sees agent state as DTOs and streams; it never sees prompts, tool definitions, or provider responses.
2. **Tools are explicit capabilities.** A tool is a named, described, schema-validated function with a declared kind. The model has no access to code, the file system, the network, or integration clients except through tools.
3. **Read, prepare, and mutate are different capabilities** and are never mixed in one tool.
4. **The model never receives secrets**, raw credentials, internal URLs, or full third-party payloads.
5. **After human approval, execution is deterministic.** The approved payload is executed as-is by ordinary application code. No model participates.
6. **Business logic lives in code, not prompts.** Prompts express goals, constraints, and formatting. Rules that decide validity, pricing, permissions, or what constitutes a complete action are enforced by schemas and services and would still hold if the prompt were deleted.
7. **The agent layer is replaceable.** Swapping the provider, the prompt strategy, or the orchestration style MUST NOT require touching features' services, schemas, or integration clients.

## 2. Where things live

```
src/lib/agent/                          # feature-agnostic runtime primitives (server-only)
├── define-tool.ts                      # defineTool({ name, description, kind, input, output, execute })
├── run.ts                              # the tool-calling loop over @/lib/ai; budgets; tracing hooks
├── approval.ts                         # PreparedAction / ApprovedAction / ExecutionResult schemas and helpers
└── types.ts

src/features/<feature>/server/
├── tools/                              # one file per tool
│   ├── search-proposals.tool.ts        # kind: "read"
│   ├── get-content-item.tool.ts        # kind: "read"
│   └── prepare-proposal-draft.tool.ts  # kind: "prepare"
├── agent/
│   ├── <name>.agent.ts                 # tool set, system prompt assembly, entry function runXAgent(input, ctx)
│   └── prompts/                        # prompt text as versioned TS constants, no logic
└── services/
    └── execute-approved-proposal-draft.ts   # deterministic execution; no model
```

The AI provider adapter is `src/lib/ai/` ([integrations.md](integrations.md) §8).

## 3. Tool contract

```ts
export const searchProposalsTool = defineTool({
  name: "search_proposals",                      // snake_case, verb_noun, unique
  description: "Find proposals for the current company by recipient, title, or status. Read-only.",
  kind: "read",                                  // "read" | "prepare" | "mutate"
  input: z.object({
    query: z.string().min(1).max(200),
    status: proposalStatusSchema.optional(),
    limit: z.number().int().min(1).max(20).default(10),
  }),
  output: z.object({ items: z.array(proposalSearchItemDtoSchema) }),
  async execute(input, ctx) {                    // input already parsed; ctx carries caller identity, trace id, budget
    return searchProposals(input, ctx);          // a feature service, never raw HTTP
  },
});
```

Rules:

- `input` and `output` are Zod schemas. The runtime validates both. Model-supplied arguments that fail the input schema are returned to the model as a structured tool error (`{ error: { code: "invalid_arguments", issues } }`), never executed with defaults.
- `description` states what the tool does, when to use it, and what it does not do. It is the model's only documentation.
- `execute` calls a service or an integration client. It contains no business rules and no HTTP.
- `output` is **shaped for the model**: the fields needed to reason, with ids to reference and short human-readable summaries. Bounded lists, truncated text with an explicit `truncated: true`, no raw upstream objects. Rationale: large raw payloads waste context, leak fields the model should not see, and invite the model to echo internal identifiers as facts.
- Tools MUST NOT accept URLs, file paths, or raw query fragments that the runtime would fetch or execute. See [security-and-trust-boundaries.md](security-and-trust-boundaries.md) §8.
- `ctx` carries: caller identity (when the app has one), `traceId`, `runId`, remaining budget, and the `companyId` scope. The tool never widens scope beyond `ctx`.

### Tool kinds

| Kind | May | Must not | Availability |
|---|---|---|---|
| `read` | Query services and integration reads | Change any state anywhere | Always available to the agent |
| `prepare` | Produce a `PreparedAction` (a fully specified, validated, not-yet-executed mutation) | Execute anything; call integration writes | Available when the run's purpose is to draft an action |
| `mutate` | Execute a mutation directly | Be used in any flow where product requirements specify human approval | Only in runs explicitly configured as autonomous for low-consequence operations, recorded in the feature plan |

A `mutate` tool that is actually consequential (creates or sends anything commercial, touches recipients, money, quantities, dates, or obligations) MUST NOT exist. Model that operation as `prepare` plus deterministic execution.

## 4. What the model may do autonomously

- Read: search, fetch, compare, summarize, using `read` tools, within budget.
- Reason: plan steps, decide which tools to call, draft copy, propose structure.
- Prepare: assemble a `PreparedAction` for a consequential mutation.
- Ask: return a clarification request when required information is materially missing.

The model may make **harmless copy assumptions** (tone, greeting, paragraph structure, a reasonable title) and MUST mark them as assumptions in the prepared action.

The model MUST NOT make **consequential business assumptions**. The following fields are consequential and are either sourced from a tool result, provided by the user, or left empty with a clarification request:

- prices, discounts, taxes, currencies, totals
- recipients (names, emails, companies)
- quantities, units, dates, durations, deadlines
- contractual terms, cancellation and payment conditions, obligations
- identifiers of existing records (proposal uuids, content ids, template ids)

A value the model "remembers", infers from a similar case, or computes from unverified numbers is a hallucination for these purposes. Schemas for `PreparedAction` MUST carry provenance so this is checkable (see §6).

## 5. Clarification

When required information is materially missing or ambiguous, the agent returns a `clarification` result, not a guess:

```ts
{ kind: "clarification", questions: [{ field: "recipient.email", question: "Which contact should receive this?", options?: [...] }] }
```

Distinguish:

- **Missing consequential data** → clarification, always.
- **Missing harmless copy** → proceed with a marked assumption.
- **Ambiguity resolvable by a read tool** → call the tool first; ask only if it remains ambiguous.

The run loop MUST enforce a bounded number of tool calls per run; when exhausted without a result, the run ends in `clarification` or `failed`, never in a fabricated action.

## 6. Human-in-the-loop lifecycle (normative)

```
Human intent
  → AI reasons and gathers information            (read tools, bounded)
  → AI prepares an action                         (prepare tool → PreparedAction, validated, with provenance)
  → human approves or corrects                    (review UI shows every consequential field; edits produce ApprovedAction)
  → deterministic API mutation                    (service executes ApprovedAction.payload exactly; no model)
  → human reviews in external system              (e.g. the draft in Proposales)
  → human performs final consequential external action when applicable  (e.g. sending the proposal)
```

Data structures, defined by Zod in `src/lib/agent/approval.ts` and specialized per feature:

```ts
PreparedAction = {
  id, runId, kind: "create_proposal_draft" | ...,
  payload: <feature payload schema>,                    // exactly what would be executed
  summary: string,                                      // human-readable, for review
  provenance: Record<fieldPath, { source: "user" | "tool:<name>" | "assumption" | "derived"; ref?: string }>,
  assumptions: Array<{ path: string; note: string }>,   // every model assumption, consequential ones are errors
  missing: Array<{ path: string; question: string }>,   // if non-empty, the action is not approvable
  intent: { userMessageId, text },                      // traceability to the human request
  preparedAt: ISO string
}

ApprovedAction = {
  preparedActionId, payload,                            // payload after human corrections, re-validated
  corrections: Array<{ path; before; after }>,          // diff vs prepared payload
  approvedBy, approvedAt
}

ExecutionResult = {
  approvedActionId, executedAt, result: { ok: true; externalId } | { ok: false; error: ErrorDto }
}
```

Rules:

- A `PreparedAction` with any `missing` entry, or any `assumption` on a consequential path, MUST be rejected by the approval action with `ValidationError`. The UI cannot approve it; it must be corrected or sent back for another round.
- Approval is an explicit Server Action that takes the `preparedActionId` and the final payload, re-parses the payload with the feature schema, records the diff, and calls the executing service. It MUST NOT call the model.
- The executing service receives `ApprovedAction` and calls the integration client with a mapper. If the payload does not validate, execution fails; nothing "fixes" it.
- After execution, the result is shown to the human with a link or reference into the external system. The final consequential step (sending, signing, invoicing) is performed by the human in that system unless a feature plan explicitly and deliberately automates it, in which case that automation is itself an approved mutation.
- **Integrity invariant.** The system MUST preserve the integrity of the transition from agent-prepared action to human-reviewed action to executed mutation. For a consequential mutation: (1) the model may reason and prepare structured business data; (2) the human may review and correct it; (3) the human explicitly approves the resulting payload; (4) the server validates the exact approved payload; (5) the mutation executes deterministically from that payload; (6) no model regenerates, reinterprets, or silently modifies the approved payload before execution. This invariant is about the **flow within a request sequence**, not about storage.
- **Durable audit storage is not required** for every HITL interaction. In the MVP, prepared-action state MAY live in transient application or client state; the `PreparedAction`, `ApprovedAction`, and `ExecutionResult` shapes above are serialization contracts, not tables. Durable traceability MAY be introduced when product, security, compliance, debugging, or operational requirements justify it, through the decision record in [database-and-persistence.md](database-and-persistence.md) §14. A database is never introduced merely to satisfy HITL terminology.
- The ids in these structures (`runId`, `preparedActionId`, `generation_id`) exist so that logs and external metadata can be correlated when needed; correlation through logs is sufficient for the MVP.

## 7. Prompts

- Prompts are TypeScript constants or small pure functions in `agent/prompts/`, versioned by name (`draftAssistantSystemPromptV2`). Changing a prompt is a code change with review and tests.
- Prompts MAY contain: role, goals, tool-usage guidance, output format, tone constraints, the list of consequential fields and the instruction never to invent them.
- Prompts MUST NOT be the only place a rule exists. If "never exceed a 20% discount" matters, a schema refinement or domain rule enforces it and the prompt merely mentions it.
- Prompts receive **data**, never secrets, environment values, or internal URLs. Context injected into prompts is built from DTOs, and user-provided text is delimited and labeled as untrusted content.

## 8. Provider independence

- Features and agents import `@/lib/ai`. The vendor SDK is imported only inside `src/lib/ai/`.
- The tool-definition helper produces a provider-neutral tool description; `src/lib/ai/` converts it to the provider's format.
- Structured output is validated by our Zod schema regardless of what the provider claims to guarantee.
- Model choice, temperature, and token budgets are configuration in `src/lib/ai/`, not scattered literals.

## 9. Runtime constraints on Vercel

- A run is bounded in wall time, tool calls, and tokens. Budgets are inputs to `run()`, enforced by the loop, and exceeded budgets end the run with a `failed` result that explains the budget hit.
- Long interactions are designed as **turns**: each server invocation completes a bounded amount of work and returns a serializable state the client can resume from. Runs MUST NOT depend on an in-memory continuation surviving between requests.
- Streaming to the UI (progress, tokens) goes through a Route Handler and a `client/` adapter; the stream carries DTOs, never raw provider events.

## 10. Observability

Every run emits structured log events with `runId`, `traceId`, tool names, durations, token counts, and outcomes. Logs are the MVP's traceability mechanism; they are operational records, not a business ledger ([database-and-persistence.md](database-and-persistence.md) §13). Logs contain **ids and shapes**, not prompt bodies, tool arguments with personal data, or model output text, unless a dedicated, redacted debug mode is explicitly enabled in a non-production environment.
