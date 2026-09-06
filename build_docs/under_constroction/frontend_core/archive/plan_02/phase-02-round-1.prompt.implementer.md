---
plan: plans/phase-02-workspace-shell.md
role: implementer
round: 1
date: 2026-09-06
project: frontend_core
feature: Proposal Copilot Frontend Core
---

# Session prompt — implement phase 02

You implement **phase 02 of `frontend_core`** in
`/Users/davidloorenz/Desktop/Developer/Proposales-frontend`, branch `proposal-copilot-frontend`.
Run every command from that worktree root. **Never enter the sibling backend worktree**
`/Users/davidloorenz/Desktop/Developer/Proposales`.

Follow the `implementation-executor` doctrine: invoke the `implementation-executor` skill, or
read `/Users/davidloorenz/agent-skills/implementation-executor.md` and
`/Users/davidloorenz/agent-skills/pipeline-charter.md` by absolute path and follow them. Also
follow the repository's Architecture Context policy
(`agent-skills/policy/architecture-context-policy.md`), routed through
`architectural_contracts/01-implementation-contract-guide.md`, and re-emit your contract
selection in the Review log before coding.

**The plan file is your task list and your acceptance criteria. Where this prompt differs from
the plan file, the master plan, the ratified intention, a design specification, or an applicable
architecture contract, those authorities win.**

This phase went through a projection round. Its 27 findings and its one owner card are already
folded into the plan, the master plan and the intention. **You are reading the amended plan.**
Nothing from that round is outstanding, and the plan's row and mutation counts are the amended
ones — 58 rows, 11 named mutations. Do not work from any earlier count you may see quoted
elsewhere.

## 1. Gate check — run first, stop and report on any failure

| # | Check | Where | Passes when |
|---|---|---|---|
| 1 | Intention ratified | `build_docs/under_constroction/frontend_core/intention/frontend-core-intention.md`, status table | the **Status** value begins `RATIFIED` |
| 2 | No open owner decision | same file, §15 heading | it reads `(0 open)` |
| 3 | Predecessor gate | `master-plan.md` §4, row `01` | the **State** cell reads `APPROVED` |
| 4 | The phase is projected and dispatched | `master-plan.md` §4, row `02` | the **State** cell reads `PROJECTED` or `PROMPT_READY` |
| 5 | The plan agrees | `plans/phase-02-workspace-shell.md`, header | its **State** row reads `PROJECTED` or `PROMPT_READY`, and its **Criteria** row reads `6` |
| 6 | The work is genuinely outstanding | the tree | `src/features/proposal-preparation/components/workspace/` does not exist |
| 7 | The round is genuinely outstanding | `handoffs/implementer/` | no `phase-02-round-1` handoff exists |

## 2. Read order

1. The plan, in full, **including its Review log** — the log is where the projection's folds are
   explained, and two of them (task 3's contract resolution, C4's condition 1) are reasoning you
   are expected to preserve rather than re-derive.
2. The plan's own **Read first** list, in full. It gained three contracts at the projection:
   `16-design-prototype-porting.md` §3–§5, `14-documentation-principles.md` §8,
   `13-decision-checklist.md` §5.
3. Master plan **§6.1** (the client boundary this phase enacts), **§6.4** (the named constants),
   **§6.5A** (the theme layer's closed name set — this phase adds no name to it), **§7.5**,
   **§10.2**, **§10.3** and **§10.3A** (which runner can measure which subject — this decides
   where every row of this phase can live), **§10.4**, **§11.2**, **§11.3**.
4. The repository as it is: `src/app/layout.tsx`, `src/app/page.tsx`, `src/styles/theme.css`
   (phase 01's 81 declared names), `src/styles/theme.test.ts` (phase 01's guards, which your code
   must satisfy, and whose `C6(a)/(c)` block task 8 retires), `e2e/bootstrap.spec.ts`,
   `vitest.config.mts`, `playwright.config.ts`, `eslint.config.mjs`, `README.md`, and the two
   phase-01 collection sentinels under `src/features/proposal-preparation/`.

## 3. What this phase's environment can and cannot measure — read before you write a test

This is the single most expensive thing to get wrong here, and the projection verified it at
source rather than from memory:

- **jsdom performs no layout.** `getBoundingClientRect()` returns literal zeros and
  `clientWidth` / `clientHeight` / `scrollWidth` / `scrollHeight` are `return 0`
  (`node_modules/jsdom/lib/jsdom/living/nodes/Element-impl.js`). Nothing about width, overflow,
  clipping or computed style is observable in Vitest here.
- **jsdom 30.0.1 ships no `ResizeObserver` and no `setPointerCapture`** — neither identifier
  appears anywhere in `node_modules/jsdom/lib/`. A pointerdown handler that calls
  `setPointerCapture` throws in any component test that fires one.
- Therefore: **the clamp arithmetic is a Vitest subject; the rendered document is a Playwright
  subject.** That split is why task 4 requires the clamp to be a pure function of
  `(requested, containerWidth)` and the hook to receive the container width as an argument.
- **Do not stub `ResizeObserver` in `vitest.setup.ts`.** That file is not in this phase's
  perimeter, and a stub would make the test environment assert a layout it cannot perform.

## 4. Scope fences — enumerated, and absolute

Work belonging to another phase is not "while I'm here" work. Specifically, this phase does
**not**:

1. add any session concept, session store, tab strip, thread, or composer — **phase 03**;
2. add any turn dispatch, result rendering, pill, or agent-surface content beyond the shell's own
   named region — **phases 05–07**;
3. add a clarification panel, review surface, preview, or money presentation — **phases 08–10**;
4. add a router, a route, a URL segment, a query parameter, a history entry, or a navigation
   event for a workspace surface. This is not deferral, it is intention §12A.23's closed
   prohibition, and C5(a) measures it;
5. add a second application surface, a dashboard, a proposal list, a statistics strip, or a
   session history — the same prohibition, measured by C5(d);
6. **add any custom property to `src/styles/theme.css`.** Phase 01's C7(b) allowlist rejects any
   name outside design 01's ramps, and every colour this phase needs already exists:
   `--color-bg`, `--color-bg-agent-pane`, `--color-bg-resize-active`, `--color-border-hairline`,
   `--color-border-control`, `--color-accent`, `--color-focus`. Layout dimensions are Tailwind
   spacing utilities or the runtime-computed inline width, never theme values;
7. add a transition, an easing value, or an animation. Design 02 §6's "consider a single 120ms
   eased transition" on reset is a suggestion this phase declines (phase-01 review N4, master
   plan standing rule 4);
8. install any package. `package.json` and `package-lock.json` are unchanged at close. Radix
   arrives in **phase 03** with the widget that justifies it, and no Radix primitive models a
   splitter in any case;
9. create anything under `src/components/ui/` (phase 01 C5(b) keeps it empty), `src/styles/tokens.css`,
   or any `*.module.css`;
10. edit `vitest.setup.ts`, `vitest.config.mts`, `playwright.config.ts` or `eslint.config.mjs`.
    None is in the file perimeter. If you believe one must change, **stop and report**;
11. persist the pane width in any form — no `localStorage`, no cookie, no URL parameter, and no
    store shape justified by future serialisation;
12. invent the idle state's visual treatment. It is a reported design gap (master plan §11.2
    delta 8): build an honest empty state, leave a marker, report. Filling it from design 10 §7's
    excluded list is the specific failure that note exists to prevent;
13. edit any file under `ui_design/` — a design delta is recorded, never implemented as a design
    decision;
14. edit the intention, the master plan (beyond your own tracker row), any phase plan other than
    this one's Review log, or any architecture contract. The only documentation this phase
    patches is the root `README.md`, per task 9;
15. touch phase 01's guards in `src/styles/theme.test.ts` beyond the **one** `describe` block task
    8 names. Its neighbours' shared bindings stay in use;
16. stage `build_docs/future_implementations/` in any commit.

If the plan seems to require something on this list, **stop and report** — do not resolve it in
code.

## 5. The eleven named mutations — enumerated, all eleven must run

Master plan standing rule 8 and charter rule 15: a guard, an absence claim or a purity check
ships with its planted-defect probe — the defect planted **on the tree**, the red observed, the
probe reverted, the ledger row written. "Verified by inspection" is not a run.

**`executed != declared` blocks `IMPLEMENTED`.** The plan declares eleven; the summands are
C1 2 · C2 0 · C3 1 · C4 4 · C5 2 · C6 2 = **11**. Re-derive this from the criteria yourself and
state your arithmetic. Each row records the site (file, and definition-versus-call-site), the
**observed** failing id and assertion, and the revert.

| # | Criterion | Plant this | This must redden |
|---|---|---|---|
| 1 | C1(g) | a second `main` inside the Main Application Surface | C1(b) |
| 2 | C1(h) | a second complementary region | C1(a) |
| 3 | C3(f) | reverse the clamp's ordering, so the main-pane minimum wins | C3(c) |
| 4 | C4(e) | give a content column a fixed width instead of a maximum | C4's **condition 2 at 780px** — name the row |
| 5 | C4(f) | remove the divider's `tabindex` | C4's **condition 3**, at all three widths |
| 6 | C4(g) | replace elided text's accessible name with its truncated string | C4's **condition 4 at 780px** |
| 7 | C4(h) | let the clamp resolve below the agent minimum | C4's **condition 5 at 780px** |
| 8 | C5(e)-i | a second exported union whose domain is surface kinds in `types/presentation.ts` | C5(c) |
| 9 | C5(e)-ii | a second module under `src/features/` rendering a `main` | C5(d) |
| 10 | C6(f) | an `aria-live` region inside the idle subtree | C6(e) |
| 11 | C6(g) | a statistics list inside the idle subtree | C6(a)'s allowlist |

**C4's condition 1 has no probe, and that is deliberate.** The root's `overflow:hidden` makes it
true by construction, so it cannot be reddened; the plan records this and the intention's own
named mutation was corrected upstream for the same reason. **Do not invent a probe for it, and do
not remove the root's overflow guard to manufacture one.** If you find that condition 1 *can* be
reddened, that is a finding worth reporting — it would mean the shell's root is not what the
design specifies.

**A probe that lands in the wrong place measures nothing, and its green is the most dangerous
result available.** If a probe comes back green where you expected red, suspect the siting before
concluding the guard is broken — and if you re-site it, say so in the ledger.

List every file a probe touched in your handoff, **separately from your own changes**.

## 6. Decisions delegated to you, in writing

These are granted on purpose — the projection proposed each as an explicit delegation so the
freedom is given rather than taken. Make the smallest reasonable choice and **record each in the
Review log with the reason**:

1. **The designed wide width** — the third member of `NARROW_WIDTH_TEST_SET`. Any value strictly
   greater than the upper stated threshold, so the three members stay distinct. Recommended:
   `1440`.
2. **Where the constants are imported from in the browser rows.** The module is fixed
   (`components/workspace/constants.ts`). If a Playwright spec imports `NARROW_WIDTH_TEST_SET`
   from `e2e/`, confirm Playwright resolves the root `tsconfig` path alias **before** relying on
   it; no lint rule forbids the import.
3. **`MainSurfaceState`'s production consumer.** Charter rule 4 forbids dead scaffolding and
   contract 12 forbids a file created "because the structure says so". Recommended:
   `MainApplicationSurface` takes `state: MainSurfaceState`, pinned to `"idle"` by its only
   caller — one real consumer, and it is precisely the seam phase 14 replaces. A test-only
   consumer is acceptable **only if declared with its reason**.
4. **The skip link's label, its target id, and its visually-hidden-until-focused treatment.**
   C1(d)/(e) fix what it must do, nothing fixes how it reads. **Naming trap:** design 01's "skip
   links" ramp rows are the clarification panel's *skip a question* links — a different meaning of
   the same word. Take no value from them.
5. **The divider's tag name.** Task 3 fixes the semantics (`role="separator"`, `tabindex="0"`,
   project-owned because the platform offers no focusable valued separator); the element it hangs
   on is yours.
6. **No `title` attribute on the divider.** Design 02 §4's prototype tooltip collides with
   §12A.17's forbidden list ("a `title` attribute as an accessible name"). Recommended: the
   `aria-label` carries the name and the keyboard model needs no tooltip to be discoverable. If
   you disagree, record the reason.
7. **The clamp-resistance cue** (design 02 §6, open question 4; intention §6 "only if cheap").
   Recommended: **not taken**, and recorded as declined so it is not silently absent.
8. **A conditional class-name utility.** Contract 15 §1 says it is created inside the feature that
   first needs it, and none exists. Either create it inside this feature or use plain template
   literals — both are contract-compliant. **Not** under `src/components/ui/` (fence 9).
9. **`user-select: none` during a drag.** Recommended: a class toggled on the shell root, not on
   `document.documentElement`, so the effect stays inside this component's own subtree.
10. **Test file names and their placement inside the partition** (master plan §10.3): `.tsx`
    anywhere under `src/` is jsdom, a feature `hooks/*.test.ts` is jsdom, everything else is node.

## 7. Evidence budget

Two L4 measurements are authorized for this cycle, and no more:

1. **The baseline re-enumeration** — `npm test`, `npm run test:e2e`, `npm run typecheck`,
   `npm run lint`, `npm run build`, once, on the tree as you receive it, before the first edit.
   This is the phase's own enumerated L4 matrix, not over-budget. Phase 01 handed over
   137 unit tests and 27 end-to-end tests green; if your baseline differs, that is a finding
   before you have written a line.
2. **The closing stamp**, taken on the tree you actually hand over: all five, because this phase
   changes rendered structure, deletes an end-to-end spec and edits a Vitest guard, and CI runs
   all five (master plan standing rule 16, §10.4 L4+). If you change anything after taking the
   stamp, you re-take it; the re-take is not over-budget.

Everything else runs at **L1** (`npx vitest run <path> [-t "<name>"]`, `npx playwright test <file>
-g "<name>"`) or **L2** (`npx vitest run --project jsdom src/features/proposal-preparation`).

Any further L4 requires one line written **before** the run: "narrower evidence insufficient
because …". Re-running evidence whose tree identity matches yours, with no variation and no such
line, is a finding against this session.

## 8. Closing protocol

In order, per the executor doctrine:

1. **The coverage map first** — one line per criterion **row** (all 58), before you edit
   production code: row → the test id that discharges it → whether that test's assertion is the
   shape the row specifies or something weaker. Any cell you cannot fill is a finding you have
   just made; report it, never invent coverage. Then transcribe every row into an executable case
   and record the red baseline before the first production edit.
2. **The map runs both ways.** Every test in this phase's test files appears in the map against a
   criterion row. A test discharging no row is deleted, or declared in the Review log as a
   **candidate criterion** — naming the defect it catches and the ledger entry or contract it
   serves — for the coordinator to fold in or refuse with a recorded reason. The three phase-01
   rows task 8 relocates (C2, C3(a), C7(a)) plus the spec's first test are **phase 01's**
   evidence: list them separately, and record any change to how each one reaches its subject.
3. **The closing L4+ stamp** (§7), with tree identity and the failure-ID delta against your
   baseline.
4. **All eleven mutations run and reverted** (§5), each a full evidence record.
5. **Documentation impact review.** Verbatim, per master plan standing rule 9:
   > Before closing implementation, evaluate documentation impact according to
   > `architectural_contracts/14-documentation-principles.md`. Update any authoritative
   > documentation made false, incomplete, or misleading by the verified implementation. Do not
   > modify documentation merely because files changed.
   Task 9 names what is already known to be stale, including the Proposales-adapter sentence the
   projection found (master plan §11.3 follow-up 14). The review also covers what that list does
   not name.
6. **Tracker row 02 → `IMPLEMENTED`**, with date, actor and a one-line note carrying the test
   counts. Touch no other row.
7. **Review log entry** in the plan file: what you built, every delegated decision with its
   reason, every judgment call, any deviation with justification, and any observation a reviewer
   needs. **Two items are required by name**: your reading of task 3's contract resolution as you
   implemented it, and your judgement on §12A.23's **bullet 5** — the shell-level abstraction
   introduced "because decision 11 named the surface generically" — which task 7 reviews rather
   than tests.
8. **The checkpoint commit**, the moment you reach `IMPLEMENTED`, under the owner's standing
   authorization — no round stops to ask. Subject line prefixed
   `CHECKPOINT (not approved): frontend 02 …`. Stage **only** this cycle's declared files plus
   the tracker and Review-log edits you actually made (master plan standing rule 15). Stage files,
   not directories. Never `build_docs/future_implementations/`.
9. **Handoff** at `handoffs/implementer/phase-02-round-1.handoff.implementer.md`, frontmatter
   `plan`, `role: implement`, `round: 1`, `state`, `date`, `actor`. Body: the coverage map, the
   mutation ledger with its arithmetic, the baseline and closing evidence records, the delegated
   decisions, your **full write perimeter** (documents, code, dependencies, commands, commits),
   and **every file a mutation probe touched, listed separately from your own changes**.
   Any question only the owner can settle goes in a `⚠ OWNER DECISIONS REQUIRED (n)` section
   immediately after your opening summary, in charter card format — never buried in a paragraph.
   There is **no architecture graph** in this worktree; report no graph delta.

Counts are derived from the artefact they count, never typed forward (standing rule 11).

## 9. Closing message

End with the charter's owner layer, in this order: **What I did → What I found and what it means
for you → What happens next → What needs you** — decision cards verbatim, or the single line
`nothing needs you`. Plain product language, no section numbers or file paths in that layer, one
pointer line naming your handoff file.
