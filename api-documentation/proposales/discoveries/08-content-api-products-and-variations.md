# Discovery 08 — Creating content, and the two IDs that come back

To put a line item on a proposal I needed something to put there. So I created a piece of content.

```http
POST /v3/content
```

I made a throwaway item — "API Test Service", with a description saying it was created while exploring the API, so I'd recognise it later and know it wasn't real data.

## The response had two identifiers

```
product_id:   188558
variation_id: 188485
```

I was expecting one ID. Getting two meant the content model has a level I hadn't accounted for: a parent product, and a variation of that product. `ContentMutationResponse` in the spec confirms both are always returned.

Reading `GET /v3/content` afterwards made the shape clearer — you can query by `external_id`, by `variation_id`, or by `product_id`, and the last two both accept comma-separated lists. So both identifiers are addressable, they're just different things.

## Fetching it back

```http
GET /v3/content?variation_id=188485
```

The item came back with `title` and `description` as objects keyed by language rather than plain strings. `LocalizedText`, per the spec. That fits the rest of the API — `language` is required when creating a proposal, so content being localized at the field level is consistent.

## The question this left me with

Two IDs, and the block input schema only takes one:

```json
"content_id": { "type": "integer", "format": "int64" }
```

That's the entire declaration for `content_id` in `ProposalBlockInput`. No description, nothing saying which of the two it wants. Guessing wrong here would probably produce either an error or, worse, a block silently pointing at the wrong thing.

So that was the next thing to test.
