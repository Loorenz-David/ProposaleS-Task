# Architecture Context

Policy: Architecture Context
Policy version: 1
Status: normative

This is the single authoritative source for how an agent working in this repository acquires architectural context. Platform skill files (`.claude/skills/architecture-context/SKILL.md`, `.codex/skills/architecture-context/SKILL.md`) are adapters to this file; `CLAUDE.md` and `AGENTS.md` only guarantee it is invoked. Routing to individual contracts is owned by [architectural_contracts/implementation-contract-guide.md](../../architectural_contracts/implementation-contract-guide.md); this policy never restates that routing table and never caches contract rules.

## 1. Rule

Before making a material decision about how requested work should be designed, planned, implemented, debugged, reviewed, or refactored, the agent MUST determine whether the task touches concerns governed by the repository's architecture contracts, and MUST read the applicable contracts before reasoning further on those concerns.

This applies before substantive reasoning, not only before writing code. It covers: feature planning; implementation; refactoring; architectural decisions; debugging that may alter structure or behavior; code review; dependency introduction; file or module creation; client/server placement; external integrations; schemas and contracts; persistence; agents, tools, and human-in-the-loop behavior; security-sensitive behavior; testing strategy; feature closeout and durable documentation impact.

## 2. Protocol

1. Understand the task and the intended outcome.
2. Read `architectural_contracts/implementation-contract-guide.md`.
3. Classify the concerns the task touches.
4. Determine which architecture contracts apply, using the guide's routing table and applicability labels.
5. Read the applicable contracts, only the relevant sections, before making material planning or implementation decisions.
6. If modifying an existing feature, read its durable feature documentation (`src/features/<feature>/README.md`) when present.
7. Combine approved intention + current feature documentation + applicable architecture contracts as the implementation context. Contracts govern how; feature documentation describes what exists; the intention describes what should change.
8. Treat applicable MUST rules as constraints.
9. Treat SHOULD rules as defaults; deviate only for a concrete, stated reason.
10. Do not introduce infrastructure or capabilities merely because a contract exists for them.
11. If contracts conflict with the approved intention, with existing implementation, or with each other, apply the conflict protocol in the guide (§6). Do not silently choose, weaken, or normalize.
12. After implementation, verify actual behavior.
13. Before closeout, perform the documentation impact review required by `architectural_contracts/documentation-principles.md` §8.

## 3. Classification before reasoning

Classification happens before the first design idea, so that the contract shapes the idea rather than auditing it afterwards.

```
"Remember generated proposals between browser sessions."
    → durable application-owned state detected
    → guide: database-and-persistence.md applies
    → read it → first decide whether persistence is justified at all
    (not: "add Prisma + Postgres")

"Call Proposales directly from this React component."
    → browser code, external system, secrets, trust boundary detected
    → guide: client-architecture, runtime-boundaries, integrations, security-and-trust-boundaries
    → read them → decide whether the requested shape is acceptable before implementing
```

## 4. Fast path

Every meaningful engineering run performs the classification. Classification is lightweight; deep contract loading is not. The classification MAY conclude that no material architecture concern requires deeper loading, for example: typo or spelling fixes; purely editorial comment changes; formatting; an isolated visual adjustment with no state, boundary, or behavior implication; a mechanical rename whose impact is already clearly bounded. In those cases routing ends early. The policy itself is never bypassed.

## 5. Minimum sufficient authoritative context

The target is minimum sufficient authoritative context: not the whole corpus, not the least possible reading. The agent MUST NOT load every contract by default, and MUST NOT skip a clearly applicable contract to save tokens. The guide's routing table and each contract's applicability block are the selection mechanism.

## 6. By activity

- **Planning.** A substantive plan lists its applicable contracts by filename (`Applicable contracts` section) and shows their constraints in tasks, acceptance criteria, design boundaries, testing, and documentation closeout. It does not reproduce the contracts. Trivial work with no formal plan may keep the classification implicit unless surfacing it adds value.
- **Implementation.** Follow §2. If the plan's contract list is incomplete, add the missing contract and say so.
- **Review.** Run the protocol in reverse: diff → concerns touched → guide → applicable contracts → review the diff against them. A review judges contract preservation, not only whether the code works.
- **Debugging.** Observation and log inspection need no deep reading. Before proposing or applying a structural fix that touches boundaries, persistence, server authority, schemas, external adapters, agent behavior, security, or state ownership, load the applicable contracts. Debugging is not a backdoor around architecture.
- **Refactoring.** Same routing as implementation; behavior preservation does not exempt boundary contracts.
- **Closeout.** Verified implementation → "could durable documentation now be false or incomplete?" → yes: apply documentation-principles §8; no: no mechanical rewrite.

## 7. Contracts evolve; this policy does not track them

This policy never summarizes, copies, or caches architecture rules. It always routes through the implementation contract guide, which routes to the current contracts. Adding or changing a contract updates the guide, not this policy.

## 8. Maintenance

Update this policy when bootstrap behavior, the routing lifecycle, applicability behavior, or conflict handling changes; bump `Policy version` and update the `Implements policy version` line in both adapters in the same change. Update adapters only when the policy version or path changes, or a native skill format changes. Update `CLAUDE.md` / `AGENTS.md` only when the bootstrap entry point, path, or invocation changes. Adding an architecture contract updates `architectural_contracts/implementation-contract-guide.md`, not this file.
