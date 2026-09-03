> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Delete Content

> Delete a content item from the library.

<ParamField query="variation_id" type="number">
  The variation ID of the product to delete. Either this or product\_id must be provided.
</ParamField>

<ParamField query="product_id" type="number">
  The product ID to delete. Either this or variation\_id must be provided.
  This is often more convenient when you have the product ID rather than the variation ID.
</ParamField>

### Example Requests

Using product\_id:

```bash theme={null}
DELETE /v3/content?product_id=123
```

Using variation\_id:

```bash theme={null}
DELETE /v3/content?variation_id=789
```

### Response

<ResponseField name="data" type="object">
  <Expandable title="properties">
    <ResponseField name="success" type="boolean">
      Indicates if the deletion was successful.
    </ResponseField>

    <ResponseField name="message" type="string">
      A success message.
    </ResponseField>
  </Expandable>
</ResponseField>
