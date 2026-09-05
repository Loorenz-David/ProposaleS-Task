---
plan: none — pre-planning gate (mechanism inventory precedes the master plan)
role: coordinator
round: 1
date: 2026-09-05
state: CONSUMED_PENDING
verdict: EXIT_GATE_HELD — one owner card outstanding
actor: Claude (Opus 5, mechanism-inventory doctrine)
project: initial_core_feature_proposales
feature: Proposal Preparation Backend
---

# Handoff — mechanism inventory round 1

## Summary

All five gate-check rows passed. The intention reads `RATIFIED`, round 5 records the human act (owner David, 2026-09-05, surface §21.1), the evidence doc carries §8 and §9, §23 has no round 6, the only lettered section was §20A, the README's master-plan row reads "not written", and `plans/` is empty.

Seventeen load-bearing mechanisms were inventoried and ranked by silent-failure risk. **All seventeen now carry a contract-grade definition**, written into the intention as one new lettered section **§17A** (between §17 and §18; nothing renumbered). Eleven invariants were appended to the measurement ledger as **M8–M18** in a new **§17.1** block inside §17, marked pending owner ratification.

Nothing on the ratification surface (§21.1 items (a)–(l)) moved. No scope change: no new endpoint, capability, or Proposales call. The intention's status therefore stays `RATIFIED` and the intention gate does not re-open.

**The mechanism-inventory exit gate is held by one thing only**: the ledger extension is a post-ratification amendment to a surface the owner ratified, so it is presented as a decision card and is not written as settled. Implementation-planner may start the moment that card is answered.

## ⚠ OWNER DECISIONS REQUIRED (1)

### Card 1 — Ratify the eleven new measurement objectives

**Question.** Ratify M8–M18 as additions to the measurement ledger, or cut some (name which)?

**Story.** Months from now a proposal goes out priced at a quantity of one that nobody chose — the brief never gave a number, and somewhere a blank quietly became a one. Or two identical drafts sit in Proposales because a retry made a fresh workflow id. Or every run's cost report names a router instead of the model you were comparing. Each of the eleven is one of those, turned into something a test must prove before the code ships. Nothing is added to what gets built; what changes is what the build is obliged to demonstrate.

**Branches.** Ratify all eleven — every mechanism below is a declared, traceable test target. · Ratify with cuts — the cut mechanisms get built with nothing obliging anyone to prove them. · Decline — planning proceeds on the original seven objectives and seventeen mechanisms carry no declared measurement.

**Recommendation.** Ratify all eleven: each one guards a failure that yields a wrong proposal with no error, and none of them adds scope or cost to the feature.

**On silence.** The gate holds. Planning does not start.

**Trace.** §17.1 (M8–M18), §17A, §21.1 item 2.

## 1. Inventory

Ranked by silent-failure risk — "if this is subtly wrong, does anything crash, or does the system quietly behave wrong forever?" Rank 1 is the highest risk. Contract status: **defined** · **defined-with-a-card** · **undefinable-without-the-owner**.

| Rank | Mechanism | Silent failure if subtly wrong | Contract | Status |
|---|---|---|---|---|
| 1 | Absence, omission, default, unset | A blank quantity or optional flag becomes a sourced `1` / `false`, or a JSON round-trip drops the key and the omission is indistinguishable from a decision. Every proposal is then subtly not what the human approved, forever, with no error anywhere. | §17A.5 (M9) | defined |
| 2 | Provenance and consequential fields | A provenance map keyed by path passes any consequential field that has **no entry at all** — the validator checks what is present, not what must be. Invented commercial facts ship validated. | §17A.4 (M10) | defined |
| 3 | Applied Pricing and money | One arithmetic operator anywhere in the read-back mapper turns "what Proposales applied" into "what we computed", and the reviewer's only sight of money becomes ours. `available: false` rendered as `0` is the same failure with a worse blast radius. | §17A.12 (M13) | defined |
| 4 | AI provider selection | A string model id routes through the bundled gateway; on Vercel it authenticates by platform OIDC with no configured secret, and every provider / model / cost figure the run reports is false while everything looks healthy. | §17A.15 (M16) | defined |
| 5 | Workflow identity and terminality | A regenerated Generation ID makes one workflow look like two and produces a second draft. Check order decides which code a terminal-and-malformed approval returns, so criterion 21 can pass on fixture luck. | §17A.2 (M8) | defined |
| 6 | Caller-held state validation | A non-strict schema strips a misspelled `draftReference`; a stripped Draft Reference re-enables a create. A typo becomes a duplicate draft. | §17A.3 (M17) | defined |
| 7 | Content matching and ranking | Ranking that leaks the vendor's list order drifts every recommendation with no symptom; a fixture catalog smaller than the cap makes "bounded" unfalsifiable; a model-set match strength makes the no-acceptable-match warning unfalsifiable. | §17A.8 (M12) | defined |
| 8 | Recovery search request shape | The documented `limit` default is **1**. At the default, "more than one proposal carries this Generation ID" is undetectable — the search returns one row and the conflict rule (§13, criterion 8) silently never fires. | §17A.11 (M14) | defined |
| 9 | Human-set value preservation | Preservation enforced by the prompt survives every review and fails in production. A second "human-edited" flag beside provenance is a source of truth that can disagree invisibly. | §17A.9 (M11) | defined |
| 10 | Error precedence and taxonomy mapping | Without a fixed check order, one input can legitimately produce two different codes; criteria then pass on fixture ordering. Untotalled upstream tables leak a raw vendor or provider body on the one path nobody enumerated. | §17A.13 | defined |
| 11 | Approval envelope and the prepared→approved diff | The diff has nothing to diff against: the server keeps nothing between turns, so without the prepared proposition in the state an implementer drops the record or diffs against nothing. A `boolean` acknowledgment lets `false` mean "not yet" to the caller and "present" to the parser. | §17A.10 | defined |
| 12 | Run budgets | An exhausted run that emits "what we have so far" is the fabricated proposition §4 forbids. A failed run that reports no token usage defeats the cost comparison it exists for. | §17A.14 (M15) | defined |
| 13 | Proposal metadata key shape | A non-string value or a nested key is not established as filterable, so recovery quietly stops working. A key without the prefix can collide with a company's proposal variables, which no public endpoint lets us enumerate. | §17A.11 (M14) | defined |
| 14 | Clarification answer binding | Treating "no answer sent" as a skip converts a caller's omission into a recorded human decision, and the item leaves the workflow marked as deliberately deferred. | §17A.7 (M18) | defined |
| 15 | Information classes and approvability | Read as a ranked enum, §8.1's four classes have no consistent precedence and an implementer invents one. Approvability then depends on the invented order. | §17A.6 | defined |
| 16 | Stated price expectations in free text | A pattern that extracts "12k" from prose is invention wearing a `brief` provenance label — the one failure mode M1 exists to prevent, arriving through the field designed to be harmless. | §17A.16 | defined |
| 17 | Timestamps and clocks | An inline `Date.now()` makes the metadata timestamp untestable; an epoch integer escaping the adapter puts unit interpretation in application code, where the millisecond scale is an observation, not a guarantee. | §17A.16 | defined |

No mechanism is **undefinable-without-the-owner**. No mechanism is **defined-with-a-card**: the single card is about ratifying the ledger, not about a missing definition.

### 1.1 One mechanism reconsidered rather than carded

The prompt's depth target 4 and §10.2 both leave the matching mechanism to planning ("lexical, model-assisted ranking, or both"), which reads as a genuine product fork between recall and reproducibility. It is not one. The two are reconcilable: **the model contributes the query strings** — synonyms and terms drawn from the brief, which are tool *inputs* — and the ranking function then runs deterministically over `(query, catalog, language)`. Recall improves, ordering and match strength stay application-owned and testable, and §5.1's "deterministic retrieval" is preserved. This is why rank 7 is `defined` rather than a card.

## 2. What was added to the intention

| Where | What | Renumbering |
|---|---|---|
| **§17.1** (new block inside §17) | Measurement-ledger appends **M8, M9, M10, M11, M12, M13, M14, M15, M16, M17, M18** — 11 entries, each naming its objective, the defect family it guards, and its §17A contract. Marked **pending owner ratification**. M1–M7 untouched and unrestated. | none |
| **§17A** (new lettered section, between §17 and §18) | 17 subsections: §17A.0 how it binds · .1 shared value shapes · .2 workflow identity · .3 caller-held state · .4 provenance · .5 absence/omission/default · .6 information items and approvability · .7 clarification binding · .8 retrieval, matching, ranking · .9 revision merge · .10 approval envelope and diff · .11 execution, recovery search, metadata · .12 Applied Pricing and money · .13 error precedence and taxonomy · .14 run budgets · .15 provider selection · .16 text bounds, stated prices, clocks | none |
| **§23 round 6** | Changelog entry: what was added, the four totality checks discharged, the five inconsistencies resolved, the facts routed to the evidence doc, and the explicit no-scope-change statement. | none |
| **evidence doc §9.1** (new subsection under §9) | Established from the installed package: `ai` 7.0.92 resolves a string model id through `globalThis.AI_SDK_DEFAULT_PROVIDER ?? gateway`, and `@ai-sdk/gateway` authenticates by `AI_GATEWAY_API_KEY` **or** a Vercel OIDC token. Includes what was *not* established (no network call was made). | none |

**Section placement rationale** (the prompt left this to my call): one consolidated lettered section rather than inline lettered subsections beside each deepened section. Reason — eleven of the seventeen mechanisms are built from four shared value shapes (§17A.1), and the error-precedence order (§17A.13) is a property of five sections at once. Scattered inline, those cross-cutting definitions would have to be duplicated or forward-referenced from five places, which is how a document set diverges. §17A sits immediately after §17 because it registers that ledger's new entries.

**Totality checks (§3.2 of the prompt) — all four discharged.**

| Ranked/ordered rule | Where it is now total |
|---|---|
| match-strength ordering (§10.2) | §17A.8 — integer 0–1000 score, two named thresholds plus a floor, half-open intervals, one criterion row per adjacent boundary pair, exclusion below the floor, and a total sort order with `variationId` as the final tie-break |
| information-class precedence (§8.1) | §17A.6 — **resolved as: no precedence exists.** The four labels are projections of two independent axes (ask policy, create policy) plus a resolution state. One approvability predicate replaces the implied ranking |
| provenance sources (§8.3) | §17A.4 — three source policies, total assignment over every leaf, `inferred` unrepresentable on a consequential leaf (union member absence, not a refinement) |
| domain result states and error mapping (§15) | §17A.13 — an 8-step binding check order, plus 12-row and 7-row total upstream tables for Proposales and the provider |

## 3. Internal inconsistencies resolved unilaterally by contract

Listed separately and explicitly, per the skill: choosing which side of a contradiction wins carries product consequences even when no sentence changes. **Five items. None changes what gets built; each changes what an implementer would otherwise have to guess.**

1. **`failed` is a fifth domain result state.** §15.1's table lists four (`clarification`, `proposition`, `created`, `recovered`), while §4, §15.2, M7, and acceptance criterion 10 all rely on a `failed` outcome. Resolved: `failed` is a domain result state (§17A.13). This is a correction of an omission four sections already depend on. **Consequence if the owner prefers otherwise:** criterion 10 and M7 become unimplementable as written.
2. **§15.2's "second execution detected within one turn" has no reachable path in v1.** Execution has one call site, no loop, and no auto-retry, so a second execution inside one turn is structurally impossible rather than guarded. Resolved: the taxonomy assignment is preserved and **no criterion is to be written for it** (§17A.13). **Consequence:** without this, a planner writes a criterion whose test must first invent the path it guards — a row that cannot fail.
3. **§8.3's derivation exception has no reachable target in v1**, so the `derived` variant is absent from the v1 schema. Criterion 20 forbids the proposition from carrying any block price or proposal total, and invariant 17 forbids arithmetic — so no consequential leaf exists that a "mechanical derivation naming its inputs" could target. **M1's text is unchanged and stays literally true**; its third disjunct is vacuous in v1, not weakened. Adding the variant later is a schema change with its own criteria (§17A.4). **Consequence:** the alternative is dead schema surface plus an undefined "what shape is a derivation" question that a reviewer would have to adjudicate.
4. **A missing pricing acknowledgment is `validation_error`, not `approval_required`.** §15.2 maps "execution attempted without a valid approval envelope" to `approval_required`, which reads as covering it; §11.3 ("exactly as it refuses one with unresolved required-to-create items") and criterion 17 ("rejected with a validation error") say otherwise. Resolved for `validation_error`; `approval_required` is reserved for a consequential mutation reached outside the approval entry point (contract 10 §5). §17A.13 fixes both in one order. **Consequence:** the two rows are easy to conflate, and conflating them makes criterion 17 fail against a correct implementation.
5. **Contract `06-data-contracts-and-validation.md` §6's decimal-conversion clause does not fire in v1** — see finding 6.1 below. Resolved by observing that every Applied Pricing money field Proposales returns is integer cents, so **no rounding rule exists anywhere in this feature's mappers** (§17A.12). **Consequence:** the alternative is a rounding rule written to satisfy a contract example, i.e. arithmetic on a path invariant 17 forbids.

### 3.1 Two resolutions that are additive defaults rather than contradictions

Recorded here because they are choices, with their reopening conditions, not because they conflict with anything.

- **Proposal metadata is exactly three keys** (`proposal_copilot_source`, `proposal_copilot_generation_id`, `proposal_copilot_created_at`), all string-valued. §14 marks the brief summary "only if the owner wants it" and the model name "not by default"; the resolved default for both is **not written**, on data minimization — a brief summary would place model-authored text in a vendor system. Both are additive later without changing any existing key's meaning. A metadata **version key** was considered and rejected: a version key earns its place when an existing key's meaning can change, and a UUID's cannot.
- **The prefix `proposal_copilot_` is improbable, not verified.** `data` also feeds a company's proposal variables and no public endpoint enumerates them, so collision is prevented by prefix choice and stated in the integration README — never detected at runtime.

## 4. Exit-gate verdict

**Every silent-failure mechanism now has a contract-grade definition.** Seventeen inventoried, seventeen defined; zero undefinable-without-the-owner; the four ranked rules the prompt named are total with decidable ties; every appended ledger entry names an observable outcome and a defect family.

**Verdict: the gate is held by owner card 1 alone.**

- No re-ratification of the intention is required. Nothing on §21.1 (a)–(l) moved, no scope changed, and the status stays `RATIFIED`.
- **Implementation-planner may start as soon as card 1 is answered.** If the owner cuts entries, the planner drops their trace targets and the corresponding §17A contracts become undeclared — record that as a planning gap rather than deleting the contract.
- Two things the planner must carry into the master plan's shared skeleton, because they are not phase-local:
  - **Environment topology (§17A.15):** `AI_PROVIDER`, `AI_MODEL`, and the provider-selected vendor key are validated at env module load with no defaults, and the test setup supplies non-secret placeholders so `npm test` stays offline (criterion 12). Installing the first `@ai-sdk/<vendor>` package remains a planning decision (§12.2).
  - **Fixture sizing (§17A.8):** the test catalog must be **larger than the candidate cap**, or the bound is unfalsifiable. The real catalog is very small (§20), so a realistically-sized fixture would never exercise it.
- Named mutations §17A hands the planner directly, each already tied to the criterion it protects: add `inferred` to the consequential source union (§17A.4); change the quantity spread helper to emit a default (§17A.5); replace the mapped total with a computed sum (§17A.12); widen the AI signature to accept a string model id (§17A.15).
- **Phase sizing note:** §17A's mechanisms cluster into roughly five contract groups (shared shapes + state; proposition, provenance, absence; content and revision; approval and execution; provider, budgets, errors). At the charter's ≤8 criteria per phase, expect more phases than the mechanism count suggests — §17A.13's check order alone is 8 enumerated rows.

## 5. Write perimeter

Full perimeter, for diffing against the tree. Verified with `git status --porcelain` and `git diff --stat` at session end.

| Path | Change |
|---|---|
| `build_docs/under_constroction/initial_core_feature_proposales/planing/proposal-preparation-backend-intention.md` | modified — §17.1 appended inside §17, new §17A between §17 and §18, §23 round 6 appended. No existing line altered; no section renumbered |
| `build_docs/under_constroction/initial_core_feature_proposales/planing/proposales-source-evidence.md` | modified — new §9.1 inserted between §9 and §10. No existing line altered |
| `build_docs/under_constroction/initial_core_feature_proposales/handoffs/coordinator/mechanism-inventory-round-1.coordinator.md` | created — this file |

`git diff --stat` reports **479 insertions, 0 deletions** across the two modified documents.

**No other writes.** No code, no `src/`, no `package.json`, no packages installed, no master plan, no phase plan, no commit, no tool-recorded state. Archgraph is not present in this repository and was skipped. The three untracked paths that `git status` also lists (`README.md`, `prompts/coordinator/`, `prompts/maintenance/`) were already untracked at session start and were not touched.

## 6. Contracts found stale against reality

A contract patch is its own change and is not folded into this feature.

### 6.1 `06-data-contracts-and-validation.md` §6, Money row — inaccurate example

The row reads: *"Fields the external API documents as decimal `number` (for example package split values) are converted to minor units inside the integration mapper, with the rounding rule stated in a comment."*

**Evidence that the parenthetical is wrong.** Evidence doc §6 records that block `unit_value_*` are cents and proposal `value_with_tax` / `value_without_tax` are integer cents. Evidence doc §8.1's control read-back shows the library package split as `{ vat: 0, value_without_tax: 10000, value_with_tax: 10000 }` — the same integer-cent scale as the block unit values, not decimals. Evidence doc §8.3 records that supplied split values of `1200000` and `1500000` were persisted and read back verbatim. The one genuinely decimal field on `PackageSplit` is `vat`, which is a **rate, not money**, and is not converted by anything.

**Severity: low, and it is an example, not a rule.** The rule ("decimals are converted in the mapper with a stated rounding rule") stays correct in general; the example is the only inaccurate part, and it is the kind of inaccuracy that invites an implementer to write a rounding rule on a path where invariant 17 forbids arithmetic. **Suggested patch:** replace the parenthetical with a field that is actually decimal, or drop it. **Recommended row for the follow-up register**, alongside the documentation-root patch — not blocking.

### 6.2 Not stale, recorded so it is not re-litigated

`08-agent-architecture.md` §6's `PreparedAction.provenance: Record<fieldPath, {...}>` is a side-map keyed by path; §17A.4 makes provenance structural instead. This is a **specialization the contract invites**, not a conflict: §6 calls these shapes "serialization contracts, not tables", §2.3 of the intention already maps this feature's vocabulary onto them, and §17A.4 produces the flat `Record`-shaped projection for display. The contract's own §6 rule — that a `PreparedAction` carrying an assumption on a consequential path must be rejected — is satisfied more strongly by a structural encoding than by a side-map, because the side-map's failure mode is a consequential field with no entry at all. No patch proposed.
