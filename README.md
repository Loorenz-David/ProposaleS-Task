# Proposal Copilot

An AI-assisted proposal workflow built on the [Proposales](https://proposales.com) API. Its intended shape is a Next.js App Router application, deployed on Vercel, in which an agent gathers information and prepares proposal data, a human reviews and approves it, and the approved payload is created in Proposales deterministically.

## Status

**Pre-implementation.** This repository currently contains reference material and normative architecture contracts. No application code, `package.json`, or build tooling exists yet. Nothing described under "Intended user flow" is implemented.

## Intended user flow (planned, not implemented)

```
Human intent → agent reasons and gathers information → agent prepares a proposal
→ human corrects and approves → deterministic Proposales mutation
→ human reviews in Proposales and performs the final consequential action there
```

The rules that will govern that flow are already fixed in [architectural_contracts/08-agent-architecture.md](architectural_contracts/08-agent-architecture.md).

## What exists today

| Path | Purpose |
|---|---|
| [architectural_contracts/](architectural_contracts/README.md) | Normative engineering contracts every implementation must follow. Start with its README. |
| [api-documentation/proposales/](api-documentation/proposales/README.md) | Read-only snapshot of the official Proposales documentation and OpenAPI spec. Refreshed by script, never hand-edited. |
| [scripts/update-proposales-api-docs.sh](scripts/update-proposales-api-docs.sh) | Refreshes that snapshot. |
| `.env.example` | Names the environment variables the application will read, with empty values. |
| [agent-skills/](agent-skills/README.md) | Shared agent policies. `CLAUDE.md` and `AGENTS.md` bootstrap the Architecture Context policy for Claude Code and Codex; `.claude/skills/` and `.codex/skills/` hold the platform adapters. |

## Architecture in three sentences

Client code owns interaction. Server code owns authority. Shared code owns contracts.

One repository, one deployment unit, two runtimes. Secrets, external calls, agent execution, and mutations stay on the server. The full set of principles, boundaries, and decisions lives in [architectural_contracts/](architectural_contracts/README.md); the resolved decisions table there records what has been settled and why.

## Environment

Read only by server code. No variable is exposed to the browser.

| Variable | Purpose | Required | Kind |
|---|---|---|---|
| `PROPOSALES_API_KEY` | Bearer token for the Proposales API | yes | server-only secret |
| `PROPOSALES_COMPANY_ID` | The single Proposales company this deployment operates on | yes | server-only configuration |

Copy `.env.example` to `.env` and fill in the values. `.env` is ignored by git.

## Commands

Only one command exists at this stage. Run it from the repository root:

```
./scripts/update-proposales-api-docs.sh
```

Application commands (install, dev, test, lint, build) will be added to this section when the application is scaffolded and the scripts exist. The scaffold conventions are fixed in the contracts README's "Scaffold decisions record".

## External integrations

- **Proposales**: system of record for proposals and content. Vendor reference under [api-documentation/proposales/](api-documentation/proposales/README.md). How this application uses it will be documented in `src/lib/proposales/README.md` once the adapter exists.
- **AI model provider**: not yet selected; will be wrapped behind `src/lib/ai/` per [architectural_contracts/07-integrations.md](architectural_contracts/07-integrations.md).

## Current scope and limitations

- Single Proposales company per deployment.
- No application database, by decision. See [architectural_contracts/09-database-and-persistence.md](architectural_contracts/09-database-and-persistence.md).
- No application-level authentication.

## Documentation map

- Engineering contracts: [architectural_contracts/README.md](architectural_contracts/README.md)
- Which contracts apply to a task (first read for coding agents): [architectural_contracts/01-implementation-contract-guide.md](architectural_contracts/01-implementation-contract-guide.md)
- How documentation is organized and maintained: [architectural_contracts/14-documentation-principles.md](architectural_contracts/14-documentation-principles.md)
- Feature documentation will live at `src/features/<feature>/README.md`; intentions, plans, decisions, and investigations under `docs/`. Neither exists yet.
