# Project instructions for Codex

## Architecture context bootstrap

For every meaningful engineering run, apply the repository's Architecture Context policy before material planning, implementation, review, debugging, or refactoring decisions. Read `agent-skills/policy/architecture-context-policy.md` and use `architectural_contracts/implementation-contract-guide.md` to select only the applicable architecture contracts. Do not load every contract by default. Do not skip clearly applicable contracts. Trivial edits still perform the lightweight classification; they simply end routing early.

The same capability is exposed as the project skill `.codex/skills/architecture-context/SKILL.md`; this file is the guarantee, the skill is the native form, the policy is the behavior.

## Layers

`AGENTS.md` guarantees the policy is considered on every run. `.codex/skills/architecture-context/SKILL.md` exposes it as a native skill. `agent-skills/policy/architecture-context-policy.md` owns the behavior. `architectural_contracts/implementation-contract-guide.md` routes to the contracts. See `agent-skills/README.md`.
