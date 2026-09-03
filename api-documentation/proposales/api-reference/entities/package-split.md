> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Package Split

> Describes the VAT value(s) that applies to the product. 

## Overview

A package split is a list of objects that define how VAT should be applied to a product.

* If the list contains one item, the product has a **single VAT rate**, and VAT is applied straightforwardly by multiplying the value by the VAT rate.
* If the list contains **multiple items**, the product consists of **multiple VAT rates** (e.g., a bundled service with different tax rules).

When creating a proposal, focus on making it easy for the recipient to understand. **Avoid optimizing based on VAT values** — group products in a way that makes sense to the recipient rather than breaking them down based on tax rules.

## Example Use Case

Consider a **conference package** that includes:

* Meeting room rental (VAT 10%)
* Food (VAT 15%)
* Drinks (VAT 20%)

While these have different VAT values, the recipient likely views them as a single package rather than separate taxable items. In most cases, you’d present them as a bundled offer.

## Fields

```typescript theme={null}
{
  enable_discount?: boolean,
  fixed?: boolean,
  type: 'accommodation' | `meetingRoom` | 'food' | 'other',
  value_saved_with_tax?: boolean,
  value_with_tax?: number,
  value_without_tax?: number,
  vat?: number,

  /**
   * @deprecated Use value_without_tax instead
   */
  value?: number,
}
```

## Fields explained

<ResponseField name="vat" type="number (0-1)">
  The actual value of the VAT to be applied. While optional in the schema (for legacy reasons), it is always present in practice.
</ResponseField>

<ResponseField name="type" type="string">
  The type of service provided. This is more of a tag for you to understand the package split. In Proposales it's mostly used for data insights, and doesn't change the way the vat is applied in any way. It will not be shown on the proposals's UI.
</ResponseField>

<ResponseField name="enable_discount" type="boolean">
  When a discount is applied to the product in a proposal, it determines whether this part of the VAT split should be affected by the discount. If set to true, this part of the value will not be affected by discounts when calculating the VAT.
</ResponseField>

<ResponseField name="fixed" type="boolean">
  Determines whether this part of the value should be affected by price overrides, or whether it should stay fixed to the value in the package split.

  The package split is defined for the product in the product library, but when the user adds a product to a proposal, they can override its value on the block. That way you can have a product that you charge differently based for example on whether the event happens during high tourist season. This boolean allows you to control which parts of the vat should be blocked from responding to price adjustments.

  If true, the value in the package split will be used for applying this VAT value, not the relative share in the block's value, making the shares for the other splits take more of the relative share than they otherwise would have.

  As an example, let's say you had a package split with 100 EUR on vat 10%, and 100 EUR on vat 15% fixed. The package split sums up to 200 EUR, with each split taking up 50% of the value. If you override the price of the block to be 400 EUR instead, then we'll calculate 100 EUR at vat 15%, and the rest of 300 EUR at vat 10%, the 15% vat split being only 25% of the total value now.
</ResponseField>

<ResponseField name="value_without_tax" type="number">
  Pre-calculated value for the split before tax is applied. This value will be taken from the user input, or calculated based on it when the product is edited, and then won't be touched again until the next edit. Saved in cents.
</ResponseField>

<ResponseField name="value_with_tax" type="number">
  Pre-calculated value for the split after tax is applied. This value will be taken from the user input, or calculated based on it when the product is edited, and then won't be touched again until the next edit. Saved in cents.
</ResponseField>

<ResponseField name="value_saved_with_tax" type="boolean">
  Remembers whether the package split value input by the user was with or without tax. The only practical implication for this value is whether we show the UI with or without tax when a user opens the product in the product library for editing.

  At higher level, though, this signals which of the 2 values the user reasoned on when they edited the product, and which one was calculated afterwards.
</ResponseField>

<ResponseField name="value" type="number">
  Deprecated, and no longer in use. Maintained only for support of legacy proposals.
</ResponseField>
