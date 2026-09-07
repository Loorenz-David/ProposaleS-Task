---
plan: plans/phase-01-baseline-and-visual-foundation.md
role: reviewer
round: 1
date: 2026-09-06
verdict: CHANGES_REQUESTED
actor: Claude Opus 5 (reviewer, per master plan §3 substitution)
---

# Handoff — phase 01 review, round 1

## Verdict

`CHANGES_REQUESTED` — two blocking findings, six should-fix, six notes.

## Opening

The foundation this phase was asked to build is there and it is good work. The colour, type,
spacing, corner and motion values were transcribed from the design faithfully, every accessibility
correction the design demands was applied or deliberately deferred with a reason, the broken test
runner is genuinely fixed, and the documents that described a deleted foundation now describe the
real one. What is not finished is the *proof*: three of the automatic guards this phase ships
cannot actually detect the thing they were written to forbid — I planted the forbidden thing five
different ways and every guard stayed green — and one contract sentence was rewritten in a way that
quietly loosens a rule the phase was told not to touch. Two documents also became untrue as a side
effect of this phase's own work and were missed by the closing review. None of this is a rebuild;
it is one focused fix round on the guards and three document lines.

## ⚠ OWNER DECISIONS REQUIRED (0)

Nothing needs the owner. Every finding below is a mechanical correction the coordinator can route
to a fix round; no dispute, ratification, or scope question is open.

## Evidence posture (read before judging the findings)

The code tree at review entry is **byte-identical to checkpoint `d30ef8f`**:
`git diff d30ef8f HEAD -- . ':!build_docs'` is empty, and HEAD (`a798d75`) differs only in pipeline
documentation. The implementer's closing L4+ stamp is therefore **cited, not re-run** (charter
test-evidence reuse; master plan §10.4 budget). **Zero L4 runs were spent this session.** All
independent evidence is L1 (`npx vitest run src/styles/theme.test.ts -t "<name>"`) at sites and in
mutant shapes the implementer's ledger did not use, plus one out-of-tree `node -e` derivation check
and structural reading. No Playwright run was taken; where an end-to-end row is judged, it is judged
structurally, which is sufficient because the defect is in what the assertion *can* observe, not in
what it observed.

**Same-family reading, declared per master plan §3.** Two judgments rest on reading the plan the
same way the implementer did and are **not corroboration this round**: (i) that C4(a)'s
`npx vitest list` instrument satisfies the criterion's "not a glob matcher re-derived inside the
test"; (ii) that admitting the two collection sentinels as permanent files inside the product
folder is within the "Not in this phase" exception as written. Both look right to me and to the
implementer, and we are the same model family.

---

## Findings, severity-ordered

### B1 — blocking · contract 15 §5's prospective recording rule was replaced with a weaker one

**Artifact:** `architectural_contracts/15-ui-styling-and-component-system.md` §5.

**Defect.** The patch deleted the sentence *"That adoption is an architectural decision: it is
recorded in [README.md](README.md) "Resolved decisions" with the widget that justified it, per
[13-decision-checklist.md](13-decision-checklist.md) §5."* and replaced it with *"Each addition is
recorded in the consuming phase's Review log with the widget that justified it."* A phase Review log
is a pipeline row that archives under `archive/plan_<n>/`; it is not the repository's durable
architecture record. Three authorities disagree with the patched text: this plan's own "Files
expected to change" (*"No rule in any of them is weakened … Only the description of what exists
changes"*); master plan §5 "Added by this re-derivation", which names §5's README-recording
requirement as a section-level addition **binding on this project**; and the **ratified intention
§2.2** contract row, which states that §5 *"requires the adoption to be recorded in the contracts
README with the widget that justified it"*. `13-decision-checklist.md` §5 item 32 still routes a
component-library decision to `README.md` "Resolved decisions", so the contract set now contradicts
itself. The decision this phase had to record **is** correctly recorded in both README rows — the
defect is prospective, not current.

**Correction clause.** *Restore contract 15 §5's prospective recording rule verbatim — "That
adoption is an architectural decision: it is recorded in [README.md](README.md) "Resolved decisions"
with the widget that justified it, per [13-decision-checklist.md](13-decision-checklist.md) §5." —
as its own bullet in §5, and keep the new per-milestone package bullet beside it as an addition
rather than as its replacement.*

---

### B2 — blocking · C7(b)'s guard cannot observe a component-level value; §6.5A's central prohibition is effectively unmeasured

**Artifacts:** `src/styles/theme.test.ts:312-338` (the denylist and its assertion);
`e2e/bootstrap.spec.ts:139-141` (the second site).

**Defect.** C7(b)'s instrument is a nine-fragment denylist. I planted five component-level custom
properties in `theme.css` and ran C7(b) at L1 against each mutant; **all five passed green**:
`--color-tab-active-bg`, `--color-card-header-bg`, `--color-pill-bg`, `--color-thread-bg`,
`--color-fg-ask-glyph`. Only the first is covered by the documented `tab` exclusion; the other four
are nouns the denylist never contemplated, which is structural to a denylist over an open name
universe — not a gap in the list that adding nouns would close. Master plan §6.5A forbids "no
semantic layer, no component-level value, and no multi-theme scale" and names C7 as its
measurement; standing rule 8 and charter rule 15 require an absence row's instrument to be shown
capable of observing the presence. The shipped probe C7(c) (`--color-tooltip-bg`) proves only that
the denylist matches its own list — which is exactly why the implementer's first attempt
(`--color-primary-cta-button-bg`) came back green. The row's other two halves (exactly one `@theme`
block; no semantic-layer name) are sound.

**Second site, same defect.** `e2e/bootstrap.spec.ts:139-141` discharges C7(a) correction 2 against
a **hardcoded ten-name ink list**, so the same planted `--color-fg-ask-glyph: #3a3c41` defeats
correction 2 as well — reintroducing the precise value correction 2 exists to keep out of readable
ink, undetected.

**Correction clause.** *Replace both denylists with allowlist-shaped instruments. C7(b) asserts that
the set of custom-property names declared in `src/styles/theme.css` is a subset of an enumerated
in-file list of design 01 ramp names — master plan §6.5A closes that set by construction ("a later
phase uses a ramp entry, or it amends this section"), so any new name is an offender until the
enumeration is amended alongside §6.5A. C7(a) correction 2 derives its ink set from `theme.css`
(every `--color-fg-*` name actually declared) instead of a literal list, then asserts none resolves
to `#3a3c41`. Re-run C7(c) against a name the previous instrument passed — `--color-tab-active-bg` —
and record the observed red in the ledger.*

---

### S1 — should-fix · two current-state falsehoods created by this phase, missed by the documentation-impact review

**Artifacts:** `README.md:99`; `architectural_contracts/13-decision-checklist.md` §5 item 32.

**Defect.** (i) `README.md:99` still reads *"Today it has one spec that checks the application shell
renders and the skip link works."* Task 6 and C6(c) deleted exactly those assertions from
`e2e/bootstrap.spec.ts`. The implementer patched the adjacent Vitest bullet in the same list for
precisely this reason and left the Playwright bullet one line below it. (ii) Contract 13 §5 item 32
still reads *"TanStack Query, **a component library**, and client-side persistence are not
[ratified], and each needs the named requirement first."* Task 7 ratified a component library, which
makes that clause false; contract 13 was not in task 7's perimeter and master plan §10.2 caveat 4
does not name it. Neither is a C8 violation — C8(a)'s pattern set is scoped to the deleted artefacts
and records that limit — but both are contract 14 §1 falsehoods **this phase created**, which is the
class the closing review declared empty (*"no other document makes a false statement this phase's
work touches"*). They are categorically different from follow-up 10's two pre-existing statements,
which were correctly refused.

**Correction clause.** *Patch `README.md:99` to describe what `e2e/bootstrap.spec.ts` now asserts
(the document title, that `/` renders with no client or server error, the global focus and
reduced-motion treatment, and the resolution of every custom property `globals.css` reads). Patch
`architectural_contracts/13-decision-checklist.md` §5 item 32 to remove "a component library" from
the not-yet-ratified list and point instead at the recorded decision in `README.md` "Resolved
decisions". Both are inside the meaning of task 7 — documents this phase's own change made stale —
and are not a perimeter widening.*

---

### S2 — should-fix · C7(a) correction 6 is a source-substring check wearing a browser-measurement name

**Artifact:** `e2e/bootstrap.spec.ts:188-194`.

**Defect.** The test takes a `page` fixture, navigates to `/`, then asserts
`GLOBALS_CSS.includes("prefers-reduced-motion: reduce")` — a substring in a file read at module
load. The `page` is never used again. C7(a) requires each correction *"measured on the running `/`
document"*, and master plan §10.3A requires exactly this class of assertion to be a Playwright
measurement. The row's own name claims it *"shares its subject with C2(b)"*; it shares nothing with
C2(b). The ledger's probe 3 deleted the entire `@media` block, which removes the substring too,
which is why the row's emptiness was invisible. **C2(b) does carry the substance** — it reddens on a
weakened floor as well as on a deleted block — so nothing about reduced motion is actually
unmeasured; the defect is a row that cannot fail for its stated reason.

**Correction clause.** *Either make C7(a) correction 6 a real two-sided browser measurement — under
`reducedMotion: "reduce"` assert the collapse on an injected element carrying a non-`none`
animation, and under `reducedMotion: "no-preference"` assert the same element's animation duration
is **not** collapsed — or delete the row and record in the plan that C2(b) discharges correction 6,
so the coverage map stops claiming a measurement that does not exist.*

---

### S3 — should-fix · C1's scanner: three of four value classes ship unmutated, C1(e) cannot detect scanner decay, two blind spots unrecorded

**Artifact:** `src/styles/theme.test.ts:85-190`.

**Defect, three parts.**

1. *Sub-check coverage (charter rule 12).* C1(a) names four value classes — hex colour, `px` type
   size, radius, shadow — and the plan declares one named mutation for them (C1(c), a hex). I
   mutated the other three independently at L1 and **all three bite**: `"text-[13px]"` →
   `raw-px-type-size` red; `"shadow-[0_18px_40px_rgba(0,0,0,.55)]"` → `raw-shadow-arbitrary` red;
   `.probe { border-radius: 9px; }` in a consumer `.css` → `raw-css-radius-or-shadow` red. The
   scanner is correct today; what is missing is the ledger rows proving it, one per sub-check.
2. *C1(e) cannot see decay.* I replaced `RAW_TEXT_SIZE` and `RAW_RADIUS_ARBITRARY` with
   never-matching patterns and ran both C1(a) and C1(e): **both stayed green**. Two of four value
   classes died silently and the row whose stated job is "the scanner's own scope" did not move,
   because its outcome is pinned only by `positive.length > 0` and
   `some(kind === "raw-hex-colour")`. Its fixture also plants `p-[13px]`, which the rule
   deliberately does not catch, so the fixture reads as three forms and asserts one.
3. *Two unrecorded blind spots.* C1(a) delegates the lexical rule **on condition that the forms it
   deliberately does not catch are recorded**. Two are not: (a) `BARE_CSS_FONT_SIZE` and
   `BARE_CSS_RADIUS_OR_SHADOW` both require a trailing `;`, so a declaration that is **last in its
   block** — ordinary, valid CSS — escapes (confirmed: `.probe { font-size: 13px }` green,
   `.probe { font-size: 13px; }` red; same pair for `border-radius`); (b) `stripComments` removes
   everything after `//` on a line **including inside string literals**, so
   `export const docs = "see https://example.com/style — brand #3b82f6";` scans green.

**Correction clause.** *Make C1(e)'s fixture assert **one expected violation kind per scanner class
it plants** — `raw-hex-colour`, `raw-px-type-size`, `raw-radius-arbitrary`, `raw-shadow-arbitrary`,
and on a `.css` fixture the two bare-CSS kinds — replacing `positive.length > 0`. Add the three
sub-check mutations above to the named-mutation ledger under C1(c). Add the trailing-semicolon
requirement and the `//`-inside-a-string-literal stripping to C1(a)'s recorded "deliberately not
caught" list, or make `stripComments` string-aware and let the bare-CSS patterns terminate on `}`
as well as `;`.*

---

### S4 — should-fix · design 01 §5 corrections 2 and 3 were discharged by deferral with no carrier into the phase that must implement them

**Artifacts:** `src/styles/theme.css:40-44` and `:59`; `e2e/bootstrap.spec.ts:133-155`; master plan
§11.3.

**Defect.** Correction 3 ("darken the primary button to ~`#2f6fe0`, **or** use `#0b0b0c` ink on
`#3b82f6`") was discharged by taking the alternative — which is a **composition rule for a control
that does not exist yet**. C7(a) correction 3 therefore asserts `--color-accent === #3b82f6`: it
measures that the *first* form was not applied, and nothing measures that the second ever will be.
Correction 2 has the same shape: the ask-glyph value is kept out of the ink ramp, but
`--color-border-elevated: #3a3c41` remains reachable by name, and the actual requirement (the `✦`
affordance rests at `#7c7e84`, **or** is hover-revealed *and* keyboard-reachable with a visible
ring) lands in phase 11. Master plan §11.3 follow-up 9 registers correction 6's per-animation half
for exactly this reason; corrections 2 and 3 have **no equivalent row**, so their surviving
obligation exists only in this plan's Review log, which archives at closeout. Design 10 §5 and
standing rule 6 make these corrections binding; standing rule 5 forbids deferring accessibility
without a mechanism.

**Correction clause.** *Add master plan §11.3 follow-up rows for both: correction 3 — owner: the
phase that builds the primary/approval action (phase 12); obligation: the label composes `#0b0b0c`
ink on `--color-accent`, never white, and that phase asserts the computed pair in the browser.
Correction 2 — owner: phase 11; obligation: the ask-agent affordance rests at `--color-fg-quiet`, or
is hover-revealed **and** keyboard-reachable with the global focus ring. Then record in the phase
plan that C7(a) rows 2 and 3 are **structurally held** in the master plan §7.5 sense, with those
phases as their named triggers, so neither row reads as a completed measurement.*

---

### S5 — should-fix · the ink ramp's names now invert its own order

**Artifact:** `src/styles/theme.css:53-54`.

**Defect.** `--color-fg-quiet: #7c7e84` sits directly above `--color-fg-quietest: #84868c`, and
`#84868c` is the **lighter** of the two. This is a faithful consequence of design 01 §5 correction 1
(which lightens `#6b6d73 → ~#84868c` and leaves `#7c7e84` alone), applied to one row of the ramp —
the implementer did nothing wrong. But it leaves a name that lies: a later phase reaching for
"quietest" to mean the dimmest readable ink gets the brightest of the pair. Master plan §6.3's
naming rules require one meaning per name. No consumer exists yet, so this is free to fix now and
expensive later.

**Correction clause.** *Either reorder the two names so the ramp reads monotonically — the corrected
`#84868c` becomes `--color-fg-quiet` and `#7c7e84` becomes `--color-fg-quietest`, with C7(a)
correction 1's assertion re-pointed at whichever name carries `#84868c` — or, if the names are kept,
state the inversion and its cause in the ramp's own comment so no phase reads the order off the
names. Record the underlying design 01 inconsistency in master plan §11.2 either way.*

---

### S6 — should-fix, one-line class · C4(d)'s environment half is met by inference, not by the instrument the same file already uses

**Artifact:** `src/styles/theme.test.ts:220-249` (the instrument that should be extended).

**Defect.** The row has a real subject — ten tests under `src/lib/**` — and its offline-guard half is
genuinely evidenced by `test/setup/node.test.ts`, which runs in the `node` project. But C4(a) proves
*exactly one project*, never *which*, so "collected in the `node` environment" rests on reading
`vitest.config.mts` rather than on a measurement. `theme.test.ts:244-249` already performs exactly
this assertion for one file via `runVitestList()`.

**Correction clause.** *Extend `runVitestList()`'s filter to every discovered `src/lib/**/*.test.ts`
and assert each entry's `projectName === "node"`, so C4(d) is discharged by the same instrument as
C4(f) rather than by inference.*

---

## The five named probes, each adjudicated

| Probe | Verdict | Evidence |
|---|---|---|
| **P1** site 1 — `e2e/bootstrap.spec.ts:107`, C3(a) guarded by `referenced.length > 0` | **dismissed, with a residual** (→ note N1) | The failure the probe fears *is* caught. I re-ran the derivation over a copy of `globals.css` rewritten to the legal `var( --x )` form: it yields **0 properties**, which reddens the `> 0` guard loudly. Deriving from the file at load time is the correct instrument (standing rule 11), and the enumeration behaved correctly under this phase's own change to the referenced set. What survives is only a *partial* shrink from a file that mixes both spacings. |
| **P1** site 2 — `src/styles/theme.test.ts:176`, C1(e) `positive.length > 0` | **confirmed as a defect** → S3 | Two of four scanner classes disabled; C1(a) **and** C1(e) both stayed green. |
| **P1** site 3 — `src/styles/theme.test.ts:384`, C8(b) `rows.length >= 2` | **dismissed** | I deleted one of the two `Component library` rows: the row reddens (`expected 1 to be greater than or equal to 2`), and the loop asserts Radix + Lucide on *every* matched row. The disjunction cannot hide the defect the criterion names. |
| **P1** site 4 — `src/styles/theme.test.ts:247`, C4(f) `own.length > 0` | **dismissed** | `> 0` only rules out vacuity; the assertion is carried by `every(projectName === "node")`, and exactly-one is carried by C4(a). I widened the jsdom include to claim `src/**/*.test.ts`, giving `theme.test.ts` two owners: **both** C4(f) and C4(a)'s `claimedByMoreThanOne` half reddened. |
| **P2** — C7(b)'s nine-fragment denylist | **confirmed as a defect** → B2 | Five planted component-level names, all green; four of them use nouns the exclusion list never named. |
| **P3** — C4(d) self-declared weaker | **the row is met in substance, but weakly instrumented** → S6 | The subject exists (ten tests under `src/lib/**`, none in a feature `hooks/` directory, so only the `node` project's globs can claim them) and the guard half is real. Declaring the weakness was correct behaviour; the `node`-environment half should be measured, not inferred. |
| **P4** — C5(d)'s shipped wiring | **dismissed; the wiring is correct** | `src/styles/theme.test.ts:294` calls `forbiddenDependenciesPresent(path.join(REPO_ROOT, "package.json"))`. The shipped test does pass the real manifest to the probed function; the injectable parameter is used only by the probe, exactly as the plan prescribed and for the reason it prescribed it. |
| **P5** — C4(g)'s substitute for an unachievable wording | **sound discharge; fold the wording, and widen it while folding** | Narrowing the jsdom includes to the pre-repair globs and planting a `.tsx` under `src/features/**/components/` reproduces the **precise** pre-repair defect on C4(a)'s own discovery set — stronger than "a file outside every include glob", which the total partition makes impossible to construct. One gap: C4(a) has two halves and the named mutation exercised only `claimedByNone`. My MV-9 shows `claimedByMoreThanOne` also bites. **Fold C4(g) as two named mutations, one per half:** *"narrow one project's include globs so a real test file is claimed by no project, observe (a) redden; and widen one project's include globs so a real test file is claimed by two, observe (a) redden."* |

---

## My own mutation record (all L1, all applied on the tracked tree and reverted)

| # | Hypothesis | Site (file, def-vs-call) | Planted | Observed |
|---|---|---|---|---|
| MV-1 | C1(a)'s px-type-size sub-check bites | `src/lib/__rv-px.ts` (new consumer file) | `"text-[13px]"` | **red** — `raw-px-type-size` |
| MV-2 | C1(a)'s shadow sub-check bites | `src/lib/__rv.ts` (new consumer file) | `"shadow-[0_18px_40px_rgba(0,0,0,.55)]"` | **red** — `raw-shadow-arbitrary` |
| MV-3 | C1(a)'s bare-CSS radius sub-check bites | `src/styles/consumer-probe.css` (new consumer file) | `.probe { border-radius: 9px; }` | **red** — `raw-css-radius-or-shadow` |
| MV-3b | the bare-CSS rules require a trailing `;` | same | `.probe { font-size: 13px }` | **green** — blind spot |
| MV-3c | isolating the cause | same | `.probe { font-size: 13px; }` | **red** — the semicolon is the discriminator |
| MV-3d | same, for radius | same | `.probe { border-radius: 9px }` | **green** — blind spot |
| MV-4 | `stripComments` strips inside string literals | `src/lib/__rv.ts` | `"see https://example.com/style — brand #3b82f6"` | **green** — blind spot |
| MV-5a | C7(b) catches a component-level value using an excluded noun | `src/styles/theme.css` (definition site) | `--color-tab-active-bg: #1f2023;` | **green** |
| MV-5b | C7(b) catches component-level values using un-excluded nouns | `src/styles/theme.css` (definition site) | `--color-card-header-bg`, `--color-pill-bg`, `--color-thread-bg`, `--color-fg-ask-glyph` | **green** (all four) |
| MV-6 | C1(e) detects decay of a scanner class it plants | `src/styles/theme.test.ts` (definition site — the pattern constants) | `RAW_TEXT_SIZE` and `RAW_RADIUS_ARBITRARY` replaced with never-matching patterns | **green** on both C1(a) and C1(e) |
| MV-7 | C8(b)'s `>= 2` detects a deleted row | `architectural_contracts/README.md` (call site — the Scaffold-decisions row) | one `Component library` row deleted | **red** |
| MV-8 | C3(a)'s derivation survives a legal `var( --x )` spacing | out-of-tree `node -e` over a rewritten copy of `globals.css` | a space after `var(` | derivation → **0 properties**, which reddens the `> 0` guard |
| MV-9 | C4(a)'s `claimedByMoreThanOne` half bites (never in the ledger) | `vitest.config.mts` (definition site — jsdom `include`) | jsdom widened to `src/**/*.test.ts` | **red** — C4(a) *and* C4(f) |

**Mutation-probe declaration.** Files created and removed: `src/lib/__rv-px.ts`, `src/lib/__rv.ts`,
`src/styles/consumer-probe.css`. Files edited and restored, each verified **byte-identical by
SHA-256** against a pre-probe baseline: `src/styles/theme.css`, `src/styles/theme.test.ts`,
`vitest.config.mts`, `architectural_contracts/README.md`. `src/styles/globals.css` and
`e2e/bootstrap.spec.ts` were never edited and are checksum-confirmed unchanged. No database, cache,
or tool-recorded state exists in this worktree to restore. `git status --porcelain` at close shows
only this session's three documentation writes.

---

## Verified correct, recorded so the next round is cheap

- **The theme ramp against design 01, value by value** — the instrument master plan §6.5A assigns to
  the reviewer rather than to a test. Surfaces 8/8; borders 8/8; ink 10 rows plus the two correctly
  dropped "nearly invisible" values; semantics 11/11 with the neutral-badge row correctly folded
  onto existing tokens; diff 4/4 (three by reuse, one own token); radii 10/10 (two via Tailwind
  built-ins, declared); shadows 4 carried, nav-rail correctly refused as prototype-only; type 19/19
  size steps and 5/5 line-heights (four by Tailwind default or declared override); motion 3 carried
  and `fadeUp` correctly dropped per correction 6. Every deviation is declared in the Review log
  with its reason. **Spacing is correctly limited to `--space-4`/`--space-8`**: §6.5A's eight ramps
  do not include spacing and Tailwind's own scale covers the rest — carrying design 01 §1.9 would
  have been the taxonomy §6.5A declines.
- **`@theme static` was the right delegated call and it is load-bearing.** Under the default
  `@theme`, `--space-4`/`--space-8` reach no generated utility and would be pruned — precisely the
  defect C3(a) exists to catch.
- **`globals.css`'s referenced-property set is genuinely derived and its change is honest.** It
  reads 16 distinct properties; six of master plan §10.2 caveat 2's seven are among them, and the
  seventh (`--color-accent`) is absent exactly because correction 4 moved the `a` rule to
  `--color-accent-ink-on-dark`. A derived enumeration is the correct instrument and behaved
  correctly under that change.
- **C1(b)'s allowlist** is asserted as exactly one entry **and** positionally bound to the
  `:focus:not(:focus-visible)` rule below the `:focus-visible` rule — a structural assertion, not a
  pinned literal, so charter rule 13 is satisfied.
- **The partition rule is total as configured.** `node` = `src/**/*.test.ts` + `test/**/*.test.ts`
  minus feature `hooks/`; `jsdom` = all `.tsx` plus feature `hooks/*.test.ts`. No file under `src/`
  or `test/` can fall to neither or to both; both projects exclude `e2e/**` and `**/*.live.test.ts`
  and both keep the offline `fetch` guard.
- **The two collection sentinels are the right instrument** and their permanence is correctly
  declared: they fail loudly under `node`, which is the only environment a broken partition could
  route them to.
- **C7(a) corrections 4 and 5 are real browser measurements** on injected native controls;
  correction 5's computed `outlineColor` genuinely pins design 01 §5's `#7aa9ff`, and C2(a)
  reaches its subject by a real `Tab` press rather than a programmatic focus.
- **Documentation:** contract 15's promotion rule (§4), inline-style rule (§3), one-mechanism rule
  (§1) and **§2's taxonomy prohibition verbatim** all survive the patch unchanged; §6's rewrite is
  *stronger* than what it replaced. Both README rows record Radix and Lucide with the widgets that
  justified each, exactly as contract 15 §5 and intention §2.2 ask. B1 is the single exception.
- **Session hygiene:** the checkpoint's 14 files match the declared perimeter; no package installed;
  the evidence budget was one stamp plus one legitimate re-take. The self-caught false green on
  probe 10 was reported rather than buried — that is the behaviour the doctrine asks for, and it is
  what made P2 findable at all.

---

## Notes (non-blocking) and carry-forward dispositions

| # | Note | Destination |
|---|---|---|
| N1 | **C3(a)'s residual.** A `globals.css` mixing `var(--x)` and `var( --x )` would silently drop only the spaced rows while the `> 0` guard stays green. One line closes it: assert the derived set **contains**, by name, the six master plan §10.2 caveat 2 properties it still references. | fold into the phase-01 fix round with S3 |
| N2 | **C4(e)'s instrument is narrower than its headline.** The row is titled "the DOM project also installs the offline `fetch` guard"; the check greps `vitest.setup.ts` for the call. If a later phase dropped `setupFiles` from the jsdom project the row stays green. Factually satisfied today (`vitest.config.mts:43`), and the criterion's own explanation scopes to the call — a plan lesson, not an implementation defect. | phase-01 plan wording; instrument optional |
| N3 | **The type ramp is px-locked** for 15 of its 19 steps (design 01's own values, correctly carried); the four Tailwind-inherited steps are `rem`. Browser font-size scaling does not reach the px steps. Design 01 §5 names no correction and §6.5A says carry the ramp, so the implementer was right — but the accessibility consequence belongs on the record. | master plan §11.2 design-delta register |
| N4 | **The design-delta marker names two of design 01's five open questions.** It cites register #11, which carries all five, so nothing is lost. The one worth watching is question 3 (hover easing): the theme declares **no** transition or easing value at all, so the first phase to add `transition: … 120ms` resolves an open design question with nothing in place to notice. | phase 02 (first interactive surface) |
| N5 | **No light-surface values exist.** Design 01 §1.12 / design 08's client-preview document is a light surface inside a dark application; phase 10 will need those values, and §6.5A both forbids inventing them and forbids a "multi-theme scale". That tension is phase 10's to route, not this phase's to pre-solve. | phase 10 |
| N6 | **Row-schema drift.** The implementer handoff's frontmatter reads `role: implement` while its filename and master plan §3's table use `implementer`. Cosmetic today; it breaks a mechanically read table later. | master plan §3 / coordinator hygiene |

---

## Lessons for the plans, routed by home

- **Master plan §11.3 (follow-up register):** design 01 §5's corrections 2 and 3 need follow-up rows
  naming their owning phase and surviving obligation, the way follow-up 9 does for correction 6. A
  correction discharged by choosing its alternative is a correction **deferred**, and the register is
  the only artifact that outlives this plan. *(→ S4)*
- **Master plan §10.2 caveat 4:** the stale-document enumeration missed `13-decision-checklist.md`
  §5 item 32, which this phase's own decision-recording made false. The caveat should be read as
  "documents this phase's change makes stale", not only as the list authored before the phase ran.
  *(→ S1)*
- **Master plan §6.5A:** it names C7 as the measurement for "no component-level value" but does not
  say what shape the instrument must take. Because §6.5A closes the name set by construction, the
  only enforceable form is an **allowlist derived from design 01's ramps**; a denylist cannot measure
  the prohibition at all. Say so, so no later phase re-derives a denylist. *(→ B2)*
- **Phase-01 plan, C1(a):** the criterion names four value classes and the plan declares one named
  mutation for them; charter rule 12 asks for one per sub-check. Amend the mutation arithmetic to
  C1 **5** rather than 2. *(→ S3)*
- **Phase-01 plan, C1(e):** "a synthetic fixture it must read" under-specifies the assertion. The row
  should require **one asserted violation kind per class the fixture plants** — which is what makes
  the fixture's own predicate the only reason the outcome holds (charter rule 2's companion).
  *(→ S3)*
- **Phase-01 plan, C4(g):** fold the wording as P5 describes, and widen it to two named mutations,
  one per half of C4(a)'s assertion. *(→ P5)*
- **Phase-01 plan, C7(a):** "one row per correction" reads as though every correction has a
  measurable subject in this phase. Two do not. Mark the rows for corrections 2 and 3 **structurally
  held** with their converting phase named, per master plan §7.5. *(→ S4)*
- **Phase-01 plan, C4(e):** the row's headline claims more than its own explanation. Narrow the
  headline to "the guard's call site in `vitest.setup.ts` survives the repair", or widen the
  instrument to assert the jsdom project's `setupFiles` wiring. *(→ N2)*
- **Observation for the coordinator's plan lint, offered rather than proposed as an amendment:**
  four of this round's findings (B2, S2, S3, and half of S4) are the **same shape** — an absence or
  correction row whose instrument is a fixed literal list. The plan manifest, the arithmetic and the
  coverage map all passed cleanly over every one of them, which is exactly what the charter's
  manifest section warns a passing manifest means. The cheap generalisation: **when a criterion
  asserts an absence over an open universe, the plan states whether the instrument is an allowlist or
  a denylist, and a denylist row records its limit inside the criterion.** C5(d) already does this
  and is the only one of the five that does — which is also why P4 dismissed cleanly and P2 did not.

---

## Full write perimeter, and what I did and did not run

**Documents written:** `master-plan.md` (tracker row 01 only: `IMPLEMENTED` → `REVIEWING` on entry,
→ `CHANGES_REQUESTED` at verdict), `plans/phase-01-baseline-and-visual-foundation.md` (this round's
Review log entry appended; the `State` header row left at `IMPLEMENTED` for the coordinator to move
with the fix cycle), and this handoff file (new).

**Code written:** none. Every mutation probe listed above was reverted and checksum-verified
byte-identical. No fix was applied — findings route through the coordinator.

**Commands run:** eleven L1 `npx vitest run src/styles/theme.test.ts -t "<name>"` invocations (the
mutation table above), one out-of-tree `node -e` derivation check (MV-8), and read-only
`git` / `grep` / `find` / `sed` inspection.

**Commands deliberately NOT run:** `npm test`, `npm run test:e2e`, `npm run typecheck`,
`npm run lint`, `npm run build`. The code tree is byte-identical to the checkpoint the implementer's
closing stamp was taken on, so re-running them would be redundant evidence and a finding against this
session (master plan §10.4 budget; charter over-evidence rule). No pre-run authorization line was
needed because no additional L4 run was taken.

**Packages:** none installed, no dependency added, `package.json` and `package-lock.json` untouched.

**Architecture graph:** none exists in this worktree (master plan §8). **No graph delta is reported.**

**Not this session's work:** the untracked `build_docs/future_implementations/` (pre-attributed in
the review prompt) and the untracked
`build_docs/under_constroction/frontend_core/prompts/astra_prompts/`, which appeared from outside
this session.
