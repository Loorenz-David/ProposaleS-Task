---
plan: plans/phase-02-workspace-shell.md
role: reviewer
round: 1
date: 2026-09-06
verdict: CHANGES_REQUESTED
actor: Claude Opus 5
---

# Phase 02 review round 1 — `CHANGES_REQUESTED`

## Opening

The shell itself is built correctly. The page is a Server Component composing one client
workspace root, the two landmarks are there and stay there, the divider is a real keyboard- and
pointer-operable separator, the clamp is the specification's arithmetic in the right order, the
idle state is honest, and every scope fence holds. What does not hold is the measurement: a large
share of this phase's tests cannot fail. The containment perimeter — the reason this phase had a
mandatory projection gate — matches its forbidden-word lists against a list of file names rather
than against any source code, so all four of its rows pass with a complete navigation stack and a
complete surface registry planted in the tree. Six of the fifteen narrow-width rows never set the
viewport they are named after. Two more guards pass while the defect they exist to catch is
present. Eight findings are blocking, eight are should-fix, five are notes; the fix round has one
list and every finding carries a correction clause.

## ⚠ OWNER DECISIONS REQUIRED (0)

Nothing needs you. Every finding below is an engineering correction against an authority that is
already ratified or already recorded; none of them re-opens a product decision.

## Gate check

| # | Check | Result |
|---|---|---|
| 1 | Intention ratified | **Pass** — `RATIFIED`, amended through owner decision 14, status unchanged |
| 2 | Master plan row 02 `IMPLEMENTED` | **Pass** |
| 3 | Plan header `IMPLEMENTED`, criteria `6` | **Pass** |
| 4 | Round outstanding | **Pass** — only `phase-02-projection-round-0` present in `handoffs/reviewer/` |
| 5 | Tree identity | **Pass with a stated deviation.** `HEAD` is `9e418c4` (the coordinator's consume commit), not the checkpoint `7bfa79e`. `git diff --name-status 7bfa79e..9e418c4` is exactly two documents — `plans/phase-02-workspace-shell.md` and the review prompt. **No source or test file differs from the checkpoint**, so the implementer's closing stamp is citable under the charter's tree-identity rule and was not re-run. Working tree clean at entry |

**Evidence discipline.** The implementer's closing stamp (unit 154/154, E2E 49/49,
typecheck/lint/build green) was **not** reproduced: reproducing it on a byte-identical source
tree is over-evidence and is a finding against the session. Zero L4 runs were taken. The entire
budget went to variation — eleven mutation probes at L1, none of them a shape the implementer's
ledger used. Every probe is listed in §"Mutation record" with its observed result.

---

## Findings

### Blocking

---

**B1 — C6(a) ships as a denylist where the plan requires an allowlist.** *(Confirmed, not newly
found — coordinator finding 1.)*

`src/features/proposal-preparation/components/workspace/workspace.test.tsx:92–101` and
`e2e/workspace.spec.ts:344–351`. The row's own words require "exactly the roles this state is
allowed to have … and no other role at all", and say why: "a denylist of forbidden nouns here
would prove only that its own list matches itself." What shipped is one heading assertion plus
five null checks over `list`, `navigation`, `link`, `status`, `alert`.

Re-confirmed cheaply (probe RV11): a statistics table, a button and an image planted in the idle
subtree left **all five unit C6 tests and the E2E C6(a) test green**. A statistics table is the
literal noun the criterion names.

*Authority:* plan C6(a); master plan §6.5A ("the instrument … is an allowlist, never a denylist";
"no later phase re-derives a denylist here"); charter rule 15.

**Correction:** replace both C6(a) instruments with an allowlist over the idle subtree's
accessible tree — enumerate every role present and assert the set equals exactly the roles this
state is permitted to have (`heading` plus its supporting static text, which carries no role), so
that any role not in that set fails. The row's required probe (C6(g)) must plant a construct that
is **not** a member of the instrument's own list; a `<ul>` is not an admissible probe for an
allowlist row.

---

**B2 — C5(a) and C5(b) match their denylists against file *paths*, never against source. Both
rows observe nothing whatsoever.**

`workspace.test.tsx:14–22` — `sourceFiles()` returns an array of **absolute file paths**.
`workspace.test.tsx:62` and `:68` then do `sourceFiles(...).join("\n")` and name the result
`source`, and every subsequent `expect(source).not.toMatch(...)` runs against a newline-joined
list of file names. No file is ever read.

Probe RV1 — `useRouter`, `usePathname`, `useSearchParams`, `next/link`, `history.pushState({},"","/x")`
and `window.location = "/y"` all planted in `src/app/page.tsx`: **4/4 C5 tests passed.**
Probe RV2 — a `surface-registry.ts` under `src/features/` exporting `surfaceRegistry`,
`SurfaceMap`, `createSurface`, `resolveSurface`, `SurfaceProvider` and the identifiers `plugin`
and `extension`: **4/4 C5 tests passed.**

This is the phase's most expensive defect. C5 is the reason phase 02 carried a mandatory
projection gate (plan header; master plan §7.2), and two of its four rows are inert.

*Authority:* plan C5(a), C5(b); intention §12A.23 "Forbidden, and closed for V1"; charter rule 15.

**Correction:** `sourceFiles()` must return the file **contents** (or the call sites must
`readFileSync` each path, as C5(d) at `:83–86` already correctly does) before any denylist runs
against it. Additionally, each source-scanning row must assert that its scan had a subject — that
the scanned text is non-empty and contains at least one token known to be present — so that a
future refactor of the collector cannot silently empty the corpus again. C5(a) and C5(b) each
gain a planted-defect probe: the criterion required probes only for (c) and (d), which is exactly
why (a) and (b) shipped blind.

---

**B3 — C4 condition 2 exempts the agent pane at every width in the test set, by precisely the
inference the plan forbade.**

`e2e/workspace.spec.ts:297–302`. The check reads `declared: getComputedStyle(element).overflowX`
and passes when `declared === "auto" || declared === "scroll"`. Two things are wrong and they
compound:

1. `getComputedStyle` returns a **computed** value, which is by definition inferred from the
   cascade, not a declaration. The plan's L9 requirement is verbatim: the exception is "recognised
   by that declaration, **never inferred** … so an incidental `overflow-y:auto` cannot swallow the
   rule".
2. CSS forces `overflow-x` to compute to `auto` whenever `overflow-y` is not `visible`. The agent
   pane (`agent-surface.tsx:5`) declares only `overflow-y-auto`. Measured on the running
   application at 1280, 1440, 1100 and 780: `asideOverflowX === "auto"` at every width.

So the agent pane is unconditionally exempt. Probe RV5 — a `<div style={{width: 4000}}>` planted
inside the agent pane, the exact defect condition 2 exists to catch: **C4(1440-2), C4(1100-2) and
C4(780-2) all passed.**

*Authority:* intention §12A.19 condition 2; plan C4 condition 2 and its L9 clause.

**Correction:** recognise the exception from the element's **declared** style, not its computed
one — read the authored class list / `element.style` / a `data-*` opt-in marker that a container
sets deliberately when it owns a horizontal scroll region, and treat every other element as
subject to the rule. A computed `overflow-x` of `auto` that the author never wrote must not
exempt anything. Re-run C4 condition 2 at all three widths against a planted overflowing child in
**each** pane and record both reds.

---

**B4 — C4 conditions 3 and 4 never set a viewport. All six rows run at Playwright's default
1280×720, a width that is not in `NARROW_WIDTH_TEST_SET`.**

`e2e/workspace.spec.ts:312–318` and `:320–331`. Both tests are inside the
`for (const width of NARROW_WIDTH_TEST_SET)` loop and both open with `await page.goto("/")` with
no `page.setViewportSize` — unlike conditions 1, 2 and 5, which all set it. The `width` variable
is consumed only by the test title.

`playwright.config.ts` selects `devices["Desktop Chrome"]`, whose viewport is 1280×720; measured
directly on the running application: `window.innerWidth = 1280` inside a test that sets nothing.
1280 is not a member of `NARROW_WIDTH_TEST_SET` (`[1440, 1100, 780]`).

The consequence is that six of C4's fifteen rows are three identical measurements at one
un-named width, and the phase has **no** evidence for keyboard reachability or text integrity at
780px — the V1 floor owner decision 14 was raised to fix.

*Authority:* intention §12A.19 ("at every width in a named test set"); plan C4 ("one row per
condition per width — fifteen rows, not three"); charter rule 2.

**Correction:** add `await page.setViewportSize({ width, height: 800 })` before `page.goto("/")`
in both tests, so all fifteen rows measure at the width their id names. Then re-run C4(f)'s named
mutation (remove the divider's `tabIndex`) and confirm condition 3 reddens at **each** of the
three widths independently, as C4(f) states.

---

**B5 — C4 condition 4 has no subject: nothing in this shell elides at any width in the set, so
the row is green by absence.**

`e2e/workspace.spec.ts:320–331` iterates `[data-elided]`. The only such element is the
`<span aria-label="Proposal agent workspace" data-elided class="… truncate">` at
`agent-surface.tsx:8–14`. Measured on the running application at 1280, 1440, 1100 **and** 780:
`clientWidth = 344`, `scrollWidth = 344`, `scrollWidth > clientWidth === false`. The text never
overflows, so `truncate` never truncates and the second half of the condition — "any elided text
keeps its full value in the accessible name" — is never exercised.

M6 reddened this row by rewriting the `aria-label` to a truncated string. That proves the
assertion compares two strings; it does not prove elision preserves a name, because no elision
occurs. This is charter rule 15's family stated from the other side: measuring a property of an
empty set proves nothing about the instrument.

Secondary: the check reads `node.getAttribute("aria-label")`, which is the attribute, not the
accessible name §12A.19 condition 4 names. (Chromium does expose this particular label — verified
with `toHaveAccessibleName` — so this half is a weakness, not a live defect.)

*Authority:* intention §12A.19 condition 4; plan C4 condition 4; charter rule 15.

**Correction:** the row must first assert its subject exists — at each width, at least one
`[data-elided]` element has `scrollWidth > clientWidth` — and only then assert that its full value
survives in the accessible name, read via the accessibility tree rather than the raw attribute.
If no product text in this shell genuinely elides at 780px, the honest outcome is to record
condition 4 as **unmeasurable in this phase** the way condition 1's permanent green is already
recorded, rather than to keep a green that means nothing. Planting a `data-elided` element that
exists only to give the test a subject is not the remedy.

---

**B6 — C1(f)'s browser twin is a guard that cannot fail, and it is the row F30's middle clause
needs.**

`e2e/workspace.spec.ts:185–201`. Two independent reasons:

1. `document.querySelector('[role="complementary"]')` (`:190`, `:195`) matches **nothing**. The
   agent pane is a bare `<aside aria-label="Proposal agent">` with an *implicit* role and no
   `role` attribute. Measured on the running document: `[role="complementary"]` → **0 nodes**,
   `aside` → 1 node. So `complementarySame` evaluates `null === null` → always `true`.
2. The identity comparison runs synchronously inside the same `page.evaluate` as the
   `dispatchEvent`, so it compares the tree before React has necessarily committed.

Probe RV7 — `key={width}` forced onto both `<AgentSurface>` and `<MainApplicationSurface>`, so
that every keyboard resize unmounts and remounts both landmarks, which is exactly the defect the
row exists to catch: **the jsdom twin (`workspace.test.tsx:44`) reddened; the browser twin
passed.** Lines `:187–188` also bind `region` and `main` and never use them.

The jsdom twin is therefore the working instrument and earns its place — see P6's adjudication.

*Authority:* intention §12A.23 (F30's "both are the same elements throughout"); plan C1(f);
charter rule 15.

**Correction:** select the landmark the way the rest of the file does (`page.getByRole(...)` /
`document.querySelector("aside")`, or add an explicit `role="complementary"` and keep the selector),
assert the resize actually happened (`aria-valuenow` changed) before comparing identity, and take
the two node references across separate `page.evaluate` calls with the state change between them.
Then plant the remount and record the red — the row currently ships with no probe of its own.

---

**B7 — C2(b) does not measure the effective maximum at two viewports; it measures the
`ResizeObserver`'s latency, and it would pass at two identical widths.**

`e2e/workspace.spec.ts:213–221`. Measured settled values on the running application:

| Viewport | `aria-valuemax` immediately after load | after ~600ms (settled) |
|---|---|---|
| 1440 | `320` | **620** |
| 1100 | `320` | **620** |
| 780 | `320` | 320 |

The test reads `at1100` immediately after `goto`, before the observer has fired, so it captures
`320` — which is `getEffectiveDividerMax(0)`, the pre-measurement state, not the effective maximum
at 1100px. It then waits (via `toHaveAttribute`) at 1440 and gets `620`, and concludes the two
differ.

The criterion requires "two viewport widths whose effective maxima differ". **1100 and 1440 have
the same effective maximum, 620** — the maximum only starts moving below 1080px
(`AGENT_PANE_MAX_PX + MAIN_PANE_MIN_PX`). A correctly written test on these two widths would fail.

*Authority:* plan C2(b); intention §12A.19 "Divider width" (re-clamped on viewport change);
charter rule 2.

**Correction:** pick two widths whose effective maxima genuinely differ under the named constants
— derive them from `AGENT_PANE_MAX_PX + MAIN_PANE_MIN_PX` rather than typing literals — wait for
the settled value at each (poll until it stops equalling the pre-observer value), and assert each
against `getEffectiveDividerMax(width)`. C2(b) also needs a named mutation, since it currently has
none and passed in its broken form.

---

**B8 — C2(d) and C2(f) claim "exactly once" and count nothing.**

`e2e/workspace.spec.ts:266–267` asserts the same text twice in succession; `:282` asserts it once.
`toHaveText` is a state assertion — the live region holds one constant string
(`proposal-workspace.tsx:41`, which always sets the identical literal), so once the string is
present no assertion downstream can distinguish one announcement from any number of them.

Probe RV8 — `reset()` mutated to call `onAnnouncement()` **three times**: **C2(d) and C2(f) both
passed.**
Probe RV9 — an announcement added to every `ArrowLeft` keyboard step, so the divider announces on
ordinary resizing: **C2(d) passed**, including its "a drag announces nothing" half, which only
ever observes a pointer drag and only because the string never changes.

*Authority:* plan C2(d) ("announces politely, exactly once"), C2(f) ("announces politely exactly
once"); design 02 §5 ("do not announce every drag pixel"); charter rule 15.

**Correction:** count announcements rather than asserting text. Instrument the live region with a
`MutationObserver` installed before the interaction and assert the number of announcement events
is exactly 1 for a reset and exactly 0 for a drag and for every non-reset keyboard step. Both rows
then need a named mutation: announce twice on reset (C2(d) and C2(f) must redden) and announce on
an arrow step (C2(d)'s absence half must redden). Fixing S1 below is a precondition — a counting
instrument cannot work while the region's content is a constant.

### Should-fix

---

**S1 — Only the first divider reset in a page's life is ever announced. Every later reset is
silent to assistive technology.** *(Product defect, surfaced by B8's instrument.)*

`proposal-workspace.tsx:41` sets `announcement` to the same literal every time, and nothing ever
clears it. React re-renders with an identical text node, the DOM does not mutate, and a polite
live region announces only on mutation.

Measured on the running application with a `MutationObserver` on `[data-divider-announcement]`:
after the first `Enter` reset, **1** mutation; after an `ArrowLeft` and a second `Enter` reset,
still **1**. A user who resets the divider, adjusts it, and resets it again hears the confirmation
exactly once, for the rest of the page's lifetime.

*Authority:* design 02 §5 ("Announce the reset … politely"); intention §12A.17 (the divider-reset
row; "one deliberate act produces one announcement"); plan C2(d).

**Correction:** make each reset produce a distinct DOM mutation in the live region — clear the
region and re-set it, or carry a monotonically increasing key alongside the text — so that every
reset announces exactly once. Cover it with a row asserting that two consecutive resets produce
two announcements.

---

**S2 — C5(c) is stated as an allowlist and shipped as a denylist over one syntactic form.**

`workspace.test.tsx:77–79`. `expect(presentation).not.toMatch(/export type (?!MainSurfaceState\b)[A-Z]\w*/)`
catches only the `export type X` form. The criterion says the module "exports exactly the type
names master plan §6.3 assigns to it" — an allowlist over exports — and §12A.23 names the forbidden
construct as "a union, **enum, constant map**, or `switch`".

Probe RV3 — `export enum ApplicationSurface { ProposalPreparation, Dashboard }`,
`export interface SurfaceKind { kind: "proposal-preparation" | "dashboard" }`,
`export const SURFACE_KINDS = {…}`, **and** a fifth member `"dashboard"` added to
`MainSurfaceState`, all planted at once: **C5(c) passed.** M8 planted an `export type` union —
the single form the regex catches — which is why the round's own evidence missed this. Line `:79`
is also non-exact: it asserts the four members appear in sequence, not that they are the only
members.

*Authority:* plan C5(c); intention §12A.23; master plan §6.5A's allowlist rule.

**Correction:** enumerate the module's exported names (parse the export statements, or assert the
file matches an exact expected shape) and assert the set equals exactly `{MainSurfaceState}`,
covering `type`, `interface`, `enum`, `const` and re-export forms; and assert `MainSurfaceState`'s
member set equals exactly the four §12A.22 (A) rows, not that they occur in order. C5(e)'s probe
must plant a form outside the instrument's own syntax — an `enum` or a constant map, not a second
`export type`.

---

**S3 — C5(d)'s noun denylist was never implemented; only its `main` count shipped.**

`workspace.test.tsx:82–88` implements the exact-count half of the row. The criterion's second half
— "plus a denylist over file and exported-component names under `src/app/**` and `src/features/**`:
`Dashboard`, `Analytics`, `Statistics`, `ProductLibrary`, `Customers`, `Settings`, `ProposalList`,
`SessionHistory`, `Archive`" — is absent from the test file.

Probe RV4 — `src/features/dashboard-surface.tsx` exporting `Dashboard`, `ProposalList` and
`SessionHistory` (rendering `<div>`, no `<main>`): **C5(d) passed.** The recorded limit says a
second surface under a noun outside the list is caught only by the `main` count; it does not say
the list itself was never built. M9 planted a second `<main>`, exercising only the half that
shipped.

*Authority:* plan C5(d); intention §12A.23 fourth forbidden bullet.

**Correction:** implement the file-name and exported-component-name denylist as the row states,
over `src/app/**` and `src/features/**`, and keep the recorded limit accurate to what ships.

---

**S4 — the `main` landmark's accessible name is a projection of the state it presents, which
§12A.23 forbids — and C1(a) pins the coupling in place.**

`main-application-surface.tsx:8` sets `aria-labelledby="proposal-preparation-title"`, and that id
is defined at `proposal-preparation-idle-surface.tsx:5`, inside the state's own content.
`e2e/workspace.spec.ts:177` then asserts the `main` is named `"Prepare a proposal"` — the idle
heading's text.

§12A.23 is explicit: activating, creating, closing or reordering a session "changes neither
landmark's existence, role, **accessible name**, or identity". As shipped, the moment phase 14
makes the surface a function of the session record and swaps idle for `creating`/`created`/`review`,
the `main` either changes its accessible name or silently loses it when the id disappears. Phase 02
cannot observe this — it has one state — which is exactly why it is worth fixing while it is one
line.

*Authority:* intention §12A.23 (F30); plan C1 preamble ("both named").

**Correction:** give the `main` a stable accessible name the shell owns — an `aria-label` on the
landmark itself, or a shell-owned heading whose text does not vary with the presented state — and
change C1(a)'s assertion to that stable name so no later phase inherits the coupling.

---

**S5 — `flex-none` is production code whose only function is to make a named mutation bite, and
it is undeclared.**

`proposal-preparation-idle-surface.tsx:4`. The column is `flex-none w-full max-w-[840px]`. With
`w-full` the item's basis already equals the container, so nothing ever shrinks and `flex-none` is
a no-op for the shipped layout. It matters only under a mutation. M4's own ledger row says so:
"Initial probe was green because the flex item shrank; the condition was re-sited with `flex-none`."

Probe RV6 — the same forbidden construct (`w-[840px]`, a fixed pixel width on a content column,
which is §12A.19's "Forbidden" list verbatim) applied twice:
`flex-none` present → **C4(780-2) red**; `flex-none` removed → **C4(780-2) green**.

So C4(e)'s red is a property of one site that was shaped to produce it, not of the guard. Any
other content column in this shell with a fixed width would pass condition 2 silently. `flex-none`
appears in none of the ten delegated decisions and in no Review-log entry.

Compounding it: the `main` carries `overflow-x-hidden` (`main-application-surface.tsx:11`), so a
real overflow is clipped with no scrollbar — invisible to the user while remaining visible to
`scrollWidth`.

*Authority:* charter rule 15 (a mutation's red must be a property of the guard); plan task 4's
delegated-decision recording rule; intention §12A.19 "Forbidden".

**Correction:** make condition 2's instrument catch a fixed-width content column without depending
on a flex property added for the probe — measure every content column's `getBoundingClientRect().width`
against its pane's `clientWidth` across the subtree, not only the one `data-testid` column at
`workspace.spec.ts:304`. Then either remove `flex-none` or state in the Review log what layout
requirement it serves. Reconsider `overflow-x-hidden` on the `main`, or record it as a deliberate
choice with its consequence.

---

**S6 — five assertions from phase 01's approved evidence were dropped in the relocation, and one
enumeration was collapsed.**

Task 8 required the carried rows' **assertions** to stay unchanged while allowing their reaching
mechanism to change, with every change recorded. Comparing `e2e/workspace.spec.ts` against
`e2e/bootstrap.spec.ts` at `6fd8299`:

| Carried row | Dropped |
|---|---|
| C2(a) (`workspace.spec.ts:26`) | `await expect(probe).toBeFocused()` (orig. `:47–48`) — the assertion that the tab sequence actually reached the probe, dropped in the same change that took the sequence from one Tab to three |
| C3 (`:66`) | `expect(referenced).toEqual(expect.arrayContaining(caveatPropertiesStillReferenced))` (orig. `:117`) — the six §10.2 caveat properties are no longer asserted to still be referenced |
| C3 (`:66`) | the per-property enumeration: phase 01 generated **one test per referenced property** ("Enumerated, not sampled … so the count is never typed forward", orig. `:120–131`); it is now one test with `test.step` in a loop, where the first failing property aborts the remainder |
| C7(a) correction 2 (`:83`) | `expect(inkPropertyNames.length).toBeGreaterThan(0)` (orig. `:150`) — with it gone, an empty regex match makes `expect([]).not.toContain("#3a3c41")` pass vacuously |
| C7(a) correction 6, reduced-motion (`:121`) | `expect(animation.name).not.toBe("none")` (orig. `:217`) — the guard against a duration of 0 that comes from `animation: none` rather than from the reduced-motion treatment |
| C7(a) correction 6, no-preference (`:134`) | the same assertion (orig. `:240`), plus the explicit `test.use({ contextOptions: { reducedMotion: "no-preference" } })` (orig. `:224`), now relying on the runner default |

The Review log records only the tab-count change, and describes it as leaving "its measured
assertion … unchanged", which is not accurate for C2(a).

The `theme.test.ts` retirement, by contrast, is **exactly correct**: the diff removes precisely the
`describe("C6(a)/(c): …")` block and nothing else, and the bindings it shared with the `C4(e)`
block above it remain in use.

*Authority:* plan task 8 and projection L18; charter rule 2 (enumerate, never sample); charter
rule 15 (correction 2's dropped subject guard).

**Correction:** restore all six dropped assertions verbatim from `bootstrap.spec.ts` at `6fd8299`,
including C3's one-test-per-property enumeration, and record in the Review log every remaining
mechanism change with the assertion it preserves.

---

**S7 — two tests share the id `C1(d)`.** *(Confirmed — coordinator finding 2.)*

`e2e/workspace.spec.ts:148` (the carried phase-01 document-title test, inherited evidence
belonging to no phase-02 row) and `:157` (the phase-02 skip-link test) carry the same label. The
coverage map's both-ways property and any `-g "C1(d)"` selection are both broken.

**Correction:** the carried document-title test keeps its phase-01 identity and is labelled as
inherited evidence, not `C1(d)`; `C1(d)` names only the skip-link row. Re-derive the coverage map
after the rename.

---

**S8 — the handoff's lint diagnosis is false and reached the owner layer.** *(Confirmed —
coordinator finding 3.)*

The handoff's Evidence section and its owner layer both state that `npm run lint` requires a
transient `test-results/` directory. The coordinator ran `npm run lint` with `test-results/`
absent and it passed; nothing in `eslint.config.mjs` or `package.json` references that path. Not
re-run here — the tree is unchanged and re-running it would be over-evidence.

**Correction:** strike the claim from the handoff's Evidence section and its owner layer. If a
lint failure genuinely occurred at baseline, state what it actually was or record it as
undiagnosed; do not carry an unverified repository claim into an owner-facing layer.

### Notes

**N1 — C6(e) carries a dead assertion.** `workspace.test.tsx:132`:
`expect(within(idle).queryAllByLabelText(/.*/)).toBeDefined()` — `queryAll*` returns an array,
which is always defined, so the line can never fail. The sibling assertion at `:133–136` is sound
(it checks the idle root itself **and** its descendants, which is what M10 reddened) and hides
nothing. Delete the dead line; it is untraced surface that reads as coverage. *(Probe P7.)*

**N2 — §12A.23 bullet 5, the reviewed-not-tested item: my judgement is that the boundary is
justified, with one reservation.** `MainApplicationSurface` owns the single `main` landmark, has
exactly one real consumer (`ProposalWorkspace`), is not a registry, factory, provider or extension
point, and carries no speculative infrastructure. Its existence is the landmark boundary the shell
needs, not an abstraction introduced because decision 11 named the surface generically. I agree
with the implementer's judgement on the component.

The reservation is the `state` prop. It is accepted, never branched on, and written out as
`data-surface-state` — an attribute **no test in the repository asserts** (verified by grep across
`src` and `e2e`). It exists to give `MainSurfaceState` a consumer so the type is not dead
scaffolding, which is a defensible reading of charter rule 4 and was declared as delegated
decision 3. It is nonetheless a seam wired one phase ahead of the behaviour that needs it. Route
to phase 14: either the attribute earns a row there, or it is removed and `MainSurfaceState`'s
consumer arrives with the session record.

**N3 — three design 02 deviations are undeclared.** No grip bar (§4: "centered 2px × 26px bar,
radius 2px" — the shipped `<span>` at `workspace-divider.tsx:97` is the 6px seam, not a grip); no
hover treatment (§6 lists Hover as a state; only `data-[resizing=true]` is implemented); and
`overflow-x-hidden` added to the main pane, which §4 does not specify. The hit area is correct —
`w-3` is 12px, meeting §4's "≥ 12px" while the inner `w-[6px]` keeps the visible seam. The omitted
`title` **was** declared (delegated decision 6). None of these is a criterion; record them, or
route them to the design-delta register.

**N4 — the divider exposes an invalid ARIA value range on first paint at every viewport.**
Measured immediately after load: `aria-valuenow="392"`, `aria-valuemin="320"`,
`aria-valuemax="320"` — `valuenow` exceeds `valuemax` until the `ResizeObserver` fires, because
`use-divider-width.ts:24` returns the unclamped requested width while `getEffectiveDividerMax(0)`
returns `AGENT_PANE_MIN_PX`. C2(a) (`workspace.spec.ts:208–210`) asserts only that the attributes
exist, so it cannot see this. Small window, real state; worth closing when B7 is fixed since both
live in the same seam.

**N5 — C3(e) does not assert what its row says.** The row is "the width is asserted against the
named constants' contract, never their literals"; the shipped test
(`use-divider-width.test.ts:39–43`) asserts orderings among the constants themselves. Rows (a)–(d)
do satisfy the row's actual intent by construction. The row as written is a property of the *other
rows*, which no single test can hold — a lesson for the plan rather than a defect in the code.

---

## The ten named probes, each adjudicated

| # | Verdict | Basis |
|---|---|---|
| **P1** | **Confirmed → B3** | `declared` is `getComputedStyle().overflowX`, which CSS forces to `auto` whenever `overflow-y` is not `visible`. Measured `auto` on the agent pane at all four widths tested. Probe RV5: a 4000px block inside the agent pane left all three condition-2 rows green |
| **P2** | **Confirmed → S5** | `flex-none` is a no-op for the shipped layout (the column is `w-full`, so its basis already equals the container) and matters only under mutation. Probe RV6: identical fixed-width column, red with `flex-none`, green without it |
| **P3** | **Confirmed, and worse than stated → B8, S1** | One announcement is not counted. Probe RV8: three announcements per reset, C2(d) and C2(f) both green. Probe RV9: an announcement on every arrow step, C2(d) still green. And the underlying constant string means only the first reset ever announces at all |
| **P4** | **Confirmed, with a different root cause → B2** | The question was what the denylist catches; the answer is that it never sees source. `sourceFiles()` returns paths and `.join("\n")` makes a path list. Probe RV1: the full navigation stack planted in `page.tsx`, C5(a) green. The recorded limit is therefore not the shipped limit — the shipped limit is "everything" |
| **P5** | **Confirmed, same root cause → B2** | The over-/under-match question is moot: `plugin` and `extension` are matched against file names. Probe RV2: a registry exporting `surfaceRegistry`, `SurfaceMap`, `createSurface`, `resolveSurface`, `SurfaceProvider`, `plugin` and `extension` left C5(b) green. Were it reading source, the substring form would additionally over-match comments and identifiers such as `.extension` |
| **P6** | **Dismissed — the premise does not hold, and the browser twin is the broken one → B6** | The hypothesis was that a jsdom resize changes nothing because the container is `0`. It is wrong: `use-divider-width.ts:24` returns the **requested** width when `containerWidth === 0`, so `392 → 408` is a real state change and a real re-render. Probe RV7 (both landmarks force-remounted on width change) **reddened the jsdom twin and left the browser twin green**. The jsdom copy earns its place; the browser copy is the guard that cannot fail |
| **P7** | **Confirmed → N1** | `expect(queryAllByLabelText(/.*/)).toBeDefined()` can never fail. The sibling line is sound and hides nothing — it checks the idle root itself as well as its descendants, which is the strengthening M10 records |
| **P8** | **Confirmed → B5** | Nothing elides. Measured `scrollWidth === clientWidth === 344` on the only `[data-elided]` element at 1280, 1440, 1100 and 780. The condition is green by absence and M6's red proves only that two strings are compared |
| **P9** | **Dismissed — the implementation is right** | `main-application-surface.tsx:9` carries `tabIndex={-1}`, so the `main` is programmatically focusable and the skip link genuinely moves focus. Probe RV10: removing `tabIndex={-1}` **reddened** C1(e) (`toBeFocused` failed). The row passes because the code is correct, not because the harness is lenient |
| **P10** | **Confirmed → S6** | The reaching mechanism changed as permitted, but six assertions were dropped across four carried rows and C3's per-property enumeration was collapsed into one test. The `theme.test.ts` deletion, separately, is exactly the block the plan named and nothing else |

## What I verified correct

Recorded so the fix round and the re-review do not re-spend effort here.

- **Task 1, the client boundary.** `src/app/page.tsx` carries no `"use client"`; the directive is
  on `proposal-workspace.tsx:1` and nowhere above it. C1(c) reads both files correctly.
- **Task 3's contract resolution, as implemented.** The divider is a project-owned separator:
  `role="separator"`, `aria-orientation="vertical"`, `aria-label="Resize agent panel"`,
  `aria-valuenow`/`min`/`max`, `tabIndex={0}`, pointer events with guarded `setPointerCapture`,
  `touch-none`. It reproduces no native control, so contract 12's prohibition is not weakened and
  contract 05 §7's click-handler rule is not engaged. Contract 15 §5's "when none exists" clause
  governs, as the plan resolved. The hit area is 12px (`w-3`) over a 6px visible seam, meeting
  design 02 §4's "≥ 12px". Root-scoped `select-none` during drag is present
  (`proposal-workspace.tsx:32`), per design 02 §5.
- **Task 4, the clamp.** `getEffectiveDividerMax` and `clampDividerWidth` are pure functions of
  `(requested, containerWidth)`, exported and separately testable; the hook takes the width as an
  argument; `vitest.setup.ts` was not touched and no `ResizeObserver` stub was added. The ordering
  is design 02 §3.2's — verified by reading (`Math.max(AGENT_PANE_MIN_PX, …)` is the outer
  operation) and by M3's recorded red. C3(a)–(d) assert against constants, never literals.
- **Task 8's deletion half.** The `theme.test.ts` diff removes exactly the
  `describe("C6(a)/(c): …")` block and nothing else.
- **Task 9's README patch.** All four statements the plan named are corrected, and the
  Proposales-adapter statement (§11.3 follow-up 14) now reads "is documented in
  `src/lib/proposales/README.md`" with a working link. The status paragraph, the "Current scope"
  bullets, the `src/app/` tree entry, the `src/features/proposal-preparation` sentence and the
  Playwright bullet are all true of the shipped tree. Contract 14 §1 satisfied.
- **Every scope fence.** The checkpoint touches exactly the nineteen declared paths.
  `src/components/ui/` is empty; `theme.css`, `package.json`, `package-lock.json`,
  `vitest.setup.ts` and all four config files are untouched; no `transition`, `duration-`,
  `ease-`, `localStorage`, `sessionStorage`, `document.cookie`, `useRouter` or `next/link` appears
  anywhere in `src/features` or `src/app` outside the denylist regexes themselves. No route, no
  router, no persistence of the width.
- **The idle surface against design 10 §7.** A heading and one sentence. Nothing from the excluded
  list — no fake analytics strip, no product library, no list view, no `DESTS`, no session-history
  panel. The marker is a marker; no visual treatment was invented (master plan §11.2 delta 8
  stands as reported).
- **C6(b), C6(c), C6(d)** hold in both twins, and C6(e)'s real assertion is sound.
- **C5(d)'s count half** works, as M9 shows.
- **P9's subject:** the skip link's label, target and focus-only treatment are implemented as
  delegated, and C1(d)/(e) both measure real behaviour.

## Mutation record

Every probe below was applied, run, and reverted. **`git diff HEAD -- src e2e README.md` is empty
at close**, verified after the last probe; no source or test file differs from the checkpoint by
one byte.

| ID | Site (probe file) | Mutation | Command | Observed |
|---|---|---|---|---|
| RV1 | `src/app/page.tsx` | `useRouter`/`usePathname`/`useSearchParams`/`next/link` imports, `history.pushState`, `window.location =` | `npx vitest run …/workspace.test.tsx -t "C5"` | **4 passed** — C5(a) blind |
| RV2 | `src/features/proposal-preparation/surface-registry.ts` (created, deleted) | `surfaceRegistry`, `SurfaceMap`, `createSurface`, `resolveSurface`, `SurfaceProvider`, `plugin`, `extension` | same | **4 passed** — C5(b) blind |
| RV3 | `src/features/proposal-preparation/types/presentation.ts` | `export enum ApplicationSurface`, `export interface SurfaceKind`, `export const SURFACE_KINDS`, plus a fifth union member `"dashboard"` | same | **4 passed** — C5(c) partial |
| RV4 | `src/features/dashboard-surface.tsx` (created, deleted) | exports `Dashboard`, `ProposalList`, `SessionHistory`, no `<main>` | same | **4 passed** — C5(d) noun list absent |
| RV5 | `…/components/workspace/agent-surface.tsx` | a `<div style={{width: 4000}}>` inside the agent pane | `npx playwright test e2e/workspace.spec.ts -g "C4.*-2"` | **3 passed** — condition 2 exempts the agent pane |
| RV6a | `…/components/idle/proposal-preparation-idle-surface.tsx` | `flex-none w-[840px]` (M4's mutation, reproduced) | `npx playwright test … -g "C4.*780-2"` | **1 failed** (baseline reproduced) |
| RV6b | same | `w-[840px]` with `flex-none` removed | same | **1 passed** — the red belongs to `flex-none` |
| RV7 | `…/components/workspace/proposal-workspace.tsx` | `key={width}` on both `AgentSurface` and `MainApplicationSurface` (forced landmark remount) | `npx vitest run …/workspace.test.tsx -t "C1"` and `npx playwright test … -g "C1.f."` | **jsdom 1 failed / browser 1 passed** |
| RV8 | `…/components/workspace/workspace-divider.tsx` | `reset()` calls `onAnnouncement()` three times | `npx playwright test … -g "C2.d.\|C2.f."` | **2 passed** — "exactly once" counts nothing |
| RV9 | same | `onAnnouncement()` added to every `ArrowLeft` step | `npx playwright test … -g "C2.d."` | **1 passed** — the drag-silence half is blind too |
| RV10 | `…/components/workspace/main-application-surface.tsx` | `tabIndex={-1}` removed | `npx playwright test … -g "C1.e."` | **1 failed** — C1(e) is sound |
| RV11 | `…/components/idle/proposal-preparation-idle-surface.tsx` | a statistics `<table>`, a `<button>` and an `<img>` | `npx vitest run …/workspace.test.tsx -t "C6"` and `npx playwright test … -g "C6.a."` | **5 passed / 1 passed** — B1 re-confirmed |

**Measurement-only probes** (no production file touched): two temporary Playwright specs,
`e2e/__reviewer-probe.spec.ts` and `e2e/__reviewer-probe3.spec.ts`, created and **deleted**, used
to read computed `overflow-x` per pane, `[data-elided]` scroll vs client width, settled
`aria-valuenow`/`aria-valuemax` per viewport, the default viewport width, live-region mutation
counts, and `[role="complementary"]` selector cardinality. `test-results/` (gitignored) was
created by the Playwright runs and removed at close.

**No L4 run was taken, and none was authorized.** The implementer's closing stamp is cited under
the charter's tree-identity rule.

## Lessons for the plans

**To this phase plan (`plans/phase-02-workspace-shell.md`) — the one already known to be owed.**
The plan told C6(a) to be an allowlist in plain words, inside the criterion cell, and the round
shipped a denylist anyway. The instruction was in the wrong place twice over. It belonged
(1) in **task 7**, which is the task that builds instruments and which says only "a source-level
check with planted probes" — an implementer reads tasks to decide what to write and criteria to
decide what to assert; and (2) in the **probe row itself**: C6(g) says "add a statistics list to
the idle subtree, observe (a)'s allowlist redden", and a list is a member of any plausible
denylist, so the probe is satisfiable by a denylist. **The general form: a probe row for an
allowlist criterion must name a planted construct that no denylist would contain.** Had C6(g) read
"plant a construct that appears in no forbidden-noun list — a button, an image, a table", the
denylist could not have survived its own probe. The same correction applies to C5(e), whose two
probes (an `export type` union, a literal `<main>`) are each the one form its instrument catches.

**To this phase plan, second.** Four rows (C5(a), C5(b), C5(c), C5(d)) name an instrument and only
two of them require a probe. Every row whose instrument is a list needs one, and the plan's own
preamble says so for C5 while its probe row (e) covers two rows out of four. C2(b) likewise
carries no named mutation and shipped broken.

**To this phase plan, third.** C3(e) is written as a property of the other rows ("the width is
asserted against the named constants' contract") and cannot be discharged by a test of its own.
Rows of that shape belong in the criterion preamble as a constraint on the other rows, not as a
lettered row that an implementer must turn into an assertion.

**To the master plan §10.3A / §10.4 (process and environment).** Add: *a Playwright criterion
parameterised by viewport width must call `page.setViewportSize` in every parameterised test;
`playwright.config.ts` selects `devices["Desktop Chrome"]`, which pins 1280×720, and 1280 is not a
member of `NARROW_WIDTH_TEST_SET`.* Six rows in this phase silently measured at 1280 because the
loop variable reached only the test title. This is an environment fact no one had written down and
it cost a third of C4.

**To the master plan §6.5A (process).** The allowlist rule is currently scoped to the theme
layer's name set ("no later phase re-derives a denylist here"). Phase 02 re-derived a denylist
**four** times — C5(a), C5(b), C5(c), C6(a) — in a phase whose own plan quotes the rule. Promote it
to a standing rule over **every open-universe absence row in the project**, in the standing-rules
section (§9) rather than inside a theme-layer subsection, with the phase-01 and phase-02 instances
cited as what it cost.

**To the master plan §9 (standing rules), new.** *A source-scanning instrument asserts that its
scan had a subject.* Phase 01 had this guard in two places (`referenced.length > 0` with the
caveat-property list; `inkPropertyNames.length > 0`); phase 02 dropped both in the relocation and
independently shipped two scanners that read file names instead of file contents. A one-line
subject assertion would have caught B2 at authoring time.

**To the intention §12A.19 (semantics).** Condition 2's exception — "a container that **declares**
its own horizontal scroll" — has no decidable definition, and the obvious implementation is wrong
in a way that is invisible: CSS forces `overflow-x` to compute to `auto` whenever `overflow-y` is
not `visible`, so any pane that scrolls vertically exempts itself from the horizontal rule. The
section should say what "declares" means operationally — an authored declaration or an explicit
opt-in marker, never a computed value — because every future phase that adds a scrolling pane will
otherwise reproduce B3. This is a semantic gap in the invariant, not an implementation slip, which
is why it routes here and not to the plan.

**To the intention §12A.23 (semantics).** F30 requires each landmark's **accessible name** to be
invariant across session transitions, but the invariant is only observable once a second state
exists — phase 14. The result (S4) is that phase 02 shipped a `main` whose name is drawn from the
presented state's own heading, and phase 02's C1(a) pins that coupling as approved evidence. Add a
clause making the landmark's accessible name a property the shell owns, so that the phase which
creates the landmark can be held to it rather than the phase that first breaks it.

**To the intention §12A.19 (semantics), second.** Condition 4 ("elided text keeps its full value in
the accessible name") is unmeasurable in a shell where nothing elides, and phase 02 discovered this
only after shipping a green row. §12A.19 should state, as it already does for condition 1's
permanent green, that a condition with no subject is recorded as unmeasured rather than asserted —
and that planting a subject to satisfy it is not permitted.

## Write perimeter

Documents:

- `build_docs/under_constroction/frontend_core/master-plan.md` — **tracker row 02 only**
  (`IMPLEMENTED` → `REVIEWING` at entry → `CHANGES_REQUESTED` at verdict). No other row touched.
- `build_docs/under_constroction/frontend_core/plans/phase-02-workspace-shell.md` — Review log
  entry appended. No task, criterion, row, count or Note edited.
- this handoff file.

Code and tests: **none.** No fix was applied; every finding routes through the coordinator.

Probe files touched and reverted (listed separately from the above, per the charter): `src/app/page.tsx`,
`src/features/proposal-preparation/types/presentation.ts`,
`src/features/proposal-preparation/components/idle/proposal-preparation-idle-surface.tsx`,
`src/features/proposal-preparation/components/workspace/proposal-workspace.tsx`,
`src/features/proposal-preparation/components/workspace/workspace-divider.tsx`,
`src/features/proposal-preparation/components/workspace/agent-surface.tsx`,
`src/features/proposal-preparation/components/workspace/main-application-surface.tsx`.
Created and deleted: `src/features/proposal-preparation/surface-registry.ts`,
`src/features/dashboard-surface.tsx`, `e2e/__reviewer-probe.spec.ts`,
`e2e/__reviewer-probe3.spec.ts`. Tool state: `test-results/` (gitignored) created by Playwright
and removed.

**What I ran:** eleven mutation probes and two measurement specs, all at L1
(`npx vitest run <path> -t "<name>"`, `npx playwright test <file> -g "<name>"`), plus
`git show`/`git diff` against `6fd8299` and `7bfa79e` for the perimeter and the carried-evidence
comparison.
**What I did not run:** the L4 stamp (`npm test`, `npm run test:e2e`, `npm run typecheck`,
`npm run lint`, `npm run build`) — the source tree is byte-identical to the implementer's
checkpoint, so its stamp is citable and reproducing it would be over-evidence. No L2, L3 or L4 run
was taken at any point.

There is no architecture graph in this worktree; **no graph delta**.
