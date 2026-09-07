# 05 — Interaction Pills

The agent's structured output vocabulary inside the thread. This is the highest-value surface in the prototype.

---

## 1. Design truth

An agent turn has prose *and* structure. Rather than dumping reasoning, questions, diffs, and links into the prose, each is a **collapsed pill** — one line, one glyph, one label, one meta value — that the user can expand in place.

This does three things:

1. **The thread stays scannable.** Ten turns of work read as ten short paragraphs with a handful of pills, not as a wall of text.
2. **Detail is available but never imposed.** Reasoning is collapsed by default; the user opts in.
3. **Different kinds of agent output are visually distinguishable at a glance** by glyph and glyph-tint alone.

### The five kinds are presentation vocabulary

> **These pill kinds are PRESENTATION VOCABULARY, not production server response schema. Do not infer backend contracts from them.**

`thought` / `ask` / `diff` / `link` / `action` describe how something *looks and behaves in the thread*. They are not event types, not message types, and not an API enum. The mapping from real agent output to pill kind is a presentation decision made at the view boundary.

---

## 2. Presentation structure

```
Assistant message
└── Pill stack              (column, gap 6px, align-items: stretch)
    └── Pill
        ├── Trigger row     (34px, always visible)
        │   ├── Icon disc   (24px)
        │   ├── Label       (ellipsized)
        │   ├── Meta        (mono, optional)
        │   └── Affordance  (▸ ▾ ↗ →)
        └── Payload         (expanded only, indented rail)
```

Payload shapes observed: **steps** (reasoning), **diffs** (field changes), **items** (question set). `link` and `action` have no payload — they act.

---

## 3. Visual specification

### 3.1 Trigger row (shared by all kinds)

| Property | Value |
|---|---|
| Element | `<button>`, `width: 100%` |
| Height | `34px`, `box-sizing: border-box` |
| Background | `#141517` |
| Border | `1px solid #26282c` |
| Radius | `99px` (full pill) |
| Padding | `0 12px 0 5px` — the 5px left accommodates the 24px disc |
| Layout | `display:flex; align-items:center; gap:9px; overflow:hidden` |
| Ink | `#dcdde0` |
| Hover | border `#3b82f6`, background `#17181a` |

**One shell, one height, one radius for all five kinds.** Only the glyph and its disc tint vary. This is the vocabulary's key discipline — do not give kinds different backgrounds or borders.

### 3.2 Icon disc

`24×24`, `flex: 0 0 24px`, `border-radius: 50%`, centered, glyph at **11px / 700**.

| Kind | Glyph | Disc background | Glyph color |
|---|---|---|---|
| thought | `✳` | `#16202e` | `#7aa9ff` |
| diff | `±` | `#12261a` | `#7ddba0` |
| ask | `?` | `#241d10` | `#e0a94a` |
| link | `↗` | `#1f2023` | `#a1a3a9` |
| action | `▸` | `#1b2740` | `#7aa9ff` |

Confirmed against the prototype source — the glyph set in the brief is correct.

Note `thought` and `action` share the same glyph color and near-identical disc tints (`#16202e` vs `#1b2740`); they are distinguished by glyph only. See §8.

### 3.3 Label, meta, affordance

- **Label:** `flex: 1; min-width: 0`, left-aligned, 12.5px/600, `nowrap`, ellipsized. Observed: "Reasoning", "3 fields changed", "1 field changed", a question-set title, a link target name, an action name.
- **Meta:** `flex: 0 0 auto`, IBM Plex Mono 10px, `#6b6d73`, `nowrap`. Observed: "4 steps", "2 open", "3 answered", "Proposales", or empty.
- **Affordance:** `flex: 0 0 auto`, 9px, `#6b6d73`. `▸` collapsed → `▾` expanded for expandable kinds; `↗` for link; `→` for action.

The meta slot is where the pill earns its scannability: "Reasoning · 4 steps" and "Questions · 2 open" tell the user whether expanding is worth it.

### 3.4 Payload rail (expandable kinds)

Shared container: `margin: 8px 0 2px 17px`, `padding-left: 14px`, `border-left: 1px solid #26282c`, `display:flex; flex-direction:column`.

The 17px left margin aligns the rail with the center of the 24px disc (5px padding + 12px). That alignment is intentional — the payload hangs from the icon.

Gaps by payload type: steps `7px`, diffs `6px`, items `12px`.

**Steps payload** (thought): each row is `display:flex; align-items:center; gap:9px`, 12.5px; a mono 11px mark in a fixed `12px` column, then the step label. Mark and color vary by step state (done / current / pending) — approximate, as the prototype drives them from fake progress.

**Diffs payload** (diff): each row is `display:flex; gap:8px; flex-wrap:wrap; align-items:baseline`, 12.5px —
field `#7c7e84` · from `#7f6060` `line-through` · `→` `#5b5d63` · to `#7ddba0` weight 600.
Wrapping matters: at 320px pane width a diff row must break rather than overflow.

**Items payload** (ask): each question block is a `7px`-gap column containing —
- question text: 13px/600, `text-wrap: pretty`, color varies by answered state (approximate)
- field name: 11.5px, `#7c7e84`
- if answered: a baseline row, `gap: 8px`, 13px/600, with a mark then the answer (color varies — green when confirmed)
- if active: 12px/600 `#7aa9ff` row, `↓` + "Answer below" — pointing at the clarification panel
- if waiting: a `10px`-gap action row — **"Answer this"** (`#17181a` / border `#2f3135` / `#dcdde0` / 12px 600 / padding `7px 11px` / radius `8px`; hover border `#3b82f6`, ink `#fff`) and **"Ask client instead"** (borderless, `#6b6d73`, 12px/600; hover `#c9cbd1`)

The ask pill is the bridge between thread and clarification panel: it holds the *record* of what was asked and answered, while the panel holds the *act* of answering.

---

## 4. Interaction behavior

### 4.1 Expand / collapse
- The entire trigger row is one button; clicking it toggles the payload.
- Toggle is per-pill and independent.
- **Default states:** `thought` collapsed, `diff` collapsed, `ask` open when it has open questions (approximate — driven by an "open by default" flag in the prototype) and collapsed once resolved.
- Affordance flips `▸` ↔ `▾`.
- Expansion grows the pill downward. It must not scroll the thread (see `03` §3.3).
- Expansion state is **disposable** — losing it on session switch is acceptable (see `04` §1).

### 4.2 Link and action
- `link` navigates. `action` performs. Neither expands.
- Both use the same 34px shell, so the user cannot tell from the shell whether a pill expands or acts — only from the affordance glyph (`↗` / `→` vs `▸`). That is subtle; see §8.

### 4.3 Hover / focus
- Hover: border `#3b82f6`, background `#17181a`. Applies to the whole pill.
- **Focus: undefined.** The pill is a real `<button>` so it is tabbable, but it has no focus style at all. Production must add a `:focus-visible` ring.
- Nested payload buttons ("Answer this", "Ask client instead") are separately tabbable — tab order must run trigger → payload contents, which the DOM order already gives.

### 4.4 Overflow
- Label ellipsizes; meta and affordance never shrink. At 320px pane width a long label collapses to very little — the `title` attribute carries the full text today, which is not sufficient (see §5).

---

## 5. Accessibility requirements

- Expandable pills: `aria-expanded` on the trigger, `aria-controls` pointing at the payload, and the payload with an id. None of this exists today.
- **Link vs. action vs. disclosure must be distinguishable non-visually.** A `link` pill should be an `<a>` (or a button with an explicit "Opens …" name); an `action` pill's name should state what it does; a disclosure pill's `aria-expanded` marks it as such.
- Accessible names must not rely on the ellipsized label or the `title` attribute. Give each pill a full name including its kind and meta: "Reasoning, 4 steps, collapsed", "Questions, 2 open".
- The glyph discs must be `aria-hidden` — `✳`, `±`, `?`, `↗`, `▸` are decorative and screen readers pronounce them unhelpfully.
- **Kind is conveyed by glyph + tint only.** Add the kind to the accessible name.
- Diff payload: `line-through` is not announced. Each diff row needs explicit phrasing — "Beige upholstery, was Not priced, now 4,200 SEK".
- Expanding a pill should announce the payload politely, or move focus into it — decide one and be consistent. Preference: announce, don't move focus.
- 34px pill height is acceptable for a desktop pointer but below the 44px guideline; the nested 12px-text buttons inside payloads are small — give them ≥ 32px effective height.
- Contrast: mono meta at `#6b6d73` on `#141517` is ~3.4:1 and **fails**. Step marks and the affordance glyph share that color. Lighten per `01` §5.
- `#7f6060` strike-through text on `#141517` is ~3.5:1 and **fails** — but it is intentionally de-emphasized. Either lighten it or accept it as decorative *given* the accessible name carries the old value in text.

---

## 6. States

| Scope | States |
|---|---|
| Pill (all) | idle, hover, focus (to define), collapsed, expanded |
| thought | collapsed (default), expanded |
| diff | collapsed (default), expanded; 1 vs. N field label variants |
| ask | open-with-questions (default open), partially answered, fully answered/collapsed |
| link | idle, hover — no expanded state |
| action | idle, hover — no expanded state |
| Question block (in ask payload) | unanswered, active ("Answer below"), waiting ("Answer this" / "Ask client instead"), answered |
| Step row (in thought payload) | done, current, pending (approximate) |

Missing and worth defining: a **disabled** pill (an action no longer valid), an **error** pill (an action that failed), and a **loading** action (mid-execution).

---

## Prototype-only — do not port

- The `KIND` map merged with per-pill overrides via spread as the *construction* mechanism. The token table is design truth; building pills by object-spread in a render function is not.
- **Pill assembly from a fake message object.** The prototype derives pills from ad-hoc fields on a mock message (`m.steps`, `m.cardTitle`, `m.diffs`, `m.links`, `m.actions`). **These are not a domain contract.** Real agent output must be mapped to pill kinds at the presentation boundary.
- `this.props.showDiffs` gating whether diff pills render at all — a demo toggle.
- `folds` as a keyed map of string ids (`"steps" + messageIndex`, `"diffs" + messageIndex`, `"card" + messageIndex`). **Message-index-based keys are prototype-only** and break the moment the thread is not a stable array.
- Hardcoded pill labels tied to mock content: "Reasoning", the sample step strings, "Ask client instead" wired to fake skip logic.
- Diff content generated by `applyOne()` / regex text matching — e.g. `{field: "Chair restoration", from: "assumed", to: "confirmed, incl. upholstery"}`. **Diffs must come from the server**, never be computed in the client from strings.
- Link pills whose targets are fake routes (`analytics`) or fake views (`success`), and `prop_8f2ac91` as a link label.
- Action pills whose `run` is a local fake handler.
- `openCount` / `answeredCount` computed from prototype answer maps.

---

## Open design questions

1. **`thought` and `action` are nearly indistinguishable** — same glyph color (`#7aa9ff`), disc tints 5 units apart. Should `action` get its own hue, or is glyph-only differentiation enough?
2. **Expandable vs. actionable pills share the same shell.** Should acting pills be visually differentiated (subtler border, no fill, a trailing arrow set apart) so the user knows a click will navigate rather than reveal?
3. **What are the default expansion states, precisely?** "Ask open when unresolved, everything else collapsed" is inferred from prototype behavior, not stated.
4. Should pill expansion state persist per session for the page lifetime, or always reset? Currently disposable, which is acceptable — but a user re-reading a long reasoning trace may disagree.
5. Is there a maximum number of pills per turn before they should be grouped or summarized?
6. Do we need `error` and `loading` pill states in V1? Actions that can fail imply yes.
7. Should the step-mark column show real progress (done/current/pending) once agent activity is server-reported, or is it a static list?
