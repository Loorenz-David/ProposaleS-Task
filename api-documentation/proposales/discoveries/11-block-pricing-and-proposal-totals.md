# Discovery 11 — Block pricing, and what actually moves the proposal totals

Discovery 09 left me with a block that resolved its content correctly but had zero everywhere a number should be. Two questions:

1. How is a price represented on a product-block?
2. What makes `value_without_tax` and `value_with_tax` on the proposal itself change?

Looking at `ProposalBlockInput`, there isn't one price field. There are four unit values:

```
unit_value_without_discount_without_tax
unit_value_without_discount_with_tax
unit_value_with_discount_without_tax
unit_value_with_discount_with_tax
```

plus `quantity`, plus `package_split`.

My assumption going in was that these are largely derived — that I'd set the base price, and Proposales would work out the tax-inclusive and discounted variants from the company's tax configuration. That felt like the sane design, and every field name reads like a computed view of one underlying number.

## First experiment — set one field

I set exactly one value on the block:

```json
{ "unit_value_without_discount_without_tax": 10000 }
```

The field persisted. Nothing else moved:

- the other three `unit_value_*` fields stayed at 0
- `package_split` values stayed at 0
- proposal `value_without_tax` stayed at 0
- proposal `value_with_tax` stayed at 0

So the assumption was wrong. The API stored precisely what I gave it and derived nothing. One unit-value field on its own does not produce a priced proposal.

## Second experiment — supply a coherent structure

This time I sent the whole thing consistently, including the package split:

```json
{
  "quantity": 1,
  "unit_value_without_discount_without_tax": 10000,
  "unit_value_without_discount_with_tax": 10000,
  "unit_value_with_discount_without_tax": 10000,
  "unit_value_with_discount_with_tax": 10000,
  "package_split": [
    {
      "value_without_tax": 10000,
      "value_with_tax": 10000,
      "vat": 0
    }
  ]
}
```

The proposal totals moved:

```
value_without_tax: 10000
value_with_tax:    10000
```

And the block kept its existing UUID, because I passed it back in the patch. The spec is explicit about why that matters — `uuid` on `ProposalBlockInput` "preserves editor-owned changes when updating an existing block" — and `PATCH` replaces the full ordered block list when `blocks` is supplied. Omit the UUID and you're not editing a block, you're replacing it with a new one.

A note on how I've written that payload: my original notes wrote the split as `package_split.value_without_tax`, but the schema declares `package_split` as an **array** of `PackageSplit`, and `PackageSplit` has a **required** `type` (`accommodation`, `meetingRoom`, `food`, `other`). I didn't record which `type` I used, so I've left it out of the snippet above rather than invent one. The request went through, so something valid was there.

## What's established

- **Monetary values are in the smallest currency unit.** This one isn't just my observation — the spec's own description says all monetary values use the smallest currency unit unless an operation states otherwise. My experiment agrees with it: `10000` in a EUR company is €100.00.
- **The `unit_value_*` fields are stored independently.** Setting one does not cause the API to derive the others. Whatever computes those relationships, it isn't this endpoint.
- **`package_split` monetary values participate in the proposal-level totals.** When the split had values, the totals appeared.
- **Passing the existing block UUID preserves the block across a PATCH.**

## What isn't established

I want to be careful here, because experiment two changed several things at once. It shows that *a* coherent structure produces the expected totals. It does not isolate which input the total is actually computed from.

Specifically, still open:

- whether `package_split` is the sole source of the proposal totals, or just one contributor that happened to agree with everything else in my payload
- how `quantity` interacts with the split and the totals — I only ever used `1`
- how VAT is calculated, or whether it's validated against anything at all (I sent `vat: 0` with matching with-tax and without-tax values, which is the least interesting possible case)
- what discounts do to the four unit-value fields
- how `optional` blocks or multi-product blocks contribute

## The rule I took from this

Don't assume Proposales will reconstruct a pricing model from one number. If something generates priced blocks, it has to supply the fields the intended pricing structure actually needs, and then verify the resulting proposal totals rather than trusting that they followed.

This also fed a decision about the take-home app itself. The content library carries no price — `ContentItem` has no price field at all, so there's nothing to read before the block exists — and pricing here is clearly a structure with rules I hadn't fully mapped. Which is a good argument for the app not trying to compute or invent prices on its own.
