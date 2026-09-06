# Discovery 14 — Versions, revisions, and where editing stops

This is the longest of these notes because it took eight experiments before I had a model I trusted.

Two things from earlier had been sitting unexplained. In Discovery 05, a new draft came back with `version: null` and a `series_uuid` distinct from its own `uuid`. Both of those imply a lifecycle I hadn't looked at.

What I wanted to answer:

- When does a proposal get a numeric version?
- Can a sent proposal still be edited?
- How do you make a revision of one?
- Does making a revision affect the version the recipient is currently looking at?
- What happens to the old version when the new one goes out?

I worked on one series throughout:

```
series_uuid: 85523fe9-4007-404d-991a-b21373419417
starting uuid: b6696cb8-1928-470c-a4ae-308812fef3d6
```

## Experiment 1 — POST to an existing proposal

`POST /v3/proposals/{uuid}` is documented as "Create proposal version," so I pointed it at my existing draft to see what came out.

```http
POST /v3/proposals/b6696cb8-1928-470c-a4ae-308812fef3d6
```

I got back a **different** UUID:

```
uuid:        d3d8d710-a119-4547-8344-abf9d1f8faef
series_uuid: 85523fe9-4007-404d-991a-b21373419417
status:      draft
version:     null
```

Same series, new proposal resource. And it wasn't empty — it had inherited the title, the `data` metadata, the product blocks, the block UUIDs, and the pricing configuration from the proposal I called it on.

So `series_uuid` is the stable identity of the proposal as a business object, and `uuid` identifies one version of it. That reframed everything I'd done up to this point: I hadn't been working with "a proposal," I'd been working with version one of a series.

## Experiment 2 — What if I call it twice?

I was worried about this. If a retry or a double-click creates a second revision every time, an integration has a real problem.

```http
POST /v3/proposals/b6696cb8-1928-470c-a4ae-308812fef3d6
```

Same UUID came back:

```
d3d8d710-a119-4547-8344-abf9d1f8faef
```

No second draft. Version creation is idempotent while an open next-draft already exists.

I went back to the spec afterwards and it says so outright: *"Repeated calls return the same draft until that draft is sent or archived."* So this is declared behaviour, and my test confirms the "until sent" half of it. I never archived anything, so the archival half is documented but untested by me.

## Experiment 3 — Sending

I opened the draft and sent it through the Proposales UI. (Why the UI and not the API is a question in its own right — I chased it down properly in Discovery 16.)

Before:

```
uuid:    d3d8d710-a119-4547-8344-abf9d1f8faef
status:  draft
version: null
```

After:

```
uuid:              d3d8d710-a119-4547-8344-abf9d1f8faef
status:            active
version:           1
recipient_is_set:  true
```

The UUID did not change. Sending promotes the resource that already exists rather than creating another one, and that's the moment the numeric version gets assigned:

```
draft / version=null
        ↓ send
active / version=1
```

`status_changed_at` moved, and the recipient email was populated — I entered the recipient in the editor as part of sending, since nothing in this series had set one via the API.

## Experiment 4 — Editing what's already out

This is the one I got wrong. I expected an active proposal to still be patchable — it's the same resource, and `PATCH` had worked on it happily five minutes earlier.

```http
PATCH /v3/proposals/d3d8d710-a119-4547-8344-abf9d1f8faef
```

```
Proposal status active cannot be updated via PATCH
```

Rejected. Which makes sense once you think about what a sent proposal is: a document someone else is looking at. Editing it underneath them would be wrong.

```
draft  → PATCH allowed
active → PATCH rejected
```

So changing a sent proposal is not a mutation. It has to go through the version mechanism.

## Experiment 5 — A revision from the active version

Same call as experiment 1, but this time against the active proposal.

```http
POST /v3/proposals/d3d8d710-a119-4547-8344-abf9d1f8faef
```

New draft:

```
uuid:        3c6edc93-a256-48e6-a91a-3c3fddbdc311
series_uuid: 85523fe9-4007-404d-991a-b21373419417
status:      draft
version:     null
```

And the important part — the previously active proposal was untouched:

```
uuid:    d3d8d710-a119-4547-8344-abf9d1f8faef
status:  active
version: 1
```

Both exist at once:

```
series 85523fe9
│
├── version 1   status: active     ← what the recipient sees
│
└── revision    status: draft, version: null
```

The revision inherited everything, including the recipient this time, plus the metadata, content, blocks, block UUIDs and pricing.

Creating a revision does **not** invalidate the active proposal. That's what makes the whole model usable.

## Experiment 6 — Editing the revision

```http
PATCH /v3/proposals/3c6edc93-a256-48e6-a91a-3c3fddbdc311
```

Worked normally. It's a draft, so it follows the draft rules from Discovery 06. My changes landed on the revision and the active version stayed exactly as it was.

So an integration can prepare a whole next version programmatically without touching what the recipient currently has in front of them.

## Experiment 7 — Where did my revision go?

Then I went looking for the revision in the Proposales UI, and couldn't find it.

The normal proposal listing I was using kept showing the active proposal and offered me the option to resend it. I tried that, to see what it did. It resent version 1 — and afterwards:

```
version 1:  status: active,  version: 1
revision:   status: draft,   version: null
```

The revision was completely unaffected. So **resending the active proposal is not the same operation as sending the revision**, and if I'd assumed otherwise I'd have shipped the wrong document to a customer.

What saved me was the edit URL. The version-creation response had returned:

```
https://secure.proposales.com/proposals/3c6edc93-a256-48e6-a91a-3c3fddbdc311/edit
```

Opening that URL directly loaded the revision in the editor, with the API-made changes in it.

That elevates the returned edit URL from a convenience to something operationally necessary — in the flow I tested, it was the only route I found to the revision. I should be careful about how far I generalise this: I tested one UI path. I don't know whether every Proposales view omits API-created revision drafts, or just the listing I happened to be using.

One spec detail I noticed while writing this up, which suggests revision drafts are a modelled concept and not an accident: `proposal-search` has an `exclude_revision_drafts` parameter, described as excluding "draft revisions from series that already have recipient tokens." Default `false`. I didn't test it.

## Experiment 8 — Sending the revision

I opened the revision through its edit URL and sent it from there.

Before:

```
version 1:  version: 1,     status: active
revision:   version: null,  status: draft
```

After:

```
d3d8d710-a119-4547-8344-abf9d1f8faef   version: 1   status: null
3c6edc93-a256-48e6-a91a-3c3fddbdc311   version: 2   status: active
```

Both reported the same `status_changed_at`, so it's one transition affecting both records.

The revision was promoted to version 2, and the old version stopped being active at the same moment.

**Its status became `null` — not `"replaced"`.**

This matters because `"replaced"` does exist in the documented `ProposalStatus` enum, and it's exactly the value you'd guess for a superseded version. It's not what the API returned. `ProposalStatus` is also declared `nullable: true`, so `null` is a legal value and this isn't a contract violation — it just isn't the value I would have coded for if I'd worked from the enum instead of from an experiment.

I don't know when Proposales does use `replaced`. I only know it wasn't used here.

## The lifecycle as I understand it now

```
                     ┌─────────┐
                     │  DRAFT  │ ← PATCH allowed
                     │version ∅│
                     └────┬────┘
                          │ send
                          ▼
                    ┌──────────┐
                    │  ACTIVE  │ ← PATCH rejected
                    │version 1 │
                    └────┬─────┘
                          │ POST /v3/proposals/{uuid}
                          ▼
             ┌─────────────────────┐
             │   REVISION DRAFT    │
             │  new uuid           │
             │  same series_uuid   │
             │  version = ∅        │  ← PATCH allowed
             └──────────┬──────────┘
                        │ open returned edit URL, send
                        ▼
                  ┌──────────┐
                  │  ACTIVE  │      meanwhile version 1:
                  │version 2 │      active → status = null
                  └──────────┘
```

## What this means for building on it

The safe shape falls out of the constraints rather than being a design choice:

```
create proposal → edit draft via API → return the editor URL
   → human reviews and sends → active
   → need changes? POST the active UUID → revision draft
   → edit via API → return the revision's edit URL
   → human reviews and sends → next active version
```

The API can generate and revise content. Proposales owns review and sending. That's a human-in-the-loop boundary that exists whether or not you want one — which turned out to be the theme of Discovery 16.

For tracking, an integration should reason over `series_uuid`, `uuid`, `version` and `status` together. It should not try to work out where a series stands from the status value alone, given experiment 8.

## A correction to my own notes

I'd originally listed `multi_product_data` alongside `_number_of_minutes_valid` and `quantity_visible` as undocumented runtime fields. That's wrong — `multi_product_data` is in `ProposalBlockInput`, with a `MultiProductRow` schema behind it.

The other two are genuinely absent from `openapi.json`. So are `_is_agreement` and `inventory_connected` from Discoveries 05 and 09. I grepped for all of them to be sure. They're real in responses, but not in the contract, and I'm not building on them.

## Untested

Plenty. None of these were exercised:

- acceptance, rejection, withdrawal, expiry (acceptance and rejection came next, in Discovery 15)
- what `replaced` is actually for
- anything involving archival, including whether idempotency behaves differently once a draft is archived
- whether other UI views surface API-created revision drafts
