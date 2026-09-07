# 06 — Clarification Panel

The structured answering surface. When the agent needs specific facts, it does not ask in prose — it replaces the composer with a panel.

---

## 1. Design truth

The panel exists because **prose is the wrong input for structured facts.** Asking "was upholstery included in the 12,000, or priced separately?" in chat invites a paragraph the agent has to re-parse. Presenting it as two option buttons plus an escape hatch gets an unambiguous answer in one click.

Three commitments:

1. **The panel replaces the composer.** While it is open the user cannot type freeform — there is one thing to do. An explicit dismiss returns the composer.
2. **Every question is skippable.** The skip is not "cancel" — it is a real answer with meaning ("Ask the client", "Leave unpriced", "No firm date yet"). Deferring is a first-class outcome.
3. **Batches step, single questions don't.** One question is one question. Two or more get a stepper with progress, back/next, and a batched send.

The panel is anchored to the composer and rises from it (`box-shadow: 0 -12px 34px`) — visually it is the input, transformed.

---

## 2. Presentation structure

```
Clarification Panel        (max-height 62vh, flex column)
├── Header                 (flex 0 0 auto)
│   ├── Live dot
│   ├── Title / field eyebrow
│   ├── Counter (mono)
│   └── Dismiss ✕
├── Step progress bars     (batch mode only, flex 0 0 auto)
├── Question region        (flex 1, overflow-y auto)
│   └── Question block ×N
│       ├── Field eyebrow (optional)
│       ├── Question text
│       ├── Filled ✓
│       ├── Options / Other / Input
│       ├── Note
│       └── Skip
└── Footer                 (flex 0 0 auto)
    ├── Skip-all / skip label
    ├── Back / Next (batch only)
    └── Send
```

---

## 3. Visual specification

### 3.1 Panel shell
`#141517`, border `1px solid #3a3c41`, radius `12px`, `overflow: hidden`, `box-shadow: 0 -12px 34px rgba(0,0,0,.45)`, `max-height: 62vh`, `display:flex; flex-direction:column`.

62vh is the only vh value in the design. It keeps the thread partially visible above the panel — the user can still see what they are answering *about*. Preserve the intent; the exact value is tunable.

### 3.2 Header
- Padding `10px 13px`, `border-bottom: 1px solid #1e1f22`, `gap: 9px`, `flex: 0 0 auto`
- Live dot: `6px` circle, `#7aa9ff`, `flex: 0 0 6px` — static, not animated
- Title: 11.5px/700, `letter-spacing: .04em`, uppercase, `#9a9ca2`. Content is the **field name** of the current question, e.g. "BEIGE UPHOLSTERY", "DEADLINE"
- Counter: mono 10px, `#6b6d73`. Batch: `"2 of 3"`. Single: `"pick one"` for a choice question, `"one question"` otherwise
- Dismiss: `✕` at 14px, `#6b6d73`, borderless, padding `2px 0 2px 4px`; hover `#dcdde0`; `title="Type a message instead"`

### 3.3 Step progress (batch only)
- Padding `10px 14px 0 14px`, `gap: 6px`, `flex: 0 0 auto`
- Each step is a `<button>`: `flex: 1`, `height: 4px`, `radius: 99px`, no border, hover `opacity: .8`
- Background by state (approximate — derived in the prototype): current step accented (`#3b82f6` / `#7aa9ff`), filled steps positive or accented, untouched steps `#2f3135`-ish
- Clicking a bar jumps to that step
- Each bar carries a `title` naming its question

Equal-width segmented bars, not dots — they read as progress *and* as a direct index.

### 3.4 Question block
- Padding `13px 14px`, `gap: 10px`, column
- Separator between stacked blocks via a top border (`"none"` for the first)
- Header row: `align-items: baseline; gap: 9px`
  - Field eyebrow (currently suppressed — see §8): 11px/700, `.04em`, uppercase, `#6b6d73`, `margin-bottom: 5px`
  - Question text: 14px/600, `#f0f0f2`, line-height 1.45, `text-wrap: pretty`
  - Filled indicator: `✓` 12px/700, `#7ddba0`, `flex: 0 0 auto` — appears once the question has a value
- Note: 11.5px, `#6b6d73`, line-height 1.5. Carries the *reason for asking* or a reference range — "Our last three walnut tables came in between 4,500 and 8,000 SEK", "The client only said 'before the November opening'." **This is design truth: the panel explains why it is asking.**
- Skip: `align-self: flex-start`, borderless, `#7c7e84`, 12px/600, padding `2px 0`; hover `#c9cbd1`. Label is question-specific

### 3.5 Options
- Column, `gap: 7px`
- Each option is a `<button>`: left-aligned, 13px/600, padding `11px 13px`, radius `9px`, `display:flex; align-items:center; gap:10px`
- Mark column: mono 10px, `flex: 0 0 auto`
- Label: `flex: 1; min-width: 0`

| | Unselected | Selected |
|---|---|---|
| Background | `#17181a` | `#1b2740` |
| Border | `1px solid #2f3135` | `1px solid #3b82f6` |
| Ink | `#dcdde0` | `#fff` |
| Mark | `○` (choice) / `≈` (amount) at `#6b6d73` | `●` at `#7aa9ff` |
| Hover | border `#3b82f6`, ink `#fff` | — |

The `≈` mark on amount options is deliberate: those are *suggestions*, not the actual options — picking one puts the value in the field, and the user can still type a different number. `○` means "one of these"; `≈` means "roughly this".

- **Other**: shown when options exist and the other-input is closed. `background: transparent`, `border: 1px dashed #2f3135`, ink `#9a9ca2`, 13px/600, padding `11px 13px`, radius `9px`, left-aligned; hover border `#4a4c52`, ink `#dcdde0`. Label is per-question ("Another combination…", "Other answer…"). Clicking it reveals the text input.

Dashed border for the escape hatch, solid for real options — a good, quiet distinction.

### 3.6 Text / date / amount input
- Wrapper: `#0b0b0c` (the app background — an inset well), border `1px solid #26282c`, radius `9px`, padding `2px 11px`, `display:flex; align-items:center; gap:9px`; `:focus-within` → border `#3b82f6`
- Input: transparent, no border/outline, ink `#f5f5f6`, 14px, padding `11px 0`, `color-scheme: dark` (so the native date picker matches), `flex: 1; min-width: 0`
- Unit suffix (amount): 12.5px/700, `#7c7e84`, `flex: 0 0 auto` — e.g. "SEK"
- `type` varies: `text`, `date`, or a numeric type for amounts
- Placeholder per question ("e.g. Norwegian, NOK", "e.g. 4,200 SEK, fabric billed at cost")

Shown when the question is not a pure choice, or when Other has been opened.

### 3.7 Footer
- Padding `11px 14px`, `border-top: 1px solid #1e1f22`, `gap: 10px`, `flex: 0 0 auto`
- Skip-all: borderless, `#7c7e84`, 12.5px/600, padding `6px 0`; hover `#c9cbd1`. Batch label "Skip all"; single mode uses the question's own skip label
- Stepper (batch only): two `30×32` buttons, transparent, border `1px solid #2f3135`, radius `8px`, 12px/700 glyphs `←` `→`; hover border `#4a4c52`. Ink and cursor go inert at the ends of the range
- Send: 13px/700, padding `10px 15px`, radius `9px`; hover `opacity: .9`
  - Ready: bg `#3b82f6`, ink `#fff`, `cursor: pointer`
  - Not ready: bg `#1d1e21`, ink `#5b5d63`, `cursor: default`
  - Label: single → "Send answer"; batch → "Send answer" or "Send N answers" when more than one is filled

---

## 4. Interaction behavior

### 4.1 Mode selection
- **1 open question** → single mode: no step bars, no stepper, footer skip uses that question's skip label, counter reads "pick one" / "one question".
- **2+ open questions** → batch mode: step bars, back/next, "N of M" counter, "Skip all", batched send.

The panel shows only *unanswered* questions. Answering one removes it from the panel; the record of the answer lives in the thread's ask pill (see `05`).

### 4.2 Answering
- Picking an option sets the value and marks the question filled (`✓` in the header row, step bar fills).
- Picking an **amount suggestion** fills the numeric field; the user can then edit it.
- Opening **Other** reveals the input and focuses it (expectation).
- Typed values are held as per-question drafts until sent.
- **Normalization is presentational only:** the prototype appends the unit to a bare number and reformats an ISO date into prose. Display formatting is fine at the view boundary; **the value sent must remain the raw, unformatted input.** See §7.
- Send submits the filled answers. In batch mode a partially-filled batch can be sent — unfilled questions stay open.

### 4.3 Navigation (batch)
- Back / Next move one step, clamped at the ends.
- Clicking a step bar jumps directly.
- Steps are freely navigable in both directions — no forced order.

### 4.4 Skip / defer
- Per-question skip removes it from the panel with its deferral meaning attached.
- "Skip all" clears the whole batch.
- Skipping is not destructive to the draft; the corresponding field simply stays unresolved and shows its "Missing" / "Needs price" flag in the review pane (see `07`).

### 4.5 Dismiss
- `✕` closes the panel and returns the composer. The questions remain open; the thread's ask pill still offers "Answer this" to bring the panel back (see `05` §3.4).

### 4.6 Keyboard behavior

Prototype: the inputs have key handlers (Enter to advance/submit — approximate), but there is **no systematic keyboard model**. Required for production:

- On open, focus the first unanswered question's first interactive element. Do not focus the dismiss button.
- Options are a **radio group** per question: `ArrowUp`/`ArrowDown` move and select, `Space` selects, `Tab` leaves the group.
- `Enter` in a text/date/amount input: batch → advance to the next step; single or last step → submit.
- `Cmd/Ctrl + Enter` submits from anywhere in the panel.
- `Esc` dismisses the panel and returns focus to the composer.
- `Alt + ArrowLeft/Right` (or the stepper buttons via Tab) moves between steps.
- Focus must be visible on every control — currently none of them have a focus style.
- The panel is **not a modal.** It replaces the composer inline. Do not trap focus; do not use `role="dialog"`. Focus should be able to leave it into the thread above.

### 4.7 Validation presentation

**There is none today.** The send button's ready/not-ready state is the only signal, and there is no per-question error state. Required for production:

- Amount: reject non-numeric input; show a per-question message below the input in `#e0a94a`, 11.5px.
- Date: constrain to a valid range where the domain provides one.
- Error state on the input wrapper: border `#e0a94a`.
- Errors must be announced (`aria-invalid`, `aria-describedby` pointing at the message).
- Never block *skipping* on validation — deferral must always be available.

### 4.8 Scrolling
- Question region is the only scroll area (`flex: 1; min-height: 0; overflow-y: auto`); header, step bars, and footer stay pinned.
- Panel caps at `62vh`; beyond that the questions scroll.
- In batch mode the panel shows one step at a time, so scrolling is rare — it matters for long question text plus many options in a short viewport.

---

## 5. Accessibility requirements

- Panel: `role="region"`, `aria-label="Agent questions"`, and `aria-live="polite"` for step changes. **Not a dialog.**
- Each question: `<fieldset>` with a `<legend>` carrying the question text, or a labelled `role="radiogroup"`.
- Options: real radios (`role="radio"` + `aria-checked`, or native inputs styled as buttons). They are currently `<button>`s with no selection semantics — a screen-reader user cannot tell which is chosen.
- `✓` filled indicator must be `aria-hidden` with the state carried in text ("answered").
- Step bars: `role="tablist"`-like semantics or a labelled list; each bar needs an accessible name ("Question 2 of 3, Deadline, answered"). A 4px-tall unlabelled button is currently invisible to assistive tech and impossible to hit precisely — **give the bars a ≥ 24px hit area** while keeping the 4px visual.
- Stepper buttons: `aria-label="Previous question"` / `"Next question"`, and `disabled` (not just inert-looking) at the ends. Currently they are always clickable and merely change color.
- Send button: `disabled` when not ready, not just visually dimmed.
- Skip links must state what skipping means — the label already does ("Ask the client"), so expose it as-is.
- Note text must be programmatically associated with its question (`aria-describedby`).
- Unit suffix must be part of the input's accessible name ("Amount in SEK"), not a floating `div`.
- Counter ("2 of 3") should be announced on step change, politely, once.
- Contrast: note text `#6b6d73` on `#141517` (~3.4:1) and skip links `#7c7e84` (~4.4:1) both need lightening.
- The dismiss `✕` needs `aria-label="Close questions and type a message instead"`.

---

## 6. States

| Scope | States |
|---|---|
| Panel | closed, single-question, batch (2+), dismissed-but-questions-open |
| Question | unanswered, filled, skipped, invalid (to add) |
| Option | unselected, selected, hover, focused (to add) |
| Other | closed (dashed button), open (input revealed) |
| Input | idle, focused, with unit, invalid (to add) |
| Step bar | untouched, filled, current |
| Stepper | available, at-start (back inert), at-end (next inert) |
| Send | ready (blue), not ready (dim, inert), submitting (to add) |
| Question region | fits, scrolling (capped at 62vh) |

Missing and required: **invalid**, **submitting**, and **submit-failed** states.

---

## 7. Interaction mechanics vs. domain payload

A hard line runs through this surface. Production must respect it.

**Pure interaction mechanics (design truth, portable, domain-independent):**
- single vs. batch mode selection
- step progress, back/next, jump-to-step
- draft-holding of typed values until send
- filled/unfilled indication
- other-input reveal
- skip and skip-all affordances
- dismiss and re-open
- panel layout, max-height, scroll behavior
- keyboard model
- validation *presentation*

**Domain-dependent question payload (server-owned, never invented client-side):**
- which questions exist, and in what order
- each question's field name, prompt text, and note
- answer type (choice / text / date / amount) and unit
- suggested options and their values
- what skipping a given question means, and its label
- validation *rules*
- what happens to the draft when an answer is submitted

The panel is a renderer for a question set. It must not contain knowledge of any particular question.

---

## Prototype-only — do not port

- **`qdefs` and `qOrder`.** `qdefs` is a hardcoded object of five questions (`pre`, `upholstery`, `upholsteryPrice`, `table`, `date`) with literal prompts, options, notes, units, and skip labels tied to the walnut-chairs demo. `qOrder` is a hardcoded sequence. **These must not become a domain schema.** They are demo fixtures. The *shape* they happen to have (`field`, `kind`, `question`, `options`, `note`, `unit`, `skipLabel`) is a presentation view-model at best — the real contract is owned by the backend.
- Hardcoded commercial values inside question definitions: "Included in the 12,000 SEK", the amount suggestions `3,600 / 4,200 / 5,400` and `4,500 / 6,500 / 8,000`, the date options `2026-10-27` / `2026-11-03`, and the note "Our last three walnut tables came in between 4,500 and 8,000 SEK".
- `applyOne()` — the fake answer-application engine. It mutates a mock draft, inserts follow-up questions (`if (/^priced separately/i.test(val)) queue.splice(...)`), and generates diff records. **Conditional follow-up questions are a real product behavior, but the decision belongs to the server**, not to a regex on the answer string.
- `normalize()` — regex-based value coercion (`/^[0-9][0-9,.\s]*$/` to append a unit, `/^\d{4}-\d{2}-\d{2}$/` to prettify a date) and `prettyDate()` with its hardcoded English month names. Display formatting is legitimate at the view boundary, but it must be locale-aware and must never alter the submitted value.
- The state trio `answers` / `skipped` / `qDrafts` plus `askIds`, `askStep`, `askOther`, `queue` living in one giant component state.
- `queue` as a mutable client-side question queue that the client itself reorders and extends.
- `openIds()` filtering by client-held answers.
- The `pre` question ("Which language and currency…") which exists in `qdefs` but is not in `qOrder` — dead demo fixture.
- Enter-key handling wired per-input by ad-hoc handlers rather than a panel-level keyboard model.

---

## Open design questions

1. **The field eyebrow is coded but suppressed** (`showField: false` in the prototype) — the field name appears in the panel *header* instead. Should per-question blocks show their field name in batch mode, where the header only names the current step? Likely yes for the stacked/scrolled case.
2. **Can the panel ever show several questions stacked?** The markup supports it (separator borders, per-block padding) but batch mode shows one step at a time. Is stacked mode a real mode, or dead capability?
3. **Is a partially-filled batch sendable?** Currently yes. Should it be, or should send require all questions answered-or-skipped?
4. **What does "skipped" look like after the fact?** The panel removes the question; the review pane shows an unresolved flag. Is there a visible record that the user *chose* to defer, versus never having been asked?
5. **Amount options marked `≈`** — is the suggestion semantics clear enough, or should suggestions sit visually apart from real choices (a "suggested" label, a separate row)?
6. Should the panel re-open automatically when the agent produces new questions, or wait for the user to click "Answer this" in the ask pill? Auto-opening interrupts; waiting risks the questions being missed.
7. Is 62vh right? It was chosen so the thread stays partly visible — worth validating at short viewport heights.
