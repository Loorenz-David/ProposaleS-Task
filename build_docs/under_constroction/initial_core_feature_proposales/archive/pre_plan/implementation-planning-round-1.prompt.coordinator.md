---
plan: none — this session authors the master plan and the phase plans
role: coordinator
round: 1
date: 2026-09-05
project: initial_core_feature_proposales
feature: Proposal Preparation Backend
---

# Session prompt — implementation planning against the ratified intention

You are the **implementation planner** for the project `initial_core_feature_proposales`
(feature: Proposal Preparation Backend) in the repository
`/Users/davidloorenz/Desktop/Developer/Proposales`.

Invoke the `implementation-planner` skill and follow its doctrine for this session. Also
invoke the repository's `architecture-context` skill and follow the repository's
Architecture Context policy — you are making material design decisions, so contract
routing applies, and the master plan owes a contract-resolution section.

Where this prompt differs from the skill doctrine or from the intention, **the doctrine
and the intention win**; this prompt frames the session, fixes where output goes, and
carries forward what the mechanism-inventory gate handed you.

---

## 1. Gate check (run this first; stop and report if any row fails)

Both preconditions in the planner doctrine must hold: a RATIFIED intention **and** a
passed mechanism inventory.

| # | Check | Where | Passes when |
|---|---|---|---|
| 1 | Intention status header | `…/planing/proposal-preparation-backend-intention.md`, status table at the top | reads `RATIFIED` |
| 2 | Mechanism inventory has run | same file | §17A exists with subsections §17A.0 through §17A.16 |
| 3 | The ledger the criteria will trace to is ratified | same file, §17.1 heading | reads `RATIFIED`, not "pending owner ratification". **This is the row that matters most** — no criterion may trace to a ledger entry the owner never ratified |
| 4 | The ratification is recorded as a human act | same file, §23 round 7, and §21.2 | round 7 records the owner (David), the date, and that all eleven of M8–M18 were ratified with none cut |
| 5 | The work is genuinely outstanding | project `README.md` "Artifacts" table and `plans/` | the master-plan row reads "not written"; `plans/` holds no phase plan |

If row 3 or 4 fails, **stop and report** — route back to the coordinator, not around it.
If row 5 already fails because the plans exist, **stop**; a later session has done this.

---

## 2. Read order

1. `/Users/davidloorenz/agent-skills/pipeline-charter.md` — the artifact map, the
   implementation-folder layout, **phase sizing (≤8 criteria per phase — this is the
   cheapest lever in the pipeline and it binds you)**, the phase manifest's five
   properties, the trace chain, the review protocol, the test-evidence scopes L1–L4,
   and the standing quality rules.
2. `/Users/davidloorenz/agent-skills/implementation-planner.md` — master plan contents,
   phase plan contents, criteria discipline, exit.
3. The intention, in full, at
   `build_docs/under_constroction/initial_core_feature_proposales/planing/proposal-preparation-backend-intention.md`.
   **§17A is the section this session exists to consume** — seventeen mechanism
   contracts, already contract-grade. Also: §17 + §17.1 (the full ledger, M1–M18, your
   trace targets), §16.3 (testing intent by layer), §18 (scope ladder — the fence),
   §22 (23 behavioral acceptance criteria the intention already wrote), §20 (not yet
   established — anything here needs a capture task, not a criterion), §23 rounds 6–7.
4. `…/planing/proposales-source-evidence.md` — every external fact a criterion may
   rely on. §9.1 covers the AI SDK's model-id resolution.
5. `…/archive/pre_plan/mechanism-inventory-round-1.coordinator.md` — the inventory
   report. Read §4 (exit-gate verdict) especially: it hands you named mutations, two
   master-plan obligations, and a phase-sizing observation. It is a **consumed** report,
   archived; read it as context, not as a live directive.
6. The project `README.md` — folder-table mapping and the follow-up register.
7. `architectural_contracts/01-implementation-contract-guide.md`, then the contracts it
   routes you to. The intention §2.2 lists the twelve it applied; run the selection
   protocol yourself and emit selected / added / excluded with reasons (planner doctrine
   item 5). Do not inherit §2.2's list without re-deriving it.

The repository has **no feature code yet** — no `src/lib/`, no adapter, no agent. There
is nothing to read for "how we do it here" beyond the contracts, and the contracts are
the pattern authority. Do not invent a precedent from the scaffolding.

---

## 3. What the inventory gate hands you (do not re-derive)

Carry these into the master plan's shared skeleton; they are project-wide, not
phase-local. Each is stated in §17A — cite it, never restate it.

| Item | Source | Why it belongs in the master plan |
|---|---|---|
| Environment topology: `AI_PROVIDER`, `AI_MODEL`, and the provider-selected vendor key, validated at env-module load with **no defaults**; test setup supplies non-secret placeholders so `npm test` stays offline | §17A.15; criterion 12 | crosses every phase that touches the agent |
| Fixture sizing: the test catalog must be **larger than the candidate cap**, or the bound is unfalsifiable. The real catalog is very small (§20), so a realistic fixture would never exercise it | §17A.8; M12 | a naming/fixture rule parallel sessions must not diverge on |
| Four named mutations already tied to the criteria they protect: add `inferred` to the consequential source union (§17A.4); make the quantity helper emit a default (§17A.5); replace the mapped total with a computed sum (§17A.12); widen the AI signature to accept a string model id (§17A.15) | inventory §4 | seeds the phases that own those seams; enumerate the rest per charter rules 11–12 |
| `failed` is a **fifth** domain result state; §15.1's table lists four | §17A.13; §23 round 6 (i) | the naming registry fixes the result-state enum once |
| §15.2's "second execution detected within one turn" has **no reachable path** in v1 — **write no criterion for it** | §23 round 6 (ii) | a criterion here would be a row that cannot fail |
| §8.3's `derived` provenance variant is **absent from the v1 schema**; M1's derivation clause is vacuous in v1, not weakened | §23 round 6 (iii) | prevents dead schema surface and an undefined "what shape is a derivation" |
| A missing pricing acknowledgment is `validation_error`, not `approval_required` | §23 round 6 (iv); §17A.13 | the two are easy to conflate and criterion 17 depends on it |
| No rounding rule exists anywhere in this feature's mappers — every Applied Pricing money field is integer cents | §17A.12; §23 round 6 (v) | arithmetic on that path is forbidden by invariant 17 |

**Phase-sizing observation from the inventory, worth weighing but not binding:** the
seventeen mechanisms cluster into roughly five contract groups (shared shapes + state ·
proposition, provenance, absence · content and revision · approval and execution ·
provider, budgets, errors). At ≤8 criteria per phase, expect **more** phases than that
clustering suggests — §17A.13's check order alone is eight enumerated rows. Size by
criteria count, not by cluster count.

---

## 4. Criteria discipline — the parts this project will strain

Read the doctrine's full list. These four are where this feature is most likely to
produce a criterion that looks fine and cannot fail:

- **Every row carries a trace cell** citing a ledger ID (M1–M18) or a §17A contract.
  Check the other direction too: **a ledger entry no phase serves is a planning gap you
  surface**, not padding you invent. There are eighteen entries; say which phase serves
  each.
- **Guards ship with proof they can fail** (charter rule 15 — the most expensive family
  in the lineage). This feature is dense with absence claims and safety guards: "no
  mapper path emits `unit_value_*`", "the tool set contains only read tools", "zero
  model calls on the execution path", "`inferred` is unrepresentable". *Measuring an
  absence proves the absence; it does not prove the instrument could ever observe the
  presence.* Every such row names the planted defect that must redden it.
- **Each row's fixture makes its own predicate the only reason the outcome holds**
  (charter rule 2's companion). A fixture satisfying two independent sufficient causes
  cannot fail when one breaks.
- **External facts must already be in the evidence doc**, or the plan carries an
  explicit capture task. §20 lists six things not established — a criterion resting on
  any of them is satisfiable only circularly, by a test that supplies its own facts.

The intention's §22 already states 23 behavioral acceptance criteria. They are the
product-level obligations, not your phase criteria: distribute them, sharpen them into
addressable rows with exact expected outcomes, and say which phase owns each. Do not
restate them as prose.

---

## 5. Where the output goes

- **Master plan** at the project root:
  `build_docs/under_constroction/initial_core_feature_proposales/master-plan.md`.
  It absorbs or links the existing `README.md` (the folder-table index and the
  follow-up register) — say which you did. Keep the register's three rows alive either
  way; two are open and one was raised by the inventory.
- **Phase plans** in `plans/`, one file per phase, named so the phase number sorts.
- **Tracker** in the master plan, one row per phase, all `NOT_STARTED`.
- **Your handoff** at `handoffs/coordinator/implementation-planning-round-1.coordinator.md`,
  with row-schema frontmatter (`plan`, `role`, `round`, `date`, `state`/`verdict`,
  `actor`), declaring your **full write perimeter** and carrying any owner decision
  cards in one `⚠ OWNER DECISIONS REQUIRED (n)` section immediately after the opening
  summary — charter format, verbatim-relayable, under ~120 words each. Zero cards: say
  so in one line.

**Do not**: write code, install packages, create `src/`, or commit. Do not amend the
intention — a semantic gap you find is routed to the coordinator as a fold-back, and a
material one re-opens the intention gate. Archgraph is not present here; skip it
silently.

**Sequencing note the owner has already accepted:** the follow-up register's item 1
(the documentation-root patch) is a separate change and is **not** a phase of this
feature. Do not absorb it.

## 6. Final chat message (the owner layer)

**What I did → What I found and what it means for you → What happens next → What needs
you** (decision cards verbatim, or one line: "nothing needs you"). One pointer line
names the handoff. No section numbers or file paths in that layer; plain product words;
under ~300 words unless cards are pending.
