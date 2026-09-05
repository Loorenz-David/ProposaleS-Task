---
plan: none — this session authored the master plan and the 14 phase plans
role: coordinator
round: 1
date: 2026-09-05
state: PLANNED — tracker all NOT_STARTED
verdict: PLAN SET WRITTEN — one owner card outstanding (does not block phases 1–9)
actor: Claude (Opus 5 / Fable 5.1, implementation-planner doctrine)
project: initial_core_feature_proposales
feature: Proposal Preparation Backend
---

# Handoff — implementation planning round 1

## Summary

All five gate-check rows passed (intention `RATIFIED`; §17A.0–§17A.16 present; §17.1 reads `RATIFIED`; §23 round 7 records the owner, the date, and all eleven of M8–M18 ratified with none cut; `README.md` said "not written" and `plans/` was empty). The contract selection was re-derived from the guide and equals intention §2.2 (twelve selected, `05` excluded, nothing added); twelve local resolutions are recorded in master plan §5.

Output: `master-plan.md` (shared skeleton: contract resolution, naming registry with every module, schema, constant, signature and fixture fixed, sequencing with the true dependency graph, ledger and §22 coverage maps, standing rules, verified environment topology, the absorbed index and follow-up register) and fourteen phase plans in `plans/`, every criterion row addressable with an exact expected outcome, a named mutation where it guards a construction, and a trace cell. Counts derived by script from the files: **95 criteria, 431 rows, 60 named mutations**; largest phases carry 8 criteria (4, 5, 6, 10, 11, 13); none exceeds the charter target. All eighteen ledger entries are served (zero gaps); all 23 intention criteria are distributed. The project `README.md` was reduced to a pointer; its content lives in master plan §11.

## ⚠ OWNER DECISIONS REQUIRED (1)

### Card 1 — Where does the app learn the company's currency before a draft exists?

**Question.** For the "brief states a different currency" warning, may the app read the company record from Proposales during preparation (option A), or should that warning move to after the draft is created (option B)?

**Story.** A client brief says "budget around 120 000 SEK", but your Proposales company bills in euros. You wanted a warning on the proposition — before approval — so nobody approves a structure believing the money is in kronor. To compare, the app needs the company currency, and nothing in the agreed list of Proposales calls returns it before creation. Proposales does expose it on the company record; reading that is one extra harmless read per preparation.

**Branches.** A — one company read per preparation; the warning appears on the proposition as designed. · B — no extra read; the warning appears only in the creation result, next to the applied prices. · C — drop the pre-creation comparison; keep the stated currency as a reviewer note only.

**Recommendation.** A: it is a read, preparation may read Proposales, and it keeps the warning where you asked for it.

**On silence.** The gate holds for that one criterion only (phase 10 C7); phases 1–9 proceed.

**Trace.** intention §9.2, §12.1, §21.1(l), §22 criterion 23; evidence §2, §8.1; master plan §12; phase 10 C7.

## 1. Gate check

| # | Check | Result |
|---|---|---|
| 1 | status header | `RATIFIED` (2026-09-05, owner David, §21.1 surface) |
| 2 | §17A present | §17A.0–§17A.16, 17 subsections |
| 3 | §17.1 ratified | heading reads **RATIFIED** (2026-09-05, by the owner, David) |
| 4 | human act recorded | §23 round 7 and §21.2: owner, date, all eleven ratified, none cut |
| 5 | work outstanding | README "Master plan — not written"; `plans/` held only `.gitkeep` |

## 2. What was written

| Artifact | Path | Size |
|---|---|---|
| Master plan | `master-plan.md` | 12 sections, ~510 lines |
| Phase plans | `plans/phase-01-topology-and-env.md` … `plans/phase-14-closeout.md` | 14 files, 71–100 lines each |
| Project index | `README.md` | rewritten as a pointer (absorbed into master plan §11) |
| This handoff | `handoffs/coordinator/implementation-planning-round-1.coordinator.md` | |

### 2.1 Phase set (derived counts)

| # | Phase | Criteria | Rows | Mutations | Projection |
|---|---|---|---|---|---|
| 1 | Repository topology and environment | 5 | 17 | 6 | waivable |
| 2 | Errors, logger, shared value shapes | 6 | 37 | 5 | mandatory |
| 3 | Proposales: transport, error translation, content read | 5 | 31 | 3 | mandatory |
| 4 | Proposales: create, recovery search, read-back, Applied Pricing | 8 | 46 | 9 | mandatory |
| 5 | Proposition schema and structural provenance | 8 | 60 | 5 | mandatory |
| 6 | Information items, clarification, workflow state, identity | 8 | 45 | 5 | mandatory |
| 7 | Content ranking domain and human search | 7 | 28 | 3 | mandatory |
| 8 | AI provider boundary | 6 | 26 | 4 | mandatory |
| 9 | Agent runtime: tool definition, run loop, budgets, read tools | 6 | 22 | 4 | mandatory |
| 10 | Prepare from brief and clarification turns | 8 | 22 | 4 | mandatory |
| 11 | Manual edits, human search, agent revision | 8 | 25 | 2 | mandatory |
| 12 | Approval validation, envelope, diff, terminality | 7 | 25 | 4 | mandatory |
| 13 | Execution: recovery, create, read-back, result | 8 | 32 | 4 | mandatory |
| 14 | Whole-workflow proof, isolation scans, live suites, documentation | 5 | 15 | 2 | waivable |

Fourteen phases rather than the inventory's five clusters, as the inventory predicted: sized by criteria count. The linear order front-loads both adapters so every feature phase runs against complete fakes; the true dependency graph (master plan §7.1) shows phases 4 and 8 could be deferred if the coordinator ever needs to reorder.

### 2.2 Items carried from the inventory gate into the shared skeleton

Environment topology with the AI variables, no defaults, and placeholder values in the test setup (master plan §6.2, §10.4; phase 1). Fixture catalog larger than the candidate cap, asserted inside the tests that use it (§6.7, §9 rule 6; phase 7). The four handed-down named mutations sit on their criteria: `inferred` in the consequential union (5.C2 / MUT-05-1), quantity helper default (4.C1 / MUT-04-1), computed total (4.C6 / MUT-04-7), string model id (8.C1 / MUT-08-1). `failed` as the fifth result state (§6.3). No criterion for "second execution within one turn" or for `derived` provenance (§7.4). Missing acknowledgment is `validation_error` (12.C3). No rounding rule anywhere; the pricing mapper is source-scanned for arithmetic with a planted-defect row (4.C8).

## 3. Findings for the coordinator

**F1 — intention §17A.15 phrasing is inaccurate against the installed SDK (editorial fold-back; mechanism unchanged).** `ai@7.0.92` declares `type LanguageModel = GlobalProviderModelId | LanguageModelV4 | LanguageModelV3 | LanguageModelV2` (`node_modules/ai/dist/index.d.ts` line 112) — the SDK's language-model type *includes* the string id. §17A.15 says the internal signatures accept "the SDK's language-model type, which a `string` does not satisfy". The correct construction is `Exclude<LanguageModel, string>`, fixed in master plan §6.4 as `LanguageModelInstance`; the named mutation still works (phase 8 C1(c)/(d)). Recommend a one-line lettered amendment via the mechanism-inventory delta path; no gate re-opens. Recorded as follow-up 4.

**F2 — the company-currency source is missing from the intention's operation list** (card 1). Phase 10 C7 is written as *held*; phases 4 and 5 already carry the representable halves (no currency on the request; `currency_mismatch` warning kind and the stated-currency note in the schema).

**F3 — `server-only` was not installed** although contract 02 §3 requires it on every server module, and **the boundary lint rules of 02 §7 / 03 §4 were never added** at scaffold time. Both are absorbed by phase 1 (master plan R7, R8). See F9: the install has since happened outside this session.

**F4 — `server-only` throws when imported under Vitest** outside a React server context; the node project aliases it to an empty stub (master plan §10.3). Vitest 5's inline `test.projects` is assumed; phase 1 falls back to a workspace file if needed and updates §10.3.

**F5 — no transport in v1** (master plan R3). Intention §16.2 forbids an unprotected execution path in a deployment with no authentication; services are the primary interface and the opt-in live suites are the manual-exercise surface. A development harness would be a later, separate change.

**F6 — the editor-URL origin is deployment configuration** (`PROPOSALES_EDITOR_ORIGIN`, R11) because the origin is not established in the evidence doc; phase 14's live smoke records the observed origin, the catalog count, and its language set for the coordinator to fold into the evidence doc (§20 capture tasks). See F9 for an owner-supplied candidate value.

**F7 — two intention shapes were resolved in the naming registry, both allowed by §17A.0 rule 1:** `recipient` is object-level `KnownOrAbsent` rather than "SourcedOrAbsent" because leaf granularity forbids an object-level source (phase 5 notes); model-output-invalid is a `failed` domain result carrying `code: "validation_error"` rather than a thrown error, matching the budget-exhaustion shape (R9).

**F8 — two registry additions beyond §17A:** `tool_output_invalid` as a run-failure reason (08 §3 requires tool-output validation) and the `editor_url_origin_unexpected` / `inline_recipient_may_duplicate_contact` result notices (§9.2 surface (k) requires the duplicate risk to be stated to the human).

**F9 — three repository files changed on disk during this session, by another actor, not by this session.** `git status` at session start listed only the intention and evidence doc as modified; at session end `package.json` (+`"server-only": "^0.0.1"`, mtime 10:25), `package-lock.json` (7 insertions, 10:25), and `.env.example` (10:57) are also modified. The `.env.example` change adds the five new variables with **filled values** (`PROPOSALES_EDITOR_ORIGIN=https://secure.proposales.com`, `AI_PROVIDER=openai`, `AI_MODEL=gpt-5.6-luna`, empty keys). Two consequences the coordinator should route: (a) contract 02 §8 requires `.env.example` to carry **empty** values — phase 1 task 7 normalizes it (values to the README's "safe example" column, not the inventory file); the `server-only` install satisfies phase 1 task 1 early, and phase 1's handoff must still record the resolved version. (b) `https://secure.proposales.com` is now an **owner-stated candidate** for the editor origin; it is not established (evidence §2 explicitly excludes `secure.proposales.com` endpoints from the *API* contract, which says nothing about the editor host). Record it in the evidence doc §7 as "owner-stated, unverified" until phase 14's smoke confirms it against a create response. This session did not modify these files and makes no claim about them beyond the diff it read.

## 4. Coverage (derived by script from the trace cells)

Every ledger entry M1–M18 has at least one serving row; every §22 criterion has at least one owning row; the tables are master plan §7.2 and §7.3. Criterion 23 is the only one with a held row (10.C7). Criteria 13 and 23 have an opt-in live half (14.C3) because "the title is in the proposal language" is a model behavior a scripted fake cannot demonstrate; the structural half (language passed as data, resolved against the catalog) is in phase 10.

## 5. What the coordinator does next

1. Relay card 1 verbatim. Phases 1–9 do not depend on the answer.
2. Route F9 (normalize `.env.example`; record the candidate origin) and F1 (lettered amendment to §17A.15).
3. Lint the plan set before dispatching phase 1 (references resolve at source; counts derived — re-run §7's script after any amendment; rows addressable; trace cells resolve; ≤ 8 criteria per phase).
4. Dispatch phase 1: waivable projection; compile the implementer prompt from `plans/phase-01-topology-and-env.md` with master plan §10 as the environment authority, noting that task 1 is already done on disk.
5. The owner commits the plan set together with the mechanism-inventory delta and the F9 changes; nothing was committed by this session.

## 6. Write perimeter (full; verified with `git status --porcelain` at session end)

| Path | Change |
|---|---|
| `build_docs/under_constroction/initial_core_feature_proposales/master-plan.md` | created |
| `…/plans/phase-01-topology-and-env.md` … `…/plans/phase-14-closeout.md` (14 files) | created |
| `…/README.md` | rewritten (untracked before this session; now a pointer) |
| `…/handoffs/coordinator/implementation-planning-round-1.coordinator.md` | created (this file) |

**No other writes by this session.** No code, no `src/`, no `package.json` or lockfile change, no package installed, no commit, no change to the intention, the evidence doc, the prompts, or `archive/`. Archgraph not present; skipped. The pre-existing dirty set (intention, evidence doc, `prompts/coordinator/`, `prompts/maintenance/`, `archive/pre_plan/`) is untouched. The three files in F9 are outside this perimeter. Read-only verification commands run for master plan §10.2: `npm test` (5 files, 7 tests, pass, 914 ms), `npm run typecheck` (clean), `npm run lint` (clean), `npm view @ai-sdk/anthropic version` / `@ai-sdk/openai version` (4.0.49 / 4.0.59), `git rev-parse HEAD` (`c588a0c`).

## 7. Derivation script (for re-running the counts and coverage)

Run from the project folder; prints per-phase (criteria, rows, mutations), the ledger map, and the §22 map. The version used in-session also rewrote each phase's `Criteria: …` line and master plan §4 totals, §7.2, §7.3.

```
python3 - <<'PY'
import re,glob,collections
files=sorted(glob.glob('plans/phase-*.md')); ledger=collections.defaultdict(set); crit=collections.defaultdict(set); per={}
for f in files:
    n=int(re.search(r'phase-(\d+)',f).group(1)); txt=open(f).read(); ids=set(); rows=0
    for l in [l for l in txt.splitlines() if re.match(r'\|\s*C\d+',l)]:
        c=[x.strip() for x in l.strip().strip('|').split('|')]; m=re.match(r'C(\d+)',c[0]); ids.add(int(m.group(1)))
        s=re.search(r'\(([a-z])[–-]([a-z])\)',c[0]); rows+=(ord(s.group(2))-ord(s.group(1))+1) if s else 1
        b=f"{n}.C{m.group(1)}"
        for mm in re.findall(r'\bM(\d+)\b',c[-1]): ledger[int(mm)].add(b)
        for cc in re.findall(r'crit(?:erion)?\s*(\d+)',c[-1]): crit[int(cc)].add(b)
    per[n]=(len(ids),rows,len(set(re.findall(r'MUT-%02d-\d+'%n,txt))))
print(per); print({f"M{m}":sorted(v) for m,v in ledger.items()}); print({c:sorted(v) for c,v in crit.items()})
PY
```
