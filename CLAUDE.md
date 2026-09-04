# Project instructions for Claude Code

## Architecture context bootstrap

Before making a material engineering decision (planning, implementing, reviewing, debugging, or refactoring), follow the repository's Architecture Context policy, imported below. Use `architectural_contracts/01-implementation-contract-guide.md` to determine which contracts apply. Do not load every contract by default. Do not skip clearly applicable contracts. Trivial edits still perform the lightweight classification; they simply end routing early.

@agent-skills/policy/architecture-context-policy.md

## Layers

`CLAUDE.md` guarantees the policy is considered on every run. `.claude/skills/architecture-context/SKILL.md` exposes it as a native skill. `agent-skills/policy/architecture-context-policy.md` owns the behavior. `architectural_contracts/01-implementation-contract-guide.md` routes to the contracts. See `agent-skills/README.md`.
