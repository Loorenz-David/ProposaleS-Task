> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Bulk Restore Content

> Restore multiple archived content items at once.

Use this endpoint to restore multiple archived content items in a single request. Restoring archived content makes them visible again in the content library and allows them to be added to proposals.

**Note:** This operation is idempotent. You can safely call it on already-active products without errors, and only products that are currently archived will be updated.

### Request Body

<ParamField body="variation_ids" type="number[]">
  An array of variation IDs to restore. Either this or product\_ids must be provided.
</ParamField>

<ParamField body="product_ids" type="number[]">
  An array of product IDs to restore. Either this or variation\_ids must be provided.
  This is often more convenient when you have product IDs rather than variation IDs.
</ParamField>

```json theme={null}
{
  "variation_ids": [123, 456, 789]
}
```

Or alternatively:

```json theme={null}
{
  "product_ids": [123, 456, 789]
}
```

### Response

<ResponseField name="data" type="object">
  <Expandable title="properties">
    <ResponseField name="restored_count" type="number">
      The number of content items that were successfully restored.
    </ResponseField>

    <ResponseField name="product_ids" type="number[]">
      An array of product IDs that were restored.
    </ResponseField>

    <ResponseField name="message" type="string">
      A success message.
    </ResponseField>
  </Expandable>
</ResponseField>

```json theme={null}
{
  "data": {
    "restored_count": 3,
    "product_ids": [123, 456, 789],
    "message": "Products restored successfully"
  }
}
```

To archive content items, use the [Bulk Archive Content](/api-reference/content/bulk-archive) endpoint.
