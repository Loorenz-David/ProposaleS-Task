# 04 — Session Tabs

Parallel agent sessions, presented as a browser-like tab strip at the top of the agent pane.

---

## 1. Design truth

The user runs **several proposal sessions at once**. Each is an independent conversation with its own draft, its own open questions, and its own progress. Sessions advance while unfocused, so the strip has to answer, at a glance and without being read: *which of my sessions needs me?*

That is why the tab is a browser tab and not a list item — it is spatially stable, directly clickable, reorderable, and closable, and it carries a live status dot rather than a static label.

### Critical product decision to preserve

> **Switching sessions may reset disposable UI mechanics, but it must NOT destroy the current page-lifetime proposal workflow for that in-memory session.**

Concretely: composer draft text, which pills are expanded, an open popover, a half-typed clarification answer — these may be lost on switch. The session's **thread, draft, open questions, answered questions, and created state** must survive for as long as the page lives. A user who switches away mid-review and comes back must find their draft exactly as it was.

---

## 2. Presentation structure

```
Session Tab Strip          (row, align-items: flex-end)
├── Scroll region          (flex: 1, overflow-x: auto, gap 1px)
│   └── Session Tab ×N
│       ├── Status dot
│       ├── Title          (ellipsized)
│       ├── Unread badge   (inactive + unread only)
│       └── Close button   (active only)
└── New session button     (pinned, does not scroll)
```

Strip container: `padding: 0 8px 0 12px`, `align-items: flex-end`, `gap: 2px`, background `#08090a`, `border-bottom: 1px solid #1c1d20`.

---

## 3. Visual specification

### 3.1 Tab anatomy

| Property | Value |
|---|---|
| Sizing | `flex: 1 1 132px`, `min-width: 112px`, `max-width: 200px` |
| Height | `30px`, `box-sizing: border-box` |
| Radius | `9px 9px 0 0` — top corners only |
| Padding | `0 4px 0 9px` (tighter right, for the close button) |
| Layout | `display:flex; align-items:center; gap:7px` |
| Strip gap | `1px` between tabs |
| Status dot | `7px` circle, `flex: 0 0 7px` |
| Title | 12px/600, `nowrap`, `overflow:hidden`, `text-overflow:ellipsis`, `flex: 1; min-width: 0` |
| Unread badge | `min-width: 15px`, `height: 15px`, `padding: 0 4px`, radius `99px`, bg `#3b82f6`, ink `#fff`, 9.5px/700, centered |
| Close button | `17×17`, radius `50%`, transparent, ink `#6b6d73`, glyph `✕` at 10px; hover bg `#2f3135`, ink `#fff` |

Tabs flex: they share available width down to 112px, then the strip scrolls.

### 3.2 Active vs. inactive

| | Active | Inactive |
|---|---|---|
| Background | `#1f2023` | `transparent` |
| Title ink | `#f5f5f6` | `#8b8d93` |
| Edge | inset three-sided border: `0 -1px 0 #26282c inset, 1px 0 0 #26282c inset, -1px 0 0 #26282c inset` | none |
| Hover background | `#0e0f10` | `#131416` |
| Close button | shown | hidden |

The active tab's hover background (`#0e0f10`) is *darker* than its rest state (`#1f2023`) — it dips toward the agent pane's color, reinforcing that the active tab is continuous with the pane below. Unusual but deliberate; keep it.

**Only the active tab shows a close button.** Inactive tabs cannot be closed directly, which prevents mis-clicks while scanning but also means closing a background session takes two clicks. See §8.

### 3.3 Status presentation

| Status | Label (tooltip) | Dot | Animated |
|---|---|---|---|
| working | "Working" | `#7aa9ff` | `pulseDot 1.1s infinite` |
| questions | "Needs you" | `#e0a94a` | no |
| ready | "Ready to push" | `#7ddba0` | no |
| created | "Created" | `#7ddba0` | no |
| empty | "Empty" | `#3a3c41` | no |
| idle | "Open" | `#5b5d63` | no |

Tooltip format: `<title> · <status label> · <note>`, e.g. "Restaurant week — Sundbyberg · Working · Pricing the three seatings".

Note that `ready` and `created` share a dot color and differ only in tooltip text. That is a real ambiguity — see §8.

### 3.4 Unread / needs-attention

- Unread count badge appears **only on inactive tabs with unread > 0**. Focusing a tab clears it.
- Blue badge + amber dot are different axes: the dot is *session state*, the badge is *unseen output volume*.
- A background session that finishes work typically ends up: amber or green dot + blue count badge. Both must be legible simultaneously at 112px width, which is tight — dot (7) + gap (7) + badge (~19) + close area leaves roughly 60px for the title.

### 3.5 New session button

- `26×26`, `flex: 0 0 26px`, `margin-bottom: 2px` (sits slightly above the strip baseline), radius `50%`, transparent, ink `#8b8d93`, 14×14 plus SVG; hover ink `#fff` on bg `#1a1b1e`
- Pinned outside the scroll region — always reachable
- `title="New parallel session"`

---

## 4. Interaction behavior

### 4.1 Selection
- Click anywhere on the tab (except the close button) activates it. The close button stops propagation.
- On switch: the outgoing session's disposable UI is dropped; its workflow state is retained (see §1). Unread clears on the incoming tab. Thinking indicators reset to the incoming session's actual state.

### 4.2 Reorder (drag)
- `draggable="true"` on each tab.
- `dragstart` marks the dragged tab; it drops to `opacity: 0.45`.
- `dragover` on another tab moves the dragged tab to that index immediately (live reorder — no insertion-line preview, the tabs themselves shuffle).
- `dragover` on the strip background is accepted so the drag does not get rejected in the gaps.
- `dragend` / `drop` clears the drag state.
- Reorder is purely presentational: it changes strip order, nothing else.

### 4.3 Close
- Closing a **non-active** tab: remove it, active session unchanged.
- Closing the **active** tab: activate the neighbour at the same index, clamped to the end of the list.
- Closing the **last remaining** tab: immediately open a fresh empty session. The strip is never empty.
- There is **no confirmation**, and no undo. Closing a tab with an unpushed draft silently discards page-lifetime work. **Production must add a guard** — a confirm step, or an undo affordance — for any session with an in-progress draft. This is a design correction, flagged deliberately.

### 4.4 Overflow
- The scroll region is `overflow-x: auto`; tabs shrink to 112px first, then scroll.
- **Guarantee: the active tab is always scrolled into view.** After any change that can move it (switch, reorder, close, new session, strip resize), the active tab must be brought fully inside the visible strip.
  - The prototype does this by querying `#session-tab-strip` for `[data-active="1"]` on every update and adjusting `scrollLeft`. The *guarantee* is design truth; **the DOM-query implementation is not** — use a ref.
  - Never use `scrollIntoView`; compute and set `scrollLeft` so the tab sits fully within the region with a small margin.
- No overflow chevrons and no "N more" menu today. At many sessions the strip becomes a horizontal scroller with no indication that more exist. See §8.

### 4.5 Keyboard (almost entirely missing — production requirement)

The prototype supports **no keyboard interaction on the strip at all**. Required:

- Strip is a tablist: `role="tablist"`, `aria-orientation="horizontal"`, `aria-label="Agent sessions"`.
- Each tab: `role="tab"`, `aria-selected`, `tabindex="0"` on the active tab and `-1` on the rest (roving tabindex).
- `ArrowLeft` / `ArrowRight` move focus between tabs; `Home` / `End` jump to first/last.
- Activation follows focus (immediate switch) — appropriate here since switching is cheap and non-destructive. If session switching becomes expensive, move to manual activation with `Enter`/`Space`.
- `Delete` or `Backspace` on a focused tab closes it (subject to the §4.3 guard).
- **Keyboard reordering:** `Ctrl/Cmd + Shift + ArrowLeft/Right` moves the focused tab one position and keeps focus on it, announcing the new position ("Moved to position 2 of 4"). Drag-only reordering is not accessible.
- `Ctrl/Cmd + Alt + ArrowLeft/Right` (or `Cmd+1..9`) as a global session-switch shortcut is desirable but optional for V1.
- Focus must be visible on tabs — currently there is no focus style anywhere.
- After closing a tab, move focus to the newly active tab, not to `body`.

---

## 5. Accessibility requirements

- The strip is a tablist; the agent pane below is the corresponding tabpanel (`role="tabpanel"`, `aria-labelledby` the active tab).
- **Status must not be color-only.** The dot carries six meanings by hue alone. Required: each tab's accessible name includes its status text — "Restaurant week — Sundbyberg, working, Pricing the three seatings, 3 unread". Consider also differentiating the dot by shape or fill (ring for idle, filled for active work) for colorblind users.
- Unread badge: expose as text ("3 unread messages"), not a bare number.
- Close button: `aria-label="Close session <title>"`, and it must be reachable without hover.
- Background status changes should be announced politely and **debounced** — a session moving working → ready may fire several updates; announce the settled state, not each step. Never announce on a loop.
- The pulsing dot must be `aria-hidden` and must stop under `prefers-reduced-motion`.
- 30px tab height and 17px close target are below the 44px comfortable minimum. Desktop-mouse context makes this defensible for the tab; the **17px close button should get a larger hit area** (≥ 24px) via padding.
- `title` attributes are the only labels today. Tooltips are not accessible names — add real labels.

---

## 6. States

| State | Presentation |
|---|---|
| Active | `#1f2023`, `#f5f5f6` title, inset edge, close button visible |
| Inactive | transparent, `#8b8d93` title, no close |
| Hover (active) | bg `#0e0f10` |
| Hover (inactive) | bg `#131416` |
| Focused | **undefined — production must define** |
| Working | `#7aa9ff` pulsing dot |
| Needs you | `#e0a94a` dot |
| Ready | `#7ddba0` dot |
| Created | `#7ddba0` dot (same as ready) |
| Empty | `#3a3c41` dot |
| Idle | `#5b5d63` dot |
| Unread | blue count badge, inactive only |
| Dragging | `opacity: 0.45` |
| Drop target | no distinct state — tabs reorder live |
| Overflowing | strip scrolls; active tab forced into view |

---

## Prototype-only — do not port

- `SESSION_KEYS` / `BLANK_SNAP` / `seedSnap` / `loadSnap` / `sset` — the **snapshot architecture**. Switching sessions in the prototype serializes ~24 state keys into an archive entry and rehydrates them on return. Production keys live session runtime by session id; it does not snapshot UI state. The *product guarantee* in §1 survives; this mechanism does not.
- The `archive` array and `PAST_SESSIONS` seed data (Volvo / Klarna / Sundqvist, with `when: "Yesterday, 16:42"` and `pushed: true`). **Session history and persistence are not V1 behavior.**
- `BG_SESSION` and the `bump()` timer chain that walks a background tab through working → questions → ready at 8s and 16s with pre-written agent messages. **Fake progress sequences.** The visual vocabulary of a background session advancing is design truth; the scripted timeline is not.
- `sessionSeq` as a module-level mutable counter for id generation.
- `document.querySelector('#session-tab-strip [data-active="1"]')` in `revealActiveTab()` called from `componentDidUpdate`. Keep the guarantee, drop the DOM query.
- `tabState` as an ad-hoc map of `{status, note, unread}` set by fake handlers. Status must be derived from real session state, and `unread` must count real unseen agent output.
- `sessionMeta` derived from archive lookups.
- The `STATUS` map being both a design token table and a runtime state enum. The *labels and colors* are design truth; the enum belongs to the domain contract.
- Treating `{status, note, unread}` as a domain contract shape. It is presentation input.

---

## Open design questions

1. **`ready` and `created` share a dot color** (`#7ddba0`) and differ only by tooltip. Should `created` be visually distinct (a filled check, a neutral grey dot, a different hue)? A created session is *done*; a ready one still needs the user.
2. **Should inactive tabs show a close button on hover?** Currently closing a background session requires activating it first.
3. **Overflow indication:** at 6+ sessions in a 392px pane the strip scrolls with no affordance. Add edge fades, chevrons, or an overflow menu?
4. **What is the maximum sensible session count?** Is there a cap, and what happens at it?
5. **Close guard:** confirm dialog, or close-plus-undo toast? Undo is less interruptive but needs somewhere to live.
6. Should tab titles be user-editable? They are currently derived and can be long and near-identical when ellipsized at 112px.
7. Should the strip stay at `#08090a`, darker than the pane? (Also raised in `01`.)
