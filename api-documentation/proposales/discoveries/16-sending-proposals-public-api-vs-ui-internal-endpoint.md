# Discovery 16 — There's no send endpoint, so what does the Send button do?

This question had been open since Discovery 14, where I sent a proposal through the UI without commenting on why. The reason was simple: I'd looked for a way to send through the API and hadn't found one. Here I went back and did it properly, because "I couldn't find it" and "it doesn't exist" are different claims.

## Going through the public contract

The proposal operations in `openapi.json`, in full:

```http
POST  /v3/proposals
GET   /v3/proposals/{uuid}
POST  /v3/proposals/{uuid}
PATCH /v3/proposals/{uuid}
PATCH /v3/proposals/{uuid}/data
GET   /v3/proposal-search
```

That's the entire proposal surface. Nothing for send, publish, activate, deliver or resend.

The create operation describes itself as creating "a new proposal series with an editable draft" — an editable draft, specifically.

I also went looking for a writable field that might trigger it sideways. There's nothing in the request schemas that sets `status`, or `active`, or `pending`, or `recipient_is_set`. Those appear on the `Proposal` response, not on any input.

## Experiment 1 — Maybe a complete recipient is the trigger?

My remaining hypothesis was that sending isn't a separate action at all, and that a proposal becomes sendable, or sends itself, once it has a complete recipient. It's not an unreasonable guess — `recipient_is_set` reads like a readiness flag.

So I created a proposal through the public API with the recipient fully populated: name, email and phone.

```
status:           draft
version:          null
recipient_is_set: true
pending:          null
pending_reason:   null
```

A draft. A draft that knows who it's for, but a draft.

```
recipient configured ≠ proposal sent
```

The response gave me the editor URL again, which by this point I'd started to read as the API telling me something.

## Experiment 2 — Watch the UI do it

If the web app can send a proposal, then something performs that transition, and I could just look at what it calls. I created a disposable draft through the API, opened it at its editor URL, and had DevTools open when I clicked Send.

```http
POST https://secure.proposales.com/api/proposals
```

```json
{
  "draftId": "4ab6b08e-039c-43a2-81bb-414da47078c9",
  "message": "",
  "titleMdStateValue": "Recipient API Send Test"
}
```

Response:

```json
{
  "id": "4ab6b08e-039c-43a2-81bb-414da47078c9",
  "value": 0,
  "tax": 0
}
```

So there it is. The send transition takes the existing draft's UUID as `draftId` and returns the same ID — no new resource. That matches exactly what I observed in Discovery 14, where sending promoted the same UUID from `draft`/`version: null` to `active`/`version: 1`.

## Two different APIs

The distinction is right there in the hostnames:

```
https://api.proposales.com/v3/...        the documented integration API
https://secure.proposales.com/api/...    the web application's own API
```

The send endpoint lives on the second one. It's not in the OpenAPI specification, and camelCase keys like `draftId` and `titleMdStateValue` are a different convention from the snake_case used throughout `/v3` — `titleMdStateValue` in particular reads like it's named after a variable in the editor's frontend state, not like a designed contract.

So this is an **observed internal web-application endpoint**, not part of the public integration API. I can see it. That doesn't make it mine to call.

## Established

1. The public API creates and edits drafts, and populates recipients.
2. A fully populated recipient does not send a draft.
3. There is no send or publish operation in the public contract.
4. The editor's Send triggers `POST https://secure.proposales.com/api/proposals`, referencing the draft as `draftId`.
5. The same proposal UUID survives the transition.
6. That endpoint is not in the OpenAPI specification I've been working from.

And the conclusion I'd defend: an integration shouldn't call it just because DevTools revealed it. It's undocumented, unversioned as far as I can tell, and shaped around the editor's internal state. It can change without notice and nobody would owe me a migration path. Using it would be building on something Proposales hasn't offered.

## Why this isn't actually a problem

My first reaction was that the missing send endpoint was a gap. Working through it, I don't think it is — or at least, it isn't only that.

What it produces is this:

```
integration generates the proposal
        ↓
public Proposales API creates the draft
        ↓
API returns the editor URL
        ↓
human opens it in Proposales and reviews
        ↓
human sends
```

A proposal is a commercial document going to a customer, with prices on it. Having a person look at it before it goes out is the correct behaviour, not a limitation to engineer around. For something generating proposal content automatically, that review step is exactly where you'd want a human anyway.

The same boundary showed up twice already — acceptance and rejection in Discovery 15 are recipient-driven and unwritable, and revisions in Discovery 14 have to be sent from the editor. Reading all three together, the API surface is consistent about it: **the integration owns proposal content, Proposales owns proposal delivery and outcomes.**

For the take-home, that means using the documented API and handing the user the editor URL that comes back. It's the more stable boundary, and it's the honest one.
