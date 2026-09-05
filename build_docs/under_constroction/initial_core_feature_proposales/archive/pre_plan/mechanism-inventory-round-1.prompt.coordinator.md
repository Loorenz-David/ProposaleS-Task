---
plan: none — pre-planning gate (mechanism inventory precedes the master plan)
role: coordinator
round: 1
date: 2026-09-05
project: initial_core_feature_proposales
feature: Proposal Preparation Backend
---

# Session prompt — mechanism inventory against the ratified intention

You are running the **mechanism-inventory** gate for the project
`initial_core_feature_proposales` (feature: Proposal Preparation Backend) in the
repository `/Users/davidloorenz/Desktop/Developer/Proposales`.

Invoke the `mechanism-inventory` skill and follow its doctrine for this session. Also
invoke the repository's `architecture-context` skill and follow the repository's
Architecture Context policy — this session makes material decisions about mechanisms,
so contract routing applies.

Where this prompt differs from the skill doctrine or from the intention, **the doctrine
and the intention win**; this prompt only frames the session, seeds depth targets, and
fixes where your output goes.

---

## 1. Gate check (run this first; stop and report if any row fails)

| # | Check | Where | Passes when |
|---|---|---|---|
| 1 | Intention status header | `build_docs/under_constroction/initial_core_feature_proposales/planing/proposal-preparation-backend-intention.md`, status table at the top | reads `RATIFIED` |
| 2 | Ratification is a recorded human act | same file, §23, round 5 entry | names the owner (David), the date, and the ratification surface (§21.1) it approved |
| 3 | Companion evidence doc present | `…/planing/proposales-source-evidence.md` | exists and its §8 (price-override investigation) and §9 (AI layer state) are present |
| 4 | The work is genuinely outstanding | same intention file | §23 has **no round 6 entry**, and the document carries **no mechanism-contract sections** (the only lettered section today is §20A) |
| 5 | Planning has not started | the project `README.md` "Artifacts" table, and the `plans/` table | the README's master-plan row reads "not written"; `plans/` holds no phase plan (the project root's `README.md` is the folder index, not a master plan — it says so in its own first paragraph) |

If check 4 or 5 already fails because the work was done, **stop** — a later session has
already run this gate; report that and do nothing else.

If check 1 fails, **stop and report**. You deepen a ratified intention; you never
substitute for its gate.

---

## 2. Read order

Read these, in this order, before forming any opinion about a mechanism. Read sections,
not whole files, where a section is named.

1. `/Users/davidloorenz/agent-skills/pipeline-charter.md` — the artifact map, the
   implementation-folder layout, the intention gate, the decision-card format, the
   trace chain, the owner layer, and standing rules 5 and 6 (which are the reason this
   session exists).
2. `/Users/davidloorenz/agent-skills/mechanism-inventory.md` — your procedure and exit
   gate.
3. The intention (path above), in full. Pay particular attention to §2 (grounding and
   applicable contracts), §4, §5.2, §6, §7, §8.3, §9.2, §10.2, §11.2, §11.3, §12,
   §13, §14, §15, §16.3, §17 (measurement ledger — the root of the trace chain), §18
   (scope ladder — mechanisms outside it are out of scope), §20 (not-yet-established),
   §20A, §21.1 (the ratified surface — you may not quietly move anything on it), and
   §23 rounds 0–5.
4. `…/planing/proposales-source-evidence.md` — the vendor and repository facts the
   intention stands on. §3 (content), §4 (creation), §5 (search and metadata), §6
   (proposal entity), §7 (not established), §8 (price-override investigation, incl.
   §8.5), §9 (AI layer state).
5. `architectural_contracts/01-implementation-contract-guide.md` — routing; then the
   contracts it routes you to, at minimum:
   - `04-server-architecture.md` §8 (idempotency) and §9 (deterministic mutations);
   - `06-data-contracts-and-validation.md` — all of it, §6 (intentional handling of
     specific value kinds, incl. money) and §7 (domain vs external representation)
     especially;
   - `07-integrations.md` — client boundary, typed responses, error translation,
     retries/timeouts/budgets, and §8 (the AI provider is an integration);
   - `08-agent-architecture.md` — tool contract, what the model may do autonomously,
     clarification, §6 (HITL lifecycle, normative), provider independence, runtime
     constraints.

Do **not** read implementation files to learn how something should be done — none
exist for this feature, and the contracts are the pattern authority.

---

## 3. What this session must produce

Follow the skill's procedure (inventory → rank by silent-failure risk → demand a
contract per risky mechanism → check ranked rules are total → write the delta). Two
reminders that this project makes concrete:

- **Rank by silent-failure risk, not by apparent complexity.** The mechanisms below
  look like details. That is exactly how they escape definition.
- **No adjectives for mechanisms** (charter rule 5). "Stable", "bounded", "ranked",
  "matching", "without arithmetic" are not specifications until you have written the
  per-type, per-field rule.

### 3.1 Depth targets (seeded from the intention's own silent-failure surface)

Non-exhaustive — the inventory is yours to complete, and a mechanism absent from this
table is not thereby exempt. Each row names where the intention already speaks, and the
question a contract must answer.

| # | Mechanism | Intention home | The silent-failure question |
|---|---|---|---|
| 1 | Generation ID and Draft Reference identity | §5.2, §7, §13 | What generates the ID, in what form, at exactly which turn; how it survives caller round-trips; what makes two states "the same workflow"; what a tampered or stale state is allowed to do; when the Draft Reference becomes present and what "terminal" means mechanically |
| 2 | Provenance rule and consequential-field validation | §8.3 | Which exact fields are consequential; how provenance is attached and to what granularity; what a "mechanical derivation naming its inputs" is as a checkable shape; how the schema (not the prompt) rejects `inferred` on a consequential path |
| 3 | "Absence is not invention" — omission mapping | §8.3, §9.2 | How an unsourced quantity or optional flag is represented in the proposition, and how the mapper is *constructed* so it cannot emit the field; the difference between "default", "unset", and "absent" at every layer |
| 4 | Content matching and ranking | §10.2 | The matching mechanism and its inputs; what weak/possible/strong mean as a decidable rule over the catalog; how "bounded" is bounded (count, ordering, tie-breaking); ranking determinism when the model participates |
| 5 | Human-set value preservation on revision | §11.2 | What marks a value "human-set", where that mark lives, how it survives serialization and a new proposition version, and what a revision instruction must contain to be allowed to overwrite it |
| 6 | Approval envelope acknowledgment | §11.3, §3.1 | The representation of the library-pricing acknowledgment as data; how the server refuses an approval lacking it; how the diff against the prepared version is computed and what counts as a difference |
| 7 | Applied Pricing mapping without arithmetic, and money representation | §7, §12.1, §17 M6; contract `06-data-contracts-and-validation.md` §6 | Integer cents in, what out; what "without arithmetic" forbids exactly (no rounding, no summing, no unit conversion, no currency inference); how an internally inconsistent vendor total is reported verbatim; how "unavailable, with reason" is represented |
| 8 | Proposal metadata key shape | §14 | The exact key names and prefix, their value types, flatness guarantee, and the collision rule against Proposales proposal variables; which keys the recovery search filters on |
| 9 | Error translation | §15.2 | The mapping from every Proposales and provider failure to a taxonomy code; what may and may not cross the boundary (the vendor message is documented user-safe, the provider message is not); how the budget-exhaustion case is made distinguishable |
| 10 | Caller-held state validation | §5.2 | The state's serializable contract, what is re-validated on every turn, and what happens on a state that parses but is stale |
| 11 | Run budgets | §4, §12.2, §17 M7 | Wall-time, tool-call, and token budgets: their units, where they are configured, how exhaustion is detected mid-run, and how it ends in `clarification` or `failed` rather than a partial proposition |
| 12 | AI provider selection | §12.2; §23 round 4 "mechanism note" | The installed AI SDK routes plain string model ids through the bundled Vercel AI Gateway by default. The provider boundary must select a provider **explicitly**, so no run silently depends on a gateway key. Define what "explicitly" is as code shape and as configuration, and what makes the absence of a provider fail loudly |

### 3.2 Totality check

Every ranked or ordered rule in the intention must be a **complete order with decidable
ties** before a planner can build enumerated criteria from it (charter rule 2). At
minimum: the match-strength ordering (§10.2), the information-class precedence
(required-to-ask vs required-to-create vs optional vs deferred-by-user, §8.1), the
provenance sources (§8.3), and the domain result states and error mapping (§15).

---

## 4. Where the delta goes

- **Into the intention itself**, at
  `build_docs/under_constroction/initial_core_feature_proposales/planing/proposal-preparation-backend-intention.md`.
- **Lettered sections only. Never renumber.** Other artifacts and this prompt cite the
  existing numbers; §20A is the precedent. Add mechanism contracts as lettered sections
  beside the section they deepen (for example a mechanisms section §7A, or inline
  lettered subsections such as §8.3A), or as one new lettered mechanisms section — your
  call, stated in the handoff.
- **Register each mechanism invariant in the measurement ledger (§17)** by *appending*
  IDs (`M8`, `M9`, …). Appending does not renumber M1–M7 and does not restate them.
  Each appended ledger entry is a planner's trace target.
- **A changelog entry in §23 as round 6**, naming what you added and what you resolved.
- **The measurement ledger and §21.1 are part of what the owner ratified.** An appended
  ledger entry, or any change to a resolution on the ratification surface, is a
  post-ratification amendment: present it as a **decision card**, do not write it as
  settled. If a delta amounts to a **material semantic change**, set the status header
  back to `COLLABORATING`, say so loudly, and hand off for re-ratification.
- Vendor or repository facts you establish belong in the **evidence doc**, not the
  intention. Do not create a third document for them.
- Do not write a master plan, phase plans, or any code. Do not install packages. Do not
  commit.

## 5. Where the handoff goes

Write one handoff file to
`build_docs/under_constroction/initial_core_feature_proposales/handoffs/coordinator/`,
named `mechanism-inventory-round-1.coordinator.md`, with the charter's row-schema
frontmatter: `plan`, `role`, `round`, `date`, plus `state`/`verdict` and `actor`.

The handoff carries, for the coordinator:

1. The **inventory table**: mechanism / silent-failure risk rank / contract status
   (defined, defined-with-a-card, undefinable-without-the-owner).
2. What you added to the intention, by section, and which ledger IDs you appended.
3. Internal inconsistencies you resolved unilaterally by contract — listed separately
   and explicitly for owner ratification, because choosing which side of a
   contradiction wins carries product consequences even when no sentence changes.
4. The **exit-gate verdict**: whether every silent-failure mechanism now has a
   contract-grade definition, and therefore whether implementation-planner may start.
5. Your **full write perimeter** — every document you touched, plus any code or
   tool-recorded state (there should be none). The coordinator diffs this against the
   tree; an undeclared write is a finding.
6. Any contract you found stale against reality, with the evidence — a contract patch
   is its own change, never folded into this feature.

Owner decision cards go in **one** dedicated section headed
`⚠ OWNER DECISIONS REQUIRED (n)`, placed immediately after the handoff's opening
summary — never embedded inside a finding or an inventory row. Each card follows the
charter format: **Question → Story → Branches → Recommendation → On silence → Trace**,
under ~120 words, story first, no artifact citations inside the story. If there are
zero cards, say so in one line. Cards are the only owner-facing prose in the handoff;
everything else stays technical.

Archgraph is not present in this repository — skip that protocol silently.

## 6. Final chat message (the owner layer)

Your last message in the session is written for the owner, who has not read the
intention. Fixed shape, in order:

**What I did → What I found and what it means for you → What happens next → What needs
you** (decision cards relayed **verbatim**, or one line: "nothing needs you").

One pointer line names the handoff file. No section numbers, no `file:line`, no
artifact prose in this layer; every term of art gets a plain-word gloss on first use or
is dropped. Aim under ~300 words unless cards are pending.
