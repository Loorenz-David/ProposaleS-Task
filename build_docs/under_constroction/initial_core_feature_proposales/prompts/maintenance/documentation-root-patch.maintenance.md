---
plan: none — repository maintenance, outside this feature's phases
role: maintenance
round: 1
date: 2026-09-05
project: initial_core_feature_proposales (origin only; the change is repository-wide)
status: OPEN — not dispatched
---

# Maintenance row — documentation-root patch (`docs/` → `build_docs/`)

**This is a dedicated change, not part of the Proposal Preparation Backend feature.**
Contract guide §6 ("the contract is stale: patch the contract in its own change, with
rationale") is why it is a separate row rather than a fold-back. Do not bundle it into
a feature phase.

## Why it is open

The owner renamed this application's documentation root to `build_docs/` (owner
decision, round 1; recorded in the intention §2.1 and §20A item 2). Three current-state
documents still name `docs/` as the home of intentions, implementation plans,
decisions, and investigations. Current-state documents that are false are the class
contract 14 exists to prevent.

## Known stale surfaces (verify at source; do not trust this list as complete)

| Document | Where | What it says |
|---|---|---|
| `architectural_contracts/14-documentation-principles.md` | §2 hierarchy diagram; §3 artifact-class table; §4 ownership table | `docs/intentions/`, `docs/implementation/<project>/`, `docs/decisions/`, `docs/investigations/` |
| `README.md` (root) | "Documentation map", last bullet | intentions, plans, decisions, investigations "under `docs/`. Neither exists yet." Both halves are now false: the root is `build_docs/` and it holds a ratified intention plus its evidence doc. ("Repository structure" does not currently name a documentation root — check whether it should.) |
| `architectural_contracts/01-implementation-contract-guide.md` | §7 authority table | artifact classes addressed by `docs/…` paths |
| `architectural_contracts/README.md` | repository-layout tree; the "planning artifacts live under `docs/`" note; the decision-record pointer | `docs/` |

Sweep for others (`grep -rn 'docs/' --include='*.md'` at the repository root) rather
than treating the table as exhaustive.

## Constraints for whoever takes it

- Contract 14 governs **where** the implementation folder lives; the pipeline charter
  owns its **internal** layout. Patch the location only; do not restate the charter
  layout into the contract.
- Contract 14 §2's "created on first need" rule stays as written.
- Patch in place. These are current-state documents: no changelog appendices, no
  "formerly `docs/`" annotations (contract 14 §1: obsolete behaviour is removed, not
  annotated).
- Verify the `under_constroction/` / `archived/` split that `build_docs/` actually uses
  and document what is true, not what is tidy. (The existing folder name is spelled
  `under_constroction`; renaming it is a separate decision for the owner, not a
  silent fix inside this patch.)
- Do not move the intention or its evidence doc. They stay at
  `build_docs/under_constroction/initial_core_feature_proposales/planing/` by owner
  decision (intention §20A item 2).

## Source of truth for this item

Intention §20A item 2 and §2.1. If those two disagree with this row, they win.
