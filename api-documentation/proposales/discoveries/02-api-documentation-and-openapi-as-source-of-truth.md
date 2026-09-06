# Discovery 02 — Finding the docs, and reading OpenAPI as a connected specification

Now that I was in, I needed to know what the API surface looked like. Not examples, not screenshots of the UI — the actual contract.

I found the Proposales API specification and downloaded the OpenAPI document into the repository:

```
api-documentation/proposales/openapi.json
```

Having it locally mattered more than I expected. I could grep it, follow references, and diff my assumptions against it without going back and forth to a docs site.

## Endpoints don't tell you the whole request

The first thing that tripped me up was reading an endpoint definition and thinking I had the full picture.

I'd look at an operation, see its parameter list, and find entries like this instead of an actual parameter:

```json
{ "$ref": "#/components/parameters/CompanyIdQuery" }
```

The real definition lives elsewhere:

```
components
  └── parameters
      └── CompanyIdQuery
```

Same story for request and response bodies — they point at `components/schemas`, and those schemas point at other schemas. `ProposalBlock`, for example, is an `allOf` over `ProposalBlockInput` plus a few extra fields.

So reading a single endpoint in isolation wasn't enough. I had to follow the `$ref` chain to know what a request actually needed.

## The loop I ended up in

This wasn't a methodology I designed up front. It's just the shape my work naturally settled into after the first couple of endpoints:

```
endpoint
   ↓
operation parameters / request body
   ↓
follow $ref
   ↓
components / schemas / parameters
   ↓
construct a real request
   ↓
run it
   ↓
compare the response to what the spec declared
   ↓
write down what I saw
```

The comparison step turned out to be the valuable one. The response almost never matched the declared schema exactly — usually it had more in it.

## The distinction I want to keep

Two different kinds of knowledge came out of this, and I want to keep them apart for the rest of these notes:

- **`openapi.json` is what the API declares.** It's the public contract. If it's in there, I can build on it.
- **My requests and responses are what I observed.** They're real, but a single observation in one account isn't a guarantee.

Sometimes those agreed. Sometimes the runtime gave me fields the spec never mentions. And in one case near the end, the thing I needed most wasn't in the public contract at all — it only existed inside the Proposales web app.

Keeping the two separate is the only reason that last part was legible to me instead of confusing.
