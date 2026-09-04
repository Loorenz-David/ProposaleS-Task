# Agent skills

Cross-platform agent behavior for this repository, structured as three layers with one owner per layer:

```
shared policy            agent-skills/policy/<skill>-policy.md          owns the behavior (authoritative)
        ↓
platform adapters        .claude/skills/<skill>/SKILL.md                exposes the capability in Claude Code's native skill form
                         .codex/skills/<skill>/SKILL.md                 exposes the capability in Codex's native skill form
        ↓
auto-loaded bootstrap    CLAUDE.md, AGENTS.md                           guarantees the behavior is considered on every run
```

For architecture context there is a fourth, downstream layer that the policy routes to and never copies: `architectural_contracts/01-implementation-contract-guide.md`, which routes to the architecture contracts themselves.

## What is authoritative

| File | Role | Authoritative for |
|---|---|---|
| `agent-skills/policy/architecture-context-policy.md` | shared policy | the behavior |
| `.claude/skills/architecture-context/SKILL.md` | Claude adapter | Claude-native metadata and invocation only |
| `.codex/skills/architecture-context/SKILL.md` | Codex adapter | Codex-native metadata and invocation only |
| `CLAUDE.md`, `AGENTS.md` | bootstrap | that the policy is invoked on every run |

Adapters and bootstrap files contain no behavioral rules of their own. If a behavioral rule appears in more than one of these files, that is a defect: move it back to the policy.

## Synchronization

- Any behavioral change is made in the shared policy first. Bump its `Policy version`.
- Both adapters carry `Implements policy version: N` and MUST match the policy in the same commit. Adapters change only when the policy version or path changes, or when a platform's native skill format changes.
- Bootstrap files change only when the entry point, path, or invocation changes. They reference the policy path and carry no version.
- Claude and Codex are never given independently authored behavioral rules.

## Adding a cross-platform skill

1. Write `agent-skills/policy/<skill>-policy.md` with the header `Policy: <Name>`, `Policy version: 1`, `Status: normative`.
2. Add `.claude/skills/<skill>/SKILL.md` and `.codex/skills/<skill>/SKILL.md` as pointer adapters: frontmatter `name` and `description`, a line naming the shared policy path, `Implements policy version: 1`, and the instruction to read and follow the policy. Nothing else.
3. Add a bootstrap line to `CLAUDE.md` and `AGENTS.md` only if the skill must be considered on every run; otherwise rely on native skill discovery.
4. Add the skill to the table above.

Only `architecture-context` exists today. Do not add skill folders speculatively.

## What this is not

Markdown plus the platforms' native instruction and skill mechanisms. No MCP server, retrieval service, registry, or background process is involved; the agent reads the files and makes the routing decision itself.
