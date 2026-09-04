---
name: architecture-context
description: Codex adapter for the repository's shared Architecture Context policy. Use before any material planning, implementation, review, debugging, or refactoring decision to classify the concerns touched and load only the applicable architecture contracts via architectural_contracts/implementation-contract-guide.md.
---

# Architecture Context — Codex adapter

Shared policy: `agent-skills/policy/architecture-context-policy.md`
Implements policy version: 1

This file is an adapter, not a source of truth. Read the shared policy now and follow it as this session's rule for acquiring architectural context. The policy routes through `architectural_contracts/implementation-contract-guide.md`, which selects the applicable contracts; do not load every contract by default and do not skip a clearly applicable one.

## Codex-specific extensions

None. Deltas that apply only to Codex belong here and win over the shared policy for this platform only. Behavioral changes go to the shared policy, never here.
