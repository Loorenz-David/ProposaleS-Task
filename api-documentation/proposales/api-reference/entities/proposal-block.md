> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Proposal Block

> Represents an item (product or video) in a proposal

## Overview

Products represent the majority of a proposal in most cases. They describe the offer that you are presenting to your recipient, and provide a breakdown of the cost for the event. You can also have products without a price, and videos that further describe your property.

Products and videos are managed in Proposales via a content library (`/content`) where they can be managed accross proposals. When instantiated in a proposal, they are refferred to as proposal blocks.

## Fields

```typescript theme={null}
{
  updated_at?: number
  source_content_updated_at?: number
  comment?: string
  content_id?: number
  currency?: string
  description?: string
  fixed_discount?: number
  image_uuids?: string[]
  inventory_connected?: boolean
  language: string
  multi_product_data?: MultiProductRow[]
  multi_product_enabled?: boolean
  optional_picked?: boolean
  optional?: boolean
  package_split?: PackageSplit
  percent_discount?: number
  quantity_editable?: boolean
  quantity_max?: number
  quantity_min?: number
  quantity_variable_data?: string
  quantity_variable?: boolean
  quantity_visible?: boolean
  quantity?: number
  recurring?: boolean
  relative?: boolean
  sources?: {
    integration: {
      integrationId: number
      uniqueId: string
      metadata: Record<string, unknown>
    }
  }
  title?: string
  type: 'product-block' | 'video-block'
  unit_value_with_discount_with_tax?: number
  unit_value_with_discount_without_tax?: number
  unit_value_without_discount_with_tax?: number
  unit_value_without_discount_without_tax?: number
  unit?: Unit
  uuid: string
  video_url?: string
}
```

## Fields explained

<ResponseField name="updated_at" type="number">
  The timestamp when the block was last updated. This field is maintained for information purposes, and is not visible in the proposal.
</ResponseField>

<ResponseField name="source_content_updated_at" type="number">
  The timestamp of the last changes to the product in the library, that the proposal block is aware of. We use this field to determine whether the original product in the library has changes that the proposal doesn't contain yet.

  The purpose of this field is to make the step of synchronizing the block with the source product in the library an active decision at the level of the user. This is to make sure that when the user sends a new version of the proposal to the recipient, they won't inadvertendly include changes made to the product in the library that the user is not aware of.

  This field is used internally, and not visible in the proposal.
</ResponseField>

<ResponseField name="comment" type="string">
  The user can attach a short comment to each of the proposal blocks. Usually an explanation of the choice of product, or maybe emphasizing a particular feature that the recipient might appreciate. Comments give a more personal touch to the proposal, making it feel more tailored towards what the recipient specifically needs.
</ResponseField>

<ResponseField name="content_id" type="number">
  The id of the original product in the content library. Optional - the proposal can function without a block being part of the library, but this is possible only via the API. The Proposales UI doesn't support this option.
</ResponseField>

<ResponseField name="currency" type="string">
  The 3-letter code for the currency of the product. Proposales does not support multiple currencies on the same proposal, this field is informational to help process the value of the block.
</ResponseField>

<ResponseField name="title" type="string">
  A short, descriptive text to be shown as the title for the block. Any details should be included in the block's description.
</ResponseField>

<ResponseField name="description" type="string">
  A longer text to describe the product being offered. For a conference room for example, it might detail the facilities and services that are included.
</ResponseField>

<ResponseField name="fixed_discount" type="number">
  A fixed discount (in currency) to be applied to the value of the product. Note that fixed discounts are always applied excluding tax. The value is stored in cents. The fixed discount cannot be active at the same time as the percent discount.
</ResponseField>

<ResponseField name="percent_discount" type="number">
  A discount as a percentage of the block value. Floating number between 0 (0%) and 1 (100%). The percent discount cannot be active at the same time as the fixed discount.
</ResponseField>

<ResponseField name="image_uuids" type="string[]">
  The list of asset uuids for the images that are associated with the block.
</ResponseField>

<ResponseField name="inventory_connected" type="boolean">
  When a product is connected to an inventory, usually via an external connection, it will query the inventory and show it to the user, as well provide some automatic behaviour to facilitate working with an inventory. For example the multi-product breakdown is automatically generated when a period proposal variable is defined on the proposal.

  Note: Inventory connected products will always have a multi-product breakdown based on days. They can't be simple products.
</ResponseField>

<ResponseField name="language" type="string">
  The language that the title and the description of the block are in.
</ResponseField>

<ResponseField name="multi_product_data" type="MultiProductRow[]">
  The data used to determine the breakdown for a multi-product. In the majority of cases this would be a split of the cost on a daily basis. Further documentation available in [MultiProductRow](multi-product-row).

  Some of the fields described here are not applicable for multi-product blocks, since the rows override those values.
</ResponseField>

<ResponseField name="multi_product_enabled" type="boolean">
  Determines whether the multi-product breakdown should be enabled or not. This allows the user to switch between displaying the product as a simple product (a value and a quantity), or a multi-product breakdown (e.g. a daily breakdown of the cost) without losing any data.

  If false, then `multi_product_data` is ignored.
</ResponseField>

<ResponseField name="optional" type="boolean">
  Determines whether a block is optional or not. An optional block will be displayed to the recipient with a toggle that allows them to add it or remove it from the proposal. The proposal value will be updated accordingly.
</ResponseField>

<ResponseField name="optional_picked" type="boolean">
  Determines whether an optional block has been selected or not. When a proposal is accepted, optional products that are unselected are no longer displayed in the proposal UI, since they don't apply to the proposal.
</ResponseField>

<ResponseField name="quantity" type="number">
  The number of units of the block to be applied. It's only relevant for simple products - if a block is a multi-product, then the quantities in the multi-product rows take precedence. If null or undefined, the quantity defaults to 1.
</ResponseField>

<ResponseField name="quantity_editable" type="boolean">
  Determines whether the recipient of the proposal can set the quantity for the block.
</ResponseField>

<ResponseField name="quantity_min" type="number">
  If the quantity is editable, determines the minimum quantity that the recipient can set.
</ResponseField>

<ResponseField name="quantity_max" type="number">
  If the quantity is editable, determines the maximum quantity that the recipient can set.
</ResponseField>

<ResponseField name="quantity_variable" type="boolean">
  Determines whether the quantity is calculated via a formula from proposal variables. Allows the user to switch between setting a fixed value for the quantity, and using a formula, without losing data.

  If false, `quantity_variable_data` is ignored.
</ResponseField>

<ResponseField name="quantity_variable_data" type="number">
  The formula applied to determine what quantity the product should have. It allows determining the quantity of a block from proposal variables. For example, if the proposal was created from an inbox request, the quantity might be set automatically to a value that the recipient already communicated in the RFP request.
</ResponseField>

<ResponseField name="recurring" type="boolean">
  A recurring block is a block charged per unit of time. For example the proposal might be a contract for a service paid per year.
</ResponseField>

<ResponseField name="relative" type="boolean">
  A relative block is a block charged per unit, without specifying a specific quantity. For example, a block might be charged per kilogram. The different units will be summed separately and shown as an addition to the value of the proposal at the end.
</ResponseField>

<ResponseField name="unit_value_xxx" type="number">
  Pre-calculates all values that we'll need for display and calculations in the proposal. These 4 values will be calculated any time the user makes any changes to the value of the block, including when a value in a multi-product block changes, and are then not touched anymore.

  See [Unit Values](unit-values) for more details.
</ResponseField>

<ResponseField name="unit" type="Unit">
  The unit that applies to the block. Possible values: 'day', 'h', 'kg', 'm', 'month', 'person', 'sqm', 'unit', 'year', 'night'.

  There is also a special 'no-unit' value which causes the block value to be displayed without a unit assigned.
</ResponseField>

<ResponseField name="uuid" type="string">
  A unique uuid used to identify the proposal block. It's not shown in the UI, it's used internally to uniquely identify the block.
</ResponseField>

<ResponseField name="type" type="'product-block' | 'video-block'">
  Determines if the block describes a product, or a video. The different blocks have very different display rules, a video ignoring most of the fields described here.
</ResponseField>

<ResponseField name="video_url" type="string">
  Only applies to the `video-block`. The url for the video. Videos for blocks are stored on a video service, like for example Youtube.
</ResponseField>

<ResponseField name="sources" type="object list">
  The list of external connections that the proposal is linked with. They will receive updates during the lifetime of the proposal (e.g. when a new version is sent, or when the proposal is approved / rejected), depending on the implementation of each specific connection.
</ResponseField>

<ResponseField name="package_split" type="PackageSplit">
  Determines the vat(s) value applied when calculating the product unit values, or the unit values defined in a multi-product. For more details see [Package Split](package-split)
</ResponseField>
