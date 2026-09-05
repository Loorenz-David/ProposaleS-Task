# 10 — Design Integration Guide

How the local implementation agent should consume this specification set.

Read this document first.

---

## 1. Authority boundary

Three sources of truth govern the production frontend. They do not overlap, and none of them may be substituted for another.

### Claude Design prototype and these specs — **visual and interaction authority**

Authoritative for:
- visual language: color, type, spacing, radii, shadows, motion
- layout and visual hierarchy
- interaction behavior: hover, focus, expand/collapse, drag, overflow, keyboard intent
- state vocabulary: what states exist and how each looks
- accessibility intent and the corrections these specs identify
- product-discovery evidence: what was tried, what was decided, what was discarded

**Not** authoritative for: component architecture, state management, data shapes, data flow, persistence, routing, or anything the prototype's code happens to do to make a demo run.

### Production architecture contracts — **engineering authority**

Authoritative for:
- component boundaries and composition
- feature ownership
- state ownership and where each piece of state lives
- client/server boundaries
- persistence rules
- routing and navigation structure
- performance and bundling

Where a design spec appears to imply an architecture, the architecture contract wins. These specs use the term "presentation structure" precisely to avoid that collision — those diagrams are visual decomposition, not component trees.

### Production domain and backend contracts — **truth authority**

Authoritative for:
- commercial truth: prices, quantities, currencies, totals, tax
- proposal workflow truth: what states a proposal can be in and what transitions exist
- provenance truth: what was assumed, inferred, confirmed, or human-edited
- clarification truth: which questions exist, their types, options, ordering, and what an answer does
- approval truth: what creating a draft means and what it guarantees
- execution truth: what the agent actually did
- pricing truth: all arithmetic, all formatting of money

Where a design spec shows a value, a label, a question, or a total, that content came from a demo fixture. **The visual treatment is authoritative. The content is not.**

### The invariant

> **Never promote a prototype convenience object or mock data shape into an authoritative production domain contract.**

The prototype is full of objects that look like contracts and are not: `qdefs`, `baseDraft()`, the pill message fields (`m.steps`, `m.diffs`, `m.cardTitle`, `m.links`, `m.actions`), `tabState`'s `{status, note, unread}`, the `field()` helper's return value, `STATUS` as an enum, `SESSION_KEYS`. Every one of these was shaped by what was convenient to render in a single-file demo.

If you find yourself typing a TypeScript interface that mirrors one of these, stop. Either the shape belongs to the domain contract (get it from there) or it belongs to a presentation view-model you are defining deliberately (see §3).

---

## 2. How to read a spec document

Every document (`01`–`09`) has the same sections:

| Section | How to use it |
|---|---|
| **Design truth** | The intent. If an implementation constraint forces a change, this is what must survive. Read it before the measurements. |
| **Presentation structure** | Visual decomposition. A reading aid, not a component tree. |
| **Interaction behavior** | Behavioral requirements. Implement these. |
| **Visual specification** | Exact values from the prototype. Anything inferred is labelled **approximate** — those need a judgment call or a question. |
| **Accessibility requirements** | Requirements, not suggestions. Many are *corrections* — the prototype does not do them, and production must. |
| **States** | The full state matrix per surface. States marked "to add" or "to define" do not exist yet. |
| **Prototype-only — do not port** | A blocklist. If your implementation contains something named here, it is wrong. |
| **Open design questions** | Unresolved visual ambiguity. Do not silently pick an answer — surface these. |

### Reading order

1. **`10`** (this document) — authority boundary
2. **`01` Visual system** — everything else depends on it
3. **`02` Workspace shell** — the frame
4. **`03` Agent surface** and **`04` Session tabs** — the left pane
5. **`05` Interaction pills** and **`06` Clarification panel** — the agent's structured output and input
6. **`07` Proposal review**, **`08` Client preview**, **`09` Creating/created** — the right pane

`05` and `06` are the highest-value surfaces. `01` is the highest-leverage.

---

## 3. Expected implementation flow

```
design spec
  → production presentation components
    → temporary presentation VM / adapters where needed
      → later, real domain & server contracts
        → the SAME presentation components
```

**Step 1 — Presentation components.** Build the surfaces from the specs, styled per `01`. They take props and render. They contain no domain knowledge: a pill does not know what a diff means, the clarification panel does not know what a question is about, the review surface does not know how a total is calculated.

**Step 2 — Presentation view models.** Where real contracts do not exist yet, define a **view model** as an explicit, deliberate boundary: the shape the presentation layer needs, named and typed as presentation, owned by the presentation layer.

> **View Models are presentation boundaries, not merely mock data.**

This distinction is the whole point of the step. A view model is not "the mock data, but typed". It is a *contract you author on purpose*, stating what the view needs in order to render — independent of what any server currently returns. When the real contract arrives you write an adapter into the view model. The presentation components never change.

Signs you have a view model: it is named for what the view needs (`PillViewModel`, `QuestionViewModel`, `ReviewFieldViewModel`); its fields are presentation concerns; it is defined in the presentation layer; a real domain type would map *into* it.

Signs you have promoted mock data instead: field names match the prototype's demo object; it contains fields the view does not use; it mixes display strings with raw values; it lives in a `types` folder shared with domain code; it feels like it describes the *business*.

**Step 3 — Adapters.** Thin, explicitly temporary, one per boundary, marked as adapter-era code. Their whole job is to be deleted.

**Step 4 — Real contracts.** Replace the adapter's input with the real domain/server contract. **The presentation components must not need to change.** If they do, the view-model boundary was drawn in the wrong place — fix the boundary, not the components.

### Do not

- Do not port the prototype's state architecture. `SESSION_KEYS`, `BLANK_SNAP`, `snapshot`/`loadSnap`/`sset`, and the single giant `this.state` are named as prototype-only in every relevant document.
- Do not implement agent intelligence in the client. Every regex in the prototype that appears to understand text is a demo stub.
- Do not compute money. Ever. `07` documents the exact violation to avoid.
- Do not treat the demo's Swedish furniture-restoration content as domain shape.
- Do not build the discarded hover navigation rail (`02`) or the session-history persistence panel (`03`, `04`) — session history is **not V1 behavior**.

---

## 4. What to do with the "Open design questions"

Each document ends with unresolved visual ambiguity. These are genuine — a designer would need to answer them, and picking silently will produce a design that is subtly wrong and hard to correct later.

- If a question **blocks** the surface you are building, raise it before implementing.
- If it does not block, implement the prototype's current behavior, leave a marker, and report it.
- Do not resolve a design question by choosing whatever is easiest to build.

Highest-priority unresolved questions across the set:

1. **The creation error state does not exist** (`09`). Creation always succeeds in the prototype. Production cannot ship without an error path.
2. **The client preview does not disclose that it is approximate** (`08`). A white document in a review screen implies fidelity it does not have.
3. **Unpriced items render "Not priced" into a client-facing document** (`08`). Wrong as designed.
4. **"Updated" does not distinguish human edits from agent revisions** (`07`), which conflicts with the surface's own rule that human edits are human actions.
5. **No confirmation or undo on destructive actions** — closing a tab with an unpushed draft (`04`), Discard (`07`).
6. **"Push anyway" wording** (`07`) — internal-sounding, and "push" appears nowhere else in the user-facing vocabulary.
7. **Does the slash palette ship in V1, and with what command set?** (`03`)
8. **What are the header mark and agent name for**, now that the rail is discarded? (`03`)

---

## 5. Accessibility is not optional carryover

The prototype is a visual and interaction study. It is **not accessible**, and the gaps are systematic, not incidental:

- **No focus styling anywhere.** Not one `:focus-visible` rule in the entire file.
- **No landmarks, no roles.** No `main`, no `aside`, no tablist, no separator, no dialog.
- **Divs with onClick** carrying primary interactions (inline field editing, list rows).
- **Color-only state** — the session tab dot carries six meanings by hue alone.
- **Tooltips used as labels.** `title` attributes are not accessible names.
- **No keyboard model** for the tab strip, the clarification panel, the slash palette, or inline editing.
- **No focus management** on the ask popover or the creating/created transitions.
- **Several failing contrast pairs**, listed with measured ratios in `01` §5.
- **No `prefers-reduced-motion` handling** for three animations.

Each document's accessibility section lists what that surface needs. Treat those as part of the design, not as a follow-up pass. Where an accessibility correction changes a visual value (lightening muted text, darkening the primary button, enlarging hit areas), **the correction wins over the prototype value** — the specs say so explicitly.

---

## 6. Future design iteration

After the initial production port, **Claude Design is no longer the production source code.** The production components are.

The ongoing flow is:

```
design experiment in Claude Design
  → update the affected Markdown spec
    → identify the design delta
      → local implementation agent updates the production component
        → verify against architecture & domain contracts
```

Four rules:

1. **The spec is the interface between design and implementation.** A change that is not written into a spec document is not a design change.
2. **Deltas, not rewrites.** A design change is a diff against a spec section, and it should map to a small number of production components.
3. **Verify against the contracts.** A design change that requires new domain data, changes commercial truth, or crosses a client/server boundary is not a design change alone — it needs the corresponding contract change first.
4. **Do not re-import or re-port the prototype after each design change.** The prototype will keep drifting — it will keep its fake agents, its mock totals, and its demo content, because that is what makes it a useful place to experiment. Re-porting it would re-import everything these documents exist to exclude.

---

## 7. Prototype-only — do not port

Consolidated blocklist. Details are in each document.

**Architecture**
- The single giant `this.state` (~30 keys spanning thread, draft, answers, UI flags, and pane width)
- `SESSION_KEYS` / `BLANK_SNAP` / `seedSnap` / `loadSnap` / `sset` — snapshot-based session switching
- `archive` as a client-held session store
- `sessionSeq` as a module-level mutable id counter
- `folds` keyed by `"steps" + messageIndex` — message-index-based UI keys
- `timers` array + `this.later()` as the scheduling mechanism
- `document.getElementById` / `querySelector` for focus and scroll (`focusInput`, `revealActiveTab`)
- `window.innerWidth` read during render

**Fake intelligence**
- `extract()`, `command()`, `apply()`, `applyOne()`, `matchPalette()`
- The `looksLikeNotes = words > 18` heuristic
- Every content regex: `/upholster|included|12[,.]?000|fabric/`, `/pickup|delivery|transport/`, `/armchair/`, `/not priced/i`, `/^included/i`, `/^priced separately/i`
- `normalize()` and `prettyDate()` with hardcoded English month names
- Client-side insertion of follow-up questions into the queue

**Fake commercial logic**
- `baseDraft()` and every seeded line item
- `parseFloat(String(price).replace(/[^0-9.]/g,''))` summing — **money arithmetic on display strings**
- All hardcoded amounts: 12,000 / 1,000 / 6,500 / 4,500 / 8,000 / 3,600 / 4,200 / 5,400 / 1,800 / 350 SEK, €100
- `changed` as a client-held provenance map
- Flags derived from string inspection

**Fake data and content**
- `SAMPLE` demo notes, `STEPS`
- `RECENTS`, `PAST_SESSIONS`, `BG_SESSION`
- `DESTS` — fake routes (`/proposals`, `/analytics`, `/library`, `/settings`)
- The **fake analytics** rows (38 sent, 17 accepted, 45% win rate, 2d 4h median)
- The **fake product library** rows
- The **fake settings** rows (workspace "Loorenz", "Key ending 9f21")
- The **fake dashboard stats** strip on the list view
- `qdefs` / `qOrder` — hardcoded demo questions. **Explicitly not a domain schema.**
- `prop_8f2ac91`, `prop_71d0c42`, `prop_6ba33e0`, `prop_archived`
- `proposalId: "prop_8f2ac91 · created via API"`

**Fake progress and timing**
- Every `this.later` delay: 200 / 600 / 800 / 1600 / 2400 / 8000 / 16000 ms
- The three-step creation sequence ("Creating proposal record" → "Attaching products & services" → "Applying template and language")
- The background-session `bump()` chain
- `thinking` / `thinkingLabel` set locally by fake handlers

**Discarded product decisions**
- The **hover navigation rail** (14px edge hot-zones, 64px black rail, pin toggle, `panelInset`)
- The **session history panel** and all persistence — **not V1 behavior**
- `this.props.showDiffs` as a demo toggle

**Convenience objects that must not become contracts**
- `m.steps` / `m.diffs` / `m.cardTitle` / `m.links` / `m.actions` / `m.chips` / `m.scope`
- `tabState`'s `{status, note, unread}`
- `field()`'s return object
- `STATUS` as a runtime enum (its labels and colors *are* design truth)
- `qdefs`' `{field, kind, question, options, note, unit, skipLabel}`

---

## 8. Readiness

These specs are sufficient to begin the production frontend port. Two caveats:

1. **The creation error state (`09` §4.3) is designed only in outline.** Its values are marked approximate and its copy is placeholder. Build the happy path first; get the error state resolved before that flow ships.
2. **The eight open questions in §4 should be triaged before the surfaces they affect are built.** None of them blocks starting — `01`, `02`, and `04` are unblocked entirely.

Everything else needed to build — measurements, colors, type, states, interaction behavior, accessibility requirements, and an explicit exclusion list — is in the documents.
