> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Multi-Product Row

> A row in the breakdown of a multi-product block.

When showing the value of a block in a proposal you can choose to only show the value and the quantity (we call this a simple block) or you can choose to explain what the value consists of, by breaking it down into more detailed sub-parts.

In the vast majority of cases, the use case for a multi-product breakdown is to break down the cost into separate days.

<Note>
  For external connections where an inventory is connected to the product, you are required to use the multi-product breakdown.
</Note>

```typescript theme={null}
{
  uuid: string,
  dateFrom?: string,
  dateTo?: string,
  discount?: number,
  fixed_discount?: number,
  packageInfo?: {
    packageName?: string,
    sourceRowUuid: string,
  },
  occupancy?: number,
  label?: string,
  notes?: string,
  setup?: string,
  quantity?: number,
  unit?: unitSchema,
  subrows?: multiProductSubRow[],
  unitValueWithDiscountWithoutTax: number,
  unitValueWithDiscountWithTax: number,
  unitValueWithoutDiscountWithoutTax: number,
  unitValueWithoutDiscountWithTax: number,
  _unitValueWasOverridden?: boolean,
  compoundedValues?: {
      unitValueWithDiscountWithoutTax: number,
      unitValueWithDiscountWithTax: number,
      unitValueWithoutDiscountWithoutTax: number,
      unitValueWithoutDiscountWithTax: number,
    }
}
```

<ResponseField name="uuid" type="string">
  A uuid used to uniquely identify the row for the lifetime of the proposal. Does not affect the UI.
</ResponseField>

<ResponseField name="dateFrom" type="string">
  The start timestamp for the date (and optionally time) that the row refers to.
</ResponseField>

<ResponseField name="dateTo" type="string">
  The end timestamp for the date (and optionally time) that the row refers to.
</ResponseField>

<ResponseField name="discount" type="number">
  A discount as a percentage of the row value. Floating number between 0 (0%) and 1 (100%). The percent discount cannot be active at the same time as the fixed discount.
</ResponseField>

<ResponseField name="fixed_discount" type="number">
  A fixed discount (in currency) to be applied to the value of the row. Note that fixed discounts are always applied excluding tax. The value is stored in cents. The fixed discount cannot be active at the same time as the percent discount.
</ResponseField>

<ResponseField name="label" type="string">
  A short explanation heading to be shown for the item. Keep it short and sweet and use <code>notes</code> in case you need any additional note or description for the specific row.

  The <code>label</code> can be missing. In that case the quantity and value will be displayed without a heading.
</ResponseField>

<ResponseField name="notes" type="string">
  An optional <code>notes</code> or description about this specific Row. Perfect for any longer text that doesn't fit for <code>label</code>.
</ResponseField>

<ResponseField name="setup" type="string">
  Human‑readable setup label for the row
</ResponseField>

<ResponseField name="quantity" type="number">
  The unit value represents the value for one unit, and will be multiplied by the quantity.

  * if undefined, the amount defaults to 1
</ResponseField>

<ResponseField name="unit_value_xxx" type="number">
  The 4 pre-calculated unit values for the row we need in order to display the proposal.

  If you have subrows on your product, you should send these values as the first subrow of the multi-product row. If not, then these represent the value of the entire multi-product row.

  See [Unit Values](unit-values) for more details.
</ResponseField>

<ResponseField name="_unitValueWasOverridden" type="boolean">
  Determines whether the total unit value for the multi-product row is represented by the `compoundedValues` or by the `unitValueXxx`.

  If true, then the total for the row is the `compoundedValues` object, and the `unitValueXxx` of the multi-product row is only the first subrow.

  Introduced for historical reasons, to make the existing subrow model consistent with pre-calculating the 4 values.
</ResponseField>

<ResponseField name="compoundedValues" type="object">
  The sum of the subrows unit values, as well as the unit values for the row (considered as the first subrow) with quantities applied.

  See `_unitValueWasOverridden` for an explanation and [Unit Values](unit-values) for more details.
</ResponseField>

<ResponseField name="subrows" type="multiProductSubRow[]">
  The multi-product can further be split into subrows. See [Multi-product subrow](multi-product-subrow) for more details.
</ResponseField>
