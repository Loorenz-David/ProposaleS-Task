# 07 — Proposal Review

The right-pane review surface: the draft's fields, line items, totals, and the approval action.

---

## 1. Design truth

This is where the user takes responsibility for the draft. Everything here is built for one act: **read what the agent produced, correct it, and decide whether to approve it.**

Four rules govern the surface, and they are non-negotiable:

> **1. The frontend presentation must not imply it is the authoritative calculator.**
> Totals, subtotals, and derived figures are displayed, never computed here.

> **2. Formatted money strings are visual output only.**
> "12,000 SEK" is a rendering of a server-owned amount. The frontend never parses a formatted string back into a number.

> **3. Inline edits are human actions, not fake inferred state.**
> When the user edits a field, that is a recorded human decision with human provenance — distinct from an agent assumption.

> **4. "Create in Proposales" is an approval boundary that creates a DRAFT. It does not send the proposal.**
> Every affordance and every word on this surface must reinforce that.

The visual grammar supports those rules: informational fields are quiet, editable values invite a click, agent assumptions are flagged in amber, human corrections are flagged in green, and the approval button is the only saturated element on the page.

---

## 2. Presentation structure

```
Review Surface
├── Review Header           (shared with list/success — see 09)
│   ├── Title · client
│   ├── View toggle          Fields | Client preview
│   ├── Discard
│   └── Create in Proposales
├── Readiness line
├── Fields card
│   └── Field row ×N
│       ├── Label
│       ├── Value (read) / Input (edit)
│       ├── Provenance flag
│       ├── Ask-agent ✦
│       └── Ask popover
└── Line items card
    ├── Card header + ask ✦ + popover
    ├── Item row ×N
    │   ├── Name + flag
    │   ├── Detail
    │   ├── Price
    │   └── Quantity
    ├── Total row
    └── Unpriced note
```

Content column: `padding: 0 28px 40px`, `max-width: 840px`, `display:flex; flex-direction:column; gap:14px`.

---

## 3. Visual specification

### 3.1 Header
- `padding: 22px 28px 18px`, `gap: 14px`, `flex-wrap: wrap`
- Title group: `align-items: baseline; gap: 9px` — title 24px/800 `letter-spacing: -0.02em`; separator `·` 19px `#6b6d73`; client 19px/600 `#8b8d93`
- View toggle: container `#141517`, border `1px solid #26282c`, radius `9px`, `padding: 3px`, `gap: 3px`; each segment 12.5px/600, padding `7px 12px`, radius `7px`; selected segment takes a raised background and brighter ink (approximate — derived in the prototype)
- Discard: transparent, border `1px solid #26282c`, ink `#a1a3a9`, 13px/600, padding `9px 14px`, radius `9px`; hover ink `#fff`
- Primary action: 13.5px/700, padding `11px 16px`, radius `10px`; hover `opacity: .9` — see §3.6

The client name sits in the header at 19px next to the title. That is the whole client context on this surface — deliberate restraint, but see §8.

### 3.2 Readiness line
13px, `#7c7e84`, directly above the cards. Content: `"N open questions · nothing sent yet"` or `"All questions resolved · nothing sent yet"`.

**"nothing sent yet" is present in both variants.** That phrase is design truth — the safety guarantee is restated at the moment of review, not buried.

### 3.3 Fields card
- `#141517`, border `1px solid #232427`, radius `14px`, `overflow: hidden`
- Row: `position: relative` (anchors the popover), `border-bottom: 1px solid #1e1f22`, padding `13px 16px`, `display:flex; gap:16px; align-items:baseline`
- Label: `flex: 0 0 116px`, 12.5px, `#7c7e84`, `padding-top: 1px`
- Value (read): 14px/500, line-height 1.5, `text-wrap: pretty`, `cursor: text`, radius `5px`, `margin: -2px -5px`, `padding: 2px 5px`; hover background `#1c1d20`
  - Ink `#f5f5f6` normally, `#e0a94a` when the value is missing
- Value (edit): full-width input, `#0b0b0c`, border `1px solid #3b82f6`, radius `7px`, padding `6px 9px`, `margin: -7px -10px` (so the input sits exactly over the text it replaces), ink `#fff`, 14px/500, no outline
- Provenance flag: 10.5px/600, sits inline after the value on a wrapping baseline row, `gap: 9px`
- Ask-agent trigger: `✦` 13px, `#3a3c41` at rest, `flex: 0 0 auto`, padding `2px`; hover `#3b82f6`

The negative-margin trick on both the hover surface and the edit input is what makes inline editing feel like editing *the text itself* rather than opening a form. Keep the effect; the exact margins are implementation detail.

Observed field set (demo content, but the *label vocabulary* is indicative): Title, Client, Contact, Deadline, Guest count, Location, Valid for, Language, Intro.

### 3.4 Provenance flags

| Flag | Ink | Meaning |
|---|---|---|
| "Missing" | `#e0a94a` | field has no value |
| "Updated" | `#7ddba0` | changed since the draft was made |
| "Assumed" (items) | `#e0a94a` | agent inferred this |
| "Needs price" (items) | `#e0a94a` | no price available |
| "Added" (items) | `#e0a94a` | line added after the initial draft |

Amber = *the agent is not sure* or *nothing is here*. Green = *this has been resolved*. That two-color logic is the surface's core signal and must survive.

**Weakness to correct:** "Updated" does not distinguish *the user edited this* from *the agent revised this*. Rule 3 says human edits are human actions — the flag vocabulary should say so. See §8.

### 3.5 Line items card
- Same card shell; `position: relative` for its popover
- Card header: padding `13px 16px`, `border-bottom: 1px solid #1e1f22`, `gap: 10px` — "Line items" 13.5px/700, count 11.5px `#6b6d73`, spacer, ask `✦`
- Item row: padding `13px 16px`, `border-bottom: 1px solid #1e1f22`, `display:flex; gap:14px; align-items:flex-start`
  - Left (`flex: 1; min-width: 0`): name row (`align-items: baseline; gap: 9px; flex-wrap: wrap; margin-bottom: 3px`) with name 14px/600 plus optional flag at 10.5px/600; then detail 12.5px, `#7c7e84`, line-height 1.45, `text-wrap: pretty`
  - Right (`text-align: right; flex: 0 0 auto`): price 14px/600 — `#f5f5f6`, or `#e0a94a` when unpriced; below it quantity 11.5px, `#7c7e84`, `margin-top: 3px`
- Total row: padding `15px 16px`, `align-items: baseline; gap: 12px` — "Total" 13.5px/600 `#8b8d93`, spacer, amount 20px/800
- Unpriced note: padding `0 16px 15px`, 12px, `#e0a94a` — states that some lines are unpriced

Price above quantity, right-aligned, with quantity as the smaller value: the amount is what the user is checking, the quantity is the justification.

### 3.6 Approval action

| Condition | Label | Background | Ink |
|---|---|---|---|
| Open questions remain | "Push anyway" | `#1f2023` | `#c9cbd1` |
| All resolved | "Create in Proposales" | `#3b82f6` | `#fff` |

This is the surface's best single decision. With unresolved questions the button is grey and its label names the risk; once resolved it turns blue and names the act. It is never disabled — the user can always proceed — but it never *invites* proceeding on an incomplete draft.

**Wording note:** "Push anyway" is internal-sounding next to "Create in Proposales". See §8.

### 3.7 Ask popover
- Field-anchored: `position: absolute; z-index: 5; left: 16px; right: 16px; top: 100%; margin-top: 2px` — spans the row's inner width, directly below it
- Line-items variant: `position: absolute; z-index: 6; right: 14px; top: 46px; width: 300px` — anchored under the card header
- Shell: `#1a1b1e`, border `1px solid #3a3c41`, radius `11px`, padding `11px`, `box-shadow: 0 18px 40px rgba(0,0,0,.55)`
- Label: 11px, `#8b8d93`, `margin-bottom: 8px` — "Ask the agent about **&lt;field&gt;**" with the field name in `#f5f5f6`/700
- Input: full width, `#0b0b0c`, border `1px solid #26282c`, radius `8px`, padding `9px 10px`, ink `#f5f5f6`, 13px, `margin-bottom: 9px`; focus border `#3b82f6`. Placeholder is field-specific ("e.g. mention the November opening", "e.g. add pickup and delivery")
- Actions: right-aligned, `gap: 8px` — Cancel (borderless, `#7c7e84`, 12.5px/600) and Ask (`#3b82f6`, white, 12.5px/700, padding `8px 13px`, radius `8px`)

Sending from the popover posts a scoped request to the agent; the resulting turn appears in the thread with a `re: <field>` scope badge (see `03` §3.4). **That round trip — ask here, answer there — is design truth.** It keeps the agent conversation in one place while letting the user point at what they mean.

---

## 4. Interaction behavior

### 4.1 Inline editing
- Click a value to enter edit mode; the input replaces the text in place and autofocuses.
- Enter commits; blur commits; Escape should cancel (**not implemented in the prototype — production must add it**).
- Committing marks the field as changed and shows the resolution flag.
- One field edits at a time.

### 4.2 Ask popover
- `✦` opens the popover for that field (or for the line-items card).
- One popover at a time; opening another closes the first.
- Cancel closes; Enter submits; **Escape should close (not implemented)**.
- Submitting closes the popover, posts the request, and the agent's reply lands in the thread.

### 4.3 View toggle
Switches between the fields view and the client preview (see `08`). Toggle state is disposable UI — losing it on session switch is acceptable.

### 4.4 Discard
Currently returns to the list with no confirmation. **Production must confirm** — this abandons page-lifetime work.

### 4.5 Missing / unresolved presentation
Three simultaneous channels:
1. Field or price value rendered in `#e0a94a` instead of `#f5f5f6`
2. A flag chip next to it ("Missing", "Needs price", "Assumed")
3. Aggregate signals: the readiness line's open count, the unpriced note under the total, the grey "Push anyway" button, and the session's phase label / tab dot

Redundancy is right here — the user must not approve an incomplete draft by accident.

---

## 5. Accessibility requirements

- **The fields card is a description list, not a table.** Use `<dl>`/`<dt>`/`<dd>` or a labelled grid. A `<div>` soup of label/value pairs gives no relationship.
- **Inline editing is currently keyboard-unreachable.** The read-mode value is a `<div>` with an `onClick`. Required: a real `<button>` (or an always-present input) with an accessible name ("Edit Title, currently 'Walnut dining set restoration'"), Enter/Space to enter edit mode, Escape to cancel, and focus returned to the trigger on commit or cancel.
- **The ask popover needs focus management.** It is currently a bare absolutely-positioned div. Required: `role="dialog"` with `aria-label` ("Ask the agent about Title"), focus moved to the input on open, focus trapped while open, Escape to close, focus returned to the `✦` trigger on close, and a click-outside dismissal.
- **The `✦` trigger fails contrast badly** at `#3a3c41` on `#141517` (~1.5:1) and has a `13px` glyph in a `2px`-padded box — roughly a 17px target. Required: readable rest color (`#7c7e84`), `aria-label="Ask the agent about <field>"`, ≥ 32px hit area, visible focus ring.
- **Provenance flags must not be color-only.** "Missing" and "Updated" already carry text — good. But the *value* turning amber is color-only; the flag text must always accompany it.
- Line items: use a real `<table>` with a header row, or an ARIA table. Price/quantity/name relationships are currently positional only.
- The total must be programmatically associated with the item list (`<tfoot>`, or an `aria-describedby`).
- The unpriced note must be linked to the total (`aria-describedby`) so it is announced with it.
- The view toggle is a two-option control: `role="tablist"` with `aria-selected`, or a radio group. Currently two unrelated buttons.
- "Push anyway" needs an `aria-describedby` explaining the risk ("3 questions are still open").
- Field labels are truncated to a `116px` column but do not ellipsize — long labels will wrap. Verify at 460px main-pane width.
- Focus rings are absent throughout.

---

## 6. States

| Scope | States |
|---|---|
| Field row | reading, hover (value tinted background), editing, missing, updated |
| Field value | normal ink, missing (amber) |
| Ask trigger | rest (near-invisible), hover (blue), focused (to add) |
| Ask popover | closed, open, submitting (to add) |
| Item row | normal, assumed, needs-price, added, updated |
| Item price | priced, unpriced (amber) |
| Total | with all lines priced, with unpriced lines (amber note appended) |
| Approval button | "Push anyway" (grey, open questions), "Create in Proposales" (blue, resolved), creating (see `09`) |
| View | fields, client preview |
| Readiness | N open, all resolved |

Missing and required: **save-in-flight** and **save-failed** on inline edit; **submitting** and **failed** on the ask popover.

---

## Prototype-only — do not port

- **`baseDraft()`** — the entire fake proposal object: title, client "North & Pine", contact "Emma", the intro paragraph, and the three seeded line items (`chairs` 12 × 1,000 SEK = 12,000 SEK flagged `assumed`; `upholstery` "Not priced" flagged `missing`; `table` "Not priced" flagged `missing`). Demo fixture. **Not a domain contract.**
- **All hardcoded commercial values**: 12,000 SEK, 1,000 SEK per chair, 6,500 SEK, 1,800 SEK, 350 SEK, €100, and every amount in the product-library fixture.
- **Client-side total computation from formatted strings:**
  ```
  priced = items.filter(i => !/not priced/i.test(i.price))
  sum = priced.reduce((a,i) => a + (parseFloat(String(i.price).replace(/[^0-9.]/g,'')) || 0), 0)
  ```
  This parses display strings into numbers and adds them. It is the clearest violation of Rule 1 and Rule 2 in the prototype. **The frontend must never do arithmetic on money.** Totals arrive from the server, formatted or with an explicit currency and minor-unit value.
- **Regex-based missing-field detection** — `/not priced/i` tests, `missing` computed from `!value`, and every `flag` assignment derived from string inspection. Provenance and completeness are **server-owned facts**.
- **`apply()` and the revision regexes** — `/upholster|included|12[,.]?000|fabric/`, `/pickup|delivery|transport/`, `/armchair/` etc., which mutate the mock draft and fabricate diff records in response to typed text. All revision logic is server-side.
- **`changed` as a client-held map** driving the "Updated" flag. Change provenance comes from the server.
- `unpricedNote` text generated from a client-side count.
- `field()` as a helper that bundles value, flag, colors, edit handlers, and popover state into one object — a prototype convenience object, **not a view-model contract**.
- `editing` / `popKey` / `popText` as single-slot globals in the giant component state.
- `autoFocus="{{ true }}"` as the focus mechanism for both the inline input and the popover input.
- The **Discard** button routing to a fake list view.
- The fields *list itself* as a schema — the nine labels are demo-shaped; the real field set comes from the domain.

---

## Open design questions

1. **"Push anyway" wording.** Internal-sounding, and "push" appears nowhere else in the user-facing vocabulary (the other button says "Create in Proposales"). Alternatives: "Create anyway", "Create with 3 open". Needs a decision.
2. **"Updated" does not distinguish human from agent.** Rule 3 requires the surface to treat human edits as human actions. Should there be two flags — "Edited by you" (green) vs. "Revised by agent" (blue/green) — or does hover/detail carry the distinction?
3. **Client context is one line in the header.** Is that enough at review time, or does the user need the client record (contact, previous proposals, defaults) visible or one click away?
4. **Escape behavior is undefined** for both inline edit and the ask popover. Both need it.
5. **No confirmation on Discard.** Confirm dialog, or discard-plus-undo?
6. **Two popover anchoring models** (field-width-spanning vs. 300px right-anchored). Should they unify?
7. Should the fields card group fields into sections (client / commercial / content) once the real field set is known? Nine flat rows is manageable; twenty would not be.
8. Is the line-items card editable in V1, or ask-only? Fields are inline-editable but items are not — an inconsistency the prototype does not explain.
