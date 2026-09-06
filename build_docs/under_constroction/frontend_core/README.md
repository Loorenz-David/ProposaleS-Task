# Proposal Copilot Frontend Core

Pipeline index for the production proposal workspace. The project is in the mechanism-inventory gate; no master plan or phase plan exists yet.

## Authorities

- [Ratified frontend intention](intention/frontend-core-intention.md) — product semantics and the F1–F7 trace root.
- [Design integration guide](ui_design/10-design-integration-guide.md) — read before the other nine [design specifications](ui_design/).
- [Sibling backend project](../initial_core_feature_proposales/master-plan.md) — approved backend contracts are merged from `main` only at its `APPROVED` gates; its ratified intention, especially §17A, is consumed and never redefined here.

## Live pipeline tables

`plans/` · `prompts/{implementer,reviewer,coordinator,maintenance}/` · `handoffs/{implementer,reviewer,coordinator,maintenance}/` · `archive/`

## Gate log

- Intention — `RATIFIED`, round 2 (2026-09-05).
- Inventory round 1 — `PROMPT_READY` (2026-09-06).
- Planning — not started.

## Standing rules until the master plan absorbs them

- The owner's scope brief in the sibling backend master plan §9.0 applies verbatim: “my objective here is to present this application as an mvp ( it will probably won't event be used at all on production, so it won't be persistent over time ) it needs to be senior build but not as a full scale app.” Its application rules, exclusions, and recording rule also apply verbatim.
- Codex implements and Claude reviews. Every implementation and fix cycle checkpoint-commits with `CHECKPOINT (not approved): frontend NN …`.
- Merge `main` only at backend `APPROVED` gates and record each merge in this gate log.
- The frontend never authors or edits a backend-owned schema; it consumes the ratified backend contracts.
- The design specifications are the visual authority. Record design deltas; do not edit a design specification during implementation.
