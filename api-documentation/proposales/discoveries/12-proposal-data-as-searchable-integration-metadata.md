# Discovery 12 — Can I find my own proposals again without keeping a lookup table?

An integration that creates proposals needs to find them again later, keyed by something meaningful to itself — a customer reference, a conversation ID, whatever. The default answer is to keep your own table mapping your IDs to Proposales UUIDs.

I wanted to know if I could skip that. Discovery 05 had already shown that `data` is a free-form object, and I'd noticed the search endpoint declares this parameter:

```
filter[property_name]
```

with the description "Replace property_name with a key from the proposal data object." So the pieces looked like they fit. I just hadn't tried it.

## Writing metadata

```http
PATCH /v3/proposals/{uuid}/data
```

```json
{
  "takehome_source": "api-exploration",
  "takehome_customer_ref": "test-001"
}
```

Result:

```json
{
  "_is_agreement": false,
  "takehome_source": "api-exploration",
  "takehome_customer_ref": "test-001"
}
```

My keys were added and `_is_agreement` survived. So this is a shallow merge, not a replace — the Proposales-owned key I didn't mention stayed intact.

(Reading the spec again afterwards, `ProposalData` says "null removes a key during a data patch." That's consistent with merge semantics, but I never tested deletion, so I'm taking it as declared rather than confirmed.)

## Reading it back through search

```http
GET /v3/proposal-search?company_id=5452&filter[takehome_customer_ref]=test-001
```

Returned the proposal. That's the whole thing working end to end.

## What this gives an integration

Arbitrary top-level keys on `proposal.data` are usable as search filters. So external identifiers — `external_customer_id`, `conversation_id`, `crm_record_id`, a generation ID — can live on the proposal itself and be queried back out of Proposales directly. No side database needed just to answer "which proposal was that?"

For a small integration that's a genuinely useful capability, and it's a documented parameter rather than something I stumbled into.

The caution from Discovery 05 stands and is worth repeating here, because this is where you'd actually get bitten: `data` is shared with Proposales. Merge, don't overwrite, and namespace your keys so a future Proposales-owned key can't collide with yours. My `takehome_` prefix was doing that job.

## Not established

- whether nested properties can be filtered on. The spec says data values "may be nested" and says the filter takes "a key from the proposal data object" — it doesn't say anything about paths, and I only tested flat top-level strings.
- whether filters do anything other than exact matching.
- what happens when several proposals carry the same value.
- whether multiple `filter[...]` parameters combine with AND, or something else.

Each of those matters if you lean on this hard, and none of them are answered by what I ran.
