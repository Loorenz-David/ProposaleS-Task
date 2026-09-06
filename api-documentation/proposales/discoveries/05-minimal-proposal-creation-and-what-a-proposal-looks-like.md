# Discovery 05 — Creating the smallest possible proposal and reading it back

I couldn't inspect a proposal because none existed, so I made one. The idea was to send the absolute minimum the API accepts and then look at everything Proposales filled in by itself — that difference is the part no schema can tell you.

`CreateProposalRequest` requires exactly two fields:

```
company_id
language
```

So that's all I sent.

```http
POST /v3/proposals
```

```json
{
  "company_id": 5452,
  "language": "en"
}
```

It worked. The response gave me a proposal UUID and an editor URL — the URL turned out to matter a lot later, but at this point I just noted it.

## Confirming it exists

```http
GET /v3/proposal-search?company_id=5452&limit=25
```

The proposal showed up immediately, no delay:

- `status: draft`
- `version: null`
- title empty
- its own `series_uuid`, distinct from the proposal `uuid`
- `data` containing `_is_agreement: false`

Two of those made me stop.

`version: null` on a freshly created draft implies the numeric version means something other than "this resource exists" — it gets assigned by something. I didn't chase that yet.

And `series_uuid` being separate from `uuid` strongly suggests a proposal isn't one resource but a member of a series. Also parked, and it became Discovery 14.

## The full resource

```http
GET /v3/proposals/{uuid}
```

An empty draft, as expected:

- no recipient
- no blocks
- no attachments
- `value_with_tax: 0`
- `value_without_tax: 0`

And a set of things I never sent, which Proposales resolved on its own:

- `currency: EUR` — inherited from the company
- the standard tax mode carried over from the company (the proposal reports it under its own fields, not as a `tax_mode` copy)
- creator and contact derived from the authenticated account
- `company_timezone: Europe/Stockholm`

That last one is odd, and I want it on the record rather than smoothed over. In Discovery 03 the company itself reported `timezone: null`. The proposal came back with `Europe/Stockholm`. So something is filling in a default somewhere between the company record and the proposal record. I didn't find out where, and I didn't test whether setting the company timezone changes it. It's just an observation.

## Two things to carry forward

**The runtime response has fields the documented `Proposal` schema doesn't describe.** This was the first time I saw it and it kept happening at every level — proposals, blocks, signatures. I stopped treating the schema as an exhaustive description of the response and started treating it as the part I'm allowed to rely on.

**`data` is not exclusively mine.** I'd assumed `data` was a free-form bag for the integration, since that's how `ProposalData` reads in the spec (`additionalProperties: true`, "integration-defined proposal metadata"). But Proposales writes into it too — `_is_agreement` was already sitting there on a proposal I created with no `data` at all.

That's a small thing with a real consequence: an integration should merge into `data`, never replace it wholesale, and should namespace its own keys. I came back to this properly in Discovery 12.

Next: the draft exists but it's empty. Can I edit it in place?
