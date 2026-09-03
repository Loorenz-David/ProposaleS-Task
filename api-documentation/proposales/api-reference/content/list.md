> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# List Content

> Lists all content.

<ParamField query="company_id" type="number">
  Limits results to one company the token can access. **Required** when using `external_id` unless you also pass `variation_id`, or `product_id` that resolves to at least one variation for this token (integration or Oracle external lookup).
</ParamField>

<ParamField query="external_id" type="string">
  Look up content by external identifier:

  * **Integration imports:** matches `sources.integration.uniqueId` exactly (case-sensitive), as set during [content import](/webhooks/content-import).
  * **Oracle:** same parameter also matches `sources.oracle.code` (case-insensitive), preserving existing behaviour.

  If `external_id` is not scoped with `variation_id` or a `product_id` that resolves to variations for this token, you must pass **`company_id`**.
</ParamField>

<ParamField query="variation_id" type="string">
  Variation ID filter, can be single ID or multiple comma separated ones.
  When provided, detailed information will be included in the response.
</ParamField>

<ParamField query="product_id" type="string">
  Product ID filter, can be single ID or multiple comma separated ones.
  When provided, detailed information will be included in the response.
  Alternative to variation\_id - you can use either parameter.
</ParamField>

<ParamField query="include_archived" type="boolean" default="false">
  Set to true to include archived content in the response. By default, only active (non-archived) content is returned.
</ParamField>

<ParamField query="include_sources" type="boolean" default="false">
  Set to true to include the sources field in the response. This contains integration metadata like connections to Opera, Mews or other systems.
</ParamField>

Content can be products or videos and are found in the content library. They can be attached to a proposal as blocks.

### Example Requests

List all content:

```bash theme={null}
GET /v3/content
```

Get specific content by product IDs:

```bash theme={null}
GET /v3/content?product_id=123,456
```

Get specific content by variation IDs:

```bash theme={null}
GET /v3/content?variation_id=789,101112
```

Mix both ID types:

```bash theme={null}
GET /v3/content?product_id=123&variation_id=789
```

Include archived content:

```bash theme={null}
GET /v3/content?include_archived=true
```

Resolve by integration external id (stable `uniqueId` from the vendor):

```bash theme={null}
GET /v3/content?company_id=123&external_id=vendor-product-abc
```

### Response

<ResponseField name="data" type="Content[]">
  <Expandable title="content" defaultOpen>
    <ResponseField name="created_at" type="number">
      The UNIX timestamp when the content was first created.
    </ResponseField>

    <ResponseField name="description" type="object">
      Contains the language as the key, and the description as the value.
    </ResponseField>

    <ResponseField name="product_id" type="number">
      The ID of the product.
    </ResponseField>

    <ResponseField name="variation_id" type="number">
      The variation ID of a product.
      A product might have multiple variations.
    </ResponseField>

    <ResponseField name="title" type="object">
      Contains the language as the key, and the title as the value.
    </ResponseField>

    <ResponseField name="is_archived" type="boolean | undefined">
      Indicates whether the content has been archived. Only included when the `include_archived` parameter is set to true.
    </ResponseField>

    <ResponseField name="sources" type="object | undefined">
      Integration metadata such as connections to Opera, Mews or other systems. Only included when the `include_sources` parameter is set to true.
    </ResponseField>

    <ResponseField name="images" type="Asset[] | undefined">
      A list of images of the content, will only be included when filtering content by variation ID.
    </ResponseField>

    <ResponseField name="integration_id" type="number">
      Will be the ID of an integration if the product was imported by it.
    </ResponseField>

    <ResponseField name="integration_metadata" type="object">
      Custom integration metadata if the integration has specified it during [content import](/webhooks/content-import).
    </ResponseField>
  </Expandable>
</ResponseField>
