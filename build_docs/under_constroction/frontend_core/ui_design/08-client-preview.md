# 08 — Client Preview

The light-surface document rendering in the right pane: an approximation of what the client would receive.

---

## 1. Design truth

The preview answers one question the fields view cannot: **does this read like something I would send?**

The fields view is a work surface — labels, flags, amber warnings, provenance. The preview strips all of that away and shows the draft as prose and price: hero, intro, line items, total. The user checks tone and completeness, not data.

### Non-authoritative by design

> **The preview is not an embedded Proposales editor. It must not assume undocumented iframe or API behavior.**

This is **our own approximation**. It is not the real template, not the real theme, and not guaranteed to match what Proposales renders. It exists to catch obvious problems before approval — a missing intro, a line item that reads badly, a total that looks wrong.

Two consequences for production:

1. **Never present the preview as fidelity.** No "this is exactly what your client sees". The surface must be honest about being an approximation — currently it carries no such disclosure (see §8).
2. **Do not build it by embedding Proposales.** No iframe of the portal, no undocumented render endpoint, no scraping the published proposal page. It renders from the same draft data the fields view uses.

The stark inversion — pure white inside a dark app — is the honest signal. The user is looking at a different kind of object.

---

## 2. Presentation structure

```
Client Preview
├── Document frame          (white, radius 14, overflow hidden)
│   ├── Hero                (170px, dark gradient)
│   │   ├── Document title
│   │   └── Validity pill
│   └── Body                (max-width 600px, centered)
│       ├── "Intro" heading + rule
│       ├── Intro prose     (centered)
│       ├── Line items
│       │   └── Item row ×N  (name + detail | price)
│       └── Total block     (heading + rule + amount)
```

The preview replaces the fields and line-items cards inside the same content column (`max-width: 840px`, `padding: 0 28px 40px`). It is a sibling view, not an overlay.

---

## 3. Visual specification

### 3.1 Document frame
- Background `#fff`
- `border-radius: 14px`, `overflow: hidden` — matches the dark cards' radius, so the switch is a change of *fill*, not of shape
- Base ink `#111214`
- **No border and no shadow.** White against `#0b0b0c` needs neither
- Width: fills the content column, capped by the column's `max-width: 840px`

### 3.2 Hero
- `height: 170px` (fixed)
- `background: linear-gradient(160deg, #1d3b4a, #0f2733)` — a deep desaturated teal, 160° so the light edge is top-left
- `display:flex; align-items:center; justify-content:center; padding: 24px`
- Title: `#fff`, 26px/800, `letter-spacing: -0.02em`, centered, `text-wrap: pretty`
- Validity pill: `display: inline-block`, `margin-top: 12px`, background `#3b82f6`, ink `#fff`, 12px/700, padding `6px 12px`, radius `99px`. Reads "Valid until &lt;date&gt;"

The gradient is the only place in the design where a gradient appears. It stands in for a template header image that the real document would carry — the fixed 170px height is a placeholder for that band.

**Fixed height risk:** a long title at 26px in a narrow main pane will overflow 170px. Production must let the hero grow (`min-height: 170px`).

### 3.3 Body
- `padding: 34px 32px`, `max-width: 600px`, `margin: 0 auto`

**600px is the reading measure**, independent of the frame width. On a wide screen the white frame is 840px but the text column stays 600px and centers. Keep that separation.

### 3.4 Section headings
- Heading: 19px/800, centered
- Rule beneath: `32px × 2px`, `#e4e4e7`, `margin: 0 auto 18px` (intro) / `12px auto 16px` (total)

A short centered rule under a centered heading — a proposal-document convention, and the clearest signal that this surface follows document typography, not app typography.

### 3.5 Intro prose
14.5px, line-height 1.65, `#3f4147`, **centered**, `text-wrap: pretty`.

Centered body prose is unusual and only works because the intro is short. If real intros run long, this should become left-aligned — see §8.

### 3.6 Line items
- Container `margin-top: 28px`, column
- Row: `display:flex; gap:14px; align-items:baseline`, `padding: 13px 0`, `border-bottom: 1px solid #ececef`
- Left (`flex: 1; min-width: 0`): name 14.5px/700; detail 12.5px, `#6b6d73`, `margin-top: 3px`
- Right: price 14.5px/700, `white-space: nowrap`

Note what is absent versus the fields view: **no quantity, no flags, no amber.** The preview shows the client-facing subset. Unpriced lines will render with whatever the draft holds — see §8.

### 3.7 Total block
- `text-align: center; margin-top: 32px`
- "Total" 19px/800; rule; amount **36px/800**, `letter-spacing: -0.02em`

36px is the largest type in the entire design. Correct for a proposal document — the number is the point.

### 3.8 Scrolling
The preview has no scroll region of its own; it grows and the main pane scrolls. Correct — a document should not be a scroll-within-a-scroll.

### 3.9 View tabs
Two segments in the review header, "Fields" and "Client preview" (see `07` §3.1). Toggle state is disposable UI.

---

## 4. Interaction behavior

The preview is **read-only**. No clicks, no hovers, no edit affordances, no ask-agent triggers. To change anything the user switches back to Fields or talks to the agent.

That is the right call: the preview is for judgment, not manipulation. Two states, one job each.

Not present and worth considering (§8): print/PDF, copy-to-clipboard, or an "open in Proposales" jump once created.

---

## 5. Accessibility requirements

- **The light surface must not break the dark-app assumption.** Ensure global focus-ring, selection, and scrollbar colors remain visible against white. A `#7aa9ff` focus ring on `#fff` is ~2.4:1 and would be nearly invisible — scope a dark focus ring inside the preview.
- Contrast on the light surface:
  - `#111214` on `#fff` — ~19:1, fine
  - `#3f4147` on `#fff` — ~10:1, fine
  - `#6b6d73` on `#fff` — ~5.2:1, passes
  - `#fff` on the hero gradient — ~11:1 at the light end, better at the dark end, fine
  - `#fff` on `#3b82f6` (validity pill) — ~3.4:1, **fails 4.5:1** at 12px. Darken the pill or use dark ink
- Headings must be real heading elements in a sensible order (the document title as `h2` under the page's `h1`, "Intro" and "Total" as `h3`).
- The centered short rules are decorative — do not use `<hr>`, or mark them `aria-hidden`.
- Line items need table or list semantics; the total must be associated with them.
- **The preview needs a programmatic label stating it is an approximation** — e.g. a region labelled "Client preview (approximate)". Also the visible disclosure discussed in §8.
- Switching views should announce which view is now shown.
- Centered prose is harder for users with dyslexia and for screen-magnifier users tracking lines. If intros can be long, left-align.
- The 170px fixed hero must not clip text at any zoom level — required for 200% zoom conformance.
- The white surface will be jarring in a dark environment. Consider respecting `prefers-color-scheme` for a "paper" variant, or offering a dimmed preview. Not a V1 blocker.

---

## 6. States

| State | Presentation |
|---|---|
| Preview shown | white document, toggle segment selected |
| Preview hidden | fields view shown instead |
| With intro | "Intro" heading, rule, centered prose |
| Without intro | **undefined — production must define.** Omit the section, or show a placeholder? |
| With priced items | name / detail / price rows |
| With unpriced items | **undefined.** Currently renders the raw draft value ("Not priced") into a client-facing document. Must be handled — see §8 |
| Total | always shown; renders whatever the draft's total is |
| Empty draft | **undefined.** The preview is only reachable from a draft, but a near-empty draft has no defined rendering |
| Loading | none needed — renders from data already present |

---

## Prototype-only — do not port

- All **document content fixtures**: the demo title, the intro paragraph ("Following our conversation, here is our proposal for restoring your walnut dining set ahead of the November opening."), the validity date, and the three seeded line items.
- **`docItems` derived from the mock draft's items array.** The preview must render from real draft data, and the *mapping* from draft to client-facing document is a presentation decision — not a domain shape lifted from the prototype.
- The **total shared with the fields view**, computed by `parseFloat` on formatted price strings (documented in `07`). **The preview must never compute money.** It displays a server-provided total.
- `docValid` as a client-formatted date string.
- The hero gradient standing in for a real template header image — the *placeholder* is fine, but do not treat `linear-gradient(160deg,#1d3b4a,#0f2733)` as the client's brand.
- The 52×52 gradient thumbnail in the success card (see `09`) reusing the same gradient as a stand-in proposal thumbnail.
- `tab: "fields" | "doc"` as a key inside the giant session-snapshot state object.
- Rendering `"Not priced"` — a work-surface string — into a client-facing document.

---

## Open design questions

1. **Should the preview visibly disclose that it is an approximation?** Design view: yes — a small caption above or below the frame ("Approximate preview. Final layout, imagery and branding come from your Proposales template."). Currently nothing says so, and a white document in a review screen strongly implies fidelity. This is the most important open question on this surface.
2. **How do unpriced or missing items render?** Showing "Not priced" in a client-facing document is wrong. Options: omit the line, show "Price on request", or block the preview until priced. Needs a decision.
3. **Centered intro prose** — keep for short intros, or left-align for robustness? Left-aligning is safer; centering is more document-like.
4. **Fixed 170px hero** — should it grow with the title, and should it eventually hold the real template image?
5. **Should the preview offer print / PDF / copy?** Users will want to send a version of this before the draft is created.
6. Is 600px the right measure, or should it track the real template's column width once known?
7. Should the preview show anything the fields view flags — a subtle marker on assumed lines — or stay completely clean? (Recommendation: stay clean; that is its value.)
8. Once a draft exists in Proposales, should this view be replaced by a link to the real thing rather than an approximation?
