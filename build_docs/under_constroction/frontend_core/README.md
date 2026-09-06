# Proposal Copilot Frontend Core

Pipeline index. **Everything shared lives in [`master-plan.md`](master-plan.md)** — the tracker,
the contract resolution, the naming registry, the sequencing gates, the environment topology,
the standing rules, the gate log, and the design-delta and follow-up registers. This page is a
pointer, not a second copy.

## Start here

| I need | Read |
|---|---|
| the shared skeleton, the tracker, or a standing rule | [`master-plan.md`](master-plan.md) |
| what the product must be, and why | [`intention/frontend-core-intention.md`](intention/frontend-core-intention.md) — `RATIFIED`, 0 open owner decisions |
| how a surface must look and behave | [`ui_design/10-design-integration-guide.md`](ui_design/10-design-integration-guide.md) first, then [`ui_design/01`–`09`](ui_design/) |
| how code must be written | `architectural_contracts/`, routed through its implementation contract guide |
| commercial, workflow, approval, execution and error truth | the [sibling backend project](../initial_core_feature_proposales/master-plan.md); its ratified intention §17A is consumed and never redefined here |
| what one phase must do | [`plans/`](plans/) — `phase-NN-<slug>.md` |

## Live pipeline tables

`plans/` · `prompts/{implementer,reviewer,coordinator,maintenance}/` ·
`handoffs/{implementer,reviewer,coordinator,maintenance}/` · `archive/pre_plan/` ·
`archive/plan_<n>/`

State is positional: a live row sits in its role folder, a closed row in the archive, and a
state transition is a file move.

## Status

Intention `RATIFIED` (2026-09-05) · mechanism inventory rounds 1 and 2 `PASSED` (2026-09-06) ·
implementation planning round 1 complete (2026-09-06): **17 phases, all `NOT_STARTED`**.
Backend phases 1–3 are merged and `APPROVED`; 4–15 are not started, so phases 01–15 build every
surface on named temporary fixtures and phases 16–17 are gated on backend approvals.

Next: the coordinator opens phase 01 — the projection gate is waivable there, so the next
artifact is either a projection prompt or the phase-01 implementer prompt.
