# Intention: Proposal Copilot Frontend Core

| | |
|---|---|
| **Status** | `DRAFT` (2026-09-05, shaper's first grounded draft; nothing here is authority until the owner ratifies it) |
| **Product** | Proposal Copilot |
| **Feature working name** | Frontend Core (the production proposal workspace) |
| **Owner** | David (repository owner) |
| **Shaped** | 2026-09-05 |
| **Stream** | worktree `Proposales-frontend`, branch `proposal-copilot-frontend`, branched from the same checkpoint as `main`; `main` is merged into this branch as backend contracts are approved |
| **Companion design evidence** | [`../ui_design/`](../ui_design/) — ten Markdown specifications extracted from the Claude Design prototype; read `10-design-integration-guide.md` first |
| **Sibling intention** | [`../../initial_core_feature_proposales/planing/proposal-preparation-backend-intention.md`](../../initial_core_feature_proposales/planing/proposal-preparation-backend-intention.md) — `RATIFIED`; the authority for every domain, commercial, approval, and execution fact this document refers to |
| **Governing contracts** | listed in §2.2 |

This document is the single authority for *what* the production frontend of Proposal Copilot must be and *why*. It does not decide *how*: no component tree, hook, store shape, file name, adapter API, or Server Action signature is chosen here unless a ratified repository decision already fixes it. A later mechanism inventory and implementation plan derive from it. It never restates the backend intention; where a domain fact matters it cites that document by section.

---

## 1. Purpose

Establish the **one production workspace** in which a human collaborates with the proposal-preparation capability while seeing, reviewing, correcting, previewing, and finally approving the proposal being prepared.

```
┌────────────────────────────┬──────────────────────────────────────┐
│ Agent surface              │ Proposal surface                     │
│                            │                                      │
│ session tabs               │ proposal review (fields, line items) │
│ conversation thread        │ provenance / unresolved information  │
│ agent interaction pills    │ client preview (approximate)         │
│ clarification              │ approval action → creating           │
│ composer                   │ created / recovered / failed result  │
└────────────────────────────┴──────────────────────────────────────┘
```

The left surface is not a generic chat widget and not a separate application: it is *the* interaction surface of the product. The right surface is where the structured proposal becomes visible and reviewable. They are one feature and one screen, permanently split (design 02 §1).

The human lifecycle the workspace serves, in the words of the ratified backend intention (§5), is: brief → the agent understands intent → clarification when necessary → a proposition is prepared → the human reviews → the human edits, replaces, or asks for revision → the human approves the exact proposition → deterministic server execution → a Proposales **draft** exists → the human opens it, performs the final monetary review, and sends from Proposales.

### 1.1 Why this is its own intention

The backend intention is explicitly backend-first (its §1: "The product UI comes later"). This document is the UI's root artifact. The two streams are temporary parallel implementations of one Next.js application; this intention exists so that the frontend can make useful progress before every backend phase is approved, **without** inventing the contracts those phases own (§9, §10).

## 2. Grounding

### 2.1 Repository state (verified 2026-09-05, branch `proposal-copilot-frontend` at `404557d`)

- Next.js 16 App Router, React 19, TypeScript strict, Zod 4, Tailwind CSS 4 (`tailwindcss`, `@tailwindcss/postcss`, `postcss.config.mjs`), Zustand 5 installed, Vitest 5 with `node` and `jsdom` projects, Playwright. Single Vercel deployment. No component library, no remote-state library, no client persistence (contracts README "Scaffold decisions record").
- **Backend progress on `main` merged into this branch:** phases 1–3 of the backend plan are `APPROVED` (`src/lib/env`, `src/lib/errors`, `src/lib/logger.ts`, `src/lib/values/`, the Proposales adapter's transport and content read with its fake and README). Phases 4–15 are `NOT_STARTED`. **No `src/features/` folder, no feature schema, no agent, no service, no Server Action, no Route Handler exists yet.** The backend plan deliberately adds no transport at all in its v1 (master plan R3).
- **Frontend code that exists:** `src/app/layout.tsx` renders a bare `<html><body>{children}</body></html>`; `src/app/page.tsx` returns `null`; `src/styles/globals.css` holds the reset, base typography, and a global `:focus-visible` treatment. Nothing else.
- **Frontend code that the current-state documents describe but which no longer exists.** Commit `f957f66` ("Removed bootstrap architecture") deleted `src/styles/tokens.css`, `src/components/ui/{button,input,textarea,cx}` with their tests and CSS Modules, the shell layout and its CSS Modules, and the foundation page. After that commit: the committed `globals.css` still begins with `@import "./tokens.css"` (a file that does not exist; during this shaping session an **uncommitted** working-tree edit removing that import appeared, not made by the shaper, so the committed tree and the working tree differ); `e2e/bootstrap.spec.ts` still expects a `banner` landmark, a `main` landmark, and a "Skip to content" link that the bare layout does not render; the root README, the contracts README ("Today: `Button`, `Input`, `Textarea`, `cx`"; "Known conflicts" row about CSS Modules), and contract 15 §4/§6 still describe the deleted primitives, tokens file, and CSS-Modules foundation. **This worktree has no `node_modules`, so the shaper could not run typecheck, lint, tests, or a build to confirm the consequence; the observation is from source.** Recorded as conflict C-4 (§13) for the owner and as a pre-implementation item (§14.3).
- Vitest's `jsdom` project collects `src/app/**/*.test.tsx` and `src/components/**/*.test.ts(x)` only; a component test placed anywhere else is silently not collected (master plan §10.3 hazard). The frontend plan must claim its test globs deliberately.
- Documentation root for this application is `build_docs/` (owner decision recorded in the backend intention §2.1); this intention lives under `build_docs/under_constroction/frontend_core/intention/` by the owner's instruction.

### 2.2 Applicable architecture contracts

Classified against the contract guide §4–§5 and its scenario E ("Port a screen from an interactive prototype") plus the client half of scenario A. Contracts read and applied in this document:

| Contract | Why it applies here |
|---|---|
| `16-design-prototype-porting.md` | the entire initiative is a port from a Claude Design prototype: authority directions (§1), port protocol (§2), classification of every stateful concept (§3), translation table (§4), what must never be ported (§5) |
| `05-client-architecture.md` | components vs hooks, flow-state unions (§3), the three kinds of client state and their owners (§5), the store ladder (§5.1), page-lifetime session model (§5.2), errors/loading/retry (§6), accessibility (§7), types from schemas (§8), rendering agent output as proposed (§9) |
| `15-ui-styling-and-component-system.md` | Tailwind as the mechanism, `tokens.css` as the single definition of visual values, the inline-style rule, the shared-primitive promotion rule, the composite-widget decision (§5) |
| `02-runtime-boundaries.md` | client islands inside server-rendered structure (§1–§2), what a `"use client"` graph may import (§5), what may cross the boundary (§6) |
| `03-feature-architecture.md` | where the workspace lives, dependency direction, cross-feature imports (§4) |
| `06-data-contracts-and-validation.md` | types inferred from schemas, no hand-written boundary shapes, view DTOs, the client never re-parses valid values during render |
| `10-security-and-trust-boundaries.md` | the browser is untrusted (§1), nothing secret in client state (§2), Server Actions are public endpoints and the application has no authentication (§3), free text is data (§4), external links (§10) |
| `08-agent-architecture.md` | §6 (the HITL lifecycle the UI renders) and §9 (turns, no in-memory continuation) only; the UI represents agent behaviour and the approval boundary, it implements neither |
| `04-server-architecture.md` | §3 (thin Server Actions as the UI's default transport) and §6 (the error taxonomy the UI renders); read for the seam the frontend will eventually call, not to design server code |
| `11-testing-principles.md` | component/interaction layer, ported-UI proof by interaction tests (§3), the critical Playwright flow (§3), no snapshot trees (§5) |
| `14-documentation-principles.md` | this artifact's class (intention); feature README at closeout; the stale current-state documents in §2.1 |
| `12-anti-patterns.md` | sections "Components and client", "Styling and UI system", "Prototype porting", "Structure and abstraction" |
| `13-decision-checklist.md` | §1, §2 (cited by section) |

Not loaded: `07-integrations.md` (the frontend calls no external system; the server does), `09-database-and-persistence.md` (no persistence is introduced; the no-database decision is inherited unchanged and confirmed by §7). Reading a contract here never implies introducing what it governs.

### 2.3 Authority boundaries

Three sources govern the frontend and none substitutes for another (design 10 §1, contract 16 §1):

| Source | Authoritative for | Not authoritative for |
|---|---|---|
| **Design specifications** (`../ui_design/01`–`10`) | visual language, layout and hierarchy, interaction behaviour, presentation state vocabulary, motion, copy and empty states, the accessibility corrections they name, what the prototype tried and discarded | component architecture, state ownership and shape, data shapes, data flow, routing, persistence, anything the prototype's code did to run standalone |
| **Architecture contracts** (`architectural_contracts/`) | component boundaries, feature ownership, runtime placement, state ownership, styling mechanism, validation, security, testing, documentation | product and screen decisions |
| **Ratified backend intention and the contracts it specializes** | commercial truth (prices, totals, currency, tax), workflow truth (result states, transitions, terminality), provenance truth, clarification truth (which questions exist, their shape, what an answer or a skip does), approval truth, execution truth, error semantics | how any of it looks |

Consequence stated once: **where a design document shows a value, a label, a question, a field set, or a total, that content came from a demo fixture. The visual treatment is authoritative; the content is not** (design 10 §1). Where a design document's mechanism conflicts with a contract or a ratified decision, the intended experience is preserved and the mechanism is replaced (§13 lists each such case).

### 2.4 Vocabulary mapping (UI concept → ratified backend concept)

The design specifications use presentation words. This table fixes what each one *means* in domain terms so no later artifact promotes a presentation word into a contract, and so the planner knows which backend phase owns the real shape. Backend names are those of the master plan §6.4 naming registry.

| UI concept (design spec) | Domain meaning | Owner of the real shape |
|---|---|---|
| Session (tab) | one in-memory proposal workflow for the page's lifetime: a page-lifetime session identity, the caller-held `ProposalWorkflowState` once a first turn has run, the caller-held `ConversationContext`, and the presentation runtime of §8.3 | session identity: frontend (UI mechanics); state and context: backend phases 6 and 10 |
| Thread | the human's instructions and the application-rendered results of each turn, in order; not the model's messages | `ConversationContext` turns (backend §17A.17) plus per-turn results |
| Assistant turn / pills | the presentation of one turn's `DomainResult` (`clarification`, `proposition`, `failed`, `created`, `recovered`) and its parts: rationale, assumptions, warnings, unresolved items, questions, the draft result | backend §15.1, §17A.13 |
| Pill kinds `thought` / `ask` / `diff` / `link` / `action` | presentation vocabulary only (design 05 §1); each is a rendering chosen at the view boundary for a part of a result | frontend presentation; never a response schema |
| "Working" | a turn for this session is in flight (a pending server call), nothing more | frontend runtime (§8.3) |
| Clarification panel | the questions of a `clarification` result; each answer is an explicit answer or an explicit skip bound by question id | backend §8.2, §17A.7 |
| Fields (review) | the leaves of the current proposition: language, title, narrative, recipient leaves; each carries its own source | backend §9.2, §17A.4 |
| Line items | the proposition's ordered blocks: catalog-verbatim title and description, quantity and optional flag (sourced or absent), reviewer comment, retained alternatives, `pricing: "library"` | backend §9.2, §17A.5 |
| Provenance flags ("Assumed", "Missing", "Updated") | presentation of a leaf's `source`, of `unresolvedItems` with their resolution, of `assumptions`, of `warnings` | backend §17A.4, §17A.6, §17A.9 |
| Inline edit | a human edit operation (`set_leaf`, `remove_block`, `add_block`, `unset_recipient`, `confirm_empty_draft`) submitted to the edit turn; the result is a new proposition version with `human` provenance on the changed leaves | backend §11.2, master plan §6.4 `editOperationSchema` (phase 12) |
| "Ask the agent about <field>" | a revision instruction (free text) whose wording names the field; the reply is the revision turn's result | backend §11.2 `reviseProposition` (phase 12) |
| Readiness line / "N open" | the proposition's `unresolvedItems` (with resolution `unresolved` or `deferred_by_user`); never a client-computed approvability verdict | backend §17A.6 |
| Client preview | the application's own approximate document rendering of the current proposition | frontend presentation over the proposition |
| "Create in Proposales" | the explicit human approval act: submits the exact reviewed proposition with the library-pricing acknowledgment as data | backend §11.3, §17A.10 (phase 13) |
| Creating | the approval/execution turn in flight | frontend runtime |
| Created / recovered | the `DraftResult`: proposal uuid, editor URL, `newlyCreated`, Applied Pricing (available or unavailable with reason), notices | backend §15.1, §17A.12 (phase 14) |
| Failure | an `ErrorDto` (`code`, `message`, `details`) or a `failed` domain result with its reason | contract 04 §6, backend §15.2 |
| Session status dot / phase label | a presentation projection of the session's latest result kind and in-flight state | frontend presentation |
| Unread / attention | count of results that arrived while the session was not active | frontend UI state |

## 3. Outcome

When this intention is complete, a person opening the deployed application at `/` can, in one browser page:

1. start a proposal session by pasting a brief or typing an instruction, and see the agent working on it in the same column;
2. answer or explicitly skip the agent's clarification questions through a structured panel instead of prose;
3. see the prepared proposition on the right: its fields, its line items, where each value came from, what is unresolved, and what the agent assumed or warns about;
4. correct values inline, replace a selected content item, or send a revision instruction, and see the proposition update as a new version that keeps their edits;
5. switch to an approximate client-facing preview and back;
6. run several such sessions in parallel tabs, switch between them, reorder and close them, and see at a glance which one needs attention, without any session losing its in-memory work;
7. approve the exact proposition and watch a Proposales draft be created; then see the draft's identity, the editor link, the amounts Proposales actually applied, and the plain statement that it is a draft and nothing was sent;
8. when creation fails, return to the intact proposition with the reason shown, and retry when retrying is meaningful;
9. do all of the above with a keyboard and a screen reader, with visible focus and honoured reduced-motion.

The central product result is unchanged from the backend intention: *a Proposales draft exists and the human opens the editor to finish and send it.* The frontend's contribution is that the human got there by collaborating with the agent on a work surface, not through a chat box beside a form.

## 4. Hard constraints

Each has a MUST-level source. None is negotiable inside this initiative.

- **The browser is never authoritative.** It renders copies of server-validated state and sends intents; every consequential value crossing back is parsed, validated, and decided on the server (contract 02 §6, 05 §5, 10 §1).
- **No client-side or application persistence.** No `localStorage`, `sessionStorage`, IndexedDB, cookies-as-storage, database, cross-device state, or restore-after-reload affordance. A reload destroys the workspace and the UI says so rather than implying durability (contract 05 §5.2, contracts README "Session model"; ratified product boundary 3).
- **No commercial calculation or money parsing in the frontend.** Totals, subtotals, and per-block amounts are displayed from structured money values supplied through contracts; formatting happens in components; a formatted string is never read back into a number; the frontend performs no arithmetic on money (backend invariant 17, §17A.12; design 07 §1 rules 1–2; ratified boundary 11).
- **Approval is a human act on the exact reviewed proposition, executed deterministically, creating a draft, never sending.** After approval no model call changes business data before execution. Every word on the approval surface reinforces "draft, not sent" (backend §11.3, contract 08 §6; ratified boundary 10).
- **Nothing privileged in the client graph.** No import of `server/`, `@/lib/proposales`, `@/lib/ai`, `@/lib/agent`, or `@/lib/env/server` from any `"use client"` file; no secrets, tokens, or integration configuration in client state (contract 02 §2, §5; 10 §2).
- **No prototype architecture, intelligence, timing, or data is ported.** Every regex that "understands" text, every fake timer, every seeded id, every hard-coded amount, the snapshot session engine, the hover rail, the session-history panel, and every convenience object in design 10 §7 are excluded (contract 16 §5; design 10 §7).
- **Accessibility is part of implementing each element**, not a later pass: native controls, labels, keyboard operation, managed and visible focus, no colour-only state, reduced motion honoured (contract 05 §7; design 10 §5; ratified boundary 16).
- **Tailwind is the styling mechanism and `src/styles/tokens.css` is the single definition of visual values**; inline `style` only for runtime-computed values such as the dragged pane width (contract 15 §1–§3).
- **Types come from schemas.** The client never hand-writes a shape a feature schema defines and never keeps a copy of one; hand-written types are for UI-only shapes: props, view-state unions, view models (contract 05 §8, 06 §1).
- **Free text is data.** Model-authored and human-authored text is rendered as text, never as markup (contract 10 §4, §6).

## 5. The core experience

This section states behaviour at the intention level. Measurements, colours, radii, and motion timings are owned by the design specifications and are not repeated here; the spec section is cited where behaviour is defined.

### 5.1 The workspace shell (design 02)

- One screen, permanently split: agent surface left, proposal surface right. The agent surface is never a drawer, modal, or route.
- The divider is user-controlled within a clamped range, resettable, keyboard-operable as a real separator, and its width is page-lifetime UI state only (design 02 §3, §5; not persisted — §7 and ratified boundary 3 settle design 02's open question 1).
- Desktop-first: the designed environment is ≥ 1100px; between roughly 780px and 1100px the split holds and content reflows without horizontal page scroll; below that the layout must not corrupt, with the agent surface collapsing to a toggleable overlay as the acceptable minimum. No mobile redesign (design 02 §3.3; ratified boundary 15).
- The two surfaces are distinct landmarks (complementary region for the agent, `main` for the proposal).
- The prototype's hover navigation rail, edge hot-zones, and pin toggle are not part of the product (design 02 "Prototype-only"; ratified boundary 5).

### 5.2 The agent surface (design 03)

- A working column, not a chat window: agent turns carry structure (pills), the composer is replaced by the clarification panel when structured answers are needed, and the column is scoped to the active session.
- **Header:** the mark and agent name are inert branding in V1 (they were wired to the discarded rail; shaper resolution, §16 round 0). The history toggle and session-history list do not ship (ratified boundary 6).
- **Status line:** always present; shows the active session's note and phase label, and always agrees with the active tab's dot because both are projections of the same session runtime (§8.3). This settles design 03's open question 6: neither is authoritative; the runtime is.
- **Thread:** the human's messages as contained bubbles, the agent's turns full-width with optional scope badge, pills, and quick-reply chips; a `log` region announcing completed turns only; autoscroll that follows only while the user is at the bottom and never yanks a reader upward; a "jump to latest" affordance when scrolled away.
- **Working presentation:** while a turn for the *active* session is in flight, the thread shows the thinking indicator with an honest label and the chrome shows `working`. A non-active session with a turn in flight shows the tab signal only. The label is never a fabricated step sequence (design 03 "Prototype-only"; ratified boundary 7).
- **Empty state:** lead, secondary line naming accepted inputs, and the safety sentence that nothing reaches Proposales until the user approves the draft. That sentence is design truth and matches the ratified approval boundary.
- **Composer:** labelled textarea that grows then scrolls; Enter sends, Shift+Enter breaks; send is disabled on empty input and while this session's turn is pending (shaper resolution of design 03 Q5, by contract 05 §7's "disable re-submission while pending"); hidden entirely while the clarification panel is open.
- **Slash palette:** not in V1 (owner card 1, §15).

### 5.3 Parallel sessions (design 04)

- The user may have several sessions open during the page's lifetime: create, switch, reorder (pointer and keyboard), close, active session, unread badge on inactive tabs, status dot with a text equivalent in the accessible name (ratified boundary 2; design 04 §4–§5).
- **Switching a session may reset disposable UI mechanics but never destroys that session's page-lifetime workflow**: thread, proposition, clarification state, in-flight turn, and created result all survive until the tab is closed or the page reloads (design 04 §1, ratified boundary 2).
- **An in-flight turn belongs to the session that started it.** Its result lands in that session whether or not it is active; the origin tab reflects the new state and, if inactive, gains attention. This is a real pending request, not simulated background progress (design 09 §3.2; ratified boundary 7).
- Closing a session with in-progress work requires a guard (owner card 2, §15). Closing the last tab opens a fresh empty session; the strip is never empty. After a close, focus moves to the newly active tab.
- Tab status is **derived** from the session's latest result and in-flight state (§8.3), never stored as an independent truth; unread is presentation state cleared on activation (ratified boundary 8).
- No cap on session count in V1 beyond the strip scrolling with the active tab kept in view; overflow affordances are a design delta (shaper resolution of design 04 Q3–Q4).
- Whether `created` gets a visual distinct from `ready` is a design delta the owner may make in the specs; the accessible name already distinguishes them (design 04 Q1, not blocking).

### 5.4 Interaction pills (design 05)

- One shell, one height, one radius for every kind; glyph and disc tint vary; expandable kinds disclose a payload in place without scrolling the thread; link and action kinds act and are distinguishable non-visually; the accessible name carries kind, label, and meta.
- **What each kind may show in V1 is bounded by what the backend returns** (§2.4): a `thought` pill presents the agent's rationale, assumptions, and warnings of a proposition result; an `ask` pill is the record of a clarification's questions and their answered/skipped/open state and the bridge to the panel; a `link` pill carries the created draft's editor URL; an `action` pill carries a workspace intent (for example re-open the questions, review the proposition). A `diff` pill presents differences **only where the server supplies them** (§14.1 item 3).
- Live reasoning steps (done/current/pending) are not available in V1 because no backend result reports them (backend R4: no streaming); the step-list presentation is retained as vocabulary for a later streaming contract (§14.1).
- Expansion state is disposable UI state (design 05 §4.1; §8.1).
- Disabled, error, and loading pill states exist where an action pill's intent can be pending or fail (design 05 §6 "missing and worth defining"; contract 05 §6).

### 5.5 Clarification (design 06)

- When the active session's turn returns a clarification, the panel replaces the composer (§16 round 0 records the auto-open resolution). One question: single mode. Two or more: batch mode with segmented step progress, back/next, jump-to-step, "Skip all", and a batched send. Dismiss returns the composer without discarding the questions; the ask pill re-opens the panel.
- **Every question is skippable, and a skip is an explicit answer with meaning** (backend §8.2, M18). The panel never blocks skipping on validation.
- **What the panel submits is exactly the user's explicit choices, bound by question id**: a typed answer as typed, or a skip. No client-side normalisation, unit-appending, date prettifying, or coercion touches the submitted value; display formatting, if any, is separate and locale-aware (design 06 §4.2, §7).
- A question the user neither answered nor skipped is submitted as neither; an omission is never converted into a skip (backend §17A.7).
- **V1 renders the ratified question shape**: a question is text tied to an information item, and an answer is free text or a skip (backend §17A.7, master plan §6.4). Typed answers, option lists, amount suggestions, date inputs, units, per-question notes, and per-question skip labels are **presentation capabilities the panel may keep in its vocabulary but must not require or invent**: they appear only if a later backend amendment supplies typed questions (§14.1 item 1). The demo `qdefs` shape is not a contract (design 06 "Prototype-only").
- Keyboard model, radio-group semantics for options when they exist, focus on open, Escape to dismiss, `Cmd/Ctrl+Enter` to submit, per-question invalid/submitting/failed states, and the panel's non-modal nature are requirements (design 06 §4.6, §5, §6).

### 5.6 Proposal review (design 07)

- The right pane shows the current proposition's fields and line items, a readiness line that restates that nothing has been sent, and the approval action. The field set and item set are **the proposition's**, not the prototype's nine demo labels (design 07 "Prototype-only").
- **Provenance and unresolved information are presented, never derived.** Amber marks "the agent is not sure or nothing is here": unresolved and deferred items, absent consequential values (rendered as "default, Proposales applies …" where the backend's absence semantics say so, backend §17A.5), assumptions, and warnings. Green marks "resolved by a human": leaves whose source is `human`. Because the ratified domain carries `human` as the only mark of a human-set value (backend §17A.9), the presentation **distinguishes a human edit from an agent revision**; the flag copy is a design delta to the specs (design 07 Q2, resolved by the domain).
- **Inline edit is a human action.** Entering edit mode is keyboard-reachable; Enter commits, Escape cancels, focus returns to the trigger; a commit submits an explicit edit operation and renders the server's result, including a validation error at the field's path (contract 05 §6, §8; 06 §8). Save-in-flight and save-failed states exist. One field edits at a time. Edits are not applied locally as truth; the new proposition version is the server's answer.
- **Line items are editable through validated operations** — quantity and optional flag as leaves, removal, and replacement of the selected content — rather than ask-only (design 07 Q8, resolved by the backend's edit operations). Replacement in V1 draws on the block's retained alternatives; free-text human content search is owner card 3 (§15).
- **Pricing presentation before creation:** the proposition carries no price and no total (backend §3.1, §9.1, criterion 20). Each block states that the content library's price will apply; brief- or human-stated price expectations appear as commercial notes with provenance; there is **no total row and no "Needs price" arithmetic** before a draft exists. The design specs' priced rows, computed total, and unpriced note are demo content superseded by the ratified domain (conflict C-1, §13). The first sight of money is the created state (§5.8).
- **The approval action is available, never disabled, and never invites proceeding on an incomplete proposition** (design 07 §3.6). With unresolved or deferred items it is grey and its label names the risk; with none it is blue and names the act. The frontend does not compute approvability: if required-to-create items are missing the server refuses with a validation error naming their paths, and the review surface renders that answer (backend §17A.6, contract 05 §8). The word "push" is replaced by creation vocabulary because every word on this surface must reinforce "creates a draft" (shaper resolution of design 07 Q1; final copy is a design delta).
- "Ask the agent about <field>" opens a focus-managed dialog anchored to the field; submitting sends a revision instruction naming the field, and the reply lands in the thread with a scope badge (design 07 §3.7). The scope is presentation memory of where the question was raised (§2.4).
- Discard abandons the session's page-lifetime work and follows the same guard as closing a tab (owner card 2).
- The fields card is a description list; line items are a table with the header row; the view toggle is a two-option control with selection semantics; focus rings exist everywhere (design 07 §5).

### 5.7 Client preview (design 08)

- A read-only, light-surface, document-style rendering of the current proposition inside the same column, reached by the view toggle. It answers "does this read like something I would send?".
- **Non-authoritative by design and visibly so**: it is the application's own approximation, rendered from the same proposition data as the fields view, never an embedded Proposales editor, iframe, scraped page, or undocumented render endpoint. It carries a visible and programmatic disclosure that layout, imagery, and branding come from the Proposales template (design 08 Q1, resolved: yes; ratified boundary 9).
- **No grand total and no per-line price before creation** (conflict C-1): the preview renders title, narrative, and the line items' catalog-verbatim titles and descriptions; pricing is stated as coming from the content library. Work-surface strings such as "Not priced" never appear in a client-facing rendering (design 08 Q2, resolved by C-1: there is nothing unpriced to render; the line simply carries no price).
- Empty narrative omits the section; an empty proposition renders an honest empty document (design 08 §6 "undefined" states, resolved).
- Heading order, table or list semantics for items, a dark focus ring scoped to the light surface, and a hero that grows with its title are requirements (design 08 §5).

### 5.8 Approval, creating, created, failed (design 09)

- **Before:** §5.6's action.
- **During:** the right pane becomes a single centred working state with one honest label; the header, toggle, discard, and action are gone so re-entry is structurally impossible; the agent surface stays live; the operation is attributed to its session and survives switching (design 09 §3.2). There is no cancel in V1: the server performs one non-retryable create and a client-side cancel could not undo it (shaper resolution of design 09 Q2). Progress steps are shown only if the server reports them; V1's backend does not, so V1 shows one label (design 09 Q3, recommendation adopted).
- **After (created or recovered):** a confirmation naming the draft, its identifier (labelled, selectable), a neutral "Draft" badge, the reassurance that it is a draft and not sent, and two actions: **Open in Proposales** (opens the editor URL in a new browsing context so the page-lifetime workspace survives, with `rel="noopener noreferrer"`; design 09 Q4 resolved by ratified boundary 3 and contract 10 §10) and **Draft another** (a new session). The thread receives a turn with a link pill; the session's status becomes `created`.
- **The created state is where money first appears.** It presents the Applied Pricing exactly as returned: totals with and without tax, currency, and per-block values, labelled as *what Proposales applied, to be reviewed in the editor*, never as what was approved; when the read-back was unavailable it says so with the reason and still shows the draft as created (backend §15.1, §17A.12). It distinguishes a newly created draft from a recovered one, and shows the inline-recipient duplicate-contact notice when present (backend §9.2 (k)). This presentation is a scope addition the design specs do not cover (§13 C-1).
- **The session is terminal after creation**: the proposition remains visible for reference, editing and re-approval are not offered, and a re-approval the server refuses is rendered as the conflict it is, pointing at the existing draft (backend §11.3). "Can a created draft be revised from here?" (design 09 Q6) is answered: no; Proposales is the editing environment after handoff.
- **Failed:** an error state in the created state's vocabulary (attention medallion, headline naming what failed, the DTO message, the restatement that nothing was sent), with **Try again** offered only when the error is retryable and **Back to review** always first in tab order; the proposition is intact and returned to review; the session status returns to ready; the thread receives a failure turn; focus moves to the error heading with `alert` semantics (design 09 §4.3, contract 05 §6). The distinguishable failures are the taxonomy's: validation (paths shown against the review surface), conflict (existing draft link), integration failure (retryable or not), internal. Partial creation is not a state the backend can produce (one create, one read-back that never downgrades a success; backend §17A.12), which answers design 09 Q8.
- **Creation cannot be submitted twice from the UI while pending** (contract 05 §7, 04 §8; ratified boundary 10).
- Focus management across the three pane replacements and polite, debounced announcements are requirements (design 09 §5).

### 5.9 Visual foundation (design 01)

- `tokens.css` is recreated as the single flat set of visual values, taken from design 01's surface, border, ink, semantic, radius, shadow, and type tables, with the accessibility corrections applied where the two disagree (design 01 §5 "Required production corrections", design 10 §5: the correction wins).
- The design's five open questions (tab-strip tone, border-ramp collapse, hover easing, positive token, half-pixel type) are design deltas; V1 implements the current spec behaviour and reports them (design 10 §4). Two are resolved here because a contract decides them: the border ramp collapses to four steps and half-pixel sizes snap to the token scale, because contract 15 §2 requires one small flat token set.
- Typographic glyphs remain for pill-kind symbols; controls use a real icon set only if a recorded decision adopts one (contract 15 §5); otherwise glyphs stay with sufficient contrast and accessible names.

## 6. Scope ladder

### Must ship (frontend-core V1)

Production visual foundation (tokens, global focus and reduced-motion treatment) · workspace shell with resizable, accessible divider and narrow-width resilience · agent header, status line, thread with autoscroll guard, empty state, working presentation, composer · page-lifetime parallel session tabs with switch, reorder, close guard, unread, derived status · interaction pills for the result parts the backend returns · structured clarification panel for the ratified question shape · proposal review with provenance and unresolved-information presentation, inline human edits as explicit operations, line-item presentation with alternatives-based replacement · client preview with disclosure · approval action, creating, created/recovered with Applied Pricing, failed with taxonomy-driven recovery · accessibility for every interaction above · the presentation boundary of §9 with named temporary fixtures/adapters · the thin transport seam of §10.3 when its backend phase has landed · interaction tests per §11 and the one critical Playwright flow · a feature README at closeout.

### Only if cheap

Keyboard session-switch shortcut (`Cmd/Ctrl+1..9`) · strip-overflow indication (edge fades) · a copy button on the created identifier · `fadeUp` entry animation for agent turns under reduced-motion guard · a clamp-resistance cue on the divider · a "paper" preview variant under `prefers-color-scheme` · view-switch announcement polish.

### Explicitly deferred (not in frontend-core V1)

Durable frontend or session persistence of any kind · an application database for frontend state · `localStorage`/`sessionStorage`/IndexedDB · cross-device sessions · session history, archive, reopen · analytics surface and dashboard statistics · Product Library page · Settings page · the hover navigation rail · a proposal list surface (the created state links out; there is no in-app list) · automatic sending · undocumented Proposales editor embedding · WebSockets, SSE, or polling to simulate inactive-session progress · streaming of agent progress or tokens (a later backend contract) · live reasoning step traces · a full mobile redesign · reproducing the prototype's fake agent, pricing, follow-up-question, or progress logic · the slash palette (card 1) · free-text human content search UI (card 3) · authentication (a repository-level decision; card 4 concerns the exposure that its absence creates) · price overrides, discounts, tax editing (backend §18) · editing a created draft from Copilot (backend §18) · a typed-question clarification UI (a backend amendment first, §14.1) · turn-level change summaries computed by the client (§14.1) · per-user pane-width persistence (design 02 Q1; requires the persistence decision) · a component library or icon set adopted without the recorded decision contract 15 §5 requires.

## 7. Persistence and session model

Inherited unchanged and confirmed: no application database (contracts README, backend §4); the session lives for the browser page lifetime; no client persistence; a reload destroys every open session and the workspace states so plainly (contract 05 §5.2). Nothing in this intention requires, stages, or shapes itself around persistence that does not exist: no rehydration path, no serialisable session snapshot, no store shape justified by future storage (contract 05 §5.2 last bullet). Expanding this is a repository-level decision recorded in the contracts README, not a frontend change.

## 8. State and truth boundaries

Four kinds of state coexist in the browser during this initiative. They are separate typed things with separate owners and are never merged into one object (contract 05 §5; contracts README "Client state kinds"; design 10 §7 "the single giant `this.state`").

### 8.1 Disposable UI mechanics

Opened pill, open popover or dialog, current inline-edit target and its draft text, drag state, focus, pane width, composer draft text, clarification panel step and unsent typed values, view toggle, scroll position, hover. Owner: the component, hook, or surface that needs it. May be lost on session switch (design 04 §1). Never sent to the server as fact.

### 8.2 Shared page-lifetime workspace UI state

Active session id, the ordered list of open session tabs, tab order, per-session unread count, and the derived attention presentation. Owner: the workspace feature's client orchestration; a feature-scoped store is justified only when several components must share it and prop-passing has stopped being honest (contract 05 §5.1). Never authoritative for anything a server decides; ratified boundary 8.

### 8.3 Temporary page-lifetime session runtime (parallel-development seam)

Only what is needed so that switching tabs does not destroy an in-memory session before the authoritative domain contracts exist. Per session: a page-lifetime session identity (client-generated, distinct from the server-generated generation id, which exists only after a first turn; one meaning per name, contract 13 §8) · the current thread presentation · the latest result presentation (proposition, clarification, created, failed) · the in-flight turn, if any, so its result can be attributed to this session · the derived status.

Rules: it is intentionally small; it holds **view models** (§9), never a copy of a domain object it re-shapes; it is replaced, not extended, when the real caller-held objects arrive (§10.4); it is not a snapshot engine and does not serialise UI mechanics (design 04 "Prototype-only"). When the real domain state exists, "session runtime" becomes: the caller-held `ProposalWorkflowState` and `ConversationContext` as the server returned them (typed copies, one owner), plus the in-flight status and the presentation derived from them.

### 8.4 Authoritative domain state (arrives from `main`)

`ProposalWorkflowState`, `ConversationContext`, the proposition with structural provenance, information items and their resolution, clarification questions and answers, the approval envelope and its acknowledgment, `DraftResult` with Applied Pricing, the `ErrorDto` taxonomy. Owner: the server and the backend feature's schemas. The frontend **consumes and adapts** these; it never redefines, copies, extends, or reorders them, and it never keeps a hand-written type for them (contract 05 §8, 06 §9). The client holds them as the server returned them and sends them back as the server expects; every turn re-validates on the server regardless of what the client believed (backend §5.2, contract 05 §5).

### 8.5 One owner per value

A value exists as a server response held once, or as a view model derived from it, never as both plus a component copy. Derived presentation (formatted money, "N open", tab status) is computed from its source, never stored beside it without a written synchronisation rule (contract 05 §5, 12 "Components and client").

## 9. Parallel backend integration model

### 9.1 The principle

The frontend is implementable before the backend phases that own its data are approved. Until a real contract exists, implementation may use fixtures, temporary presentation adapters, view models, and the minimal runtime of §8.3. These are temporary integration mechanisms; none becomes an authoritative contract, and the backend is never asked to conform to them.

```
EARLY   named fixture → temporary adapter → view model → presentation component
LATER   real domain/server result → production adapter → the SAME view model → the SAME presentation component
```

### 9.2 View models are presentation boundaries, not mock data

A view model is the shape the presentation needs in order to render, named for the view, typed as presentation, owned by the presentation layer (design 10 §3). It is authored deliberately, not lifted from a fixture. A real domain type maps *into* it through an adapter. When the real contract arrives, the adapter's input changes and the presentation components do not; if they must, the boundary was drawn in the wrong place and the boundary is fixed (design 10 §3 step 4).

Signs a view model has been promoted from mock data, each a defect: field names mirror a prototype object; it carries fields the view does not use; it mixes display strings with raw values; it lives beside domain code; it reads like a description of the business.

### 9.3 Fixtures

Before a backend schema phase has merged, fixtures populate view models directly and are named as fixtures. **After the owning schema phase has merged, a fixture is an instance of the real schema and flows through the production adapter**, so the fixture can never drift from the contract. A fixture that survives into production is an explicit, named placeholder, never an unmarked hard-coded value pretending to be data (contract 16 §2 step 6). No fixture contains real personal or customer data (contract 11 §5).

### 9.4 The critical invariant

> **Never promote a prototype convenience object, a fixture shape, a temporary runtime object, or a presentation view model into an authoritative production domain contract merely because the frontend was implemented first. Likewise, never require backend or domain implementation to conform to a temporary frontend shape.**

Operational consequences the planner must carry into criteria:

- the frontend stream never creates a file under a backend-owned schema folder and never edits a backend schema; a needed field is a change to the backend intention, made deliberately (contract 16 §3 "the domain model does not bend to the prototype");
- adapters are one per boundary, marked as adapter-era code, and their whole job is to be deleted (design 10 §3 step 3);
- the seam between "what the server returned" and "what the view renders" is a single explicit place per surface, so that replacing it is a local change.

## 10. What happens when real contracts arrive from `main`

### 10.1 Merge cadence

`main` is merged into `proposal-copilot-frontend` when a backend phase whose contracts the frontend consumes is `APPROVED` (backend master plan §4). The frontend never cherry-picks unapproved backend work and never implements against a phase plan's *proposed* shape as if it were merged.

### 10.2 Backend phases and the frontend surfaces that wait on them

Derived from the backend master plan §4 and §6; the planner sizes the frontend phases so that each surface can be built on fixtures first and rebound on merge.

| Backend phase (main) | What it establishes | Frontend surfaces that rebind to it |
|---|---|---|
| 5 proposition schema and provenance | the proposition, structural provenance, blocks, alternatives, notes, warnings | review fields, line items, provenance flags, client preview, thought pill |
| 6 information items, clarification, workflow state | question/answer shape, unresolved items, `ProposalWorkflowState`, generation id, draft reference | clarification panel, ask pill, readiness line, session runtime (§8.3 → §8.4) |
| 10 conversation context | `ConversationContext`, turn rendering | thread presentation |
| 11 prepare and clarify turns | `prepareFromBrief`, `answerClarification` results | brief submission, working state, first results |
| 12 edit, human search, revise | edit operations, `searchContentForHuman`, `reviseProposition` | inline edit, replacement, revision instruction, ask-about-field |
| 13 approval validation | envelope, acknowledgment, terminality, validation paths | approval action, approval errors |
| 14 execution | `DraftResult`, Applied Pricing, created/recovered, notices | creating, created, failed states |

### 10.3 The transport seam

The backend's v1 deliberately exposes **no transport**: services are called with plain arguments and there is no Server Action or Route Handler (backend §16.2, master plan R3). The UI needs one. The contracts fix its shape: thin Server Actions in the feature's `server/actions.ts`, each parsing `unknown` input with a feature schema, calling one service, and returning a discriminated result carrying either the turn result or an `ErrorDto`, never throwing for expected failures (contract 04 §3, 02 §4, §6). Streaming, if it ever exists, goes through a Route Handler and a `client/` adapter (contract 05 §4, 08 §9) and is not in V1.

Which stream owns writing those actions is not decided by either ratified plan; it is owner card 4 together with the exposure question it raises (§15). Whatever the answer, the actions are written against approved, merged services, listed under the frontend plan's applicable contracts (04, 02, 06, 10), and added phase by phase as their services land.

### 10.4 What "replacing a seam" means

For each surface: the fixture is deleted or demoted to a named test fixture; the temporary adapter is replaced by the production adapter from the real result to the same view model; the §8.3 runtime field that held a presentation stand-in is replaced by the typed server-returned object; the presentation component is untouched; the interaction tests keep passing with the fixture now shaped by the real schema. A merge that forces a presentation component to change is a finding against the boundary, not a reason to change the backend.

## 11. Testing intent

By layer (contract 11 §2–§3), what must be provable:

| Behaviour | Layer | Doubles |
|---|---|---|
| every variant of every surface's flow-state union renders intentionally: idle, working, clarification, proposition, created, recovered, failed by taxonomy code, and each error DTO's message is shown rather than replaced | component | none (props) |
| session switch preserves each session's runtime; an in-flight turn's result lands in its originating session while another is active; close activates the neighbour; last close opens a fresh session; unread clears on activation | hook/store tests without rendering, plus one interaction test | stubbed transport |
| tab strip, separator, clarification panel, pills, inline edit, ask dialog, and the three pane transitions are keyboard-operable with focus landing where §5 says | component/interaction | none |
| the clarification submission equals the user's explicit choices bound by question id with no coercion; an unanswered question is absent | hook | stubbed transport asserting the payload |
| inline edit submits an explicit edit operation and renders a path-bound validation error from the server's answer | hook + component | stubbed transport |
| the review and preview surfaces contain no money arithmetic and no parsing of formatted strings; money display is formatting of a structured value | source scan with a planted defect, plus component tests | none |
| the approval intent carries the exact reviewed proposition and acknowledgment; the control blocks while pending; a failed creation returns the intact proposition to review | hook + component | stubbed transport |
| no `"use client"` module reaches server authority; every domain-shaped value enters presentation through an adapter into a view model | lint boundary rule and an adapter-swap test (fixture adapter and production adapter feed the same component) | none |
| the critical flow end to end: enter a brief, receive a proposition, correct it, approve, the stub receives exactly the approved payload, the editor handoff is shown (contract 11 §3) | Playwright, once the transport exists | stubbed Proposales and AI |

Styling is reviewed visually, never snapshotted; large DOM snapshots are prohibited (contract 11 §3, §5). The existing `e2e/bootstrap.spec.ts` is replaced or repaired by the phase that restores the shell (§14.3).

## 12. Measurement ledger

Observable outcomes that, measured true, mean this intention shipped. Every downstream criterion traces to one of these or to a mechanism contract the inventory will add.

| ID | Objective (observable) | Defect family guarded |
|---|---|---|
| **F1** | Several sessions can be created, switched, reordered, and closed within one page lifetime; no non-active session loses its thread, proposition, clarification state, or created result on a switch; a turn started in session A lands in A while B is active and A shows attention. | session cross-talk; lost in-memory work |
| **F2** | Every domain result kind the backend can return (`clarification`, `proposition`, `failed`, `created`, `recovered`) and every `ErrorDto` code has an intentional rendering in the thread and on the proposal surface; no DTO message is replaced by a generic one; retry is offered only when `retryable`. | unrendered or swallowed states |
| **F3** | A clarification is answerable and skippable per question in single and batch mode; the submitted payload equals the user's explicit answers and skips bound by question id, with no client-side normalisation or coercion; an unanswered question is neither answered nor skipped. | omission recorded as a decision; coerced values |
| **F4** | The review and preview surfaces render only values carried by the proposition or its view model: no money arithmetic, no parsing of formatted strings, no client-derived provenance, completeness, or approvability; a human edit is submitted as an explicit operation and a `human`-sourced leaf is presented as human-set, distinct from agent-revised. | frontend-fabricated commercial or workflow truth |
| **F5** | "Create in Proposales" submits the exact proposition being reviewed with the acknowledgment as data, blocks re-submission while pending, and the outcome shows the editor link, "draft, not sent", newly-created versus recovered, and Applied Pricing exactly as returned or marked unavailable; a failed creation returns the intact proposition to review with the DTO message. | double submit; implied send; lost work on failure; reinterpreted money |
| **F6** | Every workspace interaction is keyboard-operable with visible focus and correct semantics (tablist, separator, log, dialog, description list, table, radio group where options exist); no state is colour-only; reduced motion is honoured; proven by interaction tests, not by review. | accessibility deferred |
| **F7** | No client-graph module imports server authority; every domain-shaped value crosses one explicit adapter into a view model; fixtures and adapters are named and temporary; swapping the fixture adapter for the production adapter changes no presentation component and keeps the interaction tests green. | prototype contamination; fixture promoted to contract; backend bent to the UI |

## 13. Conflicts discovered (surfaced, not silently resolved)

| ID | Conflict | Required decision and its source |
|---|---|---|
| **C-1** | Design 07 and 08 present per-line prices, a computed total, "Needs price" flags, an unpriced note, and a 36px grand total in the client preview. The ratified backend intention (§3.1, §9.1, invariant 16–17, criterion 20) establishes that the proposition carries **no price and no total before creation**, that each block takes library pricing, and that the first sight of money is the Applied Pricing read back after creation. | The backend intention is the truth authority for pricing (design 10 §1). Resolution: the review and preview show library-pricing statements and commercial notes, no total; the created state gains an Applied Pricing presentation the specs do not cover (§5.6–§5.8). The design specs need a recorded delta; this document does not edit them. Presented on the ratification surface (§15.1 item 4a). |
| **C-2** | Design 06 specifies typed questions (choice, amount with suggestions, date, unit, note, per-question skip label). The ratified clarification shape is text question + free-text answer or skip (backend §17A.7). | The backend owns clarification truth. Resolution: V1 renders the ratified shape; the richer mechanics stay presentation vocabulary that only a backend amendment can activate (§5.5, §14.1 item 1). Surface item 4b. |
| **C-3** | Design 07's "Push anyway" is never disabled and lets the user proceed with open questions. The backend refuses approval when a required-to-create item is unresolved (§17A.6) and accepts deferred or optional gaps. | Both hold: the action stays available; the server's refusal is rendered at the named paths; the UI never computes the verdict (§5.6). Copy is a design delta. No owner decision needed; recorded for transparency. |
| **C-4** | Current-state documents (root README, contracts README, contract 15 §4/§6) describe primitives, `tokens.css`, and a CSS-Modules foundation that commit `f957f66` deleted; the committed `globals.css` imports the missing `tokens.css` (an uncommitted working-tree edit dropping the import exists, §2.1); the e2e spec asserts a shell the layout does not render. Contract 14 §1 requires current-state documents to be true. | Owner acknowledgement that the frontend project's first phase restores `tokens.css`, repairs or replaces the e2e spec, and patches the three documents (or that a dedicated maintenance change does it first). §14.3 item 1. Not a product decision; listed so nobody documents the deleted foundation as present. |
| **C-5** | The backend plan adds no transport (R3) because an unprotected execution path in a deployment with no authentication is a stated risk (backend §16.2). The UI needs Server Actions, which are public endpoints (contract 04 §3, 10 §3). | Owner card 4 (§15). |
| **C-6** | Design 04 §1 says sessions "advance while unfocused". Ratified boundary 7 forbids fake background transport. | Not a real conflict once stated precisely: a session advances while unfocused only because a real turn it started is still in flight; nothing simulates progress (§5.3). Recorded so the phrase is not read as a polling requirement. |

## 14. Intentionally unresolved, and who owns the resolution

### 14.1 Owned by the backend intention or a backend phase

1. **Typed clarification questions** (options, amounts, dates, units, notes, skip labels): whether they exist at all is a backend intention amendment (its §8.2, §17A.7). The frontend keeps the mechanics as vocabulary and builds the ratified shape.
2. **Field-scoped revision**: whether "ask the agent about <field>" becomes a structured parameter of the revision turn rather than wording inside the instruction. Backend phase 12 / intention §11.2.
3. **Turn-level change summaries** (the `diff` pill's "3 fields changed"): whether the difference between consecutive proposition versions is a server-supplied result, a client-side presentation derivation over two server-emitted propositions, or not shown. Today the state carries exactly two propositions and the only server-supplied differences are revision warnings with before/after and the approval diff (backend §17A.3, §17A.9, §17A.10). The client does not compute it until this is decided.
4. **Streaming and live progress** (reasoning steps, creation steps, token streaming): no backend contract; a later Route-Handler streaming decision (contract 08 §9, backend R4).
5. **What a human-search replacement looks like** if card 3 chooses to ship it: the candidate shape is `searchContentForHuman`'s (backend phase 12); the UI would render it, not define it.
6. **Approver identity and any per-user state**: absent by decision (backend §11.3; contracts README "Authentication").

### 14.2 Owned by the design specifications (design deltas, non-blocking)

Tab-strip tone, border-ramp collapse (resolved by contract 15 §2 as four steps), hover easing, the positive token, half-pixel type snapping, `ready` versus `created` dot distinction, inactive-tab close-on-hover, overflow indication, `thought` versus `action` hue, acting versus disclosing pill shell, default pill expansion states, the panel's stacked-questions mode, partially-filled batch send (currently allowed), visible after-the-fact "skipped" record, `≈` suggestion semantics, the 62vh cap, popover anchoring unification, field grouping, centred versus left-aligned intro prose, hero growth, print/PDF/copy on the preview, final copy for the approval action, the human-edit and agent-revision flag labels, the creation error-state values. V1 implements the current spec behaviour where it does not conflict with §13, leaves a marker, and reports (design 10 §4).

### 14.3 Owned by the frontend planning pass (mechanism and sequencing, not product)

1. Restoring `tokens.css`, the shell landmarks and skip link, the e2e spec, and patching the stale documents of C-4 in the first phase.
2. The feature folder for the workspace: whether it is the client half of `src/features/proposal-preparation/` or a sibling feature importing that feature's `schemas/`, `types/`, and `server/index.ts` only (contract 03 §4, §6). Ratified boundary 1 ("one feature workspace") constrains the *experience*, not the folder.
3. Where the client subtree begins under `/` so that server-rendered structure composes around the interactive surfaces (contract 02 §1); the store ladder position of §8.2 and §8.3 (contract 05 §5.1); whether any composite widget (tabs, dialog, popover) justifies the recorded adoption of an accessible-primitive library (contract 15 §5).
4. The Vitest globs that will collect component and hook tests (master plan §10.3 hazard).
5. Phase sizing so that every surface is buildable on fixtures first and each phase closes green on its own (charter, ≤ 8 criteria per phase).

## 15. ⚠ OWNER DECISIONS REQUIRED (4)

Cards are the only owner-facing prose in this document. Each is answerable in one line.

### Card 1 — Does the slash palette ship in frontend-core V1?

**Question.** Ship the `/` command palette above the composer in V1, or defer it?
**Story.** You type `/` to start a new session quickly. In the prototype the palette's commands were `/new`, `/draft` (loads demo notes), `/history` (opens the non-V1 history panel), `/pushed` (filters demo data), and four fake routes. Not one of them survives; a V1 palette would need a command set invented for it, plus a full listbox keyboard model, for a feature nobody has asked for yet.
**Branches.** *Defer:* no palette; the new-session button and the tabs cover the real command. *Ship:* define a real command set now, add the listbox semantics, and accept the extra surface in every session's review.
**Recommendation.** Defer. The prototype's command set is entirely prototype-only and the MVP scope brief trims surfaces the workflow does not need.
**On silence.** The gate holds; nothing is built either way.
**Trace.** §5.2, §6 "Explicitly deferred", design 03 §3.8.

### Card 2 — What guards closing a session or discarding a draft?

**Question.** When the user closes a tab or presses Discard on a session with in-progress work, confirm first, or close immediately with an undo?
**Story.** You have three sessions open. Reviewing the second, you mean to close the first and hit the close on the active tab instead. The prototype throws the draft away with no way back; the page-lifetime model means it is gone for good.
**Branches.** *Confirm:* one explicit step naming what will be lost; simplest, no toast surface to build, consistent with how consequential actions confirm elsewhere. *Undo:* closes at once and offers to restore for a few seconds; needs a toast region, a timer, and a place to keep the closed session alive meanwhile.
**Recommendation.** Confirm, only for sessions that have a thread or a proposition; an empty session closes silently.
**On silence.** The gate holds; no session can be closed with work in it until decided.
**Trace.** §5.3, §5.6, design 04 §4.3, design 07 §4.4.

### Card 3 — Does V1 include free-text human content search for replacing a line item?

**Question.** Ship a human content-search surface in frontend-core V1, or replace only from the block's retained alternatives?
**Story.** The agent picked "Restoration service" for a line and kept two alternatives beside it. You disagree with all three and know the library has "Reupholstery package". With alternatives only, you tell the agent to look for it; with search, you type the name and pick the result yourself, with human provenance.
**Branches.** *Alternatives only:* replacement is a pick from up to three retained candidates; asking the agent covers the rest; no new surface. *Search:* a search input and result list on the line-items card, rendering the backend's human-search candidates; a new surface the design specs do not cover.
**Recommendation.** Alternatives only for V1; search is a follow-on surface once the backend's human search (phase 12) is merged and a design exists for it.
**On silence.** The gate holds; replacement ships as alternatives only, which is the minimum both branches share.
**Trace.** §5.6, §6, §14.1 item 5, backend §3 item 3 and §10.2.

### Card 4 — Who writes the UI's Server Actions, and how is their exposure handled?

**Question.** Assign the thin Server Actions to the frontend project (recommended) or to the backend project, and confirm the exposure decision: accept that the actions are reachable by anyone who can open the deployment, relying on deployment-level protection outside the application?
**Story.** The backend's plan calls its services from tests only, because anything reachable over HTTP in a deployment with no login can be called by anyone who finds the URL, including the action that creates a draft in your live Proposales company. The moment the UI exists, that path is reachable. Vercel's deployment protection can gate who can open the page at all, but the application itself will not check who is calling.
**Branches.** *Frontend writes them, exposure accepted with deployment protection:* the UI stream adds each thin action when its service lands; the README records that the application has no authentication and relies on deployment-level access protection for the MVP. *Backend writes them:* the backend plan gains a transport phase and the frontend waits for it. *Neither until authentication exists:* the UI cannot reach the server; a repository-level authentication decision comes first.
**Recommendation.** Frontend writes them; exposure accepted for the MVP with deployment protection, recorded in the contracts README's resolved decisions. The actions are a UI transport by contract, and the scope brief calls for an MVP.
**On silence.** The gate holds; the frontend builds on fixtures only and never reaches the server.
**Trace.** §10.3, §13 C-5, contract 04 §3, 10 §3, backend §16.2, master plan R3.

### 15.1 Ratification surface (to be presented when the cards are answered)

1. **Outcome.** §3, in the owner's words: one workspace where the human works with the agent on the proposal, reviews and corrects it, approves the exact proposition, and gets a Proposales draft with the amounts Proposales applied, to finish and send in Proposales.
2. **Measurement ledger.** §12, F1–F7 verbatim.
3. **Scope.** §6 must-ship and explicitly deferred.
4. **Consequential resolutions to confirm.** (a) No prices and no total anywhere in the UI before creation; Applied Pricing is presented in the created state exactly as returned (C-1). (b) V1 clarification renders text questions with free-text answer or explicit skip; typed questions require a backend amendment (C-2). (c) The approval action is never disabled; the server's refusal is rendered at the named paths; "push" wording is replaced (C-3). (d) Human edits are shown as human-set, distinct from agent revisions. (e) "Open in Proposales" opens a new browsing context. (f) No cancel during creation; one honest label instead of invented steps. (g) The created session is terminal in the UI. (h) The clarification panel opens automatically for the active session and is signalled by the tab for an inactive one. (i) The header mark and agent name are inert in V1. (j) Pane width is not persisted. (k) The first frontend phase restores the deleted visual foundation and patches the stale documents (C-4).

## 16. Shaping changelog

**Round 0 (2026-09-05, shaper, grounded draft).** Status `DRAFT`. Resolutions made from repository evidence, each open to owner override:

- **Pricing presentation before creation** resolved by precedence: the ratified backend intention is the pricing truth authority; the design specs' priced rows and totals are demo content (C-1). Added the Applied Pricing presentation to the created state as a must-ship consequence.
- **Clarification shape** resolved by precedence: V1 renders the ratified text-or-skip shape; typed mechanics stay vocabulary (C-2).
- **Approval availability** resolved as "available, server decides, refusal rendered" (C-3); "push" wording replaced with creation vocabulary because ratified boundary 10 makes every word on that surface reinforce draft creation.
- **Human versus agent change flags** resolved by the domain: structural `human` provenance exists, so the presentation distinguishes them.
- **Inert header mark and name**, **no pane-width persistence**, **new-context editor link**, **no cancel during creation**, **one creation label**, **terminal created session**, **auto-open clarification for the active session** (rationale: the backend asks once per preparation with a bounded batch, so auto-open cannot storm), **send disabled when empty or pending**, **no session cap**, **border ramp collapsed and half-pixel sizes snapped** (contract 15 §2): shaper resolutions with the cited rationale.
- **Client preview disclosure** resolved as required by ratified boundary 9.
- **Transport ownership and exposure** surfaced as card 4 rather than resolved: it crosses the no-authentication decision.
- **Slash palette**, **close/discard guard**, **human content search** surfaced as cards 1–3: each changes scope.
- **Repository drift after `f957f66`** recorded as C-4 and routed to the first frontend phase; not fixed here.
- **Ledger** F1–F7 proposed; F7 is the architectural measurement the parallel-stream model depends on.
- **Not decided here, deliberately:** component decomposition, hook and store names, folder placement, Server Action signatures, view-model field lists, adapter APIs, test file locations, phase boundaries. All belong to the planning pass (§14.3) or to the backend (§14.1).
