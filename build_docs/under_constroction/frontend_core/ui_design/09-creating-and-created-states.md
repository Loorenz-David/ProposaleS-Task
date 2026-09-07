# 09 — Creating and Created States

The approval transition: the moment the user commits, the working state while it happens, and the confirmation afterwards.

---

## 1. Design truth

This is the product's one irreversible-feeling step, and the design's job is to make its scope unmistakable: **a draft is created in Proposales. Nothing is sent to the client.**

That message appears four times across the transition — in the empty state, in the readiness line, in the success headline and body, and in the agent's own thread message. That repetition is not redundancy; it is the product's core promise, and every instance is design truth.

The transition has three beats:

1. **Before** — the action is available, and its label and color reflect whether the draft is complete.
2. **During** — the right pane clears to a single centered working state. Nothing else is actionable.
3. **After** — a confirmation that names the artifact, shows its identifier, labels it "Draft", and offers exactly two next steps.

---

## 2. Presentation structure

```
Before        → Review header action  (see 07 §3.6)
During        → Creating state         (full-pane, centered)
                ├── Spinner
                ├── "Creating in Proposales"
                └── Progress line
After         → Created state          (centered column, max 520px)
                ├── Success medallion
                ├── Headline
                ├── Reassurance body
                ├── Proposal card
                │   ├── Thumbnail
                │   ├── Title
                │   ├── Identifier (mono)
                │   └── "Draft" badge
                └── Actions
                    ├── Open in Proposales (primary)
                    └── Draft another (secondary)
```

Both replace the review content entirely. The agent pane stays live throughout, and the thread receives a message at completion.

---

## 3. Interaction behavior

### 3.1 Before creation
- Action label and color depend on unresolved questions — "Push anyway" (grey `#1f2023` / `#c9cbd1`) vs. "Create in Proposales" (blue `#3b82f6` / `#fff`). See `07` §3.6.
- The button is **never disabled.** The user may always proceed; the design discourages rather than prevents.
- No confirmation step. Given the action creates a *draft* and sends nothing, that is defensible.

### 3.2 During creation
- The whole right pane becomes the working state. The review header, the toggle, Discard, and the action all disappear.
- **Re-entry is prevented structurally** — the button no longer exists — rather than by disabling it. That is robust, but it means the user cannot cancel either (§8).
- A progress line updates as the operation proceeds.
- The agent pane remains interactive: the user can switch sessions, read the thread, or start elsewhere while creation runs.

**Important:** because the agent pane stays live and sessions are independent, creation must be attributed to **the session that started it** and must survive the user switching tabs mid-flight. The prototype does this correctly in intent — it captures the owning session id at kick-off and applies every subsequent update to that session, not to whichever is focused. **That behavior is design truth.** The snapshot mechanism implementing it is not (see §7).

### 3.3 After creation
- Success state replaces the pane.
- The proposal identifier is shown in mono type — it is a machine reference the user may need to quote.
- A neutral grey "Draft" badge sits on the card. **Grey, not green** — green would read as "done and sent". Deliberate; preserve it.
- Two actions: **Open in Proposales** (white on dark, the strongest button in the design) and **Draft another** (outlined secondary).
- The agent posts a thread message naming the identifier and restating that nothing was sent, with a link pill to the proposal.
- The session's status becomes `created` and its tab dot goes `#7ddba0` (see `04` §3.3).

---

## 4. Visual specification

### 4.1 Creating state
- Container: `flex: 1; display:flex; align-items:center; justify-content:center; padding: 40px`, centered text
- Spinner: `38×38`, `border-radius: 50%`, `border: 2px solid #26282c`, `border-top-color: #3b82f6`, `animation: spin .8s linear infinite`, `margin: 0 auto 18px`
- Headline: 15.5px/700 — "Creating in Proposales"
- Progress line: 13.5px, `#8b8d93`

Deliberately small and quiet — a 15.5px headline for a full-pane state. The operation is routine, not momentous. Keep that restraint.

### 4.2 Created state
- Container: `padding: 40px 28px`, centered; inner column `width: 100%; max-width: 520px`, centered text
- Medallion: `44×44`, `border-radius: 50%`, background `#12291b`, border `1px solid #235133`, ink `#4ade80`, glyph `✓` at 19px, `margin: 0 auto 18px`
- Headline: 24px/800, `letter-spacing: -0.02em`, `margin-bottom: 9px`, `text-wrap: pretty` — **"Draft created in Proposales"**
- Body: 14.5px, `#8b8d93`, line-height 1.55, `margin-bottom: 24px`, `text-wrap: pretty` — **"It is a draft, not sent. Add imagery and attachments in the portal, then send when you are ready."**
- Proposal card: `#141517`, border `1px solid #232427`, radius `14px`, padding `17px`, `text-align: left`, `margin-bottom: 18px`; inner row `align-items: center; gap: 14px`
  - Thumbnail: `52×52`, `flex: 0 0 52px`, radius `10px`, `background: linear-gradient(160deg, #1d3b4a, #0f2733)` — the same gradient as the client-preview hero, standing in for a document thumbnail
  - Title: 14.5px/700, `margin-bottom: 4px`, `text-wrap: pretty`
  - Identifier: 12px, `#8b8d93`, IBM Plex Mono
  - Badge: 11.5px/700, padding `6px 11px`, radius `99px`, background `#26282c`, ink `#c9cbd1` — "Draft"
- Actions: `display:flex; gap:10px; justify-content:center; flex-wrap:wrap`
  - Primary: background `#fff`, ink `#0b0b0c`, 13.5px/700, padding `11px 17px`, radius `10px`; hover `#e8e8ea` — "Open in Proposales"
  - Secondary: transparent, border `1px solid #26282c`, ink `#c9cbd1`, 13.5px/600, padding `11px 17px`, radius `10px`; hover ink `#fff` — "Draft another"

The white primary button appears in exactly two places in the whole design: "Draft from notes" (start) and "Open in Proposales" (finish). It marks the beginning and end of the loop. Preserve that.

### 4.3 Error state

**None exists in the prototype.** Creation always succeeds. Production must design one, and the vocabulary is already available:

- Same centered layout as the created state
- Medallion inverted to attention: background approximately `#241d10`, border approximately `#5a4520`, ink `#e0a94a`, glyph `!` — **approximate; these values are inferred from the existing attention tokens, not read from the prototype**
- Headline 24px/800 naming what failed — "Could not create the draft"
- Body 14.5px `#8b8d93` with the reason, and a restatement that nothing was sent
- Actions: **Try again** (primary blue) and **Back to review** (secondary outlined)
- The draft must be fully intact and returnable-to. A failed creation must never lose work
- The agent should post a thread message reporting the failure
- Session status should return to `ready`, not `created`

This is the largest gap in this surface. See §8.

---

## 5. Accessibility requirements

- Creating state: `role="status"` with `aria-live="polite"` on the container. Announce "Creating draft in Proposales" once, then each progress step once — **debounced**, not on a loop.
- Spinner must be `aria-hidden`; the text carries the meaning. Under `prefers-reduced-motion` replace the spin with a static ring (or a determinate bar if real progress becomes available).
- `aria-busy="true"` on the pane during creation.
- **Focus management is required and entirely absent.** The pane's contents are replaced twice. On entering the creating state, move focus to the status heading. On entering the created state, move focus to the success headline (`tabindex="-1"`, focus, do not add it to the tab order permanently). Otherwise a keyboard user is left on a button that no longer exists and lands on `body`.
- Created state: announce the outcome via `role="status"` — "Draft created in Proposales. Not sent to the client."
- The `✓` medallion must be `aria-hidden`; the headline carries the outcome.
- The "Draft" badge must be part of the card's accessible name, not a loose `<div>`.
- The identifier is mono and machine-shaped; give it a label ("Proposal ID") and make it selectable. Consider a copy button.
- The gradient thumbnail is decorative — `aria-hidden`.
- "Open in Proposales" leaves the app. If it opens a new tab, say so in the accessible name.
- Error state (when built) must use `role="alert"`, move focus to the error heading, and keep "Back to review" as the first tab stop.
- Contrast: `#4ade80` on `#12291b` ~7:1, fine. `#c9cbd1` on `#26282c` ~8:1, fine. `#8b8d93` on `#0b0b0c` ~6:1, fine. `#0b0b0c` on `#fff` ~19:1, fine. **This surface is the design's cleanest for contrast** — no corrections needed.

---

## 6. States

| State | Presentation |
|---|---|
| Ready (all resolved) | blue "Create in Proposales" |
| Ready (open questions) | grey "Push anyway" |
| Creating | full-pane spinner, "Creating in Proposales", progress line; no actionable controls |
| Created | medallion, headline, reassurance, proposal card with "Draft" badge, two actions |
| Created (session) | tab dot `#7ddba0`, phase label `created`, thread message with link pill |
| Error | **not designed — see §4.3** |
| Creating, user switched away | creation continues, attributed to its own session; the origin tab reflects it |
| Re-entry attempt | structurally impossible during creation (the button is gone) |
| Cancel | **not available — see §8** |

---

## Prototype-only — do not port

- **The fake timed progress sequence.** Three hardcoded strings fired on setTimeout, then success at 2400ms:
  ```
  0ms    "Creating proposal record"
  800ms  "Attaching products & services"
  1600ms "Applying template and language"
  2400ms → success
  ```
  **The visual vocabulary is design truth** — a single centered spinner with one line of changing text describing the current step. **The timing, the step count, and the step strings are prototype-only.** Production must show real reported progress, or a single indeterminate state with one honest label. Do not fabricate steps to fill time, and do not reproduce a fixed sequence that is unrelated to what the server is doing.
- **`createdId: "prop_8f2ac91"`** — a hardcoded identifier, plus `prop_71d0c42`, `prop_6ba33e0`, and `prop_archived` in the session fixtures.
- **`proposalId: "prop_8f2ac91 · created via API"`** — a display string with an editorial suffix baked in. The identifier and any provenance annotation are separate values.
- The pre-written success thread message and its link pills ("prop_8f2ac91" → fake view, "Analytics" → fake route).
- `view: "pushing" | "success"` as string flags inside the giant state object, and `pushStep` as a client-set string.
- **`sset(owner, …)` and the snapshot machinery** used to route delayed updates to the originating session. The *guarantee* — creation belongs to its session and survives tab switching — is design truth. The snapshot mechanism is not.
- `goList` wired to "Open in Proposales" (it returns to the fake internal list rather than leaving for the portal).
- `startNew()` wired to "Draft another" (it loads the hardcoded sample notes).
- The absence of an error path being treated as a specification. It is a gap, not a decision.
- The 52×52 gradient thumbnail as a real proposal preview.

---

## Open design questions

1. **The error state must be designed.** §4.3 proposes a vocabulary but the values are approximate and the copy is a placeholder. Needs: which failures are distinguishable to the user (network, auth, validation rejected by Proposales, partial creation), and whether any are retryable in place.
2. **Can creation be cancelled?** Currently no — the user has no way out once it starts. If the operation can take more than a couple of seconds, it probably needs one.
3. **Real progress or one honest label?** If the backend cannot report steps, a single "Creating draft in Proposales…" is more honest than invented milestones. Recommendation: one label unless real steps exist.
4. **Does "Open in Proposales" leave the app?** New tab, same tab, or an in-app view? This determines whether the user's session context survives the click.
5. **What happens to the session after creation?** It shows `created`. Should it stay open indefinitely, offer to close, or become read-only?
6. **Can a created draft be revised from here?** If the user spots a problem after creation, is there a path back, or must they work in the portal?
7. **Should "Push anyway" confirm?** Creating a knowingly-incomplete draft is low-risk (nothing is sent), which argues no. But it is the one place the design lets the user proceed against its own advice.
8. **Partial-creation failure** — if the record is created but products fail to attach, what does the user see? This is the hardest error case and the vocabulary does not cover it.
