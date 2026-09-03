> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Content Details

When a block is added and selected in a proposal, this webhook will be called.
The response is used for customizing the default values and behavior of the block.

The `POST` request will have the following data in its body:

```typescript Content Details Request theme={null}
{
  id: string;
  created: number;
  type: 'content.details';
  integration: IntegrationSessionData;
  integrationBlockSource: {
    integrationId: number;
    uniqueId: string;
    metadata: Record<string, unknown>;
  }
}
```

The `uniqueId` and `metadata` properties will contain the values defined during
[content import](/webhooks/content-import).

The expected response to this is a json object with the following format

```typescript Response theme={null}
{
  data: {
    dateType?: 'date' | 'dateTime';
    defaultQuantity?: string | number;
    defaultLabel?: string;
    fields?: IntegrationField[];
    hideSubrows?: boolean;
    showQuantity?: boolean;
    disableDiscounts?: boolean;
    customSubrows?: ContentSubrow[];
    subResources?: IntegrationContentSubresource[];
  };
}
```

<Frame type="glass" caption="Content details">
  <img src="https://mintcdn.com/proposalesab/-5otOw2eXOA6LlgK/webhooks/content-details.png?fit=max&auto=format&n=-5otOw2eXOA6LlgK&q=85&s=2cd71d8dccdd143564d43268e6c06109" width="1082" height="2170" data-path="webhooks/content-details.png" />
</Frame>

### `fields`

This is used to create custom inputs on a block. The values defined will be stored
in the block's `sources.integration.metadata` property.

The values set by the `fields` options are stored in the `sources.integration.metadata` property of a [Block](/api-reference/entities/block).

See [IntegrationField](/api-reference/entities/integration-field) for information on how to use them.

### `subResources`

This is used to be able to add custom quick addable sub resources to a block (using the blue button with a plus icon). The format of this is as follows:

```typescript ContentSubrow theme={null}
{
  name: string
  subtitle?: string
  value?: number // value without tax (152 = 1.52 currency units)
  taxRate?: number // between 0.0 - 1.0 (0.5 = 50% tax)

  valueWithTax?: number // deprecated, use taxRate instead

  uniqueId?: number | string

  // quantity can either be a number, or a variable string.
  // for example '{quantity}' will default to the quantity property of the row
  // Or '{number_of_people}', which will default to the proposal data variable
  quantity?: number | string
}
```

When a user adds a sub resource to a block, it will be appended to `block.multi_product_data` as a subrow.

### `customSubrows`

Custom subrows are predefined subrows that will be added to `block.multi_product_data` automatically. These are usually
internal subrows that the user should not be able to modify. Therefore it can be good to set the
`hideSubrows` property to `true` when using it.
