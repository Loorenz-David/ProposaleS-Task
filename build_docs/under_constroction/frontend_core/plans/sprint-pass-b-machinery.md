# Submission sprint — Pass B: machinery and behavioural wiring

| | |
|---|---|
| **State** | `PROMPT_READY` — execute after Pass A reaches its exit gate |
| **Actor** | one implementation session on a competent coding model; not the session that built Pass A |
| **Predecessor** | Pass A (visual / product implementation) at its exit gate, committed, stamp green |
| **Successor** | the collapsed phase 16–17 integration sprint, after the backend merges |
| **Authored** | 2026-09-07 by the Pass A planning session, from the phase 05–15 plans, the ratified intention §12A, and the approved phase 01–04 tree at `d006642` |
| **Serves** | F1 · F3 · F4 · F5 · F9 · F10 · F11 · F13 · F14 · F20 · F21 · F22 · F23 · F24 · F28 · F29 |

This plan is the whole specification for the Pass B session. It does not require reading the seventeen
historical phase plans; where a historical row still binds, it is restated here in full. The
historical plans remain source material if a detail here is ambiguous; the ratified intention
§12A wins over both.

**Process context.** The owner collapsed phases 05–15 into a submission sprint on 2026-09-07
(master plan §3B). The per-phase projection / review / approval machinery is waived. Phases 05–15
are **not** marked `APPROVED` individually. Two owner decisions taken the same day bind Pass A and
are context here: **decision 23**, the scripted fixture turn adapter carries one era-marked demo
latency constant (`TEMPORARY_FIXTURE_TURN_LATENCY_MS`) that represents a state, not progress;
**decision 24**, the design fonts are loaded through `next/font/google` in `src/app/layout.tsx`.
Neither is Pass B work; do not remove or change either.

---

## 0. Gate — check before anything else

Stop and report if any row fails. Do not "fix the gate".

| # | Check | Passes when |
|---|---|---|
| 1 | Pass A is committed | `git log` shows the Pass A exit-gate commit on `proposal-copilot-frontend`; `git status --porcelain` is empty |
| 2 | The tree is green | `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` all exit 0 on the tree you received. Run them; do not cite Pass A's stamp |
| 3 | The entry contract exists | every file in §3.1 exists at the stated path, and the exported names in §3.2–§3.5 resolve. **Where a name differs from this plan, the tree wins**: adopt the tree's name and record the difference in the sprint log (§11). Where a file is missing, stop and report |
| 4 | No Pass B file exists yet | none of the files marked `new` in §6 exists |

Then read, in this order, and nothing else before the first work package:

1. this file, in full;
2. `intention/frontend-core-intention.md` §12A.2, §12A.4, §12A.6, §12A.13, §12A.14, §12A.15, §12A.16, §12A.17, §12A.21, §12A.22 (each is one to two screens);
3. `architectural_contracts/05-client-architecture.md` §3, §5, §6, §7;
4. `architectural_contracts/11-testing-principles.md` §2, §3, §5;
5. the source files named in §3, read once each;
6. the guard tests named in §4, read once each.

---

## 1. Goal and non-goals

**Goal.** Wire the components Pass A built so the Proposal Copilot vertical slice behaves
correctly across sessions, turns, guards, clarification, edits, approval, failure, and
restoration — on the fixture-era scripted adapter, with no backend transport.

**Non-goals, and each is a stop condition if you find yourself doing it:**

- redesigning, restyling, or restructuring a Pass A component; changing its JSX, class names, or
  accessible names;
- adding a backend schema, a hand-written copy of one, a transport, a Server Action, or an HTTP call;
- adding persistence of any kind: `localStorage`, `sessionStorage`, IndexedDB, cookies, URL
  parameters, a rehydration path, a serialise / deserialise entry point on the store;
- adding a third retained-context entry, a stored status, a stored formatted money string, a
  stored "needs attention" value, or any other derived value written into state;
- parsing the human's text, simulating agent reasoning, computing money, computing approvability,
  computing provenance or a change flag;
- porting anything from `ui_design/*` "Prototype-only" lists;
- adding a route, a `useRouter`, a history entry, or a second `<main`;
- editing any file under `ui_design/` or `architectural_contracts/`.

If a component contract is genuinely insufficient for a required behaviour, make the **smallest**
prop addition, keep every existing prop and its meaning, and write the reason in the sprint log
(§11). Expect this to happen zero to three times in the whole pass.

---

## 2. Applicable contracts and the standing rules

Re-derived through `architectural_contracts/01-implementation-contract-guide.md` §4 for this
pass's concerns (client state, hooks, flows, guards, validation-error rendering, tests):

| Contract | Sections that bind here |
|---|---|
| `05-client-architecture.md` | §3 hooks expose state and intents, discriminated async unions; §5 the three kinds of client state and the store ladder; §6 errors and retry; §7 pending states, focus, predictability |
| `06-data-contracts-and-validation.md` | §8 validation errors as data with array paths |
| `11-testing-principles.md` | §2 component / hook / store layers; §3 what each proves; §5 no network, no `.env`, no large snapshots |
| `10-security-and-trust-boundaries.md` | §4 free text is data; §10 external links |
| `12-anti-patterns.md` | "Components and client", "Structure and abstraction" |
| `16-design-prototype-porting.md` | §3 state classification; §5 never ported |

**Non-negotiable rules for this pass** (each is also asserted by a test you will write or keep):

1. The browser is not commercial or workflow authority. It holds what the adapter returned and
   sends back what the adapter expects.
2. No money logic. The only money operation anywhere is `toMoneyDisplay` from Pass A.
3. The page-lifetime session id is never submitted, never compared to a generation id, never
   displayed as identity.
4. No persistence. A reload loses the workspace and the UI says so.
5. Session isolation: every field of the session record belongs to one session.
6. Retained context is exactly `workSurface` and `openedBlockContentId`.
7. Tab status is derived; the close guard never reads it; it never reads the guard.
8. Fixtures stay `*.temporary-fixture.ts` / `temporaryFixture*`.
9. Backend contracts are not invented. Where a shape is unavailable it is the era-marked
   temporary type Pass A defined.
10. The active session id is **never read on a turn's resolution path**.

---

## 3. Entry contract — what Pass A hands over

Verify each against the tree at the gate (§0 row 3). Names below are the planned names.

### 3.1 Files that must exist

```
src/features/proposal-preparation/
  types/session.ts                         SessionRuntimeRecord (extended shape, §3.3), TabStatus, WorkSurface, RetainedContext
  types/presentation.ts                    MainSurfaceState only — do not add an export (guard C5(c))
  types/temporary-turn.ts                  TemporaryProposition, TemporaryClarification, TemporaryDraftResult,
                                           TemporaryDomainResult, TemporaryWorkflowState, TemporaryEditOperation,
                                           TemporaryTurnInput, TemporaryTurnOutcome
  hooks/use-workspace-session-store.ts     the store with the spine actions (§3.4)
  hooks/use-turn-dispatch.ts               happy-path dispatch (§3.4) — you extend it
  hooks/use-thread-follow-state.ts         complete; do not change
  hooks/use-inline-edit.ts                 UI half (which leaf edits, Enter/Escape/focus) — you extend it
  client/view-models/{session-tab,thread,pill,clarification,review,preview,money,created,failure,main-surface}.ts
  client/fixtures/{session-runtime,proposition,clarification,draft-result,failures,turns}.temporary-fixture.ts
  components/workspace/{proposal-workspace,agent-surface,main-application-surface,confirm-dialog,...}.tsx
  components/agent/*, components/pills/*, components/clarification/*, components/review/*,
  components/preview/*, components/creation/*, components/session-tabs/*
e2e/proposal-flow.spec.ts                  the scripted loop, empty → created
```

### 3.2 Component contracts you wire (props are Pass A's; verify names)

| Component | Receives | Emits |
|---|---|---|
| `AgentComposer` | `value`, `isSubmitting`, `hint` | `onChange(text)`, `onSubmit()` |
| `AgentThread` | `viewModel`, `isWorking`, `workingLabel`, `suppressFollow` | `onPillIntent(intent)` |
| `TurnFailureNotice` | `viewModel: CallFailureViewModel` | `onRetry()`, `onDismiss()` |
| `ClarificationPanel` | `viewModel`, `submitState` | `onSubmit(drafts: ClarificationDraft[])`, `onDismiss()` |
| `ProposalReviewSurface` | `viewModel`, `workSurface`, `isTerminal` | `onWorkSurfaceChange(ws)`, `onDiscard()`, `onApprove()`, `onCommitEdit({ path, value })`, `onCancelEdit()`, `onReplaceBlock({ blockIndex, variationId })`, `onRemoveBlock({ blockIndex })`, `onOpenBlock(contentId)`, `onCloseBlock()`, `onAskAgent({ fieldLabel, text })`, `onRetryCreation()`, `onBackToReview()` |
| `CreatedSurface` | `viewModel` | `onDraftAnother()` |
| `ConfirmDialog` | `open`, `title`, `description`, `confirmLabel` | `onConfirm()`, `onCancel()` |
| `SessionTabStrip` | none; reads the store | none; calls `closeSessionAtGate(sessionId)` |

`ClarificationDraft` is `{ questionId: string; state: "answered" | "skipped" | "untouched"; text: string }`.
The panel emits drafts; it never builds a payload. Building the payload is yours (§6 WP4).

Pill intents the thread can emit: `{ kind: "reopen-questions" }`, `{ kind: "focus-review" }`.

### 3.3 The session record (spine shape; you extend it only where §5 says)

```ts
type TurnKind = "brief" | "answers" | "edit" | "revision" | "approval";
type InFlightTurn =
  | { turnId: string; kind: "brief" | "answers" | "revision" | "approval" }
  | { turnId: string; kind: "edit"; path: string[] };            // path: the leaf being saved, for the saving state

type ThreadEntry =
  | { entryId: string; kind: "human"; text: string; scope: string | null }
  | { entryId: string; kind: "result"; result: TemporaryDomainResult; scope: string | null };

type RetainedContext = { workSurface: WorkSurface; openedBlockContentId: string | null };

type SessionRuntimeRecord = {
  id: WorkspaceSessionId;
  title: string;
  thread: ThreadEntry[];
  latestResult: TemporaryDomainResult | null;
  workflow: TemporaryWorkflowState | null;   // { currentProposition?, clarification?, draftReference? } — held as returned
  inFlightTurn: InFlightTurn | null;
  hasStartedTurn: boolean;
  unread: number;
  composerDraft: string;
  retained: RetainedContext;
  clarificationPanel: "open" | "dismissed";
  callFailure: CallFailure | null;           // §5.2
};
```

`deriveTabStatus` reads: `inFlightTurn !== null`, `workflow?.draftReference`, `latestResult?.status`,
`workflow?.currentProposition`, `hasStartedTurn`. Its six-row precedence is unchanged from phase 04.

### 3.4 Store actions and hooks at handover

Store: `activateSession`, `createSession`, `moveSession`, `closeSession`, `setComposerDraft`,
`clearComposerDraft`, `startTurn(sessionId, turn, humanEntry?)`, `applyTurnResult(originId, turnId, outcome)`,
`setWorkSurface(sessionId, ws)`, `setOpenedBlock(sessionId, contentId | null)`,
`dismissClarificationPanel(sessionId)`, `reopenClarificationPanel(sessionId)`, `dismissCallFailure(sessionId)`.

Pass A's `applyTurnResult` implements the **matching** case only and may apply to the origin without
checking the turn id. You make it total (§6 WP1).

`useTurnDispatch` at handover: `dispatch(sessionId, input: TemporaryTurnInput)` — captures nothing
defensively, calls the adapter, calls `applyTurnResult`. You harden it (§6 WP1).

The scripted adapter, `temporaryFixtureTurnAdapter` in `client/fixtures/turns.temporary-fixture.ts`:
`run(input: TemporaryTurnInput, position: number): Promise<TemporaryTurnOutcome>` where
`TemporaryTurnOutcome = { ok: true; result; workflow } | { ok: false; error: ErrorDto }`. It returns
by turn kind and per-session position only: brief → clarification, answers → proposition v1,
edit → v2, revision → v3, approval → created. It waits `TEMPORARY_FIXTURE_TURN_LATENCY_MS`
(decision 23). It never reads the text it is given. **Tests never wait on that constant**: the adapter
accepts an injected `wait` function; tests inject a deferred promise and resolve it explicitly.

### 3.5 View models you feed

`toThreadViewModel(record)`, `toClarificationPanelViewModel(record)`, `toReviewSurfaceViewModel(record)`,
`toPreviewViewModel(proposition)`, `toCreatedViewModel(record)`, `toCallFailureViewModel(callFailure)`,
`toCreationFailureViewModel(callFailure)`, `toMainSurfaceViewModel(record)`, `toTabViewModel(record)`,
`toMoneyDisplay(money)`. Each is a pure function over the record or one of its parts. You may add a
**parameter** to an adapter (for example the per-leaf validation messages) but never a side effect.

---

## 4. Guards already in the tree that will redden on you

Every one is an approved test. Read each once. None may be weakened; two may be amended with a
recorded reason (marked ✎).

| Guard | File | What it forbids |
|---|---|---|
| C1(a) raw literals | `src/styles/theme.test.ts` | any hex colour, `text-[..px]`, `rounded-[..]`, `shadow-[..]` in any `.ts/.tsx/.css` under `src/` except `theme.css` and `globals.css`. Comments are stripped first. You add no styling, so this bites only if you touch a class name — do not |
| C5(b) registry regex | `components/workspace/workspace.test.tsx` | the substrings `Registry`, `SurfaceMap`, `surfaceFactory`, `createSurface`, `resolveSurface`, `SurfaceProvider`, `plugin`, `extension` anywhere in non-test source under `src/features`, **including comments and identifiers**. Do not write "extension" or "plugin" in a comment |
| C5(c) presentation exports | same | `types/presentation.ts` exports exactly `MainSurfaceState` with exactly `creating`, `created`, `review`, `idle` |
| C5(d) one `<main`, forbidden nouns | same | a second `<main`; a file or exported component containing `Dashboard`, `Analytics`, `Statistics`, `ProductLibrary`, `Customers`, `Settings`, `ProposalList`, `SessionHistory`, `Archive` |
| C5(a) no navigation | same | `next/navigation`, `next/link`, `useRouter`, `usePathname`, `useSearchParams`, `history.pushState`, `location.href =` under `src/app` |
| ✎ C3(i) single close path | `hooks/use-workspace-session-store.test.ts` | the strip must contain exactly one `closeSession(` and the text `closeSessionAtGate(sessionId)`. WP3 moves the store call into `use-close-guard.ts`; you amend this test to assert: the strip contains **zero** `closeSession(`, still contains `closeSessionAtGate(sessionId)`, and `use-close-guard.ts` contains exactly one `closeSession(`. Record the amendment |
| store id guard | same file | `let sessionSeq` / `let counter` forbidden in the store source; ids come from `crypto.randomUUID()` only. Turn ids and entry ids follow the same rule |
| C3(e) status-line sources | `components/agent/agent-status-line.test.tsx` | `Date.now(`, `setTimeout(`, `status.includes(`, "thread content" in `agent-status-line.tsx` or `client/view-models/session-tab.ts`. Your debounce lives in `hooks/use-status-announcement.ts`, not there |
| C4(c–e) strip source guards | `components/session-tabs/reveal-active-tab.test.ts` | `document.*` other than `activeElement`, `window.*` during render, non-allowlisted tab operations in the strip. If you add a live region to the strip, add no `document` or `window` access |
| register pin | `client/derivation-register.test.ts` | the nine-row array is pinned. You add no derived value, so no edit |
| empty `ui/` | `theme.test.ts` | any file under `src/components/ui/` |
| Vitest partition | `vitest.config.mts` | `.tsx` tests → jsdom; `.ts` tests under `src/features/**/hooks/**` → jsdom; every other `.ts` test → node with no DOM. A `.ts` test that renders must live under `hooks/` or be `.tsx` |
| ✎ store record equality | `use-workspace-session-store.test.ts` "new session" | asserts the fresh record `toEqual` a literal. Pass A already updated it for the spine shape; if you add a field in §5 you update it once more and record it |

---

## 5. The store after Pass B — closed shape

### 5.1 Fields

The record of §3.3 plus **nothing**. The three candidates you will be tempted to add, and why not:

| Candidate | Why not | Where it lives instead |
|---|---|---|
| `status`, `attention`, `readinessCount`, a formatted amount | derived; §12A.7 register rows | computed at render |
| `isEditing` / the leaf in edit mode | disposable UI mechanics | `useInlineEdit` local state; the **saving** state is `inFlightTurn.kind === "edit"` with its `path` |
| `pendingClose` / dialog state | disposable | `useCloseGuard` local state |

### 5.2 `CallFailure`

An `ErrorDto` that a call returned, kept per session so it survives a switch, cleared by the next
dispatch from the same site, by its dismiss action, or by Back to review:

```ts
type CallFailure = {
  site: { kind: "agent" } | { kind: "creation" } | { kind: "edit"; path: string[] }
      | { kind: "replacement"; blockIndex: number } | { kind: "ask"; fieldLabel: string };
  error: ErrorDto;                 // from src/lib/errors/error-dto.ts — imported, never re-declared
  retry: TemporaryTurnInput;       // the same input, re-issued verbatim on retry
};
```

Render sites, total over the ten `ErrorTreatmentKey` rows (§12A.16): `validation_error` → each leaf
whose path equals a `details` path element-wise, unmatched paths at surface level; `conflict` →
the created presentation pointing at `details` draft identity and URL when present; `approval_required`
→ the creation-failure surface; every other code → the site that issued the call. Retry is offered
iff `error.details?.retryable === true`, never for `validation_error`. An absent flag is `false`.

### 5.3 Actions — the closed set

The thirteen of §3.4 plus these four, and no other:

| Action | Rule |
|---|---|
| `applyTurnFailure(originId, turnId, failure: CallFailure)` | same attribution rule as `applyTurnResult`: matched → clear `inFlightTurn`, set `callFailure`; otherwise discarded. Never touches `unread` |
| `incrementUnread` — **not an action** | unread changes only inside `applyTurnResult` on the matched path when `originId !== activeSessionId` at application time; a standalone increment action is the mutation C7(g) forbids |
| `clearCallFailure(sessionId)` | alias of the existing `dismissCallFailure`; keep one name, the tree's |
| `resetForTests` | not added; tests use `createWorkspaceSessionState()` with `setState` as the existing tests do |

Every action is a pure state transition on one session's record. No action reads `activeSessionId`
except `activateSession`, `closeSession` (to pick the neighbour), and the unread branch inside
`applyTurnResult` — which reads it **at application time to decide the increment, never to pick
the target session**.

---

## 6. Work packages, in order

Each package: the files, the enumerated tasks, the acceptance rows you turn into tests, and the
named mutations to run and revert. Commit a checkpoint after each package,
subject `CHECKPOINT (not approved): sprint pass B WP<n> <slug>`. Run `npm test` before every
checkpoint; run the full stamp (§8.3) only at the end.

### WP1 — Turn dispatch made total

Files: `hooks/use-turn-dispatch.ts` (edit), `hooks/use-workspace-session-store.ts` (edit),
`hooks/use-turn-dispatch.test.ts` (new, jsdom), `hooks/use-workspace-session-store.test.ts` (edit).

Tasks:

1. In `dispatch`, before any `await`: capture `originSessionId = sessionId` and
   `turnId = crypto.randomUUID()` into `const`s; call `startTurn(originSessionId, { turnId, kind, path? }, humanEntry)`.
   For `brief` and `revision` the human entry is `{ kind: "human", text, scope }` and `clearComposerDraft` runs for `brief`.
2. `await adapter.run(input, position)`. On resolution call `applyTurnResult(originSessionId, turnId, outcome)`
   or `applyTurnFailure(originSessionId, turnId, { site, error, retry: input })`. **Read nothing from the
   store on this path**; the two captured constants are the only inputs.
3. Make `applyTurnResult` total over four cases: origin exists and `inFlightTurn.turnId === turnId` →
   apply; origin exists and id differs → discard; origin missing → discard; origin exists with
   `inFlightTurn === null` → discard. "Apply" means: set `inFlightTurn = null`, `hasStartedTurn = true`,
   append `{ kind: "result", result, scope }` to the thread, set `latestResult`, set `workflow` to the
   outcome's workflow as returned, set `clarificationPanel = "open"` when the result is a clarification,
   `unread += 1` iff `originId !== activeSessionId` at that moment. Never touch `retained`,
   `composerDraft`, or another session's record.
4. A second application for the same `turnId` is discarded by construction (the first cleared the slot).
5. Submit-once at the boundary: `dispatch` returns without doing anything when the target record's
   `inFlightTurn?.kind === "approval"` and the new input is `approval`. For every other kind, a dispatch
   while a turn is in flight is also a no-op (one turn per session at a time), and the composer / edit /
   approval controls are already disabled by Pass A's `isSubmitting` inputs — the no-op is the second
   mechanism, not the first.
6. The adapter's `wait` is injectable; the hook takes the adapter through a small module-level
   `setTemporaryTurnAdapterForTests` **inside the fixture module**, not through the store.

Acceptance rows (write one test per row):

- R1.1 dispatch in A, `activateSession(B)`, resolve: A's record carries the result, `A.unread === 1`,
  B's record deep-equals its pre-dispatch value, active id is still B.
- R1.2 origin id and turn id are captured before the first `await` — assert by changing the active session
  between `dispatch` and resolution and observing R1.1.
- R1.3 source check: `use-turn-dispatch.ts` contains no read of `activeSessionId` (regex `activeSessionId`
  absent from the file; the row asserts its scan had a subject: the file is non-empty).
- R1.4 superseded id → no session's state changes, no unread.
- R1.5 origin closed before resolution → the result appears in no session, including a session created after the close.
- R1.6 empty slot → discarded.
- R1.7 two `approval` dispatches within one synchronous tick produce exactly one `startTurn`.
- R1.8 a failure outcome sets `callFailure` on the origin and clears the slot; unread unchanged.
- R1.9 turn ids are UUIDs from `crypto.randomUUID()`; the store source guard for counters still passes.

Named mutations (apply, observe red, revert, log): **M1** look the session up by `activeSessionId`
at resolution → R1.1 reddens. **M2** increment unread in `startTurn` → R1.1 reddens (unread would be 1
before resolution) and WP6 R6.3 reddens.

### WP2 — Composer draft lifetime and pending rules

Files: `components/workspace/agent-surface.tsx` (edit, wiring only), `hooks/use-turn-dispatch.test.ts` (edit).

Tasks:

1. The composer's `value` is the active record's `composerDraft`; `onChange` calls
   `setComposerDraft(activeId, text)`; `onSubmit` calls `dispatch(activeId, { kind: "brief", text })`
   when `text.length > 0` — no trim, no pattern test.
2. The draft is cleared by exactly four events: sent (WP1 step 1), the user explicitly clears it
   (the composer's own clear, if Pass A built one; otherwise typing to empty), the session closes
   (record removed), the page reloads (no persistence). Nothing else clears it.
3. `isSubmitting` is `record.inFlightTurn !== null` for **this** session only.
4. While `clarificationPanel === "open"` and `latestResult?.status === "clarification"` the composer is not
   rendered and the draft is untouched.

Rows: R2.1 typing in A, switching to B, typing in B, returning to A shows A's draft. R2.2 send clears
only the sending session's draft. R2.3 a pending turn in A does not disable B's composer.
R2.4 dismissing the panel returns the composer with the draft unchanged. R2.5 the source of the
guard (WP3) and the dispatch contains no `.trim()` on the draft.

### WP3 — Close guard, discard, dialog, creation refusal

Files: `hooks/use-close-guard.ts` (new), `hooks/use-close-guard.test.ts` (new, jsdom),
`components/session-tabs/session-tab-strip.tsx` (edit: `closeSessionAtGate` delegates), `components/workspace/proposal-workspace.tsx`
(edit: mounts `ConfirmDialog` and the guard), `components/workspace/main-application-surface.tsx`
(edit: `onDiscard` → guard), `hooks/use-workspace-session-store.test.ts` (edit C3(i) as §4 states).

Tasks:

1. `useCloseGuard()` returns `{ requestClose(sessionId, afterClose?): void, dialog: { open, title, description, onConfirm, onCancel }, refusal: { sessionId, message } | null }`.
2. `requestClose` evaluates, **from the store record at call time**, in this order:
   a. if `record.inFlightTurn?.kind === "approval"` → set `refusal` with the message "This session
   cannot be closed while its draft is being created." and return; no dialog, no state removal;
   b. else compute `meaningful = hasStartedTurn || inFlightTurn !== null || thread.length > 0 || workflow?.currentProposition != null || workflow?.clarification != null || workflow?.draftReference != null || composerDraft.length > 0`;
   c. if `!meaningful` → `closeSession(sessionId)` immediately, then `afterClose?.()`;
   d. else open the dialog naming what is lost; confirm → `closeSession(sessionId)` then `afterClose?.()`; cancel → nothing.
3. An input that is unavailable evaluates to **true** (if `workflow` is present but a field is
   `undefined`, treat `undefined` as "carries nothing"; if the record itself is missing, do nothing).
4. The predicate never calls `deriveTabStatus` or reads `TabStatus`; `deriveTabStatus` never imports the guard.
5. The strip's `closeSessionAtGate(sessionId)` calls `requestClose(sessionId, focusPlan)` where
   `focusPlan` is the strip's existing `requestFocusAfterCommit` decision, executed after the close commits.
   The strip no longer calls `closeSession` itself.
6. Review's `onDiscard` calls `requestClose(activeId)`. The last-session close creates its replacement
   only inside `closeSession`, which runs only after the guard passed.
7. The refusal is rendered visibly by Pass A's affordance (tooltip / inline text on the close control) and
   announced politely through the strip's status live region (WP7); it never renders as a silent no-op.
8. Dismiss the refusal on the next pointer or key interaction or when the turn resolves.

Rows: R3.1–R3.6 one record per input satisfying **only** that input requires confirmation.
R3.7 a record satisfying none closes on first activation with no dialog. R3.8 a pasted unsent brief
renders status `empty` **and** requires confirmation. R3.9 source: guard file contains no `deriveTabStatus`
/ `TabStatus`; `session-tab.ts` contains no `useCloseGuard`. R3.10 closing a non-active session confirms
for the target, not the active. R3.11 last-session cancel leaves the strip byte-identical (same ids,
same active). R3.12 approval in flight → refusal, no dialog, no removal; after resolution the
ordinary predicate applies. R3.13 the dialog names the session title. R3.14 the predicate is evaluated
at intent time: change the record after render and before the click, the new value decides.
R3.15 C3(i) amended form passes.

Named mutations: **M3** gate the dialog on `deriveTabStatus(record) !== "empty"` → R3.8 reddens.
**M4** replace the refusal with the confirmation → R3.12 reddens.

### WP4 — Clarification submission

Files: `client/view-models/clarification.ts` (edit: add `toClarificationAnswersInput`),
`client/view-models/clarification.test.ts` (edit, node), `components/workspace/agent-surface.tsx` (edit, wiring).

Tasks:

1. `toClarificationAnswersInput(drafts: ClarificationDraft[], receivedQuestionIds: string[])` returns
   `{ answers: Array<{ questionId; answer: { kind: "answer"; text } | { kind: "skip" } }> }` with exactly
   three rows per question: `answered` → the `text` characters as typed; `skipped` → skip; `untouched` →
   **no entry**. A draft with `state: "answered"` and `text === ""` is treated as `untouched`.
   A draft whose id is not in `receivedQuestionIds` produces no entry. Output order follows
   `receivedQuestionIds`, never the drafts.
2. Skip all is the panel's concern (it marks unanswered drafts `skipped`); confirm it leaves answered
   drafts answered by testing the function over a mixed set.
3. No transformation touches `text`: no trim, no unit, no separator, no date, no locale, no number.
4. `onSubmit(drafts)` → `dispatch(activeId, { kind: "answers", answers: toClarificationAnswersInput(...) })`.
   On a matched proposition result the panel state becomes `dismissed` by the WP1 apply step (a proposition
   is not a clarification). On failure the drafts stay (they are panel-local) and the notice renders.
5. `reopen-questions` pill intent → `reopenClarificationPanel(activeId)`; `onDismiss` → `dismissClarificationPanel`.

Rows: R4.1 answered → one entry with identical characters (test with leading/trailing spaces, a comma
decimal, an ISO date, markup characters). R4.2 skipped → one skip entry. R4.3 untouched → none.
R4.4 empty draft → none. R4.5 never-visited → none. R4.6 mixed skip-all preserves answers.
R4.7 foreign id → none. R4.8 order equals received order for a distinctive input order.
R4.9 the function's source contains none of `trim(`, `toLocale`, `parseFloat`, `Number(`, `Date(`.

Named mutation: **M5** submit a skip for every empty draft → R4.3, R4.4, R4.5 redden.

### WP5 — Inline edit, replacement, ask-agent dispatch, validation at path

Files: `hooks/use-inline-edit.ts` (edit), `client/view-models/review.ts` (edit: validation input),
`client/view-models/review.test.ts` (edit, node), `components/workspace/main-application-surface.tsx` (edit, wiring),
`hooks/use-inline-edit.test.ts` (new or edit, jsdom).

Tasks:

1. `onCommitEdit({ path, value })` → `dispatch(activeId, { kind: "edit", operation: { op: "set_leaf", path, value } })`
   with `path` the **array** the view model carried for that leaf, array indices as decimal strings.
   The typed value is never written into the record or a view model.
2. `onReplaceBlock({ blockIndex, variationId })` → one operation
   `{ op: "add_block", variationId, replacesIndex: blockIndex }` **or**, if the temporary type has no
   replace form, `remove_block` then `add_block` as **two dispatches is forbidden**: use the single
   operation the temporary type defines; if none exists, add exactly one to `types/temporary-turn.ts`
   named `replace_block` and log it. `onRemoveBlock` → `{ op: "remove_block", index }`.
3. `onAskAgent({ fieldLabel, text })` → `dispatch(activeId, { kind: "revision", instruction: \`About ${fieldLabel}: ${text}\`, scope: fieldLabel })`.
   The scope is stored on the human thread entry and copied to the result entry by the apply step;
   it is not a structured parameter of the turn.
4. One edit at a time: `useInlineEdit` refuses to enter edit mode while `record.inFlightTurn?.kind === "edit"`;
   the leaf whose path equals the in-flight path is rendered saving; every other leaf's edit trigger
   is disabled; the composer's send and the approval control are disabled by the existing `isSubmitting` rule.
5. Validation: when `callFailure.site.kind === "edit"` and `error.code === "validation_error"`, pass
   `error.details.issues` (or the tree's field name) to `toReviewSurfaceViewModel`; the adapter attaches
   `validationMessage` to the leaf whose `path` equals the issue path **element-wise** (`length` equal and
   every segment `===`); issues matching no leaf go to `viewModel.surfaceErrors` with their message intact.
   No `join(".")`, no prefix match.
6. Alternatives pass through as returned: the adapter maps `block.alternatives` with `map` only, no
   `sort`, `filter`, or dedupe.
7. A terminal session (`workflow?.draftReference` present) dispatches no edit: `useInlineEdit` and the
   replacement handlers return early; Pass A already hides the affordances via `isTerminal`.

Rows: R5.1 commit produces exactly one dispatch with an array path and decimal-string indices.
R5.2 the rendered value is unchanged until the outcome; then it is the outcome's value, not the typed text.
R5.3 saving state on the in-flight leaf; other leaves not editable; another session unaffected.
R5.4 failure leaves the proposition unchanged and renders the message at the leaf.
R5.5 element-wise matching: equal path matches; last-segment-different does not; prefix does not;
a key containing a dot matches correctly; unmatched renders at surface level with its message.
R5.6 alternatives sequence-equal to the fixture, including a duplicate and a lower-scored first entry.
R5.7 ask-agent dispatches a revision whose instruction contains the field label; the reply entry carries the scope.
R5.8 terminal session: no dispatch from commit or replace.

Named mutations: **M6** write the typed value into the view model on commit → R5.2 reddens.
**M7** compare paths after `join(".")` → R5.5 dotted-key row reddens. **M8** sort alternatives by
score → R5.6 reddens.

### WP6 — Approval, creating, created, recovered, failure routing

Files: `hooks/use-turn-dispatch.ts` (edit), `client/view-models/failure.ts` (edit if needed),
`components/workspace/main-application-surface.tsx` (edit, wiring), `hooks/use-turn-dispatch.test.ts` (edit),
`client/view-models/failure.test.ts` (edit, node).

Tasks:

1. `onApprove` → `dispatch(activeId, { kind: "approval" })`. The input the adapter receives carries the
   record's `workflow` and `workflow.currentProposition` **as held**, plus the acknowledgment pair
   `{ statementId, wording }` imported from the one module Pass A exported it from. The review view
   model is never an input.
2. Creating is `inFlightTurn.kind === "approval"`; `toMainSurfaceViewModel` already presents it.
3. On a `created` / `recovered` outcome the apply step (WP1) sets `workflow.draftReference` from the
   outcome's workflow; `toCreatedViewModel` renders it. Nothing here marks a session terminal on
   dispatch, on optimistic success, or on a timeout — there is no timeout.
4. On a failure outcome: `applyTurnFailure` with `site: { kind: "creation" }`; the proposition is
   untouched; status re-derives to `ready`; the review state renders `CreationFailureSurface` while
   `callFailure.site.kind === "creation"`; `onBackToReview` → `dismissCallFailure`; `onRetryCreation` →
   `dispatch(activeId, callFailure.retry)`.
5. Retry rule in `toCallFailureViewModel` / `toCreationFailureViewModel`: `canRetry = error.details?.retryable === true && error.code !== "validation_error"`.
   The message is `error.message` as given; the generic fallback string is used only when the code is
   unknown **and** the message is empty or absent. `details` is read only through the keys the
   treatment map names.
6. `conflict` on approval: the main surface presents the created presentation for the existing draft
   using `details.proposalUuid` / `details.editorUrl` when present; otherwise the failure surface with the message.
7. `approval_required`: the failure surface; Back to review first.
8. Run `failed` domain results (a successful outcome whose `result.status === "failed"`) go through
   WP1's apply step into the **thread** as a failure turn; they never set `callFailure`. An `ErrorDto`
   never becomes a thread entry. Two channels, never merged.
9. `onDraftAnother` → `createSession()`.
10. The departure guard: `hooks/use-departure-guard.ts` (new) registers `beforeunload` **iff** any open
    session has `inFlightTurn?.kind === "approval"`; it subscribes to the store, reads every record,
    never the active one alone, never the close predicate. Mount it in `ProposalWorkspace`.

Rows: R6.1 the approval input's proposition is `toEqual` the record's `workflow.currentProposition`
and is not derived from `toReviewSurfaceViewModel`. R6.2 the wording rendered and the id submitted come
from one imported pair. R6.3 two activations in one tick → one `startTurn`. R6.4 no draft reference is
set on dispatch or before the outcome. R6.5 failure leaves `workflow.currentProposition` `toEqual` the
pre-approval value, status `ready`, failure surface rendered with the DTO message, Back to review
first in tab order (Pass A's test may already assert order; keep it). R6.6 retry re-dispatches an input
`toEqual` the original. R6.7 per code: retry offered iff flag true and code not validation, ten rows
including unknown with and without message. R6.8 `failed` result → thread turn, proposition intact,
no `callFailure`. R6.9 an `ErrorDto` → `callFailure`, no thread entry. R6.10 departure: no session
creating → no handler; active creating → handler; **non-active** creating → handler; terminal → none;
composer draft / other in-flight kinds → none.

Named mutations: **M9** build the approval proposition from the review view model → R6.1 reddens.
**M10** offer retry whenever `details` is present → R6.7's validation and non-retryable rows redden.
**M11** clear the proposition on failed creation → R6.5 reddens. **M12** test only the active
session for departure → R6.10 non-active row reddens.

### WP7 — Unread, attention, status announcement

Files: `hooks/use-status-announcement.ts` (new), `hooks/use-status-announcement.test.ts` (new, jsdom),
`components/session-tabs/session-tab-strip.tsx` (edit: second live region only), `hooks/use-workspace-session-store.test.ts` (edit).

Tasks:

1. `activateSession` sets the activated record's `unread` to `0`. No other action changes unread
   (WP1 apply is the only increment).
2. Attention is computed in `toTabViewModel`: `unreadText = unread > 0 && !isActive ? \`${unread} unread\` : null`
   — pass `isActive` as a parameter; do not store the conjunction.
3. `useStatusAnnouncement(records, activeId)` watches each session's derived status; when a session's
   status changes it schedules one polite announcement after `STATUS_ANNOUNCEMENT_DEBOUNCE_MS`
   (declare the constant in `components/session-tabs/session-tabs-constants.ts`, value 800); a further
   change inside the window replaces the pending text, so `working → ready` announces once with
   "ready". It writes into a **new** `data-session-status-announcement` live region beside the existing
   reorder region; it never writes into `data-session-reorder-announcement`. It also carries WP3's refusal message.
4. A result applied to a non-active session fires no announcement in the thread's log region (the thread
   renders the active session only, so nothing is appended there) and moves no focus.

Rows: R7.1 applied while active → unread unchanged. R7.2 activation → 0. R7.3 dispatch → unchanged.
R7.4 reorder → unchanged. R7.5 no decrement path other than activation — a plain check over the store's
action names asserting that only `activateSession` and `applyTurnResult` mention `unread`, asserting
the scan had a subject. R7.6 badge text present iff `unread > 0 && !active`, four rows over the two-by-two.
R7.7 `working → ready` inside the window announces exactly once; a pending reorder announcement is not
replaced. R7.8 a result applied to a background session: `document.activeElement` unchanged and the
active session's log region receives no node.

Named mutation: **M13** store `attention` on the record and read it in the strip → R7.6 reddens.

### WP8 — Retained context rules and restoration

Files: `client/view-models/main-surface.ts` (edit), `client/view-models/main-surface.test.ts` (edit, node),
`hooks/use-workspace-session-store.test.ts` (edit), `components/workspace/workspace.test.tsx` (edit: add rows, do not touch C5).

Tasks:

1. `setWorkSurface` writes only the named session's `retained.workSurface` and only from
   `onWorkSurfaceChange`; `setOpenedBlock` writes only `retained.openedBlockContentId` from `onOpenBlock`
   / `onCloseBlock`. Reject a value outside `"fields" | "preview"` (type plus a runtime guard that ignores it).
2. `applyTurnResult` and `applyTurnFailure` never read or write `retained` — assert by `toBe` reference
   equality of `retained` before and after an application, for an active and a non-active session.
3. `toMainSurfaceViewModel(record)` first-match-wins: approval in flight → `creating`; `draftReference` →
   `created`; `currentProposition` → `review` with `workSurface = retained.workSurface` and
   `openedBlock` = the block whose `contentId === retained.openedBlockContentId` if the current
   proposition carries it, else `null`; otherwise `idle`. The stored entry is never cleared or rewritten
   by resolution.
4. Restoration is a render: activation writes nothing but `activeSessionId` and `unread`; no focus move
   beyond the tab; no announcement; no URL or history change.
5. The reference-not-value test: render the review surface from a record whose `workflow` is replaced by
   `null` and whose `retained.openedBlockContentId` is set → the idle state renders and no proposition
   string from the fixture appears in the document.

Rows: R8.1 four rows of the precedence from records satisfying only that row. R8.2 the six overlaps of
§12A.22: approval in flight + draft → creating; draft + proposition → created; proposition + latest
clarification → review with the proposition; proposition + latest `failed` → review intact; no
proposition + clarification or failed → idle (two rows); a non-approval turn in flight → rows 2–4 decide.
R8.3 entry resolves to its value when present; to `"fields"` / `null` when the state has no place; to
the default when the block was removed by a later version, **and the stored value is unchanged**; a later
proposition carrying the block resolves it again. R8.4 toggle in A leaves B's entry unchanged.
R8.5 result application leaves `retained` reference-identical, active and non-active. R8.6 the
reference-not-value row. R8.7 the F1 sequence: preview + open block in A; fields in B; return to A →
preview and the block open; return to B → fields; no session lost its thread, result, or workflow.
R8.8 activation moves focus to the tab only, for each of the four states.

Named mutations: **M14** write `retained` from the apply path → R8.5 reddens. **M15** swap precedence
rows 1 and 2 → R8.2 first overlap reddens.

### WP9 — Playwright extension and browser verification

Files: `e2e/proposal-flow.spec.ts` (edit), the adapter fixture (edit: test-controllable outcome), no product change.

Add, using the scripted adapter's real behaviour and `reducedMotion` where stated:

- P9.1 two sessions: dispatch in A, switch to B during the latency window, observe B's thread
  untouched, A's tab shows "1 unread" in its accessible name, switch back → the result is in A's thread,
  unread text gone.
- P9.2 close a session with a typed draft → the dialog; cancel → nothing removed; confirm → removed,
  focus on the neighbour.
- P9.3 close during creating → refusal text visible, session still present.
- P9.4 A on Client preview with a block open, B on Fields, A → B → A restores preview and the open block.
- P9.5 `page.reload()` → one empty session, nothing restored, the empty state's copy visible.
- P9.6 the full loop once more end to end after all wiring, with `reducedMotion: "reduce"`.

Each test sets its viewport explicitly if it depends on width.

### WP10 — Fixture-era audit checklist and closeout

No new product code. Produce the checklist as the last section of the sprint log with a yes/no per row
and the command or file that proves it:

1. One adapter per surface: thread and pills, clarification, review, preview, created, failure, tab — list each `to<Name>ViewModel` and its single call site.
2. Every component prop type is hand-written; no prop is typed as a `Temporary*` type or as a fixture's inferred type (`grep -rn "Temporary" src/features/proposal-preparation/components` returns only view-model imports, ideally nothing).
3. No `as` cast at a boundary in `components/` or `client/view-models/` (`grep -rn " as " ...` reviewed line by line; type-only `as const` is fine).
4. Every fixture module matches `*.temporary-fixture.ts` and every export starts with `temporaryFixture`.
5. No fixture contains a real person, company, or customer name.
6. No client module imports `@/lib/proposales`, `@/lib/ai`, `@/lib/agent`, `@/lib/env/server`, or any `server/` path (`npm run lint` is the instrument; additionally grep).
7. No `localStorage`, `sessionStorage`, `indexedDB`, `document.cookie`, `URLSearchParams`, `history.` under `src/features` (grep; the scan has a subject).
8. The store exports no `serialize`, `hydrate`, `persist`, `toJSON`, `fromJSON`.
9. Documentation impact (contract 14 §8): the root `README.md` status paragraph and the feature's
   absence of a `README.md` — the feature README is still written at the integration sprint's closeout,
   not now; state that explicitly. Patch the root README only if a sentence it carries became false.

---

## 7. Session isolation checklist (verify before the exit gate)

| Concern | Where it lives | Proof |
|---|---|---|
| active session | `activeSessionId`, read on render and dispatch only | R1.3 |
| composer draft | `record.composerDraft` | R2.1–R2.4 |
| unread | `record.unread` | R7.1–R7.6 |
| in-flight turn | `record.inFlightTurn` | R1.1, R2.3, R5.3 |
| latest result and workflow | `record.latestResult`, `record.workflow` | R1.1, R8.7 |
| retained context | `record.retained` | R8.4, R8.5 |
| call failure | `record.callFailure` | R6.5, R6.9 |
| panel open state | `record.clarificationPanel` | R2.4, R4.4 |
| disposable mechanics | component state keyed by session id | reset on switch is allowed; R8.7's "disposable may reset" |
| switching | `activateSession` | R7.2, R8.8 |
| closing | `closeSession` via the guard | R3.x, R1.5 |

---

## 8. Tests, runner placement, and commands

### 8.1 Placement

| Test | File suffix | Location | Project |
|---|---|---|---|
| store transitions, dispatch attribution, guards | `.test.ts` | `hooks/` | jsdom (the partition claims `hooks/**/*.test.ts`) |
| pure adapters, submission map, precedence, failure map | `.test.ts` | `client/view-models/` | node |
| wiring through components | `.test.tsx` | beside the component | jsdom |
| browser behaviour | `.spec.ts` | `e2e/` | Playwright |

Use `createWorkspaceSessionState()` with `useWorkspaceSessionStore.setState(...)` in `beforeEach`, as the
existing store tests do. Never reach into `window` or `document` from a node-project test.

### 8.2 What not to write

No DOM snapshots. No test that passes with the code deleted (run each new test once against a
stubbed-out implementation while writing it, or run the named mutation). No test of Pass A's visual
output. No per-code retry table — one rule, one loop over the ten codes.

### 8.3 Commands

| Scope | Command |
|---|---|
| one test | `npx vitest run <path> -t "<name>"` |
| feature | `npx vitest run src/features/proposal-preparation` |
| stamp | `npm run typecheck && npm run lint && npm test && npm run test:e2e && npm run build` |

Take the stamp on a **fresh** dev server: if port 3000 is held by an orphaned `next-server`, a red
focus-order row is not evidence (master plan §11.1, follow-up 18). Free the port and re-run.

---

## 9. Exit gate — Pass B is complete when every row holds

1. Every acceptance row R1.1–R8.8 has a green test; every named mutation M1–M15 was applied, observed red, reverted, and logged with the test name that reddened.
2. Pass A's tests are unedited except the amendments listed in the sprint log with reasons.
3. The approved guards of §4 are green and untouched except the two marked ✎.
4. The full stamp (§8.3) is green on a clean tree, identified by commit SHA in the sprint log.
5. §7's checklist and WP10's audit are filled in.
6. No file under `ui_design/`, `architectural_contracts/`, `src/lib/`, or `src/app/` changed, except `src/app/layout.tsx` if it needed the departure-guard mount (it should not; mount in `ProposalWorkspace`).
7. The sprint log (§11) lists: files created, files modified, tests amended with reasons, prop additions with reasons, dependencies added (expected: none), open items handed to the integration sprint.
8. Final commit, subject `sprint pass B: machinery complete; fixture-era gate`. Do not merge, do not push unless the owner says so.

---

## 10. Do not

- Do not start Pass B on a tree where §0 fails.
- Do not "improve" a component while wiring it.
- Do not add a hook without a consumer named in §6.
- Do not add a store field outside §3.3 and §5.
- Do not read `activeSessionId` on a resolution path, ever.
- Do not add latency, timers, or intervals anywhere except the one constant Pass A already owns.
- Do not write the feature README; it belongs to the integration sprint's closeout.
- Do not mark any phase 05–15 `APPROVED`; the tracker rows read `SUBMISSION_SPRINT`.
- Do not ask the owner a question this plan already answers; where it is silent, choose the option that keeps the browser less authoritative and log the choice.

---

## 11. Sprint log

### Gate and actual-tree authority

- §0 passed on the received Pass A commit `b6a477ec69a5faab1eda4dc7f47e438088743787`.
  Typecheck, lint, Vitest (`279/279`) and production build were re-run on this tree and passed;
  all §3 entry files exist and all Pass B `new` files were absent. The typecheck/build commands
  rewrite generated `next-env.d.ts` (and typecheck rewrites `tsconfig.tsbuildinfo`), so those
  generated-only changes were restored after verification; the source tree was clean at the gate.
- Actual Pass A names/contracts adopted: the existing fixture adapter exports
  `temporaryFixtureTurnAdapter` and `setTemporaryTurnAdapterForTests`; its adapter accepts an
  injected `wait` callback as a third parameter. `TemporaryEditOperation` already has the
  planned single `replace_block` operation. The store's Pass A `applyTurnResult` has the
  plan-permitted fourth `retryInput` parameter and remains backward-compatible for existing
  failure tests; Pass B additionally exposes `applyTurnFailure` for dispatch resolution.
- The repository uses the root `vitest.config.mts` for the planned runner partition; there is no
  feature-local Vitest config.

### WP1 checkpoint

- Implemented total, origin-captured dispatch; one in-flight turn per session; UUID turn ids;
  matching/superseded/orphan/empty-slot result handling; background unread increment at apply time;
  explicit failure attribution; and injectable fixture adapter tests.
- Acceptance evidence: `use-turn-dispatch.test.ts` covers R1.1–R1.9 (with R1.1/R1.2 combined in
  one test and R1.4/R1.6 combined in one test); existing store tests remain green.
- Mutation ledger: M1 at the `applyTurnResult` call site in `use-turn-dispatch.ts` used the active
  id and reddened R1.1 plus R1.3; reverted. M2 incremented `unread` in `startTurn` and reddened
  R1.1 (observed value `2` instead of `1`); reverted. Mutation files were
  `use-turn-dispatch.ts` and `use-workspace-session-store.ts`, applied and reverted before commit.
- Checkpoint stamp: `npm test` — 53 files / 286 tests green.

### WP2 checkpoint

- Wired the composer to the active session's exact `composerDraft`, with no trimming or pattern
  gate; a non-empty submit dispatches the fixture `brief` input and only the sending session's
  draft is cleared. The composer is absent while an open clarification panel owns the surface, and
  dismissing the panel leaves the draft intact.
- Acceptance evidence: R2.1–R2.5 are covered in `use-turn-dispatch.test.ts`; the full suite is
  green.
- No Pass A visual contract or prop was extended. No mutation was declared for WP2.
- Checkpoint stamp: `npm test` — 53 files / 289 tests green.

### WP3 checkpoint

- Added `useCloseGuard` as the single target-time close/discard authority. Meaningful work,
  whitespace-only drafts, target-session isolation, last-session replacement, confirmation title,
  creation refusal, dismissal on interaction/resolution, and post-close focus callbacks are wired
  through the existing dialog and tab affordances. The review discard now delegates to the same
  guard.
- Acceptance evidence: `use-close-guard.test.ts` covers R3.1–R3.15; the C3(i) Pass A guard was
  amended to assert zero direct strip removals and one guarded removal call, as explicitly
  authorized by §4.
- Mutation ledger: M3 changed the close branch to gate on derived tab status and reddened R3.7
  (an actually empty session opened the dialog); reverted. M4 changed creation refusal into a
  confirmation and reddened R3.12; reverted. Mutation file was `use-close-guard.ts`, applied
  and reverted before commit.
- Pass A component contracts extended only with optional machinery props on `AgentSurface`,
  `SessionTabStrip`, and `MainApplicationSurface`, because one shared guard instance must
  serve tab close and review discard while `ProposalWorkspace` owns the dialog.
- Checkpoint stamp: `npm test` — 54 files / 304 tests green.
