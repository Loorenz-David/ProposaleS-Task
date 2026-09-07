# 03 — Agent Surface

The left pane in full: header, session tabs, status line, conversation thread, and composer.

---

## 1. Design truth

The agent surface is a **working column**, not a chat window. Three things distinguish it from a chat UI:

1. **The thread is not the only output.** Agent turns carry structured attachments — reasoning traces, question sets, diffs, links, actions — rendered as pills (see `05`), not as prose.
2. **The composer is not always a text box.** When the agent needs structured answers it is *replaced* by the clarification panel (see `06`). The user is never asked to type a structured answer in prose.
3. **The column is scoped to a session**, and multiple sessions are open at once (see `04`).

Prose in the thread is short and declarative. The agent says what it did and what it needs. It does not narrate.

---

## 2. Presentation structure

```
Agent Surface
├── Header               — mark, agent name, history toggle, session count
├── Session Tabs         — see 04-session-tabs.md
├── Session Status        — active-session note + phase label
├── Thread               (scroll region, flex: 1)
│   ├── Empty state       — lead, secondary line, starter buttons
│   ├── User message      — right-aligned bubble
│   ├── Assistant message — optional scope badge, prose, pills, chips
│   ├── Interaction pill  — see 05-interaction-pills.md
│   └── Thinking indicator
└── Composer Region      (flex: 0 0 auto)
    ├── Slash palette     (optional, above input)
    ├── Clarification panel (replaces the input — see 06)
    └── Input + send + hint
```

Presentation decomposition only. This is not a required component tree.

---

## 3. Interaction behavior

### 3.1 Header

- App mark `✦`: 26×26, radius 7px. Currently toggles the discarded rail — **in production it is either non-interactive branding or the agent's identity affordance.** Decide (§8).
- Agent name: 14px/700, `#f5f5f6`, a button. Same note as above.
- History toggle: 30×30, radius 8px, 15×15 clock SVG. Opens the session-history list (prototype-only — see below).
- Session count: mono 10px, `#6b6d73`, uppercase, e.g. "2 sessions".
- Padding `16px 14px 10px 18px`, `gap: 8px`.

### 3.2 Session status line

- Padding `8px 18px 12px`, `border-bottom: 1px solid #1c1d20`.
- Left: the active session's note — 12.5px/600, `#a1a3a9`, single line, ellipsized. Examples: "Reading the transcript", "Pricing the three seatings", "Draft ready to review".
- Right: phase label — mono 10px, `#6b6d73`, uppercase. Derived values observed: `working` (agent busy), `idle` (no draft), `created`, `N open` (open questions), `ready to push`.

This line is the session's one-glance state. It must always be present and must always agree with the active tab's dot.

### 3.3 Thread scrolling and autoscroll

- Container: `flex: 1; min-height: 0; overflow-y: auto; padding: 4px 18px 18px; display: flex; flex-direction: column; gap: 16px`.
- **Autoscroll expectation:** stick to the bottom when the user is already at (or within ~80px of) the bottom. If the user has scrolled up, do **not** yank them down — show a "jump to latest" affordance instead. The prototype has no such guard; production must add one.
- Newly appended agent output should not shift content the user is currently reading.
- Expanding a pill in place must not scroll the thread; the expansion grows downward.

### 3.4 Message layout

**User message** — right-aligned:
- `display:flex; justify-content:flex-end`
- Bubble: `#1f2023`, border `1px solid #2f3135`, ink `#f0f0f2`, 14px/1.55, padding `11px 14px`, radius `12px`, `max-width: 88%`, `white-space: pre-wrap` (pasted notes keep their line breaks — important), `text-wrap: pretty`

**Assistant message** — full width, no bubble, no avatar:
- Optional **scope badge** above the prose when the turn answers a specific field: inline-flex, 11px/600, `#8b8d93`, bg `#17181a`, border `1px solid #26282c`, padding `4px 9px`, radius `6px`, `margin-bottom: 8px`, reads `re: <field>`
- Prose: 14px/1.6, `#e4e4e7`, `text-wrap: pretty`
- Pills: `margin-top: 10px`, vertical stack, `gap: 6px`, `align-items: stretch`
- Chips (quick replies): `margin-top: 11px`, wrapping row, `gap: 8px`; each is `#17181a` / border `#2f3135` / `#dcdde0` / 12.5px 600 / padding `8px 12px` / radius `99px`; hover → border `#3b82f6`, ink `#fff`

The asymmetry is the point: the user gets a contained bubble, the agent gets the page. It reads as the agent working *in* the column rather than talking *at* the user.

### 3.5 Busy / working indication

Two simultaneous signals:
- **In-thread:** three 6px dots, `#8b8d93`, `pulseDot 1s infinite` staggered `0 / .15s / .3s`, plus a 13px `#8b8d93` label 4px to the right. Observed labels: "Drafting proposal", "Revising draft", "Revising <field>", "Thinking".
- **In chrome:** phase label reads `working`; the session tab dot goes `#7aa9ff` and pulses at `1.1s`.

A background session shows the tab signal only. The thread indicator belongs to the session you are looking at.

### 3.6 Empty state

Shown when the session has no thread:
- Lead: 15px/600, line-height 1.55 — "Paste notes and I will draft a proposal — or just tell me what to do in here."
- Secondary: 13.5px, `#8b8d93`, line-height 1.6 — names the accepted inputs and states the safety guarantee ("Nothing reaches Proposales until you approve the draft.")
- Starter buttons: `margin-top: 14px`, vertical stack, `gap: 7px`, `align-items: flex-start`; each `#17181a` / border `#26282c` / `#dcdde0` / 12.5px 600 / padding `9px 13px` / radius `9px` / left-aligned; hover → border `#3b82f6`, ink `#fff`

The safety sentence in the empty state is **design truth** — it sets the approval-boundary expectation before the user does anything.

### 3.7 Composer

- Region padding: `14px 18px 18px`.
- Shell: `#141517`, border `1px solid #26282c`, radius `12px`, padding `10px 12px`, `display:flex; align-items:flex-end; gap:10px`, `:focus-within` → border `#3b82f6`.
- Textarea: `min-height: 38px`, `max-height: 150px`, `resize: none`, transparent, 14px/1.5, ink `#f5f5f6`, padding `4px 0`. Grows with content, then scrolls.
- Send: 34×34, `#3b82f6`, white `↑`, radius `9px`, hover `#5596ff`.
- Hint line below: 11px, `#5b5d63`, `margin-top: 8px`, line-height 1.5. Context-dependent — on the review screen it suggests revision phrasings; otherwise it explains Enter and `/`.
- Keyboard: `Enter` sends; `Shift+Enter` newline.
- **Composer is hidden entirely while the clarification panel is open.** The panel takes its place in the same region.

Contrast note: the 11px `#5b5d63` hint fails contrast. Production must lighten it (see `01` §5).

### 3.8 Slash palette (deferred / optional)

Opens above the composer when the input starts with `/`. Panel `#141517`, border `1px solid #3a3c41`, radius `12px`, `box-shadow: 0 -10px 30px rgba(0,0,0,.4)`, `margin-bottom: 8px`. Rows: padding `10px 13px`, `border-bottom: 1px solid #1e1f22`, `gap: 11px` — mono 10.5px `#7aa9ff` command (fixed 62px column), 12.5px/600 `#dcdde0` label, and `↵` on the first row. Empty result shows "No command matches — press Enter to send it as a message."

**Status: optional / deferred for V1.** The *visual pattern* is worth keeping; the specific command set in the prototype is tied to prototype-only navigation and must not be ported. If included in V1, it needs full keyboard support: `↑`/`↓` to move, `Enter` to run, `Esc` to close, `role="listbox"` with `aria-activedescendant`. None of that exists today.

### 3.9 Content width behavior

Everything in the pane is fluid inside the 320–620px range. Constraints that must hold at 320px: the tab strip scrolls rather than crushing tabs; pill labels ellipsize; the status note ellipsizes; option buttons and question text wrap; nothing sets a fixed pixel width.

---

## 4. Visual specification summary

| Element | Key values |
|---|---|
| Pane | `#0e0f10`, 320–620px, default 392px |
| Header | padding `16px 14px 10px 18px`, gap 8px |
| Status line | padding `8px 18px 12px`, bottom border `#1c1d20` |
| Thread | padding `4px 18px 18px`, gap `16px`, own scroll |
| User bubble | `#1f2023` / `#2f3135` / `#f0f0f2`, 14px/1.55, r12, max-w 88% |
| Assistant prose | 14px/1.6, `#e4e4e7` |
| Composer | `#141517` / `#26282c`, r12, padding `10px 12px` |
| Send | 34×34, `#3b82f6`, r9 |
| Hint | 11px, `#5b5d63` (must lighten) |

---

## 5. Accessibility requirements

- Thread region: `role="log"` with `aria-live="polite"` and `aria-relevant="additions"`. Announce **completed** agent turns only — never the per-token stream, and never the thinking indicator on a loop.
- Working state: `aria-busy="true"` on the thread while the agent is working, plus one polite announcement of the working label. The animated dots must be `aria-hidden`.
- User vs. assistant must be distinguishable non-visually. Alignment and background are not enough. Each message needs an accessible owner label ("You said", "Agent said") — visually hidden is fine.
- Scope badge: expose as part of the message's accessible name, not as an orphaned "re: Intro".
- Composer: real `<label>` (visually hidden) on the textarea; the hint line wired via `aria-describedby`. Send button needs `aria-label="Send message"` — a bare `↑` glyph is not a name.
- Autoscroll must be suppressed when focus is inside an expanded pill or the clarification panel.
- Starter buttons and chips are real `<button>`s already — keep that. Chips are a *set*; consider grouping with `role="group"` and an `aria-label` naming what they answer.
- Header mark and agent name are currently buttons that do something discarded. If they become decorative, they must stop being buttons.
- Honor `prefers-reduced-motion` for the thinking dots.

---

## 6. States

| Scope | States |
|---|---|
| Thread | empty, populated, working, scrolled-away-from-bottom |
| Composer region | text input / clarification panel / slash palette open |
| Composer input | idle, focused (`:focus-within` blue), multiline-grown, at max height (scrolls) |
| Send button | idle, hover. **Missing: disabled on empty input** — production should add it |
| Assistant message | plain, with scope badge, with pills, with chips, any combination |
| Session status | idle, working, N open, ready to push, created |

---

## Prototype-only — do not port

- **Fake agent parsing and response logic.** `extract()`, `command()`, `apply()`, the `looksLikeNotes = text.split(/\s+/).length > 18` heuristic, and every regex that pretends to understand user text (`/upholster|included|12[,.]?000|fabric/`, etc.). All agent intelligence is server-owned. The frontend renders turns; it never decides what a turn means.
- The **hardcoded sample notes** constant (North & Pine / walnut chairs / 12,000 SEK) and the `STEPS` array.
- **Fake timers** — every `this.later(...)` delay (200 / 600 / 800 / 2400 / 8000 / 16000ms) that simulates thinking, drafting, or background progress.
- The **thinking-label state machine** (`thinking`, `thinkingLabel` set locally by whichever fake handler fired). The *visual vocabulary* survives; the label must come from server-reported activity.
- **Session history panel** and its `archive` / `PAST_SESSIONS` data (Volvo, Klarna, Sundqvist rows with "Yesterday, 16:42"-style timestamps and `prop_archived` ids). Session history/persistence is **not V1 behavior**. The clock button and the history list should not ship in V1.
- The specific **slash command set** — `/new`, `/draft`, `/history`, `/pushed`, and the `/proposals` `/analytics` `/library` `/settings` destinations. `/draft` loads mock notes; `/history` opens the non-V1 panel; `/pushed` filters mock data; the destinations are fake routes.
- `focusInput()` and any `document.getElementById` / DOM-query focus or scroll trick.
- The giant single `this.state` object holding thread, draft, answers, UI flags, and pane width together.
- `this.props.showDiffs` as a demo toggle for whether diff pills render.

---

## Open design questions

1. **What are the header mark and agent name for**, now that the rail is gone? Options: inert branding; an agent-settings entry; a session-scope switcher. Currently they are live buttons wired to a discarded feature.
2. **Does the slash palette ship in V1?** If yes, what is the real command set? The prototype's is entirely prototype-only.
3. **Autoscroll boundary:** what distance from the bottom counts as "the user is following"? 80px is a suggestion, not measured.
4. Should agent turns animate in (`fadeUp`) or appear instantly? The keyframe exists unused.
5. Should the send button be disabled on empty input, or always enabled?
6. The status note and the tab dot can theoretically disagree. Which is authoritative for the *active* session — the note, or the tab?
