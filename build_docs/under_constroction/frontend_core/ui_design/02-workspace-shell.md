# 02 — Workspace Shell

The top-level two-pane split: a persistent agent surface on the left, the application/review surface on the right.

---

## 1. Design truth

The workspace is **one screen, permanently split**. The agent is not a drawer, a modal, or a route — it is a fixed column that never leaves. The right pane changes what it shows; the left pane stays with the user.

That permanence is the product's central claim: the user works *with* the agent on the artifact, not by leaving the artifact to go talk to a bot.

The divider is user-controlled. Where the user sets it is a working preference (how much thinking vs. how much artifact), and the shell must respect it during the session.

---

## 2. Presentation structure

```
Workspace Shell            (flex row, height 100vh, overflow hidden)
├── Agent Pane             (fixed width, flex column, min-height 0)
├── Resize Handle          (6px, col-resize)
└── Main Pane              (flex: 1, min-width 0, own scroll)
```

Root container: `display:flex; height:100vh; overflow:hidden; background:#0b0b0c; color:#f5f5f6`.

Both panes own their own scrolling. The shell itself never scrolls.

---

## 3. Interaction behavior

### 3.1 Resizing

- **Trigger:** `mousedown` on the handle. `preventDefault()` to suppress text selection.
- **Tracking:** record `clientX` and current width at press; on `mousemove`, new width = `startWidth + (currentX - startX)`, clamped. Listeners are on `window`, removed on `mouseup`.
- **During drag:** the handle takes its active tint (`#1f2b40` background, `#3b82f6` right border) and a `resizing` flag is on.
- **Release:** listeners removed, flag cleared.
- **Double-click:** resets to the default width (392px).
- **Window resize:** width is re-clamped, so shrinking the browser cannot starve the main pane.

### 3.2 Clamping rule

```
AGENT_MIN = 320
AGENT_MAX = 620
MAIN_MIN  = 460

effectiveMax = max(AGENT_MIN, min(AGENT_MAX, viewportWidth - MAIN_MIN))
width        = round(clamp(requested, AGENT_MIN, effectiveMax))
```

Note the ordering: **the agent minimum wins over the main-pane minimum.** Below ~780px viewport the main pane is squeezed below 460px rather than the agent dropping under 320px. That is a deliberate priority (the agent must stay usable) but it is also the shell's weakest point — see §7.

### 3.3 Narrow-width resilience

Current behavior: the layout does not break, but below ~780px both panes are cramped and the main pane's 840px content column overflows into its own horizontal scroll region. There is no breakpoint, no stacking, no collapse.

**Design intent for production (V1 target, desktop-first):**

- ≥ 1100px — full split, resize fully available. This is the designed environment.
- 780–1100px — split holds; main pane content columns must reflow (`max-width`, not fixed `width`), not scroll sideways.
- < 780px — **out of scope for V1, but must not corrupt.** Acceptable minimum: the agent pane collapses to a toggleable overlay over the main pane, and the resize handle is hidden. Do not attempt a mobile-native layout.

---

## 4. Visual specification

### Agent pane
- Default width **392px**; min **320px**; max **620px**
- Background `#0e0f10`
- `display:flex; flex-direction:column; min-height:0` (the `min-height:0` is load-bearing — without it the thread's internal scroll breaks)
- No right border of its own; the handle provides the seam

### Resize handle
- Width **6px**, `flex: 0 0 6px`, `cursor: col-resize`
- Background `#0e0f10` at rest (continuous with the agent pane), `#1f2b40` when hovered or dragging
- `border-left: 1px solid #1c1d20`; `border-right: 1px solid #1c1d20` at rest → `#3b82f6` when active
- Grip: centered `2px × 26px` bar, radius `2px`. Color steps with state (approximate: `#26282c` rest → `#3b82f6` active)
- `position: relative; z-index: 15` so it sits above pane content
- `title="Drag to resize · double-click to reset"`

6px is below the 44px minimum target and even below the ~8px comfortable mouse target. **Production must widen the *hit area* to ≥ 12px** (transparent padding, or a pseudo-element overlay) while keeping the visible seam at 6px.

### Main pane
- `flex: 1; min-width: 0; overflow-y: auto; display:flex; flex-direction:column`
- Background: inherits app `#0b0b0c` — **no background of its own and no left border.** The tonal step from `#0e0f10` to `#0b0b0c` plus the handle's hairline is the entire separation. Keep it; it is quiet and correct.
- Header block: `padding: 22px 28px 18px 28px`, `display:flex; align-items:center; gap:14px; flex-wrap:wrap`
- Content columns: `padding: 0 28px 40px`, `max-width: 840px` (review) / `1080px` (list)

### Relationship between panes
The agent pane is *slightly lighter* than the main pane. This inverts the usual "content is brighter than chrome" convention and is intentional: it makes the agent read as a lit-up companion rather than a sidebar. Preserve it.

---

## 5. Accessibility requirements

The divider is currently a bare `<div>` with mouse handlers. Production must make it a real separator:

- `role="separator"`, `aria-orientation="vertical"`
- `aria-label="Resize agent panel"`
- `aria-valuenow` = current width in px, `aria-valuemin="320"`, `aria-valuemax` = the *effective* max (recompute on viewport change)
- `tabindex="0"`
- Keyboard: `ArrowLeft`/`ArrowRight` = ±16px; `Shift`+arrow = ±64px; `Home` = min; `End` = effective max; `Enter` or `Space` = reset to 392px (the keyboard equivalent of double-click)
- Visible `:focus-visible` ring on the handle
- Announce the reset ("Agent panel reset to default width") politely; do not announce every drag pixel
- Use pointer events (not mouse events) so pen and touch drags work
- Set `user-select: none` on the root while dragging, and restore it after

Landmarks: the two panes are distinct regions. Give the agent pane `role="complementary"` (or `<aside>`) with `aria-label="Proposal agent"`, and the main pane `<main>`. The prototype has no landmarks at all.

---

## 6. States

| State | Presentation |
|---|---|
| Idle | handle `#0e0f10`, right border `#1c1d20`, quiet grip |
| Hover | handle `#1f2b40`, right border `#3b82f6` |
| Focused (new) | visible focus ring on the handle |
| Dragging | same as hover, held for the drag duration; cursor `col-resize` document-wide |
| Clamped at min/max | no distinct visual today. **Recommendation:** brief resistance cue (grip goes `#e0a94a` for ~150ms, or no cue at all — decide) |
| Reset | snaps to 392px; consider a single 120ms eased transition on this one change only |

---

## Prototype-only — do not port

- **The hover navigation rail.** Two `position:fixed` 14px hot-zones (left and right screen edges, `z-index: 20`) that reveal a 64px black rail with destination glyphs and a pin toggle, shifting the agent pane right via `padding-left: 64px`. This navigation model was **discarded**. Do not port the hot-zones, the rail, `railOpen`, `railPinned`, `panelInset`, or `togglePin`.
- `window.addEventListener("mousemove" | "mouseup")` with closure-captured start values as the canonical drag implementation — the *behavior* is design truth, the implementation is not; use pointer capture.
- `window.innerWidth` read inline during render for clamping. Production should observe the container, not the window.
- `agentW` living in one giant component state object alongside unrelated session data.
- No persistence of the width. The prototype loses it on reload; whether production persists it is a product decision (see §8).

---

## Open design questions

1. **Should pane width persist across reloads?** Design view: yes, per user, per device — it is a working preference, not session data. But it is not currently specified and it crosses into a persistence decision that engineering owns.
2. Below ~780px, the clamp sacrifices the main pane to protect the agent. Is that the right priority, or should the agent give way first?
3. Should there be an explicit collapse/expand affordance for the agent pane (a chevron on the handle) in addition to dragging? Users cannot currently get the agent out of the way entirely.
4. Should the handle show a clamp-resistance cue at min/max, or fail silently?
