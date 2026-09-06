---
plan: plans/phase-03-session-runtime-and-tabs.md
role: implementer
round: 1
date: 2026-09-07
project: frontend_core
feature: Proposal Copilot Frontend Core
---

# Session prompt — implement phase 03

You implement **phase 03 of `frontend_core`** in
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

This phase went through a pre-dispatch lint and a projection round. Their 27 ledger rows, two
coordinator additions and two owner decisions are already folded into the plan, the master plan
and the intention. **You are reading the amended plan.** Nothing from either round is
outstanding, and the plan's counts are the amended ones — **7 criteria, 46 rows, 15 runnable
named mutations, 4 structurally held rows**. Do not work from any earlier count quoted elsewhere.

## 1. Gate check — run first, stop and report on any failure

| # | Check | Where | Passes when |
|---|---|---|---|
| 1 | Intention ratified | `build_docs/under_constroction/frontend_core/intention/frontend-core-intention.md`, status table | the **Status** value begins `RATIFIED` |
| 2 | No open owner decision | same file, §15 heading | it reads `(0 open)` |
| 3 | Predecessor gate | `master-plan.md` §4, row `02` | the **State** cell reads `APPROVED` |
| 4 | This phase is projected and dispatched | `master-plan.md` §4, row `03` | the **State** cell reads `PROJECTED` or `PROMPT_READY` |
| 5 | The plan agrees | `plans/phase-03-session-runtime-and-tabs.md`, header | its **State** row reads `PROJECTED` or `PROMPT_READY` and its **Criteria** row reads `7` |
| 6 | The work is genuinely outstanding | the tree | `src/features/proposal-preparation/components/session-tabs/` does not exist and `package.json` declares no `@radix-ui/*` dependency |
| 7 | The round is genuinely outstanding | `handoffs/implementer/` | no `phase-03-round-1` handoff exists |

Do not gate on a commit SHA, on whether the working tree is clean, or on any file count.

**Environment note, so you do not stop-and-report on it:** the untracked, git-ignored directory
`build_docs/future_implementations/` is not this pipeline's work. Leave it alone.

## 2. Read order

1. The plan, in full, **including its Review log and its Explicit delegations section**. The log
   is where the lint's and the projection's folds are explained; several are reasoning you are
   expected to preserve rather than re-derive — C1(b)'s re-authoring, C3(e)'s re-authoring,
   C4's split by runner, and task 3's conflict resolution.
2. The plan's own **Read first** list, in full.
3. Master plan **§6.1** (the store ladder and the tab-strip decision), **§6.2**, **§6.3**,
   **§6.4** (the named constants, one of which this phase owns), **§7.5** (the four held rows and
   their triggers), **§9** (the standing rules, 17 and 18 in particular), **§10.3**, **§10.3A**
   (which runner can measure which subject — this decides where every row of this phase can
   live), **§10.4**, **§11.2**, **§11.3**.
4. The repository as it is: the whole of
   `src/features/proposal-preparation/components/workspace/`,
   `components/idle/proposal-preparation-idle-surface.tsx`, `hooks/use-divider-width.ts`,
   `types/presentation.ts`, and the two phase-02 evidence files whose assertions your code must
   satisfy — `components/workspace/workspace.test.tsx` and `e2e/workspace.spec.ts`. Also
   `src/lib/proposales/index.ts`, `playwright.config.ts`, `vitest.config.mts`, `vitest.setup.ts`,
   `package.json`, `README.md`.

## 3. What this phase's environment can and cannot measure — read before you write a test

Verified at source, not from memory. This is the most expensive thing to get wrong here.

- **jsdom performs no layout, and returns zeros rather than failing.** `getBoundingClientRect()`
  returns literal zeros, `getClientRects()` returns `[]`, and `scrollWidth` / `clientWidth` /
  `offsetWidth` are `return 0`
  (`node_modules/jsdom/lib/jsdom/living/nodes/Element-impl.js:328`, `:340`, `:344`, `:361`;
  `HTMLElement-impl.js:196`). Zeros silently satisfy predicates: "is this tab inside that
  region", "does this text overflow", "is this hit area big enough" are all trivially decided at
  zero and the test goes green having observed nothing. **Every geometry row of this phase is a
  Playwright row** (master plan §10.3A, extended for exactly this reason on 2026-09-07).
- **jsdom ships no `ResizeObserver`**, so C4's resize case has nothing to fire in Vitest.
- **jsdom implements no `DragEvent` and no `DataTransfer`.** `fireEvent.dragOver` constructs a
  plain `Event` with no `dataTransfer`. This is why C2(e) and C2(h) are rooted on the move
  function rather than on a DOM-level drag.
- **`@testing-library/user-event` is not a dependency of this repository**, and `fireEvent.click`
  does **not** fire `mousedown` — which is what the tab foundation activates on. See delegation 4.
- **Playwright pins 1280×720** (`playwright.config.ts` selects `devices["Desktop Chrome"]`). A
  test parameterised by width that never calls `page.setViewportSize` measures 1280 whatever its
  title says.

## 3A. The tab foundation, grounded at source — use these, do not re-derive them

The coordinator read `@radix-ui/react-tabs@1.1.13` and `@radix-ui/react-roving-focus@1.1.11` at
source on 2026-09-07. **Task 3's install may resolve higher. The first contradiction between any
fact below and the version you install is a stop-and-report, not a silent adaptation** — and it
is a finding worth having, not a failure.

- `TabsTrigger` renders `<button type="button" role="tab" aria-selected aria-controls={contentId}>`
  and calls `context.onValueChange(value)` from **`onMouseDown`**, not `onClick`. A pointer drag
  begins with a `mousedown`, so **drag initiation must suppress activation** or C2(b) fails on the
  pointer path (task 4).
- `aria-controls` is emitted **unconditionally**, whether or not a panel exists.
- `TabsContent` renders `children: present && children` behind `present: forceMount || isSelected`
  — a panel per session **unmounts the outgoing subtree**, which is what C6(b) forbids and what
  C6(f) plants. Task 3 resolves this: **the landmark is never the panel and never unmounts.**
- `activationMode` defaults to `"automatic"`, so focusing a tab activates it.
- Roving focus: `tabIndex: isCurrentTabStop ? 0 : -1`; `loop` defaults to **`false`**, so
  `ArrowRight` on the last tab is a **no-op and does not wrap**; the key map is
  `ArrowLeft`/`ArrowUp` → previous, `ArrowRight`/`ArrowDown` → next, `Home`/`PageUp` → first,
  `End`/`PageDown` → last, and at **horizontal** orientation `ArrowUp`/`ArrowDown` are filtered
  out and move focus nowhere. C5(c) asserts exactly this set.
- A `<button>` may not contain a `<button>`: the close control is a **sibling** of the trigger
  inside a wrapper (C5(d)).

## 4. Inherited constraints — not optional

Two phase-02 rows are **frozen** by the plan's §4 and will redden on your markup if you ignore
them. They are signals, not obstacles: each is a real invariant this phase must keep.

1. **`C4(<width>-4)`, the elision row.** Every `[data-elided]` element whose text overflows must
   have an accessible name **equal to its own `textContent`**. A tab's accessible name carries
   status, note and unread and is deliberately not its text — so `data-elided` goes on the inner
   **title span**, never on the tab (C5(g)). Phase 03 supplies this row's first real subject; it
   has plausibly never measured anything before now.
2. **`C4(<width>-2)`, the overflow row**, which applies because the strip lives inside the
   `complementary` landmark (design 03 §2). Its first loop exempts horizontal overflow **only**
   for an element carrying the literal class `overflow-x-auto` or `overflow-x-scroll`, an inline
   `style.overflowX` of `auto`/`scroll`, or the attribute `data-horizontal-scroll` — and the
   element that actually overflows must carry one of those four, not merely an ancestor of it.
   Its **second loop has no exemption at all**: every `div` in the pane must have a
   `getBoundingClientRect().width` no greater than the pane's `clientWidth`.

**Weakening a frozen assertion to make your code pass is a blocking defect, not a re-baseline.**
The five instances that may be re-baselined are named in the plan's §4 and are the only ones. If
you believe a frozen assertion is genuinely wrong, **stop and report** — do not edit it.

**Task 8 carries one deliberate repair** (master plan §11.3 follow-up 16) and it owes its own
planted-defect proof.

## 5. Scope fences — enumerated, and absolute

This phase does **not**:

1. add tab **status**, the unread counter, attention, or the derivation register — **phase 04**;
2. add turn dispatch, origin attribution, result application, or the close/discard confirmation
   guard — **phase 05**. Closing here is unguarded **by design**; task 5 leaves the gate point
   phase 05 fills, and C3(i) asserts there is exactly one;
3. add thread content, a composer, pills, a clarification panel, a review surface, a preview, or
   money presentation — **phases 06–10**;
4. build any part of the **snapshot architecture** design 04's "Prototype-only" list names:
   `SESSION_KEYS`, `BLANK_SNAP`, `seedSnap`, `loadSnap`, `sset`, the `archive` array,
   `PAST_SESSIONS`, `BG_SESSION`, `bump()`, `sessionSeq`, or `document.querySelector` for the
   active tab. The product guarantee survives; the mechanism does not (standing rule 2);
5. add a router, route, URL segment, query parameter, history entry, or navigation event — the
   closed prohibition of §12A.23, measured by C6(c) and phase 02's frozen `C5(a)`;
6. add a second application surface, a surface registry, a surface map or factory, or a
   discriminant over surface kinds — measured by phase 02's frozen `C5(b)`, `C5(c)`, `C5(d)`,
   which your new source under `src/features/**` is scanned by;
7. add session **persistence** in any form — no `localStorage`, no cookie, no URL parameter, no
   store shape justified by future serialisation. Session runtime is page-lifetime (§7, §8.3);
8. make session titles user-editable (design 04 open question 6, out of V1) or add a session
   cap or overflow indication (a reported design delta, not a decision this phase takes);
9. add any custom property to `src/styles/theme.css` — phase 01's C7(b) allowlist rejects any
   name outside design 01's ramps;
10. install any package other than `@radix-ui/react-tabs` and what npm resolves as its own
    dependencies. Radix **Popover** is phase 11; the native `<dialog>` is phase 05's;
11. edit `vitest.setup.ts`, `vitest.config.mts`, `playwright.config.ts` or `eslint.config.mjs`.
    None is in the file perimeter. If you believe one must change, **stop and report**;
12. add assertions to `e2e/workspace.spec.ts`. This phase's browser evidence lands in the new
    `e2e/session-tabs.spec.ts`; the only edits to the phase-02 spec are its five re-baselined
    instances;
13. edit any file under `ui_design/` — a design delta is recorded, never implemented;
14. edit the intention, the master plan (beyond your own tracker row), or any phase plan other
    than this one's Review log. The only documentation this phase patches is the root `README.md`
    (task 9, master plan §11.3 follow-up 6);
15. stage `build_docs/future_implementations/` in any commit.

If the plan seems to require something on this list, **stop and report** — do not resolve it in
code.

## 6. The fifteen named mutations — enumerated, all fifteen must run

Master plan standing rule 8 and charter rule 15: a guard, an absence claim or a purity check
ships with its planted-defect probe — the defect planted **on the tree**, the red observed, the
probe reverted, the ledger row written. "Verified by inspection" is not a run.

**`executed != declared` blocks `IMPLEMENTED`.** The plan declares fifteen runnable; the summands
are C1(b) 1 · C2(b) 1 · C2(c) 3 · C3(e) 1 · C3(g) 1 · C3(h) 1 · C3(i) 1 · C4(f) 3 · C6(e) 1 ·
C6(f) 1 · C7(a) 1 = **15**. Re-derive this from the criteria yourself and state your arithmetic.

| # | Row | Plant this | This must redden |
|---|---|---|---|
| 1 | C1(b) | a module-level mutable counter as the id source, at the construction site | C1(b)'s allowlist |
| 2 | C2(b) | remove the guard that preserves the active session id in the move function | C2(b), on both paths |
| 3 | C2(c)-i | write the list back unconditionally on a same-index move | C2(c)'s **no state write** sub-check only |
| 4 | C2(c)-ii | announce unconditionally on a same-index move | C2(c)'s **no announcement** sub-check only |
| 5 | C2(c)-iii | move focus to the moved tab unconditionally on a same-index move | C2(c)'s **no focus change** sub-check only |
| 6 | C3(e) | split the close action into two writes, removal first | C3(e) |
| 7 | C3(g) | replace the id generator with the tab's array index | C3(g) — create A, create B, close A, create C |
| 8 | C3(h) | on closing the active tab, activate index 0 instead of the same index | C3(b) |
| 9 | C3(i) | a second close path that removes a session without passing the gate | C3(i) |
| 10 | C4(f)-i | `scrollIntoView`, as a construct no denylist would contain | C4(c) |
| 11 | C4(f)-ii | locate the tab by a document query, likewise | C4(d) |
| 12 | C4(f)-iii | read the window width during render, likewise | C4(e) |
| 13 | C6(e) | push a history entry on session activation | C6(c) |
| 14 | C6(f) | remount the Agent Surface when the active session changes | C6(b) |
| 15 | C7(a) | insert the new session at index 0 instead of the end | C7(a) |

**Rule 12 binds mutations 3, 4 and 5**: each must reach its own sub-check and no other.
Sequential assertions short-circuit — a mutation that trips the first assertion returns before
the second executes, and the ledger then reads green-then-red as expected while the sub-check it
was meant to cover was never run. Record which bites on which.

**Standing rule 17 binds mutations 1 and 10–12**: the planted construct must be one **no denylist
would have contained**. A probe drawn from the instrument's own list proves nothing — that is
how four guards passed in phase 02 while catching nothing.

**C1(e) is held and does not run.** It converts in phase 05 with the rows it serves (master plan
§7.5). Do not manufacture a dispatch surface to exercise it.

**A probe that lands in the wrong place measures nothing, and its green is the most dangerous
result available.** If a probe comes back green where you expected red, suspect the siting before
concluding the guard is broken — and if you re-site it, say so in the ledger.

List every file a probe touched in your handoff, **separately from your own changes**.

## 7. Decisions delegated to you, in writing

The plan's **Explicit delegations** section carries six, each granted on purpose so the freedom
is given rather than taken. Read them there and **record each in the Review log with the reason
you chose what you chose**. Summarised: the instrument for C4(c)–(e)'s allowlists
(`ts.createSourceFile` is available); `ACTIVE_TAB_REVEAL_MARGIN_PX`'s value; how the tabs
relationship is carried without making the landmark the panel; how activation is driven under
test; the new-session control's exact position; and how C2's and C3's rows split between the
store test and the rendered test.

Task 3 additionally owes the Review log the **package and its resolved version, with the widget
that justified it** (contract 15 §5, master plan §6.1).

## 8. Evidence budget

Two L4 measurements are authorized for this cycle, and no more:

1. **The baseline re-enumeration** — `npm test`, `npm run test:e2e`, `npm run typecheck`,
   `npm run lint`, `npm run build`, once, on the tree as you receive it, **before the first
   edit**. Phase 02 handed over **154 unit tests and 66 end-to-end tests** green at gate commit
   `3796dc1`; if your baseline differs, that is a finding before you have written a line.
2. **The closing stamp**, taken on the tree you actually hand over: all five, because this phase
   changes rendered structure, adds a dependency and adds an end-to-end spec, and CI runs all
   five (standing rule 16, §10.4 L4+). If you change anything after taking the stamp, you re-take
   it; the re-take is not over-budget.

Everything else runs at **L1** (`npx vitest run <path> [-t "<name>"]`,
`npx playwright test <file> -g "<name>"`) or **L2**
(`npx vitest run --project jsdom src/features/proposal-preparation`).

Any further L4 requires one line written **before** the run: "narrower evidence insufficient
because …". Re-running evidence whose tree identity matches yours, with no variation and no such
line, is a finding against this session.

## 9. Closing protocol

In order, per the executor doctrine:

1. **The coverage map first** — one line per criterion **row** (all 46, the 4 held ones marked
   held and not counted as covered), **before you edit production code**: row → the test id that
   discharges it → whether that test's assertion is the shape the row specifies or something
   weaker → **which runner executes it**. Any cell you cannot fill is a finding you have just
   made; report it, never invent coverage. Then transcribe every row into an executable case and
   record the red baseline before the first production edit.
2. **The map runs both ways.** Every test in this phase's test files appears in the map against a
   criterion row. A test discharging no row is deleted, or declared in the Review log as a
   **candidate criterion** — naming the defect it catches and the ledger entry or contract it
   serves — for the coordinator to fold in or refuse with a recorded reason.
3. **The five re-baselined phase-02 instances**, listed separately from your own work, each with
   the tab order it now asserts and why that order is what the shell produces.
4. **The closing L4+ stamp** (§8), with tree identity and the failure-ID delta against your
   baseline.
5. **All fifteen mutations run and reverted** (§6), each a full evidence record naming the site
   (file, and definition-versus-call-site), the **observed** failing id and assertion, and the
   revert.
6. **Documentation impact review.** Verbatim, per master plan standing rule 9:
   > Before closing implementation, evaluate documentation impact according to
   > `architectural_contracts/14-documentation-principles.md`. Update any authoritative
   > documentation made false, incomplete, or misleading by the verified implementation. Do not
   > modify documentation merely because files changed.
   Task 9 names what is already known to be stale (the root README's tech-stack rows). The review
   also covers what that list does not name.
7. **Tracker row 03 → `IMPLEMENTED`**, with date, actor and a one-line note carrying the test
   counts. Touch no other row.
8. **Review log entry** in the plan file: what you built, every delegated decision with its
   reason, every judgment call, any deviation with justification, and any observation a reviewer
   needs. **Three items are required by name**: how you carried the tabs relationship without
   making the landmark the panel (task 3); the resolved version of every package you installed
   and any contradiction with §3A's grounded facts; and how the strip satisfies the two frozen
   phase-02 rows in §4.
9. **The checkpoint commit**, the moment you reach `IMPLEMENTED`, under the owner's standing
   authorization — no round stops to ask. Subject line prefixed
   `CHECKPOINT (not approved): frontend 03 …`. Stage **only** this cycle's declared files plus
   the tracker and Review-log edits you actually made (standing rule 15). Stage files, not
   directories. Never `build_docs/future_implementations/`.
10. **Handoff** at `handoffs/implementer/phase-03-round-1.handoff.implementer.md`, frontmatter
    `plan`, `role: implement`, `round: 1`, `state`, `date`, `actor`. Body: the coverage map, the
    mutation ledger with its arithmetic, the baseline and closing evidence records, the delegated
    decisions, your **full write perimeter** (documents, code, dependencies, commands, commits),
    and **every file a mutation probe touched, listed separately from your own changes**.
    Any question only the owner can settle goes in a `⚠ OWNER DECISIONS REQUIRED (n)` section
    immediately after your opening summary, in charter card format — never buried in a paragraph.
    There is **no architecture graph** in this worktree; report no graph delta.

Counts are derived from the artefact they count, never typed forward (standing rule 11).

## 10. Closing message

End with the charter's owner layer, in this order: **What I did → What I found and what it means
for you → What happens next → What needs you** — decision cards verbatim, or the single line
`nothing needs you`. Plain product language, no section numbers or file paths in that layer, one
pointer line naming your handoff file.
