# Submission sprint — Pass A: visual / product implementation

| | |
|---|---|
| **State** | `PROMPT_READY` — authorized by the owner on 2026-09-07; execute on the approved phase-04 tree |
| **Actor** | one implementation session; the strongest visual / product model available |
| **Predecessor** | phase 04 `APPROVED` at `d006642` (or a later commit that only adds pipeline documentation) |
| **Successor** | Pass B, `plans/sprint-pass-b-machinery.md`, run by a separate session |
| **Authored** | 2026-09-07 by the sprint planning session, from the phase 05–15 plans, the ratified intention §12A, `ui_design/01–10`, and the approved tree |
| **Serves** | F2 · F6 · F16 · F17 · F18 · F19 · F25 · F26 · F27 · the presentation half of F1, F5, F13, F23, F24, F29 |
| **Read first** | `plans/sprint-context.md` (ten minutes), then this file |

This plan is the whole specification for the Pass A session. **Every name it fixes — file, component,
prop, type, adapter, action, fixture — is the name Pass B was written against.** Where you must deviate,
deviate minimally and record it in the sprint log (§13) so the Pass B plan's §3 can be re-synced.

---

## 0. Gate — check before anything else

| # | Check | Passes when |
|---|---|---|
| 1 | Tree identity | `git status --porcelain` empty; `git log -1` is `d006642` or a later commit whose diff touches only `build_docs/**` |
| 2 | Tree is green | `npm run typecheck && npm run lint && npm test` exit 0. Run them; do not cite the master plan's stamp |
| 3 | Nothing from this plan exists yet | none of §8's `new` files exists |
| 4 | Port 3000 is free | no orphaned `next-server` holds it (master plan §11.3 follow-up 18); the Playwright stamp needs a fresh server |

Then read, in this order:

1. `plans/sprint-context.md` — the catch-up brief;
2. this file, in full;
3. `ui_design/10-design-integration-guide.md` §1, §3, §5, §7; then `03`, `05`, `06`, `07`, `08`, `09` in full (they are short; `01` §1 and §5 for values); `02` and `04` only if you touch the shell or strip;
4. `intention/frontend-core-intention.md` §5, §8.1, §8.6, and §12A.7, §12A.9, §12A.10, §12A.11, §12A.12, §12A.17, §12A.18, §12A.20, §12A.22;
5. `architectural_contracts/05-client-architecture.md` §2, §7, §8, §9; `15-ui-styling-and-component-system.md` §1–§3; `16-design-prototype-porting.md` §1, §3, §5; `11-testing-principles.md` §2–§3, §5;
6. the seven existing components, the store, `session-tab.ts`, `theme.css`, `globals.css`, and the guard tests named in §4 — once each.

---

## 1. Goal, and the split with Pass B

**Goal.** Build the polished presentation of the Proposal Copilot vertical slice — every surface and
every state of design 03, 05, 06, 07, 08, 09 — as components with stable contracts, fed by view models,
demonstrable in a browser on era-marked fixtures, keyboard-operable and announced correctly. Leave the
behavioural wiring (attribution edge cases, guards, submission maps, retry, restoration rules) to Pass B.

**The one piece of machinery you do build: the spine.** Without it nothing but the empty state is
visible in a browser. The spine is exactly: the real session-record shape (§6.1), the temporary turn
types (§5), the scripted fixture adapter (§7.5), the happy-path `startTurn` / `applyTurnResult`
dispatch, the composer draft slot, the two retained-context slots as plain fields, and the four-row
main-surface derivation. Nothing more. Pass B's WP1–WP8 make each of these correct under adversity.

**What you do not build**, because Pass B does: the four resolution cases of attribution; unread
increments; the close guard's predicate and dialog wiring; the departure guard; the clarification
submission map; edit / replacement / ask dispatch and validation-path matching; approval submit-once
and failure routing; retained-entry resolution rules; announcements and their debounce; the fixture-era
audit. You build the components those behaviours will drive, with the props §3 fixes.

---

## 2. Rules that bind every line of this pass

1. The browser is not commercial authority. Components render values the view model carries.
2. **No money logic.** The only money operation is `toMoneyDisplay` (§7.3). No `+ - * /`, no
   `toFixed`, no `parseFloat`, no summing, no comparing amounts, no defaulting to `0`.
3. The page-lifetime session id is never displayed as identity, never submitted, never compared to a generation id.
4. **No persistence.** No `localStorage`, `sessionStorage`, IndexedDB, cookies, URL parameters.
5. Session isolation: every record field belongs to one session.
6. Retained context is exactly `workSurface` and `openedBlockContentId`.
7. Tab status is derived; nothing stores it.
8. Fixtures are `*.temporary-fixture.ts` exporting `temporaryFixture*`; temporary types are prefixed `Temporary`.
9. Backend contracts are not invented: you write the **temporary** types of §5, deliberately narrower
   than the backend schemas, and you import `Money` and `Path` from `src/lib/values` and `ErrorDto` from `src/lib/errors/error-dto.ts`.
10. **No prototype intelligence.** No regex over the human's text, no fabricated progress steps, no
    fake reasoning, no seeded commercial truth. The scripted adapter returns states by turn kind and position only.
11. Accessibility is part of implementing each element (§10).
12. Visual values come from `theme.css` only (§4 guard C1(a)). The light-preview values are added there (§7.4).
13. Radix Tabs (exists), Radix Popover for Ask Agent (you add it), native `<dialog>` for confirmation,
    native radio group for Fields / Client preview, native elements otherwise. No other UI framework.
14. Components never import a fixture and never take a `Temporary*` type as a prop. They take view models.
15. Every rendered string from the human, the agent, or the catalog is text. No markup path, no Markdown, no `dangerouslySetInnerHTML`.

**Owner decisions taken for this sprint (2026-09-07), binding here:**

- **Decision 23 — demo latency.** The scripted adapter waits `TEMPORARY_FIXTURE_TURN_LATENCY_MS` (700 ms)
  before resolving, so a human can see the working state. It is one exported constant in
  `turns.temporary-fixture.ts`, era-marked, deleted at integration. It represents a state, not
  progress: no steps, no label changes, no second timer. Tests never wait on it: the adapter takes an
  injectable `wait` and tests inject a deferred promise.
- **Decision 24 — fonts.** Load Plus Jakarta Sans (400, 500, 600, 700, 800) and IBM Plex Mono (400, 500)
  through `next/font/google` in `src/app/layout.tsx` with `variable: "--font-sans-loaded"` and
  `variable: "--font-mono-loaded"`, put both class names on `<html>`, and change `theme.css` to
  `--font-sans: var(--font-sans-loaded), system-ui, sans-serif;` and
  `--font-mono: var(--font-mono-loaded), ui-monospace, SFMono-Regular, monospace;`. This declares no new
  theme name (the allowlist scans declarations `--name:`; a `var()` reference is not a declaration).
  `next build` fetches the fonts at build time; CI and Vercel have network. Verify in the browser that
  the tab title renders in Plus Jakarta Sans.

---

## 3. Component contracts — the names Pass B depends on

All under `src/features/proposal-preparation/components/`. Props are hand-written UI types exported
beside the component as `<Name>Props`. "Container" means it reads the store; every other component is
props-only.

### 3.1 Containers (exactly three, plus the strip that already exists)

| Component | File | Reads | Calls |
|---|---|---|---|
| `AgentSurface` (modified) | `workspace/agent-surface.tsx` | the active record; `sessionIds.length` | `setComposerDraft`, `startTurn` via `useTurnDispatch`, `dismissClarificationPanel`, `reopenClarificationPanel`, `dismissCallFailure` |
| `MainApplicationSurface` (modified; keeps the only `<main`) | `workspace/main-application-surface.tsx` | the active record → `toMainSurfaceViewModel` | `setWorkSurface`, `setOpenedBlock`, `dismissCallFailure`, `useTurnDispatch` for edit / replace / ask / approve, `createSession` for Draft another |
| `ProposalWorkspace` (modified) | `workspace/proposal-workspace.tsx` | unchanged | drops the hardcoded `state="idle"` prop; mounts `ConfirmDialog` host later in Pass B |
| `SessionTabStrip` (small edit) | `session-tabs/session-tab-strip.tsx` | adds `record.unread` to the tab's accessible name via `toTabViewModel` | unchanged |

Containers hold no business logic: they select, adapt, and pass callbacks. Pass B replaces the bodies
of those callbacks; keep each callback a one-line call so the replacement is local.

### 3.2 Leaf components and their props (TypeScript, verbatim intent)

```ts
// agent/
export type AgentHeaderProps = { sessionCount: number };
export type AgentThreadProps = {
  viewModel: ThreadViewModel;
  isWorking: boolean;              // this session's own in-flight turn only
  workingLabel: string;            // from the in-flight turn kind: "Drafting proposal" | "Reading your answers" | "Saving your edit" | "Revising draft" | "Creating in Proposales"
  suppressFollow: boolean;         // true while focus is inside an expanded pill or the clarification panel
  onPillIntent: (intent: PillIntent) => void;
};
export type AgentThreadTurnProps = { turn: ThreadTurnViewModel; onPillIntent: (intent: PillIntent) => void };
export type WorkingIndicatorProps = { label: string };
export type AgentComposerProps = {
  value: string;
  isSubmitting: boolean;
  hint: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
};
export type TurnFailureNoticeProps = { viewModel: CallFailureViewModel; onRetry: () => void; onDismiss: () => void };

// pills/
export type PillIntent = { kind: "reopen-questions" } | { kind: "focus-review" };
export type InteractionPillProps = { viewModel: PillViewModel; onIntent: (intent: PillIntent) => void };

// clarification/
export type ClarificationDraft = { questionId: string; state: "answered" | "skipped" | "untouched"; text: string };
export type ClarificationPanelProps = {
  viewModel: ClarificationPanelViewModel;
  submitState: { status: "idle" } | { status: "submitting" } | { status: "failed"; message: string };
  onSubmit: (drafts: ClarificationDraft[]) => void;   // the panel emits drafts; it never builds a payload
  onDismiss: () => void;
};

// review/
export type ProposalReviewSurfaceProps = {
  viewModel: ReviewSurfaceViewModel;
  workSurface: WorkSurface;
  isTerminal: boolean;
  onWorkSurfaceChange: (workSurface: WorkSurface) => void;
  onDiscard: () => void;
  onApprove: () => void;
  onCommitEdit: (edit: { path: string[]; value: string | number | boolean }) => void;
  onCancelEdit: () => void;
  onReplaceBlock: (replacement: { blockIndex: number; variationId: string }) => void;
  onRemoveBlock: (removal: { blockIndex: number }) => void;
  onOpenBlock: (contentId: string) => void;
  onCloseBlock: () => void;
  onAskAgent: (ask: { fieldLabel: string; text: string }) => void;
  onRetryCreation: () => void;
  onBackToReview: () => void;
};
export type WorkSurfaceToggleProps = { value: WorkSurface; onChange: (value: WorkSurface) => void };
export type InlineEditableValueProps = {
  leaf: EditableLeafViewModel;
  isEditing: boolean;
  canEdit: boolean;
  onStartEdit: () => void;
  onCommit: (value: string) => void;
  onCancel: () => void;
};
export type AskAgentPopoverProps = {
  fieldLabel: string;
  state: { status: "idle" } | { status: "submitting" } | { status: "failed"; message: string };
  onSubmit: (text: string) => void;
};
export type ApprovalActionProps = {
  acknowledgment: { statementId: string; wording: string };   // from client/view-models/created.ts, one exported pair
  unresolvedSummary: string | null;                            // e.g. "2 open, 1 deferred"; null when none
  isPending: boolean;
  onApprove: () => void;
};
export type BlockReplacementSurfaceProps = {
  alternatives: AlternativeViewModel[];
  isSubmitting: boolean;
  onSelect: (variationId: string) => void;
  onClose: () => void;
};

// preview/
export type ClientPreviewSurfaceProps = { viewModel: PreviewViewModel };

// creation/
export type CreatingSurfaceProps = { label: string };
export type CreatedSurfaceProps = { viewModel: CreatedViewModel; onDraftAnother: () => void };
export type CreationFailureSurfaceProps = { viewModel: CreationFailureViewModel; onBackToReview: () => void; onRetry: () => void };

// workspace/
export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};
```

Files, one component per file, kebab-case: `agent/agent-header.tsx`, `agent/agent-thread.tsx`,
`agent/agent-thread-turn.tsx`, `agent/working-indicator.tsx`, `agent/agent-empty-state.tsx`,
`agent/agent-composer.tsx`, `agent/turn-failure-notice.tsx`, `pills/interaction-pill.tsx`,
`pills/thought-payload.tsx`, `pills/ask-payload.tsx`, `clarification/clarification-panel.tsx`,
`clarification/clarification-question.tsx`, `clarification/clarification-step-progress.tsx`,
`review/proposal-review-surface.tsx`, `review/review-header.tsx`, `review/work-surface-toggle.tsx`,
`review/readiness-line.tsx`, `review/review-fields-card.tsx`, `review/review-field-row.tsx`,
`review/inline-editable-value.tsx`, `review/provenance-flag.tsx`, `review/review-blocks-card.tsx`,
`review/review-block-row.tsx`, `review/block-replacement-surface.tsx`, `review/review-notes-card.tsx`,
`review/ask-agent-popover.tsx`, `review/approval-action.tsx`, `preview/client-preview-surface.tsx`,
`creation/creating-surface.tsx`, `creation/created-surface.tsx`, `creation/applied-pricing.tsx`,
`creation/creation-failure-surface.tsx`, `workspace/confirm-dialog.tsx`.

---

## 4. Guards already in the tree — read each once, then respect it

| Guard | File | What it forbids |
|---|---|---|
| C1(a) raw literals | `src/styles/theme.test.ts` | any hex colour, `text-[..px]`, `rounded-[..]`, `shadow-[..]` in any `.ts/.tsx/.css` under `src/` except `theme.css` and `globals.css`. Use `text-13`, `rounded-4xl`, `shadow-panel`, `bg-[var(--color-bg-card)]`. Layout px like `px-[18px]`, `max-w-[840px]`, `min-h-[170px]` are allowed |
| C1(b) outline | same | `outline-none` / `outline:0` outside one allowlisted site. Never remove the focus ring |
| C7(b) closed ramp | same | any custom property declared in `theme.css` whose name is not in `DESIGN_01_RAMP_NAMES`. §7.4 adds eight names to both in the same change |
| C5(b) registry regex | `components/workspace/workspace.test.tsx` | the substrings `Registry`, `SurfaceMap`, `surfaceFactory`, `createSurface`, `resolveSurface`, `SurfaceProvider`, `plugin`, `extension` **anywhere** in non-test source under `src/features`, comments included. Do not write the word "extension" in a comment |
| C5(c) presentation exports | same | `types/presentation.ts` exports exactly `MainSurfaceState`. Put every new type elsewhere |
| C5(d) one `<main`; nouns | same | a second `<main` under `src/app` or `src/features`; a file or exported component containing `Dashboard`, `Analytics`, `Statistics`, `ProductLibrary`, `Customers`, `Settings`, `ProposalList`, `SessionHistory`, `Archive` |
| C5(a) no navigation | same | `next/link`, `next/navigation`, `useRouter`, `history.pushState`, `location.href =` under `src/app` |
| C3(i) single close path | `hooks/use-workspace-session-store.test.ts` | the strip keeps exactly one `closeSession(` and `closeSessionAtGate(sessionId)`. You do not touch the close path |
| store id guard | same | `let sessionSeq` / `let counter` in the store. Ids from `crypto.randomUUID()` only, including turn and entry ids |
| record equality ✎ | same, "new session" | asserts the fresh record `toEqual` a literal. §6.1 changes the shape; update this literal once and record it |
| session-tab tests ✎ | `client/view-models/session-tab.test.ts`, `agent-status-line.test.tsx`, `session-tab-strip.test.tsx` | build records through `temporaryFixtureSessionRuntimeRecord(overrides)`. Update the fixture factory to the new shape and the overrides those tests pass (e.g. `isTurnInFlight: true` → `inFlightTurn: {...}`); assertions themselves stay |
| C3(e) status-line sources | `agent-status-line.test.tsx` | `Date.now(`, `setTimeout(`, `status.includes(` in `agent-status-line.tsx` or `session-tab.ts` |
| C4(c–e) strip source | `reveal-active-tab.test.ts` | `document.*` other than `activeElement`, `window.*` at render, in the strip |
| register pin | `client/derivation-register.test.ts` | the nine-row array is pinned. Add no row |
| empty `ui/` | `theme.test.ts` | any file under `src/components/ui/` |
| Vitest partition | `vitest.config.mts` | `.tsx` tests → jsdom; `.ts` tests under `hooks/` → jsdom; other `.ts` tests → node. View-model tests are node and must not render |
| C6 idle honesty | `workspace.test.tsx` | the idle surface has no navigation, no live region, no focus move. Leave `idle/proposal-preparation-idle-surface.tsx` unchanged |

---

## 5. Temporary turn types — `types/temporary-turn.ts` (new)

Era-marked, presentation-owned, deliberately narrower than the backend schemas, deleted at integration.
`Money` from `@/lib/values/money`; paths are `string[]` with array indices as decimal strings.

```ts
import type { Money } from "@/lib/values/money";

export type TemporarySource = "brief" | "proposales_content" | "human" | "inferred";
export type TemporaryLeaf<T> = { known: true; value: T; source: TemporarySource } | { known: false };

export type TemporaryAlternative = { variationId: string; title: string; matchStrength: "weak" | "possible" | "strong"; reason: string };
export type TemporaryBlock = {
  contentId: { value: string; source: "proposales_content" | "human" };
  title: string;                              // catalog-verbatim, no flag
  description: TemporaryLeaf<string>;         // catalog-verbatim when known
  quantity: TemporaryLeaf<number>;
  optional: TemporaryLeaf<boolean>;
  reviewerComment: TemporaryLeaf<string>;
  alternatives: TemporaryAlternative[];       // as returned, in order
};
export type TemporaryProposition = {
  version: number;
  language: TemporaryLeaf<string>;
  title: TemporaryLeaf<string>;
  descriptionNarrative: TemporaryLeaf<string>;
  recipient:
    | { known: true; firstName: TemporaryLeaf<string>; lastName: TemporaryLeaf<string>; email: TemporaryLeaf<string>; phone: TemporaryLeaf<string>; companyName: TemporaryLeaf<string> }
    | { known: false };
  blocks: TemporaryBlock[];
  commercialNotes: Array<{ text: string; amount: TemporaryLeaf<Money>; taxBasis: TemporaryLeaf<"including_tax" | "excluding_tax" | "unstated"> }>;
  commercialAssumptions: Array<{ kind: "deadline" | "term" | "scope_commitment" | "other"; statedValue: TemporaryLeaf<string> }>;
  unresolvedItems: Array<{ itemKey: string; resolution: "unresolved" | "deferred_by_user" }>;
  assumptions: Array<{ path: string[]; note: string }>;
  warnings: Array<{ kind: string; text: string; path?: string[] }>;
  agentRationale: TemporaryLeaf<string>;
};
export type TemporaryClarification = {
  questions: Array<{ questionId: string; itemKey: string; text: string }>;
  answers: Array<{ questionId: string; answer: { kind: "answer"; text: string } | { kind: "skip" } }>;
};
export type TemporaryAppliedPricing =
  | { available: true; totalWithoutTax: Money; totalWithTax: Money; currency: string;
      blocks: Array<{ contentId: string; quantity: number; optional: boolean; unitValueWithDiscountWithoutTax: Money; unitValueWithDiscountWithTax: Money }>;
      warnings: Array<{ kind: "block_currency_differs"; contentId: string }> }
  | { available: false; reason: "read_failed_upstream" | "read_failed_timeout" | "read_failed_schema_mismatch" | "read_budget_exhausted" };
export type TemporaryDraftResult = {
  proposalUuid: string; editorUrl: string; newlyCreated: boolean;
  appliedPricing: TemporaryAppliedPricing;
  notices: Array<{ kind: "inline_recipient_may_duplicate_contact" }>;
};
export type TemporaryRunFailure =
  | { reason: "budget_exhausted"; budget: "wall_time" | "tool_calls" | "tokens" }
  | { reason: "model_output_invalid"; issues: Array<{ path: string[] }> }
  | { reason: "tool_output_invalid" };
export type TemporaryDomainResult =
  | { status: "clarification"; clarification: TemporaryClarification }
  | { status: "proposition"; proposition: TemporaryProposition }
  | { status: "failed"; failure: TemporaryRunFailure }
  | { status: "created"; draftResult: TemporaryDraftResult }
  | { status: "recovered"; draftResult: TemporaryDraftResult };
export type TemporaryWorkflowState = {
  currentProposition?: TemporaryProposition;
  clarification?: TemporaryClarification;
  draftReference?: { proposalUuid: string; editorUrl: string };
};
export type TemporaryEditOperation =
  | { op: "set_leaf"; path: string[]; value: string | number | boolean }
  | { op: "remove_block"; index: number }
  | { op: "replace_block"; index: number; variationId: string }     // maps to remove_block + add_block in one edit turn at integration
  | { op: "unset_recipient" }
  | { op: "confirm_empty_draft" };
export type TemporaryTurnInput =
  | { kind: "brief"; text: string }
  | { kind: "answers"; answers: TemporaryClarification["answers"] }
  | { kind: "edit"; operation: TemporaryEditOperation }
  | { kind: "revision"; instruction: string; scope: string | null }
  | { kind: "approval"; workflow: TemporaryWorkflowState; proposition: TemporaryProposition; acknowledgment: { statementId: string; wording: string } };
export type TemporaryTurnOutcome =
  | { ok: true; result: TemporaryDomainResult; workflow: TemporaryWorkflowState }
  | { ok: false; error: ErrorDto };   // import type { ErrorDto } from "@/lib/errors/error-dto"
```

---

## 6. The spine — store, record, dispatch

### 6.1 `types/session.ts` (edit) — the record

Keep `WorkspaceSessionId`, `TabStatus`. Replace the boolean record with:

```ts
export type WorkSurface = "fields" | "preview";
export type RetainedContext = { workSurface: WorkSurface; openedBlockContentId: string | null };
export type InFlightTurn =
  | { turnId: string; kind: "brief" | "answers" | "revision" | "approval" }
  | { turnId: string; kind: "edit"; path: string[] };
export type ThreadEntry =
  | { entryId: string; kind: "human"; text: string; scope: string | null }
  | { entryId: string; kind: "result"; result: TemporaryDomainResult; scope: string | null };
export type CallFailure = {
  site: { kind: "agent" } | { kind: "creation" } | { kind: "edit"; path: string[] } | { kind: "replacement"; blockIndex: number } | { kind: "ask"; fieldLabel: string };
  error: ErrorDto;
  retry: TemporaryTurnInput;
};
export type SessionRuntimeRecord = {
  id: WorkspaceSessionId;
  title: string;
  thread: ThreadEntry[];
  latestResult: TemporaryDomainResult | null;
  workflow: TemporaryWorkflowState | null;
  inFlightTurn: InFlightTurn | null;
  hasStartedTurn: boolean;
  unread: number;
  composerDraft: string;
  retained: RetainedContext;
  clarificationPanel: "open" | "dismissed";
  callFailure: CallFailure | null;
};
```

Delete `TemporarySessionResultKind`; `deriveTabStatus` reads `latestResult?.status`. The fresh record:
`thread: []`, `latestResult: null`, `workflow: null`, `inFlightTurn: null`, `hasStartedTurn: false`,
`unread: 0`, `composerDraft: ""`, `retained: { workSurface: "fields", openedBlockContentId: null }`,
`clarificationPanel: "dismissed"`, `callFailure: null`. Update `createSessionRecord`, the fixture
factory, and the store test's literal.

`deriveTabStatus` precedence, unchanged in meaning: `inFlightTurn !== null` → working;
`workflow?.draftReference` → created; `latestResult?.status === "clarification"` → questions;
`workflow?.currentProposition` → ready; `hasStartedTurn` → idle; else empty.

### 6.2 Store actions (add; keep the existing four unchanged)

```ts
setComposerDraft(sessionId, text): void
clearComposerDraft(sessionId): void
startTurn(sessionId, turn: InFlightTurn, humanEntry?: { text: string; scope: string | null }): void
   // sets inFlightTurn, hasStartedTurn = true, appends the human entry if given, clears callFailure for the same site kind
applyTurnResult(originSessionId, turnId, outcome: TemporaryTurnOutcome): void
   // Pass A: if the origin exists and inFlightTurn?.turnId === turnId → apply (below); else do nothing.
   // apply: inFlightTurn = null; on ok: push { kind: "result", result, scope: <the in-flight human entry's scope> },
   //        latestResult = result, workflow = outcome.workflow, clarificationPanel = "open" iff result.status === "clarification";
   //        on !ok: callFailure = { site by turn kind, error, retry: <the input> } — Pass A passes the site and input through a second parameter if simpler
   //        unread: Pass A does NOT increment (Pass B owns unread)
setWorkSurface(sessionId, workSurface: WorkSurface): void
setOpenedBlock(sessionId, contentId: string | null): void
dismissClarificationPanel(sessionId): void
reopenClarificationPanel(sessionId): void
dismissCallFailure(sessionId): void
```

No other action. No derived value stored. `activateSession` is unchanged in Pass A (Pass B adds the
unread clear).

### 6.3 `hooks/use-turn-dispatch.ts` (new, happy path)

```ts
export function useTurnDispatch(): { dispatch: (sessionId: WorkspaceSessionId, input: TemporaryTurnInput) => Promise<void> }
```
Body: read the record's `thread` length as `position`; build `InFlightTurn` from the input kind
(`edit` carries `operation.path` when `op === "set_leaf"`); `startTurn(...)` with the human entry for
`brief` (text = input.text, scope null) and `revision` (text = input.instruction, scope = input.scope);
`await temporaryFixtureTurnAdapter.run(input, position)`; `applyTurnResult(sessionId, turnId, outcome)`.
Capture `sessionId` and `turnId` into `const`s before the `await` — Pass B asserts this; do it right now.
The labels for `AgentThread.workingLabel` are derived from `inFlightTurn.kind` in `toThreadViewModel`.

### 6.4 `client/view-models/main-surface.ts` (new)

```ts
export type MainSurfaceViewModel =
  | { kind: "idle" }
  | { kind: "review"; review: ReviewSurfaceViewModel; workSurface: WorkSurface; openedBlock: BlockViewModel | null; creationFailure: CreationFailureViewModel | null }
  | { kind: "creating"; label: string }
  | { kind: "created"; created: CreatedViewModel };
export function toMainSurfaceViewModel(record: SessionRuntimeRecord): MainSurfaceViewModel
```
First-match-wins: `inFlightTurn?.kind === "approval"` → creating; `workflow?.draftReference` → created;
`workflow?.currentProposition` → review, with `workSurface = record.retained.workSurface`, `openedBlock`
= the block whose `contentId.value === retained.openedBlockContentId` else `null`, `creationFailure`
from `callFailure` when `site.kind === "creation"`; else idle. `MainApplicationSurface` switches on
`kind` and sets `data-surface-state={kind}` (this gives follow-up 15's attribute its consumer).

---

## 7. View models, adapters, money, theme, fixtures

### 7.1 View-model modules — `client/view-models/` (one file each, types + `to<Name>ViewModel`, `.test.ts` beside, node project)

```ts
// thread.ts
export type ThreadTurnViewModel =
  | { entryId: string; owner: "human"; text: string; scope: string | null }
  | { entryId: string; owner: "agent"; scope: string | null; prose: string; pills: PillViewModel[] }
  | { entryId: string; owner: "agent"; scope: string | null; failure: { headline: string; detail: string | null; issuePaths: string[] } };
export type ThreadViewModel = { turns: ThreadTurnViewModel[]; isEmpty: boolean };
export function toThreadViewModel(record: SessionRuntimeRecord): ThreadViewModel
export function toWorkingLabel(turn: InFlightTurn): string

// pill.ts
export type PillKind = "thought" | "ask" | "link" | "action";
export type PillViewModel =
  | { id: string; kind: "thought"; label: string; meta: string | null; accessibleName: string; defaultExpanded: false;
      payload: { rationale: string | null; assumptions: Array<{ path: string[]; note: string }>; warnings: Array<{ kind: string; text: string }> } }
  | { id: string; kind: "ask"; label: string; meta: string | null; accessibleName: string; defaultExpanded: boolean;
      payload: { questions: Array<{ questionId: string; text: string; state: "open" | "answered" | "skipped"; answerText: string | null }> } }
  | { id: string; kind: "link"; label: string; meta: string | null; accessibleName: string; href: string }
  | { id: string; kind: "action"; label: string; meta: string | null; accessibleName: string; intent: PillIntent };
export function toPillViewModels(result: TemporaryDomainResult, entryId: string): PillViewModel[]
   // thought ← agentRationale + assumptions + warnings (proposition only); ask ← clarification (default expanded iff any open);
   // link ← draftResult.editorUrl verbatim; action ← "Review the proposition" (focus-review) on a proposition, "Answer the questions" (reopen-questions) on a clarification.
   // ids are `${entryId}:${kind}` — never a thread index. No diff kind. No steps.

// clarification.ts
export type QuestionViewModel = { questionId: string; text: string; itemLabel: string; state: "open" | "answered" | "skipped" };
export type ClarificationPanelViewModel = { mode: "single" | "batch"; questions: QuestionViewModel[]; openCount: number; isOpen: boolean };
export function toClarificationPanelViewModel(record: SessionRuntimeRecord): ClarificationPanelViewModel | null
   // null unless latestResult.status === "clarification"; isOpen = record.clarificationPanel === "open"; questions in received order; only open questions are answerable.
   // Pass B adds toClarificationAnswersInput(drafts, receivedQuestionIds) here.

// review.ts
export type ProvenanceViewModel =
  | { class: "absent"; text: string }                    // "Not set — Proposales applies its default" or "Not set"
  | { class: "human"; text: "Set by you" }
  | { class: "inferred"; text: "Assumed by the agent" }
  | { class: "sourced"; text: null };
export type EditableLeafViewModel = {
  path: string[]; label: string; kind: "text" | "number" | "boolean";
  display: string;                                        // the value as text, or the absence statement
  isAbsent: boolean; provenance: ProvenanceViewModel;
  editStatus: { status: "idle" } | { status: "saving" } | { status: "failed"; message: string };
  validationMessage: string | null;
};
export type FieldViewModel = { leaf: EditableLeafViewModel; canAsk: boolean };
export type AlternativeViewModel = { variationId: string; title: string; matchStrength: string; reason: string };
export type BlockViewModel = {
  index: number; contentId: string; title: string; description: string | null;
  replacedByHuman: boolean; quantity: EditableLeafViewModel; optional: EditableLeafViewModel; reviewerComment: EditableLeafViewModel;
  pricingStatement: string; alternatives: AlternativeViewModel[];
};
export type ReadinessViewModel = { unresolved: number; deferred: number; summary: string; nothingSentStatement: string };
export type NotesViewModel = {
  commercialNotes: Array<{ text: string; amountDisplay: string | null; amountProvenance: ProvenanceViewModel; taxBasis: string }>;
  commercialAssumptions: Array<{ kind: string; statedValue: string; provenance: ProvenanceViewModel }>;
  assumptions: Array<{ pathLabel: string; note: string }>;
  warnings: Array<{ kind: string; text: string }>;
  unresolvedItems: Array<{ itemLabel: string; resolution: "unresolved" | "deferred_by_user"; resolutionText: string }>;
};
export type ReviewSurfaceViewModel = {
  title: string; clientLabel: string | null; version: number;
  fields: FieldViewModel[]; blocks: BlockViewModel[]; notes: NotesViewModel; readiness: ReadinessViewModel;
  surfaceErrors: string[];                                // validation issues whose path names no rendered leaf (Pass B fills)
  acknowledgment: { statementId: string; wording: string };
};
export function toReviewSurfaceViewModel(record: SessionRuntimeRecord, validation?: Array<{ path: string[]; message: string }>): ReviewSurfaceViewModel
   // rows are exactly the leaves the proposition carries; no fixed label list; provenance per leaf via toProvenanceViewModel(leaf);
   // absence never renders 0 / 1 / false / "" / "-"; readiness counts by resolution from unresolvedItems only; alternatives mapped in order.
export function toProvenanceViewModel(leaf: TemporaryLeaf<unknown>): ProvenanceViewModel

// preview.ts
export type PreviewViewModel = {
  title: string | null; narrative: string | null;
  items: Array<{ title: string; description: string | null }>;
  pricingStatement: string; disclosure: string; isEmpty: boolean;
};
export function toPreviewViewModel(proposition: TemporaryProposition): PreviewViewModel     // closed set; nothing else

// money.ts
export function toMoneyDisplay(money: Money, locale?: string): string
   // exponent from new Intl.NumberFormat(locale, { style: "currency", currency }).resolvedOptions().maximumFractionDigits;
   // the ONLY arithmetic: amountMinor / 10 ** exponent inside this function. Test a two-digit and a zero-digit currency (e.g. "EUR", "JPY").

// created.ts
export const TEMPORARY_FIXTURE_PRICING_ACKNOWLEDGMENT = { statementId: "temporary-library-pricing", wording: "Prices come from the content library and are applied by Proposales." } as const;
export type AppliedPricingViewModel =
  | { available: true; totalWithoutTax: string; totalWithTax: string; currency: string; blocks: Array<{ contentId: string; quantity: string; optional: boolean; unitWithoutTax: string; unitWithTax: string }>; warnings: string[] }
  | { available: false; reasonText: string };
export type CreatedViewModel = {
  headline: string; isRecovered: boolean; identifier: string; editorUrl: string;
  pricing: AppliedPricingViewModel; notices: string[]; reviewed: ReviewSurfaceViewModel;   // read-only reference under the card
};
export function toCreatedViewModel(record: SessionRuntimeRecord): CreatedViewModel

// failure.ts
export type ErrorTreatmentKey = "validation_error" | "unauthenticated" | "forbidden" | "not_found" | "conflict" | "approval_required" | "integration_error" | "rate_limited" | "internal_error" | "unknown";
export type CallFailureViewModel = { key: ErrorTreatmentKey; message: string; canRetry: boolean; detail: string | null };
export type CreationFailureViewModel = CallFailureViewModel & { headline: string; nothingSentStatement: string; existingDraft: { identifier: string; editorUrl: string } | null };
export function toCallFailureViewModel(failure: CallFailure): CallFailureViewModel
export function toCreationFailureViewModel(failure: CallFailure): CreationFailureViewModel
export function toRunFailureTurn(failure: TemporaryRunFailure): { headline: string; detail: string | null; issuePaths: string[] }
   // message = error.message as given; generic fallback ONLY for an unknown code with no message;
   // canRetry = error.details?.retryable === true && code !== "validation_error"; details read only through named keys.
```

Copy strings live in the adapters, not in components, so Pass B and the integration sprint can change
wording without touching JSX. Every string is design copy from `ui_design/*` with "push" replaced by
creation vocabulary; the safety sentence and "nothing sent yet" restatement appear verbatim.

### 7.2 `client/view-models/session-tab.ts` (edit)

`toTabViewModel(record, isActive = false)` gains `unreadText: string | null` (`"3 unread"` iff `unread > 0 && !isActive`).
The strip appends it to the tab's accessible name: `${title} — ${statusText}${unreadText ? `, ${unreadText}` : ""}`.

### 7.3 Money — `toMoneyDisplay` is the only money function in the feature. Assert in its test file that the module contains no `toFixed`, `parseFloat`, `Number(`, `* `, `+ ` on money paths beyond the one scaling line (a source check with a subject).

### 7.4 Theme additions — `src/styles/theme.css` (edit) and `src/styles/theme.test.ts` `DESIGN_01_RAMP_NAMES` (edit, same change)

Design 01 §1.12 light document values, admissible under master plan §6.5A as a design 01 table row:

| Name | Value | Use |
|---|---|---|
| `--color-paper` | `#fff` | preview frame |
| `--color-paper-ink` | `#111214` | preview base ink |
| `--color-paper-ink-body` | `#3f4147` | narrative |
| `--color-paper-ink-meta` | `#6b6d73` | item detail on white (5.2:1) |
| `--color-paper-rule` | `#ececef` | item separators |
| `--color-paper-rule-strong` | `#e4e4e7` | heading rules |
| `--color-paper-hero-start` | `#1d3b4a` | hero gradient |
| `--color-paper-hero-end` | `#0f2733` | hero gradient |

The hero is `bg-[linear-gradient(160deg,var(--color-paper-hero-start),var(--color-paper-hero-end))]`
(no hex in the class). The validity pill uses `text-[var(--color-bg)]` on `bg-[var(--color-accent)]`
(design 08 §5 contrast). The primary button on the created state uses `--color-fg` for white and
`--color-fg-body` for its hover, per owner decision 22's nearest-entry precedent; the approval action
uses `text-[var(--color-bg)]` on `bg-[var(--color-accent)]` (design 01 §5 correction 3). The attention
medallion border uses `border-(--color-attention)/50` (Tailwind v4 colour modifier) rather than a new
theme name. Record each as a design delta in the sprint log.

### 7.5 Fixtures — `client/fixtures/` (era-1 literals, `temporaryFixture*` exports, `.test.ts` beside each asserting shape only)

| Module | Exports |
|---|---|
| `session-runtime.temporary-fixture.ts` (edit) | `temporaryFixtureSessionRuntimeRecord(overrides)` on the new shape |
| `proposition.temporary-fixture.ts` | `temporaryFixturePropositionV1` (title inferred, one absent quantity, recipient with two known leaves, four blocks — block 1 with three alternatives, block 3 with none, block 4 `contentId.source: "human"` — one commercial note with `amount` known `{ amountMinor: 1200000, currency: "SEK" }`, one absent, one deadline assumption, two warnings, two assumptions, `unresolvedItems`: one `unresolved`, one `deferred_by_user`); `temporaryFixturePropositionV2` (= V1 with `title` `source: "human"`, version 2); `temporaryFixturePropositionV3` (= V2 with a revised narrative, version 3); `temporaryFixturePropositionLongText` (140-char title, 60-char client, 600-char descriptions, six blocks); `temporaryFixturePropositionEmpty` (every leaf absent, no blocks, `unresolvedItems` with the block-selection item unresolved) |
| `clarification.temporary-fixture.ts` | `temporaryFixtureClarificationSingle` (one question), `temporaryFixtureClarificationBatch` (three questions), each with `answers: []`; `temporaryFixtureClarificationAnswered` (batch with one answer, one skip, one open) |
| `draft-result.temporary-fixture.ts` | `temporaryFixtureDraftResultCreated`, `temporaryFixtureDraftResultRecovered` (`newlyCreated: false`), `temporaryFixtureDraftResultInconsistentTotals` (totals that are not the sum of unit values × quantity — the test that no figure is recomputed), `temporaryFixtureDraftResultPricingUnavailable(reason)`, `temporaryFixtureDraftResultWithNotice` |
| `failures.temporary-fixture.ts` | `temporaryFixtureErrorDto(code, overrides)` producing one `ErrorDto` per treatment key, including `integration_error` with `details.retryable: true` and `false`, `validation_error` with two issues (one path that matches a V1 leaf, one that does not), `conflict` with a draft identity, an unknown code with and without a message; `temporaryFixtureRunFailure(reason)` for the three production reasons |
| `turns.temporary-fixture.ts` | `TEMPORARY_FIXTURE_TURN_LATENCY_MS = 700`; `temporaryFixtureTurnAdapter: { run(input, position, wait = defaultWait): Promise<TemporaryTurnOutcome> }`; `setTemporaryTurnAdapterForTests(adapter \| null)`; the script by `input.kind` only: `brief` → clarification batch; `answers` → proposition V1; `edit` → V2 (any edit); `revision` → V3; `approval` → created. The adapter never reads `input.text` or `input.instruction`. Position is unused except to choose V1 on the first proposition, and is accepted so Pass B can script sequences |

Editor URLs in fixtures are `https://app.proposales.example/proposals/<uuid>/edit` — a placeholder
origin, never the real editor. No real person, company, or product names; use "Studio North", "Halden
& Vik", "walnut dining set", "beige upholstery" style content.

---

## 8. File plan

**New:** everything in §3.2's file list; `types/temporary-turn.ts`; `hooks/use-turn-dispatch.ts`,
`hooks/use-thread-follow-state.ts`, `hooks/use-inline-edit.ts` (+ `.test.ts` for the follow state and
the inline-edit hook, jsdom); `client/view-models/{thread,pill,clarification,review,preview,money,created,failure,main-surface}.ts`
(+ `.test.ts`, node); `client/fixtures/{proposition,clarification,draft-result,failures,turns}.temporary-fixture.ts`
(+ `.test.ts`); component tests `.test.tsx` for the composer, thread, pill, panel, inline value, toggle,
popover, approval action, created, failure, confirm dialog; `e2e/proposal-flow.spec.ts`.

**Modified:** `types/session.ts`; `hooks/use-workspace-session-store.ts` (+ test literal);
`client/view-models/session-tab.ts` (+ test); `client/fixtures/session-runtime.temporary-fixture.ts` (+ test);
`components/workspace/{agent-surface,main-application-surface,proposal-workspace}.tsx`;
`components/session-tabs/session-tab-strip.tsx` (accessible name only); `src/styles/theme.css`;
`src/styles/theme.test.ts` (allowlist names only); `src/app/layout.tsx` (fonts); `package.json`,
`package-lock.json` (`@radix-ui/react-popover`).

**Unchanged:** `workspace-divider.tsx`, `use-divider-width.ts`, `reveal-active-tab.ts`,
`session-tabs-constants.ts`, `workspace/constants.ts`, `derivation-register.ts` + test,
`types/presentation.ts`, `idle/proposal-preparation-idle-surface.tsx`, `agent-status-line.tsx`
(unless it must move below the header; then only its placement in `AgentSurface`), `globals.css`,
`src/lib/**`, `e2e/workspace.spec.ts`, `e2e/session-tabs.spec.ts`, everything under
`architectural_contracts/` and `ui_design/`.

---

## 9. Work packages, in order

Commit after each: `CHECKPOINT (not approved): sprint pass A WP<n> <slug>`. `npm test` before every
checkpoint. Each package names its done-check.

### WP1 — Spine

Tasks: §5 types; §6.1 record and store; §6.2 actions; §6.3 dispatch; §6.4 main-surface derivation;
`MainApplicationSurface` switching on `kind` (idle → the existing idle surface; other kinds render a
one-line placeholder until their package lands); fixture factory and store-test literal updated;
`turns.temporary-fixture.ts` with the adapter and decision 23's constant; the font load of decision 24.
Done when: `npm test` green; in the browser, typing a brief and pressing Enter (temporarily via a plain
`<form>` in `AgentSurface`) makes the tab dot go Working for ~700 ms and then Needs you.

### WP2 — Agent column

`AgentHeader`, `AgentThread` + `useThreadFollowState`, `AgentThreadTurn`, `WorkingIndicator`,
`AgentEmptyState`, `AgentComposer`, `TurnFailureNotice`; `toThreadViewModel`, `toWorkingLabel`;
`AgentSurface` wiring: header (count = `sessionIds.length`), strip, status line, thread keyed by
session id, composer or panel slot, notice slot.

Follow state (§12A.18): two states, `following` initial, `THREAD_FOLLOW_BOTTOM_THRESHOLD_PX = 80`
in `agent/agent-thread-constants.ts`; user scroll beyond the threshold → detached; content appended
while following → pinned to bottom via `scrollTop = scrollHeight` on the container ref (never
`scrollIntoView`, never a document query); programmatic scroll never detaches (set a ref flag around
the programmatic write); jump-to-latest button while detached; `suppressFollow` prevents the pin.
Keying the thread by session id resets the state on switch.

Done when: the loop runs in the browser with a real composer; a 40-line pasted brief keeps its lines;
scrolling up during a result shows Jump to latest and does not move; Escape and Enter behave per design 03.

### WP3 — Pills

`InteractionPill`, `ThoughtPayload`, `AskPayload`, `toPillViewModels`. One 34px shell; typographic
glyphs `✳ ? ↗ ▸` in 24px discs, `aria-hidden`; disclosure pills `<button aria-expanded aria-controls>`;
link pill `<a target="_blank" rel="noopener noreferrer">` with "opens in a new tab" in the name;
action pill a `<button>` naming its intent; expansion grows downward without scrolling; expansion state
local and disposable; keyed by `viewModel.id`. Lucide chevrons for the affordance, hidden from the name.
Done when: a proposition turn shows a thought pill that expands to rationale, assumptions, warnings; a
clarification turn shows an ask pill listing open / answered / skipped with an Answer this control that
emits `reopen-questions`.

### WP4 — Clarification panel

`ClarificationPanel`, `ClarificationQuestion`, `ClarificationStepProgress`, `toClarificationPanelViewModel`.
`role="region" aria-label="Agent questions"`, not a dialog, no focus trap; single mode for one open
question, batch for two or more with 4px bars in 24px hit areas named "Question 2 of 3, answered",
Back / Next `disabled` at the ends, Skip all, send label "Send answer" / "Send N answers", send `disabled`
when no draft is answered or skipped; textarea per question with a visible label and the `itemLabel` as
`aria-describedby`; per-question skip control named with its meaning ("Skip — leave this for the client");
`Escape` dismisses and focuses the composer; `Cmd/Ctrl+Enter` submits; focus on open goes to the first open
question's textarea; the region announces the step counter once per step change; invalid state slot
(`aria-invalid`, `aria-describedby`) rendered from `submitState.failed`; skipping is never disabled.
Drafts are local state initialised from the view model's questions with `state: "untouched"`.
`AgentSurface` renders the panel in the composer's slot when `panel?.isOpen`.
Done when: brief → panel opens with three questions; answer one, skip one, press send → proposition; dismiss → composer with draft intact; Answer this reopens with drafts intact.

### WP5 — Review surface, read-only

`ProposalReviewSurface`, `ReviewHeader`, `WorkSurfaceToggle`, `ReadinessLine`, `ReviewFieldsCard`,
`ReviewFieldRow`, `ProvenanceFlag`, `ReviewBlocksCard`, `ReviewBlockRow`, `ReviewNotesCard`,
`ApprovalAction`, `toReviewSurfaceViewModel`, `toProvenanceViewModel`. `<dl>` for fields, `<table>`
with `<thead>` for blocks, description list for notes; every colour-carried class carries its text and
the text is inside the value's accessible name; absence statements never look like values; readiness
line "2 open · 1 deferred · nothing sent yet"; approval action always available, creation vocabulary,
`aria-describedby` the unresolved summary; Discard outlined; toggle a `<fieldset>` radio group whose
change announces "Showing fields" / "Showing client preview" once through a polite region in the header.
The `focus-review` pill intent moves focus to the review heading (`tabIndex={-1}`).
Done when: V1 renders every leaf it carries and nothing else; the long-text fixture wraps without clipping at 780px with the divider at its maximum.

### WP6 — Client preview

Theme additions (§7.4) with the allowlist edit; `ClientPreviewSurface`, `toPreviewViewModel`. Region
named "Client preview (approximate)"; visible caption "Approximate preview. Final layout, imagery and
branding come from your Proposales template."; `h2` title, `h3` sections; hero `min-h-[170px]` that grows;
600px measure; narrative omitted when absent; items as a `<ul>` with title and description; the
pricing statement; a dark focus ring scoped inside the light surface (`[&_:focus-visible]:outline-[var(--color-paper-ink)]`
or equivalent). Empty proposition → the honest empty document. No quantity, flags, notes, amounts.
Done when: toggling shows the document; the long-title fixture grows the hero.

### WP7 — Editing UX

`@radix-ui/react-popover` added and recorded; `useInlineEdit` (which leaf edits; `startEdit(path)`,
`cancel`, `commit(value)`; one at a time within the surface; Enter commits, Escape cancels, focus returns
to the trigger on both); `InlineEditableValue` (read `<button>` named "Edit Title, currently …", input
over the text with the negative-margin treatment, saving spinner text, failed message, validation message
at the leaf); `BlockReplacementSurface` (a `<ul>` of alternatives in order, each a `<button>`, empty
statement when none, opened by `onOpenBlock`, closed by `onCloseBlock`); `AskAgentPopover` (Radix
`Popover.Root modal`, anchored to the `✦` trigger which rests at `--color-fg-quietest` with a 32px hit
area and the name "Ask the agent about Title"; focus to the input on open; Escape, Cancel, outside, and
submit all close and return focus; submitting and failed states). Remove-block control per row.
Done when: every edit affordance is keyboard-reachable; the surface renders `saving` and `failed` states from fixtures.

### WP8 — Creation states and failures

`CreatingSurface` (`role="status"`, focus to the heading on mount, spinner `aria-hidden` with
`motion-reduce:animate-none`, one label "Creating draft in Proposales"), `CreatedSurface` +
`AppliedPricing` (medallion `aria-hidden`, headline focused on mount with `tabIndex={-1}`, identifier
labelled "Proposal ID" and selectable, grey Draft badge inside the card's name, pricing table with each
returned figure rendered once via `toMoneyDisplay`, unavailable reason text with no zero anywhere,
notices, Open in Proposales as `<a target="_blank" rel="noopener noreferrer">` with the exact `editorUrl`,
Draft another, and the read-only reviewed proposition below), `CreationFailureSurface` (`role="alert"`,
focus to the heading, Back to review first in DOM order, Try again only when `canRetry`, the DTO message,
the nothing-sent statement), `TurnFailureNotice` states, `toCreatedViewModel`, `toCallFailureViewModel`,
`toCreationFailureViewModel`, `toRunFailureTurn`. Failed run results render as a failure turn in the thread.
Done when: approve → creating → created in the browser; every failure fixture renders its message and the right retry presence in RTL.

### WP9 — Dialog and strip badge

`ConfirmDialog` on native `<dialog>` with `showModal()` / `close()`, description naming what is lost,
confirm and cancel, focus handled by the platform; rendered but not yet wired (Pass B wires it).
Strip: unread text in the accessible name; the `aria-live` region untouched.
Done when: `ConfirmDialog` opens and closes in RTL with focus returning to the opener.

### WP10 — Sweep, tests, exit gate

Browser sweep at 1440, 1100, 780 with the divider at min and max (§11); reduced-motion pass with
`prefers-reduced-motion: reduce` emulated; keyboard-only walk of the loop; `e2e/proposal-flow.spec.ts`
(§12); fixture-import audit (`grep -rn "temporary-fixture" src/features/proposal-preparation/components`
returns nothing); the stamp; the sprint log; the master-plan amendment (§14) if not already committed.

---

## 10. Accessibility checklist (verify per component before its checkpoint)

- Every interactive element is a native control or the Radix Popover; no `div` with `onClick`.
- Every control has an accessible name that does not depend on an ellipsized label or a `title`.
- The global focus ring is visible on every new control; the light preview carries its own dark ring.
- Thread: `role="log" aria-live="polite" aria-relevant="additions"`, `aria-busy` while working, owner
  labels "You said" / "Agent said" visually hidden, scope badge inside the turn's name, working dots
  `aria-hidden` and static under reduced motion.
- Composer: hidden `<label>`, `aria-describedby` hint, send named "Send message", `disabled` on empty and while submitting.
- Pills: `aria-expanded` + `aria-controls` + payload `id`; link and action distinguishable by element and name; discs hidden.
- Panel: region not dialog; focus on open to the first open textarea; Escape → composer; `Cmd/Ctrl+Enter`; stepper `disabled` at ends; counter announced once per step; skip never disabled.
- Review: `<dl>`, `<table>`; flag text always present; edit trigger name carries label and value; Enter / Escape / focus return; toggle a labelled radio group with a one-time announcement; popover focus in, trapped, out; `✦` readable at rest.
- Creating / created / failure: `role="status"`, focus to heading / headline / alert heading; Back to review first tab stop; identifier labelled.
- Dialog: native `showModal()`.
- Reduced motion: every animation uses `motion-reduce:animate-none`; nothing settles dimmed.
- No state is colour-only anywhere.

## 11. Responsive checks (browser, before the exit gate)

At 1440, 1100, 780, each with the divider at `AGENT_PANE_MIN_PX` and at its effective max: no
horizontal document scroll; review header wraps with the approval action visible; 116px label column
wraps long labels; the blocks table wraps descriptions and never forces overflow; long title wraps in the
header, hero, and created card; the 40-line brief keeps lines inside the 88% bubble; long clarification
text scrolls inside the 62vh panel with the footer pinned; a spaceless pill label ellipsizes with the full
name in the accessible name; the popover stays in the viewport; the existing E2E width matrix stays green.

## 12. Tests you write

- **node**: every `to<Name>ViewModel` over its fixtures — review rows equal carried leaves in both
  directions; provenance per class with text; absence never `0`/`1`/`false`/`""`/`-`; readiness from
  `unresolvedItems` only; preview closed set (an assertion that no rendered string equals a quantity,
  a flag text, a note, or an amount); money exponent for EUR and JPY and the module source check; pill
  mapping per result state with ids not indices and no `diff`; created with inconsistent totals rendering
  the returned total, unavailable rendering no `0`; failure map per code including unknown with and without message.
- **jsdom (.tsx)**: composer keys and disabled rules; thread follow transitions with a fake scroll
  container; pill expand / link attrs / action intent; panel modes, navigation, dismiss, focus on open,
  Escape, Cmd+Enter, skip with invalid state present; inline edit keys and focus return, saving and failed
  rendering; toggle selection and announcement; popover focus in / trap / Escape / return; approval action
  describedby; created focus and link attributes; failure alert and tab order; confirm dialog open / close / focus.
- **jsdom (hooks)**: `useThreadFollowState` seven transitions with the threshold contract (at threshold following, one beyond detached); `useInlineEdit` one-at-a-time.
- **Playwright** `e2e/proposal-flow.spec.ts`: empty → brief → working visible (assert the dot's `data-status="working"` appears, using the real 700 ms) → panel → answer and skip → proposition → thought pill expands → inline edit → popover → preview toggle → approve → creating → created with the link; one run with `reducedMotion: "reduce"` asserting the spinner has `animation-name: none`; focus lands on the creating heading and on the created headline.
- No DOM snapshots. No test of exact pixel values in jsdom (it performs no layout).

## 13. Exit gate

1. Every state of §12 renders from a fixture in RTL, and the scripted loop runs in a browser from empty to created and, in RTL, to each failure.
2. Every prop and type in §3, §5, §6, §7 exists with the stated name, or the difference is in the sprint log.
3. No component imports a fixture or a `Temporary*` type; `grep` proves it.
4. `npm run typecheck && npm run lint && npm test && npm run test:e2e && npm run build` green on a clean tree and a fresh server; SHA in the sprint log.
5. Approved tests changed only as §4 marks (✎) with reasons logged.
6. The sprint log lists: files created and modified, tests amended, theme names added, the popover package and version, design deltas (§7.4 and any others), the font load verified, the latency constant, open items for Pass B.
7. Final commit `sprint pass A: visual implementation complete; hand-off to pass B`. Do not push unless the owner says so.

## 14. Master-plan amendment to apply as the first sprint commit (if the owner has not already)

In `master-plan.md` add after §3A:

> **3B. Submission sprint (owner decision, 2026-09-07).** After phase 04 reached `APPROVED`, phases 05–15 were collapsed into one submission sprint for the time-boxed take-home delivery. The historical phase plans remain source material and specification; their independent projection, review, correction, re-review and approval gates are intentionally waived. The sprint runs in two passes, each with its own plan: Pass A, visual and product implementation (`plans/sprint-pass-a-visual.md`), which also builds the minimal fixture-era spine needed to see every state in a browser; Pass B, behavioural machinery (`plans/sprint-pass-b-machinery.md`), by a separate session working from Pass A's component contracts. Phases 16–17 remain a later real-backend integration sprint, themselves collapsed into one. Architecture contracts, product semantics, accessibility, frontend/backend authority boundaries, fixture-era markers, the closed retained-context set, and the closing verification stamp remain binding. Phases 05–15 are **not** marked `APPROVED` individually; the tracker shows them as `SUBMISSION_SPRINT` and each pass plan carries a sprint log recording tests amended, dependencies added, theme values added, and design deltas.
>
> **Owner decisions 23 and 24 (2026-09-07).** 23: the scripted fixture turn adapter carries one era-marked demo latency constant, `TEMPORARY_FIXTURE_TURN_LATENCY_MS`, representing a state and not progress; deleted at integration. 24: the design fonts are loaded through `next/font/google` in `src/app/layout.tsx`.

Tracker §4 rows 05–15: `State` → `SUBMISSION_SPRINT`, `Note` → "see §3B". §11.1 gains one gate-log row for the decision. §6.5A gains the §7.4 values with their design 01 §1.12 origin. §11.2 gains the deltas of §7.4.

## 15. Do not

- Do not build Pass B's behaviours "while you are there".
- Do not put a `Temporary*` type or a fixture import in a component.
- Do not add a route, a `useRouter`, a `<main`, a file under `src/components/ui/`, or a theme name outside §7.4.
- Do not write "extension" or "plugin" in any source or comment under `src/features`.
- Do not use `scrollIntoView`, `document.querySelector`, or `window.innerWidth` in a component.
- Do not add timers beyond decision 23's one constant.
- Do not parse the human's text anywhere.
- Do not mark any phase `APPROVED`.

## 16. Sprint log

- Gate: PASS at starting SHA `24abcc07b9d95c5fb18c478ca68bb54557f91ec3`; branch
  `proposal-copilot-frontend`; clean tree; intention `RATIFIED`; frontend phase 04 baseline present;
  port 3000 free; baseline typecheck, lint, and 205 tests green.
- Sprint authorization amendment committed first as `2653b68` (`docs: authorize frontend submission
  sprint`).
- WP1 — spine: temporary contracts, fixtures, adapter, expanded session record/store actions,
  origin-safe dispatch, primary presentation adapters, main-surface derivation, container switching, and
  temporary brief form implemented. Typecheck, lint, and 205 tests green. The live browser service
  exposed no available browser instance; manual browser verification remains open for the exit gate.
- Approved tests amended (plan §4): the session record equality literal and session fixture shape;
  session-tab and status-line setup overrides migrated from legacy booleans/empty casts to the new
  record fields and real proposition/created fixtures. Assertions were not weakened.
- Font verification: `Plus_Jakarta_Sans` and `IBM_Plex_Mono` are loaded through `next/font/google` in
  `src/app/layout.tsx`; the theme families consume their generated CSS variables.
- Fixture latency: `TEMPORARY_FIXTURE_TURN_LATENCY_MS = 700`; it represents one honest waiting state.
- Necessary signature difference: `applyTurnResult` carries `retryInput` as its fourth argument, using
  the plan §6.2 allowance to preserve the retry payload without deriving or parsing it in the store.
- Necessary fixture typing difference: the unknown-code fixture casts only at the temporary fixture
  boundary because the installed `ErrorDto` type is a closed known-code union while §7.5 requires an
  unknown-code presentation case. The production error contract is unchanged.
- WP2 — agent column: inert identity header, session count, scoped live thread, multiline human turns,
  agent and run-failure turns, honest activity labels, composer keyboard behavior, empty guidance,
  retry notice, and threshold-based follow/detach/jump behavior implemented. Typecheck and lint green;
  focused component/hook coverage added, with the package checkpoint verification recorded by its
  test run.
- Files created/modified, package/version, theme names, design deltas, later checkpoints, Pass B open
  items, and the final verification SHA will be completed at the exit gate.
