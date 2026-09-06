---
plan: plans/phase-08-ai-provider-boundary.md · plans/phase-09-agent-runtime.md · plans/phase-10-conversation-context.md
role: coordinator
round: 3
date: 2026-09-06
---

# Resume Astra window 01 from the completed Phase 08 projection

Workspace `/Users/davidloorenz/Desktop/Developer/Proposales`, branch `main`. Never enter the
sibling frontend worktree. This is a coordinator continuation, not an implementer prompt.
The plan files own tasks and criteria; where this prompt differs, the plan files win, subject
to their higher semantic/architecture authorities and the owner's current instructions.

Read `/Users/davidloorenz/agent-skills/pipeline-charter.md` and
`/Users/davidloorenz/agent-skills/pipeline-coordinator.md` first. Apply the repository's
Architecture Context policy and routing guide. Then read:

1. `build_docs/under_constroction/initial_core_feature_proposales/master-plan.md` in full,
   especially §3A, §4, §5–6, §9–11.
2. That folder's `prompts/astra_prompts/astra-window-01-phases-08-10.prompt.coordinator.md`.
3. `handoffs/coordinator/astra-window-01-round-3.handoff.coordinator.md`.
4. `handoffs/reviewer/phase-08-projection-round-0.handoff.reviewer.md` in full.
5. `plans/phase-08-ai-provider-boundary.md` in full and its Read-first authorities.

## Gate and state

Verify content, not a fixed SHA or a clean-tree requirement: intention `RATIFIED`; tracker and
headers 01–07 `APPROVED`; 08 `PROJECTED`, implementation gate closed; 09–10 `NOT_STARTED`;
`src/lib/ai` absent and candidate vendor packages not yet installed. Re-read the live report
tables and git status; if subsequent work exists, resume it rather than repeating this snapshot.

The initial header bookkeeping and the subsequent usage-limit blocker were resolved by the
owner. Their round-1/round-2 coordinator reports are historical, not current owner questions.
The completed projection contains **one pending owner card** on adding `request_rejected`
and `invalid_response`. Check the current conversation and artifacts for the owner's answer;
do not ask again if already answered. Silence does not approve a semantic amendment.

## Exact next action

If the card is unanswered, relay it verbatim and hold implementation. If answered, fold the
answer into its authoritative home first (intention §17A.13 and its ratification/changelog
record, then master §6.3, then Phase 08 task 5/C4); preserve the owner-selected semantics.
Then finish routing **every** D01–D24 ledger row. D18, D24 and the existing D16–D17 authority
are disposed in the phase Review log; other proposals are not already implemented amendments.
Fix concrete `AgentMessage`/SDK mappings, the production `callModel` proof seam, structured
output/retry handling, error-boundary coverage, timeout verification, source-guard mutations,
per-field usage proofs and trace cells before compiling the implementer prompt.

Do not silently adopt every recommendation: compare each to the authority. In particular,
all modules including AI types carry `server-only` under master §6.1; D20's wording cannot
waive that. No predecessor refactor is authorized by D19. Master §6 amendments follow the
window's owner gate; route any additional required owner decision explicitly rather than
inventing new modules/constants/reason members. Existing private helper choices need no new
architecture.

Re-derive criteria/rows/mutations with summands, update master §4 and §7.2 after folds, rerun
the pre-dispatch manifest checks, record the explicit delegation list and enumerate the final
named mutations. Only after owner decisions and every ledger row are routed may Phase 08
move to `PROMPT_READY` and an implementation sub-context begin. Continue serially through
independent implementation/review/fix/re-review/approval, then phases 09 and 10; stop before 11.

## Evidence and continuity

This window has run **zero tests, L4 stamps, mutations, installs or provider calls**. Projection
is paper evidence only, not a green implementation baseline. Existing approved baseline is
phase 07's 24 files / 335 tests; its historical caveats remain. The usual closing stamp is
exactly one per implementation/fix cycle; Phase 08's dependency-changing cycle and every
approval gate additionally run E2E/build. Named mutations must actually run and be reverted.
`tsconfig.tsbuildinfo` is tracked; attribute it, never silently absorb it in a narrower commit.

User instruction: “keep an eye between time to see if the usage will be approach, then make
sure to create a checkpoint where i can continue with another ai model i have session.”
Current tools expose no account-credit meter, and Browser discovery returned no browser.
Do not infer balance from goal tokens. Keep cycle/phase handoffs durable; if a usage signal
arrives, write a WIP checkpoint and exact remaining-work/evidence handoff before stopping.
If the owner selects another model/session, preserve distinct role contexts and reviewer
capability; do not misattribute the actual model as Astra. Do not auto-substitute a model.

The prior projection sub-context completed; no agent or test process needs to remain alive
for this checkpoint to be usable. Preserve historical handoffs; archive spent rows with the
phase-08 approval commit using collision-safe `.prompt.` / `.handoff.` names.
