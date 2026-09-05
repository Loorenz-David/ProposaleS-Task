# Project instructions for Codex

## Architecture context bootstrap

For every meaningful engineering run, apply the repository's Architecture Context policy before material planning, implementation, review, debugging, or refactoring decisions. Read `agent-skills/policy/architecture-context-policy.md` and use `architectural_contracts/01-implementation-contract-guide.md` to select only the applicable architecture contracts. Do not load every contract by default. Do not skip clearly applicable contracts. Trivial edits still perform the lightweight classification; they simply end routing early.

The same capability is exposed as the project skill `.codex/skills/architecture-context/SKILL.md`; this file is the guarantee, the skill is the native form, the policy is the behavior.

## Layers

`AGENTS.md` guarantees the policy is considered on every run. `.codex/skills/architecture-context/SKILL.md` exposes it as a native skill. `agent-skills/policy/architecture-context-policy.md` owns the behavior. `architectural_contracts/01-implementation-contract-guide.md` routes to the contracts. See `agent-skills/README.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
