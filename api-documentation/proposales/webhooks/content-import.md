> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Content Import

For a proposal to be created in Proposales, first you need to prepare a library of the products that you have available for sale. The library enables you to manage your products in one place, without having to update every proposal that your users will send.

If you maintain a library of products already outside of Proposales, you can synchronize your products from there, and into the Proposales library.

This webhook is called when an user clicks the "Import Content" button in the content page (url for admin users: `/content`). The returned list of products will then be added to the content library.

```typescript Content Import Request theme={null}
{
  id: string;
  created: number;
  type: 'content.import';
  integration: IntegrationSessionData;
}
```

The expected response to this is a json object with the following format

<CodeGroup>
  ```typescript Type theme={null}

  type LocalizedField = { [langCode: string]: string } | string;
  interface ProductVariation {
    unit:
      | 'day'
      | 'h'
      | 'kg'
      | 'm'
      | 'month'
      | 'person'
      | 'sqm'
      | 'unit'
      | 'year'
      | 'night';
    package_split: {
      type:
        | 'other'
        | 'food',
        | 'meetingRoom'
        | 'accommodation',
      enable_discount?: boolean,
      fixed?: boolean
      value_saved_with_tax?: boolean;
      value_with_tax?: number;
      value_without_tax?: number;
      vat?: number;
    }
  }

  interface IntegrationProduct {
    title: LocalizedField;
    description: LocalizedField;
    uniqueId: string;
    currency?: string;
    product_variation: ProductVariation;
    metadata: { [key: string]: unknown };
  }

  type ContentImportResponse = {
    data: IntegrationProduct[];
  }
  ```

  ```typescript Example Response theme={null}
  {
    data: [
      {
        title: 'Example Room',
        description: 'A simple room',
        uniqueId: 'my_integration_example_room',
        metadata: {
          internalId: 'abcd-12345',
          type: 'room',
        },
        product_variation: {
          unit: 'night',
          package_split: {
            type: 'accommodation',
            vat: 0.25,
            value_without_tax: 1000,
            value_with_tax: 1250,
          }
        }
      }
    ]
  }

  ```
</CodeGroup>

It is important that the `uniqueId` is unique, and stays the same for a specific product,
since it's used to determine whether or not a product exists in the content library.

Once a product is added to a proposal, its integration data will be included in
its `sources.integration` property. `sources.integration.metadata` will contain the optional
metadata provided during import.
