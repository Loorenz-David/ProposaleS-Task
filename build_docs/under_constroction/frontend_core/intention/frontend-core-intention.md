# Intention: Proposal Copilot Frontend Core

|                               |                                                                                                                                                                                                                                                                                                     |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**                    | `RATIFIED` (2026-09-05, by the owner, David, on the surface in §15.1 together with the four owner decisions recorded in §15; recorded in §16 round 2). Amended 2026-09-06 by owner decisions 5 and 6 (frontend dependency foundation, §4.1, §15), recorded in §16 round 3; status unchanged. Deepened 2026-09-06 by the round-1 mechanism inventory (§12A, ledger F8–F27), recorded in §16 round 4. Owner decisions 7–10 ratified that inventory's four recommendations in §16 round 5; status unchanged. Amended 2026-09-06 by owner decision 11 (persistent agent shell + session-controlled Main Application Surface; §1, §5.1, §5.3, §8.6, §15), recorded in §16 round 6; status unchanged. Deepened 2026-09-06 by the round-2 mechanism inventory (§12A.21–§12A.23, ledger F28–F30, in-place amendments to §12A.1, §12A.6, §12A.7, §12A.8 and §12A.17), recorded in §16 round 7. Owner decision 12 ratified its sole recommendation in §16 round 8; status unchanged and no owner decision is open.                                                                                                                                               |
| **Product**                   | Proposal Copilot                                                                                                                                                                                                                                                                                    |
| **Feature working name**      | Frontend Core (the production proposal workspace)                                                                                                                                                                                                                                                   |
| **Owner**                     | David (repository owner)                                                                                                                                                                                                                                                                            |
| **Shaped**                    | 2026-09-05                                                                                                                                                                                                                                                                                          |
| **Stream**                    | worktree `Proposales-frontend`, branch `proposal-copilot-frontend`, branched from the same checkpoint as `main`; `main` is merged into this branch as backend contracts are approved                                                                                                                |
| **Companion design evidence** | [`../ui_design/`](../ui_design/) — ten Markdown specifications extracted from the Claude Design prototype; read `10-design-integration-guide.md` first                                                                                                                                              |
| **Sibling intention**         | [`../../initial_core_feature_proposales/planing/proposal-preparation-backend-intention.md`](../../initial_core_feature_proposales/planing/proposal-preparation-backend-intention.md) — `RATIFIED`; the authority for every domain, commercial, approval, and execution fact this document refers to |
| **Governing contracts**       | listed in §2.2                                                                                                                                                                                                                                                                                      |

This document is the single authority for *what* the production frontend of Proposal Copilot must be and *why*. It does not decide *how*: no component tree, hook, store shape, file name, adapter API, or transport signature is chosen here unless a ratified repository decision already fixes it. A mechanism inventory and an implementation plan derive from it. It never restates the backend intention; where a domain fact matters it cites that document by section.

---

## 1. Purpose

Establish the **one production workspace** in which a human collaborates with the proposal-preparation capability while seeing, reviewing, correcting, previewing, and finally approving the proposal being prepared.

```
┌────────────────────────────┬──────────────────────────────────────┐
│ Agent Surface              │ Main Application Surface             │
│ (structurally persistent)  │ (session-controlled; in V1 it shows  │
│                            │  Proposal Preparation only)          │
│ session tabs               │ proposal review (fields, line items) │
│ conversation thread        │ provenance / unresolved information  │
│ agent interaction pills    │ client preview (approximate)         │
│ clarification              │ approval action → creating           │
│ composer                   │ created / recovered / failed result  │
└────────────────────────────┴──────────────────────────────────────┘
```

**The shell model (owner decision 11, §15).** The persistent shell is **Agent Surface + Main Application Surface**. The Agent Surface on the left is structurally fixed: it is not a generic chat widget and not a separate application, it is *the* interaction surface of the product, and it never leaves. The right side is the **Main Application Surface**: the active session controls the page-lifetime workflow and the meaningful UI context rendered there. **Proposal Preparation is the only Main Application Surface implemented in frontend-core V1**; everything the right side shows in V1 (review, preview, creating, created or recovered, failed) belongs to that one experience. That V1 fact does not make the shell itself proposal-specific, and it adds no other surface, page, list, dashboard, or route to V1 (§6). "Permanently split" (design 02 §1) means a persistent Agent Surface beside a Main Application Surface, not a persistent Agent Surface beside a permanently proposal-only pane. Component names and hierarchy for the shell are planning decisions (§14.3).

The human lifecycle the workspace serves, in the words of the ratified backend intention (§5), is: brief → the agent understands intent → clarification when necessary → a proposition is prepared → the human reviews → the human edits, replaces, or asks for revision → the human approves the exact proposition → deterministic server execution → a Proposales **draft** exists → the human opens it, performs the final monetary review, and sends from Proposales.

### 1.1 Why this is its own intention

The backend intention is explicitly backend-first (its §1: "The product UI comes later"). This document is the UI's root artifact. The two streams are temporary parallel implementations of one Next.js application; this intention exists so that the frontend can make useful progress before every backend phase is approved, **without** inventing the contracts those phases own (§9, §10).

## 2. Grounding

### 2.1 Repository state (verified 2026-09-05, branch `proposal-copilot-frontend` at `25d6b28`)

- Next.js 16 App Router, React 19, TypeScript strict, Zod 4, Tailwind CSS 4 (`tailwindcss`, `@tailwindcss/postcss`, `postcss.config.mjs`), Zustand 5 installed, `lucide-react` present in the working tree's `package.json` and lockfile (an uncommitted change observed on 2026-09-06), no Radix package present yet, Vitest 5 with `node` and `jsdom` projects, Playwright. Single Vercel deployment. No pre-styled component library, no remote-state library, no client persistence (contracts README "Scaffold decisions record"). The frontend dependency foundation this intention fixes is §4.1.
- **Backend progress on `main` merged into this branch:** phases 1–3 of the backend plan are `APPROVED` (`src/lib/env`, `src/lib/errors`, `src/lib/logger.ts`, `src/lib/values/`, the Proposales adapter's transport and content read with its fake and README). Phases 4–15 are `NOT_STARTED`. **No `src/features/` folder, no feature schema, no agent, no service, no Server Action, no Route Handler exists yet.** The backend plan deliberately adds no transport at all in its v1 (master plan R3).
- **Frontend code that exists:** `src/app/layout.tsx` renders a bare `<html><body>{children}</body></html>`; `src/app/page.tsx` returns `null`; `src/styles/globals.css` holds the reset, base typography, and a global `:focus-visible` treatment. Nothing else.
- **Frontend foundation that the current-state documents describe but which no longer exists.** Commit `f957f66` ("Removed bootstrap architecture") deliberately deleted `src/styles/tokens.css`, the shared primitives under `src/components/ui/` with their tests and CSS Modules, the shell layout and its CSS Modules, and the foundation page, as a bootstrap simplification. The root README, the contracts README ("Today: `Button`, `Input`, `Textarea`, `cx`"; the "Known conflicts" row about CSS Modules), and contract 15 §2/§4/§6 still describe that deleted foundation, and `e2e/bootstrap.spec.ts` still expects a `banner` landmark, a `main` landmark, and a "Skip to content" link that the bare layout does not render. Recorded as conflict C-4 (§13) and as a pre-implementation item (§14.3).
- **Verification baseline (run by the shaper on 2026-09-05 with dependencies installed via `npm ci`).** `npm run typecheck` passes; `npm run lint` passes; `npm test` passes (11 files, 118 tests); `npm run build` passes at `25d6b28`. At the preceding commit `404557d` the committed `globals.css` still imported the deleted `tokens.css`, which broke the production build; commit `25d6b28` removed that import, so the working tree, the build, and the commit now agree. The build failure was evidence of documentation/code drift (C-4), not by itself a reason to recreate the deleted file. The end-to-end suite was not run by the shaper; its spec is known stale (above).
- The existing test-runner configuration collects component tests only from specific paths, so a component test placed elsewhere is silently not collected (backend master plan §10.3 hazard). A fact the planning pass accounts for (§14.3).
- Documentation root for this application is `build_docs/` (owner decision recorded in the backend intention §2.1); this intention lives under `build_docs/under_constroction/frontend_core/intention/` by the owner's instruction.

### 2.2 Applicable architecture contracts

Classified against the contract guide §4–§5 and its scenario E ("Port a screen from an interactive prototype") plus the client half of scenario A. Contracts read and applied in this document:

| Contract                                | Why it applies here                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `16-design-prototype-porting.md`        | the entire initiative is a port from a Claude Design prototype: authority directions (§1), port protocol (§2), classification of every stateful concept (§3), translation table (§4), what must never be ported (§5)                                                                                                                                                                                                                                   |
| `05-client-architecture.md`             | components vs hooks, flow-state unions (§3), the three kinds of client state and their owners (§5), the store ladder (§5.1), page-lifetime session model (§5.2), errors/loading/retry (§6), accessibility (§7), types from schemas (§8), rendering agent output as proposed (§9)                                                                                                                                                                       |
| `15-ui-styling-and-component-system.md` | Tailwind as the mechanism, visual values defined once rather than repeated as literals, the inline-style rule, the shared-primitive promotion rule, the composite-widget decision (§5). Its §5 leaves the accessible-primitive library "intentionally undecided" and requires the adoption to be recorded in the contracts README with the widget that justified it; owner decisions 5 and 6 (§15) now take that product-side decision (Radix UI Primitives, Lucide icons), and the repository-level recording in the contracts README "Resolved decisions" and "Scaffold decisions record" (the "Component library: none decided" rows) is a separate documentation patch, not silently assumed here. Its §2 and §6 name a `tokens.css` file and a CSS-Modules foundation that no longer exist in the committed tree; that drift is conflict C-4 (§13), and this intention does not treat the named file as authoritative merely because the contract still names it |
| `02-runtime-boundaries.md`              | client islands inside server-rendered structure (§1–§2), what a `"use client"` graph may import (§5), what may cross the boundary (§6)                                                                                                                                                                                                                                                                                                                 |
| `03-feature-architecture.md`            | where the workspace lives, dependency direction, cross-feature imports (§4)                                                                                                                                                                                                                                                                                                                                                                            |
| `06-data-contracts-and-validation.md`   | types inferred from schemas, no hand-written boundary shapes, view DTOs, the client never re-parses valid values during render                                                                                                                                                                                                                                                                                                                         |
| `10-security-and-trust-boundaries.md`   | the browser is untrusted (§1), nothing secret in client state (§2), Server Actions are public endpoints and the application has no authentication (§3), free text is data (§4), external links (§10)                                                                                                                                                                                                                                                   |
| `08-agent-architecture.md`              | §6 (the HITL lifecycle the UI renders) and §9 (turns, no in-memory continuation) only; the UI represents agent behaviour and the approval boundary, it implements neither                                                                                                                                                                                                                                                                              |
| `04-server-architecture.md`             | §3 (the contract's default shape for the application's own UI transport: thin, validated, one service call, expected failures as results) and §6 (the error taxonomy the UI renders); read for the boundary the frontend will eventually call, not to design server code                                                                                                                                                                               |
| `11-testing-principles.md`              | component/interaction layer, ported-UI proof by interaction tests (§3), the critical Playwright flow (§3), no snapshot trees (§5)                                                                                                                                                                                                                                                                                                                      |
| `14-documentation-principles.md`        | this artifact's class (intention); feature README at closeout; the stale current-state documents in §2.1                                                                                                                                                                                                                                                                                                                                               |
| `12-anti-patterns.md`                   | sections "Components and client", "Styling and UI system", "Prototype porting", "Structure and abstraction"                                                                                                                                                                                                                                                                                                                                            |
| `13-decision-checklist.md`              | §1, §2 (cited by section)                                                                                                                                                                                                                                                                                                                                                                                                                              |

Not loaded: `07-integrations.md` (the frontend calls no external system; the server does), `09-database-and-persistence.md` (no persistence is introduced; the no-database decision is inherited unchanged and confirmed by §7). Reading a contract here never implies introducing what it governs.

### 2.3 Authority boundaries

Three sources govern the frontend and none substitutes for another (design 10 §1, contract 16 §1):

| Source                                                          | Authoritative for                                                                                                                                                                                                                                                       | Not authoritative for                                                                                                                                |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design specifications** (`../ui_design/01`–`10`)              | visual language, layout and hierarchy, interaction behaviour, presentation state vocabulary, motion, copy and empty states, the accessibility corrections they name, what the prototype tried and discarded                                                             | component architecture, state ownership and shape, data shapes, data flow, routing, persistence, anything the prototype's code did to run standalone |
| **Architecture contracts** (`architectural_contracts/`)         | component boundaries, feature ownership, runtime placement, state ownership, styling mechanism, validation, security, testing, documentation                                                                                                                            | product and screen decisions                                                                                                                         |
| **Ratified backend intention and the contracts it specializes** | commercial truth (prices, totals, currency, tax), workflow truth (result states, transitions, terminality), provenance truth, clarification truth (which questions exist, their shape, what an answer or a skip does), approval truth, execution truth, error semantics | how any of it looks                                                                                                                                  |

Consequence stated once: **where a design document shows a value, a label, a question, a field set, or a total, that content came from a demo fixture. The visual treatment is authoritative; the content is not** (design 10 §1). Where a design document's mechanism conflicts with a contract or a ratified decision, the intended experience is preserved and the mechanism is replaced (§13 lists each such case).

### 2.4 Vocabulary mapping (UI concept → ratified backend concept)

The design specifications use presentation words. This table fixes what each one *means* in domain terms so no later artifact promotes a presentation word into a contract, and so the planner knows which backend phase owns the real shape. Backend names are those of the master plan §6.4 naming registry.

| UI concept (design spec)                                  | Domain meaning                                                                                                                                                                                                                            | Owner of the real shape                                                               |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Session (tab)                                             | one in-memory proposal workflow for the page's lifetime, not merely a conversation tab: a page-lifetime session identity, the caller-held `ProposalWorkflowState` once a first turn has run, the caller-held `ConversationContext`, and the presentation runtime of §8.3 including the meaningful Main Application Surface working context needed to resume the session (§8.6) | session identity and meaningful presentation context: frontend (UI); state and context: backend phases 6 and 10 |
| Main Application Surface (the right side) | the session-controlled application surface of the persistent shell (§1); in V1 it renders only the Proposal Preparation experience: review, preview, creating, created or recovered, failed | shell: frontend presentation; content: the ratified backend results it renders |
| Thread                                                    | the human's instructions and the application-rendered results of each turn, in order; not the model's messages                                                                                                                            | `ConversationContext` turns (backend §17A.17) plus per-turn results                   |
| Assistant turn / pills                                    | the presentation of one turn's `DomainResult` (`clarification`, `proposition`, `failed`, `created`, `recovered`) and its parts: rationale, assumptions, warnings, unresolved items, questions, the draft result                           | backend §15.1, §17A.13                                                                |
| Pill kinds `thought` / `ask` / `diff` / `link` / `action` | presentation vocabulary only (design 05 §1); each is a rendering chosen at the view boundary for a part of a result                                                                                                                       | frontend presentation; never a response schema                                        |
| "Working"                                                 | a turn for this session is in flight (a pending server call), nothing more                                                                                                                                                                | frontend runtime (§8.3)                                                               |
| Clarification panel                                       | the questions of a `clarification` result; each answer is an explicit answer or an explicit skip bound by question id                                                                                                                     | backend §8.2, §17A.7                                                                  |
| Fields (review)                                           | the leaves of the current proposition: language, title, narrative, recipient leaves; each carries its own source                                                                                                                          | backend §9.2, §17A.4                                                                  |
| Line items                                                | the proposition's ordered blocks: catalog-verbatim title and description, quantity and optional flag (sourced or absent), reviewer comment, retained alternatives, `pricing: "library"`                                                   | backend §9.2, §17A.5                                                                  |
| Provenance flags ("Assumed", "Missing", "Updated")        | presentation of a leaf's `source`, of `unresolvedItems` with their resolution, of `assumptions`, of `warnings`                                                                                                                            | backend §17A.4, §17A.6, §17A.9                                                        |
| Inline edit                                               | a human edit operation (`set_leaf`, `remove_block`, `add_block`, `unset_recipient`, `confirm_empty_draft`) submitted to the edit turn; the result is a new proposition version with `human` provenance on the changed leaves              | backend §11.2, master plan §6.4 `editOperationSchema` (phase 12)                      |
| "Ask the agent about <field>"                             | a revision instruction (free text) whose wording names the field; the reply is the revision turn's result                                                                                                                                 | backend §11.2 `reviseProposition` (phase 12)                                          |
| Readiness line / "N open"                                 | the proposition's `unresolvedItems` (with resolution `unresolved` or `deferred_by_user`); never a client-computed approvability verdict                                                                                                   | backend §17A.6                                                                        |
| Client preview                                            | the application's own approximate document rendering of the current proposition                                                                                                                                                           | frontend presentation over the proposition                                            |
| "Create in Proposales"                                    | the explicit human approval act: submits the exact reviewed proposition with the library-pricing acknowledgment as data                                                                                                                   | backend §11.3, §17A.10 (phase 13)                                                     |
| Creating                                                  | the approval/execution turn in flight                                                                                                                                                                                                     | frontend runtime                                                                      |
| Created / recovered                                       | the `DraftResult`: proposal uuid, editor URL, `newlyCreated`, Applied Pricing (available or unavailable with reason), notices                                                                                                             | backend §15.1, §17A.12 (phase 14)                                                     |
| Failure                                                   | an `ErrorDto` (`code`, `message`, `details`) or a `failed` domain result with its reason                                                                                                                                                  | contract 04 §6, backend §15.2                                                         |
| Session status dot / phase label                          | a presentation projection of the session's latest result kind and in-flight state                                                                                                                                                         | frontend presentation                                                                 |
| Unread / attention                                        | count of results that arrived while the session was not active                                                                                                                                                                            | frontend UI state                                                                     |

## 3. Outcome

When this intention is complete, a person opening the deployed application at `/` can, in one browser page:

1. start a proposal session by pasting a brief or typing an instruction, and see the agent working on it in the same column;
2. answer or explicitly skip the agent's clarification questions through a structured panel instead of prose;
3. see the prepared proposition on the right: its fields, its line items, where each value came from, what is unresolved, and what the agent assumed or warns about;
4. correct values inline, replace a selected content item, or send a revision instruction, and see the proposition update as a new version that keeps their edits;
5. switch to an approximate client-facing preview and back;
6. run several such sessions in parallel tabs, switch between them, reorder and close them, and see at a glance which one needs attention, without any session losing its in-memory work, and find each session's workflow and its meaningful right-side working context as they left it when they return to it;
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
- **Tailwind CSS is the styling mechanism, and a visual value is defined once, never repeated as literals across components**; inline `style` only for runtime-computed values such as the dragged pane width (contract 15 §1–§3). Whether that single definition is a dedicated shared token file is not settled by this intention (§5.9, C-4).
- **Types come from schemas.** The client never hand-writes a shape a feature schema defines and never keeps a copy of one; hand-written types are for UI-only shapes: props, view-state unions, view models (contract 05 §8, 06 §1).
- **Free text is data.** Model-authored and human-authored text is rendered as text, never as markup (contract 10 §4, §6).
- **A deployment connected to live Proposales credentials is protected at the deployment/platform level; without adequate deployment protection, live mutation actions are not exposed** (owner decision 4, §15). Deployment protection is an operational access boundary and is **not** application authorization: it never makes browser input trusted, and the server boundary still parses, validates, and enforces the runtime, validation, human-approval, and integration contracts on every request (contract 10 §1, §3, §5).

### 4.1 Frontend dependency foundation (owner decisions 5 and 6, 2026-09-06)

The production frontend is built on exactly this layered foundation. Each layer owns one thing and none reaches into another's ownership:

| Layer | Owns |
|---|---|
| Next.js / React | application and runtime |
| Tailwind CSS | Proposal Copilot's visual styling: colours, typography, spacing, borders, radii, shadows, motion, visual states (§5.9; design specs) |
| Radix UI Primitives | headless, accessible interaction mechanics for composite interactions where a primitive's semantics match the intended interaction (§15 decision 6) |
| Lucide React | conventional interface icons for ordinary controls (§15 decision 5) |
| Proposal Copilot components | product-specific composition, behaviour, and interaction language |
| Zustand | feature-scoped shared page-lifetime UI state, only when contract 05 §5.1 justifies it |
| Zod and the backend feature schemas | validated contract shapes; the authoritative workflow and commercial truth stays server-side (§8.4) |
| Vitest, Testing Library, Playwright | verification (§11) |

Boundaries that follow from the layering: Radix and Lucide live inside the presentation/client layer only and never appear in backend or domain contracts, server service interfaces, view DTO definitions, or integration schemas. Radix may hold local interaction mechanics (open/closed, selected tab, focus, keyboard navigation), which are disposable UI mechanics under §8.1; it never owns or shapes `ProposalWorkflowState`, `ConversationContext`, the proposition, clarification, approval, execution, provenance, or any commercial value. Radix's visual identity is not imported; styling stays Tailwind and the design specs. Product semantics win: a primitive is used only where its semantics match, a native element is preferred when it is simpler and correct, and no interaction is distorted to fit an available primitive. No generic local wrapper is created around a primitive until the shared-primitive promotion rule (contract 15 §4) is actually met. Packages are added per milestone for the primitives actually used, never the whole ecosystem pre-emptively.

Not adopted by this foundation, each still subject to a demonstrated need and the repository's dependency rules (contract 10 §11, 13 §5): a pre-styled component library, shadcn-class copy-in generators, TanStack Query, React Hook Form, an animation library, a resizable-pane library.

## 5. The core experience

This section states behaviour at the intention level. Measurements, colours, radii, and motion timings are owned by the design specifications and are not repeated here; the spec section is cited where behaviour is defined.

### 5.1 The workspace shell (design 02)

- One screen, permanently split: the structurally persistent Agent Surface left, the session-controlled Main Application Surface right (§1, owner decision 11). The Agent Surface is never a drawer, modal, or route. The Main Application Surface renders the active session's meaningful working context; in V1 that context is always a state of the Proposal Preparation experience (§5.6–§5.8), and the shell is not architected as if it could only ever be that.
- The divider is user-controlled within a clamped range, resettable, keyboard-operable as a real separator, and its width is page-lifetime UI state only (design 02 §3, §5; not persisted — §7 and ratified boundary 3 settle design 02's open question 1).
- Desktop-first: the designed environment is the wide desktop split (design 02 §3.3). At narrower widths the workspace must remain usable and must not visually corrupt: basic narrow-width resilience is required, a full mobile redesign is outside V1 (ratified boundary 15). The exact narrow-layout mechanism (reflow thresholds, whether and how the agent surface yields) belongs to design and planning; design 02 §3.3 records the designer's current suggestion, and this intention does not promote it to product truth.
- The two surfaces are distinct landmarks (complementary region for the Agent Surface, `main` for the Main Application Surface).
- The prototype's hover navigation rail, edge hot-zones, and pin toggle are not part of the product (design 02 "Prototype-only"; ratified boundary 5).

### 5.2 The agent surface (design 03)

- A working column, not a chat window: agent turns carry structure (pills), the composer is replaced by the clarification panel when structured answers are needed, and the column is scoped to the active session.
- **Header:** the mark and agent name are inert branding in V1 (they were wired to the discarded rail; shaper resolution, §16 round 0). The history toggle and session-history list do not ship (ratified boundary 6).
- **Status line:** always present; shows the active session's note and phase label, and always agrees with the active tab's dot because both are projections of the same session runtime (§8.3). This settles design 03's open question 6: neither is authoritative; the runtime is.
- **Thread:** the human's messages as contained bubbles, the agent's turns full-width with optional scope badge, pills, and quick-reply chips; a `log` region announcing completed turns only; autoscroll that follows only while the user is at the bottom and never yanks a reader upward; a "jump to latest" affordance when scrolled away.
- **Working presentation:** while a turn for the *active* session is in flight, the thread shows the thinking indicator with an honest label and the chrome shows `working`. A non-active session with a turn in flight shows the tab signal only. The label is never a fabricated step sequence (design 03 "Prototype-only"; ratified boundary 7).
- **Empty state:** lead, secondary line naming accepted inputs, and the safety sentence that nothing reaches Proposales until the user approves the draft. That sentence is design truth and matches the ratified approval boundary.
- **Composer:** labelled textarea that grows then scrolls; Enter sends, Shift+Enter breaks; send is disabled on empty input and while this session's turn is pending (shaper resolution of design 03 Q5, by contract 05 §7's "disable re-submission while pending"); hidden entirely while the clarification panel is open.
- **Slash palette:** out of frontend-core V1 (owner decision 1, §15). The V1 actions have direct, visible surfaces; the prototype's command set is excluded with the rest of its prototype-only navigation.

### 5.3 Parallel sessions (design 04)

- The user may have several sessions open during the page's lifetime: create, switch, reorder (pointer and keyboard), close, active session, unread badge on inactive tabs, status dot with a text equivalent in the accessible name (ratified boundary 2; design 04 §4–§5). The strip's tablist mechanics (roving focus, arrow-key movement, selection semantics) rest on the adopted primitive foundation where its tabs semantics match (§4.1); reorder, close, unread, and the derived status remain Proposal Copilot behaviour composed on top of it.
- **Activating a session activates that session's whole page-lifetime workspace context**: the Agent Surface's content and context (thread, clarification, composer) **and** the meaningful Main Application Surface context (owner decision 11). The Agent Surface itself stays structurally fixed; only the session it presents changes. Session tabs never control the conversation pane alone.
- **Switching a session must restore both the session's workflow and its meaningful Main Application Surface working context.** Disposable UI mechanics may reset; the page-lifetime workflow (thread, proposition, clarification state, in-flight turn, created result) survives until the tab is closed or the page reloads (design 04 §1, ratified boundary 2), and so does the meaningful right-side context needed to resume the user's work (§8.6). Illustration only, not a prescription: session A is reviewing a proposition with a particular line item in hand, session B is looking at the client preview; A → B → A brings A back to what the user left, while hover, pressed state, or an incidental popover need not survive.
- **An in-flight turn belongs to the session that started it.** Its result lands in that session whether or not it is active; the origin tab reflects the new state and, if inactive, gains attention. This is a real pending request, not simulated background progress (design 09 §3.2; ratified boundary 7).
- **Closing a session that contains meaningful page-lifetime work requires explicit confirmation; an empty session closes immediately; no undo or archive mechanism exists** (owner decision 2, §15). The confirmation exists because nothing survives the close: V1 has no persistence, history, or reload recovery. Whether a session holds meaningful work is derived from its real session and workflow state at planning time, not from a presentation heuristic. Closing the last tab opens a fresh empty session; the strip is never empty. After a close, focus moves to the newly active tab.
- Tab status is **derived** from the session's latest result and in-flight state (§8.3), never stored as an independent truth; unread is presentation state cleared on activation (ratified boundary 8).
- No cap on session count in V1 beyond the strip scrolling with the active tab kept in view; overflow affordances are a design delta (shaper resolution of design 04 Q3–Q4).
- Whether `created` gets a visual distinct from `ready` is a design delta the owner may make in the specs; the accessible name already distinguishes them (design 04 Q1, not blocking).

### 5.4 Interaction pills (design 05)

- One shell, one height, one radius for every kind; glyph and disc tint vary; expandable kinds disclose a payload in place without scrolling the thread; link and action kinds act and are distinguishable non-visually; the accessible name carries kind, label, and meta.
- The pill-kind symbols (`✳`, `?`, `±`, `↗`, `▸`) are Proposal Copilot's presentation vocabulary, governed by the design specifications; they are **not** replaced by icons from the adopted icon library merely because one exists (§15 decision 5). The pill's affordance controls (expand/collapse chevrons and the like) are ordinary interface controls and may use the icon library, decorative and hidden from the accessible name.
- **What each kind may show in V1 is bounded by what the application returns** (§2.4): the kind the design specs call `thought` presents the **structured explanation the application returns with a result**: the agent's reviewer-facing rationale, its listed assumptions, its warnings, and result context. It never exposes the model's private reasoning or an internal chain of thought; nothing of that kind is a production output (backend §9.2 "agent rationale: text, not authority"; contract 08 §1). An `ask` pill is the record of a clarification's questions and their answered/skipped/open state and the bridge to the panel; a `link` pill carries the created draft's editor URL; an `action` pill carries a workspace intent (for example re-open the questions, review the proposition). A `diff` pill presents differences **only where the server supplies them** (§14.1 item 3).
- Live progress-step traces (done/current/pending) are out of scope: no backend result reports them (backend R4: no streaming), and they return only if a future backend contract defines a safe, user-facing progress representation (§14.1). The step-list presentation is retained as vocabulary for that case.
- Expansion state is disposable UI state (design 05 §4.1; §8.1).
- Disabled, error, and loading pill states exist where an action pill's intent can be pending or fail (design 05 §6 "missing and worth defining"; contract 05 §6).

### 5.5 Clarification (design 06)

- When the active session's turn returns a clarification, the panel replaces the composer (§16 round 0 records the auto-open resolution). One question: single mode. Two or more: batch mode with segmented step progress, back/next, jump-to-step, "Skip all", and a batched send. Dismiss returns the composer without discarding the questions; the ask pill re-opens the panel.
- **Every question is skippable, and a skip is an explicit answer with meaning** (backend §8.2, M18). The panel never blocks skipping on validation.
- **What the panel submits is exactly the user's explicit choices, bound by question id**: a typed answer as typed, or a skip. No client-side normalisation, unit-appending, date prettifying, or coercion touches the submitted value; display formatting, if any, is separate and locale-aware (design 06 §4.2, §7).
- A question the user neither answered nor skipped is submitted as neither; an omission is never converted into a skip (backend §17A.7).
- **V1 renders the ratified question shape**: a question is text tied to an information item, and an answer is free text or a skip (backend §17A.7, master plan §6.4). Typed answers, option lists, amount suggestions, date inputs, units, per-question notes, and per-question skip labels are **presentation capabilities the panel may keep in its vocabulary but must not require or invent**: they appear only if a later backend amendment supplies typed questions (§14.1 item 1). The demo `qdefs` shape is not a contract (design 06 "Prototype-only").
- Keyboard model, radio-group semantics for options when they exist, focus on open, Escape to dismiss, `Cmd/Ctrl+Enter` to submit, per-question invalid/submitting/failed states, and the panel's non-modal nature are requirements (design 06 §4.6, §5, §6). If and when a backend amendment supplies typed choices, their radio-group mechanics rest on the adopted primitive foundation (§4.1); the panel itself is not a dialog and does not become one to fit a primitive.

### 5.6 Proposal review (design 07)

- In V1 the Main Application Surface, in its review state, shows the current proposition's fields and line items, a readiness line that restates that nothing has been sent, and the approval action. The field set and item set are **the proposition's**, not the prototype's nine demo labels (design 07 "Prototype-only").
- **Provenance and unresolved information are presented, never derived.** Amber marks "the agent is not sure or nothing is here": unresolved and deferred items, absent consequential values (rendered as "default, Proposales applies …" where the backend's absence semantics say so, backend §17A.5), assumptions, and warnings. Green marks "resolved by a human": leaves whose source is `human`. Because the ratified domain carries `human` as the only mark of a human-set value (backend §17A.9), the presentation **distinguishes a human edit from an agent revision**; the flag copy is a design delta to the specs (design 07 Q2, resolved by the domain).
- **Inline edit is a human action.** Entering edit mode is keyboard-reachable; Enter commits, Escape cancels, focus returns to the trigger; a commit submits an explicit edit operation and renders the server's result, including a validation error at the field's path (contract 05 §6, §8; 06 §8). Save-in-flight and save-failed states exist. One field edits at a time. Edits are not applied locally as truth; the new proposition version is the server's answer.
- **Line items are editable through validated operations** — quantity and optional flag as leaves, removal, and replacement of the selected content — rather than ask-only (design 07 Q8, resolved by the backend's edit operations). **Direct human replacement in V1 is limited to the block's retained alternatives** (owner decision 3, §15): the human selects an alternative the agent already found and retained. When the alternatives are insufficient, the human asks the agent to search or revise again, and the updated proposition returns new candidates. A dedicated free-text human content-search UI is not part of this initiative; the backend's human-search capability (phase 12), if established, is unaffected by that and simply has no V1 surface.
- **Pricing presentation before creation:** the proposition carries no price and no total (backend §3.1, §9.1, criterion 20). Each block states that the content library's price will apply; brief- or human-stated price expectations appear as commercial notes with provenance; there is **no total row and no "Needs price" arithmetic** before a draft exists. The design specs' priced rows, computed total, and unpriced note are demo content superseded by the ratified domain (conflict C-1, §13). The first sight of money is the created state (§5.8).
- **The approval action.** "Create in Proposales" authorizes the creation of a **draft** only; nothing is sent automatically (ratified boundary 10). The frontend is never the authoritative judge of approvability: server-side approval validation decides, and any refusal is rendered with its reason and the paths it names (backend §17A.6, contract 05 §6, §8). Consequential unresolved, deferred, or missing information must be clearly presented beside the action so the user cannot approve an incomplete proposition by accident (design 07 §4.5's redundancy). Whether the control is enabled, disabled, or shown in a warning treatment while such information remains is a design/planning decision not ratified here; design 07 §3.6 records the prototype's current treatment. The word "push" is replaced by creation vocabulary because every word on this surface must reinforce "creates a draft" (shaper resolution of design 07 Q1; final copy is a design delta).
- "Ask the agent about <field>" opens a focus-managed dialog anchored to the field; submitting sends a revision instruction naming the field, and the reply lands in the thread with a scope badge (design 07 §3.7). The scope is presentation memory of where the question was raised (§2.4). Its focus management, dismissal, and ARIA relationships rest on the adopted primitive foundation (§4.1), as a dialog where dialog semantics are intended and as an anchored popover where they are not; the planning pass decides which matches design 07's intent, never the reverse.
- Discard abandons the session's page-lifetime work and follows the same rule as closing a tab: explicit confirmation when meaningful work exists, no undo (owner decision 2, §15).
- The fields card is a description list; line items are a table with the header row; the view toggle is a two-option control with selection semantics; focus rings exist everywhere (design 07 §5).

### 5.7 Client preview (design 08)

- A read-only, light-surface, document-style rendering of the current proposition inside the same column, reached by the view toggle. It answers "does this read like something I would send?".
- **Non-authoritative by design and visibly so**: it is the application's own approximation, rendered from the same proposition data as the fields view, never an embedded Proposales editor, iframe, scraped page, or undocumented render endpoint. It carries a visible and programmatic disclosure that layout, imagery, and branding come from the Proposales template (design 08 Q1, resolved: yes; ratified boundary 9).
- **No grand total and no per-line price before creation** (conflict C-1): the preview renders title, narrative, and the line items' catalog-verbatim titles and descriptions; pricing is stated as coming from the content library. Work-surface strings such as "Not priced" never appear in a client-facing rendering (design 08 Q2, resolved by C-1: there is nothing unpriced to render; the line simply carries no price).
- Empty narrative omits the section; an empty proposition renders an honest empty document (design 08 §6 "undefined" states, resolved).
- Heading order, table or list semantics for items, a dark focus ring scoped to the light surface, and a hero that grows with its title are requirements (design 08 §5).

### 5.8 Approval, creating, created, failed (design 09)

- **Before:** §5.6's action; the human's explicit act authorizes a draft and nothing else.
- **During:** the right pane becomes a single centred working state with one honest label; the header, toggle, discard, and action are gone so re-entry is structurally impossible; the agent surface stays live; the operation is attributed to its session and survives switching (design 09 §3.2). There is no cancel in V1: the server performs one non-retryable create and a client-side cancel could not undo it (shaper resolution of design 09 Q2). Progress steps are shown only if the server reports them; V1's backend does not, so V1 shows one label (design 09 Q3, recommendation adopted).
- **After (created or recovered):** a confirmation naming the draft, its identifier (labelled, selectable), a neutral "Draft" badge, the reassurance that it is a draft and not sent, and two actions: **Open in Proposales** (opens the editor URL in a new browsing context so the page-lifetime workspace survives, with `rel="noopener noreferrer"`; design 09 Q4 resolved by ratified boundary 3 and contract 10 §10) and **Draft another** (a new session). The thread receives a turn with a link pill; the session's status becomes `created`.
- **The created state is where money first appears.** It presents the Applied Pricing exactly as returned: totals with and without tax, currency, and per-block values, labelled as *what Proposales applied, to be reviewed in the editor*, never as what was approved; when the read-back was unavailable it says so with the reason and still shows the draft as created (backend §15.1, §17A.12). It distinguishes a newly created draft from a recovered one, and shows the inline-recipient duplicate-contact notice when present (backend §9.2 (k)). This presentation is a scope addition the design specs do not cover (§13 C-1).
- **The session is terminal after creation**: the proposition remains visible for reference, editing and re-approval are not offered, and a re-approval the server refuses is rendered as the conflict it is, pointing at the existing draft (backend §11.3). "Can a created draft be revised from here?" (design 09 Q6) is answered: no; Proposales is the editing environment after handoff.
- **Failed:** an error state in the created state's vocabulary (attention medallion, headline naming what failed, the DTO message, the restatement that nothing was sent), with **Try again** offered only when the error is retryable and **Back to review** always first in tab order; the proposition is intact and returned to review; the session status returns to ready; the thread receives a failure turn; focus moves to the error heading with `alert` semantics (design 09 §4.3, contract 05 §6). The distinguishable failures are the taxonomy's: validation (paths shown against the review surface), conflict (existing draft link), integration failure (retryable or not), internal. Partial creation is not a state the backend can produce (one create, one read-back that never downgrades a success; backend §17A.12), which answers design 09 Q8.
- **Creation cannot be submitted twice from the UI while pending** (contract 05 §7, 04 §8; ratified boundary 10).
- Focus management across the three pane replacements and polite, debounced announcements are requirements (design 09 §5).

### 5.9 Visual foundation (design 01)

- The production UI establishes a **coherent, reusable visual foundation** from design 01's surface, border, ink, semantic, radius, shadow, type, and motion tables, expressed through the repository's ratified Tailwind mechanism, with the accessibility corrections applied where the two disagree (design 01 §5 "Required production corrections", design 10 §5: the correction wins). Values are defined once and not repeated as literals in components (contract 15 §2's principle).
- The bootstrap `tokens.css` file and the shared primitives were deliberately deleted during bootstrap simplification and are **not** restored by this intention. A dedicated shared token abstraction or file is introduced only if the planning or implementation pass demonstrates that real reuse justifies it, and then the applicable architecture contract is updated and ratified accordingly. Stale documentation naming the deleted file is not a reason to recreate it (C-4).
- The design's five open questions (tab-strip tone, border-ramp collapse, hover easing, positive token, half-pixel type) are design deltas; V1 implements the current spec behaviour and reports them (design 10 §4).
- Typographic glyphs remain for the pill-kind symbols, which are product vocabulary (§5.4). Ordinary interface controls (new session, close, external link, expand/collapse, navigation arrows, status and action affordances) use the adopted icon library, Lucide (§4.1, §15 decision 5), sized and coloured by the Tailwind foundation. A decorative icon adds nothing to an accessible name; an icon-only control carries an accessible name of its own; an icon never carries state alone where non-visual information is required (contract 05 §7). Design 01 §1.11's recommendation to replace glyph controls with a real icon set is thereby adopted for controls and declined for the pill symbols.

## 6. Scope ladder

### Must ship (frontend-core V1)

Production visual foundation (coherent reusable values, global focus and reduced-motion treatment; §5.9) · the persistent split workspace shell (structurally fixed Agent Surface, session-controlled Main Application Surface; §1, §5.1) with resizable, accessible divider and basic narrow-width resilience · session-controlled restoration of meaningful Main Application Surface context on switch (§5.3, §8.6) · agent header, status line, thread with autoscroll guard, empty state, working presentation, composer · page-lifetime parallel session tabs with switch, reorder, confirmation-guarded close of sessions holding meaningful work, unread, derived status · interaction pills for the result parts the application returns · structured clarification panel for the ratified question shape · proposal review with provenance and unresolved-information presentation, inline human edits as explicit operations, line-item presentation with replacement from retained alternatives · client preview with disclosure · approval action, creating, created/recovered with Applied Pricing, failed with taxonomy-driven recovery · accessibility for every interaction above · the presentation boundary of §9 with named temporary fixtures and adapters · the thin, validated browser-to-server boundary, owned by this integration stream and added as the real backend services land (§10.3) · the verification outcomes of §11 · a feature README at closeout.

### Only if cheap

Keyboard session-switch shortcut (`Cmd/Ctrl+1..9`) · strip-overflow indication (edge fades) · a copy button on the created identifier · `fadeUp` entry animation for agent turns under reduced-motion guard · a clamp-resistance cue on the divider · a "paper" preview variant under `prefers-color-scheme` · view-switch announcement polish.

### Explicitly deferred (not in frontend-core V1)

Durable frontend or session persistence of any kind · an application database for frontend state · `localStorage`/`sessionStorage`/IndexedDB · cross-device sessions · session history, archive, reopen · analytics surface and dashboard statistics · Product Library page · Settings page · Customers or any other application surface in the Main Application Surface beyond Proposal Preparation, and any internal application routing added merely to demonstrate the shell's extensibility (owner decision 11: the shell is not proposal-specific, and that is not V1 scope) · the hover navigation rail · a proposal list surface (the created state links out; there is no in-app list) · automatic sending · undocumented Proposales editor embedding · WebSockets, SSE, or polling to simulate inactive-session progress · streaming of agent progress or tokens (a later backend contract) · live reasoning step traces · a full mobile redesign · reproducing the prototype's fake agent, pricing, follow-up-question, or progress logic · the slash palette and any prototype slash-command set (owner decision 1; reconsidered only when the product has enough meaningful commands to justify a command surface) · a dedicated free-text human content-search UI (owner decision 3; agent re-search remains the V1 path to broader content discovery) · an undo or archive mechanism for closed sessions (owner decision 2) · application authentication (not a V1 prerequisite; an optional later scope expansion handled as a deliberate repository/product decision, never assumed by this intention; owner decision 4) · price overrides, discounts, tax editing (backend §18) · editing a created draft from Copilot (backend §18) · a typed-question clarification UI (a backend amendment first, §14.1) · turn-level change summaries computed by the client (§14.1) · per-user pane-width persistence (design 02 Q1; requires the persistence decision) · a pre-styled component library, shadcn-class copy-in generators, TanStack Query, React Hook Form, an animation library, a resizable-pane library, or any icon or primitive library other than the adopted foundation of §4.1 (each requires a demonstrated need and a recorded decision).

## 7. Persistence and session model

Inherited unchanged and confirmed: no application database (contracts README, backend §4); the session lives for the browser page lifetime; no client persistence; a completed reload or browser-level navigation destroys every open session and the workspace states so plainly (contract 05 §5.2). While any session is creating a Proposales draft, the page requests the browser's standard departure confirmation before that destruction (owner decision 12, §12A.6). That request creates neither persistence nor a recovery guarantee: the browser owns its wording and availability, and a departure the user confirms still destroys the workspace. Nothing in this intention requires, stages, or shapes itself around persistence that does not exist: no rehydration path, no serialisable session snapshot, no store shape justified by future storage (contract 05 §5.2 last bullet). Expanding this is a repository-level decision recorded in the contracts README, not a frontend change.

## 8. State and truth boundaries

Four kinds of state coexist in the browser during this initiative. They are separate typed things with separate owners and are never merged into one object (contract 05 §5; contracts README "Client state kinds"; design 10 §7 "the single giant `this.state`").

### 8.1 Disposable UI mechanics

Opened pill, drag state, transient focus, pane width, clarification panel step and unsent typed values, scroll position, hover, tooltip visibility, animation and pointer/pressed state, and incidental popover mechanics. Owner: the component, hook, or surface that needs it. Interaction mechanics a headless primitive manages (open/closed, selected tab, roving focus) belong here too (§4.1): they are mechanics, never truth. They reset naturally on session switch (design 04 §1) and are never snapshotted, **except a non-empty composer draft: it remains associated with its session until sent, explicitly cleared, that session is closed, or the page reloads, so the close guard can protect it (decision 7).** Whether the active V1 work surface (fields or preview) or a meaningful selected review item counts instead as meaningful resumable context is decided by the planning pass under §8.6; neither is assumed disposable here. The typed text of an in-progress inline edit stays disposable per §12A.14. Never sent to the server as fact.

### 8.2 Shared page-lifetime workspace UI state

Active session id, the ordered list of open session tabs, tab order, per-session unread count, and the derived attention presentation. Owner: the workspace feature's client orchestration; a feature-scoped store is justified only when several components must share it and prop-passing has stopped being honest (contract 05 §5.1). Never authoritative for anything a server decides; ratified boundary 8.

### 8.3 Temporary page-lifetime session runtime (parallel-development seam)

Only what is needed so that switching tabs does not destroy an in-memory session before the authoritative domain contracts exist. Per session: a page-lifetime session identity (client-generated, distinct from the server-generated generation id, which exists only after a first turn; one meaning per name, contract 13 §8) · the current thread presentation · the latest result presentation (proposition, clarification, created, failed) · the in-flight turn, if any, so its result can be attributed to this session · the derived status · the **meaningful Main Application Surface working context** needed to resume that in-memory session, presentation-only (§8.6, owner decision 11).

Rules: it is intentionally small; it holds **view models** (§9), never a copy of a domain object it re-shapes; it is replaced, not extended, when the real caller-held objects arrive (§10.4); it is not a snapshot engine, retains only explicitly meaningful workspace context, and does not serialise UI mechanics or arbitrary component state (design 04 "Prototype-only"; §8.6). It remains page-lifetime only, non-authoritative, non-persistent, and adapter-era where applicable: no `localStorage`, `sessionStorage`, IndexedDB, database, server session, URL-addressable session, or reload restoration (§7). When the real domain state exists, "session runtime" becomes: the caller-held `ProposalWorkflowState` and `ConversationContext` as the server returned them (typed copies, one owner), plus the in-flight status and the presentation derived from them.

### 8.4 Authoritative domain state (arrives from `main`)

`ProposalWorkflowState`, `ConversationContext`, the proposition with structural provenance, information items and their resolution, clarification questions and answers, the approval envelope and its acknowledgment, `DraftResult` with Applied Pricing, the `ErrorDto` taxonomy. Owner: the server and the backend feature's schemas. The frontend **consumes and adapts** these; it never redefines, copies, extends, or reorders them, and it never keeps a hand-written type for them (contract 05 §8, 06 §9). The client holds them as the server returned them and sends them back as the server expects; every turn re-validates on the server regardless of what the client believed (backend §5.2, contract 05 §5).

### 8.5 One owner per value

A value exists as a server response held once, or as a view model derived from it, never as both plus a component copy. Derived presentation (formatted money, "N open", tab status) is computed from its source, never stored beside it without a written synchronisation rule (contract 05 §5, 12 "Components and client").

The Main Application Surface may render authoritative workflow values, but never duplicates or reconstructs them as presentation truth. Allowed: a session remembers that the user was viewing the client preview, or which review item they had selected. Not allowed: a session stores a second, independently maintained copy of the proposal's approval state because the preview needs it, or computes or stores price, provenance, or readiness from UI state.

### 8.6 Meaningful workspace context, disposable mechanics, authoritative truth

Session continuity on the Main Application Surface (§5.3) is bounded by three categories, and the distinction is the semantic boundary the planning pass implements (owner decision 11):

| Category | Survives a session switch? | Examples (illustrative, never an exhaustive schema) | Owner |
|---|---|---|---|
| **A. Meaningful page-lifetime workspace context** | yes, when required to resume the user's work | the active V1 work surface (review or preview); a meaningful selection or context; a meaningful open workflow location | the session's presentation runtime (§8.3); presentation-only |
| **B. Disposable UI mechanics** | no; they reset naturally | hover; tooltip visibility; transient focus; animation state; pointer or pressed state; incidental popover mechanics, unless the interaction itself is meaningful resumable work | the component or surface (§8.1) |
| **C. Authoritative domain and workflow truth** | it is never client-owned at all; it is rendered, held as returned, and sent back unchanged | proposition values; provenance; unresolved and deferred items; approval state; execution state; created proposal identity; commercial values | the backend and domain contracts (§8.4) |

Rules that follow:

- **Each session retains only the meaningful page-lifetime workspace context required to resume the user's work. Disposable interaction mechanics reset naturally and are not snapshotted.**
- **Session continuity must not be implemented by snapshotting arbitrary DOM or component state or every transient control. Only explicitly meaningful workspace context may be retained** (design 04 "Prototype-only" snapshot architecture; §12A.1's forbidden list).
- A value in category C never becomes category A because it is displayed on the Main Application Surface; the surface renders it from its one server-returned copy (§8.5).
- Which concrete interactions count as category A, and how that context is represented (component state, a reducer, a feature store, or a combination under contract 05 §5.1), are planning decisions (§14.3). This intention fixes the semantic invariant and the ownership only; it defines no object, slice, key, or field.

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

This is an architectural constraint and an outcome, not a mandate for particular filenames or adapter APIs. Its consequences, which the planner carries into criteria in whatever form it chooses:

- the frontend stream never authors, copies, or edits a backend-owned schema or domain shape; a needed field is a change to the backend intention, made deliberately (contract 16 §3 "the domain model does not bend to the prototype");
- temporary adapters and fixtures are explicitly named as temporary and are designed to be removed (design 10 §3 step 3);
- the seam between "what the server returned" and "what the view renders" is explicit and localized per surface, so that replacing it is a local change.

## 10. What happens when real contracts arrive from `main`

### 10.1 Merge cadence

`main` is merged into `proposal-copilot-frontend` when a backend phase whose contracts the frontend consumes is `APPROVED` (backend master plan §4). The frontend never cherry-picks unapproved backend work and never implements against a phase plan's *proposed* shape as if it were merged.

### 10.2 Backend phases and the frontend surfaces that wait on them

Derived from the backend master plan §4 and §6; the planner sizes the frontend phases so that each surface can be built on fixtures first and rebound on merge.

| Backend phase (main)                               | What it establishes                                                                              | Frontend surfaces that rebind to it                                                                                                                                                                                                                  |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5 proposition schema and provenance                | the proposition, structural provenance, blocks, alternatives, notes, warnings                    | review fields, line items, provenance flags, client preview, thought pill                                                                                                                                                                            |
| 6 information items, clarification, workflow state | question/answer shape, unresolved items, `ProposalWorkflowState`, generation id, draft reference | clarification panel, ask pill, readiness line, session runtime (§8.3 → §8.4)                                                                                                                                                                         |
| 10 conversation context                            | `ConversationContext`, turn rendering                                                            | thread presentation                                                                                                                                                                                                                                  |
| 11 prepare and clarify turns                       | `prepareFromBrief`, `answerClarification` results                                                | brief submission, working state, first results                                                                                                                                                                                                       |
| 12 edit, human search, revise                      | edit operations, `searchContentForHuman`, `reviseProposition`                                    | inline edit, replacement from retained alternatives, revision and re-search instruction, ask-about-field. The backend's human-search capability is established by this phase regardless; V1 exposes no dedicated search UI for it (owner decision 3) |
| 13 approval validation                             | envelope, acknowledgment, terminality, validation paths                                          | approval action, approval errors                                                                                                                                                                                                                     |
| 14 execution                                       | `DraftResult`, Applied Pricing, created/recovered, notices                                       | creating, created, failed states                                                                                                                                                                                                                     |

### 10.3 The transport boundary

The backend's v1 deliberately exposes **no transport**: its services are called with plain arguments and nothing is reachable over HTTP (backend §16.2, master plan R3). For the UI to reach real services, a **thin, validated client/server transport boundary** must eventually exist. What this intention fixes about it is only what the contracts already fix: it validates every input as untrusted, calls the real backend services, which remain authoritative, returns expected failures as data the UI renders intentionally, never lets the frontend call an integration directly, and respects the runtime and security contracts (02, 04 §3, 06, 10). Its concrete form, location, and signatures are planning decisions. Streaming is not in V1 (§14.1).

**Ownership (owner decision 4, §15).** The frontend/application integration stream owns that boundary and adds it as the real backend services become available and are merged. The backend/domain services stay transport-independent and authoritative: the boundary calls them, never the reverse, and never alters them. Conceptually:

```
browser → thin validated application/server boundary → backend/domain service → Proposales integration
```

**Exposure (owner decision 4).** Application authentication is not a V1 prerequisite and frontend planning does not depend on it. A deployment connected to live Proposales credentials is protected at the deployment/platform level, and where adequate deployment protection is absent, live mutation actions are not exposed. That protection is an operational boundary only: browser input stays untrusted, and the server boundary enforces every runtime, validation, human-approval, and integration contract regardless (§4). If application authentication is later added, that is a deliberate repository/product decision, not something this intention assumes.

Until the backend services a surface needs have merged, the frontend builds that surface on fixtures (§9).

### 10.4 What "replacing a seam" means

For each surface: the fixture is removed or kept only as an explicitly named verification fixture, now shaped by the real schema; the temporary adapter is replaced by a production adapter from the real result to the same view model where appropriate; the §8.3 runtime stand-in is replaced by the typed server-returned object; the presentation component is untouched where practical; existing verification of the surface stays valid. A merge that forces a presentation component to change is a finding against the boundary, not a reason to change the backend.

## 11. Verification intent

What must be provable by automated verification when this intention ships. Which layer proves each item, with which doubles and which tools, is decided by the planning pass under contract 11; this section names outcomes only.

- Every surface renders each of its states intentionally: idle, working, clarification, proposition, created, recovered, and each failure by taxonomy code; an error DTO's message is shown rather than replaced.
- Session switching preserves each session's page-lifetime work and restores its meaningful Main Application Surface context: establish context in A, switch to B and establish different context there, return to A, and A's meaningful workspace context is what the user left, while disposable mechanics may have reset and no authoritative domain value was reconstructed from presentation or session context (§5.3, §8.6); an in-flight turn's result lands in its originating session while another is active; closing or discarding a session with meaningful work asks for confirmation and an empty session closes immediately (§5.3); unread clears on activation.
- Replacing a line item offers the block's retained alternatives and nothing else; a re-search request reaches the agent as a revision instruction.
- Every interactive element of §5 is keyboard-operable, and focus lands where §5 says after each transition. Composites built on the adopted primitive foundation are verified to the same standard for labels, accessible names, focus transitions, keyboard flows, announcements, contrast, and reduced motion; a primitive's presence is never taken as proof (§4.1).
- No presentation dependency of §4.1 appears in a backend or domain contract, a server service interface, a view DTO definition, or an integration schema.
- A clarification submission equals the user's explicit answers and skips bound by question id, with no coercion; an unanswered question is absent.
- An inline edit is submitted as an explicit edit operation, and a validation error is rendered at the path the server names.
- The review and preview surfaces perform no money arithmetic and no parsing of formatted strings; every displayed amount is a formatting of a structured value.
- The approval intent carries the exact reviewed proposition and acknowledgment; re-submission is blocked while pending; a failed creation returns the intact proposition to review.
- No client-graph module reaches server authority, and every domain-shaped value enters presentation through the explicit boundary of §9; replacing a temporary adapter with a production one leaves the presentation unchanged.
- The browser-to-server boundary rejects malformed input and returns expected failures as data; no live mutation is reachable in a deployment lacking the platform-level protection of §10.3.
- The critical human-in-the-loop flow is provable end to end once the boundary exists: enter a brief, receive a proposition, correct it, approve, a stand-in for Proposales receives exactly the approved payload, the editor handoff is shown (contract 11 §3).

Styling is reviewed visually, never snapshotted; large DOM snapshots are prohibited (contract 11 §3, §5). The existing end-to-end spec describes a shell that no longer exists (C-4) and is reconciled with whatever shell the first milestone establishes.

## 12. Measurement ledger

Observable outcomes that, measured true, mean this intention shipped. Every downstream criterion traces to one of these or to a mechanism contract the inventory will add.

| ID     | Objective (observable)                                                                                                                                                                                                                                                                                                                                                                                              | Defect family guarded                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **F1** | Several sessions can be created, switched, reordered, and closed within one page lifetime; no non-active session loses its thread, proposition, clarification state, or created result on a switch; a turn started in session A lands in A while B is active and A shows attention; a session holding meaningful work cannot be closed or discarded without explicit confirmation, and an empty one closes at once; after establishing meaningful Main Application Surface context in A, switching to B and establishing different context there, and returning to A, A's meaningful workspace context is restored, disposable mechanics are allowed to have reset, and no authoritative domain value is reconstructed from presentation or session context. | session cross-talk; lost in-memory work; silent destruction; lost right-side working context; presentation state promoted to truth |
| **F2** | Every domain result kind the backend can return (`clarification`, `proposition`, `failed`, `created`, `recovered`) and every `ErrorDto` code has an intentional rendering in the thread and on the proposal surface; no DTO message is replaced by a generic one; retry is offered only when `retryable`.                                                                                                           | unrendered or swallowed states                                                |
| **F3** | A clarification is answerable and skippable per question in single and batch mode; the submitted payload equals the user's explicit answers and skips bound by question id, with no client-side normalisation or coercion; an unanswered question is neither answered nor skipped.                                                                                                                                  | omission recorded as a decision; coerced values                               |
| **F4** | The review and preview surfaces render only values carried by the proposition or its view model: no money arithmetic, no parsing of formatted strings, no client-derived provenance, completeness, or approvability; a human edit is submitted as an explicit operation and a `human`-sourced leaf is presented as human-set, distinct from agent-revised.                                                          | frontend-fabricated commercial or workflow truth                              |
| **F5** | "Create in Proposales" submits the exact proposition being reviewed with the acknowledgment as data, blocks re-submission while pending, and the outcome shows the editor link, "draft, not sent", newly-created versus recovered, and Applied Pricing exactly as returned or marked unavailable; a failed creation returns the intact proposition to review with the DTO message.                                  | double submit; implied send; lost work on failure; reinterpreted money        |
| **F6** | Every workspace interaction is keyboard-operable with visible focus and correct semantics (tablist, separator, log, dialog, description list, table, radio group where options exist); no state is colour-only; reduced motion is honoured; composites built on the adopted primitive foundation meet the same bar and are never assumed accessible; demonstrable by automated interaction checks, not only by visual review.                                                                                                | accessibility deferred                                                        |
| **F7** | No client-graph module imports server authority; every domain-shaped value crosses one explicit adapter into a view model; fixtures and adapters are named and temporary; replacing a temporary adapter with the production adapter changes no presentation component and invalidates no existing verification of that surface.                                                                                     | prototype contamination; fixture promoted to contract; backend bent to the UI |

Mechanism-contract invariants added by the mechanism inventory (§12A, rounds 1 and 2). F1–F7 are unchanged in text and identity; these deepen them and are the trace targets a phase criterion may cite instead of an objective. F1's restoration clause is served by **F28**, **F29** and **F30**, which is what makes "A's meaningful workspace context is restored" a measurable claim rather than an adjective; F1 itself needed no amendment.

| ID | Invariant (observable, on the production path) | Defect family guarded | Contract |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | --------- |
| **F8** | For a session whose first turn has returned, the generation id the client submits is character-identical to the one the server returned, and no client-generated identifier appears in any submitted payload. | client identity smuggled into workflow identity | §12A.1 |
| **F9** | A turn's result is applied to the session that dispatched it, matched by captured origin session id and turn id; a superseded or orphaned result is discarded and never applied to the active session. | results applied by active-tab coincidence; cross-session contamination | §12A.2 |
| **F10** | Tab status is the first matching row of a six-row total precedence over in-flight, draft reference, latest result kind, current proposition, and turn history, with all seven overlaps resolved and the status text in the accessible name. | ambiguous or stored status; colour-only state | §12A.3 |
| **F11** | Unread increments exactly once per result applied to a non-active session, never while active, and clears to zero on activation; attention is `unread > 0` on a non-active tab and is stored nowhere. | miscounted or never-clearing attention; a third stored axis | §12A.4 |
| **F12** | Every reorder and close case resolves to its stated list, active session, and focus destination, with pointer and keyboard equivalent and the strip never empty. | lost sessions; focus dropped to the body; drag-only reorder | §12A.5 |
| **F13** | A session satisfying any of six named real session/workflow inputs cannot be closed or discarded without explicit confirmation; a session satisfying none closes at once; an unavailable input evaluates to "confirm". A close during draft creation is refused until its turn resolves. | silent destruction of in-memory work; orphaned draft | §12A.6 |
| **F14** | Every derived presentation value is one of the register's rows, computed at render from its single named source and stored nowhere; unread is the only stored presentation counter. | drifting duplicates; a second source of truth | §12A.7 |
| **F15** | Replacing a surface's temporary adapter with its production adapter leaves every presentation component byte-identical and every existing presentation test passing unedited; a post-merge fixture is the parse result of its owning schema. | fixture promoted to contract; boundary drawn in the wrong place | §12A.8 |
| **F16** | Each of the five domain result states renders its stated thread turn and proposal-surface outcome, and each pill kind renders from its stated result part; `diff` is unreachable in V1. | unrendered or swallowed states; invented pill payloads | §12A.9 |
| **F17** | A leaf's provenance class is a total function of that leaf alone, every colour-carried class carries text, `{known:false}` never renders as a value, unresolved and deferred are never collapsed, and no policy field is read. | client-fabricated provenance, completeness, or approvability | §12A.10 |
| **F18** | The review surface renders only proposition-backed rows; the client preview renders only its closed field set; no amount appears on either before creation except a commercial note's stated amount. | work-surface data leaking into a client-facing rendering; invented prices | §12A.11 |
| **F19** | Every displayed amount is a rendering of one server-supplied `Money`, scaled by the currency's own minor-unit exponent, with no operation from the closed forbidden list on any money path. | hundred-fold rendering errors; money arithmetic in the browser | §12A.12 |
| **F20** | The clarification payload equals the user's explicit answers and skips bound by question id; an unanswered question produces no entry; no value is altered between input and payload. | omission recorded as a deliberate deferral; coerced values | §12A.13 |
| **F21** | An inline edit is one operation from the closed set with an array path, applied only when the server answers, with validation errors matched element-wise at their path; alternatives are offered exactly as returned. | locally applied edits; mis-anchored validation; re-ranked candidates | §12A.14 |
| **F22** | The approval envelope carries the proposition the review surface rendered; two activations produce one dispatch; failure returns the intact proposition; terminality is read from the server's draft reference. | double creation; reconstructed payloads; lost work on failure | §12A.15 |
| **F23** | Each of the ten `ErrorDto` rows and four `failed` rows renders its stated treatment; a known code's message is never replaced; retry appears exactly when `details.retryable === true`. | swallowed failures; retry offered on a non-retryable path | §12A.16 |
| **F24** | Every focus transition lands where the table says, and a result applied to a non-active session moves no focus and fires no announcement in the active one. | focus dropped to the body; background sessions disturbing the reader | §12A.17 |
| **F25** | The thread's follow state obeys its total transition table; appending content while detached moves nothing; expanding a pill never scrolls. | readers yanked away from what they are reading | §12A.18 |
| **F26** | At every width in the named test set the five layout conditions hold simultaneously, verified by rendering. | narrow-width corruption discovered after ship | §12A.19 |
| **F27** | No rendered value passes through a markup or rich-content path, and the editor link's href is character-identical to the server-returned URL with the new-context relationship attributes. | markup injection; a constructed or rewritten external URL | §12A.20 |
| **F28** | Every retained Main Application Surface entry is a member of the project's fixed enumeration, holds only a closed-presentation-enumeration member or a domain identity and never a category-C value, is written only by its own deliberate user act, is read only at render, and yields its stated default when its identity does not resolve; no derivation-register row reads one and no result application writes one. | the prohibited snapshot engine; a category-C value promoted into presentation state; a second source of truth for a derived value | §12A.21 |
| **F29** | Every row of the presented-state precedence and each of its overlaps presents its stated Main Application Surface state, every retained entry resolves to its target or to its stated default without being cleared, no category-C value is reconstructed, and no notice or announcement is produced about the restoration. | a session returning to the wrong state; stale context rendered as truth; restoration reported as a condition | §12A.22 |
| **F30** | Across any sequence of session activations, creations, closes and reorders the shell renders exactly one complementary region and exactly one `main`, both the same elements throughout; no URL, route, or history entry changes; and no module declares a second Main Application Surface or a surface-kind discriminant. | the shell rebuilt per session; speculative surface infrastructure; V1 scope widened through the shell abstraction | §12A.23 |

## 12A. Frontend mechanism contracts (mechanism-inventory rounds 1–2)

### 12A.0 What this section is, and how it binds

This section is the frontend mechanism inventory's delta and now spans **two inventory rounds**: §12A.1–§12A.20 were written by round 1 against the intention as it stood on 2026-09-06; §12A.21–§12A.23 were written by round 2 against the §16 round-5 ratifications (decisions 7–10) and the round-6 shell amendment (decision 11), and round 2 amended §12A.1, §12A.6, §12A.7, §12A.8 and §12A.17 in place where that delta falsified a clause. It deepens the sections it cites; it moves nothing on the ratification surface (§15.1), adds no scope, and edits no design specification. Decisions 7–10 ratify the four round-1 inventory conclusions that required owner judgment; decision 11 is the owner's shell amendment; no rule here reinterprets decisions 1–6. Where §12A and an earlier section appear to disagree, the earlier section's *behaviour* wins and the disagreement is a defect in this section.

Four reading rules:

1. **Backend-owned mechanisms are cited, never restated.** Every shape this section consumes — `Sourced`, `SourcedOrAbsent`, `Money`, `Path`, the workflow state, the clarification answer, the edit operation, the approval envelope, `DraftResult`, Applied Pricing, `ErrorDto` and its `details` registries, the five domain result states — is defined by the ratified backend intention §17A and the backend master plan §6.3–§6.4. This section defines only the **presentation-side** mechanism that consumes them. Where a rule here appears to widen, narrow, or correct a backend rule, the backend rule wins and the rule here is a defect.
2. **No files, components, hooks, stores, adapter APIs, or transport signatures.** Every rule is stated as an outcome over inputs, states, and forbidden behaviour. The frontend planning pass (§14.3) chooses the mechanism that satisfies it.
3. **Every rule is written so a test can make it fail.** Where a rule is a construction requirement rather than a check, it names the mutation that must turn its test red, because a guard that cannot fail is decoration (charter rule 15).
4. **No adjectives.** Where an earlier section says "derived", "meaningful", "exact", "resilient", "in place", or "attributed", this section replaces the adjective with a decidable rule. If a mechanism below still reads as an adjective, it is unfinished.

Threshold, timing, and count constants named below are contract-level: a criterion asserts the contract (the half-open interval, the adjacent-pair rows, the ordering), never the literal value (charter rule 13). Visual values remain the design specifications'.

### 12A.1 Session identity and the session runtime record

Deepens §2.4, §8.2, §8.3. Ledger: **F8**.

**Two identifiers, one meaning per name** (contract 13 §8):

| Name | Created by | Lifetime | May be |
|---|---|---|---|
| **page-lifetime session id** | the client, once per session, at session creation | until the tab is closed or the page reloads | a key of the session runtime record, a value of the active-session id, the target of a result application (§12A.2), part of a DOM id |
| **Generation ID** | the server, on the turn that receives no inbound workflow state (backend §17A.2) | inside the server-returned workflow state | held as returned and sent back unchanged |

**Total separation.** The page-lifetime session id is **never** submitted to the server in any position, never compared to a Generation ID, never derived from one, and never displayed as the session's identity. The Generation ID is never generated, reformatted, parsed, or defaulted by the client; it exists in exactly one place — inside the workflow state the server returned — and the client's only operation on it is to return that state unchanged.

**The session runtime record** is keyed by the page-lifetime session id and holds, per session: the thread presentation; the latest domain result presentation; the in-flight turn with its turn id, if any (§12A.2); the unread counter (§12A.4); the retained Main Application Surface context needed to resume the session — presentation-only, limited to category A of §8.6, and qualified, bounded and resolved by §12A.21 (owner decision 11); and, once a turn has run, the server-returned `ProposalWorkflowState` and `ConversationContext` **as returned** (§8.4). Records are separate per session; there is no shared record and no serialisation of one session's record into another's. Activating a session presents that record on both surfaces of the shell (§5.3).

**Forbidden.** A module-level mutable counter as the id source; an id derived from the tab's array index; any key derived from a thread position; one state object holding several sessions' work; a snapshot of a session's record taken on switch and rehydrated on return (design 04 "Prototype-only"); a snapshot of arbitrary DOM or component state or of every transient control as the means of continuity (§8.6); any category-C value stored in the record other than as the server returned it.

**Invariant (F8).** For a session whose first turn has returned, the value the client submits in the workflow state's generation-id position is character-identical to the value the server returned there, and no client-generated identifier appears anywhere in a submitted payload. *Named mutation: submit the page-lifetime session id in the generation-id position; the identity test must redden.* The test asserts equality with the server-returned value, not merely that the submitted value is a well-formed UUID — a client id that happens to be a UUID would pass a format check.

### 12A.2 Turn origin attribution and in-flight ownership

Deepens §5.3, §8.3, C-6; consumes backend §17A.3 (a turn is one request that returns the whole state). Ledger: **F9**. Serves **F1**.

A turn is any submission that returns a `TurnResult`: brief submission, clarification answers, an edit operation, a revision instruction, and the approval/execution turn.

**Attribution is captured at dispatch, by value.**

1. At the moment of dispatch, before any await, the submission captures two values: the **origin session id** and a fresh **turn id** unique within the page.
2. The origin session's record is marked as having that turn in flight, storing the turn id.
3. When the submission resolves — success or failure — the result is applied to the session found **by the captured origin session id**, and only if that session's in-flight turn id equals the captured turn id.
4. The active session id is **never read on the resolution path**. Reading it there, or applying a result to "the current session", is the defect this contract exists to prevent.

**Total over the four reachable resolution cases:**

| At resolution | Outcome |
|---|---|
| the origin session exists and its in-flight turn id matches | the result is applied to that session; its status re-derives (§12A.3); if the session is not active, its unread increments by exactly 1 (§12A.4) |
| the origin session exists but its in-flight turn id differs (a superseded turn) | the result is discarded; no session's state changes; no unread increments |
| the origin session no longer exists (it was closed) | the result is discarded; it is **never** applied to the active session, to a neighbouring session, or to a newly created session; no unread increments anywhere |
| the origin session exists and has no in-flight turn | the result is discarded (the same superseded case, with an empty slot) |

**Exactly one result per turn.** A session accepts at most one application per turn id; a second application for the same turn id is discarded.

**In-flight presentation is per session** (§5.3, design 03 §3.5): the thread's working indicator renders only for the active session's own in-flight turn; a non-active session with a turn in flight shows the tab signal (§12A.3 row 1) and nothing else. Nothing polls, and nothing simulates progress for a session with no in-flight turn (C-6, ratified boundary 7).

**Invariant (F9).** Dispatch a turn in session A, activate session B, then resolve the turn: A's runtime record carries the result and `unread = 1`, B's record is unchanged in every field, and the active session id is still B. *Named mutation: at resolution, look the session up by the active session id instead of the captured origin id; this test must redden.* A second named mutation covers the closed-origin row: *apply a result whose origin session is absent to the active session; the discard test must redden.*

### 12A.3 Derived tab status: the total precedence order

Deepens §5.3, §5.8, §8.3, §8.5; design 03 §3.2, design 04 §3.3. Ledger: **F10**. Serves **F1**, **F6**.

Status is a **pure function of the session runtime record**, computed at render, stored nowhere (§12A.7).

Inputs, and nothing else: whether a turn for this session is in flight; whether the session's workflow state carries a draft reference; the kind of the session's latest domain result; whether the session's workflow state carries a current proposition; whether any turn has ever been started for this session.

**The order is total and first-match-wins. Every session matches exactly one row.**

| # | Condition | Status | Status text (design 04 §3.3) |
|---|---|---|---|
| 1 | a turn for this session is in flight | `working` | "Working" |
| 2 | the workflow state carries a draft reference | `created` | "Created" |
| 3 | the latest domain result kind is `clarification` | `questions` | "Needs you" |
| 4 | the workflow state carries a current proposition | `ready` | "Ready" |
| 5 | at least one turn has completed for this session | `idle` | "Open" |
| 6 | no turn has ever been started for this session | `empty` | "Empty" |

Rows 5 and 6 partition everything rows 1–4 do not match, so the function is total.

**The overlaps, enumerated, because each is a row a planner must write** (charter rule 2):

| Overlap | Resolution |
|---|---|
| in flight **and** a draft reference exists (a refused re-approval) | `working` (row 1) |
| in flight **and** the latest result is `clarification` (answers submitted) | `working` (row 1) |
| a draft reference exists **and** a current proposition exists (always true after creation) | `created` (row 2) |
| a draft reference exists **and** the latest result kind is `clarification` | `created` (row 2) |
| the latest result kind is `clarification` **and** a current proposition exists (a clarification after a proposition) | `questions` (row 3) |
| the latest result kind is `failed` **and** a current proposition exists (a failed creation, §5.8) | `ready` (row 4) — this is the ratified "the session status returns to ready" |
| the latest result kind is `failed` **and** no proposition exists (a failed first run) | `idle` (row 5) |

**`failed` is not a status.** The five domain result states are the backend's (master plan §6.3); the six statuses are the design's presentation vocabulary. A `failed` result changes the status only through rows 4–5, which is why row ordering, not a seventh status, resolves it.

**One projection, two presentations.** The tab dot and the agent surface's status line and phase label are two renderings of this same function applied to the same record (design 03 §3.2, §5.2). They cannot disagree, because neither stores a value; this settles design 03's open question 6 structurally rather than by a synchronisation rule.

**Accessible representation.** The tab's accessible name carries, as text: the session title, the status text of the row above, the status note, and the unread count in words when non-zero (design 04 §5). Status is never carried by dot colour alone, and `ready` and `created` are distinguished in the accessible name whether or not the specs later give them distinct dots (§5.3; design 04 open question 1 stays a design delta). The animated dot is hidden from assistive technology and does not animate under reduced motion.

**Forbidden.** A stored `{status, note, unread}` record written by result handlers (design 04 "Prototype-only" `tabState`); a status set by whichever handler fired; a status derived from thread content, from a string test, or from elapsed time.

**Invariant (F10).** For each of the six rows and each of the seven overlaps above, a session runtime record in that condition renders exactly the stated status and its status text appears in the tab's accessible name. *Named mutation: swap rows 2 and 3 in the precedence chain; the "created beats questions" row must redden.*

### 12A.4 Unread and attention

Deepens §5.3, §8.2, §2.4; design 04 §3.4. Ledger: **F11**. Serves **F1**.

**Unread is one integer per session, and the only stored presentation counter in the workspace.**

| Event | Effect on that session's unread |
|---|---|
| a turn result is applied to the session (§12A.2) while the session is **not** active | `+1`, exactly once per applied result, regardless of how many parts that result renders |
| a turn result is applied while the session **is** active | no change |
| the session becomes active | set to exactly `0` |
| a turn is dispatched (started) | no change |
| a result is discarded (§12A.2 rows 2–4) | no change |
| the tab is reordered, renamed, or scrolled into view | no change |
| any other event | no change |

The table is total over the events the workspace produces; there is no decrement path other than clearing on activation.

**Attention is `unread > 0` on a non-active tab, and nothing else.** It is not a third stored value and not a second status axis: the dot carries session state (§12A.3) and the badge carries unseen output (design 04 §3.4), and both are legible simultaneously at the strip's minimum tab width. There is no combined "needs attention" value anywhere in the workspace; a component that wants one computes the conjunction at render.

**Accessible representation.** The badge is exposed as text ("3 unread"), never as a bare number, and forms part of the tab's accessible name (§12A.3). Background status changes are announced under §12A.17's debounce rule.

**Invariant (F11).** A session that is not active accumulates exactly one unread per applied result and returns to zero on the first activation; an active session never accumulates one. *Named mutation: increment unread at dispatch instead of at application; the "no unread while working" row must redden.*

### 12A.5 Tab order, reorder, close, and focus

Deepens §5.3; design 04 §4.2–§4.5. Ledger: **F12**. Serves **F1**, **F6**.

**Order.** The strip is an ordered list of page-lifetime session ids. A new session is appended at the end and becomes active. Order is presentation state (§8.2); it is never submitted to the server and never influences which session receives a result (§12A.2).

**Reorder is a single move, total over its cases.**

| Case | Result |
|---|---|
| move from index `i` to index `j`, `i ≠ j` | the moved id occupies `j`; every other id keeps its relative order; the **active session id is unchanged**, including when the moved tab is the active one |
| `i = j` | no-op: no state write, no announcement, no focus change |
| a move that would land before index 0 or past the last index | no-op, by the same rule |
| a session is closed or created during a drag | the drag's remaining moves apply to the list as it then is; no move targets a removed id |

**Pointer and keyboard are equivalent.** For the same `(i, j)` the two input paths produce the same list. The keyboard move-by-one is exactly the pointer drop at `i ± 1`, keeps focus on the moved tab, and announces the new position (design 04 §4.5). Reorder must be reachable without a pointer; drag-only reordering is a defect.

**Live reorder during a drag** follows the specification's current behaviour: each drag-over commits its move immediately, and a drag that ends without a drop leaves the order at its last committed move (design 04 §4.2). Whether an abandoned drag should restore the order recorded at drag start is a design delta, reported and not resolved here (design 10 §4).

**Close, total over the four cases**, each after the §12A.6 guard has passed:

| Case | Newly active session | Focus destination |
|---|---|---|
| close a non-active tab | unchanged | unchanged, unless focus was inside the removed tab; then the tab now at the removed index, clamped to the last index |
| close the active tab, not the last index | the session now at the same index | that tab |
| close the active tab at the last index | the session now at the last index | that tab |
| close the only remaining tab | a fresh empty session | that tab |

The last row's ordering is part of the contract: **the replacement session is created before the closed session is removed**, so no rendered frame shows an empty strip (design 04 §4.3, "the strip is never empty").

**A closed session's id is never reused**, and results whose origin is a closed session are discarded (§12A.2).

**Active tab kept in view.** After any change that can move it — switch, reorder, close, create, strip resize — the active tab is fully inside the strip's visible region with a margin. *Forbidden*: `scrollIntoView`; locating the tab by document query or selector (design 04 "Prototype-only"); reading the window width during render.

**Invariant (F12).** Every row of the reorder table and every row of the close table holds, with focus landing on the stated element and never on the document body. *Named mutation: on closing the active tab, activate index 0 instead of the same index; the neighbour-selection row must redden.*

### 12A.6 Meaningful work and the close/discard confirmation guard

Deepens §5.3, §5.6, §8.1, owner decisions 2, 7 and 8 (§15). Ledger: **F13**. Serves **F1**.

Owner decision 2 places the derivation of "meaningful work" with the planning/integration pass, over **real session and workflow state**, and forbids a presentation heuristic. This section fixes the shape of that predicate, its admissible inputs, and its failure direction; it does not resolve it differently.

**Admissible inputs — the closed set.** The predicate reads only the session runtime record's workflow-bearing parts (§8.3, §8.4) and the target session's own composer draft (§8.1):

1. a turn has ever been started for this session, including one currently in flight;
2. the session's thread holds at least one turn;
3. the workflow state carries a current proposition;
4. the workflow state carries a clarification round;
5. the workflow state carries a draft reference.
6. the target session's composer draft has at least one character (`length > 0`), including whitespace; it is retained per session by §8.1 and is never normalised to decide this predicate.

`meaningfulWork = (1) ∨ (2) ∨ (3) ∨ (4) ∨ (5) ∨ (6)`. A session for which it evaluates false closes immediately with no confirmation.

**This predicate is not the `empty` tab status, and since decision 7 the two differ.** §12A.3 row 6 assigns status `empty` when no turn has ever been started — the negation of input (1) alone — while §5.3's "an empty session closes immediately" names this predicate. A session holding a pasted, unsent brief therefore renders status `empty` **and** is meaningful work: exactly the case decision 7 was ratified to protect. **The close guard never reads the tab status, and the tab status never reads this predicate.** *Named mutation: gate the confirmation on the session's status being other than `empty`; the non-empty-composer row must redden.*

**Excluded from this predicate** (they are never by themselves work worth a confirmation, whether they reset as disposable mechanics under §8.1 or are retained as meaningful resumable context under §8.6): unsent clarification answers and the panel's step position, pill expansion, the view toggle, a selected review item, scroll position, pane width, hover, and open popovers. Composer draft text is the deliberate exception: it remains UI mechanics and never becomes server truth, but a non-empty per-session draft is meaningful work because closing destroys it with no recovery (decision 7).

**Input (6)'s lifetime, stated so the predicate is total over the composer's own states** (§8.1, decision 7). The draft belongs to its session and is cleared by exactly four events: it is sent, the user explicitly clears it, the session closes, or the page reloads. Nothing else clears it. In particular the clarification panel replacing the composer (§5.2, §5.5) neither clears nor submits it: while the panel is open the composer is not rendered, the draft stays with its session, input (6) evaluates over the retained characters exactly as it would with the composer visible, and dismissing the panel returns the composer with the draft as it was. The predicate reads the **target** session's own draft; a draft typed in session A is never read when evaluating session B. The draft is never trimmed, normalised, or tested against a pattern to decide this predicate — it is `length > 0` over the retained characters, whitespace included. It is Agent Surface UI mechanics governed by §8.1 and is **not** a §8.6 category-A entry (§12A.21).

**Failure direction is asymmetric and fixed.** If any input is unavailable at the current integration stage — before the owning backend phase has merged, a session may not yet carry a workflow state — the predicate evaluates to **true** and the confirmation is shown. A false "no meaningful work" destroys a session's work with no undo, no archive, and no reload recovery (§7); a false "meaningful" costs one keystroke.

**Evaluation site.** The predicate is evaluated at the moment the close or discard intent is raised, from the session runtime record, never from a rendered view model and never from a value cached at render.

**The guard is one explicit confirmation step** naming what will be lost, with no undo, no archive, and no timed toast (owner decision 2). Discard on the review surface follows the same predicate and the same guard (§5.6). Confirmation is required for the session being closed, not for the active session, when the two differ.

**A turn in flight is meaningful work by input (1)**, so a close during an in-flight turn ordinarily confirms. **The approval/execution turn is the sole exception: a close intent while it is in flight is refused until that turn resolves; it shows neither confirmation nor a destructive action and removes no session state (decision 8).** The review surface's discard control is structurally absent during creation (§5.8); if another path raises discard while that turn is in flight, it is refused by the same rule. Once the turn resolves, the normal close/discard predicate applies to the returned state.

**The refusal is total over every path that can remove a session or abandon its workflow, and it is evaluated on the target session before any list mutation.** The paths are: the active tab's close control; a keyboard close on a focused tab (design 04 §4.5); the review surface's discard; closing a non-active session by any path §12A.5's close table admits; and closing the **last** session — §12A.5's replacement session is created only after this guard has passed, so a refused close creates no replacement, removes nothing, and leaves the strip exactly as it was. A path that can end a session without running this guard is a defect, not a new case. Because it is a refusal and not a confirmation, it must be **visible**: the control states that the session cannot be closed while its draft is being created, announced politely (§12A.17), and never renders as a silent no-op (contract 05 §7's predictability rule).

**Browser-level departure is a separate, total warning rule** (owner decision 12). On an attempted reload, browser-tab/window close, or navigation away, the page requests the browser's standard departure confirmation **if and only if at least one open session is in the approval/execution creating state**. The rule reads every open session's creation state, not the active session and not the close-guard predicate. It does not request a departure warning for a composer draft, any other meaningful work, a non-approval in-flight turn, or a terminal session. The browser, rather than the page, owns the confirmation's wording and whether its platform permits it; therefore the rule requests the protection but never promises that an accepted departure can be cancelled or recovered. The in-flight server request is neither cancelled nor reconstructed; if the user confirms departure, §7's page-lifetime destruction rule applies. This is not an internal session close/discard path and does not replace the refusal above.

**Invariant (F13).** A session satisfying any one of the six inputs cannot be closed or discarded without an explicit confirmation, a session satisfying none closes on the first activation of the control, and a close during the approval/execution turn is refused until that turn resolves. An attempted browser-level departure requests the platform confirmation exactly when at least one open session is creating a draft, including when that session is not active. *Named mutation: remove input (6) from the disjunction; the non-empty-composer row must redden. Second named mutation: replace the creation-close refusal with confirmation; the creation-in-flight row must redden. Third named mutation: test only the active session for creation; the inactive-creating-session departure row must redden.*

### 12A.7 One owner per derived presentation value: the derivation register

Deepens §8.5, §2.4; contract 05 §5, 12 "Components and client". Ledger: **F14**. Serves **F4**, **F7**.

**The register is closed.** These are the only values the presentation derives. Each names one source, and each is computed at render and stored nowhere.

| Derived value | Its one source | Defined in |
|---|---|---|
| tab status, status note, phase label | the session runtime record | §12A.3 |
| attention (the unread badge's visibility) | the session's unread counter and the active session id | §12A.4 |
| readiness count and its per-resolution breakdown | `proposition.unresolvedItems` | §12A.10 |
| a rendered money string | the `Money` value it formats | §12A.12 |
| a leaf's provenance class and flag text | that leaf alone | §12A.10 |
| a pill's kind, label, and meta | the result part it presents | §12A.9 |
| the session count in the header | the length of the tab list | §12A.5 |
| whether the composer's send is enabled | the composer's own draft text and the session's in-flight state | §5.2 |
| whether the clarification panel's send is enabled | the panel's own per-question drafts | §12A.11 |

**Unread is the single stored presentation counter** (§12A.4). Every other row above is a function, not a field. It remains the only stored *counter*; since decision 11 the retained Main Application Surface context (§12A.21) is the only other stored presentation state, and it holds no count and no derived value.

**Rules.**

- A derived value is never written into state beside its source. Two presentations of one derived value read the same source and are therefore incapable of disagreeing; no synchronisation rule exists because none is needed.
- A value not in this register is **either** returned by the server, **or** it is one of the workspace's exactly two stored presentation values — the unread counter (§12A.4) and the retained Main Application Surface context (§12A.21) — **or** it does not exist. Those two are stored rather than derived and are therefore not rows here; the register stays the closed set of *derived* values. **No row's source may be a retained entry, and no retained entry may read a row.** That pairing is what stops retained context becoming a second source of truth for a derived value. Adding a row is an amendment to this section, not a component's local decision.
- No presentation derives commercial truth, completeness, provenance, change, or approvability. Specifically: the client computes no total, no subtotal, no per-block amount, no "changed since" flag, and no approvable verdict (§12A.10, §12A.12).

**Forbidden.** A `{status, note, unread}` record set by handlers; a client-held change map driving a flag; a count of open questions computed from a client-held answer map; a stored formatted-money string; a stored provenance class.

**Invariant (F14).** For every row of the register, mutating the source changes the rendered value with no intervening write, and no module writes the derived value into state. *Named mutation: store the formatted money string on the view model and render that field; the single-owner test for money must redden.*

### 12A.8 The presentation boundary: view models, adapters, fixtures, seam replacement

Deepens §9.1–§9.4, §10.4; contract 16 §2–§3. Ledger: **F15**. Serves **F7**.

**One crossing per surface.** For each surface, every domain-shaped value enters presentation through exactly one adapter into exactly one view model. A surface with two entry paths for the same value has no boundary; a value that reaches a presentation component without crossing an adapter is a defect regardless of how well typed it is.

**What identifies a view model, decidably.** A presentation component's prop types are hand-written UI types (contract 05 §8's allowance for view-state and prop shapes). A presentation component whose prop type is the inferred type of a backend feature schema has no boundary at that point; the boundary is drawn at the wrong place and is fixed there, not in the component (design 10 §3 step 4).

**What an adapter may do:** select fields, rename them for the view, choose a presentation class from a domain value by a rule stated in this section (§12A.9, §12A.10), format a `Money` value (§12A.12), and compute the derived values of §12A.7's register. **What an adapter may not do:** compute a domain fact, sum or compare money, diff two propositions, evaluate approvability, invent a field the domain does not carry, or reorder a list the domain ordered.

**Fixtures, in two eras.**

| Era | A fixture is | Named |
|---|---|---|
| before the owning backend schema phase has merged | a literal that populates a view model directly | with an explicit temporary marker, per §9.3 |
| after the owning backend schema phase has merged | the **parse result of a literal through the owning schema**, which then flows through the production adapter | as a verification fixture of that schema |

The post-merge rule is what makes drift impossible: because the fixture is the schema's output rather than a hand-shaped object, a schema change that the fixture does not satisfy fails at test time rather than surviving as a shape the contract no longer has. *Named mutation: remove a required field from the fixture's literal; the fixture's own construction test must redden.* A fixture that is exported as the literal rather than as the parse result does not satisfy this contract.

No fixture contains real personal or customer data (contract 11 §5). A fixture that survives into a production path is an explicitly named placeholder, never an unmarked literal (contract 16 §2 step 6).

**Seam replacement, stated as a checkable outcome** (§10.4). When the owning backend phase merges and a surface is rebound, the change touches the adapter and the fixture only: **no presentation component file changes, and no existing presentation test of that surface is edited or deleted.** A merge that forces a presentation component to change is a finding against the boundary, never a reason to change a backend shape (§9.4). A session's retained Main Application Surface context is part of this claim: because every entry holds either a member of a closed presentation enumeration or a domain identity (§12A.21), the replacement changes no entry's name, value domain, or default. An entry keyed by an adapter output field, a view-model field name, or an index into a view model breaks the claim, and is a defect in the boundary rather than a keying choice.

**Never promoted upward.** No view model, adapter shape, fixture shape, or session runtime field is copied into, referenced by, or used to justify a backend schema, domain shape, service interface, view DTO, or integration schema (§9.4). A field the frontend needs and the domain does not carry is a deliberate change to the backend intention.

**Invariant (F15).** Replacing a surface's temporary adapter with its production adapter leaves every presentation component of that surface byte-identical and every existing presentation test of that surface passing unedited. *Named mutation: give the presentation component a prop typed as the backend proposition; the boundary test must redden.*

### 12A.9 Domain-result rendering and the pill-kind mapping

Deepens §5.4, §2.4, §14.1; backend master plan §6.3. Ledger: **F16**. Serves **F2**.

**Total over the five domain result states × the two surfaces.** Every state renders something intentional on both; "unchanged" is an intentional outcome and is stated as one.

| `result.status` | Thread | Proposal surface |
|---|---|---|
| `clarification` | a turn carrying an `ask` pill holding the question set and each question's answered / skipped / open record | unchanged: the previous proposition stays rendered, or the empty state if there is none |
| `proposition` | a turn carrying the result's rationale, assumptions and warnings | the review surface renders the new proposition |
| `failed` | a failure turn naming the run's failure reason (§12A.16) | unchanged: the previous proposition stays intact and rendered |
| `created` | a turn carrying a `link` pill with the `editorUrl` the server returned | the created presentation, `newlyCreated: true` |
| `recovered` | the same turn shape | the created presentation, marked recovered, `newlyCreated: false` |

**Pill kinds are a presentation mapping computed at the view boundary** (§2.4, design 05 §1). They are never a field of any schema, never submitted, never stored on a result, and never inferred from a backend enum.

| Result part | Kind | Bound by |
|---|---|---|
| `agentRationale`, `assumptions[]`, `warnings[]` | `thought` | it presents the application-returned explanation only; never model reasoning, never an invented step sequence (§5.4) |
| the clarification question set and its per-question record | `ask` | it is the record and the bridge to the panel; it never holds the act of answering |
| `draftResult.editorUrl` | `link` | rendered verbatim (§12A.20) |
| a workspace intent (re-open the questions, return to review) | `action` | it carries no domain effect of its own |
| a server-supplied difference record | `diff` | **not reachable in V1**: no V1 result carries one (§14.1 item 3). A rendered `diff` pill in V1 is a defect |

**Every part of a result is rendered by exactly one kind, and every kind above has a source part.** A result field with no row is an unrendered part and a gap to route, not a silent omission — which is what makes a new backend field visible at this boundary rather than invisible.

**Live progress steps are out of scope** (§5.4, §14.1 item 4): the `thought` pill's step-list presentation renders only steps a result carries, and no V1 result carries any, so V1 renders none. Fabricating steps to fill time is the prototype behaviour this excludes.

**Forbidden.** Pill construction from ad-hoc fields on a message object; keys derived from a thread index (design 05 "Prototype-only"); a demo toggle gating whether a kind renders; a client-computed count in a pill's meta slot that is not one of §12A.7's register rows.

**Invariant (F16).** Each of the five result states renders its stated thread turn and its stated proposal-surface outcome, and each pill-kind row renders from its stated part. *Named mutation: route the `failed` state through the created presentation; the "the proposition stays intact on failure" row must redden.*

### 12A.10 Provenance, absence, unresolved information, and approvability

Deepens §5.6, §2.4, §8.4; consumes backend §17A.4, §17A.5, §17A.6, §17A.9. Ledger: **F17**. Serves **F4**.

**The provenance class of a leaf is a total function of that leaf alone.**

| Leaf condition | Class | Carries text |
|---|---|---|
| `{ known: false }` | absent | an absence statement; where the backend's absence semantics name a Proposales default (§17A.5), the statement says the default is Proposales', not a value the application holds |
| `source = "human"` | human-set | a human-set flag, distinct from the agent-revised class (§5.6) |
| `source = "inferred"` | agent-inferred | an assumption flag |
| `source = "brief"` | sourced | no flag |
| `source = "proposales_content"` | sourced | no flag |

The five rows are total over the shapes §17A.1 admits: a leaf is `{known:false}` or carries exactly one of the four sources. A leaf whose key is **missing** rather than `{known:false}` never reaches presentation — it fails the schema parse upstream (§17A.5) — so the presentation has no branch for it and must not grow one.

**Every colour-carried class also carries text** (design 07 §5, F6). A value rendered in the absent or agent-inferred treatment without its flag text is a defect, and the flag text is part of the value's accessible name.

**Absence is never rendered as a value.** `{known:false}` never renders as `0`, `1`, `false`, an empty string, or a dash that reads as zero. This is the presentation half of §17A.5's most load-bearing shape.

**"Changed since" is not rendered in V1.** The only client-computable change signal would be a diff of the workflow state's two propositions, which §14.1 item 3 forbids the client to compute, and no V1 result carries a per-leaf change record. The human-versus-agent distinction §5.6 requires is therefore carried entirely by `source = "human"` versus every other source — which is what §17A.9 makes it ("human-set is exactly `source === human`; there is no second flag"). Design 07's "Updated" flag has no V1 source; decision 10 confirms origin, rather than client-computed change, as the review pane's fact.

**Unresolved information.** `unresolvedItems` entries are presented per entry with their `resolution` visible, and `unresolved` and `deferred_by_user` are **never collapsed into one count or one label**: an omission and a deliberate deferral are different human facts, which is exactly what the backend's skip contract protects (§17A.7). A single readiness number may be shown only alongside the per-resolution breakdown.

**Approvability is never computed.** No presentation reads `items[k].createPolicy` or `items[k].askPolicy`; no presentation evaluates "can this be approved"; the approval refusal is rendered from the server's `validation_error` and its paths (§12A.16). Whether the approval control is enabled, disabled, or shown in a warning treatment while unresolved information remains stays a design/planning decision (C-3, §14.2) and is treatment-neutral in this contract: whichever treatment is chosen, it is not derived from a client-side verdict.

**Forbidden.** Deriving a class from the value's emptiness; deriving a flag from a string test (`/not priced/i` and its family, design 07 "Prototype-only"); a client-held change map; a completeness count computed from anything but `unresolvedItems`.

**Invariant (F17).** Each of the five leaf conditions renders its stated class with its stated text present in the accessible name, `{known:false}` never renders a numeric or boolean placeholder, and no module reads a create or ask policy. *Named mutation: render `{known:false}` for a quantity as `1` because Proposales' default is 1; the absence row must redden.*

### 12A.11 Closed field sets: the review surface and the client preview

Deepens §5.6, §5.7, C-1; design 07, design 08. Ledger: **F18**. Serves **F4**.

**The review surface's field set is the proposition's, and only the proposition's.** Every row, label, and item on it is backed by a leaf, block, note, assumption, warning, or unresolved item that the current proposition actually carries. There is no fixed label list; design 07's nine observed labels are demo content (design 07 "Prototype-only"). A rendered row with no backing leaf is a defect, and a leaf the proposition carries with no rendering is an unrendered part to route (§12A.9's rule, applied to the proposition).

**The client preview's field set is closed and is a strict subset**, because it is a client-facing rendering (§5.7, design 08):

| Rendered | Not rendered, in any form |
|---|---|
| the proposition's title | provenance flags and their colours |
| the proposition's narrative, omitted entirely when absent | unresolved and deferred markers, readiness, counts |
| per block, the catalog-verbatim title and description | quantity, the optional flag, reviewer comments |
| the statement that pricing comes from the content library | commercial notes, commercial assumptions, warnings, agent rationale, alternatives |
| the approximation disclosure, visible and programmatic (ratified boundary 9) | any amount, any total, any per-line price (C-1) |
| | any work-surface string, including absence statements such as "Not priced" |

**No money appears on either surface before creation** (C-1, backend §3.1, §9.1, criterion 20): the proposition carries no price and no total, so a rendered amount on the review or preview surface is a defect by construction rather than a value to check. The one exception is a `commercialNotes[i].amount` — a **stated price expectation** carried as `SourcedOrAbsent<Money>` with its own provenance (§17A.16) — which appears on the review surface as a note with its provenance class, never in a total row, never in the preview, and never summed with anything (§12A.12). The first sight of applied money is the created state (§5.8).

An empty proposition renders an honest empty document rather than a skeleton of absent fields (§5.7).

**Invariant (F18).** No amount is rendered anywhere on the review or preview surface for any proposition, except a commercial note's stated amount on the review surface with its provenance class; and the preview renders no field outside its closed set. *Named mutation: render a block's quantity in the preview; the closed-set row must redden.*

### 12A.12 Money rendering

Deepens §4, §5.8, §11; consumes backend §17A.1 (`Money`) and §17A.12 (Applied Pricing). Ledger: **F19**. Serves **F5**, invariant 17.

**The frontend receives money in exactly two positions**: `commercialNotes[i].amount` on the proposition (a stated expectation, §12A.11) and the Applied Pricing block of a `created` or `recovered` result. Both are `{ amountMinor: integer, currency: ISO-4217 }`. The frontend never receives, constructs, or infers money anywhere else.

**Rendering is one function**, `Money → string`, total over the shape, applied at the view boundary and stored nowhere (§12A.7).

**The minor-unit exponent is derived from the currency, never assumed.** The scaling from `amountMinor` to the displayed figure uses the exponent the runtime's currency data reports for that currency code. A literal `100`, a literal `/ 100`, a hard-coded two-decimal format, or a `toFixed(2)` anywhere on a money path is prohibited: currencies with a zero-exponent minor unit would silently render a hundred-fold error that no type check and no schema can see. *Named mutation: replace the derived exponent with the literal 2; the zero-exponent-currency row must redden.* Criteria enumerate at least one zero-exponent and one two-exponent currency (charter rule 2), and assert the contract rather than a locale's literal output (charter rule 13).

**The closed forbidden list, on any money value:** addition; subtraction; multiplication; division other than the single derived-exponent scaling inside the rendering function; modulo; rounding, flooring, ceiling, `toFixed`; comparing two amounts numerically; summing blocks into a total; recomputing a total from unit values and quantity; checking a total against its parts; `parseFloat`, `Number`, or any pattern applied to a formatted or free-text string to obtain an amount; defaulting an absent money to `0`; inferring or converting a currency.

**The closed permitted list:** reading `amountMinor` and `currency`; the derived-exponent scaling inside the rendering function; string equality on a currency code (only to render the block-currency warning the backend already attached, §17A.12).

**Absence and unavailability.** `{ known: false }` on a stated amount renders per §12A.10 and never as a figure. `appliedPricing.available === false` renders its closed-enum reason and the draft as created; it declares no money fields, so there is nothing that could be rendered as `0` (§17A.12). A rendered zero in an unavailable-pricing presentation is a defect.

**Applied Pricing is labelled as what Proposales applied**, to be reviewed in the editor, never as what was approved (§5.8, backend §15.1); every figure is a rendering of a value the read-back returned, and no figure is assembled from two of them.

**Invariant (F19).** Every displayed amount is a rendering of one `Money` value the server supplied; no formatted string is ever read back into a number; no arithmetic on the forbidden list occurs on any money path. *Named mutation: render the Applied Pricing total as the sum of the block unit values; the "totals are displayed, never computed" row must redden.*

### 12A.13 Clarification submission

Deepens §5.5, C-2; consumes backend §17A.7 and the master plan's `clarificationAnswersInputSchema`. Ledger: **F20**. Serves **F3**.

**The submitted payload is a set of entries bound by `questionId`.** Per question, the mapping from the panel's local state to the submitted payload is total and has exactly three rows:

| Panel state for a question at send | Submitted |
|---|---|
| the user typed an answer | one entry: `{ kind: "answer", text: <the characters the user typed> }` |
| the user explicitly skipped it | one entry: `{ kind: "skip" }` |
| the user neither answered nor skipped it | **no entry at all** |

**An omission is never converted into a skip, and a skip is never inferred.** A question with an empty draft is row 3, not row 2. A question the user never visited is row 3. This is the presentation half of §17A.7: only a skip moves an item to `deferred_by_user`, and an omission leaves it `unresolved` — so a client that submits a skip for an untouched question records a human decision that no human made.

**"Skip all" submits `{ kind: "skip" }` for every question that has no explicit answer, and leaves explicitly answered questions as answers.** Design 06 §4.4's "clears the whole batch" is ambiguous between skipping the unanswered and discarding typed answers; discarding typed answers silently would destroy work, so the preserving reading is taken. Recorded as a resolved ambiguity and a design delta.

**No coercion touches the submitted value.** Forbidden on the submission path: appending a unit; inserting or removing separators; reformatting a date; locale conversion; numeric parsing; substituting a display-formatted value for the typed one. Display formatting, where the specification calls for it, is a separate value that never reaches the payload (§5.5, design 06 §4.2). Trimming and length bounds are the server's schema's (§17A.16); the client alters nothing. *Named mutation: feed the display-formatted value into the submitted entry; the identity test must redden.*

**No entry is ever constructed for a `questionId` outside the received question set**, and no question set is ever extended, reordered, filtered, or supplemented by the client: conditional follow-up questions are a server decision (§17A.7, design 06 "Prototype-only").

**V1 renders the ratified question shape only** (C-2): a text question with a free-text answer or an explicit skip. The panel's option lists, amount suggestions, date inputs, units, per-question notes, and per-question skip labels remain presentation vocabulary that only a backend amendment activates (§14.1 item 1). A V1 panel that renders an option list has invented a question type.

**Dismiss is not an answer.** Dismissing the panel returns the composer and discards nothing: the questions stay open and the `ask` pill re-opens the panel (§5.5). Submission is the only path that produces entries.

**Invariant (F20).** The submitted payload equals the user's explicit answers and skips bound by question id, with unanswered questions absent and no value altered between the input and the payload. *Named mutation: submit `{ kind: "skip" }` for every question with an empty draft; the omission row must redden.*

### 12A.14 Inline edit, replacement, and validation paths

Deepens §5.6, §2.4; consumes backend §17A.1 (Path), §17A.9, and the master plan's `editOperationSchema`. Ledger: **F21**. Serves **F4**.

**One edit at a time per session.** While an edit turn is in flight for a session, no other leaf of that session enters edit mode, and the in-flight leaf is not re-editable. The composer's send and the approval control follow the same session-level in-flight rule (§5.2, §12A.15).

**A commit dispatches exactly one edit operation** from the backend's closed set — `set_leaf`, `remove_block`, `add_block`, `unset_recipient`, `confirm_empty_draft` — carrying a `path` as an **array of segments**, with array indices as decimal strings (§17A.1). A dotted string, a display label, or a component-local key in the path position is a defect.

**The edit is never applied locally as truth.** The rendered value changes only when the server's new proposition version arrives; the typed text is a disposable draft until then (§8.1). *Named mutation: write the typed value into the view model on commit; the "no local truth" test must redden.* Save-in-flight and save-failed states exist (§5.6, design 07 §6).

**Keyboard and focus.** Entering edit mode is keyboard-reachable; Enter commits; Escape cancels and discards the draft; focus returns to the trigger on both commit and cancel (§12A.17).

**A validation error is rendered at its path.** Paths are compared **element-wise as arrays**. Forbidden: joining paths into strings to compare them; prefix or substring matching; rendering a path-bearing error only at surface level. An error whose path names no rendered leaf is rendered at the surface level with its message intact rather than dropped.

**Replacement offers exactly the block's retained alternatives** — `blocks[i].alternatives` as returned, in the order returned (§5.6, owner decision 3). The client does not filter, re-rank, re-score, deduplicate, or supplement that list, and offers no other content source; broader discovery is an agent revision or re-search instruction, which is a free-text revision turn (§2.4). *Named mutation: sort the alternatives by score in the presentation; the order-identity row must redden.*

**"Ask the agent about &lt;field&gt;"** submits a free-text revision instruction whose wording names the field; the field scope is presentation memory rendered as the reply turn's scope badge, and is not a structured parameter of the turn until §14.1 item 2 is decided.

**Invariant (F21).** An inline edit is submitted as exactly one operation from the closed set with an array path; the rendered value changes only on the server's answer; a `validation_error` renders at the leaf whose path equals the error's path element-wise. *Named mutation: compare paths after joining them with a dot; the row whose leaf key contains a dot must redden.*

### 12A.15 Approval submission, the pending guard, and terminality

Deepens §5.6, §5.8, §4; consumes backend §17A.10, §17A.13, §11.3; contract 05 §7, 04 §8, 08 §6. Ledger: **F22**. Serves **F5**.

**What is submitted.** The approval envelope carries the session's workflow state, the proposition **being reviewed**, and the pricing acknowledgment (backend `approvalEnvelopeSchema`, strict). The proposition submitted is the value the session runtime holds, not a value reconstructed from a view model: the view model is an output of the adapter and is never an input to a submission. *Named mutation: build the submitted proposition from the review view model; the identity test must redden — it asserts structural equality with the value the adapter read.*

**The acknowledgment's statement id and the wording shown to the human come from one source.** The frontend renders the wording bound to the statement id it submits; a component that renders one wording and submits a different id has broken the thing the literal id exists to guarantee (§17A.10). *Named mutation: change the submitted statement id without changing the rendered wording; the pairing test must redden.*

**Submit-once, by two independent mechanisms**, because either alone is insufficient:

1. **Structural.** On entering the creating state the approval control is removed from the tree along with the review header, the view toggle, and discard (§5.8, design 09 §3.2); re-entry has no control to activate.
2. **At the dispatch boundary.** A second approval dispatch for a session that already has an approval turn in flight is a no-op. This exists because removing the control is a rendering fact, and a double activation, a held key, or a rapid pointer sequence can fire the handler before the next render.

*Named mutation: remove the dispatch-boundary guard and rely on the control's removal; the double-activation test must redden.* The invariant: two activations within one frame produce exactly one dispatch.

**There is no cancel** (§5.8): the server performs one non-retryable create, and a client-side cancel could not undo it. The creating presentation shows one honest label, not an invented step sequence, because no V1 result reports steps (§14.1 item 4).

**Creation cannot be closed away.** While the approval/execution turn is in flight, a close intent is refused under §12A.6 (decision 8). It is not a confirmation variant: the session remains open until the server result is attributed to it, so a created draft cannot be orphaned from its only editor handoff.

**Terminality is the server's, read from the state.** A session is terminal exactly when its workflow state carries a draft reference (§17A.2). A terminal session offers no approval control, no inline edit, and no edit-operation dispatch; the proposition stays visible for reference (§5.8). A terminal session that renders an approval control is a defect. The browser never decides terminality on its own — it never marks a session terminal on dispatch, on optimistic success, or on a timeout.

**Failure returns the intact proposition to review**, structurally equal to what was submitted, with the failure rendered per §12A.16 and the status re-derived to `ready` by §12A.3 row 4. Nothing is lost, and no partial created state is entered — the backend cannot produce one (§17A.12, answering design 09's open question 8).

**A refused re-approval is a `conflict`** carrying the existing draft's uuid and editor URL, rendered as the conflict it is and pointing at the existing draft (§5.8, §17A.13 check 2).

**Invariant (F22).** The submitted envelope carries the proposition the review surface rendered; two activations produce one dispatch; a close during creation is refused; a failed creation returns the same proposition to review; a terminal session offers no approval or edit affordance. *Named mutation: on a failed creation, clear the session's proposition; the "work survives failure" row must redden.*

### 12A.16 Failure treatment: the `ErrorDto` map and the `failed` result

Deepens §5.8, §11; consumes contract 04 §6, backend master plan §6.3, §17A.13; contract 05 §6. Ledger: **F23**. Serves **F2**, **F5**.

**Two channels, never merged.** A `failed` **domain result** is an outcome of a run; an **`ErrorDto`** is a failure of a call. Routing a `failed` result through the error presentation, or an `ErrorDto` through the thread's failure turn as though it were a run outcome, misreports both.

**`failed` domain results**, total over the run failure reasons the backend defines (master plan §6.3):

| `failure.reason` | Presentation |
|---|---|
| `budget_exhausted` | a failure turn naming that the run reached its limit and which limit; the composer stays available so the human can send another instruction; no dedicated retry affordance is introduced |
| `model_output_invalid` | a failure turn stating that the result could not be produced; the issue **paths** may be shown; no model text exists to show and none is invented |
| `tool_output_invalid` | as above |
| `script_exhausted` | **not reachable in production** — a test aid only. Reaching a production rendering path with it is a defect, not a state to render |

In every row the session's proposition, if it has one, stays intact and rendered (§12A.9).

**`ErrorDto` treatment, total over the taxonomy's nine codes plus unknown** (contract 04 §6):

| `code` | Message | `details` read | Retry offered | Where it renders |
|---|---|---|---|---|
| `validation_error` | the DTO's `message` | `{ path, message }[]`, each rendered at its path (§12A.14) | never | at each named leaf; a path naming no rendered leaf renders at surface level |
| `unauthenticated` | the DTO's `message` | — | never | the surface that issued the call |
| `forbidden` | the DTO's `message` | — | never | the surface that issued the call |
| `not_found` | the DTO's `message` | — | never | the surface that issued the call |
| `conflict` | the DTO's `message` | the existing draft's uuid and editor URL, when present | never | the created/terminal presentation, pointing at the existing draft |
| `approval_required` | the DTO's `message` | — | never | the approval surface, with "Back to review" first in tab order |
| `integration_error` | the DTO's `message` | `system` and `status` as diagnostic detail | iff `details.retryable === true` | the surface that issued the call |
| `rate_limited` | the DTO's `message` | — | iff `details.retryable === true` | the surface that issued the call |
| `internal_error` | the DTO's `message` | — | never | the surface that issued the call |
| any **unknown** code | the DTO's `message` when present and non-empty, otherwise one named generic fallback | — | never | the surface that issued the call |

**Rules that make the table bite.**

- The DTO's `message` is rendered as given. A UI-authored string never replaces a message a known code carried (contract 05 §6); the generic fallback exists only for the unknown-code row and only when no message is present.
- **Retry is offered iff `details.retryable === true`**, for every code without exception. An absent `retryable` is `false`, never `true`. This is one rule rather than a per-code judgement, so a backend that later marks a code retryable needs no presentation change, and a presentation that offers retry on a validation failure is a defect (a validation error is corrected, never retried — contract 05 §6).
- Retry re-issues the same intent with the same input; it is not a new turn with a new payload.
- `details` is read only through the keys named above. The client never string-parses a message, never infers retryability from wording, and never inspects a key this table does not name.
- The creation-failure presentation keeps "Back to review" always available and first in tab order, offers "Try again" only under the retry rule above, restates that nothing was sent, and moves focus to the error heading with alert semantics (§5.8, §12A.17).

**Invariant (F23).** Each of the ten `ErrorDto` rows and each of the four `failed` rows renders its stated treatment; no known code's message is replaced; retry appears exactly when `details.retryable === true`. *Named mutation: offer retry whenever `details` is present; the validation-error and the non-retryable integration rows must redden.*

### 12A.17 Focus and announcement transitions

Deepens §5.1–§5.8; contract 05 §7, design 02 §5, 03 §5, 04 §5, 06 §5, 07 §5, 08 §5, 09 §5. Ledger: **F24**. Serves **F6**.

**Focus destinations, total over the workspace's transitions.**

| Transition | Focus lands on |
|---|---|
| a session is activated from the strip | the activated tab (roving tabindex; activation follows focus) |
| a session is activated and its Main Application Surface context is restored (§12A.22) | the activated tab — **restoration moves no focus**, whichever state or entry it resolves to |
| a session is activated because another was closed | the newly active tab (§12A.5) |
| the last tab is closed and a session replaces it | the replacement tab |
| a tab is moved by keyboard | stays on the moved tab, with its new position announced |
| the clarification panel opens | the first unanswered question's first interactive element — never the dismiss control |
| the clarification panel is dismissed or submitted | the composer |
| inline edit is entered | the edit input |
| inline edit is committed or cancelled | the trigger that opened it |
| an anchored ask-agent surface opens | its input |
| that surface closes, by any path | the trigger that opened it |
| the creating presentation is entered | its status heading |
| the created or recovered presentation is entered | its headline, made focusable for this purpose only and not left in the tab order |
| the failure presentation is entered | the error heading, with alert semantics; "Back to review" is the first tab stop |
| a divider reset is performed | stays on the divider |
| **a turn result is applied to the active session** | **unchanged — an arriving result never moves focus** |
| **a turn result is applied to a non-active session** | **unchanged — nothing in the active session moves, and nothing is announced there** |

The last two rows are the ones a background session makes easy to get wrong: a result arriving in session A must not disturb a human typing in session B.

**Announcements.**

- **Restoration announces nothing of its own.** Activating a session already announces through the activated tab's accessible name (§12A.3), which carries the session's title, status text, note and unread count. The restored Main Application Surface content fires no second announcement, and neither does a retained entry that resolved to its stated default (§12A.22): one deliberate act produces one announcement. Operating the work-surface toggle announces the view it selected (design 08 §5); activating a session does **not** re-announce the view it restored. *Named mutation: announce the restored work surface on activation; the one-announcement-per-switch row must redden.*
- The thread is a log region announcing **completed turns only**, once each. Never the in-flight indicator, never a token stream, never on a loop; the animated indicator is hidden from assistive technology (design 03 §5).
- A session's status change is announced politely and **debounced to the settled state**: a session moving through `working` to `ready` produces at most one announcement (design 04 §5). The debounce window is a named constant; criteria assert the contract, not the literal.
- The creating and created presentations announce their outcome once each, politely; the failure presentation announces through its alert semantics.
- Reduced motion is honoured for every animation named in the specifications: the pulsing dot, the thinking dots, the spinner, and any entry animation.

**Forbidden.** A `title` attribute as an accessible name; a state carried by colour alone; focus left on the document body after any transition above; an announcement fired per update rather than per settled state.

**Invariant (F24).** Every row of the focus table holds, verified by interaction rather than by inspection, and a result applied to a non-active session moves no focus and fires no announcement in the active one. *Named mutation: move focus to the thread when a result is applied; the two "unchanged" rows must redden.*

### 12A.18 Thread autoscroll and the follow state

Deepens §5.2; design 03 §3.3, §5, design 05 §4.1. Ledger: **F25**. Serves **F6**.

**Two states per session, and no third.** The thread's follow state is `following` or `detached`. It is disposable UI mechanics (§8.1), initialised to `following` when a session's thread is first rendered and reset to `following` on entering a session.

**The transitions are total:**

| From | Event | To |
|---|---|---|
| `following` | a user-initiated scroll that leaves the bottom threshold | `detached` |
| `following` | new content appended | `following`; the viewport stays pinned to the bottom |
| `following` | a programmatic scroll | `following` — a programmatic scroll never detaches |
| `detached` | a user-initiated scroll back within the bottom threshold | `following` |
| `detached` | the jump-to-latest affordance is activated | `following`, and the viewport moves to the bottom |
| `detached` | new content appended | `detached`; the viewport does not move; the jump-to-latest affordance is shown |
| either | the session is switched away and back | `following` |

**While detached, nothing moves the reader.** No arriving result, no completed turn, and no announcement scrolls the thread. This is the "never yanks a reader upward" requirement stated as a state machine.

**Pill expansion never scrolls the thread**, in either state: the payload grows downward in place (design 03 §3.3, design 05 §4.1). Autoscroll is additionally suppressed while focus is inside an expanded pill or the clarification panel (design 03 §5), in both states.

**The bottom threshold is a named constant.** Criteria assert the contract with adjacent-pair rows — exactly at the threshold is `following`, one unit beyond is `detached` — never the literal (charter rule 13). Design 03's open question 3 records that the specification's suggested distance is not measured; it stays a design delta.

**Forbidden.** `scrollIntoView` for new content; locating the scroll container by document query (design 03, 04 "Prototype-only"); a follow state shared across sessions; scrolling on a result applied to a non-active session.

**Invariant (F25).** Every row of the transition table holds, and appending content while `detached` leaves the scroll position unchanged. *Named mutation: treat a programmatic scroll as a user scroll; the "programmatic scroll never detaches" row must redden.*

### 12A.19 Narrow-width resilience

Deepens §5.1, ratified boundary 15; design 02 §3.2–§3.3. Ledger: **F26**. Serves **F6**.

The narrow-layout **mechanism** — reflow thresholds, whether and how the agent surface yields, any collapse or overlay — is a design and planning decision (§5.1, §14.2, design 02 §3.3). This section fixes the **invariant that any mechanism must satisfy**, so that "must remain usable and must not visually corrupt" is decidable.

**At every width in a named test set — the designed wide width, the specification's two stated thresholds, and the V1 floor — all of the following hold simultaneously:**

1. the document itself does not scroll horizontally;
2. no pane's content overflows its own pane horizontally, except inside a container that declares its own horizontal scroll (the tab strip is such a container by design);
3. every interactive element named in §5 is reachable and operable by keyboard;
4. no text node is clipped to zero rendered width; text that does not fit ellipsizes or wraps, and its full value remains in the element's accessible name;
5. the agent pane is never rendered below its stated minimum width.

**Divider width.** The divider's clamp is design 02 §3.2's arithmetic over layout values — permitted, and unrelated to the money rule (§12A.12). The width is page-lifetime UI state, re-clamped on viewport change, never persisted (§7, ratified boundary 3, design 02 open question 1). The divider is a real separator with the keyboard model design 02 §5 requires.

**Forbidden.** A fixed pixel width on a content column; reading the window width during render (design 02 "Prototype-only"); a layout that satisfies the invariant only at the designed width.

**Invariant (F26).** All five conditions hold at every width in the named test set, verified by rendering rather than by visual review. *Named mutation: give a content column a fixed width instead of a maximum; condition 1 or 2 must redden at the narrowest width.*

### 12A.20 Free text rendering and external links

Deepens §4, §5.7, §5.8; contract 10 §4, §6, §10; consumes backend §17A.16, §17A.3 (editor-origin validation). Ledger: **F27**. Serves **F4**, **F5**.

**Every string that originates from the model, the human, or the catalog is rendered as text.** No HTML, no markup interpretation, no template interpolation, no automatic link detection, no rich-content renderer. This covers the title, the narrative, reviewer comments, commercial notes, assumptions, warnings, agent rationale, clarification question text, catalog-verbatim titles and descriptions, the human's own thread messages, and every `ErrorDto` message.

**Whitespace is preserved** where a value can carry deliberate line breaks — a pasted brief and the narrative most of all (design 03 §3.4) — so preserving line structure is a rendering treatment, not an interpretation of markup.

**Stated consequence.** The proposition's title and narrative are Markdown in the vendor's subset (§17A.16), and Proposales renders them. Under the rule above, V1 displays their characters literally, including any Markdown syntax, on both the review surface and the client preview. Rendering them as rich content would require a sanitizer and a recorded decision (contract 10 §4) that this intention does not take. Decision 9 ratifies this as-written V1 treatment.

**External links.** The editor URL is rendered **exactly as the server returned it**: never constructed from a proposal uuid and a base, never rewritten, appended to, normalised, or re-encoded. Its origin was already validated against the configured editor origin inside the server's state schema (§17A.3); the presentation adds no second validation and no fallback. It opens in a new browsing context so the page-lifetime workspace survives, with `rel="noopener noreferrer"` (§5.8, contract 10 §10), and the fact that it leaves the application is part of its accessible name. *Named mutation: build the href from the uuid and a base constant; the URL-identity row must redden.*

**Nothing privileged and nothing secret enters the client graph or client state** (§4, contract 02 §5, 10 §2): no integration configuration, no key, no company identifier, no server module import.

**Invariant (F27).** No rendered value passes through a markup or rich-content path; the editor link's href is character-identical to the server-returned URL and carries the new-context relationship attributes. *Named mutation: render the narrative through a Markdown-to-HTML path; the text-rendering row must redden.*

### 12A.21 Retained Main Application Surface context: qualification, reference-only content, and the seam

Deepens §5.3, §8.1, §8.3, §8.6, §12A.1, §12A.7, §12A.8; owner decision 11. Ledger: **F28**. Serves **F1**, **F7**.

§8.6 fixes the semantic boundary and hands the representation and the qualifying-interaction list to planning (§14.3 item 5a). "Meaningful" is an adjective, and F1 now asserts an observable over it. This section fixes the **test that planning's enumeration must satisfy** — what an entry is, what it may hold, what may never qualify, who writes it, when it is read, and what an undecided candidate does. It enumerates nothing and names no object, slice, key, field, or component.

**The retained context is a closed, named set — not an open map.** Per session it is a set of **entries**, each with a name, one admissible value domain, and one stated default. Its membership is enumerated by the planning pass and fixed in the master plan's naming registry before the first phase that implements restoration; a phase does not add an entry. A `Record<string, unknown>`, a key space produced at runtime, a serialisation of a component subtree, or an entry a component creates on first use is not this mechanism — it is the snapshot architecture §8.6 and design 04 ("Prototype-only") prohibit and contract 16 §5 names as a generic session engine.

**The set is non-empty.** §6 lists session-controlled restoration of Main Application Surface context among must-ship, so an empty enumeration satisfies F1 vacuously and ships nothing.

**Qualification — four conditions, all of which must hold.** A candidate is category A only if:

1. **Presentation-owned.** Its authority is the client alone. Every category-C value fails here and is never promoted by being displayed (§8.6).
2. **Reference, not value** — it satisfies the value-domain table below.
3. **The product of a deliberate user act on the Main Application Surface** — an act the user performed in order to be where they are (choosing which work surface is shown, opening or selecting something, moving to a location within the surface) — and not a state that happened to them: hover, pointer or pressed state, transient focus, animation, scroll offset or momentum, viewport, layout, or a control's own open/closed mechanics (§8.6 category B).
4. **Not derivable.** No entry may be a value §12A.7's register computes, nor a value computable from another entry together with the session's server-returned objects. A derivable candidate is derived, never retained.

A candidate failing any condition is not retained. **Where a candidate's classification is genuinely undecided, it is not retained.** §8.6 admits only what is *explicitly* meaningful, and the asymmetry is the reverse of §12A.6's: over-retention rebuilds a prohibited architecture and can promote a category-C value into presentation state, while under-retention costs the user one deliberate act they can repeat. Conditions 1–4 are decidable per candidate, so this direction governs residual cases only and is never a licence to leave the enumeration thin.

**Reference, not value — the decidable line.** An entry's value domain is exactly one of two classes, and nothing else:

| Admissible class | What it is |
|---|---|
| a member of a **closed presentation enumeration** named in the project's registry | a presentation-owned choice with a fixed, small domain — for example which of the surface's own work surfaces is shown |
| an **identity the current server-returned objects carry**: a `Path` (§17A.1), a content id, a question id, or a block index as the domain ordered it | a name for a thing, resolved against what is rendered |

**Never admissible.** Any value read out of a category-C object: a leaf value, a `Money`, a provenance class or flag text, an item resolution, a warning, an assumption, agent rationale, a result status, a proposition or any part of one, the acknowledgment, a draft reference, an editor URL, an `ErrorDto` or its message. Also never: a client-computed fact; any row of §12A.7's register; a DOM id, a React key, a view-model field name, an adapter output field, or an index into a view model.

*The line, stated as a test:* rendering a session's Main Application Surface from its retained context **with the session's server-returned objects removed** produces no category-C value on screen. *Named mutation: store the selected block's rendered quantity in the retained context and render it from there; the reference-not-value row must redden.*

**Writing and reading.**

- An entry is written **only** by the deliberate user act condition 3 names, in the session that act was performed in. Nothing else writes it: not a result application, not an adapter, not a render, not a session switch, not an activation, not a close.
- **A turn result applied to a session neither reads nor writes that session's retained context**, for every session, active or not. §12A.2's resolution path is unchanged and the active session id is still never read there (§12A.2 rule 4). This is what makes the rule total without a per-session branch and without a second place that can be wrong.
- An entry is **resolved at render**, against whatever the surface then renders (§12A.22). It is never resolved at write, never cached against a resolved target, and resolution never writes back.
- An entry whose identity does not resolve against the current render input yields that entry's **stated default**. It is never substituted, reconstructed, remembered, or rendered from a captured copy, and a failure to resolve is not itself an error, a notice, or a state (§12A.22).

**The seam.** Because every entry holds a presentation-enumeration member or a domain identity, the adapter-era → production-adapter replacement (§12A.8, §10.4) changes no entry's name, value domain, or default, and F15's claim survives unchanged. An identity that a re-fetch can invalidate is admissible **because** an unresolvable identity yields the default rather than a stale render; an entry keyed by anything the adapter invented is not.

**The register.** Retained context is not a row of §12A.7 and is not derived. With the unread counter it is one of exactly two stored presentation values in the workspace. No register row may read an entry; no entry may be a register row's source (§12A.7).

**The Agent Surface is not governed here.** §8.6's three categories are stated about the Main Application Surface. The Agent Surface's per-session composer draft survives a session switch by §8.1 and owner decision 7 — it is not a §8.6 category-A entry, not part of this set, and §12A.6 reads it directly as input (6). The clarification panel's step position and unsent typed values remain category B (§8.1), and the typed text of an in-progress inline edit remains disposable (§12A.14).

**No persistence is introduced.** This is page-lifetime memory inside one browser page, not a rehydration path: no `localStorage`, `sessionStorage`, IndexedDB, URL parameter, or server round-trip carries an entry, no entry survives a reload, and contract 05 §5.2's prohibition on restore-after-reload affordances and on store shapes justified by future serialisation is unaffected (§7).

**Forbidden.** An entry whose value is a category-C value; an open or runtime-derived key space; an entry created outside the fixed enumeration; a snapshot of a component subtree, of arbitrary DOM, or of every transient control; retention of category-B mechanics; an entry written on the result-application path; an entry read anywhere but at render; an entry serialised, persisted, or shared between sessions.

**Invariant (F28).** Every retained entry is a member of the project's fixed enumeration; holds only a closed-presentation-enumeration member or a domain identity, never a category-C value; is written only by its deliberate user act in its own session; is read only at render; and yields its stated default when its identity does not resolve. No §12A.7 register row reads an entry, and no result application writes one. *Named mutation: write a session's retained context from the turn-result application path; the "results never write retained context" row must redden. Second named mutation: hold the selected item's rendered value instead of its identity and render from it; the reference-not-value row must redden.*

### 12A.22 Restoration on activation: the total case table

Deepens §5.3, §5.8, §11, §12A.3, §12A.9, §12A.15, §12A.17, §12A.21; owner decision 11. Ledger: **F29**. Serves **F1**, **F6**.

Activation presents the activated session's record on both surfaces (§12A.1, §5.3). What the Main Application Surface presents is a function of **that session's record alone**: its in-flight turn, its workflow state, its latest domain result, and its retained entries resolved against them. The session that was active before activation is not an input, and no case reads another session's record.

Restoration is two total functions, not one table, because the state and the place inside it are decided separately.

**(A) Which Main Application Surface state is presented — total, first-match-wins.**

| # | Condition | Presented |
|---|---|---|
| 1 | this session's approval/execution turn is in flight | the creating presentation (§5.8): one centred working state; no header, view toggle, discard, or approval control |
| 2 | the workflow state carries a draft reference | the created presentation, newly created or recovered (§12A.9 rows 4–5; §12A.15's terminality) |
| 3 | the workflow state carries a current proposition | the Proposal Preparation work surface the session's retained work-surface entry names, or that entry's default; a `failed` latest result renders on it per §12A.9 row 3 and §12A.16 with the proposition intact |
| 4 | none of the above | the Proposal Preparation **idle** state — the surface's own state for having nothing yet (§11 names `idle` as a state every surface renders intentionally) |

Rows 1–4 partition every record: a session either has an approval turn in flight, or a draft reference, or a current proposition, or none of these.

**The overlaps, enumerated** (charter rule 2):

| Overlap | Resolution |
|---|---|
| an approval turn in flight **and** a draft reference exists (a re-approval the server will refuse) | row 1 |
| a draft reference **and** a current proposition (always true after creation) | row 2 |
| a current proposition **and** the latest result is `clarification` | row 3 — the proposition stays rendered (§12A.9 row 1); the questions are the Agent Surface's |
| a current proposition **and** the latest result is `failed` | row 3 — the proposition stays intact and rendered (§12A.9 row 3) |
| no proposition **and** the latest result is `clarification` or `failed` | row 4, the idle state; a failure with nothing to return to is reported on the Agent Surface (§12A.9) |
| a **non-approval** turn in flight (brief, clarification answers, an edit, a revision) | does not match row 1; rows 2–4 decide. An in-flight turn shows on the Agent Surface and in the derived status (§12A.3 row 1); it never replaces the Main Application Surface |

**What the idle state is, and is not.** It is the Proposal Preparation experience's own no-proposition state. It is **not** a proposal list, a dashboard, a statistics strip, a session history, a route, or a second surface (§6, design 10 §7, §12A.23). No design specification defines it — the prototype filled that space with the excluded list view — so its visual treatment is a **design gap reported to the design specifications** (§14.2, design 10 §4) and V1 renders an honest empty state until the specs answer it.

**(B) How each retained entry resolves — total, three rows.**

| Entry condition at render | Resolves to |
|---|---|
| the state (A) presents has the place the entry names, and the entry's identity is present in what is rendered | the entry's value |
| the state has that place, but the entry's identity is not present in what is rendered (a block a later proposition version removed; an item a clarification round replaced) | the entry's stated default |
| the state has no such place at all (rows 1, 2 and 4 of (A), for a work-surface or location entry) | the entry's stated default |

In rows 2 and 3 the entry is **not cleared, not rewritten, and not deleted**: it resolves again, to its value, as soon as a later state carries its place and its identity. Every entry resolves independently; one entry resolving to its default never changes another's resolution.

**An entry never overrides the state.** The session's own record decides which state is presented; an entry decides only where inside it the user lands, and only where that state has such a place. An entry can neither suppress, delay, substitute, nor re-enter a state.

**Stale context is never surfaced as a condition.** No case produces a notice, a warning, a restoration-failed state, an error, or an announcement that the user's place moved (§12A.17). The unread badge (§12A.4) is the workspace's existing and only signal that something arrived in a session while the user was away; a second signal about presentation state would report a fact the product does not own.

**Nothing is reconstructed.** No case derives a proposition, provenance, a resolution, a status, an amount, a draft identity, or any other category-C value from a retained entry or from what the surface previously showed (§8.6, F1). "The idle state" is the surface's state for having nothing, never a rendering assembled from what the session used to show.

**Restoration is not navigation.** No case changes the URL, pushes or replaces a history entry, mounts a route, or replaces either landmark (§12A.23).

**Focus and announcement.** Activation moves focus to the activated tab and restoration moves it no further; restoration fires no announcement of its own (§12A.17).

**Invariant (F29).** For every row of (A), including each enumerated overlap, activating a session in that condition presents exactly the stated Main Application Surface state; for every row of (B) each retained entry resolves to its target or to its stated default without being cleared; no category-C value is reconstructed; and no notice, error state, or announcement is produced about the restoration. *Named mutation: clear a session's retained context when a result is applied to it while it is not active; (B) row 2's re-resolution must redden. Second named mutation: render (B) row 2 from the value captured when the entry was written; the "nothing is reconstructed" row must redden. Third named mutation: swap rows 1 and 2 of (A); the "creating beats created" overlap must redden.*

### 12A.23 Shell structural persistence and V1 surface containment

Deepens §1, §5.1, §6, §8.6; owner decision 11; contract 05 §7, 12 "Structure and abstraction", 16 §5. Ledger: **F30**. Serves **F1**, **F6**.

**Two landmarks, one identity each, for the page's lifetime.** The shell renders exactly one complementary region — the Agent Surface — and exactly one `main` — the Main Application Surface (§5.1). Activating, creating, closing or reordering a session changes **what the Main Application Surface presents** and **which session the Agent Surface presents**. It changes neither landmark's existence, role, accessible name, or identity, and it unmounts and remounts neither.

Stated so it is decidable: across any sequence of activations, creations, closes and reorders, at every rendered frame the count of complementary regions is 1 and the count of `main` elements is 1; both are the same elements throughout rather than replacements; and the Agent Surface's structure is not a function of the active session's result kind, status, or presented Main Application Surface state.

**Session-controlled content, never session-controlled structure.** A session controls which state its Main Application Surface presents (§12A.22 (A)) and nothing about the shell. A session does not own, choose, register, declare, or supply a surface — in V1 there is nothing for it to choose between.

**V1 has exactly one Main Application Surface** (§6, owner decision 11). "The shell is not architected as if it could only ever be Proposal Preparation" is a constraint on how the boundary is drawn and named — the Main Application Surface does not take proposal-shaped props at the shell boundary, and it is not named the proposal pane — and it is **not** a licence to build for a second one. The name is the abstraction decision 11 took; structure is not.

**Forbidden, and closed for V1.**

- A router, route, URL segment, query parameter, history entry, or navigation event for a workspace surface or a session. A session is not addressable, and restoration is not navigation (§12A.22).
- A surface registry, surface map, surface factory, provider that resolves a surface, plugin point, or extension point.
- A discriminant over surface kinds — a union, enum, constant map, or `switch` whose domain is "which application surface" — carrying one member in V1. One surface needs no discriminant; adding one is the generic session engine contract 16 §5 forbids and the premature abstraction contract 12 prohibits.
- A second Main Application Surface, a dashboard, an analytics or statistics surface, a Product Library, a Customers or Settings surface, a proposal list, a session-history or archive surface, or any internal application route added to show that the shell could carry one (§6, design 10 §7).
- A shell-level abstraction introduced because decision 11 named the surface generically.

**Invariant (F30).** Across a sequence of session activations, creations, closes and reorders, the shell renders exactly one complementary region and exactly one `main`, both the same elements throughout; no URL, route, or history entry changes; and no module declares a second Main Application Surface or a surface-kind discriminant. *Named mutation: push a history entry on session activation; the "restoration is not navigation" row must redden. Second named mutation: unmount and remount the Agent Surface when the active session's result kind changes; the landmark-identity row must redden.* The absence half of this invariant is a source-level check, and under charter rule 15 it ships with a probe that **plants** the forbidden construct — a second surface-kind member — and observes the check fail; measuring the absence is not evidence that the check could ever observe the presence.


## 13. Conflicts discovered (surfaced, not silently resolved)

| ID      | Conflict                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Required decision and its source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **C-1** | Design 07 and 08 present per-line prices, a computed total, "Needs price" flags, an unpriced note, and a 36px grand total in the client preview. The ratified backend intention (§3.1, §9.1, invariant 16–17, criterion 20) establishes that the proposition carries **no price and no total before creation**, that each block takes library pricing, and that the first sight of money is the Applied Pricing read back after creation.                                                                                                                                                                                                                                                                  | The backend intention is the truth authority for pricing (design 10 §1). Resolution: the review and preview show library-pricing statements and commercial notes, no total; the created state gains an Applied Pricing presentation the specs do not cover (§5.6–§5.8). The design specs need a recorded delta; this document does not edit them. Presented on the ratification surface (§15.1 item 4a).                                                                                                                                                                                                                                                                                                                                              |
| **C-2** | Design 06 specifies typed questions (choice, amount with suggestions, date, unit, note, per-question skip label). The ratified clarification shape is text question + free-text answer or skip (backend §17A.7).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | The backend owns clarification truth. Resolution: V1 renders the ratified shape; the richer mechanics stay presentation vocabulary that only a backend amendment can activate (§5.5, §14.1 item 1). Surface item 4b.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **C-3** | Design 07's "Push anyway" lets the user proceed with open questions and is never disabled in the prototype. The backend refuses approval when a required-to-create item is unresolved (§17A.6) and accepts deferred or optional gaps.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | The truths that hold regardless of treatment: the frontend never computes the verdict; unresolved information is clearly presented; the server's refusal is rendered with its reason and paths (§5.6). The enabled/disabled/warning treatment of the control is a design/planning decision, not ratified here; copy is a design delta. Recorded for transparency.                                                                                                                                                                                                                                                                                                                                                                                     |
| **C-4** | **The committed code and the current-state documents disagree about the visual foundation.** Commit `f957f66` deliberately removed the bootstrap UI primitives, their CSS Modules, the shell, and `src/styles/tokens.css` as a simplification. The root README, the contracts README ("Today: `Button`, `Input`, `Textarea`, `cx`"; the CSS-Modules "Known conflicts" row), and contract 15 §2/§4/§6 still describe that deleted foundation; until `25d6b28` the committed `globals.css` still imported the deleted `tokens.css` and the production build failed (§2.1); the end-to-end spec still asserts a shell the layout does not render. Contract 14 §1 requires current-state documents to be true. | This is documentation/code drift, not a mandate in either direction. Resolution: establish which representation is authoritative (the ratified Tailwind mechanism with values defined once, as §5.9 states) and patch the stale documents to current truth; keep the obsolete import removed; reconcile the end-to-end spec. The repository baseline must be internally consistent before or during the first frontend implementation milestone. Whether a reusable token abstraction is introduced is a planning/architecture decision grounded in real reuse, **not** an automatic restoration of the deleted file. Listed so nobody documents the deleted foundation as present and so stale documents do not bootstrap themselves into authority. |
| **C-5** | The backend plan adds no transport (R3) because an unprotected execution path in a deployment with no authentication is a stated risk (backend §16.2). The UI needs a browser-reachable boundary, which is a public endpoint in a deployment without authentication (contract 04 §3, 10 §3).                                                                                                                                                                                                                                                                                                                                                                                                               | Resolved by owner decision 4 (§15): the integration stream owns the thin validated boundary; live-credential deployments are protected at the platform level, and live mutations are not exposed without it; browser input remains untrusted (§4, §10.3).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **C-6** | Design 04 §1 says sessions "advance while unfocused". Ratified boundary 7 forbids fake background transport.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Not a real conflict once stated precisely: a session advances while unfocused only because a real turn it started is still in flight; nothing simulates progress (§5.3). Recorded so the phrase is not read as a polling requirement.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

## 14. Intentionally unresolved, and who owns the resolution

### 14.1 Owned by the backend intention or a backend phase

1. **Typed clarification questions** (options, amounts, dates, units, notes, skip labels): whether they exist at all is a backend intention amendment (its §8.2, §17A.7). The frontend keeps the mechanics as vocabulary and builds the ratified shape.
2. **Field-scoped revision**: whether "ask the agent about <field>" becomes a structured parameter of the revision turn rather than wording inside the instruction. Backend phase 12 / intention §11.2.
3. **Turn-level change summaries** (the `diff` pill's "3 fields changed"): whether the difference between consecutive proposition versions is a server-supplied result, a client-side presentation derivation over two server-emitted propositions, or not shown. Today the state carries exactly two propositions and the only server-supplied differences are revision warnings with before/after and the approval diff (backend §17A.3, §17A.9, §17A.10). The client does not compute it until this is decided.
4. **Streaming and live progress** (progress-step traces, creation steps, token streaming): no backend contract; returns only if a future backend contract defines a safe, user-facing progress representation (contract 08 §9, backend R4). Private model reasoning is never such a representation.
5. **The human-search candidate shape**, should a later initiative add a dedicated search surface: it is `searchContentForHuman`'s (backend phase 12); a UI would render it, not define it. Not a V1 surface (owner decision 3).
6. **Approver identity and any per-user state**: absent by decision (backend §11.3; contracts README "Authentication").

### 14.2 Owned by the design specifications (design deltas, non-blocking)

Tab-strip tone, border-ramp collapse, hover easing, the positive token, half-pixel type snapping, the narrow-width mechanism (§5.1), the approval control's enabled/disabled/warning treatment (§5.6), `ready` versus `created` dot distinction, inactive-tab close-on-hover, overflow indication, `thought` versus `action` hue, acting versus disclosing pill shell, default pill expansion states, the panel's stacked-questions mode, partially-filled batch send (currently allowed), visible after-the-fact "skipped" record, `≈` suggestion semantics, the 62vh cap, popover anchoring unification, field grouping, centred versus left-aligned intro prose, hero growth, print/PDF/copy on the preview, final copy for the approval action, the human-edit and agent-revision flag labels, the creation error-state values. V1 implements the current spec behaviour where it does not conflict with §13, leaves a marker, and reports (design 10 §4).

### 14.3 Owned by the frontend planning pass (mechanism and sequencing, not product)

1. Making the repository baseline internally consistent (C-4): deciding the authoritative visual-foundation representation, reconciling the end-to-end spec, and patching the stale documents, before or during the first milestone (the obsolete import is already removed at `25d6b28`).
2. The feature folder for the workspace: whether it is the client half of the existing proposal-preparation feature or a sibling feature importing only what contract 03 §4 permits. Ratified boundary 1 ("one feature workspace") constrains the *experience*, not the folder.
3. Where the client subtree begins so that server-rendered structure composes around the interactive surfaces (contract 02 §1); the store-ladder position of §8.2 and §8.3 (contract 05 §5.1); which specific Radix primitives each composite interaction uses, whether a native element serves a given interaction better, and which primitive packages each milestone adds (the library itself is decided, §4.1 and §15 decision 6; the per-interaction mapping and package set are not).
4. How component and hook verification is collected by the existing test runner configuration, which today claims only specific paths (§2.1).
5. The concrete form, location, signatures, and sequencing of the browser-to-server boundary (§10.3), within what the applicable ratified contracts already fix.
5a. The shell's component hierarchy and names; how the meaningful Main Application Surface context of §8.6 is represented (component state, a reducer, a feature store, or a combination under contract 05 §5.1); its exact keys and fields; and which interactions count as meaningful resumable context versus disposable mechanics (owner decision 11).
6. Phase sizing so that every surface is buildable on fixtures first and each phase closes green on its own (charter, ≤ 8 criteria per phase).

## 15. Ratified owner decisions (0 open)

No owner decision is open. The four cards presented in rounds 0–1 were decided by the owner on 2026-09-05 (§16 round 2); decisions 5–6 were amended on 2026-09-06 (§16 round 3); decisions 7–10 ratified the mechanism inventory's four recommendations on 2026-09-06 (§16 round 5); decision 11 amended the shell model on 2026-09-06 (§16 round 6). Each record below is the authority for its matter; the sections it names carry the propagated wording.

### Decision 1 — Slash palette: deferred from frontend-core V1

- **Decision.** The slash palette is out of frontend-core V1 and may be reconsidered later, when the product has enough meaningful commands to justify a command surface.
- **Rationale.** Every important V1 action already has a direct, visible interaction surface: new session, session switching, clarification, proposal review, revision, and "Create in Proposales". A palette would duplicate them while adding another interaction model, keyboard and focus behaviour, an accessibility surface, and a command vocabulary, without materially strengthening the core workflow.
- **Consequences.** §5.2 states the exclusion; §6 lists the palette and any prototype slash-command set under explicitly deferred scope; the prototype's `/new`, `/draft`, `/history`, `/pushed`, and route commands stay excluded with the rest of its prototype-only navigation (§4, design 03 "Prototype-only").
- **Still deferred.** The palette itself, and the definition of any future command set.

### Decision 2 — Closing or discarding work: confirmation guard, no undo

- **Decision.** Closing or discarding a session with meaningful page-lifetime work requires explicit confirmation. Empty sessions close immediately. No undo or archive mechanism is introduced in V1.
- **Rationale.** V1 intentionally has no persistence, archive, history, or reload recovery, so closing a session destroys its workflow with no way back; one explicit step is the proportionate guard, and an undo would require a toast surface, a timer, and a place to keep a closed session alive.
- **Consequences.** §5.3 (tab close) and §5.6 (discard) state the behaviour; §6 lists undo/archive as deferred; §11 and F1 name the outcome. Whether a session holds meaningful work is derived by the planning/integration pass from the real session and workflow state available at that stage; this intention deliberately defines no frontend heuristic for it.
- **Still deferred.** Undo and archive, together with every other persistence-adjacent affordance (§7).

### Decision 3 — Human content replacement: retained alternatives only

- **Decision.** V1 replacement uses the block's retained alternatives. Broader content discovery is requested through agent revision or re-search. A dedicated free-text human content-search UI is deferred from this frontend initiative.
- **Rationale.** The V1 stays centred on the agentic preparation workflow (human intent → agent searches → candidates proposed with retained alternatives → human selects; insufficient candidates → revision/re-search instruction → updated proposition) rather than reproducing a manual content-library browser inside the review pane, with its standalone search state, debounce, pagination, loading/error/empty states, and a second discovery pathway.
- **Consequences.** §5.6 states the replacement rule; §6 lists the search UI as deferred; §10.2's phase-12 row and §14.1 item 5 note that the backend's human-search capability (`searchContentForHuman` or equivalent) is established by the backend on its own terms and is **neither deleted nor constrained** by this decision; it simply has no dedicated V1 surface.
- **Still deferred.** A dedicated human content-search surface, if a later initiative wants one.

### Decision 4 — Browser-to-server boundary ownership and deployment exposure

- **Decision.** The frontend/application integration stream owns the thin validated browser-to-server boundary and adds it as the real backend services become available. Backend/domain services remain transport-independent and authoritative. Application authentication is not required for MVP. A deployment connected to live Proposales credentials must be protected at the deployment/platform level; if adequate deployment protection is absent, live mutation actions must not be exposed.
- **Rationale.** The boundary is the UI's transport by contract (04 §3) and the backend's plan deliberately left it out (R3); the application is a scoped take-home, so the owner protects the deployment at the platform level instead of adding application authentication as a prerequisite.
- **Consequences.** §4 carries the deployment-protection constraint; §10.3 states ownership, the conceptual layering, and the exposure rule; §6 lists application authentication as an optional later scope expansion, never assumed by this intention; §11 names the boundary's verification outcome; C-5 is resolved. Deployment protection is an operational access boundary, **not** application authorization: browser input stays untrusted and every runtime, validation, human-approval, and integration contract is enforced at the server boundary regardless. The boundary's exact mechanism, file names, signatures, and sequence remain planning decisions unless an applicable ratified contract already fixes them.
- **Still deferred.** Application authentication and authorization; introducing them later is a deliberate repository/product decision.

### Decision 5 — Lucide React is the production icon library (amendment, 2026-09-06)

- **Decision.** `lucide-react` is the standard icon source for ordinary interface controls: add/new, close, external link, search where applicable, expand/collapse, navigation arrows, status and action affordances, and other conventional controls.
- **Rationale.** The production frontend needs standard interface icons that are visually neutral and compatible with the custom Tailwind-based design; a single adopted set replaces platform-dependent glyph characters for controls (design 01 §1.11's concern about glyph metrics).
- **Consequences.** §4.1 places it in the dependency foundation; §5.9 states the control/glyph split; §5.4 keeps the pill-kind symbols (`✳`, `?`, `±`, `↗`, `▸`) as product vocabulary governed by the design specifications, never auto-replaced. Accessibility applies unchanged: decorative icons add no accessible name, icon-only controls carry one, and state is never communicated by an icon alone where non-visual information is required. The package is already present in `package.json` (§2.1).
- **Still deferred.** Nothing; any other icon set requires its own recorded decision (§6).

### Decision 6 — Radix UI Primitives is the preferred headless interaction foundation (amendment, 2026-09-06)

- **Decision.** Radix UI Primitives is the approved and preferred headless primitive library for composite frontend interactions in V1 wherever an appropriate Radix primitive correctly models the interaction. It supplies interaction mechanics and accessibility primitives only; it is not a pre-styled component system and never a source of product or domain truth.
- **Rationale.** The ratified experience contains several composites whose correct behaviour needs non-trivial mechanics (session tabs, focus-managed dialogs, anchored popovers, radio groups for typed choices if the backend supplies them, tooltips where justified, Escape behaviour, ARIA relationships, controlled and uncontrolled state). Building those mechanics independently throughout the application is where accessibility is usually lost (contract 15 §5); a headless foundation is the contract's own preferred answer.
- **Consequences.** §4.1 fixes the layering (Radix mechanics, Tailwind styling, Lucide icons, Proposal Copilot composition, adapters and view models as the presentation boundary, backend contracts as truth) and the seven boundaries: no pre-emptive installation of the ecosystem, headless only, no premature local wrappers beyond the promotion rule, product semantics win with native elements preferred when simpler, state ownership unchanged (§8), accessibility never assumed (F6, §11), presentation-layer confinement. §5.3, §5.5, and §5.6 name the interactions that rest on it; §14.3 item 3 keeps the per-interaction mapping and the package set as planning decisions. Likely mappings, as guidance and not as an installation list: session tabs → Tabs; ask-agent and other true dialogs → Dialog; anchored surfaces → Popover; typed clarification choices, if ever supplied → Radio Group; supplemental information → Tooltip where justified. Contract 15 §5's requirement that the adoption be recorded in the contracts README, naming the widget that justified it, is satisfied on the product side by this record; the README rows still reading "none decided" are patched in a separate documentation change (§2.2).
- **Still deferred.** Which primitives and packages each milestone actually adds; whether a given interaction uses a primitive or a native element.

### Decision 7 — Unsent composer text is meaningful work (amendment, 2026-09-06)

- **Decision.** A non-empty composer draft belongs to its session and requires explicit confirmation before that session is closed or discarded, including a draft made solely of whitespace. It remains page-lifetime UI mechanics, not server or workflow truth.
- **Rationale.** A pasted but unsent brief can be the most costly work in the workspace to reproduce. V1 has no undo, archive, history, or reload recovery, so closing it silently would destroy real human work.
- **Consequences.** §8.1 retains a non-empty draft with its session; §12A.6 adds it as the sixth meaningful-work input and preserves the false-positive-safe failure direction; F13 covers it. No client persistence is introduced.
- **Still deferred.** Durable drafts, recovery after reload, undo, and archive.

### Decision 8 — Refuse close during draft creation (amendment, 2026-09-06)

- **Decision.** A session whose approval/execution turn is creating a Proposales draft cannot be closed or discarded until that turn resolves. This is refusal, not a confirm-with-warning variant.
- **Rationale.** The request cannot be cancelled, and closing its only session could leave a real draft behind with no Copilot path to its editor URL.
- **Consequences.** §12A.6 and §12A.15 refuse the destructive intent and retain the session until the result is attributed; F13 and F22 cover the rule. All other meaningful-work closes retain decision 2's confirmation guard.
- **Still deferred.** Cancellation, durable recovery, and a proposal-history surface.

### Decision 9 — Render title and narrative as written in V1 (amendment, 2026-09-06)

- **Decision.** The review surface and client preview display title and narrative text exactly as supplied, including Markdown characters; V1 does not render rich text.
- **Rationale.** The preview is explicitly an approximation, while rich rendering would add a sanitizer and a security-sensitive rendering surface for limited fidelity gain.
- **Consequences.** §12A.20 renders all model, human, and catalog strings as text; F27 verifies the absence of a markup path. Proposales remains responsible for its own Markdown rendering.
- **Still deferred.** Rich-text rendering, its sanitizer, and a future decision justifying both.

### Decision 10 — Mark provenance, not client-computed change (amendment, 2026-09-06)

- **Decision.** The review pane marks who stands behind a value from structural provenance and does not render a client-computed “changed since” flag.
- **Rationale.** Origin is returned by the domain and supports approval; no V1 result supplies a per-leaf change record, so a browser diff would invent workflow truth.
- **Consequences.** §12A.10 renders `source = "human"` as human-set and keeps agent/brief/content provenance distinct; F17 guards the total map. The wording of the visual flag remains a design delta.
- **Still deferred.** A server-supplied turn-level or per-leaf change record and any presentation that consumes it.

### Decision 11 — Persistent agent shell + session-controlled main application surface (amendment, 2026-09-06)

- **Decision.** Frontend-core uses one persistent split workspace shell. The left Agent Surface remains structurally fixed. The right side is the Main Application Surface. Each page-lifetime session owns the meaningful presentation context needed to resume its current Main Application Surface state in addition to its workflow/conversation context. Switching sessions restores that meaningful context. Disposable mechanics are not preserved. Proposal Preparation is the only Main Application Surface implemented in V1, and this decision does not add any future app surface to V1 scope.
- **Rationale.** The shell had been described as "Agent Surface + Proposal Surface", which architected the right side as inherently and permanently proposal-specific and implied that session continuity covered only the conversation and workflow side. A session is not merely a conversation tab: a user who leaves session A reviewing a line item and returns from session B's preview expects A as they left it. Fixing the shell abstraction now avoids re-architecting it later, without adding scope.
- **Consequences.** §1 (shell model and diagram), §5.1 (split and landmarks), §5.3 (activation restores both surfaces' context; the restoration invariant), §2.4 (session and Main Application Surface rows), §3 item 6, §5.6 (the V1 review state), §6 (must-ship wording; deferred list names other surfaces and demonstrative routing as out of scope), §8.1, §8.3, §8.5, new §8.6 (meaningful context, disposable mechanics, authoritative truth; the no-snapshot prohibition), §11 and F1 (A → B → A restoration with no reconstructed truth), §12A.1 (the runtime record carries category-A context; forbidden list extended), §12A.6 (exclusion wording), §14.3 item 5a. No backend or domain ownership changed: category-C values stay server-returned and are never reconstructed from presentation or session context. No persistence was added: the context is page-lifetime, non-authoritative, non-persistent, and adapter-era where applicable; a reload still destroys the workspace (§7). V1 scope did not expand: no dashboard, Product Library, Customers, Settings, analytics, proposal list, history, other surface, or internal routing.
- **Still deferred.** Any Main Application Surface other than Proposal Preparation; the concrete representation of meaningful context and the list of interactions that qualify (§14.3 item 5a).

### Decision 12 — Warn before browser departure during draft creation (amendment, 2026-09-06)

- **Decision.** While any open session is creating a Proposales draft, the page requests the browser's standard departure confirmation before a reload, browser-tab/window close, or navigation away. It does not request that warning for other unsent or meaningful work.
- **Rationale.** A closing-session refusal already protects the one workspace link to a real draft while creation is pending. A reflex reload or navigation can otherwise destroy that link through a different exit, leaving the draft created in Proposales but inaccessible from this page-lifetime workspace.
- **Consequences.** §7 and §12A.6 define the all-sessions creation predicate, browser-owned warning limitation, and no-cancellation/no-recovery boundary; F13 covers the inactive-creating-session case. No client persistence, recovery surface, cancellation, transport change, or backend-owned contract is added.
- **Still deferred.** Durable recovery, cancellation, proposal history, and departure warnings for unsent work outside draft creation.

### 15.1 Ratification surface (presented after rounds 0–1; ratified in §16 round 2)

1. **Outcome.** §3, in the owner's words: one workspace where the human works with the agent on the proposal, reviews and corrects it, approves the exact proposition, and gets a Proposales draft with the amounts Proposales applied, to finish and send in Proposales.
2. **Measurement ledger.** §12, F1–F7 verbatim.
3. **Scope.** §6 must-ship and explicitly deferred.
4. **Consequential resolutions to confirm.** (a) No prices and no total anywhere in the UI before creation; Applied Pricing is presented in the created state exactly as returned (C-1). (b) V1 clarification renders text questions with free-text answer or explicit skip; typed questions require a backend amendment (C-2). (c) The frontend never judges approvability; the server's refusal is rendered with reason and paths; unresolved information is clearly presented; "push" wording is replaced; the control's enabled/disabled treatment stays a design decision (C-3). (d) Human edits are shown as human-set, distinct from agent revisions. (e) "Open in Proposales" opens a new browsing context. (f) No cancel during creation; one honest label instead of invented steps. (g) The created session is terminal in the UI. (h) The clarification panel opens automatically for the active session and is signalled by the tab for an inactive one. (i) The header mark and agent name are inert in V1. (j) Pane width is not persisted. (k) The visual foundation is established through the ratified Tailwind mechanism with values defined once; the deleted bootstrap token file and primitives are not restored by default; the baseline drift of C-4 is resolved before or during the first milestone.

5. **Owner decisions 1–4** (§15), decided on 2026-09-05 and folded into the sections they name before this surface was ratified.

This section is left as the record of what was presented; it is not a running summary.

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

**Round 1 (2026-09-05, shaper, consolidation and correction pass on owner instruction).** Status stays `DRAFT`. Corrections that supersede round-0 statements; earlier entries are left as written:

- **Repository baseline updated (§2.1).** Dependencies are installed; typecheck, lint, the unit suite (11 files, 118 tests), and the production build all pass at `25d6b28`. The build had failed at `404557d` on the obsolete `tokens.css` import, which `25d6b28` removed; the owner's correction brief described that earlier failing state. The round-0 statement that verification was impossible is withdrawn.
- **`tokens.css` no longer treated as authoritative (§2.2, §4, §5.9, §6, §14.3, surface item (k)).** The file was deliberately deleted during bootstrap simplification; the intention now requires a coherent reusable visual foundation through the ratified Tailwind mechanism with values defined once, and leaves a shared token abstraction to planning on evidence of real reuse, with the contract updated if adopted. Round 0's "the first phase restores `tokens.css`" is withdrawn.
- **C-4 reclassified** as documentation/code drift about the visual foundation, resolved by establishing the authoritative representation and patching stale documents, not by restoring the deleted file.
- **Narrow-width overlay withdrawn (§5.1).** Only the ratified intent remains: desktop-first, usable and uncorrupted at narrower widths, no mobile redesign; the mechanism is a design/planning decision.
- **"Approval never disabled" withdrawn (§5.6, C-3, surface item (c)).** Retained: the frontend never judges approvability; the server's refusal is rendered with reason and paths; unresolved information is clearly presented; "Create in Proposales" authorizes a draft only. The control's treatment is a design/planning decision.
- **`thought` pill language tightened (§5.4, §14.1).** The UI presents application-returned rationale, assumptions, warnings, and result context; never private model reasoning. Live progress traces remain out of scope absent an explicit backend contract.
- **Owner cards made genuinely open (§5.2, §5.3, §5.6, §6, §10.3).** Slash palette and content search are "provisionally deferred pending" their cards; the close/discard guard's form is not stated; the transport boundary's ownership and exposure are fully unresolved and no section assumes the frontend owns it or that deployment protection is accepted.
- **Implementation prescriptions generalized (§9.4, §10.3, §10.4, §11, §14.3, F6, F7).** Exact file paths, adapter filenames, test layers and doubles, lint mechanisms, source-scan tactics, test-collection globs, and transport implementation steps are removed or restated as outcomes; §11 is now a list of verification outcomes.
- **No new product decision introduced.** Where a round-0 resolution was withdrawn, the ratified truth it rested on is kept and the remainder is routed to design, planning, or an owner card.

**Round 2 (2026-09-05, owner ratification).** Status `DRAFT` → `RATIFIED`.

- **Owner:** David (repository owner). **Date:** 2026-09-05.
- **Decisions taken:** the four cards of rounds 0–1, recorded as decision records in §15: (1) slash palette deferred from V1; (2) confirmation guard for closing or discarding a session with meaningful work, immediate close for an empty session, no undo or archive; (3) direct replacement limited to retained alternatives, broader discovery through agent re-search, no dedicated free-text human content-search UI, with the backend's phase-12 human-search capability left intact; (4) the frontend/application integration stream owns the thin validated browser-to-server boundary, backend services stay transport-independent and authoritative, application authentication is not an MVP prerequisite, live-credential deployments are protected at the platform level and live mutations are not exposed without that protection, and deployment protection never makes browser input trusted.
- **Propagation:** §4 (new deployment-protection constraint), §5.2, §5.3, §5.6, §6 must-ship and deferred, §10.2 phase-12 row, §10.3, §11, F1, C-5, §14.1 item 5, §14.3 item 5. Every "provisionally", "pending", "card n", and "fully unresolved" reference to these four matters was removed; the card section became §15 "Ratified owner decisions (0 open)".
- **Surface presented and approved:** §15.1 as it stood after round 1 (the outcome statement, the measurement ledger F1–F7 verbatim, the scope ladder, the consequential resolutions (a)–(k)) together with the four decisions above. The owner directed ratification on the condition that these four were the last blocking decisions and no new owner-level contradiction was found; the shaper's consistency review found none.
- **Consistency review recorded:** slash palette consistently deferred; close/discard consistently confirmation-for-work and immediate-for-empty; free-text search consistently deferred with agent re-search available; no statement removes or narrows a backend phase-12 capability; boundary ownership consistently the integration stream's; backend services consistently transport-independent; application authentication nowhere a V1 requirement; platform protection required for live credentials and mutations; protection never described as trusting client input; no transport implementation mechanism prescribed; C-4 and the visual-foundation corrections of round 1 intact; the document remains an intention.
- **Handoff:** the intention is the ratified root of the frontend trace chain. Next gate is mechanism inventory, then the frontend implementation planner. Post-ratification amendments follow the decision-card path; a material semantic change re-opens this gate.

**Round 3 (2026-09-06, owner amendment: frontend dependency foundation).** Status stays `RATIFIED`; no product semantics, scope-ladder surface, ledger objective, state boundary, or backend/domain contract changed, so the gate does not re-open.

- **Owner:** David (repository owner). **Decisions:** 5 (Lucide React as the production icon library) and 6 (Radix UI Primitives as the preferred headless interaction foundation), recorded in §15 with decision, rationale, consequences, and what stays deferred.
- **New §4.1** fixes the layered dependency foundation (Next.js/React, Tailwind, Radix, Lucide, Proposal Copilot components, Zustand when justified, Zod and backend schemas, Vitest/Testing Library/Playwright) and the boundaries that follow; it also lists what this amendment does **not** adopt.
- **Propagation:** §2.1 (installed-dependency facts), §2.2 (contract 15 §5 row: the primitive-library choice is now taken; the contracts README recording is a separate patch), §5.3 (tablist mechanics), §5.4 (pill symbols preserved; affordance controls may use icons), §5.5 (radio-group mechanics if typed choices arrive; the panel stays non-modal), §5.6 (ask-agent dialog/popover mechanics), §5.9 (controls use Lucide; glyphs stay for pill symbols; design 01 §1.11 partly adopted), §6 deferred list (not-adopted libraries), §8.1 (primitive-managed mechanics are disposable UI state), §11 (two verification outcomes), F6 (composites never assumed accessible), §14.3 item 3 (per-interaction mapping and package set remain planning decisions).
- **Superseded statements:** §5.9's "controls use a real icon set only if a recorded decision adopts one" and §14.3's "whether any composite widget justifies the recorded adoption of an accessible-primitive library". The library choices are decided; the per-interaction use is not.
- **Repository-level follow-up identified, not performed here:** the contracts README "Scaffold decisions record" and "Resolved decisions" rows reading "Component library: none decided" and contract 15 §5's "intentionally undecided" status need a documentation patch recording Radix UI Primitives (headless, per-widget packages) and Lucide, per contract 15 §5 and 13 §5. The root README "Tech stack" table gains the two entries when the first package lands.
- **Backend/domain boundary:** unchanged. No backend contract, service interface, view DTO, or integration schema references either library (§4.1, §11).

**Round 4 (2026-09-06, mechanism inventory round 1).** Status stays `RATIFIED`; four owner cards are open and are relayed in the round's handoff. No product semantics, scope-ladder surface, ledger objective (F1–F7), state boundary, owner decision, or backend/domain contract changed, so the gate does not re-open. Four owner cards are pending ratification; each names the section it would change if the owner rules against the contract as written.

- **New §12A** (`Frontend mechanism contracts`), twenty subsections plus a binding note, placed beside §12 and renumbering nothing. It defines the presentation-side mechanism for: session identity and the runtime record; turn origin attribution; the tab-status precedence order; unread and attention; tab order, reorder, close and focus; the meaningful-work guard's shape and failure direction; the closed derivation register; the presentation boundary with its fixture and seam-replacement rules; domain-result and pill-kind rendering; provenance, absence and approvability; the review and preview field sets; money rendering; clarification submission; inline edit and validation paths; approval submission, the pending guard and terminality; the `ErrorDto` and `failed` treatment maps; focus and announcement transitions; thread autoscroll; narrow-width resilience; and free-text and external-link rendering.
- **Ledger extended with F8–F27** in §12, appended below F1–F7. Existing IDs never moved; each new entry names its contract section and the defect family it guards, and is a trace target a phase criterion may cite.
- **Backend-owned mechanisms cited, never redefined:** §17A.1 (Path, `Sourced`, `SourcedOrAbsent`, `Money`), §17A.2 (Generation ID, terminality), §17A.3 (the caller-held state), §17A.4 (structural provenance and the source policies), §17A.5 (absence, omission, defaults), §17A.6 (item policies and approvability), §17A.7 (questions, answers, the skip), §17A.9 (human-set is exactly `source = human`), §17A.10 (the acknowledgment literal), §17A.12 (Applied Pricing and the money rule), §17A.13 (the error taxonomy and check order), §17A.16 (text bounds and Markdown), §17A.17 (conversation context). §12A defines only what consumes them.
- **Ambiguities resolved unilaterally and recorded** (each is an owner card or a technical resolution in the round handoff): the "Updated" flag has no V1 source and is not rendered (card 4); "Skip all" preserves explicitly typed answers and skips only the unanswered; the readiness count never collapses `unresolved` and `deferred_by_user`; `failed` is not a seventh tab status and is resolved by precedence rows 4–5; retry is a single `details.retryable` rule rather than a per-code judgement; a drag that ends without a drop keeps its last committed order, per the specification's current behaviour, and the alternative is reported as a design delta.
- **Design deltas reported, not implemented:** the "Updated"/human-flag vocabulary; `ready` versus `created` dot distinction; the autoscroll threshold; the abandoned-drag order; the narrow-width mechanism; "Skip all" semantics. Each stays owned by the design specifications (§14.2, design 10 §4); no specification was edited.
- **Not decided here, deliberately:** the approval control's enabled/disabled/warning treatment (C-3, §14.2); the per-interaction primitive mapping and package set (§14.3 item 3); the concrete form of the browser-to-server boundary (§14.3 item 5); phase sizing; every file, component, hook, store, adapter API, and transport signature.
- **Exit gate:** every mechanism ranked at silent-failure risk now carries a contract-grade definition with a testable invariant and, where the rule is a construction requirement, a named mutation. The implementation planner may begin on every mechanism whose contract is final; cards 1 and 2 gate the phase that implements the close/discard guard and the creation lifecycle.

**Round 5 (2026-09-06, owner resolution of mechanism-inventory cards).** Status stays `RATIFIED`: David confirmed all four recommendations from the round-1 inventory handoff, so no decision remains open and the inventory exit gate is passed without a scoped hold.

- **Decision 7:** a non-empty per-session composer draft, including whitespace-only text, is meaningful work; closing or discarding it requires confirmation. §8.1 and §12A.6 changed; F13 now names six inputs.
- **Decision 8:** close and discard are refused, not confirmed, while the approval/execution turn is creating a draft. §12A.6 and §12A.15 changed; F13 and F22 now name the refusal.
- **Decision 9:** title and narrative render as written in V1, with Markdown characters literal. §12A.20 already carried that resolution; it is now ratified as decision 9.
- **Decision 10:** the review pane marks structural provenance and never computes a "changed since" flag. §12A.10 already carried that resolution; it is now ratified as decision 10.
- **Inventory exit gate:** all twenty frontend presentation mechanisms are contract-grade, all owner cards are resolved, and `implementation-planner` may begin. The inventory handoff remains the historical record; it is not rewritten.

**Round 6 (2026-09-06, owner amendment: persistent agent shell + session-controlled Main Application Surface).** Status stays `RATIFIED`; this is an architectural shell clarification, not a scope expansion or a semantic change to any ratified product decision, so the gate does not re-open.

- **Owner:** David (repository owner). **Decision:** 11, recorded in §15.
- **Shell model clarified:** the persistent shell is Agent Surface + Main Application Surface (§1, §5.1). The Agent Surface remains structurally persistent; the right side is now explicitly the Main Application Surface, session-controlled, and Proposal Preparation is the only Main Application Surface implemented in V1. "Permanently split" is restated as persistent Agent Surface + Main Application Surface, not a permanently proposal-only pane.
- **Session-controlled context recorded:** a session owns its workflow/conversation context and the meaningful Main Application Surface working context needed to resume it; activating a session activates both (§2.4, §5.3, §8.3, §12A.1); switching restores both (§5.3, §11, F1).
- **Three categories fixed (new §8.6):** meaningful page-lifetime workspace context (may survive a switch), disposable UI mechanics (reset naturally, never snapshotted), authoritative domain/workflow truth (never client-owned). The prohibition on snapshotting arbitrary DOM/component state or every transient control is recorded in §8.6 and §12A.1. §8.1 no longer lists the active work surface or a selected review item as unconditionally disposable; whether they qualify as category A is planning's (§14.3 item 5a); the typed text of an in-progress inline edit stays disposable per §12A.14, unchanged. §8.5 gains the allowed/not-allowed distinction.
- **§12A consistency:** §12A.1's runtime record carries category-A context and its forbidden list is extended; §12A.6's exclusion wording no longer rests on §8.1's classification; §12A.2, §12A.5, §12A.7, and §12A.8 are unchanged, because origin attribution, tab order, the derivation register, and the presentation boundary already apply to the whole runtime record. No parallel state system is introduced.
- **Stale assumptions removed:** the §1 diagram's "Proposal surface" header, §5.1's "proposal surface right" and "`main` for the proposal", and the reading that session switching preserves only conversation/workflow data. Proposal-specific wording inside §5.6–§5.8 and F2 stays, because those sections describe the Proposal Preparation surface V1 renders.
- **No backend/domain ownership changed; no persistence added (§7, §8.3); V1 scope not expanded (§6).** The intention remains `RATIFIED` and ready for frontend implementation planning.

**Round 7 (2026-09-06, mechanism inventory round 2 — the shell amendment and the round-5 ratifications).** Status stays `RATIFIED`; **one owner card is open** and is relayed in the round's handoff. No product semantics, scope-ladder surface, ledger objective (F1–F7), state boundary, owner decision, or backend/domain contract changed, so the gate does not re-open. The card is an addition to owner decision 8's reach, not a defect in it; on silence the contract stands as written and planning proceeds.

- **Why the round existed.** Rounds 5 and 6 both landed after the round-1 inventory. Round 6 made F1 assert an observable — A → B → A restores A's meaningful Main Application Surface context with no reconstructed truth — that no mechanism contract defined, and §8.6 deliberately left the representation and the qualifying-interaction list to planning (§14.3 item 5a). "Meaningful" is an adjective, which charter rule 5 forbids shipping a mechanism on.
- **New §12A.21** (retained Main Application Surface context): the closed named entry set fixed in the naming registry before restoration is implemented; the four conjunctive qualification conditions; the exclude-on-doubt direction for residual undecided candidates, derived from §8.6's own word *explicitly*; the two admissible value classes (a closed presentation enumeration member, or a domain identity) and the closed never-admissible list; the write rule (only the deliberate user act), the read rule (only at render), the non-interaction with the turn-result path, and the default-on-unresolved rule; the seam-survival and keying rules; and the reconciliation that the Agent Surface's composer draft is governed by §8.1 and decision 7, not by §8.6.
- **New §12A.22** (restoration on activation): a first-match-wins four-row precedence over the session record deciding which Main Application Surface state is presented, with its six overlaps enumerated; a total three-row function for how each retained entry resolves; the rules that an entry never overrides a state, that stale context is never surfaced as a condition, that nothing is reconstructed, and that restoration is not navigation. It also names the Proposal Preparation **idle** state as the presented state for a session that has run no turn, and reports that no design specification defines it.
- **New §12A.23** (shell structural persistence and V1 surface containment): the single-complementary-region / single-`main` identity invariant across every session operation, stated so it cannot be satisfied by routing or a second surface; the session-controls-content-never-structure rule; and a closed forbidden list keeping decision 11's abstraction from becoming speculative infrastructure — no router or route, no surface registry or factory, no one-member surface-kind discriminant, no second surface, dashboard, list, history, or internal route.
- **Ledger extended with F28–F30**, appended below F27. Existing IDs never moved and no existing invariant's text changed. **F1 was not amended**: its restoration clause is now served by F28, F29 and F30, which is what makes it measurable.
- **Amended in place, each because the delta falsified a clause.** §12A.1 (the record's context clause now cites §12A.21 for qualification and resolution). §12A.6 (the close-guard predicate is separated from the `empty` tab status, which decision 7 made a different condition; input (6)'s lifetime and its behaviour while the clarification panel replaces the composer; the refusal's totality over every close and discard path, its evaluation before any list mutation, its required visibility, and the explicit statement that reload is outside it). §12A.7 (the register's closure sentence now admits the two stored presentation values and forbids either from reading the other; the counter sentence is scoped to counters). §12A.8 (retained context is inside the seam-replacement claim, with the keying rule that keeps it true). §12A.17 (a focus row for restoration, and the rule that restoration announces nothing of its own).
- **Totality re-checked and still total, unchanged:** §12A.2 (results never touch retained context, so its four resolution rows are unaffected and the active session id is still never read there), §12A.5 (every close row already runs after the §12A.6 guard, so a refusal short-circuits them all including the last-tab replacement), §12A.10, §12A.15, §12A.20.
- **Ambiguities resolved unilaterally and recorded:** the intention's category-A illustration wins over design 07 §4.3's "toggle state is disposable UI — losing it on session switch is acceptable", because state ownership is not the design specifications' authority (design 10 §1) and decision 11's own rationale names that scenario — reported as a design delta, no specification edited; stale retained context resolves silently to its default with no notice, the unread badge being the workspace's existing signal; restoration produces no announcement of its own; the Proposal Preparation idle state is the presented state for a session with no turn, and its visual treatment is a design gap.
- **Not decided here, deliberately:** which interactions qualify as category A and how the context is represented (§8.6, §14.3 item 5a); the shell's component hierarchy and names; the idle state's visual treatment (design); the approval control's treatment (C-3); the per-interaction primitive mapping (§14.3 item 3); the browser-to-server boundary's form (§14.3 item 5); phase sizing; every file, component, hook, store, adapter API, and transport signature.
- **Exit gate:** every mechanism the rounds-5/6 delta introduced or left as an adjective now carries a contract-grade definition with a testable invariant and named mutations. `implementation-planner` may proceed. The open card gates no phase; it would add one criterion to whichever phase implements the creation lifecycle.

**Round 8 (2026-09-06, owner resolution of the mechanism-inventory round-2 card).** Status stays `RATIFIED`: David confirmed the round-2 recommendation, so no owner decision remains open and the inventory exit gate is fully passed.

- **Decision 12:** while any session is creating a Proposales draft, browser-level departure requests the platform's standard confirmation; other unsent or meaningful work does not trigger it. §7 and §12A.6 now define the total all-sessions condition, browser limitation, and no-cancellation/no-recovery boundary; F13 gains the inactive-creating-session invariant and its named mutation.
- **Scope and ownership unchanged:** the warning is a presentation-side request, not persistence, a recovery path, a cancellation protocol, a transport mechanism, or a backend/schema contract. The browser owns its wording and availability; confirmation of departure still destroys the page-lifetime workspace.
- **Inventory exit gate:** all round-2 mechanisms are contract-grade, the only owner card is resolved, and `implementation-planner` may begin.
