---
plan: 3
role: projection
round: 0
date: 2026-09-05
verdict: AMENDMENTS_REQUIRED
state: OWNER_DECISIONS_PENDING
actor: Claude Opus 5 (1M context), plan-projection doctrine
---

# Phase 3 projection (round 0) — Proposales adapter: transport, error translation, content read

## Opening summary (owner-readable)

I did the implementer's first hour of phase 3 on paper — no code written, no tests run — to
find the decisions the plan leaves someone to make silently at the keyboard. This is the
phase that builds the piece of software that talks to Proposales: it sends the requests,
reads the answers, and turns every possible Proposales failure into something the rest of
the application can understand without ever leaking a raw vendor response or your API key.

The plan is strong where it was written to be strong. Its table of Proposales failures is
genuinely complete — twelve conditions, twelve checks, no sampling — and I confirmed the
one date conversion it pins is arithmetically correct. But I found **twenty items the
artifacts do not actually decide**, and six of them are the kind that get resolved wrongly
in code and discovered two review rounds later. The worst: the plan tells the transport to
attach the company id to *every* outgoing read, and then requires one specific read to
carry no company id at all — those two instructions cannot both be obeyed. And the way the
plan says to build the error object is not possible with the error machinery phase 2
already shipped and this phase is not allowed to change; I verified that against the real
compiler rather than assuming it.

**Two things need you personally**, both below. Both are cases where Proposales can hand us
something the ratified rulebook does not cover, and the right answer is a judgement about
your business, not about code. Everything else is for the coordinator to fold into the plan
before the implementer starts.

Nothing is blocked while you decide except the start of phase 3.

---

## ⚠ OWNER DECISIONS REQUIRED (2)

### Card 1 — When Proposales answers with a broken page instead of an answer, do we try again?

**Question.** If Proposales replies "server error" but sends an HTML error page instead of a
proper answer, should we retry the read, or give up immediately?

**Story.** It is a Tuesday afternoon and you paste a client brief in. Proposales is having a
five-second wobble and its load balancer returns an HTML holding page carrying a 503. Our
rulebook says two things about that reply at once: "server problem — try again in a moment"
and "unreadable answer — do not try again". Whichever one the code checks first decides
whether your brief quietly recovers on the second attempt a third of a second later, or
comes back as a failed preparation you have to redo by hand. The same wobble, two completely
different afternoons.

**Branches.**
- **A — The status decides (recommended).** A 503 or 429 is retried even when the body is
  garbage; only a *successful* reply with an unreadable body is a hard failure. Ordinary
  vendor wobbles heal themselves and you never see them.
- **B — The body decides.** Any unreadable reply fails at once. Simpler to reason about, but
  it turns every routine Proposales hiccup into a failed turn you must redo.

**Recommendation.** A — retrying a 503 is exactly what the bounded retry was built for, and
B would silently switch it off in the most common real outage shape.

**On silence.** The gate holds: the implementer prompt is not compiled and phase 3 does not
start. Nothing is guessed.

**Trace.** Intention §17A.13 failure table (claims to be total, does not order status
against body shape); phase 3 task 2, criterion C1(k); ledger row D4.

### Card 2 — If one library item has a nonsense date, do we lose the whole catalogue?

**Question.** When a Proposales content item carries a creation date we cannot represent,
should the whole catalogue read fail, or should we drop that one item and carry on?

**Story.** Proposales sends each content item's creation date as a plain number, and its own
documentation does not say what unit that number is in or how large it may be. One migrated
or integration-imported item in your library comes back with a value outside the range a
date can hold. Today the code would crash on that item with an error nobody translated, and
the agent would have nothing to work with — not a poor proposal, no proposal at all, for
every brief, until that one row is fixed inside Proposales. Whether that is the right
outcome depends on whether you would rather be told loudly, or keep working with the rest of
the library.

**Branches.**
- **A — Fail the read, loudly (recommended).** The catalogue read reports a Proposales data
  problem naming the field. You find out immediately; nothing is silently missing.
- **B — Drop the bad item and continue.** The agent keeps working on the rest of the
  library, and an item quietly disappears from everything it can propose.

**Recommendation.** A — this application never invents or silently omits commercial content,
and a library item vanishing without a word is the harder failure to notice. It is also one
line of code rather than a new skip-and-warn path.

**On silence.** The gate holds: the code keeps its current unhandled-crash shape, which is
neither branch, so the phase does not start.

**Trace.** Intention §17A.16 (time), §17A.13 totality; master plan §11 follow-up register
row 9 (assigned to this session); phase 3 task 4, criterion C5(c); ledger row D5.

---

## Gate check

All five conditions in the session prompt hold; the phase is dispatchable.

| # | Condition | Result |
|---|---|---|
| 1 | Intention header `RATIFIED` | ✅ `RATIFIED` (2026-09-05, owner David, round-10 surface §21.3) |
| 2 | Master plan tracker row 2 `APPROVED` | ✅ `APPROVED` at checkpoint `2fc6a309` |
| 3 | Tracker row 3 `NOT_STARTED` | ✅ |
| 4 | `src/lib/proposales/` absent | ✅ `src/lib/` holds `env/`, `errors/`, `values/`, `logger.ts` only |
| 5 | Phase 3 declares 6 criteria / 35 rows / 4 mutations | ✅ **all three re-derived independently, all three correct** (below) |

**Worktree:** `git status --porcelain` empty at session open and at close; `HEAD` =
`f957f66b9a56d4814c4b6f51800a97d373febe47`. No concurrent frontend work was present in the
tree during this session, so there is nothing to record under the prompt's concurrency
clause.

**Baseline enumeration** (from `npx vitest list`, no suite run): **6 files / 59 tests**, all
in the `node` project — `env/server.test.ts` 17, `logger.test.ts` 11, `values/values.test.ts`
18, `errors/error-dto.test.ts` 6, `errors/app-error.test.ts` 3, `test/setup/node.test.ts` 4.
The `jsdom` project currently collects nothing.

## Independent lint (charter manifest, re-derived — not trusted from the plan)

| Property | Claim | My derivation | Verdict |
|---|---|---|---|
| Criteria | 6 | C1–C6 | ✅ |
| Rows | 35 | C1 12 + C2 5 + C3 5 + C4 5 + C5 4 + C6 4 = 35 | ✅ |
| Named mutations | 4 | MUT-03-1…4, each naming file · function · change · reddened row | ✅ closed set |
| Row addressability | — | every row lettered; every row a separate obligation | ✅ |
| File perimeter | "15 new files" | the sentence lists 15 paths, but the criteria require a **16th**, `fixtures/companies.json` (C6(b), C6(c)) | ❌ **D7** |
| Trace cells resolve | — | every cell resolves to a real section; two do not support what their row asserts (**D12**, **D11**) | ⚠ |
| Ledger both directions | — | §7.2 assigns phase 3 M3←C4, M5←C3, M6←C1/C2; all three served, no unserved claim | ✅ |
| ≤ 8 criteria | 6 | ✅ | ✅ |

**One thing the plan gets right that deserves saying, because it is rare.** C1 is *exactly*
total over intention §17A.13's twelve-condition table — one row per condition, both sources
of `bad_request` separately exercised, no sampling. Charter rule 2 is satisfied by
construction here, and I found nothing to add to that enumeration.

## Decision ledger

Twenty rows. Severity is my judgement of what it costs if the implementer decides it alone:
**HIGH** = the phase ships wrong or cannot be built as written; **MED** = a real gap that
costs a review round; **LOW** = worth one line in the plan.

| # | Decision the artifacts do not determine | What an implementer would most likely do | What the artifacts actually require | Class | Routing | Sev |
|---|---|---|---|---|---|---|
| **D1** | How `details.issues` reaches a `ProposalesError`. Task 1 requires `details.issues`; C1(c) and C1(l) assert it. Phase 2's `IntegrationErrorOptions` (shipped, `APPROVED`) declares **only** `{ system, status?, retryable, reason?, operation?, message?, cause }` and `IntegrationError` builds `details` from exactly those. `src/lib/errors/app-error.ts` is **not** in phase 3's file perimeter. | Widen `IntegrationErrorOptions` in `app-error.ts` — a silent edit to an APPROVED phase, outside the declared perimeter, that the reviewer will flag as an unallowed file. | A decided route. I probed both candidates against the real compiler (`tsc --noEmit`, TypeScript 6.0.3): reassigning `this.details` in the subclass **fails** with `TS2540: Cannot assign to 'details' because it is a read-only property`; mutating `(this.details as Record<string, unknown>).issues = …` **compiles** because `readonly` is shallow. So the phase *can* stay inside its perimeter, via a construction nobody chose. | plan gap | **Plan task 1** — state the route: either (a) extend the perimeter to `src/lib/errors/app-error.ts` and add `issues?: ErrorIssue[]` to `IntegrationErrorOptions` (cleanest; `ErrorIssue` already exists there), or (b) declare the post-`super` mutation explicitly. **Files expected to change** — updated to match. | **HIGH** |
| **D2** | `fromUpstream`'s declared signature is `{ status?, bodyText?, parsedBody?, operation, kind }`. It has **no parameter capable of carrying a `ZodError`**, yet `kind: "schema_mismatch"` must produce `details.issues` with the *response schema's* issue paths (C1(l)), and `getCompany`'s "configured company absent" failure (task 5, C6(c)) is a sixth construction that fits none of the five `kind` values. | Reach for the nearest thing in scope: stuff `parsedBody` with the ZodError, or bypass `fromUpstream` and `new ProposalesError(...)` inline in `client.ts` — which puts error translation in two modules and makes MUT-03-1 (an `errors.ts` mutation) unable to reach the schema-mismatch path. | Contract 07 §3's own example uses a distinct constructor: `ProposalesError.schemaMismatch("getProposal", parsed.error)`. Two of the phase's error shapes are simply not expressible through the signature the plan declares. | plan gap | **Plan task 1** — declare the full constructor surface: `fromUpstream` for transport/HTTP/body outcomes, plus named constructors for `schemaMismatch(operation, zodError)` and the `getCompany` `not_found_upstream` case (no status). Say which module owns each throw site. | **HIGH** |
| **D3** | Where `company_id` is attached. Task 2: "**Every request:** … `company_id` added to the query for GET". Task 5: `getCompany()` → `GET /v3/companies` with **no** query keys, and C6(a) asserts `query keys exactly []`. Contract 07 §2 assigns `company_id` injection to **`client.ts`**, not `http.ts`. Notes mention a "per-call placement flag" — query vs body, not present vs absent. | Follow task 2 (the transport adds it unconditionally), pass the criteria for C4(a)/C4(c), and watch C6(a) fail — then quietly special-case `/v3/companies` by path inside `http.ts`, which is a URL-shaped rule in the module that is supposed to know no endpoints. | Only one of the two instructions is satisfiable. The contract's answer (injection in `client.ts`, transport stays endpoint-agnostic) satisfies C4(a), C4(c) and C6(a) simultaneously and needs no special case. | plan gap | **Plan task 2 and task 5** — move `company_id` injection to `client.ts` per 07 §2, leaving `http.ts` with a `query` parameter it passes through verbatim; or make the transport's option explicitly three-valued (`companyId: "query" \| "body" \| "none"`). State which. | **HIGH** |
| **D4** | Precedence between a status row and the body-shape rows of §17A.13 when both fire: a **non-2xx whose body is not JSON** (an HTML 503 from a proxy or CDN — the most common real outage shape). `invalid_body` is `retryable: false`; `server_error` is `retryable: true`. C1(k) deliberately uses a **200** with `<html>`, so no row in the phase can observe the conflict. | Write the classifier body-first (`try { JSON.parse } catch { invalid_body }` before looking at the status) because that is the natural control flow — silently disabling retries on exactly the failures retries exist for. Every criterion stays green. | §17A.13 presents twelve *conditions*, not an order, while claiming to be "total over what the transport can produce". The product of (status, body shape) is genuinely undetermined. This is the phase's highest-consequence unwritten branch. | **intention gap** | **Coordinator → owner: see card 1.** Once answered, add the precedence sentence to intention §17A.13 (a mechanism-contract amendment, not a plan patch) and add one criterion row — 503 with an HTML body → the chosen reason and `retryable` — with a named mutation that reverses the branch order. | **HIGH** |
| **D5** | Whether `toContentItem` can produce an untranslatable failure or an invalid timestamp. **This is master plan §11 follow-up register row 9, assigned to this session; here is the answer.** Verified on the repository's own Node: `new Date(ms).toISOString()` **throws `RangeError`** for `\|ms\| > 8_640_000_000_000_000`; for `ms ≥ 253_402_300_800_000` it returns an expanded-year string (`+010000-01-01T00:00:00.000Z`) that **`isoTimestampSchema` rejects**; the same holds for `ms < -62_167_219_200_000` (`-000001-…`). `created_at` is `int64` (±9.22e18) with **no documented unit** (evidence §6, OpenAPI `ContentItem.created_at`), so both bands are inside the vendor's declared type. Task 4 states the conversion and nothing else; no schema bound, no mapper-output validation, no criterion row. | `createdAt: new Date(wire.created_at).toISOString()`. C5(c) passes. A `RangeError` — not a `ProposalesError` — escapes `src/lib/proposales/` on the bad input, breaking the module's total-translation guarantee, and an out-of-band-but-representable value ships a `createdAt` that violates the shared ISO contract with nothing checking it. | Phase 2 review N6 recorded that `isoTimestampSchema` validates **form, not calendar validity**, and this register row asked phase 3 to assess exactly this and to route any refinement "through the intention/plan rather than silently changing the shared value contract". The cheapest faithful resolution touches neither: bound `created_at` in `contentItemResponseSchema` so the failure becomes the existing ratified `schema_mismatch`. | plan gap (+ owner call on the failure *shape*) | **Coordinator → owner: see card 2.** Then **plan task 3** — `created_at: z.number().int().refine(within Date range)`; **plan task 4** — state that the mapper's input is already bounded; **plan criteria** — one C5 row per branch (in-range maps; out-of-range produces the chosen outcome) with a named mutation deleting the bound. Do **not** touch `src/lib/values/timestamp.ts`. | **HIGH** |
| **D6** | How many methods `ProposalesClient` declares and which are implemented. Read-first §1: "implement only the **three** read methods now; declare the interface with all **six**". Task 5: "export the interface with the **five** methods and implement a `Pick` of the **two**", factory returns `Pick<ProposalesClient, "listContent" \| "getContent">`. Master plan §6.4 registers **six** members. C6(a–d) require `getCompany()` **on the client**. | Follow task 5's concrete sentence — a two-method `Pick` — and then discover that C6 cannot be written against the returned type, and patch the `Pick` at the keyboard without saying so. | The interface is six (§6.4, the naming registry, authoritative). The phase implements **three**: `listContent`, `getContent`, `getCompany`. The factory's return type is `Pick<ProposalesClient, "getCompany" \| "listContent" \| "getContent">`. Three numbers in one plan, none matching the registry (charter manifest property 3: counts are derived, never typed). | plan gap | **Plan read-first §1 and task 5** — one consistent statement: interface = 6, implemented = 3, `Pick` names all three. No master-plan change. | **HIGH** |
| **D7** | `fixtures/companies.json` is named by C6(b) and needed by C6(c), and is **absent from "Files expected to change"**, whose sentence asserts "15 new files". | Create it silently. The phase then ships a file its declared perimeter denies, which a perimeter check reads as an undeclared write. | 16 files. Re-derived by counting the listed paths (15) against the paths the criteria require (16). | plan gap | **Plan "Files expected to change"** — add `fixtures/companies.json`, change 15 → 16. Also state whether C6(c) reuses this fixture with a different configured id (sufficient) or needs a second file. | MED |
| **D8** | The shape of `cause`. Task 1 says "raw body, headers, URL go only to `cause`". C2(d) asserts the sentinel is "present in `String(err.cause)`"; C2(b) asserts the over-cap original is "present in `err.cause`". | Attach a context object: `cause: { url, status, headers, body: bodyText }`. `String(cause)` is then `"[object Object]"` and **C2(d) fails on a correct implementation** — a wasted round on a non-defect. | Nothing in the plan constrains `cause`, but two rows do. Either the shape is pinned (e.g. `new Error(bodyText, { cause: context })`) or the rows must assert against a named field (`err.cause.body`). | plan gap | **Plan task 1** — pin the `cause` shape. **Plan criteria** — restate C2(b)/C2(d)'s cause assertions against that shape rather than `String(...)`. | MED |
| **D9** | What `PROPOSALES_READ_TOTAL_MS` bounds. Two readings, materially different: (a) a **retry-scheduling gate** — checked between attempts only; or (b) an **overall deadline** that also clamps each attempt's `AbortController`. Note the declared values make this visible: `TOTAL_MS` 8000 **<** `TIMEOUT_MS` 10000, so under reading (a) a single slow request always overshoots the "total" cap and the constant never binds on attempt 1. | Reading (a), because C3(d) is written for it ("`now` advances past `PROPOSALES_READ_TOTAL_MS` after the first failure → rejects after 1 call"). Fine — but nothing says so, and reading (b) also passes C3(d). | §17A.12 says "a total elapsed cap that leaves headroom inside the function duration limit", which reads like (b). §6.5's contract column for the three constants asserts no relation to `PROPOSALES_TIMEOUT_MS`. | plan gap | **Plan task 2** — state which reading. **Master plan §6.5** — add the intended relation to the contract column (e.g. `TOTAL_MS ≥ TIMEOUT_MS` under (b), or "bounds retry scheduling only" under (a)), so a later value change cannot silently break it. | MED |
| **D10** | The exact outcome of C3(c), C3(d), C3(e). All three say only "**rejects**" — no reason, no `retryable`, no status. C3(c)/(d) exhaust the retry budget on repeated 503s; C3(e) is a POST 503. | Assert `await expect(...).rejects.toThrow()`. All three pass against an implementation that throws the wrong reason, or an `InternalError`, or a bare `Error`. | Charter rule 2: "each case row asserts its one exact expected outcome"; a bare rejection is the disjunction the rule exists to forbid. Budget exhaustion in particular has no declared identity anywhere — is it the last upstream error (`server_error`, `retryable: true`) or a distinct outcome? | plan gap | **Plan criteria** — give C3(c), C3(d), C3(e) their exact expected `reason`/`retryable`/`status`. **Plan task 2** — state what a budget-exhausted read throws. | MED |
| **D11** | Whether `description` is optional on the wire. Task 3 lists the kept keys as `product_id, variation_id, title, description, created_at, images?` — only `images` marked optional — and OpenAPI marks `description` **required** on `ContentItem`. Task 4 and C5(d) require handling an item **without** `description`, mapping it to `{}`. | Follow task 3 (required), then find C5(d)'s fixture failing the parse with `schema_mismatch` instead of mapping to `{}`, and loosen the schema at the keyboard without recording it. | The two tasks disagree with each other and one of them disagrees with the vendor spec. The `{}` collapse itself is **contract-clean** — 06 §6's nullable-vs-optional row permits collapsing "in the mapper with a comment", which task 4 already requires — so only the schema's optionality is unresolved. | plan gap | **Plan task 3** — mark `description` optional in `contentItemResponseSchema` and record the deviation from the vendor's `required` list (a response key the spec promises but we do not depend on). One line. | MED |
| **D12** | `tax_mode` typed as an open `string` (task 3, `companyListResponseSchema`). OpenAPI types it as the closed enum `TaxMode` = `standard \| simplified \| tax-free \| none`. C6(b) **traces to "06 §6 (enum/id handling)"** — the section that governs precisely this. | `tax_mode: z.string()`, because §6.4's `CompanyInfo.taxMode: string` says so. | 06 §6 Enums offers exactly two permitted treatments for an inbound external enum — fail the parse (the default) or map unknowns to an explicit `"unknown"` variant — and 12-anti-patterns prohibits "silently defaulted enums". An open `z.string()` is a third option the contract does not offer, and no local resolution in master plan §5 records it. The row therefore traces to a section its own schema does not satisfy (doctrine §6: a trace to an entry that says something else). | plan gap / trace defect | **Plan task 3** — `z.enum(["standard","simplified","tax-free","none"])`, failing the parse (`taxMode` drives nothing in v1, so failing is free); **or** master plan §5 gains a local resolution recording the widening and its reason, and C6(b)'s trace drops the 06 §6 citation. | MED |
| **D13** | How `error.issues` is bounded and converted. Task 1 says issues cross "under the same cap" (`MAX_UPSTREAM_MESSAGE_CHARS`, a *message* cap). Undetermined: does the cap apply to each issue's `message`, to the issue **count**, or to the serialized total? And OpenAPI types `error.issues[].path` items as `oneOf [string, integer]`, while `details.issues` must be `{ path: string[] }`. | Copy `issues` through with a `.map()`, casting `path` — shipping numbers inside a declared `string[]`, and forwarding an unbounded upstream array straight into `details` and therefore into `toErrorDto`. | This is the same defect family as phase-2 projection D2 and master plan §11 follow-up row 7, one boundary further out: the paths are the *vendor's* this time, not Zod's. The bound matters because `details` is the surface that crosses to a caller. No row exercises a numeric path segment or an oversized issue list. | plan gap | **Plan task 1** — state the conversion (`path.map(String)`), a cap on issue **count**, and the per-issue message rule. **Plan criteria** — extend C1(c) with an issue carrying a numeric path segment and an over-cap list; one named mutation dropping the conversion. | MED |
| **D14** | What happens when the company's `currency` fails `currencyCodeSchema`. Task 3 parses it as `string(3)`; task 4 uppercases it and parses with `currencyCodeSchema` (`/^[A-Z]{3}$/`) **inside the mapper** — after the response schema already passed. | Let the mapper's `.parse()` throw. A bare `ZodError` escapes `src/lib/proposales/` — outside the taxonomy, outside `ProposalesError`, and `toErrorDto` renders it as a `validation_error` blaming our own input for the vendor's data. | §17A.13's translation is stated as total over what the transport can produce, and 07 §4 says raw `fetch` errors and unexpected throws never escape the module. Either the validation moves into `companyListResponseSchema` (where a failure is already `schema_mismatch`), or the mapper's throw is translated. | plan gap | **Plan task 3** — put the shape rule in the wire schema (uppercase-then-validate via `z.string().length(3).transform(...).pipe(currencyCodeSchema)` or equivalent), so the failure is `schema_mismatch` by construction. **Plan criteria** — one C6 row for a malformed company currency. | MED |
| **D15** | What exercises `getProposalesClient()`. Task 7 builds the default instance from `serverEnv` lazily. **No criterion row touches it**, and it takes no parameters, so nothing can inject a `fetch` to reach it — and the suite's offline guard makes any real call throw `OfflineGuardError`. | Ship it untested. The one place the real wiring happens — api key, company id, base URL flowing from `serverEnv` into the transport — is the one place nothing looks. A swapped argument there passes every row in the phase. | Charter rule 10 (operational reachability): "a feature whose tests all pass but whose defaults never trigger it is unreachable, not done"; phases adding config-gated paths include a criterion that the defaults actually reach them. | plan gap | **Plan task 7** — give the factory a test seam (`getProposalesClient(deps = {})` overriding `fetch`/`now`/`sleep` only). **Plan criteria** — one row asserting the default instance carries `serverEnv.PROPOSALES_COMPANY_ID` into the query and a `Bearer` header, with an injected `fetch`. | MED |
| **D16** | Whether four named mutations cover the phase's silent-failure surface. The declared set guards: raw-body leakage (C2(d)), POST retry (C3(e)), request shape (C4(a)), company selection (C6(b)). **Nothing guards the epoch→ISO mapper (C5(c))** or **the upstream-message cap (C2(a)/C2(b))**. | Run the four, report a closed ledger, and ship. Both unguarded mechanisms are on charter rule 6's own list — time, and the boundary that decides whether vendor text reaches a user. | Charter rule 6 allocates definition effort by silent-failure risk, and rule 15 requires a guard to ship with proof it can fail. I checked C5(c) discriminates on its own: a seconds-interpretation mutation (`created_at * 1000`) makes `new Date` throw `RangeError` on the fixture value, so the row *would* redden — but that is an accident of the fixture, not a recorded probe. | plan gap | **Plan criteria** — add two named mutations (this is not exhaustive enumeration; it is two of the phase's highest-risk rows): `MUT-03-5 mappers.ts · toContentItem · multiply created_at by 1000 → C5(c) red`; `MUT-03-6 errors.ts · fromUpstream · drop the length check → C2(b) red`. Re-derive the plan's mutation count to 6. | MED |
| **D17** | The fake's recorded-call shape and its phase-3 surface. Master plan §6.6 declares `createFakeProposalesClient({ catalog?, company?, proposals?, editorOrigin?, failNext? })` with `calls: Array<{ op, input }>`; C4(e) asserts `calls` **equals** `[{ op: "listContent" }]` and C6(d) says it "gains `{ op: "getCompany" }`" — no `input` key. §6.6 also declares `stored: Map<uuid, StoredDraft>`, which is phase 4's write half. | Record `{ op, input: undefined }` and watch a strict deep-equal fail, or drop `input` and diverge from the registry that phase 4 will implement against. | Either `input` is optional and omitted for no-argument operations, or the rows assert `toMatchObject`. Also undetermined: which of `proposals`/`editorOrigin`/`failNext`/`stored` exist in phase 3 at all (task 6 says only "phase 4 adds the write half"). Charter rule 4 forbids dead scaffolding in this phase. | plan gap | **Plan task 6** — state that `input` is present only for operations that take one, and name exactly which options and fields phase 3 creates. **Master plan §6.6** — make `input` optional in the declared row so phase 4 inherits a consistent shape. | MED |
| **D18** | Which files carry `import "server-only"`. Plan tasks name it for `http.ts` (task 2) and `index.ts` (task 7) only. Master plan §6.1 and contract 02 §3 both require it on **every** module under `src/lib/proposales/**`; contract 07 §1's file map calls `schemas.ts` "runtime-neutral". | Add it to the two named files and leave `errors.ts`, `schemas.ts`, `mappers.ts`, `client.ts`, `fake.ts` without it — a MUST violation the reviewer finds. | Master plan §6.1 already resolves the 02-vs-07 tension in favour of "every file". Only the plan's task list omits it. | plan gap | **Plan tasks 1, 3, 4, 5, 6** — one clause each. No contract conflict to escalate; §6.1 already decided it. | LOW |
| **D19** | How an abort is distinguished from an ordinary `fetch` rejection. Task 2: "abort → `timeout`; `fetch` rejection → `transport`" — but an abort *is* a fetch rejection (a `DOMException` named `AbortError`). | `err.name === "AbortError" ? timeout : transport`, which also labels a caller-supplied external abort as a vendor timeout. | The branch **order** and the discriminator are unstated; C1(a) and C1(b) each pass under either choice. | plan gap | **Plan task 2** — state the classifier's branch order explicitly and the discriminator (`controller.signal.aborted`, not the error's name). | LOW |
| **D20** | Names the plan uses but the registry does not carry: the **generic upstream message** (asserted by C2(b) and C2(c) as "the generic message"), and the defaults/types of the injected `sleep` and `now` (task 2 lists them with no default and no signature). | Inline the string literal in `errors.ts` and let each test retype it; default `sleep` to an unnamed `setTimeout` promise. | Master plan §6 is explicit: "A session that needs a name not listed here adds it **to this section** (via the coordinator) before using it." C2(b)/C2(c) cannot be written without the generic message being importable. | plan gap | **Master plan §6.5** — register the generic-message constant in `lib/proposales/errors.ts`. **Plan task 2** — give `now: () => number` (monotonic ms) and `sleep: (ms: number) => Promise<void>` their defaults. | LOW |
| **D21** | Whether `getContent` validates `variationId` before it enters the query. OpenAPI constrains the parameter to `^[0-9]+(,[0-9]+)*$`; the plan's `getContent(variationId: string)` validates nothing. | Interpolate it. Harmless in phase 3 (the only caller is our own code), and a live hole from phase 9, when the `get_content` tool feeds **model-authored** strings straight through. | 10 §8: "ids and keys from any untrusted source are validated against a pattern before being used in paths, keys, or lookups", and the client is the enforcement point named there. Encoding is also unstated (`URLSearchParams` vs concatenation), which 10 §8 assigns to the transport layer. | plan gap | **Plan task 5** — validate `variationId` against the documented pattern (`validation_error`, not an upstream call). **Plan task 2** — state that queries are built with `URLSearchParams`. Cheap now; expensive to retrofit at phase 9. | LOW |

**Also observed, deliberately not raised as ledger rows.** (i) Phase 3's mutation lines read
`<file> · <function> · <change>` where master plan §6.8 specifies `<file> · <definition|call
site> · <change>`; the function name stands in adequately for the definition site here, and
all four are definition-site mutations. (ii) `GET /v3/content` returning **more than one**
item for a single `variation_id` is undetermined (C4(d) covers only the empty case); the
vendor's own parameter shape makes >1 impossible for a single id, so this is a delegation,
not a gap. (iii) No criterion covers `README.md` (task 8); that is correct — documentation
is judged at review, not by a test.

## Depth targets — what I concluded on each

**1. Upstream-error classification and what may cross.** The taxonomy itself is the strongest
part of the plan: C1 is exactly total over §17A.13's twelve conditions, both `bad_request`
sources are separately exercised, and `retryable` matches the ratified table row for row. The
danger is entirely at the **edges of the table**, not inside it: the (status × body-shape)
product is unordered (**D4**, card 1), the `issues` bound and path conversion are undefined
(**D13**), the `cause` shape that C2(d) silently constrains is unpinned (**D8**), and the
construction the plan describes cannot produce `details.issues` at all with phase 2's shipped
error classes (**D1**, verified against the compiler). What may cross is well-guarded:
C2(a–e) covers message, cap, non-string, raw body and URL, and C1(l) additionally asserts
absence through `toErrorDto` — I checked that `toErrorDto` serializes `details` wholesale and
never `cause`, so those absence rows do measure what they claim.

**2. Retry eligibility, budget, and the POST separation.** The structural separation is real
and MUT-03-2 can bite it: `post` reaching the retry path is a definition-site change in
`http.ts` that C3(e) observes directly. Charter rule 11 would prefer the eligibility to be a
**declared, fail-closed field** of the request options rather than a property of which
function you called; the plan's `{ operation, idempotent: true }` is close, but never says
whether `idempotent` is required or defaulted — a defaulted-true field is the rule-11 defect
in miniature. Two real gaps here: the total-elapsed cap has two readings that both satisfy
C3(d) (**D9**), and three of the five C3 rows assert no exact outcome (**D10**). Attempt
count and backoff are otherwise fully determined and C3(a–c) are writable today.

**3. Query/body placement, URL construction, wire vs domain.** **D3** is the blocking one —
task 2 and C6(a) are mutually unsatisfiable, and the contract's own placement (`client.ts`)
resolves all three request-shape rows at once. Beyond it, the response envelopes are
determinable from the OpenAPI file the plan already cites (`{ data: [...] }`, `data`
required, for both `/v3/content` and `/v3/companies`), and `/v3/companies` genuinely takes no
parameters, so C6(a)'s "query keys exactly `[]`" is correct against the vendor. The wire/domain
separation is clean: `ContentItem` and `CompanyInfo` are lib-owned (§6.4), nothing named
`*Response` leaves the module, and C5(b) proves stripping on the real mapper path.

**4. Time, currency, and whether the fixtures prove the mapping.** C5(c)'s arithmetic is
correct — I computed `new Date(1757059200000).toISOString()` = `2025-09-05T08:00:00.000Z` —
and the row does discriminate the millisecond assumption, because a seconds-interpretation
mutation overflows `Date` and throws rather than quietly returning a different date. The
**range** question the master plan assigned to this session is answered in full at **D5**:
both the throwing band and the form-invalid band are inside the vendor's declared `int64`,
and nothing in the phase guards either. Currency has a second, quieter hole: normalization
happens in the mapper *after* the schema passed, so a malformed vendor currency escapes as a
bare `ZodError` rather than a `ProposalesError` (**D14**). On fixtures: every C5 row runs the
**real mapper over real wire JSON**, which satisfies charter rule 3 — the risk is not
hand-built stand-ins but that the plan never states the fixture's contents, so C5(a), C5(b)
and C5(d) all load their predicates onto the same undescribed two items. The plan should say
what is in the file (**D7** covers the companies half; the content fixture needs the same
sentence).

**5. Server-only reachability, secrets, injected dependencies, and the fake.** Secret
containment is sound by construction: the key is read only in `src/lib/env/server.ts`, held
in module scope, attached inside `http.ts`, and C4(b) asserts header presence without the
value, exactly as 11 §3 requires. The offline guarantee holds — I confirmed `test/setup/node.ts`
replaces `globalThis.fetch` unconditionally in the node project, `vitest.config.mts`'s
`src/lib/**/*.test.ts` glob claims every phase-3 test file, and `server-only` is aliased to
the stub — so an injected `fetch` is the only reachable one. Two gaps: `server-only` is
specified on two of the eight modules (**D18**), and the one path that uses the *real*
configuration is unreachable from any test (**D15**). The fake is correctly shaped as a
recorder — `calls` and `assertNoWrites()` observe, `catalog` and `company` are data, nothing
computes — so master plan rule 5 holds; only its recorded-call shape disagrees with the
registry (**D17**).

## Reality checks

| Check | Result |
|---|---|
| Every path in "Files expected to change" | 15 listed, all new, none colliding with an existing file or export name. **One missing** (`fixtures/companies.json`, D7) |
| Every cited section resolves and says what the plan claims | ✅ except two trace cells (**D12** 06 §6; **D11**/task-3 vs OpenAPI `required`). Evidence §8.1 does record the `GET /v3/companies` runtime observation the plan attributes to it; §6 does record the millisecond-scale note; §3 does record `variation_id` as a query parameter |
| Dependencies on prior phases verified in code, not assumed | ✅ `AppError`/`IntegrationError`, `toErrorDto`, `currencyCodeSchema`, `isoTimestampSchema`, `serverEnv`, `createLogger`, the offline guard and the two-project Vitest layout all exist and behave as the plan assumes — **except** `IntegrationErrorOptions`, which cannot carry `issues` (**D1**) |
| Missing dependencies | **None.** Phase 3 needs no new package: `fetch`, `AbortController` and `URLSearchParams` are platform, `zod@4.5.4` is installed, `tsconfig` already sets `resolveJsonModule: true` so the JSON fixtures typecheck |
| Naming collisions | **None.** `src/lib/proposales/errors.ts` does not collide with `src/lib/errors/`; no phase-3 symbol is already exported anywhere |
| Test-project coverage | ✅ all six new test files fall under the node project's `src/lib/**/*.test.ts` glob; §10.3's stray-file hazard does not apply to this phase |
| Lint compatibility | ✅ no phase-3 module reads `process.env`; `src/lib/**` may not import `@/features/**` or `@/app/**` and does not need to |

## Criteria decidability

Could I write each row today, from the artifacts alone, with one exact expected outcome?

| Criterion | Decidable now | Blocking gap |
|---|---|---|
| C1 (a–l) | 10 of 12 | (b) does not say whether it runs through the retrying read (three aborts, three signals) or a single request; (l) depends on D1 for `details.issues` |
| C2 (a–e) | 3 of 5 | (b), (d) depend on the unpinned `cause` shape (**D8**); the generic message is unregistered (**D20**) |
| C3 (a–e) | 2 of 5 | (c), (d), (e) state no exact outcome (**D10**); (d) additionally depends on **D9** |
| C4 (a–e) | 4 of 5 | (e) depends on the fake's `calls` shape (**D17**) |
| C5 (a–d) | 2 of 4 | (a) has no stated fixture contents; (d) is unsatisfiable under task 3's schema (**D11**) |
| C6 (a–d) | 1 of 4 | (a) is contradicted by task 2 (**D3**); (b), (c) need a fixture outside the perimeter (**D7**) and depend on **D2**, **D12**, **D14** |

**19 of 35 rows are writable today.** None of the sixteen is unwritable for a hard reason —
every one becomes decidable through a routing already listed in the ledger.

## Explicit delegation list (freedom granted on purpose, not taken silently)

1. **Which test file owns which criterion.** The perimeter has five test files for six
   criteria; the natural split (`http.test.ts` → C1/C3, `errors.test.ts` → C1/C2,
   `mappers.test.ts` → C5, `client.test.ts` → C4/C6, `fake.test.ts` → C4(e)/C6(d)) is the
   implementer's to choose, provided every row is discharged exactly once and no test ships
   without a row (charter rule 16).
2. **Whether `errorBodySchema` is used to parse the error body or only to test it.** Either is
   contract-clean, as long as a body that fails it produces the generic message rather than a
   thrown error.
3. **Fixture contents beyond what the rows pin.** Ids, languages and titles are free; the two
   content items must jointly satisfy C5(a), C5(b) and C5(d) with each row's predicate the
   only reason its outcome holds (charter rule 2's companion).
4. **No bound on the raw error-body read in v1.** An oversized upstream body is read whole into
   `cause`. Recorded as an accepted MVP limit (owner scope brief §9.0 "trim here"), not an
   oversight — a later phase adding a body cap should say so.
5. **`getContent` returning more than one item** for a single `variation_id` — undetermined and
   unreachable given the vendor's parameter shape; the implementer picks a defensive branch
   without a criterion.

## Write perimeter (full)

Documents only. No source file was modified; no code was written; no test suite was run.

| File | Change |
|---|---|
| `handoffs/reviewer/phase-03-projection-round-0.reviewer.md` | created (this file) |
| `master-plan.md` | tracker §4 row 3 only: `NOT_STARTED` → `PROJECTED`, date, actor, note |

**Per the session prompt, the phase plan was not edited** — no task, criterion, Notes or
Review-log text was touched. The Review-log line is the coordinator's to write when it
consumes this handoff (doctrine closing protocol; the prompt agrees). This diverges from the
phase-2 projection session, which its prompt directed to write that line; the difference is
in the prompts, not in my reading of the doctrine.

**Tool-recorded state:** none. Archgraph is absent from this repository (master plan §8);
skipped silently.

**Transient probe, declared.** One throwaway file `src/lib/__probe.ts` was created, compiled
with `npx tsc --noEmit` to settle **D1** empirically, and deleted. Its only side effect was
`tsconfig.tsbuildinfo` (master plan §11 follow-up row 8's known artefact), which I restored
with `git checkout --`. `git status --porcelain` is empty at close and `HEAD` is unchanged at
`f957f66`.

**Evidence budget: L4 runs = 0**, as directed. Everything above came from read-only
inspection (`cat`, `sed`, `grep`, `ls`, `git status`, `git rev-parse`), `npx vitest list`,
two `python3` reads of the vendored OpenAPI file, one `node -e` probe of the platform `Date`
built-in, and the one `tsc --noEmit` probe declared above. No test file was executed.

## Non-authoritative appendix

Discarded per doctrine. The paper skeleton — module signatures, the classifier's control
flow, the retry loop, per-file sketches — is deliberately **not** attached: handing the
implementer my sketch would make this session a second planner and defeat the fresh-session
rule the gate depends on. Everything it produced that matters is a ledger row above.

## Exit condition

**AMENDMENTS_REQUIRED.** Twenty ledger rows, every one routed. Per the doctrine's exit gate,
the implementer prompt compiles once each row is applied, changed upstream, or recorded as a
delegation — and cards 1 and 2 are answered or explicitly deferred by the owner. Card 1 is an
amendment to a ratified mechanism contract (§17A.13) and must not be patched into the plan.
This is round 0 with a non-empty ledger, so the gate's self-retiring clock does not start.
