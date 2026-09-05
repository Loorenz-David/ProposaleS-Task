# 01 — Visual System

Design language extracted from `Proposal Agent.dc.html`. All hex values below were read from the prototype source unless marked **approximate**.

---

## 1. Design truth

### 1.1 Surface hierarchy (dark app)

| Token role | Value | Where it appears |
|---|---|---|
| App background | `#0b0b0c` | `html`, `body`, root flex container, and inset input wells |
| Agent pane | `#0e0f10` | left pane background; also the resize handle at rest |
| Tab strip | `#08090a` | session tab strip band only (darkest surface) |
| Card / raised panel | `#141517` | proposal cards, line-item card, composer, clarification panel, slash palette, interaction pills |
| Control (quiet) | `#17181a` | starter buttons, chips, unselected clarification options, scope badge, filter pill |
| Control (hover / popover) | `#1a1b1e` | popovers ("Ask the agent about …"), list-row hover, session-history row hover |
| Control (strong) | `#1f2023` | user message bubble, **active tab**, list-row icon tile, "Push anyway" button, rail hover |
| Resize active tint | `#1f2b40` | resize handle while hovered or dragging |

Rule: surfaces get *lighter* as they get more interactive, not darker. The tab strip is the one exception — it recedes below the pane it belongs to.

### 1.2 Border hierarchy

| Role | Value | Use |
|---|---|---|
| Structural hairline | `#1c1d20` | pane/strip separators, rail edge, horizontal rules |
| Card internal divider | `#1e1f22` | rows inside cards, panel section separators |
| Card outer border | `#232427` | proposal/stat/line-item cards |
| Control border | `#26282c` | composer, chips, inputs, quiet buttons |
| Control border (raised) | `#2f3135` | user bubble, clarification options, stepper buttons |
| Dashed / optional | `#2a2b2f`, `#2f3135` | "+ New session", "Other answer…" |
| Elevated popover border | `#3a3c41` | popovers, slash palette, clarification panel, active tab edge |
| Focus / selected | `#3b82f6` | any focused input, hovered pill, selected option |

Six border steps is more than the design needs. **Recommendation for production:** collapse to four (`hairline`, `divider`, `control`, `elevated`) and map `#1e1f22 → divider`, `#232427 + #26282c → control`, `#2f3135 + #3a3c41 → elevated`.

### 1.3 Text hierarchy

| Role | Value | Notes |
|---|---|---|
| Primary / heading | `#f5f5f6` | page titles, field values, input text |
| Bubble ink | `#f0f0f2` | user message text, clarification question text |
| Body (assistant prose) | `#e4e4e7` | assistant message body |
| Body (controls) | `#dcdde0` | pill labels, chips, option labels |
| Secondary strong | `#c9cbd1` | "Push anyway" label, secondary CTA on success |
| Secondary | `#a1a3a9` | session status note, "Discard", destination values |
| Muted | `#8b8d93` | metadata, sublines, empty-state prose, inactive tab label |
| Muted (panel label) | `#9a9ca2` | clarification panel eyebrow, "Other answer…" |
| Quiet | `#7c7e84` | field labels, item detail, skip links |
| Quietest / mono meta | `#6b6d73` | mono counters, placeholders, close glyphs |
| Nearly invisible | `#5b5d63`, `#3a3c41` | composer hint, idle dot, resting `✦` ask glyph |

### 1.4 Accent and status colors

| Role | Value | Meaning |
|---|---|---|
| Accent / primary action | `#3b82f6` | send, create, focus ring, unread badge, links |
| Accent hover | `#5596ff` (button), `#7aa9ff` (link/text) | |
| Accent ink on dark | `#7aa9ff` | "working" dot, "Answer below", active step dot, mono slash |
| Accent wash | `#1b2740` | selected option background, action pill icon, blue badge |
| Accent wash (alt) | `#16202e` | thought pill icon |
| Positive | `#7ddba0` | ready/created dot, diff "to" value, "Updated" flag, ✓ |
| Positive (bright) | `#4ade80` | success checkmark glyph only |
| Positive wash | `#12261a` (badge), `#12291b` + border `#235133` (success medallion) | |
| Attention | `#e0a94a` | "Needs you" dot, "Missing" / "Needs price" / "Assumed" flags, unpriced note |
| Attention wash | `#241d10` | ask pill icon |
| Neutral badge | `#26282c` bg / `#9a9ca2` or `#c9cbd1` ink | "Draft", "Abandoned" |

### 1.5 Diff colors

| Part | Value |
|---|---|
| Field name | `#7c7e84` |
| Old value | `#7f6060` + `line-through` |
| Arrow `→` | `#5b5d63` |
| New value | `#7ddba0`, weight 600 |

The old value is *desaturated red-brown*, not red. Keep it — it reads as "retired", not "error".

### 1.6 Typography

- **UI face:** Plus Jakarta Sans, weights 400 / 500 / 600 / 700 / 800. Fallback `system-ui, sans-serif`.
- **Mono face:** IBM Plex Mono, weights 400 / 500. Used *only* for machine metadata: tab/session counters, phase label, step marks, pill meta, proposal id, option marks, slash commands.
- `-webkit-font-smoothing: antialiased` on the root.

Observed size ladder (px, exact from source):

| Size | Weight | Use |
|---|---|---|
| 36 | 800 | client-preview grand total |
| 26 | 800 | client-preview hero title |
| 24 | 800 | page title, stat value, success headline |
| 20 | 800 | fields-view total |
| 19 | 800 / 600 | preview section headings; page subtitle |
| 16 | 700 | list section title |
| 15.5 / 15 | 700 / 600 | "Creating in Proposales"; empty-state lead; send glyph |
| 14.5 | 700 / 500 | list-row title, success card title, preview body/items |
| 14 | 600 / 500 | assistant + user message text, field values, item names, question text, inputs |
| 13.5 | 700 / 600 | CTA labels, card headings, "Total" label, empty-state prose |
| 13 | 600 / 500 | clarification option labels, pill sub-rows, popover input, "Discard" |
| 12.5 | 600 / 500 | pill label, chips, field labels, item detail, tab-bar buttons, session note |
| 12 | 600 | tab title, skip links, "Answer below", flags region |
| 11.5 | 700 / 600 | panel eyebrow, badges, field eyebrow, sublines |
| 11 | 600 / 400 | composer hint, popover label, "Sessions" eyebrow |
| 10.5 | 600 | provenance flags ("Assumed", "Needs price", "Updated") |
| 10 | 400 | mono meta, counters, phase label |
| 9.5 | 700 | unread badge count |

Line heights: `1.45` (question text, item detail), `1.5` (field value, composer, hint), `1.55` (user bubble, success prose, empty-state lead), `1.6` (assistant body, empty-state secondary), `1.65` (client-preview intro).

Letter spacing: `-0.02em` on 24px+ display type; `.04em`–`.05em` uppercase on mono/eyebrow labels.

`text-wrap: pretty` is applied to essentially every prose block. Preserve it.

### 1.7 Radii

| Value | Use |
|---|---|
| `50%` | status dots, unread-free close buttons, avatar tiles, spinner, success medallion |
| `99px` | pills, chips, badges, step-progress bars |
| `5px` / `7px` | inline-edit hover surface; inline edit input, tab-bar segment, app mark |
| `8px` | popover input, stepper buttons, skip/answer buttons, history icon |
| `9px` | option buttons, starters, send button, secondary buttons, stat/segment control |
| `10px` | primary CTAs, session-history rows, success card thumbnail |
| `11px` | popovers |
| `12px` | composer, user bubble, palette, clarification panel, list rows |
| `14px` | large content cards, client-preview document frame |
| `9px 9px 0 0` | session tab (top corners only) |

### 1.8 Shadows

| Use | Value |
|---|---|
| Popover | `0 18px 40px rgba(0,0,0,.55)` |
| Slash palette | `0 -10px 30px rgba(0,0,0,.4)` |
| Clarification panel | `0 -12px 34px rgba(0,0,0,.45)` |
| Nav rail (prototype-only) | `16px 0 40px rgba(0,0,0,.45)` |
| Active tab | `0 -1px 0 #26282c inset, 1px 0 0 #26282c inset, -1px 0 0 #26282c inset` — an *inset* three-sided border, not a drop shadow |

Upward shadows on composer-anchored surfaces are deliberate: they read as rising from the input.

### 1.9 Spacing rhythm

Base unit is loosely 4px but the prototype uses odd values freely (7, 9, 11, 13, 17). The recurring pattern:

- Pane gutter: `18px` horizontal (agent), `28px` (main pane)
- Card row padding: `13px 16px`
- Card section padding: `15px 16px` (totals), `17px` (success card)
- Control padding: `9–11px` vertical / `11–15px` horizontal
- Thread message gap: `16px`
- Pill stack gap: `6px`; chip gap `8px`; option gap `7px`
- Nested pill payload: `margin-left: 17px`, `padding-left: 14px`, `border-left: 1px solid #26282c`

**Production recommendation:** round to a 4px scale (4/8/12/16/24/28) except where noted as identity-bearing (the 17/14 pill indent, the 30px tab height).

### 1.10 Motion

Three keyframes exist:

```
@keyframes pulseDot { 0%,100% { opacity:.25; transform:translateY(0) } 50% { opacity:1; transform:translateY(-2px) } }
@keyframes fadeUp   { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
@keyframes spin     { to { transform:rotate(360deg) } }
```

- **Thinking indicator:** three 6px dots, `pulseDot 1s infinite` with `.15s` / `.3s` stagger.
- **Working tab dot:** `pulseDot 1.1s infinite` — slightly slower than the thread indicator, so a background tab feels calmer than the focused one.
- **Creating spinner:** 38px ring, `border: 2px solid #26282c`, `border-top-color: #3b82f6`, `spin .8s linear infinite`.
- `fadeUp` is declared but unused in the current template. Either adopt it for thread-message entry (recommended) or drop it.

No CSS `transition` durations are declared anywhere — all hover changes are instantaneous. **Production recommendation:** add `transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease` to interactive surfaces. This is a design *improvement*, deliberately flagged rather than smuggled in.

### 1.11 Icon / glyph style

Glyphs are typographic characters, not an icon set: `✦` (agent mark / ask-agent), `✳` `?` `±` `↗` `▸` (pill kinds), `▾ ▸ → ↗` (affordances), `✕` (close), `↑` (send), `←` `→` (stepper), `✓` (confirmed), `●` `○` `≈` (option marks), `↓` (answer below), `·` (separator).

Two real SVG icons exist, both 24-viewBox / `stroke-width: 2` / `stroke-linecap: round`: the history clock (15×15) and the new-tab plus (14×14).

**Production recommendation:** replace glyph characters with a real icon set (stroke 1.5–2, 24 viewBox) for anything that is a *control* — close, send, stepper, new tab, affordance chevrons — because glyph metrics differ per platform and cannot be optically centered reliably. Keep the typographic marks for the *pill kind symbols* (`✳ ? ± ↗ ▸`); they are part of the vocabulary's character.

### 1.12 Light preview / document styling

See `08-client-preview.md`. Core values: surface `#fff`, ink `#111214`, body ink `#3f4147`, meta ink `#6b6d73`, rule `#ececef` and `#e4e4e7`, hero gradient `linear-gradient(160deg, #1d3b4a, #0f2733)`, content max-width `600px`.

---

## 2. Presentation structure

The visual system has four layers, and production should express them in this order:

1. **Surfaces** — the 8-step background ramp (§1.1)
2. **Ink** — the 11-step text ramp (§1.3)
3. **Semantics** — accent / positive / attention / neutral, each with an ink and a wash (§1.4)
4. **Objects** — pill, card, panel, popover, tab, badge, flag: each a fixed composition of the above

Do not let feature code choose raw hex values.

---

## 3. Interaction behavior (system-wide)

- Hover on any bordered control: border becomes `#3b82f6` and ink becomes `#fff`, **or** background steps one level lighter. Never both plus a transform.
- Focus on any text input: `border-color: #3b82f6`, `outline: none`. Containers use `:focus-within` to move the ring to the wrapper.
- Disabled/not-ready primary action: background `#1d1e21`, ink `#5b5d63`, cursor `default`.
- `::placeholder` is `#6b6d73` globally.
- `color-scheme: dark` is set on the date input so the native picker matches.

---

## 4. Visual specification notes

- The prototype has **no `:focus-visible` styling anywhere**. Every control relies on hover only. This is the single largest production gap in the visual system.
- Pixel values ending in `.5` (12.5px, 13.5px, 11.5px, 10.5px, 9.5px) are used heavily. They render fine but are hard to systematize — **approximate them to the nearest whole or half-step in a real type scale**.
- `14px` is the body size and `12.5px` the control size. That gap is deliberate: controls read as chrome, prose reads as content.

---

## 5. Accessibility requirements

**Contrast measured against its own background (approximate ratios):**

| Pair | Ratio | Verdict |
|---|---|---|
| `#f5f5f6` on `#0b0b0c` | ~19:1 | fine |
| `#e4e4e7` on `#0e0f10` | ~15:1 | fine |
| `#dcdde0` on `#141517` | ~13:1 | fine |
| `#a1a3a9` on `#0e0f10` | ~7.5:1 | fine |
| `#8b8d93` on `#0e0f10` | ~5.6:1 | passes body |
| `#7c7e84` on `#141517` | ~4.4:1 | **borderline — fails 4.5:1** |
| `#6b6d73` on `#141517` | ~3.4:1 | **fails** — used for mono meta, counters, placeholders |
| `#5b5d63` on `#0e0f10` | ~2.7:1 | **fails** — composer hint text |
| `#3a3c41` on `#141517` | ~1.5:1 | **fails badly** — the `✦` ask-agent trigger is nearly invisible at rest |
| `#e0a94a` on `#141517` | ~8:1 | fine |
| `#7ddba0` on `#141517` | ~9:1 | fine |
| `#3b82f6` on `#141517` | ~3.6:1 | fails as *text*; acceptable as a border/fill. White on `#3b82f6` is ~3.4:1 — **the primary button label fails 4.5:1** |

**Required production corrections:**

1. Lighten the muted ramp: `#6b6d73 → ~#84868c`, `#5b5d63 → ~#7c7e84` for any text the user must read.
2. The `✦` ask-agent affordance must not rest at `#3a3c41`. Give it `#7c7e84` at rest, or make it appear on row hover *and* be permanently reachable by keyboard with a visible focus ring.
3. Darken the primary button to ~`#2f6fe0` (or use `#0b0b0c` ink on `#3b82f6`) so the label clears 4.5:1.
4. Never use `#3b82f6` as text on a dark surface — use `#7aa9ff`, which the prototype already does for links and status ink.
5. Add `:focus-visible` rings globally: `2px` `#7aa9ff` with `2px` offset.
6. Honor `prefers-reduced-motion`: disable `pulseDot` (hold at full opacity), reduce the spinner to a static ring plus text, and drop `fadeUp`.
7. The status *dot* is the only carrier of session state on a tab. Color alone is insufficient — see `04-session-tabs.md`.

---

## 6. States

The system-level states any control must define: `idle`, `hover`, `focus-visible`, `active/pressed`, `selected`, `disabled`, `loading`. The prototype defines idle, hover, and a partial selected/disabled. Production must add focus-visible, pressed, and loading.

---

## Prototype-only — do not port

- The **hover-reveal navigation rail** (64px, `#000`, 14px edge hot-zones on both screen edges, pin toggle). This navigation model was discarded. Do not port the rail, the hot-zones, `railOpen`/`railPinned`, or the `panelInset` shift.
- `fadeUp` keyframe as dead code — adopt intentionally or delete.
- Inline hex literals scattered across the template (`style-hover="border-color:#3b82f6"` repeated dozens of times). The *values* are design truth; the *distribution mechanism* is not.
- Per-element `style-hover` strings as an authoring pattern.
- `#4ade80` existing alongside `#7ddba0` with no rule distinguishing them. Treat `#7ddba0` as the positive token and `#4ade80` as a one-off; production should pick one.

---

## Open design questions

1. Should the tab strip stay darker (`#08090a`) than the pane it belongs to, or align with the pane? It currently reads as a separate chrome layer, which is browser-like but slightly detaches the tabs from the agent.
2. Is the six-step border ramp intentional, or should it collapse to four? (Recommendation: collapse.)
3. Should hover transitions be instant (current) or eased at ~120ms? Instant feels tool-like; eased feels product-like.
4. `#7ddba0` vs `#4ade80` — which is the positive token?
5. Half-pixel type sizes: keep the exact prototype ladder, or snap to a clean scale? Snapping will shift roughly a dozen surfaces by 0.5px.
