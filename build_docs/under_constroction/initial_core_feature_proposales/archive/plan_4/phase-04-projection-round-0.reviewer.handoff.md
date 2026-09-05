---
plan: 4
role: projection
round: 0
verdict: AMENDMENTS_REQUIRED
date: 2026-09-05
actor: Claude Opus 5 (1M context)
---

# Phase 4 projection — Proposales create, recovery search, read-back, Applied Pricing

## Summary (owner-readable)

I did the implementer's first hour of Phase 4 on paper, from the plan and the repository alone, and the plan is not yet safe to hand over. It is a strong plan — the counts are honest, the trace chain closes, and the dangerous mechanisms were all identified. But eight of its acceptance rows cannot be written as stated: one asserts a Zod behaviour that does not exist, one contradicts a task in the same plan, and three describe guards that pass no matter what the code does. Separately, the type that carries the money read back from Proposales has no declared home, and as written Phase 14 would not be able to read what Phase 4 produces.

Two questions need you personally: what the application should show when Proposales reports no status at all, and how strict to be about fields the vendor's own specification marks optional. Everything else routes through the coordinator as plan amendments.

Nothing here requires code changes now, and I made none. Once the ledger below is routed, the implementer prompt can compile.

## ⚠ OWNER DECISIONS REQUIRED (2)

### Card 1 — What should a proposal with no status show?

**Question** — When Proposales returns a proposal whose status is empty, should the result say `"unknown"`, or should it say nothing at all?

**Story** — A colleague approves a proposal, the network drops, and they retry. Proposal Copilot finds the earlier draft and reports it as recovered. But Proposales returns no status for older versions in a series — the field is genuinely empty, not missing. If we call that `"unknown"`, the screen shows the same word it would show if Proposales had invented a brand-new status we have never seen. Two very different situations, one word, and nobody can tell them apart later.

**Branches**
- **A — empty means no status is reported.** The result simply carries no status; `"unknown"` stays reserved for a status Proposales added that we do not recognise.
- **B — empty becomes `"unknown"`.** One word covers both; simpler, and a reader who sees `"unknown"` cannot tell whether Proposales was silent or surprising.

**Recommendation** — A, because `"unknown"` exists to flag "the vendor changed something", and spending it on a documented, ordinary case makes that flag mean nothing.

**On silence** — the gate holds; the implementer is not asked to guess.

**Trace** — plan 4 task 1 and rows C5(e), C6(a); master plan §6.4 (`draftResultSchema`, `RecoveredProposalSummary`); contract 06 §6.

### Card 2 — How strictly should we read a proposal back?

**Question** — If Proposales returns a proposal block without its optional-flag or price-breakdown fields, should Proposal Copilot refuse the whole read, or report the proposal with those parts marked as not reported?

**Story** — After creation, Proposal Copilot reads the draft back so you can see the prices Proposales actually applied. Proposales' own specification marks almost every field on a block as optional — including the flag that says a block is optional, and the tax breakdown. A text-only proposal, or a block with no tax split, would come back missing them. If we refuse the whole read, you get "Applied Pricing unavailable" on a draft that was created perfectly well, every time, and the feature's headline output quietly never appears. If we are too tolerant, a missing amount could be shown as a real number.

**Branches**
- **A — strict on money, tolerant elsewhere.** A missing total or unit price fails the read (it is never shown as zero); a missing optional-flag or tax split is reported as not present.
- **B — strict on everything.** Any missing field fails the read; safest against wrong numbers, but a single ordinary vendor omission removes Applied Pricing entirely.
- **C — tolerant on everything.** Nothing fails; carries the risk that a missing amount becomes a shown amount.

**Recommendation** — A. Money is the thing that must never be invented; the rest is description, and refusing an entire read over a missing boolean turns a vendor convention into a broken feature.

**On silence** — the gate holds; the read-back schema is not written until this is answered.

**Trace** — plan 4 task 1 and rows C6(a), C6(e), C7(b); intention §17A.12; `openapi.json` `Proposal` / `ProposalBlock`.

---

## Gate check

| Gate | Result |
|---|---|
| Intention status header | `RATIFIED` (2026-09-05, §21.4 / §23 round 12) — pass |
| Tracker rows 1–3 | `APPROVED` (master plan §4) — pass |
| Phase 4 tracker row | `NOT_STARTED` — pass |
| Projection mandatory for phase 4 | Yes — plan Notes ("ranks 1, 3, 8, 13") and master plan §3 — pass |
| Phase-3 adapter dependencies present | Yes — `http.ts`, `errors.ts`, `schemas.ts`, `mappers.ts`, `client.ts`, `fake.ts`, `index.ts`, `fixtures/` all exist and export what phase 4 extends — pass |
| No upstream handoff in `OWNER_DECISIONS_PENDING` | `handoffs/` is empty — pass |

`git status --porcelain` at session start: **clean** (no output). `HEAD` = `a6d6632653f9b20797a2d91b577021c842c8ac3c`. No foreign frontend work, no `tsconfig.tsbuildinfo`, and no coordinator artifacts were present to preserve; none were touched.

Archgraph: absent (master plan §8). Skipped.

---

## Decision ledger

Classification: **PG** plan gap (plan amendment) · **UG** upstream gap (master plan / intention, via the coordinator) · **FC** free choice (delegate explicitly in the implementer prompt).

| # | Decision point the artifacts do not determine | Class | Proposed routing |
|---|---|---|---|
| D1 | **`AppliedPricing` has no declared home and no declared `available` discriminant.** Task 3 signs `toAppliedPricing(readback): AppliedPricing`, but master plan §6.4 homes `appliedPricingSchema` in `src/features/proposal-preparation/schemas/draft-result.ts` (phase 14), and `eslint.config.mjs` forbids `src/lib/**` importing `@/features/**` (R10). Phase 14 task 1 says its schema "mirrors the lib mapper's output type" and phase 14 C6(a) asserts `appliedPricingSchema.parse(toAppliedPricing(...))` — which requires the lib object to carry `available: true`. Phase 4 never mentions `available`. | PG + UG | Amend plan task 3 to declare the lib-owned `AppliedPricing` type (name, file — `index.ts` is the phase's only exported-type surface) and to state that it is the `available: true` arm, discriminant included. Add `AppliedPricing` to master plan §6.4's "Lib-owned Proposales domain types" table and annotate the `appliedPricingSchema` row that the feature schema mirrors the lib type. |
| D2 | **`taxOptions` is never mapped.** `appliedPricingSchema` requires `taxOptions: { mode?, taxIncluded?, taxLabelKey? }` as a present object; task 3 lists renames, Money wrapping, quantity/vat/blockCurrency and warnings, and never mentions it; the plan's read-back schema marks `tax_options?` optional. No criterion row covers it. | PG | Amend task 3 to state the mapping and what an absent `tax_options` produces (`{}`, not omission). Add one row to C7, or record the obligation as deliberately unasserted with a reason. |
| D3 | **Read-back optionality of `content_id`, `optional`, `package_split`, `quantity`.** `openapi.json`'s `ProposalBlock` is `ProposalBlockInput` plus `required: ["type","uuid"]` — every other block field is optional in the vendor spec, while `appliedPricingSchema` requires `contentId`, `quantity`, `optional`, `packageSplit`. The plan marks only `currency?` optional and is silent on the rest. Wrong either way is silent: too strict makes Applied Pricing permanently unavailable; too loose defaults a value. | PG | **Owner card 2.** After the answer, amend task 1 to state each field's optionality and each absent-case representation explicitly, and amend C6 to enumerate one row per tolerated absence. |
| D4 | **Proposal status `null`.** `ProposalStatus` is `nullable: true`; evidence §6 records `null` for non-latest versions. Task 1 fixes only "unknown enum member → `"unknown"`". `RecoveredProposalSummary.status` is a non-optional string. | PG | **Owner card 1.** After the answer, amend task 1 and the affected rows (C5(e), and the readback status). |
| D5 | **Nothing parses the outbound request on the production path.** §17A.5 and R5 justify `z.strictObject` because "adding one fails at parse rather than at review" — but task 5 posts the object from `toCreateProposalRequest` directly, and only the *tests* (C1(a)) parse it. As specified, `createProposalRequestSchema` is a test-only artifact and the price-field guard is unenforced at runtime (charter rule 3: invariants are proven on the production code path). | PG | Amend task 5: `createProposalDraft` parses the assembled body with `createProposalRequestSchema` before `http.post`, and a parse failure is an application-side error (not `schema_mismatch`, which is reserved for responses). Add one criterion row and its named mutation (remove the parse → row red). |
| D6 | **Currency case is not normalised.** `moneySchema.currency` is `/^[A-Z]{3}$/` (§17A.1); `openapi.json` types proposal `currency` as a bare string with no case guarantee. Phase 3 set the precedent of `.transform(toUpperCase).pipe(currencyCodeSchema)` in `companyListResponseSchema`. The plan is silent, and C7 uses `EUR`/`SEK`, so no row would catch it. | PG | Amend task 1 to state the read-back `currency` treatment (recommend: same transform as phase 3, or an explicit decision to fail on a non-uppercase code). One row either way. |
| D7 | **The fake's construction is undetermined.** Task 6 uses `deps.newUuid()`, `editorOrigin`, `storedReadbacks`, `failNext(op, error)` — none appear in master plan §6.4/§6.5/§6.7, and the existing `createFakeProposalesClient` takes `{ catalog, company }`, not `deps`. | PG + UG | Amend task 6 to fix the option/dependency names and shapes; add them to master plan §6.7 (fixtures and doubles) so phase 14, which consumes `fake.storedReadbacks` and `fake.calls` in its C6(a)/C7(a), binds to the same names. |
| D8 | **The fake's wire-equivalence cannot be asserted as written.** C3(h) requires `fake.calls` last entry to be `{ op: "createProposalDraft", request }` deep-equal to `toCreateProposalRequest(input, ctx)`. Two blockers: task 6 says the fake records `{ op, input }` *and* the request (a three-key entry, which fails a deep-equal against a two-key expectation); and `toCreateProposalRequest` needs a `ctx.now`, so the fake's clock and the test's clock must be the same injected value or `proposal_copilot_created_at` differs on every run. | PG | Amend task 6 to fix the recorded entry's exact keys and to declare the fake's `companyId`/`now` injection; amend C3(h) to match. |
| D9 | **`formatIsoTimestamp(ctx.now())` does not typecheck.** `formatIsoTimestamp(date: Date)` (`src/lib/values/timestamp.ts:5`) takes a `Date`; C3(e) ("`now` → epoch 0") implies `ctx.now: () => number`. The plan never states `ctx.now`'s return type. | PG | Amend task 2 to `formatIsoTimestamp(new Date(ctx.now()))` and to declare `ctx: { companyId: number, now: () => number }`. |
| D10 | **`PROPOSAL_METADATA_KEYS`' own shape.** §6.5 fixes the three wire names; task 5 dereferences `PROPOSAL_METADATA_KEYS.generationId`, so it is a record with camelCase keys — but those key names are nowhere fixed. | FC | Delegate explicitly, or fix the three property names in master plan §6.5. |
| D11 | **How the test reaches `openapi.json`.** C4(c) reads `limit.maximum` "at test time" from a file outside `src/` and outside the `@` alias. Import-with-assertion vs `readFileSync`, and locating the parameter by `name` vs by array index (index 3 today), are both undetermined; the index form is silently wrong the day a parameter is added upstream. | FC | Delegate with a constraint: locate by `name === "limit"`, never by index. |
| D12 | **Where snake→camel happens for the read-back** (see F2). Task 2 puts `toProposalReadback` in `mappers.ts`; task 3 has the pricing mapper doing "renames". Both cannot be true, and C2(i) forbids the first. | PG | Amend: state which file owns the wire→domain rename, and re-scope C2(i) accordingly (see F2). |
| D13 | **`String(content_id)` placement.** `appliedPricingSchema.blocks[].contentId` is a string; the wire field is `int64`. The Notes fix `Number(variationId)` to `mappers.ts` but say nothing about the reverse conversion. | FC | Delegate, or state it in task 2 by symmetry with the existing Note. |
| D14 | **`arithmetic-scan.ts`'s status.** It is declared a test helper but sits at `src/lib/proposales/arithmetic-scan.ts`, where master plan §6.1 requires `import "server-only";` on every file, and it imports the `typescript` devDependency from application source. It is also absent from §6.1's module map. | PG + UG | Decide and record: keep it in `src/lib/proposales/` with the `server-only` directive, or move it under `test/`. Add the chosen path to master plan §6.1. |
| D15 | **`package_split[].type` domain.** `openapi.json` types it as a 4-member enum (`accommodation`, `meetingRoom`, `food`, `other`); master plan §6.4 types `packageSplit[].type` as `string`. Task 1 says only "`type`". | FC | Delegate (recommend: `z.string()`, matching §6.4 — a display-only field, and a new vendor split type must not fail a read-back). |
| D16 | **`series_uuid` optionality on search rows.** `ProposalSearchResult.required` includes `series_uuid`; the plan declares `series_uuid?`. The looser form is the right call, but it is an undeclared divergence from the cited spec. | PG | One sentence in task 1 recording the deliberate loosening, so a reviewer does not read it as an error. |
| D17 | **The inconsistent fixture must make MUT-04-7 bite on the field it mutates.** MUT-04-7 replaces "total mapping" with `Σ(unit_value_with_discount_without_tax × quantity)`. Every row in evidence §8.3 satisfies that identity, so the fixture's numbers are necessarily synthetic; and if only `value_with_tax` is made inconsistent, a mutation touching `totalWithoutTax` sails through. | PG | Amend C6(b)/MUT-04-7: state that **both** totals are inconsistent in the fixture, and name which total the mutation replaces. |
| D18 | **`findArithmetic`'s `kind` vocabulary.** The return type is `Array<{ line, kind }>`; C8(b) asserts "each reported with its kind"; no artifact enumerates the kinds. | FC | Delegate with a constraint: `kind` must distinguish the detection branches C8(b) enumerates, so the row is decidable. |

---

## Reality checks

| # | Check | Result |
|---|---|---|
| RC1 | Files expected to change — 17 paths | Count re-derived: **17** correct. But **8 of the 17 do not exist** and none is marked new: `applied-pricing.mapper.ts`, `applied-pricing.mapper.test.ts`, `arithmetic-scan.ts`, `arithmetic-scan.test.ts`, `fixtures/proposal-create-response.json`, `fixtures/proposal-search.json`, `fixtures/proposal-readback.consistent.json`, `fixtures/proposal-readback.inconsistent.json`. The other 9 exist. Doctrine requires each path to exist or be marked new. **Amend the list to mark them.** |
| RC2 | Registry coverage of new artifacts | `arithmetic-scan.ts` / `arithmetic-scan.test.ts` are absent from master plan §6.1's module map; the four new fixtures are covered only by §6.7's generic `src/lib/proposales/fixtures/*.json` row. Master plan §6's own rule ("a session that needs a name not listed here adds it to this section before using it") is unmet — see D14, D7. |
| RC3 | Write perimeter completeness | The plan's perimeter omits the artifacts the closing protocol will touch: `master-plan.md` (tracker row 4 + any §6 registry addition), and this plan file's Review log. Both are routine; naming them prevents a false "changed outside the perimeter" finding at review. |
| RC4 | Phase-3 seams the tasks do not mention | `createProposalesClient` (`client.ts:18`), `getProposalesClient` (`client.ts:60`) and `createFakeProposalesClient` (`fake.ts:19`) all return `Pick<ProposalesClient, "getCompany" \| "listContent" \| "getContent">`. Phase 4 must widen all three. `ProposalReadback` at `index.ts:44` is a placeholder carrying an index signature (`[key: string]: unknown`) and must be replaced with the real shape. Mechanically forced by the compiler, so not a gap — but worth one line in task 5/6 so the perimeter is not a surprise. |
| RC5 | `http` surface supports the three operations | Yes. `http.post(path, body, { operation })` sends no query and is single-attempt (`http.ts:179`); `http.get(path, query, { operation, idempotent: true })` carries the bounded read retry (`http.ts:151`). `GET /v3/proposals/{uuid}` correctly takes **no** `company_id` — the vendor path declares only `ProposalUuidPath`. |
| RC6 | "never retried" for create needs no new row | Phase 3 `http.test.ts:282` already holds `C3(e) never retries a POST`. Task 5's clause is satisfied upstream; do not add a duplicate row. |
| RC7 | Cited `openapi.json` facts | All verified in the vendored snapshot: `limit` `default: 1`, `maximum: 25` ✅ · `CreateProposalRequest` is `additionalProperties: false` ✅ · `ProposalMutationResponse` = `{ proposal: { uuid, url } }` ✅ · search response is `{ data: ProposalSearchResult[] }` (envelope, which the plan's schema name implies but does not state) · `PackageSplit` required field is `type` only ✅. **Two facts the plan relies on are contradicted by the spec:** `Proposal.required` is `["uuid","company_id","language","status","data","blocks","attachments"]` — `currency`, `value_without_tax`, `value_with_tax` are **not** required (D3); and `ProposalStatus` is `nullable: true` (D4). |
| RC8 | Counts (charter manifest property 3) | Re-derived from the table: **8 criteria, 46 rows, 9 named mutations** — all three match the plan's own footer and master plan §4's per-phase arithmetic. ✅ |
| RC9 | Trace chain, both directions | Every row's trace cell resolves to a live ledger entry or §17A section. Reverse: master plan §7.2 claims phase 4 serves M1, M3, M5, M8, M9, M13, M14 — every one is served by at least one row present in the table. §7.3 rows 16, 18, 22 resolve to 4.C2, 4.C6, 4.C1 respectively ✅. **One weak cell:** C2 traces to **M1**, whose text is about provenance on proposition leaves and validation rejection — it says nothing about outbound price fields. M9 already carries C2 correctly. Recommend dropping M1 from C2's trace cell and, if §7.2's M1 row then loses 4.C2, re-deriving that row. |
| RC10 | Fixture derivability from the cited evidence | `proposal-readback.consistent.json` is derivable from evidence §8.1/§8.3 (control: units `(10000,10000,10000,10000)`, totals `(10000,10000)`, `currency: EUR`, `tax_options {mode: "standard", tax_included: false}`, one `other` split at `vat: 0`). `proposal-readback.inconsistent.json` is **not** derivable — every row in §8.3 satisfies `total = Σ(unit × quantity)`. See D17. |

---

## Criteria decidability findings

Each is a row I could not turn into one exact executable assertion, or could — and it would pass regardless of the code.

**F1 — C2(a–h)'s expected outcome is false in this repository's Zod. (blocking; verified)**
The row states "issue path names the key". Zod 4.5.4's `unrecognized_keys` issue puts the key in `issue.keys` and `issue.message`, never in `issue.path`. Measured directly against the installed `zod@4.5.4`:
- block-level extra key → `{ code: "unrecognized_keys", keys: ["currency"], path: ["blocks", 0] }`
- top-level extra key → `{ code: "unrecognized_keys", keys: ["tax_options"], path: [] }`

An implementer writing the row literally gets a red test on correct code, and the cheapest repair is to drop to `expect(result.success).toBe(false)` — which discards the half that says *which* key was rejected, on all eight rows. **Amend to:** "`safeParse` fails with an `unrecognized_keys` issue whose `keys` contains the key". Scope: L1 inspection, no test run.

**F2 — C2(i) is unsatisfiable against task 2. (blocking)**
C2(i) asserts `mappers.ts`'s text "contains none of the eight key names". Task 2 places `toProposalReadback` in `mappers.ts`, and master plan §6.4 types `ProposalReadback` in camelCase (`seriesUuid`) — so that function must name `unit_value_with_discount_without_tax`, `package_split`, `currency` and `tax_options` to rename them. The two cannot both hold. Routed as D12: decide which file owns the rename, then scope C2(i) to the file that genuinely must never name a price key (the outbound assembly), by function or by file split — not by scanning a file the plan also fills with read-back mapping.

**F3 — C2(i) is an absence row with no proof it can observe a presence. (charter rule 15)**
C2's only named mutation, MUT-04-3, targets `schemas.ts` and reddens C2(f). Nothing plants a price key in the scanned source and watches C2(i) redden. This is the exact family charter rule 15 names ("an absence claim that measured true only because the codebase never writes that form at all"), and C8(b) shows the plan already knows the remedy for the arithmetic scanner. **Add a planted-defect row for C2(i), or a named mutation on the scanned file.** Note also the arithmetic: the row says "the eight key names", but the eight C2 rows cover **seven distinct strings** (`currency` appears twice — block and proposal).

**F4 — C1(i)'s stated instrument cannot fail, and it is the instrument §17A.5 prohibits.**
"`JSON.stringify(request)` … show no `undefined` value": `JSON.stringify` *drops* `undefined` values, so that half is true of every object ever passed to it. §17A.5 is explicit — "Relying on `JSON.stringify` dropping `undefined` is prohibited: it produces the right bytes by accident and cannot be mutation-tested." The `Object.entries` deep-walk is the real assertion. C1(i) also carries no named mutation, so the "no `undefined` anywhere" guard ships unproven. **Amend:** drop the `JSON.stringify` half; add a mutation (a helper returning `{ quantity: undefined }` instead of `{}`) whose target is C1(i), not C1(a).

**F5 — C8(c) cannot fail, and the branch it claims to cover is unprobed. (verified)**
Task 4 requires the scanner to exclude "string concatenation of two string literals … by checking operand kinds". C8(c) plants `"a + b"` and `` `${a}-${b}` ``. Parsed with the installed `typescript@6.0.3`, neither produces a `BinaryExpression` at all — the first is a `StringLiteral`, the second a `TemplateExpression` whose `-` is template text. **Any** AST walk passes C8(c), with or without the operand-kind logic. The one form that does produce a `BinaryExpression` is `"a" + "b"` (`PlusToken`, left `StringLiteral`) — the exact case the exclusion branch exists for — and it is not in the fixture list. **Amend C8(c) to plant `"a" + "b"`** and keep the two current strings as a separate row if desired.

**F6 — C8(b) bundles eight sub-checks into one row, and leaves nine detection branches unprobed.**
Task 4 mandates detection of `+ - * / %`, their compound assignments, `< <= > >=`, prefix `-`, `Math.*`, `toFixed`, `Number`, `parseFloat`, `parseInt`. C8(b) plants eight forms: `%`, `>`, `>=`, `<=`, every compound assignment, `Number(`, `parseFloat` and `parseInt` are never planted. Charter rule 2 (enumerate, never sample) and rule 12 (one mutation per sub-check) both bite; §9.0's trimming licence applies to *representative* coverage of one mechanism, and these are distinct branches of a hand-written walk. **Either** enumerate one row per branch, **or** narrow task 4's mandated branch list to what C8(b) actually plants and record the reduction. Do not ship the current pair.

**F7 — C8(b)'s "with its kind" is undecidable.** See D18.

**F8 — C3(h) cannot be written as stated.** See D8. This is the phase's wire-equivalence mechanism (M5, M3) and the row that proves the fake's write-detection instrument can fire; it needs to be exactly right.

**F9 — C4(c)'s locator is undetermined.** See D11. Decidable once fixed; flagged because an index-based locator is a silent time bomb.

**F10 — C5(e) and the read-back rows are undecidable until cards 1 and 2 are answered.** See D3, D4.

**F11 — no row covers `taxOptions`.** See D2. This is an obligation `appliedPricingSchema` imposes that no phase-4 task or criterion discharges, and phase 14 C6(a) will parse against it.

**F12 — phase 14 cannot consume phase 4's output as specified.** See D1. Not a phase-4 test failure; a cross-boundary defect that surfaces two gates later, which is precisely what this gate exists to catch.

---

## What I checked and found sound

Recorded so the coordinator does not re-derive it, and so the plan gets credit where it is right:

- **Counts, criteria identity, and mutation closure.** 8 / 46 / 9, all re-derived from the table, all matching the plan footer and master plan §4. Every row is addressable; every mutation names a file, a site, and a target row.
- **The trace chain closes in both directions** (RC9), with one weak cell (C2 → M1).
- **The recovery-search mechanism is fully determined** and correctly derived: `limit` at the documented maximum with the reasoning from §17A.11 preserved, the three forbidden parameters named, and in-client exact string re-verification with rows for match, mismatch, case difference, and missing key. C4 and C5 are the strongest part of the plan; I found nothing to amend in them beyond D11.
- **The omission mechanism (C1) matches §17A.5 exactly** — spread helpers returning `{}` or `{ key: value }`, no `??`/`||`/default parameters, recipient-with-all-leaves-absent omitted rather than `{}`, each with its own row and two of them with named mutations. Only C1(i)'s instrument is wrong (F4).
- **Price-field unrepresentability is correctly located at the schema**, not at the mapper, which is what makes it fail closed. Only the assertion's wording (F1) and the source-scan row (F2, F3) need work.
- **`http` supports all three operations without change** (RC5), and "never retried" is already discharged by phase 3 (RC6) — no duplicate row needed.
- **The `getProposal` 404 question is correctly out of scope here**: §17A.13's table maps 404 → `not_found_upstream` at the client, and §17A.12's "404 becomes `available: false`" is phase 14's translation, which phase 14 task 3 already carries.

---

## Full write perimeter

**Documents written: 1.**
- `build_docs/under_constroction/initial_core_feature_proposales/handoffs/reviewer/phase-04-projection-round-0.reviewer.md` (this file, new)

**Code changed: none.** **Fixtures changed: none.** **Plan, intention, master plan, tracker: not edited** — the coordinator consumes and routes this ledger, and writes the phase plan's Review log line. **Tool-recorded state: none** (archgraph absent). No mutation probes were applied; no test suite was run.

**Evidence spent.** L4 budget: **zero, and zero spent.** All findings are L1 document/code inspection plus two targeted L1 probes against installed dependencies — one `safeParse` against `zod@4.5.4` (F1) and one `createSourceFile` walk against `typescript@6.0.3` (F5). Both are single-expression scripts in a scratch process; neither touched the repository, the suite, or the tree. No absence claim in this handoff required L4.

**Skeleton appendix: none.** Per doctrine the derivation skeleton is discarded rather than handed to the implementer; every decision it surfaced is in the ledger above as a routed row, not as guidance.
