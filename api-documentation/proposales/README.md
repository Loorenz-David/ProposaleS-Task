# Proposales API documentation

This directory is a local snapshot of the official Proposales documentation.

- Source index: <https://docs.proposales.com/llms.txt>
- OpenAPI source: <https://docs.proposales.com/openapi.json>
- `llms.txt` is the documentation index and lists the Markdown pages in this snapshot.
- `openapi.json` is the machine-readable API contract.
- Refresh it with `./scripts/update-proposales-api-docs.sh` from the repository root.

Coding agents should prefer these local files when answering implementation questions about the Proposales API. This directory is reference material, not application source code.

Every file here except this README is vendor content and is never edited by hand; the refresh script replaces them wholesale and carries this README over unchanged. Our own interpretation of the API (endpoints used, quirks, mappings) belongs in the integration documentation at `src/lib/proposales/README.md` once the adapter exists, per [architectural_contracts/14-documentation-principles.md](../../architectural_contracts/14-documentation-principles.md) §9.

## After a refresh

The refresh is mechanical: it replaces the snapshot and the resulting git diff is the signal. Reviewing that diff is part of the refresh, not optional follow-up.

> Vendor documentation refresh detects possible contract drift; dependency-aware review determines whether application action is required.

1. Inspect the diff of `openapi.json` and the Markdown pages.
2. Decide whether any change touches behavior the application currently relies on. That behavior is represented in:
   - assumptions in the Proposales adapter (`src/lib/proposales/`);
   - the integration documentation (`src/lib/proposales/README.md`);
   - runtime schemas for Proposales requests and responses;
   - tests and recorded fixtures for the adapter;
   - known vendor quirks and workarounds (for example timestamp units, `company_id` placement, error body shape);
   - endpoint, request, or response behavior the product depends on.
3. If the diff touches any of those, the affected behavior MUST be re-evaluated. Where necessary, in order:
   1. verify the new public contract in the refreshed snapshot;
   2. perform runtime verification against the API if the public contract remains ambiguous;
   3. patch the adapter, schemas, and tests;
   4. patch the authoritative integration documentation;
   5. remove superseded assumptions rather than appending contradictory notes.
4. If the diff does not touch behavior the application relies on, no further review is required beyond the diff inspection. Record nothing.

A refresh never requires a full audit of the Proposales API. Only the parts the application depends on are re-evaluated, and only when the diff reaches them.

While no adapter exists, step 2 reduces to checking whether the diff changes anything the architecture contracts or plans already assume about Proposales (see the "Resolved decisions" table in [architectural_contracts/README.md](../../architectural_contracts/README.md)).
