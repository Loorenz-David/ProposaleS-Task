# Discovery 09 — Does `content_id` mean the product or the variation?

Straightforward question with two candidates.

**My hypothesis:** `content_id` refers to the variation, not the parent product. My reasoning was that a variation is the concrete sellable thing, and a proposal line item has to be concrete — but that's an argument from how I'd design it, not from evidence. The spec says nothing either way.

## The test

```http
PATCH /v3/proposals/{uuid}
```

One product-block:

```json
{
  "blocks": [
    {
      "type": "product-block",
      "content_id": 188485,
      "quantity": 1
    }
  ]
}
```

`188485` is the `variation_id` from Discovery 08, not the `product_id` (`188558`).

## What happened

The patch succeeded, and reading the proposal back showed Proposales had resolved the ID into actual content:

```json
{
  "title": "API Test Service",
  "description": "Temporary content created while exploring the Proposales API.",
  "currency": "EUR",
  "quantity": 1
}
```

That's the content I created, so the hypothesis holds: **for product-blocks, `content_id` is the `variation_id`.**

I'll note the limit of that: I confirmed the variation ID resolves correctly. I didn't test what happens if you pass the `product_id` instead, so I can't say whether that errors, resolves to something, or silently does nothing.

Proposales also generated a few things I didn't send:

- a block UUID
- default `package_split` values
- zero monetary values throughout
- `inventory_connected: false`

`inventory_connected` doesn't appear anywhere in `openapi.json` — I grepped for it. Same category as the extra proposal fields in Discovery 05: real in the response, not part of the contract, so not something to build on.

## The thing that bothered me

Everything monetary came back as zero.

The content resolved fine — title, description, currency all correct — but no price came with it. Which raises the obvious question of where a price is supposed to come from, and that turned into the pricing experiments in Discovery 11.
