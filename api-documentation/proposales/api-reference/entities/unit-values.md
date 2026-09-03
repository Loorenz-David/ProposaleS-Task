> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Unit values

> In multiple places across products, we pre-calculate a set of four unit values to ensure consistency in calculations.

## Overview

When displaying a proposal, we need all relevant values to be pre-calculated. This ensures that the final result remains consistent and does not depend on implementation-specific calculations.

Once a proposal is sent, the displayed values are guaranteed not to change.

These values are typically recalculated only when a user edits the product value.

When using the Proposales API, these unit values are automatically calculated based on the provided input.

* If subrows are defined for a multi-product, the four unit values of the multi-product are derived from the subrows (specifically through compoundedValues).
* If multi-product row values are provided without subrows, then these 4 values will be calculated for the product from the sub-rows.

## Fields

```typescript theme={null}
{
  unit_value_with_discount_with_tax?: number
  unit_value_with_discount_without_tax?: number
  unit_value_without_discount_with_tax?: number
  unit_value_without_discount_without_tax?: number
}
```

The typescript definition describes them as an object, but in practice they're usually just 4 values found together in the parent object.

The casing used in practice (snake case or camel case) might differ to be consistent with the rest of the parent's fields.

All 4 of these values represent one unit of the product, in cents.

<ResponseField name="unit_value_without_discount_without_tax" type="number">
  The value of one unit of the product excluding tax, and before applying the discount.
</ResponseField>

<ResponseField name="unit_value_with_discount_without_tax" type="number">
  The value of one unit of the product excluding tax, after applying the discount.
</ResponseField>

<ResponseField name="unit_value_without_discount_with_tax" type="number">
  The value of one unit of the product including tax, before applying the discount.
</ResponseField>

<ResponseField name="unit_value_with_discount_with_tax" type="number">
  The value of one unit of the product including tax, after applying the discount.
</ResponseField>
