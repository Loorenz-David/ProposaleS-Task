# Intention: Proposal Preparation Backend

| | |
|---|---|
| **Status** | `RATIFIED` (2026-09-05, by the owner, David, on the phase-3 transport-precedence and timestamp-validation surface in §21.4; recorded in §23 round 12. The earlier ratifications remain historical records in §23.) |
| **Product** | Proposal Copilot |
| **Feature working name** | Proposal Preparation Backend |
| **Owner** | David (repository owner) |
| **Shaped** | 2026-09-05 |
| **Companion evidence** | [proposales-source-evidence.md](proposales-source-evidence.md) — verified Proposales public-API and AI-layer facts this intention relies on |
| **Governing contracts** | listed in §2 |

This document is the single authority for *what* the first backend feature of Proposal Copilot must do and *why*. It does not decide *how*. A later mechanism inventory and implementation plan derive from it. Nothing here is authority until the owner ratifies it (status `RATIFIED`).

---

## 1. Purpose

Turn incomplete, messy commercial intent (a client brief, meeting notes, a pasted email) into a structured **proposal proposition** that a human can review, refine, and explicitly approve before anything consequential is created in Proposales.

The model acts as a **proposal assembly agent over the existing Proposales content library**, not as a prose generator. It understands intent, discovers what is missing, reuses existing content, proposes a structured draft, and hands the decision to a human. After approval, ordinary deterministic code creates a Proposales draft and returns the editor URL. Sending stays in Proposales.

This feature is **backend-first**. The product UI comes later; the backend must be complete, exercisable, and testable on its own.

## 2. Grounding

### 2.1 Repository state (verified 2026-09-05)

- Next.js 16 App Router, TypeScript strict, Zod 4, Vitest 5, Playwright; single Vercel deployment. No feature code, no `src/lib/`, no agent, no Proposales adapter, no `docs/` folder exists yet.
- `ai` (Vercel AI SDK) 7.0.92 is installed with only its core transitive packages (`@ai-sdk/gateway`, `@ai-sdk/provider`, `@ai-sdk/provider-utils`). **No vendor provider package is installed and no provider is configured.**
- Configuration inventory: `PROPOSALES_API_KEY` (server-only secret) and `PROPOSALES_COMPANY_ID` (server-only configuration). Nothing else.
- Documentation root for this application is `build_docs/` (owner decision, round 1), not the `docs/` folder named by contract 14 §2, the root README, and the contract guide §7. Those three need a dedicated patch outside this intention (§20A).
- Resolved architecture decisions this intention inherits unchanged (`architectural_contracts/README.md` "Resolved decisions"): no application database; HITL needs flow integrity, not durable audit; single company per deployment; no application authentication; create-idempotency via `generation_id` in Proposales `data` metadata; Proposales timestamps interpreted only inside the adapter.

### 2.2 Applicable architecture contracts

Classified as a new proposal-generation backend/agent feature (guide §10 scenario A, minus client concerns). Contracts read and applied:

| Contract | Why it applies here |
|---|---|
| `02-runtime-boundaries.md` | everything in this feature is server-only; serverless turn model (§9) |
| `03-feature-architecture.md` | where the feature, tools, agent, and adapters live |
| `04-server-architecture.md` | services, error taxonomy (§6), idempotency (§8), deterministic mutation (§9) |
| `06-data-contracts-and-validation.md` | every boundary parses; money, ids, enums; domain vs wire shapes |
| `07-integrations.md` | one Proposales client; the AI provider is an integration (§8) |
| `08-agent-architecture.md` | tool kinds, consequential fields, clarification, HITL lifecycle (§6), provider independence, budgets |
| `09-database-and-persistence.md` | confirms no persistence; transient state |
| `10-security-and-trust-boundaries.md` | model output untrusted, least capability, approval boundary (§5) |
| `11-testing-principles.md` | layers, agent tests and evals, no live systems by default |
| `12-anti-patterns.md` | server, data, integrations, agents, persistence sections |
| `13-decision-checklist.md` | §3, §4 (cited by section; question numbers moved when the frontend questions were added) |
| `14-documentation-principles.md` | this artifact's class and the closeout question |

`05-client-architecture.md` does not apply: no UI is built.

### 2.3 Vocabulary mapping to the contracts

The contracts already define generic HITL shapes. This feature **specializes** them; it does not invent a parallel set.

| This intention says | Contract 08 §6 shape |
|---|---|
| Proposal Proposition (prepared proposal) | `PreparedAction` with `kind: "create_proposal_draft"` and a feature payload |
| Approved Proposal | `ApprovedAction` |
| Proposales Draft Result | `ExecutionResult` specialization |
| Clarification | the `clarification` result kind (08 §5) |
| Generation ID | the `generation_id` correlation identifier (04 §8, 13 §8) |

## 3. Outcome

When this feature is complete, a developer (and later a UI) can, through an explicit server-side application interface:

1. submit a free-form brief and receive either **clarification questions** or a **proposal proposition** assembled from existing Proposales content;
2. answer or explicitly skip clarification questions and receive a proposition;
3. **manually change** the proposition (replace selected content, change quantity, supply recipient details, change wording, resolve an assumption) and **search content** to find replacements;
4. send the proposition back to the agent with instructions and receive a **revised** proposition;
5. **approve** an exact final proposition, after which the server deterministically validates it, creates a Proposales **draft**, reads back the totals and per-block prices Proposales applied, and returns an application-owned result containing the **editor URL** and those applied amounts;
6. re-submit the same approval safely and receive the already-created draft instead of a duplicate (best effort);
7. observe stable application-level failure semantics rather than raw vendor errors.

The central product result is: *a Proposales draft exists, and the human can open the editor to finish and send it.*

### 3.1 What approval means in v1

Because the public content API exposes no prices and v1 writes none (§9.2), Proposal Copilot **cannot show the reviewer block prices or a proposal total before the draft exists**. Therefore, in v1:

- approval is approval of the **proposal structure and content** (recipient, language, title, narrative, selected content, quantities, optional flags, metadata) **and authorization to create a Proposales draft using the content library's pricing**;
- approval is **not** final commercial approval of the monetary proposal;
- the **final monetary review is part of the Proposales editor handoff**: after creation, Proposal Copilot reports the totals and per-block prices Proposales actually applied, and the human reviews and, if needed, adjusts them in the editor before sending.

This distinction is restated wherever review, approval, pricing, and handoff are defined (§5, §6, §7, §9, §11, §15) so no later artifact reads "approved" as "priced and commercially final".

## 4. Hard constraints (from contracts and product decisions)

These are not negotiable within this feature. Each has a MUST-level source.

- **Preparation is read-only toward Proposales.** The preparation and revision agent has only `read` tools. No tool of kind `mutate` exists in this feature; the draft creation is `prepare` → human approval → deterministic execution (08 §3, §6).
- **Consequential facts are never invented.** Recipient identity, price, quantity, discount, tax treatment, deadline, contractual or scope commitment, and any identifier of an existing record must carry provenance from the brief, Proposales content, or a human (08 §4).
- **Approval is a hard boundary.** After the human approves, no model call may change business data. Execution validates the approved payload, maps it, calls Proposales, and maps the result (04 §9, 08 §6, 10 §5).
- **No application database.** Workflow state is transient and travels with the caller between turns (09 §1, 08 §9).
- **Public API only.** Only `https://api.proposales.com` endpoints documented in `api-documentation/proposales/`. No `secure.proposales.com` endpoints, no send automation.
- **Provider independence.** Features and the agent depend on `@/lib/ai`, never on a vendor SDK (07 §8, 08 §8).
- **Bounded execution.** Every run has a wall-time, tool-call, and token budget; exceeding it ends in `clarification` or `failed`, never in a fabricated proposition (08 §5, §9).
- **Every boundary parses.** Brief, clarification answers, human edits, model output, tool arguments, Proposales responses, and the approved payload are all validated at runtime (06 §2).

## 5. Core workflow

```
                              ┌─ ask human ──────────────┐
                              │                          │
brief → understand intent → missing core info? ── no ───┤
                              │                          │
                              └─ yes → clarification     │
                                        │                │
                                 answer / skip           │
                                        ↓                │
                              search Proposales content ←┘
                                        ↓
                              candidate content (ranked)
                                        ↓
                              build proposition
                                        ↓
                           ┌──── human review ─────┐
                           │                       │
                    manual changes          agent revision
                    (edit fields,           (instruction →
                     search/replace          new proposition)
                     content)                      │
                           └──────────┬────────────┘
                                      ↓ (repeatable)
                                   approve  ── validation fails → back to review
                        (structure + content + "create at library pricing")
                                      ↓
                          deterministic execution
                          (validate → map → POST /v3/proposals
                           → GET /v3/proposals/{uuid} for applied totals)
                                      ↓
                   Proposales draft (uuid, editor URL, applied totals and prices)
                                      ↓
                 human performs final monetary review and sends in Proposales
```

### 5.1 Stages and their responsibilities

| Stage | Who acts | May call the model | May read Proposales | May write Proposales |
|---|---|---|---|---|
| Prepare from brief | agent | yes | yes (content) | **no** |
| Clarify | human answers or skips | no (answers are data) | no | no |
| Content search on human request | application | no (deterministic retrieval; see §10) | yes | no |
| Manual edit | human | no | no | no |
| Agent revision | agent | yes | yes (content) | **no** |
| Approve (structure and content; authorizes library pricing) | human, then server validation | **no** | no | no |
| Execute | server | **no** | yes (duplicate check before create; read-back of applied totals after create or recovery) | yes (create draft, once) |
| Handoff (final monetary review, send) | human in Proposales | — | — | — |

### 5.2 Turn model

Each stage is one bounded server invocation that receives the current workflow state from the caller and returns the next state (02 §9, 08 §9). The server keeps nothing between turns. Consequences the planner must honor:

- The caller round-trips the workflow state (brief, clarification history, current proposition, generation ID, and, once a draft exists, the **draft reference**: the Proposales uuid and editor URL). The server re-validates it on every turn; a tampered or stale state is indistinguishable from a human edit and is treated as such, because the human is the authority anyway.
- Beside the workflow state, the caller round-trips a **conversation context**: a bounded window of the human's free-text instructions and the application's rendered summaries of each result, held for the page's lifetime only and lost on reload by design. It exists so the human can refer to earlier turns ("use the second one"). It is never authority: every resolved reference is written into the workflow state with provenance, and approval and execution never read it. Its contract is §17A.17.
- There is no server-side memory of "already executed" between two requests. Cross-request duplicate protection is the draft reference in the state when the caller has it, and the Proposales-side recovery search when it does not (§13).

## 6. Behavioral invariants

1. Missing **core** information is asked about before the first proposition is produced.
2. The human can **always explicitly defer** a question; deferral is recorded as known-unresolved information, never converted into a value.
3. **Consequential facts are not silently invented**; each carries provenance from brief, Proposales content, or human.
4. The preparation agent is **read-only** toward Proposales; it never creates content, proposals, or anything else.
5. Content is **searched and reused**, never created, by this agent.
6. The human can **manually edit** the proposition or **ask the agent to revise** it, any number of times, and both paths produce a proposition of the same shape.
7. **Agent output is not approval.** Only an explicit human approval act produces an approved proposal.
8. The **approved human payload is authoritative**; it may differ substantially from any agent output.
9. **No model reinterpretation after approval.** Zero model calls occur on the execution path.
10. **Deterministic mutation**: the same approved payload always produces the same Proposales request.
11. **No private send endpoint**; sending is a human act in Proposales.
12. **No application database** for this feature.
13. **Provider/model independence**: swapping provider, model, or sampling parameters touches configuration and `@/lib/ai` only.
14. **Bounded agent execution** in steps, time, and tokens.
15. Application **error semantics are stable** and never leak raw vendor or provider errors.
16. **Approval is structural, not monetary, in v1.** Approving a proposition approves its structure and content and authorizes creating a draft at library pricing; it never asserts that the money is right. The applied totals are reported after creation and the final monetary review happens in the Proposales editor before sending (§3.1).
17. **Applied amounts are reported, never computed.** Every price or total Proposal Copilot shows after creation is read from Proposales and passed through the mapper unchanged; the application performs no price arithmetic.

## 7. Core domain concepts

Conceptual definitions with **state ownership** (who writes the value, what may never overwrite it). Exact schemas are decided in planning; the ownership rules are binding.

| Concept | Meaning | Written by | Never overwritten by |
|---|---|---|---|
| **Brief** | Free-form text describing commercial intent. The only MVP input channel. Bounded length. Treated as untrusted data in prompts. | human (caller) | anyone; immutable for the workflow's life |
| **Generation ID** | Application-generated stable identity of one preparation workflow, created at the first prepare-from-brief turn. Stable across clarification, revisions, and approval. Attached to the created Proposales proposal as metadata. | system, once | anyone |
| **Clarification** | A set of questions the agent needs answered before producing a useful proposition, each tied to the information item it resolves and each answerable by *answer* or *skip*. | agent | — (a new clarification is a new object) |
| **Clarification answer** | The human's answer or explicit skip per question. | human | agent |
| **Information item** | A named piece of information the proposition depends on, with a class (§8) and a resolution state (supplied / unresolved / deferred-by-user). | system classification; human resolution | agent may never mark an item *supplied* without a source |
| **Content Candidate** | A Proposales content item (product/variation identity, localized title and description, images when fetched in detail) found during search, with a match strength and the reason it matched. | application retrieval + agent judgment | — |
| **Selected Content** | The candidate chosen for a line of the proposition, with quantity and optional flag. The agent may propose it; the human may replace it. | agent proposes; human decides | agent, once the human has set it (see revision rule §11.2) |
| **Proposal Proposition** | The structured prepared proposal (§9). Versioned per revision; every version carries the same Generation ID. | agent (initial and revisions); human (manual edits) | — |
| **Provenance** | Per consequential field: where the value came from (§8.3). | system, from the producing step | anyone; a field's provenance changes only when its value changes |
| **Unresolved Information** | Items the proposition depends on that have no sourced value: missing, or deferred by the human. Shown to the reviewer. | system | agent may not remove an item by inventing a value |
| **Assumption** | A harmless, presentational choice the agent made (tone, structure, title wording). Listed for the reviewer. Never allowed on a consequential field. | agent | — |
| **Warning** | A reviewer-facing caution (weak match, conflicting brief statements, scope the catalog cannot cover). | agent or application | — |
| **Human Revision** | A free-form instruction plus the current proposition, sent to the agent to produce a new proposition version. | human | — |
| **Approved Proposal** | The exact proposition the human approved, re-validated by the server, with the diff against the prepared version recorded for logs. Authoritative input to execution **for everything it contains**: structure, content selection, quantities, optional flags, recipient, language, title, narrative, metadata. It contains no prices; it carries the human's explicit authorization to create the draft at library pricing (§3.1). Monetary authority is not exercised here; it is exercised by the human in the Proposales editor. | human act; server validation | the model, ever |
| **Applied Pricing** | The totals (with and without tax), currency, tax options, and per-block unit values and VAT split that Proposales actually applied to the created or recovered draft, read back after creation and mapped without arithmetic. Reviewer information for the handoff; never an input to execution. | Proposales, read by the server | the application (no derivation, no rounding, no recomputation) |
| **Proposales Draft Result** | Application-owned result of execution: the created (or recovered) draft's identity and editor URL, whether it was newly created or recovered, and the Applied Pricing when the read-back succeeded (marked unavailable, with the reason, when it did not). | server | — |
| **Draft Reference** | The Proposales uuid and editor URL of the draft created for this workflow, carried in the workflow state from the first successful create onward. Its presence makes the workflow terminal: further approvals are refused (§11.3, §13). | server, once | anyone |
| **Conversation Context** | Bounded, caller-held record of prior human instructions and application-rendered assistant summaries for one workflow; linguistic continuity for resolving references. Not persisted. | human (instructions); system (summaries) | never an input to approval or execution; never a provenance source |

## 8. Information classes, clarification, and provenance

### 8.1 Four classes of information

The intention defines the classes conceptually; enum names are a planning decision.

| Class | Meaning | Behavior |
|---|---|---|
| **Required-to-ask** ("core") | Important enough that, if not derivable from the brief, the agent asks before producing the first proposition. | Blocks only long enough to ask; the human may answer or skip. |
| **Required-to-create** | Without it the application refuses to execute. | Missing at approval → approval rejected with a validation error naming the item; the workflow returns to review. A human may *skip the question* but cannot *approve without the value*. |
| **Optional** | Improves the proposition; the agent proceeds without it and surfaces the gap. | Listed under unresolved information or assumptions; never blocks. |
| **Deferred-by-user** | A required-to-ask item the human explicitly skipped. | Recorded as known-unresolved; the model may not fill it; omitted from the Proposales payload if the vendor accepts its absence; blocks approval only if it is also required-to-create. |

This reconciles the product rule "missing information does not trap the workflow" with contract 08 §6 ("a prepared action with any missing entry is not approvable"): *deferred* items are a distinct category from *missing required-to-create* items, and only the latter block approval.

**Membership** (decided by the owner, round 1):

- Required-to-create: proposal language; a proposal title; at least one selected content block, or an explicit human confirmation that the draft is intentionally empty (the confirmation is a human act recorded on the proposition, never an agent default).
- Required-to-ask: recipient identity (name and email or company); what is being sold (which services/products the brief asks for) when the brief is ambiguous; quantities where the brief implies units without stating them; **language**, which the agent first derives from the brief's language and the localizations present in the content library, and asks about only when derivation is ambiguous or the brief and the catalog disagree. Language handling is a key product function, not a configuration default: no deployment-wide default language is introduced.
- Optional: recipient phone and company details, proposal description narrative, per-block comments, notes about deadlines or terms (captured for the reviewer, not written to Proposales fields the public API does not accept).

### 8.2 Clarification behavior

- The agent asks **once** per preparation before producing a proposition, with a bounded number of questions; further gaps discovered later are surfaced as unresolved information, not new blocking rounds. (Exact bounds are a planning decision.)
- A question is asked only if the item is required-to-ask **and** not derivable from the brief **and** not resolvable by a read tool (08 §5).
- Every question accepts an explicit skip. The skip is a first-class answer, not an absence of one.
- Answers and skips are data: they are validated, recorded against the information item, and passed to the next preparation turn. They are never interpreted as instructions to the model beyond resolving the item.

### 8.3 Inference and provenance policy

The model **may** infer presentational information: wording, organization, narrative, summaries, formatting, reasonable synthesis of supplied facts. Each such inference is listed as an assumption.

The model **must not** invent: recipient identity, monetary price, quantity, the optional flag on a block (it changes the offer), discount, tax treatment, deadline, contractual commitment, scope commitment, a deliverable that changes what is sold, identifiers of existing records.

Absence is not invention: when a consequential value has no source, the proposition leaves it out and the request omits the field so Proposales applies its own default (quantity defaults to 1, optional defaults to not optional). The proposition shows such fields as "default", never as a sourced value.

Provenance sources, kept deliberately coarse:

| Source | Meaning | Valid on a consequential field? |
|---|---|---|
| `brief` | stated in the brief text (with a reference to the supporting passage where practical) | yes |
| `proposales_content` | taken from a content item returned by a read tool (with the content identity) | yes |
| `human` | supplied through a clarification answer, a manual edit, or — with a reference to the turn and a verbatim quote — the human's current revision instruction | yes |
| `inferred` | produced by the model | **no**, unless mechanically derivable from sourced values (for example a total computed from sourced quantity and a sourced unit value); a mechanical derivation names its inputs |

Validation of a proposition rejects any consequential field whose provenance is `inferred` without a derivation. This rule lives in schema/domain code, not only in the prompt (08 §7).

## 9. The Proposal Proposition

### 9.1 Behavioral purpose

The proposition is the **reviewable, editable, approvable** representation of what would be created. It must let a human (or later a UI) see every consequential value the application controls and where it came from, understand what the agent could not resolve, change anything, and approve an exact payload. It is also the only thing execution accepts.

It does **not** show prices or a total, because the application cannot know them before creation (§3.1). Instead it states, per selected block, that the content library's price and VAT will apply, and it surfaces any brief-stated or human-stated price expectation as a commercial note so the reviewer knows what to check in the editor. A reviewer reading the proposition must never be able to mistake it for a priced offer.

### 9.2 Information it must represent

Refined against the Proposales proposal/block model (evidence doc §2–§4). Exact shape is a planning decision; the categories below are required.

| Category | Content | Notes from vendor evidence |
|---|---|---|
| Identity | generation ID; proposition version; prepared-at | version increments per revision or edit |
| Recipient | name, email, company name, phone, each with provenance; or "unset" | Proposales accepts an inline new recipient or an existing contact id; the public API offers **no contact lookup**, so the MVP only supplies inline details or leaves the recipient unset for the editor. **Accepted v1 risk (owner, round 4):** an inline recipient whose email already exists in Proposales may create a duplicate contact, because merge behavior is undocumented (§20); the result and the feature documentation state this so the human checks the contact in the editor |
| Language | proposal language | required by Proposales on create; determines which localized content text is used; derived then asked (§8.1) |
| Title | proposal title, written in the proposal language | presentational; `inferred` allowed |
| Description / narrative | proposal description, written in the proposal language even when the brief is in another language | presentational; `inferred` allowed; Markdown subset per vendor docs; treated as text, never rendered as HTML by this application |
| Selected content | ordered list of selected content items: content identity (variation id, and product id for display), title shown to the reviewer, quantity (sourced, or "default" and omitted from the request so Proposales applies 1), optional flag (sourced from brief or human, or "default" and omitted), per-block reviewer comment | a block referencing content adopts the library's defaults (price, unit, tax split) at creation; the public content list **does not expose prices** |
| Alternative candidates | per selected item, the other plausible candidates with match strength and reason | keeps the recommendation changeable |
| Pricing and currency | **No price writes in v1** (owner card 2, closed round 2 on the price-override investigation, evidence doc §8). Every block takes the content library's price, VAT split, and currency at creation. The proposition states this explicitly per block, and records brief-stated or human-stated price expectations (amount, currency, tax basis as stated, source) as reviewer-facing commercial notes with provenance. Those notes are never mapped to `unit_value_*`, `package_split`, `currency`, or `tax_options`. Approving the proposition authorizes creation at library pricing and is not monetary approval (§3.1). After creation the result reports the Applied Pricing read from Proposales, and the human sets the final price in the Proposales editor. | the public API cannot safely express a single human price: a tax-consistent override needs all four unit values plus a matching VAT split, and no public pre-creation endpoint exposes the VAT configuration to compute them |
| Commercial assumptions and notes | brief facts the public API cannot carry into the draft (deadlines, terms, scope caveats), preserved for the reviewer with provenance | not written into Proposales fields that do not exist on create |
| Unresolved information | items missing or deferred, each with its class | drives approvability |
| Assumptions | presentational inferences | never on consequential fields |
| Warnings | weak matches, conflicts, uncovered scope, a brief-stated currency that differs from the company's currency (recorded as a warning plus a commercial note; never written) | reviewer guidance |
| Agent rationale | short reviewer-facing explanation of why this content was chosen | text, not authority |
| Provenance map | per consequential field | §8.3 |

## 10. Content behavior

### 10.1 What the public API allows (established; evidence doc §3)

- `GET /v3/content` lists the company's active content items. Filters are by `product_id`, `variation_id`, or `external_id` only. **There is no text or semantic search parameter and no pagination.** Items carry language-keyed `title` and `description`, `product_id`, `variation_id`, and images when requested by variation id. **No price, currency, unit, or tax fields are returned.**
- "Get content" is the same endpoint filtered by `variation_id` (detailed information, including images). There is no separate per-item endpoint.
- A proposal block references content through `content_id`, which must be the content's **`variation_id`**. Each product currently has exactly one variation.
- Content creation, update, and archiving endpoints exist but are **out of scope** for this agent.

### 10.2 Required behavior

- **Search content** is an application-owned operation: retrieve the company's **full** content list live from Proposales on each run (the catalog is small by owner statement, round 1; no cache, no index, no persistence in v1) and match it against a query, returning a **bounded, ranked** candidate list shaped for the model and for the reviewer (identity, localized title/description in the proposal language, match strength, reason). The matching mechanism (lexical, model-assisted ranking, or both) is a planning decision constrained by tool-output bounds (08 §3). Persistence or caching of the catalog is explicitly a post-v1 consideration under contract 09 §14, not part of this feature.
- **Get content** returns one item's details by variation id.
- The agent may use both autonomously during preparation and revision, within budget.
- Matching outcomes are expressed at least as **weak / possible / strong**; the scoring representation is not prescribed.
- When a strong match exists, the agent **may** select it as the recommended default; it must retain the alternatives, and the human may accept or replace the selection.
- When no acceptable match exists for part of the intent, the agent records that gap as a **warning plus unresolved information**; it never substitutes an unrelated item and never proposes creating content.
- The human can trigger a search directly (without the model) and select a result; the resulting selection carries `human` provenance.

### 10.3 Deferred possibility (not MVP)

A separate content-creation agent that proposes or creates missing content when no suitable item exists. Recorded here so it is not re-invented inside this feature; explicitly excluded from this intention.

## 11. Human-in-the-loop boundary

### 11.1 Preparation vs execution

| | Preparation (before approval) | Execution (after approval) |
|---|---|---|
| Model calls | allowed | **forbidden** |
| Proposales reads | allowed (content) | allowed: duplicate-recovery search before the create; get-proposal after the create or recovery, to read the Applied Pricing |
| Proposales writes | **forbidden** | exactly one create, if no recovery hit |
| Human edits | allowed | not applicable; a change means a new approval |
| Prices visible to the human | none (library pricing stated per block; expectations as notes) | the Applied Pricing, read from Proposales, in the result |
| Output | proposition or clarification | Proposales Draft Result or an application error |
| Meaning of the human's act | editing and shaping | approval of structure and content plus authorization to create at library pricing; monetary review follows in the editor (§3.1) |

### 11.2 Manual editing and agent revision

- Manual edits produce a new proposition version with the changed fields carrying `human` provenance. Edits are validated like any input; an edit that violates a domain rule (for example a non-positive quantity) is rejected with a validation error, not silently corrected.
- Agent revision takes the current proposition and a human instruction and produces a new version. It is preparation: the same read-only tool set and budgets apply. A revision **must not overwrite** a value the human explicitly set unless the instruction asks for it; when in doubt the agent keeps the human value and records a warning. (The mechanism for "human-set" is a planning decision; the behavior is binding.)
- Both paths yield the same proposition shape, so approval never depends on which path produced the final version.

### 11.3 Approval

- Approval is an explicit act on an **exact** proposition version. The server re-parses the submitted payload, checks required-to-create completeness and the provenance rule, records the diff against the prepared version for logs, and only then executes.
- A proposition with unresolved required-to-create items, or with `inferred` provenance on a consequential field, is rejected with a validation error naming the paths. The workflow returns to review.
- Approval of a proposition version that the human has since changed is the human's responsibility; the server executes what it receives after validation.
- **Scope of the approval act (v1).** The approval envelope carries, as data, the human's acknowledgment that the draft is created at the content library's pricing and that monetary review happens in Proposales (the representation is a planning decision; the behavior is binding). The server refuses an approval that lacks it, exactly as it refuses one with unresolved required-to-create items. Nothing in the approval act asserts a price, and the executed request carries none (§12.1).
- **Approver identity.** The application has no authentication, so the approved proposal asserts no approver identity in v1. The approval is an explicit act on the workflow state; correlation is by generation ID and logs. Introducing an asserted approver requires the authentication decision the contracts reserve.
- **After a draft exists, the workflow is terminal.** An approval that arrives with a draft reference in its state (§5.2) is refused with a conflict that carries the existing draft's uuid and editor URL and states that later changes were not applied and belong in the Proposales editor. No create, no recovery search, no patch. Rationale: once the human has the editor URL, Proposales is the editing environment; a Copilot patch by uuid would replace the whole block list and could discard edits the human already made there (§18).
- **Read-back after execution.** Immediately after a successful create, or after a recovery hit, the server reads the draft and attaches the Applied Pricing to the result. The read is idempotent and may be retried within bounds. If it ultimately fails, the result still reports the draft as created or recovered (the draft exists; the editor URL is valid) with the Applied Pricing marked unavailable and the reason; a successful create is never downgraded to an error by a failed read.

## 12. External boundaries

### 12.1 Proposales

- One server-only client module owns authentication, `company_id` injection (server-side configuration; features never pass it), timeouts, response validation, mapping, and error translation (07 §1–§6).
- Operations this feature needs, named by domain purpose and mapped to the public endpoints in the evidence doc: list/search content, get content by variation id, create proposal draft, search proposals by generation ID, get company (currency and tax mode; used only to warn when a stated currency differs from the company's, never written), and (for result enrichment, if the planner chooses) get proposal by uuid.
- Creation uses **one** `POST /v3/proposals` with the complete approved payload (company id, language, title, description, recipient when set, selected blocks by `content_id` with `quantity` and `optional`, application metadata in `data`). In v1 the create request **never** carries `unit_value_*`, `package_split`, block or proposal `currency`, or `tax_options`; the content library and company configuration supply them (§9.2). No create-then-patch sequence is expected; a patch would be used only if implementation evidence shows the single request cannot express the approved payload, and that would be surfaced.
- The create response provides `uuid` and `url` only. Execution therefore follows the create (or a recovery hit) with **one `GET /v3/proposals/{uuid}`** to read the Applied Pricing: `value_without_tax` and `value_with_tax` (integer cents), `currency`, `tax_options`, and per block the four `unit_value_*` fields (cents), `quantity`, `optional`, and `package_split`. These are established response fields (evidence doc §4, §6, §8); the mapper converts them to the application's money representation without arithmetic. The same read yields `series_uuid` and `status` at no extra cost; including them in the result is a planning decision, not a scope change.
- The read-back is a `read` operation on the execution path: it is idempotent, bounded, retryable, and never a model call. Its failure does not undo or mask a successful create (§11.3).
- Non-idempotent creates are never auto-retried (07 §5).
- The mapper owns every wire assumption: snake_case, `content_id = variation_id`, the metadata key names, epoch timestamps of observed millisecond scale.

### 12.2 AI provider and model layer

- The workflow depends on a **provider-neutral boundary** in `@/lib/ai` built on the Vercel AI SDK's provider/model abstraction (the SDK is the "library" that makes providers pluggable; each vendor is one `@ai-sdk/<vendor>` package registered inside `@/lib/ai`). Provider, model, reasoning level where supported, temperature or equivalent, and other runtime parameters are **configuration**, not workflow code.
- Owner requirement (round 1): switching between Anthropic (Claude, several models) and OpenAI models must be a configuration change, so results and cost can be compared experimentally. The first candidates are therefore Anthropic and OpenAI; neither is chosen as permanent, and no provider package is installed by this intention. Installing the first candidate packages is a planning decision.
- To make cost comparison possible, every agent run result reports the provider, model, and token usage it consumed, as data alongside the domain result (08 §10 already requires this in logs; the intention additionally requires it on the run result).
- Unit and agent tests run against a scripted fake implementing the same interface; live-model evals are separate and opt-in.
- The model receives labeled data (brief, clarification answers, tool results) and never secrets, environment values, internal URLs, or raw Proposales payloads.
- Prompts are versioned code; no rule exists only in a prompt.

## 13. Duplicate submission and recovery

Established: no public idempotency key exists for proposal creation; app-owned keys in `proposal.data` are searchable through `GET /v3/proposal-search?filter[<key>]=<value>` for the flat keys tested; results are capped at 25 and ordered by `updated_at` descending.

Behavior:

```
approved proposal arrives
  → validate
  → state carries a draft reference?
      → yes: refuse with conflict (existing uuid + editor URL); no create, no search   (§11.3)
      → no:  search Proposales for a proposal whose metadata carries this generation ID
              → found: read it back; return it flagged recovered; no create
              → not found: create; read back; return the result flagged newly created
```

The draft reference is the primary "already created" signal and needs no search: it is the Proposales uuid the create returned, carried in the state from then on. The generation ID search covers only the case where that uuid never reached the caller (timeout, lost response, lost state).

- This is **best-effort duplicate recovery**, not exactly-once. Two concurrent approvals can both miss the search and both create; the intention accepts this and does not claim otherwise. The future UI must block double-submit while a request is pending (04 §8); that is outside this backend intention.
- If the search itself fails, execution **does not** proceed blindly; the failure surfaces as a Proposales-unavailable class error and the human retries.
- If more than one proposal carries the generation ID, the result reports the situation as a conflict rather than picking one silently.

## 14. Proposal metadata

The created proposal carries minimal application metadata in `data`, using **flat top-level keys** with a distinctive prefix (nested-key filtering is not established), for correlation and recovery only. Starting point, subject to data minimization:

| Key (illustrative) | Purpose | Include? |
|---|---|---|
| source marker (application name) | recognize proposals this application created | yes |
| generation ID | recovery and correlation | yes |
| creation timestamp (ISO string) | human orientation in Proposales | yes |
| short brief summary | orientation | only if the owner wants it; it is model text stored in a vendor system |
| generation model name | debugging | not by default; correlate through logs by generation ID instead |

Never stored in metadata: the raw brief, secrets, provider configuration, prompt text, personal data beyond what the proposal itself already carries. Note that `data` also feeds Proposales proposal variables, so key names must not collide with variable names a company uses.

## 15. Result and error semantics

### 15.1 Domain result states (not errors)

| State | Meaning |
|---|---|
| `clarification` | preparation needs answers before a proposition can be produced |
| `proposition` | a proposition version is available for review |
| `created` | a Proposales draft was created; result carries uuid, editor URL, `newlyCreated: true`, and the Applied Pricing (or "unavailable" with a reason) |
| `recovered` | an existing draft matched the generation ID; result carries its uuid, editor URL, `newlyCreated: false`, and the Applied Pricing read from that draft (or "unavailable" with a reason) |

In both states the result is the reviewer's first sight of money. It is presented as *what Proposales applied*, to be reviewed in the editor, never as *what was approved*.

### 15.2 Errors

Map onto the canonical `AppError` taxonomy (04 §6); the feature adds no parallel taxonomy. Expected mapping at the behavioral level:

| Situation | Taxonomy code |
|---|---|
| malformed brief, answers, edits, or approved payload; unresolved required-to-create item; `inferred` provenance on a consequential field; domain rule violation | `validation_error` |
| model output that fails the proposition schema after bounded retries | `validation_error` with details identifying the model as the source (or a dedicated detail reason); the run ends `failed` |
| execution attempted without a valid approval envelope | `approval_required` |
| approval submitted for a workflow whose state already carries a draft reference (details: existing uuid, editor URL); more than one Proposales proposal matches the generation ID; second execution detected within one turn | `conflict` |
| Proposales authentication failure, validation failure, state conflict, unavailability, schema mismatch | `integration_error` with `details.system = "proposales"`, `details.status`, `details.retryable`; the Proposales error message may be forwarded because the vendor documents it as user-safe |
| provider or model failure, timeout | `integration_error` with `details.system` naming the AI provider generically; message generic |
| agent budget exhausted | run result `failed` with a budget reason; if surfaced as an error, `integration_error` is wrong — planning decides between a domain result and a dedicated detail on `internal_error`; the intention requires only that it is distinguishable and never a fabricated proposition |
| anything else | `internal_error`, generic message, cause logged |

The Proposales draft result and every error crossing the interface are plain JSON DTOs.

## 16. Backend-first testability

### 16.1 Requirement

The workflow must be exercisable and verifiable without any frontend, through an explicit application interface offering at least: prepare from brief; respond to clarification; revise a proposition; search content and replace a selection; submit an approved proposition; observe the creation result.

### 16.2 Constraints on the interface (transport is a planning decision)

- Application services callable with plain arguments and fake integration clients are the **primary** interface and the lowest layer that proves the workflow (04 §4, 11 §2).
- If an HTTP surface is added for manual invocation, it follows the thin Route Handler rules and must **not** expose the execution path unprotected in a deployed environment, because the application has no authentication. A development-only harness is acceptable if justified; a throwaway frontend is not.
- Whatever the transport, the workflow state contract is the same serializable state defined in §5.2.

### 16.3 Testing intent (what must be provable, by layer)

| Behavior | Layer | Doubles |
|---|---|---|
| proposition, clarification, approval, and result schemas accept valid and reject invalid samples; `inferred` on a consequential path is rejected | schema | none |
| information classification and required-to-create rule; provenance rule; human-value preservation on revision | domain | none |
| clarification produced when core items are missing; explicit skip yields a proposition with deferred items | service + agent | scripted model, fake Proposales |
| preparation tool set contains only read tools; no Proposales write is reachable from a preparation or revision run | agent | fake Proposales client recording calls |
| content search returns bounded ranked candidates; strong match selected as default; alternatives retained; human replacement wins | service + agent | fake Proposales with fixture catalog |
| prepared → revised keeps human-set values unless instructed | agent | scripted model |
| approval rejects unresolved required-to-create items and consequential inferences; accepts corrected payload and records the diff | service | none |
| execution makes **zero** model calls and sends exactly the mapped approved payload | service | fake AI provider that fails the test if invoked; fake Proposales asserting the request |
| adapter mapping: proposition → create request; create/search responses → domain results; error translation; timeouts; no retry on create | integration client | mocked HTTP, recorded fixtures |
| duplicate recovery: existing generation ID → recovered result, no create; multiple matches → conflict | service | fake Proposales |
| budget exhaustion ends in clarification or failed, never a proposition | agent | scripted model that keeps calling tools |
| whole workflow runs against the `@/lib/ai` interface with no vendor SDK | agent | scripted fake |
| transport behavior, if an HTTP surface exists: malformed input → 400 with paths; errors → mapped status | boundary | mocked service |

Live-model evals (tool selection, no-hallucination, injection resistance, assumption labeling) and any live-Proposales smoke test are opt-in, skipped without their environment variables, and never part of the default `npm test` run (11 §4–§5).

## 17. Measurement ledger

Observable outcomes that, measured true, mean this intention shipped. Every downstream criterion traces to one of these or to a mechanism contract.

| ID | Objective (observable) | Defect family guarded |
|---|---|---|
| **M1** | Every consequential field in every proposition version carries provenance `brief`, `proposales_content`, or `human`, or a mechanical derivation naming sourced inputs; a proposition violating this is rejected by validation, not merely flagged. | invented commercial facts |
| **M2** | For a brief lacking a required-to-ask item, the first result is a clarification naming that item; after an explicit skip, the next result is a proposition in which that item is recorded as deferred with no value. | trapped workflow; silent gap-filling |
| **M3** | No preparation or revision run can reach a Proposales write: the run's tool set is read-only by construction, and a recording fake Proposales client observes zero write calls across the agent test suite. | agent-initiated mutation |
| **M4** | A human replacement of selected content, quantity, or recipient survives a subsequent agent revision (absent an instruction to change it) and is exactly what execution sends. | agent output treated as authoritative |
| **M5** | Execution of an approved proposal performs zero model calls and issues one create request whose body equals the mapper applied to the approved payload. | post-approval reinterpretation |
| **M6** | Re-submitting an approval whose generation ID already matches a Proposales proposal returns that proposal flagged recovered with no create; every created or recovered result carries the Applied Pricing read from Proposales and mapped without arithmetic, or marks it unavailable without downgrading the creation; every Proposales or provider failure surfaces as a taxonomy error with no raw upstream body. | duplicate drafts; invented or computed money in the result; leaked vendor errors |
| **M7** | The complete workflow (prepare, clarify, revise, approve, execute) runs green against a scripted fake model and a fake Proposales client; a run that exhausts its budget ends in clarification or failed; every run result carries provider, model, and token usage. | provider lock-in; unbounded loops; uncomparable cost |

### 17.1 Appended by mechanism-inventory round 1 — **RATIFIED** (2026-09-05, by the owner, David)

M1–M7 above are ratified and unchanged; nothing in this block restates or narrows them. The entries below register the invariants of the mechanism contracts in §17A. Each is a planner's trace target.

Ratified as a post-ratification amendment to the ledger, on the surface in §21.2, recorded in §23 round 7. All eleven entries were ratified; none was cut. **M1–M20 are one ratified ledger** from this point: a criterion's trace cell may cite any of them, and every entry must be served by at least one criterion row or recorded as a planning gap. M19 was added and ratified in round 8; M8–M18 in round 7; M20 in round 10.

| ID | Objective (observable) | Defect family guarded | Contract |
|---|---|---|---|
| **M8** | A Generation ID is created on exactly the turn that receives no inbound workflow state, is byte-identical in every later state and in the created proposal's metadata, and an approval whose state carries a Draft Reference is refused with `conflict` **before** any envelope, completeness, or provenance check, with the fake Proposales client observing no create, no search, and no patch. | a regenerated identity producing a second draft; error-precedence drift making a criterion pass by fixture luck | §17A.2 |
| **M9** | "No sourced value" is a representable value in the proposition, not a missing key; it survives a JSON round-trip unchanged; and it maps to an **omitted** key in the create request. No mapper path can emit `quantity`, `optional`, `unit_value_*`, `package_split`, block or proposal `currency`, or `tax_options` from an absent value. | silent defaulting; a placeholder read back as a sourced fact | §17A.5 |
| **M10** | Provenance is structural: every proposition leaf carries its own source inside the leaf, `inferred` is **unrepresentable** on a consequential leaf (a fixture carrying it fails the schema parse, not a refinement), and `human` is the only mark of a human-set value. | a forgotten refinement; a second source of truth for "human-set" that can disagree with provenance | §17A.4 |
| **M11** | A `human`-sourced leaf survives an agent revision unless the revision returned an explicit override request naming that leaf's path; an unauthorized attempt keeps the human value and records a warning, and an authorized override records a warning naming path, before, and after. | preservation enforced only by the prompt | §17A.9 |
| **M12** | Over a fixture catalog **larger than the candidate cap**, the same query yields the same bounded, identically ordered candidate list on repeated runs, ties broken by variation id; match strength is a total function of an integer score with every threshold boundary enumerated; auto-selection as the recommended default requires `strong`. | ranking that silently depends on the vendor's list order; an unfalsifiable "bounded" claim | §17A.8 |
| **M13** | Every money value in a created or recovered result equals the vendor's integer cents verbatim, including for a fixture whose stored totals are inconsistent with its unit values; the "unavailable" variant carries **no** money fields; the Applied Pricing mapper contains no arithmetic operator on a money field. | reconciliation of vendor numbers; zero rendered as unavailable | §17A.12 |
| **M14** | The recovery search sends exactly `company_id` and `filter[<generation-id key>]` with `limit` at the documented maximum, re-verifies the returned `data` value on every row, and returns `conflict` on two or more verified matches. | the documented default `limit=1` hiding a duplicate; undocumented filter semantics trusted blind | §17A.11 |
| **M15** | An exhausted wall-time, tool-call, or token budget ends the run in `clarification` or `failed` naming which budget was exhausted, never a partial proposition, and the run result still carries provider, model, and token usage. | a partial proposition presented as complete; failed runs reporting no cost | §17A.14 |
| **M16** | No call into the AI SDK receives a string model id, `globalThis.AI_SDK_DEFAULT_PROVIDER` is never assigned, and a missing or unknown provider, model, or vendor key fails at configuration load rather than routing through the bundled gateway. | a run silently served by the Vercel AI Gateway — including Vercel OIDC authentication with no configured secret — making provider, model, and cost attribution false | §17A.15 |
| **M17** | The workflow-state schema is strict; every turn re-parses the whole state; an extra or misspelled key fails loudly rather than being stripped; the editor URL is validated against the expected Proposales origin; a state over the size bound fails with a named validation error. | a stripped Draft Reference re-enabling a create; an oversized body failing as transport noise | §17A.3 |
| **M18** | A clarification answer binds to a question id; a skip is an explicit value; an unanswered question leaves its information item `unresolved`, never `deferred_by_user`. | an omission recorded as a human decision | §17A.7 |
| **M19** | A reference in a later human turn to an option the assistant presented earlier resolves to that option's content identity in the proposition with `proposales_content` provenance, and approval and execution operate from the workflow state alone. | conversation text treated as authority; a reference resolved to something never presented | §17A.17 |
| **M20** | Every server log emission is one JSON line whose fixed frame cannot be overwritten by caller fields; denylisted values are redacted before serialization at every object depth, including inside arrays; null and JSON primitives preserve their value; unsupported or cyclic values become `"[unserializable]"`; logging never mutates the caller's fields or throws while handling them. | credentials or personal data emitted to logs; a malformed diagnostic field crashes production logging; a field falsifies its event metadata | §17A.18 |

## 17A. Mechanism contracts (mechanism-inventory round 1)

### 17A.0 What this section is, and how it binds

This section is the round-1 mechanism inventory's delta. It deepens the sections it cites; it moves nothing on the ratification surface (§21.1) and adds no scope. Where §17A and an earlier section appear to disagree, the earlier section's *behavior* wins and the disagreement is a defect in this section.

Three reading rules:

1. **Wire names are binding. Internal names are illustrative.** Proposales request and response keys, the proposal-metadata key names (§17A.11), and the environment-variable names (§17A.15) are exact. Every other identifier here (`known`, `source`, `SourcedOrAbsent`, …) names a *shape*, and planning may rename it as long as the shape and its rules survive.
2. **Every rule here is written so a test can make it fail.** Where a rule is a construction requirement ("the mapper cannot emit this field") rather than a check, the contract names the mutation that must turn its test red, because a guard that cannot fail is decoration (charter rule 15).
3. **No adjectives.** Where an earlier section says "stable", "bounded", "ranked", "matching", or "without arithmetic", this section replaces the adjective with a per-type, per-field rule. If a mechanism below still reads as an adjective, it is unfinished.

### 17A.1 Shared value shapes

Everything else in §17A is built from four shapes. They exist so that absence, provenance, and money cannot each invent their own encoding.

**Path.** A path is `string[]` — an array of segments, array indices as decimal strings (`["blocks","0","quantity"]`). One path vocabulary is used by validation errors (contract `06-data-contracts-and-validation.md` §8), the approval diff (§17A.10), and the provenance projection (§17A.4). No dotted-string paths anywhere; they are ambiguous over keys containing a dot.

**Sourced\<T\>.** A leaf that has a value:

```
{ value: T, source: <one of the leaf's admissible sources>, ref?: Ref }
```

`ref` is **required** when `source = proposales_content` (it carries the content's `variation_id` as a string) and optional otherwise: for `brief` it MAY carry a quoted supporting passage (§8.3), for `human` it MAY carry the clarification question id or the edit turn. `ref` is never interpreted; it is reviewer and log material.

**SourcedOrAbsent\<T\>.** A leaf that may have no sourced value:

```
{ known: true, value: T, source: …, ref?: Ref }  |  { known: false }
```

**`{ known: false }` is a value, not a missing key.** The field is *required* by the schema; a proposition in which the key is missing fails to parse. Rationale: JSON round-trips drop `undefined`, so if absence were encoded as a missing key, "the human deliberately set no quantity" and "a serializer ate the field" would be indistinguishable — and the second silently becomes the first. This is the single most load-bearing shape in §17A (M9).

**Money.** `{ amountMinor: integer, currency: <ISO-4217, 3 uppercase letters> }`, per contract `06-data-contracts-and-validation.md` §6. `amountMinor` is an integer; a non-integer fails the parse rather than being rounded. Money is never constructed by arithmetic (§17A.12).

### 17A.2 Workflow identity: Generation ID, proposition version, Draft Reference

Deepens §5.2, §7, §11.3, §13. Ledger: **M8**.

**Generation ID — form.** An RFC 4122 version 4 UUID in lowercase canonical 36-character hyphenated form. Validated by that exact pattern on every turn (§17A.3), not by "is a non-empty string".

**Generation ID — who and exactly when.** The server creates it, once, in the prepare-from-brief service, and the creating turn is defined *mechanically*:

```
generationId = inboundState is absent ? newGenerationId() : inboundState.generationId
```

"The first turn" means **the turn that receives no inbound workflow state** — never a caller-supplied "isFirst" flag and never a heuristic over the brief. If an inbound state exists, its id is reused verbatim; there is no path that regenerates it. `newGenerationId` is injected as a dependency with a default (contract `04-server-architecture.md` §4) so tests are deterministic.

**What makes two states the same workflow.** Equality of the Generation ID string, and nothing else. The brief text, the proposition version, `preparedAt`, and the proposition contents **do not** participate in workflow identity. Consequence, stated so nobody builds on the opposite assumption: a caller that copies a state has two states in one workflow, and both resolve against the same Proposales draft — by design (§13).

**Proposition version.** A positive integer, `1` on the first proposition, incremented by exactly 1 by the server on every emitted proposition (agent revision or manual edit), computed from the inbound state. A caller-supplied version is not trusted for the increment. The version is **display and log material only**: no identity, approvability, recovery, or concurrency decision reads it. Stated explicitly because a monotonic counter in a caller-held state invites an optimistic-concurrency scheme that the no-database decision (§4) cannot support.

**Draft Reference — when it becomes present.** At exactly one place: the executing service, after `POST /v3/proposals` returned 200 **and** its response parsed, or after a recovery search produced exactly one verified match. It is written into the returned state. Once present in an inbound state it is copied forward unchanged; there is no path that clears or overwrites it.

**Terminality, mechanically.** On an approval turn the check order is fixed (§17A.13): the state is parsed, and then, **before the approval envelope is parsed and before any completeness or provenance check**, a present Draft Reference produces `conflict` carrying `{ proposalUuid, editorUrl }` — no create, no recovery search, no patch, no model call. The order is part of the contract, not an implementation detail: with any other order, an approval that is both terminal and malformed returns a different code, and criterion 21 would pass or fail on fixture luck.

**Terminality is a property of the state, not of Proposales.** A caller that drops the Draft Reference reaches the recovery path (§13) instead of the conflict. That is the intended lost-response fallback and must not be "hardened" by a live lookup; hardening it would add a Proposales read to a path §11.1 forbids.

### 17A.3 The caller-held workflow state

Deepens §5.2, §16.2. Ledger: **M17**.

**Serializable contract.** The state is plain JSON: no `undefined`, no `Date`, no `Map`, no class instances, no functions. Every timestamp inside it is an ISO 8601 UTC string (§17A.16).

**Contents.** Generation ID; brief; the information-item registry with each item's resolution state (§17A.6); the clarification round, if one occurred (§17A.7); **exactly two propositions** — `preparedProposition` (the last one the server emitted) and `currentProposition` (that one plus any manual edits) — and the Draft Reference once it exists. The state carries **no version history**: two propositions, not a list. This is what makes the approval diff computable (§17A.10) while keeping the state bounded.

**Parsed every turn, whole, strictly.** Every turn re-parses the entire state before doing anything else, including fields that turn does not use, because every turn returns the state and a silently dropped field is a silently lost fact. The state schema is **strict** (contract `06-data-contracts-and-validation.md` §3): an unknown or misspelled key fails with a path rather than being stripped. The reason is concrete: Zod's default strip would silently remove a misspelled `draftReference`, and a stripped Draft Reference re-enables a create — a duplicate draft produced by a typo.

**Validated beyond shape**, without I/O: Generation ID pattern (§17A.2); Draft Reference `uuid` matched against the UUID pattern; Draft Reference `editorUrl` parsed as an absolute `https:` URL whose **origin equals the configured Proposales editor origin** (contract `10-security-and-trust-boundaries.md` §10 — an upstream-provided URL is validated against the expected origin before it is ever handed back to a human as a link).

**Size bound.** The serialized state is bounded by a named constant (`MAX_WORKFLOW_STATE_BYTES`), checked at parse, failing with a dedicated `validation_error` reason. Without it a long revision chain silently exceeds the platform request-body limit and surfaces as transport noise rather than as a bounded, explainable failure. The brief cap and the per-block alternative cap (§17A.16, §17A.8) are set so that a conforming workflow cannot reach the state bound by ordinary use.

**A state that parses but is stale is accepted** (§5.2). The reachable cases, enumerated, so none is handled by accident:

| Stale case | Outcome |
|---|---|
| Draft Reference points at a proposal since archived or sent | approval refused with `conflict` naming that uuid; the application does **not** read the draft's live status (that read is not on the permitted execution path, §11.1) |
| a selected `contentId` is no longer in the catalog | not detected at approval; the create fails at Proposales → `integration_error` (§17A.4 states this limit) |
| proposition version lower than one previously emitted | accepted; the version decides nothing |
| an older state replayed without the Draft Reference | recovery search hits → `recovered` (the designed path, §13) |
| a Generation ID belonging to another workflow | accepted; recovery may return that workflow's draft, flagged `recovered`. It can never cause a second create for that id |

**There is no signature, HMAC, or server-side nonce on the state**, and none is to be added: the application has no authentication (§11.3), the human is the authority (§5.2), and a signature would imply a tamper guarantee the deployment cannot make.

### 17A.4 Provenance and consequential fields

Deepens §8.3, §9.2. Ledger: **M10**. Serves **M1**.

**Provenance is structural, not a side-map.** Every proposition leaf carries its own source *inside the leaf* (`Sourced` / `SourcedOrAbsent`, §17A.1). There is no `Record<path, source>` map that the validator walks.

The reason is a specific silent failure: a validator that iterates a provenance map and checks each entry passes a consequential field that has **no entry at all**. Inverting it (enumerate the consequential paths from the value, demand an entry for each) fixes that hole but leaves a path list that must be kept in sync with the schema. Making the source part of the leaf removes both problems: a value cannot be written without its source, and "which paths are consequential" is answered by the leaf's type.

§9.2's "provenance map" category is satisfied by a **derived flat projection** (`Array<{path, source, ref?}>`) computed from the proposition for display. The projection is never the authority and is never an input to validation.

**Granularity is the leaf, never the object.** `recipient` as a whole has no source; each of its five fields does. A recipient whose email came from the brief and whose phone came from a human must not collapse to one source.

**Three source policies. Every leaf carries exactly one; the assignment is total.**

| Policy | Admissible sources | Applies to |
|---|---|---|
| `consequential` | `brief`, `proposales_content`, `human` | the fields enumerated below |
| `catalog_verbatim` | `proposales_content` only | a selected block's reviewer-facing content title and description — copied from the candidate, never authored |
| `presentational` | `brief`, `proposales_content`, `human`, `inferred` | everything else |

**The consequential leaves, enumerated.** Derived from §8.3's prohibition list and contract `08-agent-architecture.md` §4, intersected with the fields v1's proposition actually has:

| Leaf | Policy note |
|---|---|
| `recipient` (object-level `SourcedOrAbsent`) and each of `firstName`, `lastName`, `email`, `phone`, `companyName` | recipient identity |
| `blocks[i].contentId` | identifier of an existing record; `brief` is **not** admissible — a brief cannot establish a variation id |
| `blocks[i].quantity` | `proposales_content` is not admissible; content carries no quantity |
| `blocks[i].optional` | consequential per §23 round 4; sources `brief`, `human` |
| `commercialNotes[i].amount`, `.currency`, `.taxBasis` | stated price expectations; sources `brief`, `human` only |
| `commercialAssumptions[i].statedValue` for kinds `deadline`, `term`, `scope_commitment` | sources `brief`, `human` only |
| `emptyDraftConfirmation` | **`human` only** — a human act (§8.1), structurally unreachable by the agent |

**Explicitly not consequential**, and therefore `inferred`-admissible: `language`, `title`, `descriptionNarrative`, `blocks[i].reviewerComment`, `alternatives[i].reason`, `agentRationale`, `warnings[i].text`, `assumptions[i].note`, and the **order** of `blocks`. Language is not on §8.3's prohibition list nor on contract 08 §4's, and §8.1 requires the agent to derive it — treating it as consequential would contradict the ratified "derive, then ask".

**Required-to-create and consequential are orthogonal axes**, not a ranking. `language` and `title` are required-to-create and presentational; `blocks[i].quantity` is consequential and not required-to-create. §17A.6 gives the total rule.

**How the schema rejects, and why it cannot be forgotten.** A consequential leaf's schema is a discriminated union on `source` whose members are exactly `brief | proposales_content | human` (plus `{known:false}` where absence is admissible). `inferred` is **not a member**, so a payload carrying it fails the union parse with a path — an absence from the union, not a `.refine()` that a later edit can drop. Named mutation the planner's criterion must record: *add `inferred` to the consequential source union in the schema module; the provenance test must redden.*

**`derived` / "a mechanical derivation naming its inputs" has no reachable target in v1**, so the variant is **not in the v1 schema**. §8.3 admits `inferred` on a consequential field when the value is mechanically derived from sourced inputs; its example is a total computed from a sourced quantity and a sourced unit value. v1 writes no prices, computes nothing (invariant 17), and criterion 20 forbids the proposition from carrying any block price or total — so no consequential leaf exists that a derivation could target. Adding the variant later is a schema change with its own criteria. M1's text is unchanged and stays true; its derivation clause is simply vacuous in v1.

**Stated limit: `contentId` is not verified against the live catalog at approval.** It is checked for form (positive int64) and source. Verifying membership would require a catalog read on the execution path, which §11.1 does not permit. A wrong or withdrawn id fails at `POST /v3/proposals` and surfaces as `integration_error`. This is a limit, not a gap to be closed inside this feature.

**A `human` leaf's `ref` names exactly one of** the answered `questionId` (clarification), the `editTurn` (manual edit), or `{ turnId, quote }` where `turnId` is the current revision instruction's turn and `quote` occurs verbatim in it. The validator resolves each form; an unresolvable `human` ref is `model_output_invalid`. Prior conversation turns are not a valid target: history informs, it never sources. (Added round 8 with §17A.17.)

### 17A.5 Absence, omission, and defaults

Deepens §8.3 ("absence is not invention"), §9.2, §12.1. Ledger: **M9**. Serves **M1**, **M5**.

**Four words, four layers, never interchangeable:**

| Word | Layer | Meaning | Encoding |
|---|---|---|---|
| **absent** | proposition (domain) | the application has no sourced value | `{ known: false }` — a present field with a union variant |
| **omitted** | wire (create request) | the key is not in the JSON body | the mapper does not add the key |
| **default** | Proposales | what the vendor applies to an omitted key (`quantity` 1, `optional` false) | **never represented in our domain before creation** |
| **unset** | proposition, recipient only | the human deliberately leaves the recipient for the editor (§9.2) | the recipient object at `{ known: false }` |

The proposition **never stores `1` or `false` as a placeholder.** "Default" is a rendering derived from `{ known: false }` ("default — Proposales applies 1"), never a stored value, or the "default" the reviewer read would become a sourced fact on the next round-trip.

**How the mapper is constructed so it cannot emit the field.** The block request object is assembled **only** from spreads of per-field helpers, each returning `{}` or `{ key: value }`:

```
{ content_id, type, ...q(block.quantity), ...o(block.optional) }
     where  q(f) = f.known ? { quantity: f.value } : {}
```

There is no object literal that lists an optional key with a possibly-`undefined` value, and no `??`, `||`, or default parameter anywhere on this path. Relying on `JSON.stringify` dropping `undefined` is prohibited: it produces the right bytes by accident and cannot be mutation-tested. Named mutation: *change `q` to `f.known ? f.value : 1`; the omission test must redden.*

**Price fields are unrepresentable, not merely unwritten** (criterion 16, "the mapper has no path that emits them"). The block request schema **does not declare** `unit_value_with_discount_without_tax`, `unit_value_with_discount_with_tax`, `unit_value_without_discount_without_tax`, `unit_value_without_discount_with_tax`, `package_split`, block `currency`, or proposal `currency` / `tax_options`, and the request schema is strict, so adding one fails at parse rather than at review.

**Recipient.** `{ known: false }` at the object level → the `recipient` key is omitted entirely. `{ known: true }` → an inline recipient object containing exactly the leaves that are themselves `known: true`. **If every leaf is absent, the recipient is treated as absent and the key is omitted** — never `recipient: {}`, which a strict vendor schema may reject and which asserts an empty contact.

### 17A.6 Information items, classes, and approvability

Deepens §8.1, §11.3. Serves **M2**.

§8.1's four "classes" are **not a ranked enum and need no precedence**. They are projections of two independent policies plus a resolution state. Stating them as a ranking is how they become a broken enum.

| Axis | Values |
|---|---|
| **ask policy** | `ask_if_underivable` · `do_not_ask` |
| **create policy** | `required_to_create` · `not_required` |
| **resolution state** | `supplied` · `unresolved` · `deferred_by_user` |

Projections back to §8.1's vocabulary, unchanged in meaning: *required-to-ask* = `ask_if_underivable`; *required-to-create* = `required_to_create`; *optional* = `do_not_ask` ∧ `not_required`; *deferred-by-user* = state `deferred_by_user`, reachable only from `ask_if_underivable`.

**Approvability, total and decidable:** approval is refused **iff** some item has create policy `required_to_create` and resolution state ≠ `supplied`. Deferral has no effect on approvability except through the create policy. This is §8.1's reconciliation of "the human can always defer" with contract 08 §6, expressed as one predicate.

**The registry, total over the items §8.1 names.** Item keys are illustrative; the two policies per row are binding.

| Item | ask policy | create policy |
|---|---|---|
| `language` | `ask_if_underivable` | `required_to_create` |
| `title` | `do_not_ask` | `required_to_create` |
| `block_selection` (≥1 block **or** `emptyDraftConfirmation`) | `do_not_ask` | `required_to_create` |
| `sold_scope` (what is being sold, when the brief is ambiguous) | `ask_if_underivable` | `not_required` |
| `recipient_identity` | `ask_if_underivable` | `not_required` |
| `quantities` (brief implies units without stating them) | `ask_if_underivable` | `not_required` |
| `recipient_contact_detail`, `description_narrative`, `block_comments`, `deadline_and_terms_notes` | `do_not_ask` | `not_required` |

`block_selection` is satisfied by either disjunct; `emptyDraftConfirmation` is `human`-sourced only (§17A.4), so the agent cannot satisfy it.

### 17A.7 Clarification questions and answers

Deepens §8.2. Ledger: **M18**. Serves **M2**.

- A question carries a stable `questionId` (server-generated, unique within the workflow) and the `itemKey` it resolves. Answers bind by `questionId`; an answer for an unknown id is a `validation_error` naming its path.
- **A skip is an explicit value, never an absence.** The answer for a question is `{ kind: "answer", text } | { kind: "skip" }`. A question with **no** answer entry leaves its item `unresolved` — it does **not** become `deferred_by_user`. Treating an omission as a skip converts a caller's oversight into a recorded human decision, which is exactly what §8.2's "the skip is a first-class answer" forbids.
- Only a skip moves an item to `deferred_by_user`; only an answer that yields a value moves it to `supplied`.
- **Bounded count.** The clarification schema caps the question array with a named maximum. Model output exceeding the cap fails the output schema → bounded model retry → on continued failure the run ends `failed` (§15.2 row 2). Extra questions are never silently truncated; truncation loses a question the agent judged necessary.
- **"Asks once per preparation"** (§8.2) is decidable from the state: a `clarification` result may be emitted only when the inbound state carries no prior clarification round for this Generation ID. A later-discovered gap becomes unresolved information on the proposition, never a second blocking round.

### 17A.8 Content retrieval, matching, and ranking

Deepens §10.1, §10.2. Ledger: **M12**. Serves **M4**.

**Retrieval.** `GET /v3/content` with `company_id` only — the full active catalog, live, per run (§21.1(d)); no filters, no pagination (evidence §3), no cache. **The vendor's list order is never relied upon** for anything.

**Ranking is a pure total function**, `rank(query, catalog, language) → Candidate[]`, in `server/domain/`: no I/O, no model, no clock, no randomness. The same inputs always produce the same ordered list. This is what makes §10.2's "ranked" and criterion 4 testable.

**What the model may and may not do.** §10.2 permits "lexical, model-assisted ranking, or both". The model assists by **producing the query strings** — synonyms and terms drawn from the brief — which are tool *inputs*. The model does not order candidates and does not emit `matchStrength`: those are not fields it writes, and the tool's output schema is the only place they exist. The model may select a candidate other than the top-ranked one and must state its reason (that is judgment, and it is reviewable); it cannot silently change what "strong" means. Rationale: match strength gates auto-selection and the no-acceptable-match warning below, so a model-set strength would make a correctness signal unfalsifiable.

**Score type.** An **integer on a fixed 0–1000 scale**, never a float. Float thresholds have no testable "exactly at the boundary" point and drift between engines.

**Strength is a total function of the score**, with two named thresholds and a floor:

| Condition | Strength |
|---|---|
| `score ≥ T_strong` | `strong` |
| `T_possible ≤ score < T_strong` | `possible` |
| `T_floor ≤ score < T_possible` | `weak` |
| `score < T_floor` | **excluded from the candidate list** |

Thresholds are named constants in one module. Criteria assert the **contract** — a positive integer scale, half-open intervals, one row per adjacent boundary pair (a score of exactly `T_strong` is `strong`; `T_strong − 1` is `possible`; exactly `T_possible` is `possible`; `T_possible − 1` is `weak`; `T_floor − 1` is excluded) — never the literal values (charter rule 13).

**"No acceptable match" (§10.2) means: no candidate at `possible` or above** for that part of the intent. A weak-only result is precisely the case the reviewer must be warned about, so it produces the warning plus unresolved information, not a quiet selection.

**Auto-selection as the recommended default requires `strong`** (§10.2). A `possible` or `weak` candidate may be selected only with a warning attached naming the strength.

**Ordering is total, ties decidable.** Sort key: `(strength descending, score descending, variationId ascending)`. The final tie-break on `variationId` — unique per content item — makes the order independent of the catalog's arrival order. Without it, sort stability leaks the vendor's list order into our output, which is the drift this contract exists to prevent.

**Bounds** (contract `08-agent-architecture.md` §3). The candidate list returned to the model is capped at a named maximum; each candidate's description is truncated to a named character maximum with an explicit `truncated: true`. Per-block retained alternatives (§9.2) are capped separately.

**The cap must be provably applied.** The fixture catalog in the test suite is **larger than the candidate cap**, or "bounded" is unfalsifiable and the criterion is decoration — the owner states the real catalog is very small (§20), so a fixture sized to the real catalog would never exercise the bound.

**Language.** Matching runs on the localized text in the **proposal language**: `title[language]` concatenated with `description[language]`. A content item without `title[language]` is **excluded from candidates**, and the set of languages the catalog carries is an input to the language derivation (§8.1). This is what criterion 13 measures.

### 17A.9 Revision merge and human-set preservation

Deepens §11.2. Ledger: **M11**. Serves **M4**.

**"Human-set" is exactly `source === "human"`.** There is no second flag. A `humanEdited: true` marker beside provenance would be a second source of truth that can disagree with the first, and the disagreement would be invisible.

Because every leaf carries a source (§17A.4) — presentational leaves included — a human-rewritten title is as protected as a human-supplied recipient email.

**The merge is application code, not the prompt.** A revision turn:

1. sends the current proposition and the human instruction to the model;
2. parses the model's output as a proposition **and** an explicit `requestedOverrides: Array<{ path, reason }>`;
3. merges deterministically in `server/domain/`, per leaf:

| Case | Result |
|---|---|
| current leaf source ≠ `human` | the model's leaf is taken |
| current leaf source = `human`, path **not** in `requestedOverrides` | **the human leaf is kept**, unchanged, `ref` included; if the model proposed a different value, a warning is recorded naming the path (§11.2's "when in doubt the agent keeps the human value and records a warning") |
| current leaf source = `human`, path **in** `requestedOverrides` | the model's leaf is taken **and** a warning is recorded naming the path, the previous value, and the new one, quoting the model's reason |

A path absent from `requestedOverrides` is **structurally** un-overwritable, whatever the model put in the proposition body. That is the mechanism M4 rests on; the prompt merely explains it.

**An override cannot launder an invention.** The replacing leaf is parsed by the same schema, so on a consequential leaf it must carry `brief`, `proposales_content`, or `human` (§17A.4). A revision therefore cannot replace a human-set recipient email with a model-authored one; it can only replace it with a value it can attribute to the brief or the catalog.

**Manual edits** produce leaves with `source: "human"` and are validated by the same schema; an edit violating a domain rule (a non-positive quantity, §11.2) is a `validation_error`, never silently corrected.

**Both paths emit the same proposition shape**, so approval never depends on which produced the final version (§11.2), and both increment the version by exactly 1 (§17A.2).

### 17A.10 The approval envelope and the prepared → approved diff

Deepens §11.3, §3.1. Serves **M5**.

**The library-pricing acknowledgment is a required literal, not a boolean:**

```
pricingAcknowledgment: { acknowledged: true (literal), statement: "<statement id>" }
```

`z.literal(true)` rather than `boolean` so that **absent** and **`false`** are the same parse failure at the same path; a boolean invites a caller to send `false` and an implementer to read it as "not yet". The `statement` id is a version constant naming the exact wording the human acknowledged; if that wording ever changes, envelopes carrying the old id fail loudly instead of silently meaning something else.

**Its refusal is `validation_error`**, at path `pricingAcknowledgment` (criterion 17), *not* `approval_required`. §15.2's `approval_required` row covers a different case: a consequential mutation reached without passing through the approval entry point at all (contract `10-security-and-trust-boundaries.md` §5). The two are easy to conflate; §17A.13 fixes both in one order.

**The diff needs both sides in the state.** §11.3 records the diff of the approved proposition against the prepared one, and the server keeps nothing between turns — so `preparedProposition` (the last proposition the server emitted) travels in the workflow state beside `currentProposition` (§17A.3). Without it the diff is uncomputable and an implementer will either drop it silently or diff against nothing.

**The diff is a log and review record, not a tamper control.** The caller supplies both sides. §11.3 already places the responsibility with the human; nothing downstream may treat a small diff as evidence of anything.

**What counts as a difference — total:**

- both sides are compared as **canonical JSON**: recursive key sort, then structural comparison;
- **arrays are compared positionally.** `blocks` is ordered and its order reaches the vendor, so a reorder is a difference at each moved index — never a set difference;
- **the leaf's source and `ref` are part of the comparison.** Re-sourcing the same value (agent-proposed → human-confirmed) **is** a difference, because who stands behind a value is the thing approval is about;
- **`{known:false}` vs `{known:true}` is a difference**, in both directions;
- `propositionVersion` and `preparedAt` are **excluded**; they always differ and would drown the record;
- output: `Array<{ path: string[], before, after }>` sorted by path — a total order, so the record is reproducible.

**Logging.** The diff object may carry values in-process and to the reviewer. The **log event carries only the paths and a count** — never `before`/`after` values — because the diff can contain recipient email and free text, which contract `10-security-and-trust-boundaries.md` §7 keeps out of logs. "Record the diff for logs" must not become "log the diff".

### 17A.11 Execution: order, recovery search, and proposal metadata

Deepens §12.1, §13, §14. Ledger: **M14**. Serves **M5**, **M6**.

**The recovery search request is fully determined.** `GET /v3/proposal-search` with exactly:

| Parameter | Value | Why |
|---|---|---|
| `company_id` | the configured company | injected by the client (contract `07-integrations.md` §6) |
| `filter[proposal_copilot_generation_id]` | the Generation ID | the one recovery key |
| `limit` | the documented maximum (25) | **the documented default is 1** (evidence §5); at the default, "more than one proposal carries the Generation ID" (§13, criterion 8) is undetectable and the search silently returns one |
| `recipient_email`, `exclude_revision_drafts`, `include_archived` | **not sent** | v1 creates no versions; the default already excludes archived drafts, and an archived draft must not be recovered as a live editor URL |

**Every returned row is re-verified in the client:** `row.data["proposal_copilot_generation_id"] === generationId`, exact string equality, before the row is counted. The vendor's filter semantics (exact vs prefix, case sensitivity) are not documented (evidence §5, §7), so the filter is treated as a narrowing hint and the equality is ours. Zero verified rows → create; one → `recovered`; two or more → `conflict` (§13).

**Proposal metadata (§14) — exact and closed.** The create request's `data` object contains **exactly** these three keys and nothing else (a closed request schema, so nothing can leak in):

| Key (binding) | Value type | Value |
|---|---|---|
| `proposal_copilot_source` | string | the fixed marker `"proposal-copilot"` |
| `proposal_copilot_generation_id` | string | the Generation ID, lowercase canonical UUID |
| `proposal_copilot_created_at` | string | ISO 8601 UTC with `Z`, millisecond precision, from the injected clock |

Rules: **all values are strings** — only flat keys with tested value shapes are established as filterable (evidence §5), and `filter[k]=v` is a query parameter, so a non-string value's filter encoding is unestablished. Keys are top-level only and contain no `.`. Not written in v1: the brief summary (§14 "only if the owner wants it" — the default is no, and it would place model-authored text in a vendor system) and the generating model name (§14 "not by default"; correlate through logs by Generation ID). Both are additive later without changing any existing key's meaning.

**Prefix collision (§14).** `data` also feeds a company's proposal variables, and no public endpoint enumerates those variables — so a collision is **improbable by prefix choice, not detectable**. `proposal_copilot_` is chosen to be long and self-describing where a human might see it in Proposales. The application writes no key without the prefix and interprets no key it did not write. The integration README states the reserved prefix.

**No metadata version key.** It was considered and rejected: a version key earns its place when an existing key's *meaning* can change, and a UUID's cannot. Adding keys is already safe. The condition to revisit is a change in meaning, never an addition.

**Create.** Exactly one `POST /v3/proposals`, never auto-retried (contract `07-integrations.md` §5, §12.1), from a single call site with no surrounding loop — which is why §15.2's "second execution detected within one turn" has no reachable path in v1 (§17A.13 notes this).

### 17A.12 Applied Pricing and money

Deepens §7 (Applied Pricing), §12.1, §15.1. Ledger: **M13**. Serves **M6**, invariant 17.

**In.** From `GET /v3/proposals/{uuid}`: `value_without_tax`, `value_with_tax` (integer cents), `currency`, `tax_options`, and per block the four `unit_value_*` (integer cents), `quantity` (a `number`, not necessarily an integer), `optional`, and `package_split[]`.

**Out.** Every money value becomes `Money` (§17A.1) carrying **the proposal's** currency. A block's own `currency` is documented as informational (evidence §6): it is carried verbatim as a string and **never used to construct a `Money`**, because a block whose informational currency drifted would otherwise produce two currencies inside one proposal. If a block currency is present and differs from the proposal currency, a **warning** is attached to the result — string inequality, reported, never reconciled.

`quantity` is parsed as `z.number()` and carried verbatim; it is **not** coerced to an integer, because the vendor types it as `number`. (On the input side, the proposition's quantity domain rule is: finite and `> 0`; `≤ 0`, `NaN`, and `Infinity` are rejected. No integer rule is invented — the vendor has none, and services are sold in fractional units.)

`package_split[].vat` is a **rate, not money** (a 0–1 float; the investigation observed `0` and `0.25`, evidence §8.3). It is carried as the parsed number, marked display-only, and **never multiplied, compared numerically, or rounded**. No rounding rule is needed anywhere in this mapper, because every money field Proposales returns is already integer cents.

**"Without arithmetic", stated as a closed pair of lists.**

*Forbidden on any money field:* addition, subtraction, multiplication, division, modulo; rounding, flooring, ceiling, `toFixed`; minor⇄major unit conversion; currency inference or conversion; summing blocks into a total; recomputing a total from unit values and quantity; any numeric comparison, including checking whether `value_with_tax − value_without_tax` is consistent; defaulting a missing money field to `0`.

*Permitted:* renaming keys, changing case, wrapping an integer into `{ amountMinor, currency }`, and **string** equality comparison (used only for the currency warning above).

**The application does not detect inconsistency**, because detecting it is arithmetic. A draft whose stored totals disagree with its unit values is reported exactly as Proposales returned it (criterion 18) and the reviewer sees the numbers. Named mutation: *replace the mapped total with the sum of block unit values × quantity; the inconsistent-fixture test must redden.*

**"Unavailable, with reason" is a variant that carries no money at all:**

```
appliedPricing: { available: true, … }  |  { available: false, reason: <closed enum>, status?: integer }
```

The reason enum is closed — `read_failed_upstream`, `read_failed_timeout`, `read_failed_schema_mismatch`, `read_budget_exhausted` — never free text, because a free-text reason is where a raw vendor body gets forwarded (§15.2). The unavailable variant declares **no** money fields, so "unavailable" can never be rendered as `0` — which is what an implementer reaching for optional fields would produce.

**Read-back bounds.** The read is idempotent and retried only on a `retryable` failure (429, 5xx, timeout), at most a named maximum of attempts, with bounded backoff and a total elapsed cap that leaves headroom inside the function duration limit (contract `02-runtime-boundaries.md` §9). On exhaustion the result is still `created` or `recovered` with `available: false` and the matching reason (§11.3, criterion 19). A `404` on the read-back after a successful create is `available: false, reason: read_failed_upstream` — never a `not_found` error, because the draft exists and its editor URL is valid.

### 17A.13 Errors: the total precedence order and the taxonomy map

Deepens §15. Serves **M6**.

**§15.1 is missing a state.** §4, §15.2, M7, and criterion 10 all rely on a `failed` run outcome that §15.1's "Domain result states" table does not list. Resolved by contract: **`failed` is a fifth domain result state**, alongside `clarification`, `proposition`, `created`, and `recovered`. This is a correction of an omission four other sections already depend on, and it is listed for owner ratification in the round-1 handoff.

**Check order on an approval / execution turn. The first failure wins; the order is binding** (M8):

| # | Check | Failure |
|---|---|---|
| 1 | workflow-state schema parse (strict, §17A.3) | `validation_error` with paths |
| 2 | **Draft Reference present** | `conflict` with `{ proposalUuid, editorUrl }` — no create, no search, no patch (§11.3) |
| 3 | approval-envelope parse, including `pricingAcknowledgment` | `validation_error` |
| 4 | proposition schema parse, including the provenance unions | `validation_error` |
| 5 | required-to-create completeness and `emptyDraftConfirmation` (§17A.6) | `validation_error` naming the items |
| 6 | recovery search | request failure → `integration_error`; ≥2 verified matches → `conflict`; 1 → `recovered` |
| 7 | create | failure → `integration_error`; never auto-retried |
| 8 | read-back | never fails the turn (§17A.12) |

Separately, the executing service refuses any call that does not carry a parsed approved proposal with `approval_required` (contract `10-security-and-trust-boundaries.md` §5). That is a guard on the service's own entry, distinct from check 3.

**§15.2's "second execution detected within one turn" has no reachable path in v1.** Execution has one call site with no surrounding loop and no auto-retry (§17A.11), so a second execution within one turn is structurally impossible rather than guarded. The taxonomy assignment is preserved; **no criterion should be written for it**, because writing one would require inventing the path it guards.

**Proposales failures → the client's `IntegrationError` (contract `07-integrations.md` §4), total over what the transport can produce:**

| Upstream condition | `details.reason` | `details.retryable` |
|---|---|---|
| DNS / connect / socket failure | `transport` | true |
| timeout or abort | `timeout` | true |
| 400 (carries `error.issues`) | `bad_request` | false |
| 401 | `unauthenticated_upstream` | false |
| 403 | `forbidden_upstream` | false |
| 404 | `not_found_upstream` | false |
| 409 | `conflict_upstream` | false |
| 429 | `rate_limited_upstream` | true |
| 5xx | `server_error` | true |
| any other 4xx | `bad_request` | false |
| body is not JSON | `invalid_body` | false |
| body parses as JSON but fails the response schema | `schema_mismatch` | false |

All carry `details.system = "proposales"` and `details.status` where an HTTP status exists. **What may cross:** `error.message`, only when the body parsed as `{ error: { message: string } }` and the string is within a named length cap — the vendor documents these as user-safe (evidence §1) — and `error.issues` as `{ path: string[], message: string }` under the same cap. **What may never cross:** the raw body, headers, the request URL, or any string that failed those checks; a generic message is used instead and the original goes to `cause` (contract `04-server-architecture.md` §6).

**Transport precedence.** Classify a non-2xx reply by its HTTP status before examining whether its body is readable. Thus a `429` is `rate_limited_upstream` and a `5xx` is `server_error`, both retryable, even when the body is HTML, empty, or otherwise not JSON. `invalid_body` applies only when a successful (2xx) reply cannot be parsed as JSON; a successful JSON reply that fails its response schema remains `schema_mismatch`. A readable non-2xx body may supply only the bounded safe message and issues described above; it never changes the status classification. This closes the status × body-shape product rather than leaving retry behavior to parser order.

**AI provider failures.** Same shape, `details.system` naming the provider generically, and — because contract `07-integrations.md` §4 assumes only Proposales' messages are safe — **the provider message never crosses**; it lives in `cause`. Reasons: `unauthenticated_upstream`, `timeout`, `rate_limited_upstream`, `server_error`, `transport`, `content_filtered`, and `not_configured` (§17A.15).

**Model output that fails our schema after bounded retries is not an integration failure:** `validation_error` with `details.reason = "model_output_invalid"` and the issue **paths only** — never the model's text — and the run ends `failed` (§15.2 row 2).

**Budget exhaustion is a domain result, not an error.** §15.2 leaves the choice to planning and requires only distinguishability; contract `08-agent-architecture.md` §9 already says an exceeded budget "ends the run with a `failed` result". Resolved accordingly: no `AppError` is thrown. The run result carries `{ status: "failed" | "clarification", failure: { reason: "budget_exhausted", budget: "wall_time" | "tool_calls" | "tokens" } }`. An exception would lose the clarification path, and `internal_error` (HTTP 500) would misreport an expected, budgeted outcome.

### 17A.14 Run budgets and run-result reporting

Deepens §4, §12.2. Ledger: **M15**. Serves **M7**.

| Budget | Unit | Measured | Checked |
|---|---|---|---|
| `wallTimeMs` | integer milliseconds | a monotonic clock from run start | before every model call and every tool call; also passed down as the per-request timeout ceiling, so one long call cannot overshoot the run |
| `maxToolCalls` | integer count of tool `execute` **invocations** — not steps, not tool results | incremented immediately before `execute` | before dispatching the next tool call |
| `maxTokens` | integer, summed over every provider call's reported usage in the run | after each call (it is unknowable before) | before starting the next call |

All three are inputs to `run()` and are configured in `src/lib/ai/` (contract `08-agent-architecture.md` §8, §9), never as literals at call sites. `wallTimeMs` is set below the platform function duration limit with stated headroom (contract `02-runtime-boundaries.md` §9).

**Honest limit, stated so a criterion is not written against a false promise:** the token budget bounds the **run**, not any single call. One call may overshoot it; the loop then starts no further call.

**Detection is between calls.** The loop never interrupts an in-flight call except through that call's own timeout.

**Outcome on exhaustion, decidable:** `clarification` if at least one item with ask policy `ask_if_underivable` is still `unresolved` at the moment of exhaustion, otherwise `failed`. Either way the exhausted budget is named. **The run's accumulated draft is discarded, never emitted** — "here is what we have so far" is precisely the fabricated proposition §4 forbids.

**Cost reporting on every result, including failures.** Every run result carries `{ provider, model, usage: { inputTokens, outputTokens, totalTokens } }` (§12.2, criterion 14) — a budget-exhausted run that reported no cost would defeat the comparison the reporting exists for. A usage figure the provider did not report is `null`, never `0`; the absent-is-not-zero rule of §17A.5 applies to usage as it does to money.

### 17A.15 AI provider selection

Deepens §12.2 and the §23 round-4 mechanism note. Ledger: **M16**. Evidence: §9.1.

**The hazard, established from the installed package** (evidence §9.1): in `ai` 7.0.92 a plain **string** model id is resolved through `globalThis.AI_SDK_DEFAULT_PROVIDER ?? gateway`, and `@ai-sdk/gateway` authenticates with `AI_GATEWAY_API_KEY` **or a Vercel OIDC token**. On Vercel a string model id can therefore succeed with **no configured secret at all**, and every run's reported provider, model, and cost would describe the gateway's routing rather than the configured vendor — the exact silent failure §12.2's comparison requirement cannot survive.

**"Explicitly", as code shape.** `src/lib/ai/` resolves a **provider instance** from configuration and passes a **model instance** to every SDK call. A string model id is unrepresentable at the call site: the internal `generate` / `generateStructured` / `stream` signatures accept the SDK's language-model type, which a `string` does not satisfy. One registry, keyed by the configured provider enum, is the only place a model id becomes a model. `globalThis.AI_SDK_DEFAULT_PROVIDER` is **never assigned** — assigning it would install a second, hidden selection mechanism.

**"Explicitly", as configuration.** `AI_PROVIDER` (a closed enum; `gateway` is **not** a member), `AI_MODEL` (string), and the matching vendor key, all validated in `src/lib/env/server.ts` at module load (contract `06-data-contracts-and-validation.md` §2) with **no defaults and no fallbacks**, and a refinement requiring the vendor key that `AI_PROVIDER` selects. A missing or unknown value throws at load. A provider that cannot be constructed surfaces as `not_configured` (§17A.13), never as a gateway call.

**Named mutation** the planner's criterion must record: *widen the internal signature to accept `string` and pass `AI_MODEL` through; the provider-selection test must redden.*

**Test-suite consequence for the master plan's environment topology.** Criterion 12 requires `npm test` to run without network or secrets, while the env module fails loudly on missing AI variables. Resolution: the suite runs against the scripted fake `@/lib/ai` implementation and supplies non-secret placeholder values for `AI_PROVIDER`, `AI_MODEL`, and the vendor key from the test setup. Fail-loud is preserved in every real environment; no test ever reaches a provider. No `@ai-sdk/<vendor>` package is installed today (evidence §9), and installing the first candidate remains a planning decision (§12.2).

### 17A.16 Text bounds, timestamps, and clocks

Deepens §7 (Brief), §9.2; contract `10-security-and-trust-boundaries.md` §4.

- **Every free-text field has a named maximum length and is trimmed** at the schema: brief, revision instruction, title, narrative, per-block reviewer comment, commercial-note text, question text, answer text, agent rationale, warning text, assumption note, and `ref.quote`. The brief cap and the alternatives cap are set so a conforming workflow cannot reach `MAX_WORKFLOW_STATE_BYTES` (§17A.3) by ordinary use.
- **Free text is data.** Narrative and title are Markdown per the vendor's subset (§9.2); this application never renders model or human text as HTML (contract `10-security-and-trust-boundaries.md` §4).
- **A stated price expectation is never parsed out of free text.** `commercialNotes[i].amount` is `SourcedOrAbsent<Money>`: a brief saying "around 12k" cannot be represented as `Money`, so the amount is `{ known: false }` and the stated wording is preserved in the note's text. Extracting a number from prose with a pattern is invention, not sourcing. `currency` must be a valid ISO-4217 code or the note carries none. `taxBasis` is the closed enum `including_tax | excluding_tax | unstated`, with `unstated` explicit — never defaulted to one of the other two.
- **Time.** All application-produced timestamps come from an injected `now()` (contract `04-server-architecture.md` §4), never an inline `Date.now()`, and are ISO 8601 UTC with `Z` at millisecond precision. Proposales' int64 epoch values are interpreted **only** inside the adapter's mapper (contract `06-data-contracts-and-validation.md` §6, §2.1); no application code ever sees an epoch integer.

**External epoch bound.** Before mapping a Proposales content item's `created_at`, the adapter accepts only an integer millisecond epoch for which `new Date(value).toISOString()` is a four-digit-year value accepted by `isoTimestampSchema`. A value outside that range is a Proposales response-schema failure (`schema_mismatch`) naming `created_at`; it fails the entire content read. The adapter never drops the item, substitutes a time, or lets a `RangeError` escape. This validates vendor input at the integration boundary and does not widen or alter the shared ISO timestamp value contract.


### 17A.17 Conversation context

Deepens §5.2, §11.2, §12.2. Ledger **M19**; also serves M4 and M10.

1. **Two objects, never merged.** `ConversationContext` is a sibling of the workflow state on every turn's input and result, owned by the feature's schemas; neither schema admits the other. Strict, JSON-serializable, no signature (§17A.3's reasoning applies).
2. **Contents.** Human turns are free-text instructions only; clarification answers (§8.2) and manual edits (§11.2) are structured data and never become turns. Assistant turns are rendered by the application from the validated result — ids, catalog-verbatim titles, enum kinds, the rationale — never model-authored text, never warning or assumption free text.
3. **Bounded.** A named turn cap and a named per-turn text cap at the schema; beyond the cap the oldest turns are dropped and counted, never the newest.
4. **The latest human turn is distinct.** It is passed separately from the context, rendered as the final labeled block of the run, and appended to the returned context after the run together with the assistant turn. The inbound context never contains it.
5. **Prompts.** History and the current instruction reach the model only as labeled untrusted data blocks (10 §6); nothing user-provided enters the system prompt.
6. **Resolution, not authority.** A conversational reference becomes a fact only as a content identity present in the run's retrieval record — the current proposition's blocks and alternatives plus this run's tool results — with `proposales_content` provenance; anything else is `model_output_invalid`. Prior conversation text is not a provenance source. A value the human states in the current instruction may become a `human` leaf only through `ref: { turnId, quote }` (§17A.4), so the reviewer sees the exact words it came from.
7. **Approval and execution have no conversation parameter**; the envelope is strict, so a caller cannot smuggle it in.

**Named mutations:** seed the retrieval record empty → the "use the second one" row reddens; append the instruction into the history block → the separation row reddens; skip the window trim → the cap row reddens.


### 17A.18 Structured logging and redaction

Deepens contract `10-security-and-trust-boundaries.md` §7. Ledger **M20**. This is a server-only diagnostic boundary; it creates no product data, external call, persistence, or UI surface.

1. **One owned frame.** Each logger call sends its sink exactly `JSON.stringify(record) + "\\n"`. `record` has fixed `level`, `event`, and ISO timestamp `time` fields; caller fields cannot overwrite any of them. The logger does not mutate the caller's value.
2. **Central, exact redaction.** Before serialization, every object key whose lowercase spelling is one of `authorization`, `apikey`, `api_key`, `token`, `password`, `secret`, or `email` has its value replaced with `"[redacted]"`. This is a closed v1 denylist: widening it is a future intention amendment, never an ad-hoc call-site exception. It deliberately extends contract 10 §7 by adding `api_key`, because environment-derived values commonly use that spelling.
3. **Total walk.** `null`, strings, booleans, and finite JSON numbers pass through unchanged. Arrays remain arrays and every element is processed recursively. Plain objects retain their keys and are processed recursively. A non-plain value, a non-finite number, a bigint, or a cycle becomes the literal `"[unserializable]"`; the logger never invokes a foreign `toJSON`, calls arbitrary methods, or throws while serializing diagnostic fields. A transport that needs a causal diagnosis first maps it to deliberately safe plain fields; raw upstream bodies, prompt/model text, and unapproved personal data never reach this boundary.

**Named mutations:** remove `api_key` → its row reddens; stop recursive handling inside an array → its row reddens; preserve a cyclic value → the total-serialization row reddens; spread caller fields after the frame → the frame-ownership row reddens.


## 18. Scope ladder

### Must ship

Everything in §3 items 1–7 with the invariants in §6, product content blocks only, inline recipient details, single `POST /v3/proposals`, **post-create read-back of the Applied Pricing** (one `GET /v3/proposals/{uuid}`, promoted from "only if cheap" in round 3 because the public read already provides the totals and per-block values without new API ambiguity), generation-ID recovery, taxonomy errors, fake-based test suite.

### Only if cheap

- Including `series_uuid` and `status` in the result from the read-back that already happens.
- Video content items handled by the same selection path.

### Explicitly deferred (not in this feature)

Final product UI · dashboard · authentication · application database (persistence is a post-v1 consideration the owner will revisit under contract 09 §14) · durable workflow or audit storage · catalog caching or indexing · automatic sending · acceptance/rejection handling · automatic withdrawal · content creation by this agent · a specialized content-creation agent · file upload · email ingestion · CRM ingestion · automatic pricing invention · **price overrides on blocks** (a follow-up intention may add them only through an explicitly tax-complete human input: all four unit values plus a matching VAT split, per evidence doc §8; never from a single amount) · templates and background media · attachments · discounts and tax overrides · proposal-history tools for the agent (`search_proposals`, `get_proposal` as agent tools; no concrete MVP preparation use case was found) · revision lifecycle of already-sent proposals · **patching an existing draft by uuid from Copilot** (the public patch exists but replaces the whole block list and can discard editor edits; after handoff Proposales is the editing environment) · asserted approver identity · use of any non-public Proposales endpoint · multi-company scope.

## 19. Established Proposales facts relied upon

Verified against `api-documentation/proposales/` (snapshot in the repository) and the repository's recorded runtime observations; details and citations in the evidence doc.

1. The public API base is `https://api.proposales.com`; authentication is a bearer token tied to a user; company scope is supplied as `company_id` (query or body), configured server-side in this deployment.
2. `POST /v3/proposals` creates an editable **draft**; requires `company_id` and `language`; accepts `title_md`, `description_md`, `recipient` (inline or `{ id }`), `data`, `blocks`, `tax_options`, `attachments`, `tracking`, `creator_email`, `contact_email`; the body is strict (unknown keys rejected). Response: `{ proposal: { uuid, url } }`.
3. `blocks[].content_id` must be the content's **`variation_id`**; block data overrides content-library defaults; per-block `quantity`, `optional`, `currency`, `unit_value_*` are accepted on input.
4. Content has `product_id` and `variation_id`; each product currently has exactly one variation.
5. `GET /v3/content` lists content with id-based filters only; no text search; no pagination; no price fields.
6. Proposal `data` is a free-form object preserved when the draft is sent; custom flat keys are filterable through `GET /v3/proposal-search?filter[<key>]=<value>` (runtime-verified for tested keys); search returns up to 25 results with `uuid`, `series_uuid`, `status`, `data`, `url`.
7. Proposal drafts have editor URLs (`url` on create, patch, and search responses).
8. The public API documents **no send endpoint**.
9. `PATCH /v3/proposals/{uuid}` works only on `draft` or `template`; other statuses return 409.
10. New versions of a sent proposal are separate UUIDs in the same series (`POST /v3/proposals/{uuid}`), with same-draft idempotency until sent.
11. A proposal has one currency; tax mode is company-level and captured on the proposal.
12. Timestamps are int64 of observed millisecond scale; the adapter owns the interpretation.
13. The error body is `{ error: { message } }`, documented as user-safe; strict-body 400s may include `error.issues`.
14. **Price overrides (established empirically, 2026-09-05, evidence doc §8; not a vendor guarantee):** Proposales persists each documented block `unit_value_*` field independently and derives nothing; a partial write leaves the counterpart values at library defaults and produces inconsistent totals. The only tax-consistent override observed was all four documented unit values plus a matching complete `package_split`. Undocumented short field names are accepted with HTTP 200 and ignored. `GET /v3/companies` exposes currency and tax mode only, not VAT rates; no public pre-creation endpoint exposes content prices or VAT splits.
15. **Post-creation pricing is readable.** `GET /v3/proposals/{uuid}` returns `value_without_tax` and `value_with_tax` in integer cents, `currency`, `tax_options`, `company_tax_mode_live`, `series_uuid`, `status`, and per block the four `unit_value_*` fields in cents, `quantity`, `optional`, and `package_split` (documented in the entity reference; read back on every investigation draft in evidence doc §8). This is the only public source of the prices a draft carries, and it exists only after the draft does.

## 20. Not yet established (do not treat as fact)

- Whether omitting `tax_options` on create yields the company default tax behavior on the draft (expected; verify during implementation).
- Whether an inline recipient whose email matches an existing Proposales contact is deduplicated or duplicated.
- Whether nested keys or non-string values in `data` are filterable (only flat tested keys are established).
- Whether Proposales will ever derive tax counterparts from one unit value in a future API version; the observed absence of derivation (fact 14) is empirical, not a documented guarantee. Irrelevant to v1, which writes no prices.
- Whether `ProposalBlockInput` tolerates fields absent from the OpenAPI schema (for example discounts); the entity documents them, the input schema does not list them.
- Exact size of the target company's content catalog. The owner states it is very small (round 1); the plan records the measured count when the adapter first lists it.

## 20A. Pre-implementation protocol

Items that must happen before planning can treat their subject as settled. None of them is implementation work on the feature.

1. **Price-override investigation: done (2026-09-05).** The owner ran the clean-create matrix against one disposable content item (evidence doc §8, 18 tagged drafts, none sent). Result: no safe single-amount override exists through the public API; v1 writes no prices (§9.2). Remaining housekeeping: the 18 disposable drafts listed in evidence doc §8.5 are archived by the owner in the Proposales UI.
2. **Documentation-root patch.** Contract 14 §2–§4, the root README "Documentation map" and "Repository structure", and the contract guide §7 name `docs/` as the home of intentions, implementation plans, investigations, and decisions. The owner has renamed that root to `build_docs/` for this application. Per the guide §6 ("the contract is stale: patch the contract in its own change, with rationale"), this is a dedicated change, not part of this intention. Until it lands, this document and its evidence doc are the only artifacts under `build_docs/`, and the intention stays at its current path by owner decision.
3. **Mechanism inventory** follows ratification, per the pipeline charter.

## 21. ⚠ OWNER DECISIONS REQUIRED (0)

Ratified on the surface below (§23, round 5). All seven cards are closed. Cards 1, 3, 4, 5, and 6 were answered in round 1 (§23). Card 2 closed in round 2 on the owner-run investigation: **no price writes in v1** (§9.2, fact 14). The ratification surface (§21.1) restates every consequential resolution so the owner ratifies them explicitly; ratification is recorded in §23, never assumed.

### 21.1 Ratification surface (presented 2026-09-05)

1. **Outcome.** A backend that turns a free-form brief into a reviewable proposal proposition assembled from existing Proposales content, asks once about core gaps and lets the human skip, lets the human edit or have the agent revise, and on explicit approval deterministically creates a Proposales draft at library pricing, reads back the prices Proposales applied, and returns the editor URL with those amounts. Approval in v1 is approval of structure and content plus authorization to create at library pricing, not monetary approval; the final monetary review and the sending stay in Proposales.
2. **Measurement ledger.** §17, M1 to M7, verbatim.
3. **Scope.** Must ship: §18 "Must ship". Non-goals: §18 "Explicitly deferred", including no price writes, no content creation, no database, no UI, no send automation.
4. **Consequential resolutions to confirm.** (a) Required-to-create is language, title, and one content block or an explicit empty-draft confirmation. (b) v1 writes no prices; brief-stated prices are reviewer notes. (c) Language is derived then asked, with no default-language configuration. (d) Full live catalog retrieval per run, no cache. (e) Provider pluggable between Anthropic and OpenAI by configuration, none permanent, usage reported per run. (f) Documentation root is `build_docs/`; the contract patch is a separate change. (g) Shaper resolutions in the round 0 changelog: one generation ID per workflow, no proposal-history agent tools, flat prefixed metadata keys, single create call. (h) Approval in v1 is structural and content approval plus authorization to create at library pricing, carried as data in the approval envelope and refused when absent; it is not monetary approval. (i) Execution reads the created or recovered draft back and reports the Applied Pricing without arithmetic; a failed read never downgrades a successful create. (j) Once a draft exists, the workflow is terminal: a re-approval carrying the draft reference is refused with a conflict pointing at the existing draft; no patch by uuid. (k) Inline recipients may duplicate existing Proposales contacts; accepted for v1 and stated to the human. (l) Unsourced quantity and optional flag are omitted so Proposales applies its defaults; the optional flag is consequential; title and narrative are written in the proposal language; a brief currency differing from the company's is a warning, never written; no approver identity is asserted.

### 21.2 Ledger-extension ratification surface (presented 2026-09-05, round 7)

§21.1 above records what was presented at the round-5 ratification and is left exactly as it was presented; it is a historical record of that act, not a running summary. This section records the **second, narrower** ratification act, which extended the ledger only.

**Presented:** the eleven measurement objectives M8–M18 in §17.1, each with its objective, the defect family it guards, and the §17A mechanism contract whose invariant it registers; grouped for the owner as: nothing gets invented (M9, M10, M11, M18) · duplicate drafts (M8, M14, M17) · money reported never computed (M13) · reproducible content ranking (M12) · honest cost and provider reporting (M15, M16).

**Approved:** all eleven, none cut. The owner confirmed in session after asking whether the extension was about idempotency or about the absent application database, and receiving the distinction: the ledger declares what the build must demonstrate, not what it must contain; three of the eleven concern duplicate drafts precisely *because* there is no server-side memory, and the no-database decision (§4, §18) is not reopened.

**Also relayed and accepted at the same time:** the five internal inconsistencies §23 round 6 lists as resolved by contract, and the coordinator's statement that a small number of the §17A contracts do change what gets built (the recovery search's `limit`, explicit provider selection) as mechanical consequences of rules already ratified in round 5, rather than as new product decisions. The owner did not object to that reading.

**Not on this surface:** nothing in §21.1 moved. No scope change, no new endpoint or capability, no change to any resolution (a)–(l). The intention's status stays `RATIFIED` throughout.

### 21.3 Logging and redaction ratification surface (presented and approved 2026-09-05, rounds 9–10)

**Owner decision:** card 1 option **A** — record the logging and redaction rule in the intention before phase 2 builds it. The addition re-opened the intention gate because it creates a new, testable safety contract that later phases will rely on.

**Approved:** §17A.18 and M20, verbatim. In plain terms: server diagnostics are structured one-line JSON; the logger itself removes values held under the eight listed sensitive-key spellings, regardless of case or nesting; arrays and normal JSON values retain their shape; malformed, cyclic, or opaque diagnostics become `[unserializable]` rather than crashing or invoking foreign serialization; and application fields cannot rewrite the event metadata. The rule adds no user-facing capability, persistence, network call, UI, or change to the approved proposal workflow.

**What approval does:** ratifies M20 as a trace target and makes §17A.18 the source of truth for phase 2's logging criteria. It does not approve logging raw request/response bodies, prompt/model text, credentials, or personal data beyond correlation ids; those remain prohibited by contract 10 §7.

### 21.4 Phase-3 transport precedence and timestamp-validation ratification surface (presented and approved 2026-09-05, rounds 11–12)

**Owner decisions:** projection card 1 option **A** and projection card 2 option **A**.

**Approved:** For a non-successful Proposales HTTP response, status decides the error class before body parsing: `429` and `5xx` retain their retryable upstream classifications even if the vendor sends HTML or another unreadable body. Only a successful reply with an unreadable body is `invalid_body`. A content `created_at` that cannot be represented as the application's four-digit ISO timestamp fails the entire catalogue read as a named upstream schema mismatch; the item is never silently omitted.

**What approval does:** ratifies the two additions above to §17A.13 and §17A.16 as the semantic authority for phase 3. It adds no endpoint, persistence, UI, or vendor write; it makes an existing retry policy and an existing validation boundary total at their previously undecided edges.

## 22. Acceptance criteria (behavioral, for a future planner or reviewer)

A later implementation satisfies this intention when all of the following hold. Each names the ledger entry it serves.

1. A brief missing a required-to-ask item yields a clarification naming the item; an explicit skip yields a proposition recording the item as deferred, with no value (M2).
2. Every proposition version validates the provenance rule; a fixture with `inferred` on a consequential field is rejected (M1).
3. The preparation and revision agent's tool set contains only read tools; a recording fake Proposales client sees zero writes across all agent tests (M3).
4. Content search over a fixture catalog returns bounded, ranked candidates; a strong match becomes the default selection with alternatives retained; a human replacement is carried into the approved payload and into the create request (M4).
5. An agent revision with an unrelated instruction preserves human-set values (M4).
6. Approval rejects propositions with unresolved required-to-create items or consequential inferences, and accepts a corrected payload while recording the diff (M1, M5).
7. Execution of an approved proposal invokes the model zero times (a fake provider that fails the test on invocation) and sends exactly one create request equal to the mapped approved payload (M5).
8. Execution with a generation ID already present in Proposales returns the existing draft flagged recovered and issues no create; multiple matches yield a conflict (M6).
9. Every Proposales and provider failure surfaces as an `AppError` taxonomy code with structured details and no raw upstream body (M6).
10. The full workflow passes against a scripted fake model; budget exhaustion ends in clarification or failed (M7).
11. The Proposales draft result carries uuid, editor URL, and the newly-created/recovered flag, as plain JSON (M6).
12. All of the above run in `npm test` without network access or environment secrets; live evals and smoke tests are opt-in and skipped without their variables (M7).
13. A brief in one language against a fixture catalog localized in that language yields a proposition with that language and no clarification; a brief whose language is absent from the catalog, or ambiguous, yields a clarification naming language (M2).
14. Every agent run result carries provider, model, and token usage; switching provider or model in configuration changes those fields and nothing in the proposition contract (M7).
15. Approval of a proposition with no selected content block and no explicit human empty-draft confirmation is rejected; with the confirmation recorded as a human act it is accepted (M2, M5).
16. No create request ever carries `unit_value_*`, `package_split`, `currency`, or `tax_options`; the mapper has no path that emits them, and a proposition whose commercial notes state a price still maps to a request without price fields (M1, M5). A fixture proposition carrying a model-produced price value on a block is rejected by validation (M1).
17. Approval without the library-pricing acknowledgment is rejected with a validation error; with it, the approved proposal records the acknowledgment and the executed request is unchanged by it (M5).
18. After a successful create, and after a recovery hit, execution performs one get-proposal read and the result carries the Applied Pricing equal to the mapper applied to the fake's stored draft, with no arithmetic (a fixture whose stored totals are inconsistent with its unit values is reported verbatim, not reconciled) (M6).
19. When the read-back fails after a successful create, the result is still `created` with the editor URL and the Applied Pricing marked unavailable with a reason; no error is returned and no second create occurs (M6).
20. The proposition schema has no field that carries a block price or a proposal total; per-block library-pricing statements and commercial notes are the only price-related content, and a fixture attempting to place an amount on a block fails validation (M1).
21. An approval whose state carries a draft reference is refused with `conflict` carrying the existing uuid and editor URL; the fake Proposales client observes no create, no search, and no patch (M6).
22. A proposition whose selected block has no sourced quantity or optional flag maps to a request that omits those fields; a fixture with a model-sourced quantity or optional flag is rejected by validation (M1, M5).
23. Given a brief in one language and a proposal language derived as another, the proposition's title and narrative are in the proposal language (M2 scope: language handling), and a brief-stated currency different from the company's produces a warning and a note, with no currency field in the request (M1, M5).

## 23. Shaping changelog

**Round 0 (2026-09-05, shaper, grounded draft).** Resolutions made by the shaper from repository evidence, each open to owner override:

- **Generation ID scope.** Resolved as one ID per workflow (created at first prepare), stable across clarification, revisions, and approval, with a separate proposition version counter. Rationale: the ID exists for duplicate recovery of "this generation"; if it changed per revision, approving two revisions would create two drafts by design.
- **Deferred vs missing.** Resolved the apparent conflict between "the human can always defer" and contract 08 §6 ("missing entries block approval") by defining deferred-by-user as distinct from missing required-to-create; only the latter blocks approval. Membership of required-to-create is owner card 1.
- **Turn model.** Resolved that workflow state is caller-held and round-tripped, per contracts 02 §9 and 08 §9 and the no-database decision; consequence for duplicate protection stated in §5.2 and §13.
- **Proposal-history tools.** Excluded `search_proposals` and `get_proposal` as agent tools: no concrete MVP preparation use case was found; the recovery search is a service concern on the execution path.
- **Single create call.** Resolved that one `POST /v3/proposals` expresses the approved payload; the vendor schema accepts every field the MVP writes.
- **Metadata keys.** Resolved to flat top-level keys with a prefix, because only flat keys are established as filterable and `data` also feeds proposal variables.
- **Content search.** Resolved that "search" is application-owned retrieval plus matching, because the public API has no search parameter; ranking mechanism left to planning under card 3.
- **Pricing.** Surfaced as owner card 2 rather than resolved: the public API's lack of content prices contradicts the raw intention's assumption that prices can originate from Proposales content before creation.
- **Document location.** Written where the owner asked; discrepancy with contract 14 surfaced as card 6.
- **Budget-exhaustion error class.** Left to planning: the taxonomy has no dedicated code; the intention requires distinguishability only.

**Round 1 (2026-09-05, owner review of round 0 cards).** Status `DRAFT` → `COLLABORATING`.

- **Card 1 → (b).** Required-to-create is language, title, and at least one selected content block or an explicit human empty-draft confirmation. Folded into §8.1; acceptance criterion 15 added.
- **Card 2 → blocked on experiment P1.** The owner did not choose a pricing behavior; the decision is gated on a narrow live-API experiment (minimum supported price-override payload; whether Proposales derives tax-dependent unit values). Both resulting behaviors are defined in §9.2 so planning can proceed on either outcome; P1 is specified in the evidence doc §9 and listed in §20A. Card 2 reframed as an authorization card in §21; acceptance criterion 16 added in conditional form.
- **Card 3 → live retrieval, small catalog.** Full catalog retrieved live per run, no cache, no persistence in v1; the owner will consider persistence after v1. Folded into §10.2 and §18.
- **Card 4 → derive, then ask.** Language is derived from the brief and the catalog's localizations and asked about when ambiguous; it is a key product function, so no deployment default language is introduced. Folded into §8.1; acceptance criterion 13 added.
- **Card 5 → provider-pluggable, Anthropic and OpenAI as first candidates, none permanent.** The Vercel AI SDK's provider abstraction is the pluggability mechanism; provider and model are configuration; run results must expose provider, model, and token usage so results and cost can be compared. Folded into §12.2 and M7; acceptance criterion 14 added.
- **Card 6 → documentation root is `build_docs/`; the intention stays in `planing/`.** Recorded in §2.1; the resulting staleness of contract 14, the root README, and the guide §7 is a dedicated follow-up patch listed in §20A, not part of this intention.

**Round 2 (2026-09-05, owner-run price-override investigation).** Status `COLLABORATING` → `READY_FOR_RATIFICATION`.

- **Card 2 → (A), no price writes in v1.** The owner ran the investigation the P1 plan called for, on a wider matrix (evidence doc §8, superseding the P1 plan in §10). Findings: Proposales persists each documented unit value independently and derives no tax counterpart, even with a complete supplied VAT split; the only tax-consistent override is all four unit values plus a matching split; no public pre-creation endpoint exposes the VAT configuration needed to build that payload from one human amount. The owner relayed the conclusion "the evidence supports Option A"; the shaper's round 0 recommendation was the same. Folded into §9.2, §12.1, §18, fact 14 in §19, §20, §20A; acceptance criterion 16 rewritten unconditionally. Price overrides remain a possible follow-up intention with an explicitly tax-complete human input.
- **Evidence doc section numbers changed** in the owner's update (investigation is §8, AI layer is §9, P1 status is §10); references in this document updated accordingly.
- **Owner decisions ledger empty.** §21 now carries the ratification surface. `RATIFIED` is written only on the owner's explicit approval, recorded here with owner, date, and surface.

**Round 3 (2026-09-05, owner clarification before ratification).** Status stays `READY_FOR_RATIFICATION` with an updated surface; no scope change beyond the one promotion the owner requested.

- **Approval meaning made explicit.** New §3.1; invariants 16 and 17; Approved Proposal and Proposales Draft Result redefined and a new Applied Pricing concept added in §7; §5 diagram and stage table, §9.1, §9.2, §11.1, §11.3, §15.1, and the ratification surface (h) restated: v1 approval is structural and content approval plus authorization to create at library pricing, not monetary approval; the final monetary review is part of the Proposales editor handoff. The approval envelope must carry that acknowledgment as data and the server refuses approvals without it, so the distinction is checkable, not just documented.
- **Post-create read-back promoted to must-ship.** One `GET /v3/proposals/{uuid}` after create or recovery; the result reports totals, currency, tax options, and per-block unit values and VAT split exactly as Proposales stored them (fact 15). Promotion justified because the fields are documented response fields and were read back on every investigation draft, so no new API ambiguity is introduced. `series_uuid` and `status` remain "only if cheap" because the owner asked for no other scope change, though the same read makes them free. Acceptance criteria 17 to 20 added; M6 extended.
- **M5 checked: no contradiction.** M5 constrains model calls (zero) and the create request (exactly one, equal to the mapped approved payload). The read-back is a read, after the create, and changes neither. The earlier §11.1 wording "duplicate-recovery search only" implied a single read on the execution path; that was the intention's own over-narrowing, now corrected. Invariant 10 (same approved payload, same request) is untouched because the read-back consumes the create's `uuid`, not the payload.
- **"Approved Proposal" checked: narrowed, not contradicted.** It remains authoritative for everything it contains; it never contained prices, so no field changes meaning. What changes is the explicit statement that monetary authority is not exercised at approval. One contract nuance recorded for the owner: contract 08 §6 expects the review to show "every consequential field", and prices are a consequential category (08 §4). They are absent from the payload rather than model-supplied, the review shows their absence and source (library pricing), and the contract's own lifecycle places the human's review in the external system before the final consequential action. The shaper reads this as consistent with the contract, and lists it on the surface (h) so the owner ratifies that reading explicitly rather than inheriting it.

**Round 4 (2026-09-05, pre-ratification gap review).** Status stays `READY_FOR_RATIFICATION`; surface items (j), (k), (l) added.

- **Card 7 → terminal workflow, keyed on the Proposales uuid.** The owner asked why the proposal id is not used; it is. The create's uuid becomes a Draft Reference in the caller-held state, so a re-approval is recognized without any payload fingerprint and is refused with a conflict pointing at the existing draft. The generation ID search remains only the lost-response fallback. Patching the existing draft by uuid is deliberately excluded (§18): the public patch replaces the whole block list and can discard editor edits, and Proposales is the editing environment after handoff. New concept in §7, flow rewritten in §13, rule in §11.3, error row in §15.2, acceptance criterion 21.
- **Recipient duplicate risk accepted for v1** on the shaper's recommendation, recorded in §9.2 and placed on the surface (k) for explicit confirmation.
- **Five gaps closed as stated:** unsourced quantity and optional flag omitted so Proposales applies defaults, with "absence is not invention" added to §8.3 and the optional flag added to the consequential list; title and narrative in the proposal language (§9.2); currency mismatch as warning plus note (§9.2 warnings); no asserted approver identity (§11.3, §18). Acceptance criteria 22 and 23 added.
- **Mechanism note for inventory:** the installed AI SDK routes plain string model ids through the bundled Vercel AI Gateway by default; the provider boundary must select a provider explicitly so no run silently depends on a gateway key.

**Round 5 (2026-09-05, ratification).** Status `READY_FOR_RATIFICATION` → `RATIFIED`.

- **Owner:** David (repository owner).
- **Date:** 2026-09-05.
- **Surface presented and approved:** §21.1 as it stands after round 4: (1) the outcome statement, including that v1 approval is structural and content approval plus authorization to create at library pricing, not monetary approval; (2) the measurement ledger M1 to M7 verbatim (§17); (3) the scope ladder (§18); (4) consequential resolutions (a) through (l). The owner confirmed in the session with "this is confirmed", including item (k), the accepted inline-recipient duplicate risk, which had been called out for explicit confirmation.
- **Handoff:** the intention is the ratified root of the trace chain. Next gate is mechanism inventory, which the owner starts after bootstrapping the project build folder through the pipeline coordinator. Post-ratification amendments follow the decision-card path; a material semantic change re-opens this gate.

**Round 6 (2026-09-05, mechanism inventory round 1).** Status stays `RATIFIED`; no material semantic change, so the intention gate does not re-open. One owner decision card is outstanding (the ledger extension) and the mechanism-inventory exit gate holds until it is answered.

- **New lettered section §17A, "Mechanism contracts"**, placed between §17 and §18 so it sits beside the measurement ledger whose entries it registers. Nothing was renumbered; every existing citation stays true. §17A defines, contract-grade: shared value shapes (§17A.1); workflow identity, proposition version, and terminality (§17A.2); the caller-held state, its strictness, its origin-validated editor URL, and its size bound (§17A.3); structural provenance and the enumerated consequential leaves (§17A.4); absence / omission / default / unset as four distinct layers and the mapper construction that cannot emit an absent field (§17A.5); information items as two orthogonal policies plus a resolution state, with one approvability predicate (§17A.6); clarification question and answer binding (§17A.7); retrieval, the pure ranking function, the integer score scale, the total strength function and the total candidate order (§17A.8); the revision merge and human-set preservation (§17A.9); the approval acknowledgment literal and the total diff rule (§17A.10); the fully determined recovery search and the exact metadata keys (§17A.11); Applied Pricing, money, and "without arithmetic" as a closed pair of permitted and forbidden operations (§17A.12); the total error-precedence order and the total upstream taxonomy maps (§17A.13); the three run budgets and cost reporting on every result (§17A.14); explicit AI provider selection (§17A.15); text bounds, stated-price handling, and clocks (§17A.16).
- **Measurement ledger appended, M8–M18**, as a new §17.1 block inside §17. M1–M7 are untouched and unrestated. The appended entries are marked **pending owner ratification** and are presented as a decision card, because §17 is part of the surface the owner ratified in round 5.
- **Totality checks discharged** (all four the gate required): match-strength ordering (§17A.8, thresholds with enumerated adjacent boundary rows); information-class precedence — resolved as *no precedence exists*, the four labels being projections of two independent axes (§17A.6); provenance sources (§17A.4, three source policies, `inferred` unrepresentable on a consequential leaf); domain result states and error mapping (§17A.13, a fixed check order plus total upstream tables).
- **Internal inconsistencies resolved by contract, listed for owner ratification** (detail in the round-1 handoff): (i) §15.1's result-state table omits the `failed` state that §4, §15.2, M7, and criterion 10 all rely on — `failed` is a fifth domain result state; (ii) §15.2's "second execution detected within one turn" row has no reachable path in v1's single-call-site execution, so no criterion should be written for it; (iii) §8.3's derivation exception has no reachable target in v1 (criterion 20 forbids any price or total field on the proposition), so the `derived` variant is absent from the v1 schema and M1's derivation clause is vacuous, not weakened; (iv) §15.2 could be read as mapping a missing pricing acknowledgment to `approval_required`, but §11.3 and criterion 17 make it `validation_error`; `approval_required` is reserved for execution reached outside the approval entry point; (v) contract `06-data-contracts-and-validation.md` §6's "no arithmetic" companion clause about converting decimal package-split values does not fire in v1, because the split's money fields are integer cents (evidence §6, §8.1, §8.3) — reported as a candidate contract patch, not folded into this feature.
- **Vendor and repository facts established** went to the evidence doc, not here: evidence §9.1 records how `ai` 7.0.92 resolves a string model id and how the bundled gateway authenticates. §17A.15 cites it.
- **No scope change.** No new endpoint, capability, or Proposales call. The two additions to the shape of things the intention already required are the second proposition in the caller-held state (which makes §11.3's diff computable) and the AI configuration variables (which §12.2 already required as configuration).

**Round 7 (2026-09-05, owner ratification of the ledger extension).** Status stays `RATIFIED`. The mechanism-inventory exit gate is now open.

- **M8–M18 ratified, all eleven, none cut.** §17.1's "pending owner ratification" marker is replaced by the ratification record. M1–M18 are one ledger from this point; a criterion's trace cell may cite any entry, and every entry must be served by at least one criterion row or recorded as a planning gap.
- **New §21.2** records the ratification surface for this narrower act. §21.1 is left exactly as presented in round 5, because it is the record of that act rather than a running summary; editing it would falsify what the owner was shown.
- **Round 6's five contract-resolved inconsistencies were relayed and accepted** with the ratification (§21.2).
- **Owner question recorded, because the answer is load-bearing for planning:** the owner asked whether the extension concerned idempotency or the absent application database. Neither is its subject — the ledger declares what the build must demonstrate, not what it must contain. But three entries (M8, M14, M17) exist *because* there is no server-side memory: with no database, duplicate protection rests entirely on the caller-held Draft Reference and the recovery search, so both are held to a proof standard a database would not need (§5.2, §13, §17A.2, §17A.3, §17A.11).
- **No material semantic change**, so the intention gate does not re-open. The next artifact is the master plan (implementation-planner).
- **Carried to the follow-up register, not folded here:** the candidate patch to contract `06-data-contracts-and-validation.md` §6's Money row (round 6, item (v)). Its example directs an implementer to convert package-split values to minor units; the OpenAPI schema does type them as `number`, so the contract is accurate about the vendor's documentation and wrong about the values, which are integer cents at runtime (evidence §8.1). The only genuinely decimal field on `PackageSplit` is `vat`, a rate rather than money. A contract patch is its own change.

**Round 8 (2026-09-05, owner decision and ratification: multi-turn conversational continuity).** Status stays `RATIFIED`. Raised by implementation-planner round 2 as fold-back FB-2 after the owner, reading the phase plans, identified that the intention was silent on natural-language continuity between turns.

- **Owner:** David (repository owner). **Date:** 2026-09-05. **Approved:** the addition as proposed, together with the two planning cards it depends on (below).
- **What the addition is.** The caller round-trips a bounded **conversation context** alongside the workflow state, so the human can say "use the second one" and be understood. It is linguistic context, never authority: a reference becomes a fact only by resolving to a content identity already present in the run's retrieval record, and approval and execution never read it. **New §17A.17**, new §5.2 bullet, new §7 concept row, ledger **M19**.
- **Why it did not re-open the intention gate.** It is an addition, not a contradiction. No ratified text was changed in substance and nothing on the §21.1 or §21.2 surfaces moved; the planner checked it against §5.2, §8.2, §8.3, §11.2, §12.2, §16.2, §17A.3, §17A.4, §17A.8, §17A.9, §17A.13 and contracts 05, 06 §7, 08 §6–§10, 09 §1, 10 §6, 12. The owner ratified the added text itself, so the trace chain's root covers M19 exactly as it covers M1–M18.
- **Planning card 1 → A (company currency).** The company's currency is read from `GET /v3/companies` during preparation and revision, and used only to warn when a stated currency differs from it. Never written. **§12.1** operation list extended. Capture task for the coordinator: the evidence doc §2 row calling `GET /v3/companies` "not needed" is now stale; §8.1 already records the observed keys.
- **Planning card 2 → A (values stated in an instruction).** A consequential value the human states in the **current** revision instruction may be recorded with `human` provenance, carrying the turn id and a verbatim quote that the server checks; prior turns never resolve. **§8.3** `human` row extended; **§17A.4** gains the `ref` paragraph; **§17A.17** item 6 states the boundary. Without this, "keep that one but make the quantity 3" could not be honored by a revision at all.
- **No scope change.** No new endpoint beyond the company read the warning already required, no persistence (the context is caller-held and lost on reload by design, per §4 and §18), no authentication, no UI. Nothing was renumbered: §17A.17 is appended within §17A and M19 within §17.1.

**Round 9 (2026-09-05, owner decision: logging and redaction).** Status `RATIFIED` → `COLLABORATING`.

- **Card 1 → A.** The owner selected the projection's recommendation to record logging and redaction at the intention layer before phase 2 implements it. The coordinator added proposed §17A.18 and M20 and presented §21.3 for explicit ratification; option A approved the direction, not this proposed wording.
- **Why the gate re-opened.** This is a new safety mechanism with a measurement target, not a restatement of an already-ratified workflow rule. Phase 2 cannot be dispatched until the owner explicitly approves §21.3 and the header returns to `RATIFIED`.

**Round 10 (2026-09-05, owner ratification: logging and redaction).** Status `COLLABORATING` → `RATIFIED`.

- **Owner:** David (repository owner). **Approved:** §21.3 exactly as presented, by the explicit response "approved".
- **Ratified addition:** M20 and §17A.18. The owner approved centralized case-insensitive redaction of the eight listed key spellings; preserved `null` and JSON shapes; fail-closed handling of opaque/cyclic values; immutable caller fields; and owned JSON-line metadata. No workflow, data, integration, UI, persistence, or scope-ladder decision changed.

**Round 11 (2026-09-05, phase-3 projection owner decisions).** Status `RATIFIED` → `COLLABORATING`.

- **Projection card 1 → A.** A non-2xx response is classified by status before body parsing: a `429` or `5xx` remains retryable even with an unreadable body. Folded into §17A.13's new Transport precedence paragraph.
- **Projection card 2 → A.** An out-of-range Proposales content epoch fails the entire content read as `schema_mismatch`; it is neither dropped nor allowed to escape as a runtime date error. Folded into §17A.16's new External epoch bound paragraph.

**Round 12 (2026-09-05, owner ratification: phase-3 transport precedence and timestamp validation).** Status `COLLABORATING` → `RATIFIED`.

- **Ratified:** the owner approved both Option-A branches verbatim from the projection cards. §21.4 records the exact ratification surface; the new §17A.13 and §17A.16 paragraphs are binding for phase 3.
