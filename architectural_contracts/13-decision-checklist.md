# Decision Checklist

- **Applicability:** ALWAYS
- **Intent:** The questions to answer before adding a file, dependency, or feature, plus naming and dependency-direction summaries.
- **Applies when:** before creating anything; when unsure which layer a piece of logic belongs to. Route to the contracts first with [01-implementation-contract-guide.md](01-implementation-contract-guide.md).
- **Does not imply:** a new rule; every question points to the contract that owns the answer.
- **Related:** all contracts

Apply this before adding a file, a function, a dependency, or a feature. If any answer is "I don't know", the design is not finished. Each question links to the contract that decides it. Select which contracts apply to the task first with [01-implementation-contract-guide.md](01-implementation-contract-guide.md); this checklist then makes their questions explicit.

## 1. Before adding a file

1. **Does this run in the browser, on the server, or both?**
   Browser → `components/`, `hooks/`, or `client/`, with `"use client"` only if it needs interactivity. Server → `server/` or `src/lib/<system>/`, with `server-only`. Both → `schemas/` or `types/`, with no runtime-specific imports. [02-runtime-boundaries.md](02-runtime-boundaries.md)

2. **Is this authoritative logic or interaction logic?**
   Authority (rules, permissions, external calls, mutations) → server. Interaction (view state, sequencing user steps, rendering) → client. If it is both, split it. [03-feature-architecture.md](03-feature-architecture.md) §2

3. **Does it require a secret or configuration?**
   Then it is server-only, reads from `src/lib/env/server.ts`, and lives in or is called from `src/lib/<system>/`. [02-runtime-boundaries.md](02-runtime-boundaries.md) §8

4. **Is the input trusted?**
   Browser, model, external API, webhook, storage: no. Where is the `parse`? If there is none, add it at the entry point. [06-data-contracts-and-validation.md](06-data-contracts-and-validation.md) §2

5. **Is this external-system behavior behind an adapter?**
   A `fetch` to an external host or a vendor SDK import belongs only in `src/lib/<system>/`. Features call the client. [07-integrations.md](07-integrations.md)

6. **Does this dependency direction violate the runtime boundary or the feature layering?**
   Check the prohibited-imports table. `app → features → lib → node_modules`, never upward, never client → server internals, never lib → features. [03-feature-architecture.md](03-feature-architecture.md) §4

7. **Can this logic be tested without rendering UI and without the network?**
   If not, it is in the wrong layer. Domain rules and services take plain input and fakes. [11-testing-principles.md](11-testing-principles.md)

8. **Am I adding an abstraction because it is needed, or because it sounds architectural?**
   A second consumer, a test double, or a security boundary justifies it. "Might be reused" does not. [12-anti-patterns.md](12-anti-patterns.md) "Structure and abstraction"

## 2. Before adding a component or hook

9. **Is this component doing orchestration that belongs in a hook, or computing something that belongs on the server?**
   Components render and wire events. [05-client-architecture.md](05-client-architecture.md) §2

10. **Is async status represented as a discriminated union, with errors as `ErrorDto` and retry only when retryable?** [05-client-architecture.md](05-client-architecture.md) §3, §6

11. **Is client validation using the shared schema, and does the server still validate?** [05-client-architecture.md](05-client-architecture.md) §8

12. **Is every interactive element a real control, labeled, keyboard-operable, with a visible pending state?** [05-client-architecture.md](05-client-architecture.md) §7

## 3. Before adding a Route Handler, Server Action, or service

13. **Is this Route Handler or Server Action too thick?**
    Parse, context, one service call, map result. Roughly 60 lines. Business logic goes to a service. [04-server-architecture.md](04-server-architecture.md) §2–3

14. **Is the input parameter `unknown` and parsed before use?** [04-server-architecture.md](04-server-architecture.md) §3

15. **Which `AppError` does each failure map to, and does the `message` stay safe?** [04-server-architecture.md](04-server-architecture.md) §6

16. **What happens if this runs twice?**
    The UI blocks re-submission while pending; creates carry a `generation_id` in Proposales `data` metadata; recovery MAY search for it (verified filterable via `/v3/proposal-search`). Detection, not exactly-once. No persistent ledger. [04-server-architecture.md](04-server-architecture.md) §8

17. **Is the rule this service enforces already defined somewhere else (a component, another service)?**
    One owner. [04-server-architecture.md](04-server-architecture.md) §5

## 4. Before adding an agent, tool, or prompt

18. **Is the tool `read`, `prepare`, or `mutate`, and is that the least capability that works?** [08-agent-architecture.md](08-agent-architecture.md) §3

19. **Is an AI model deciding a mutation that should require approval?**
    Consequential mutations are `prepare` → approval → deterministic execution. [08-agent-architecture.md](08-agent-architecture.md) §6

20. **After approval, is the exact reviewed data what gets executed, with no model in the path?** [08-agent-architecture.md](08-agent-architecture.md) §6, [04-server-architecture.md](04-server-architecture.md) §9

21. **Can the model invent a consequential field (price, recipient, quantity, date, term, id) here, and does provenance make that detectable?** [08-agent-architecture.md](08-agent-architecture.md) §4

22. **Does the tool output carry only what the model needs, with no secrets, raw upstream objects, or out-of-scope data?** [08-agent-architecture.md](08-agent-architecture.md) §3, [10-security-and-trust-boundaries.md](10-security-and-trust-boundaries.md) §6

23. **Would this rule still be enforced if the prompt were deleted?** If not, it is not a rule yet. [08-agent-architecture.md](08-agent-architecture.md) §7

24. **Does this couple anything outside `src/lib/ai/` to a specific provider?** [07-integrations.md](07-integrations.md) §8

## 5. Before adding a dependency or infrastructure

25. **What does this package do that the platform or an existing dependency does not?** [10-security-and-trust-boundaries.md](10-security-and-trust-boundaries.md) §11

26. **Does this introduce a database, authentication, a state library, a queue, or a cache?**
    Stop. That is an architectural decision recorded in [README.md](README.md) "Resolved decisions", not a feature change.

## 6. Before persisting anything

27. **Does this feature genuinely require application-owned durable state?**
    State that must survive beyond a request or browser session, and cannot live in Proposales. [09-database-and-persistence.md](09-database-and-persistence.md) §3

28. **Who owns this data?**
    Application-owned, or Proposales-owned? If it references a Proposales entity, which mode: external id only, snapshot, cache, projection, or authoritative copy? [09-database-and-persistence.md](09-database-and-persistence.md) §4

29. **Could this remain transient, or live in the external system of record?**
    Prepared proposals under review, corrections, and pending status are transient in the MVP by decision. Created proposals live in Proposales.

30. **What durability or consistency requirement justifies persistence, and what happens between the database write and the Proposales call?**
    Name the requirement, the consistency strategy, and the race. If you cannot, the answer is "no database". [09-database-and-persistence.md](09-database-and-persistence.md) §10–12, §14

## 7. Before closing implementation

31. **Did this implementation make any durable documentation false, incomplete, or misleading?**
    Evaluate after behavior is verified, not before. If yes, patch the authoritative owner in the same change; if no, leave documentation alone. The closeout checklist and the ownership table live in [14-documentation-principles.md](14-documentation-principles.md) §4 and §8 and are not repeated here.

## 8. Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Folders | kebab-case | `features/proposal-assistant/` |
| Files | kebab-case; suffix by role where it aids search | `use-create-proposal-flow.ts`, `create-proposal.ts`, `search-proposals.tool.ts`, `proposal.test.ts` |
| React components (exports) | PascalCase, named export | `export function CreateProposalForm()` |
| Hooks | `use` prefix, camelCase | `useCreateProposalFlow` |
| Server Actions | `<verb><Noun>Action`; never stack the word "Action" twice, rename the noun instead | `createProposalAction`, `approvePreparedProposalAction` |
| Services | verb + noun, one exported function per file | `createProposal`, `executeApprovedProposalDraft` |
| Domain rules | descriptive verb or `assert`/`can` prefix | `assertDraftIsSendable`, `canApplyDiscount` |
| Schemas | camelCase noun + role + `Schema`; type inferred without `Schema` | `createProposalInputSchema` / `CreateProposalInput`, `proposalSummaryDtoSchema` / `ProposalSummaryDto` |
| External wire schemas | noun + `Request`/`Response` + `Schema`, only inside `src/lib/<system>/` | `proposalResponseSchema` |
| Error classes | noun + `Error` | `ValidationError`, `ProposalesError` |
| Error codes | snake_case string literals | `"validation_error"` |
| Tools | snake_case `verb_noun` in `name`; file `<verb>-<noun>.tool.ts` | `search_proposals` in `search-proposals.tool.ts` |
| Environment variables | SCREAMING_SNAKE; `NEXT_PUBLIC_` only for public values | `PROPOSALES_API_KEY` |
| Correlation identifiers | one meaning per name; never overload | `generation_id` (app correlation), `proposal_uuid` (Proposales), `series_uuid` (Proposales) |
| Route Handlers | `src/app/api/<resource>/route.ts`; nested ids as `[id]` | `src/app/api/proposals/[uuid]/route.ts` |
| Test files | `<name>.test.ts(x)` beside the source; e2e under `e2e/` | `mappers.test.ts` |

## 9. Dependency direction (summary)

```
src/app
  └─▶ features/<x>/components, features/<x>/server (entry only)
        └─▶ features/<x>/hooks, features/<x>/client
              └─▶ features/<x>/schemas, features/<x>/types, components/ui
                    └─▶ src/lib/*  (env, errors, logger, proposales, ai, agent)
                          └─▶ node_modules
```

- Arrows point down only. Nothing imports `src/app`. `src/lib` never imports features.
- Client graph (`"use client"` reachable) MUST NOT reach `server/`, `lib/proposales`, `lib/ai`, `lib/agent`, `lib/env/server`. The only sanctioned client → server edge is importing Server Actions from `server/actions.ts`.
- Shared code (`schemas/`, `types/`, `lib/errors/error-dto`) reaches nothing runtime-specific.
- Cross-feature: `schemas/`, `types/`, `index.ts`, `server/index.ts` only. No cycles.
- Transport → service → domain / integration. Never the reverse.

Full rules in [03-feature-architecture.md](03-feature-architecture.md) §4 and [02-runtime-boundaries.md](02-runtime-boundaries.md) §5.
