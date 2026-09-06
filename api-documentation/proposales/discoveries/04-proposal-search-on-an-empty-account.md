# Discovery 04 — Searching for proposals that don't exist yet

With a valid `company_id`, the obvious next move was to look at real proposals and learn the shape of the thing from actual data.

```http
GET /v3/proposal-search?company_id=5452&limit=25
```

HTTP 200:

```json
{ "data": [] }
```

Which is correct, and completely useless to me. The endpoint works and the query parameters are right — the account is just brand new and has nothing in it.

That left me with two options: read the `Proposal` schema and imagine what a proposal looks like, or make one and look at it. Reading the schema was never going to tell me what the API fills in on its own, and that was exactly what I wanted to know.

So: create the smallest proposal the API will accept, then read it back.
