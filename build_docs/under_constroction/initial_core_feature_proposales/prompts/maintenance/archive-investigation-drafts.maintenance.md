---
plan: none — owner action in an external system
role: maintenance
round: 1
date: 2026-09-05
project: initial_core_feature_proposales
status: OPEN — owner action, no agent prompt
actor: owner (David)
---

# Maintenance row — archive the disposable investigation drafts in Proposales

**Owner action. No agent takes this row.** The drafts live in the Proposales UI, and
this application writes nothing to Proposales outside an approved execution path.

## What it is

The price-override investigation (owner-run, 2026-09-05) created 18 tagged disposable
proposal drafts against one disposable content item. None was sent. The intention lists
their archiving as the investigation's remaining housekeeping.

## Where the list lives

`build_docs/under_constroction/initial_core_feature_proposales/planing/proposales-source-evidence.md`
§8.5 — the 18 draft UUIDs, verbatim. They are not copied here; the evidence doc is
their single home.

Method and results that produced them: evidence doc §8.1–§8.4.

## Why it is tracked rather than forgotten

Intention §20A item 1 names it as the investigation's open remainder. The drafts are
live objects in the owner's Proposales company; left in place they are indistinguishable
from real drafts to anyone who opens the account, and one of them will eventually be
read as a real proposal.

## Closing this row

The owner archives the 18 drafts in the Proposales UI, then moves this file to
`archive/` (state is positional; the row is never edited to change state). The evidence
doc's §8.5 list stays where it is — it is the investigation's record, not a queue.

## Blocks nothing

This row does not gate mechanism inventory, planning, or implementation. v1 writes no
prices, so no downstream artifact depends on these drafts existing or not existing.
