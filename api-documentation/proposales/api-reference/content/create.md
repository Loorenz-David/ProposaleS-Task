> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Content

> Create a new content item in the library.

### Body

<ParamField body="company_id" type="number" required>
  The ID of the Proposales company that the content should belong to.
</ParamField>

<ParamField body="language" type="string" required>
  A two-letter ISO 3166-1 alpha-2 language code indicating the language of the content.
</ParamField>

<ParamField body="title" type="string" required>
  The title of the content in the specified language.
</ParamField>

<ParamField body="description" type="string">
  The description of the content in the specified language.
</ParamField>

<ParamField body="images" type="array">
  A list of images to be added to the content. You have two options for providing images:

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

  * Images that fail to download from URL will be silently skipped.
  * At least one valid image must be provided (either successful URL download or existing UUID).
</ParamField>

### Response

<ResponseField name="data" type="object">
  <Expandable title="properties">
    <ResponseField name="product_id" type="number">
      The ID of the newly created product.
    </ResponseField>

    <ResponseField name="variation_id" type="number">
      The variation ID of the newly created product.
    </ResponseField>

    <ResponseField name="message" type="string">
      A success message.
    </ResponseField>
  </Expandable>
</ResponseField>
