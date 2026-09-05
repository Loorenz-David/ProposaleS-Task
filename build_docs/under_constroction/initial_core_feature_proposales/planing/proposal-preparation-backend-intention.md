# Intention: Proposal Preparation Backend

| | |
|---|---|
| **Status** | `RATIFIED` (2026-09-05, by the owner, David, on the round 4 ratification surface in §21.1; recorded in §23. Material semantic changes re-open the gate to `COLLABORATING`; smaller amendments follow the mechanism-inventory delta path.) |
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
| `13-decision-checklist.md` | questions 13–24 |
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
| `human` | supplied through a clarification answer or a manual edit | yes |
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
- Operations this feature needs, named by domain purpose and mapped to the public endpoints in the evidence doc: list/search content, get content by variation id, create proposal draft, search proposals by generation ID, and (for result enrichment, if the planner chooses) get proposal by uuid.
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
