> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Product IDs vs Variation IDs

> Understanding the difference between product_id and variation_id parameters in the Content API.

## Overview

The v3 Content API supports both `product_id` and `variation_id` parameters for maximum flexibility. This allows you to use whichever ID type is most convenient for your integration.

## Product vs Variation Relationship

* **Product**: The main entity that represents a content item in your library
* **Variation**: A specific configuration of a product (pricing, currency, etc.)
* **Relationship**: Each product has exactly one variation in the current system

## Parameter Options

For most endpoints, you can use either:

* `product_id` - Often more intuitive and readily available
* `variation_id` - Provides direct access to the variation data

## API Endpoints Supporting Dual IDs

### GET /v3/content

```bash theme={null}
# Using product IDs
GET /v3/content?product_id=123,456

# Using variation IDs
GET /v3/content?variation_id=789,101112

# Both can be mixed
GET /v3/content?product_id=123&variation_id=789

# By integration external id (requires company_id) — see [List Content](/api-reference/content/list)
GET /v3/content?company_id=1&external_id=vendor-stable-id
```

### PUT /v3/content

```json theme={null}
// Using product_id
{
  "product_id": 123,
  "language": "en",
  "title": "Updated Title"
}

// Using variation_id
{
  "variation_id": 789,
  "language": "en",
  "title": "Updated Title"
}
```

### DELETE /v3/content

```bash theme={null}
# Using product ID
DELETE /v3/content?product_id=123

# Using variation ID
DELETE /v3/content?variation_id=789
```

### Bulk Operations

```json theme={null}
// Bulk archive using product IDs
{
  "product_ids": [123, 456, 789]
}

// Bulk archive using variation IDs
{
  "variation_ids": [101, 112, 131]
}

// Both can be used together
{
  "product_ids": [123, 456],
  "variation_ids": [101, 112]
}
```

## Migration Guide

### From variation\_id to product\_id

If you're currently using `variation_id` parameters, you can:

1. **Keep using variation\_id** - No changes needed, full backward compatibility
2. **Switch to product\_id** - Often simpler for integrations
3. **Use both** - Mix and match based on what's available
