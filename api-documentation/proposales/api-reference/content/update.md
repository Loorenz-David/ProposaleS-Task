> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Update Content

> Update an existing content item in the library. This endpoint can update both active and archived content.

### Body

<ParamField body="variation_id" type="number">
  The variation ID of the product to update. Either this or product\_id must be provided.
</ParamField>

<ParamField body="product_id" type="number">
  The product ID to update. Either this or variation\_id must be provided.
  This is often more convenient when you have the product ID rather than the variation ID.
</ParamField>

<ParamField body="language" type="string" required>
  A two-letter ISO 3166-1 alpha-2 language code indicating the language of the content to update.
</ParamField>

<ParamField body="title" type="string">
  The new title of the content in the specified language.
</ParamField>

<ParamField body="description" type="string">
  The new description of the content in the specified language.
</ParamField>

<ParamField body="images" type="array">
  A list of images to replace the existing images of the content. You have two options for providing images:

  1. **Using Uploadcare UUID**: Upload images to Uploadcare first and provide the UUID
  2. **Using URL**: Provide a publicly accessible image URL with an empty `uuid` string. The system will automatically download and upload the image to Uploadcare.

  Needs to have this shape:

  ```ts theme={null}
  {
    uuid: string; // UUID from Uploadcare, or empty string "" when using url
    filename?: string;
    mime_type?: string;
    url?: string; // Public image URL (used when uuid is empty)
    size?: number;
    height?: number;
    width?: number;
  }[]
  ```

  **Example with Uploadcare UUID:**

  ```json theme={null}
  {
    "uuid": "9a7b8c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "filename": "product.jpg"
  }
  ```

  **Example with URL:**

  ```json theme={null}
  {
    "uuid": "",
    "url": "https://example.com/image.jpg"
  }
  ```

  **Note:**

  * This will replace all existing images. To keep existing images, include them in this array.
  * Pass an empty array `[]` to remove all images.
  * Images that fail to download from URL will be silently skipped. If all images fail, existing images remain unchanged.
</ParamField>

### Example Requests

Using product\_id:

```json theme={null}
{
  "product_id": 123,
  "language": "en",
  "title": "Updated Product Title",
  "description": "Updated product description"
}
```

Using variation\_id:

```json theme={null}
{
  "variation_id": 789,
  "language": "en",
  "title": "Updated Product Title",
  "description": "Updated product description"
}
```

### Response

<ResponseField name="data" type="object">
  <Expandable title="properties">
    <ResponseField name="product_id" type="number">
      The ID of the updated product.
    </ResponseField>

    <ResponseField name="variation_id" type="number">
      The variation ID of the updated product.
    </ResponseField>

    <ResponseField name="message" type="string">
      A success message.
    </ResponseField>
  </Expandable>
</ResponseField>
