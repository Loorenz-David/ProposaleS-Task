> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Bulk Archive Content

> Archive multiple content items at once.

Use this endpoint to archive multiple content items in a single request. Archived content is not actually deleted from the database, but is hidden from most views and cannot be added to proposals.

**Note:** This operation is idempotent. You can safely call it on already-archived products without errors, and only products that aren't already archived will be updated.

### Request Body

<ParamField body="variation_ids" type="number[]">
  An array of variation IDs to archive. Either this or product\_ids must be provided.
</ParamField>

<ParamField body="product_ids" type="number[]">
  An array of product IDs to archive. Either this or variation\_ids must be provided.
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
    <ResponseField name="archived_count" type="number">
      The number of content items that were successfully archived.
    </ResponseField>

    <ResponseField name="product_ids" type="number[]">
      An array of product IDs that were archived.
    </ResponseField>

    <ResponseField name="message" type="string">
      A success message.
    </ResponseField>
  </Expandable>
</ResponseField>

```json theme={null}
{
  "data": {
    "archived_count": 3,
    "product_ids": [123, 456, 789],
    "message": "Products archived successfully"
  }
}
```

To view archived content items, use the [List Content](/api-reference/content/list) endpoint with the `include_archived=true` query parameter.

To restore archived content items, use the [Bulk Restore Content](/api-reference/content/bulk-restore) endpoint.
