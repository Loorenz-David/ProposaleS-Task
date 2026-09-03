> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Proposal

> Create a new draft for a proposal.

### Body

<ParamField body="company_id" type="number" required>
  The ID of the Proposales company that the proposal draft should belong to.
</ParamField>

<ParamField body="language" type="string" required initialValue="en">
  A two-letter ISO 3166-1 alpha-2 language code indicating the language of the
  proposal.
</ParamField>

<ParamField body="creator_email" type="string">
  Email address of the user who should be set as the creator of this proposal.

  The user must:

  * Have an account in the system
  * Be a member of the same company specified in `company_id`
  * Not be disabled

  If not provided or if the email is not found, the API token owner will be used as the creator. This field is useful when multiple users share the same API token and you want proposals to be created under their individual names instead of the API token owner's name.

  **Example use case:** A team of 10 sales people share the same API token via a third-party integration. By passing `creator_email`, each salesperson can create proposals that appear under their own name, maintaining proper attribution and audit trails.
</ParamField>

<ParamField body="contact_email" type="string">
  Email address of the user who should be set as the contact person for this proposal.

  The user must:

  * Have an account in the system
  * Be a member of the same company specified in `company_id`
  * Not be disabled

  If the email is not found or doesn't have access to the company, the creator will be used as the contact person by default.

  Note: The contact person is the internal team member (salesperson/account manager) who will receive notifications and appear as the point of contact for the proposal. This is different from `recipient` which is the external customer receiving the proposal.
</ParamField>

<ParamField body="background_image" type="object">
  Background image id and uuid. Can be fetched from a template.
</ParamField>

<ParamField body="background_video" type="object">
  Background video id and uuid. Can be fetched from a template.
</ParamField>

<ParamField body="title_md" type="string" initialValue="Proposal from API Playground">
  The proposal title as Markdown. Only data URLs for variables are supported, other formatting syntax is ignored.
</ParamField>

<ParamField body="description_md" type="string">
  The proposal description as Markdown. We support `#` for headers, `*` for bold, a `<` prefix for left-aligned paragraphs and data URLs for variables (see example).
</ParamField>

<ParamField body="recipient" type="object">
  The recipient of the proposal. Can either be a new recipient, or existing one.

  Needs to be this shape:

  ```ts theme={null}
  { id: number } |
  {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    company_name?: string;
    sources?: {
      integration?: {
        // Integration ID
        id: number;
        // Unique identifier for the integration contact
        contactId: string;
        // Optional integration metadata
        metadata: Record<string, unknown>;
      }
    }
  }
  ```
</ParamField>

<ParamField body="data" type="object">
  Proposal metadata. This data is used to fill in variables in the description. Metadata is preserved when a draft is sent, making it ideal for attaching custom data to proposals.
</ParamField>

<ParamField body="tracking" type="object">
  Lineage metadata for the proposal. Two fields are accepted:

  ```ts theme={null}
  {
    created_from_rfp?: number
    created_from_template?: string
  }
  ```

  * `created_from_rfp` links the proposal to the RFP it originates from. The RFP must belong to the same company as `company_id`; otherwise the endpoint returns `404`.
  * `created_from_template` records the UUID of the template the proposal was created from. The template must exist as a non-archived template in the same company as `company_id`; otherwise the endpoint returns `404`.
</ParamField>

<ParamField body="invoicing_enabled" type="boolean">
  Enable invoicing for this proposal. When set to `true`, invoicing details (company name, organization number, address, etc.) can be added on the active proposal.
</ParamField>

<ParamField body="tax_options" type="object">
  Configure tax-related settings for the proposal. This determines how taxes are displayed and calculated in the proposal.

  ```ts theme={null}
  {
    mode?: 'standard' | 'simplified' | 'tax-free' | 'none'
    tax_included?: boolean
    tax_label_key?: string
  }
  ```

  **mode**: Controls the tax behavior for the proposal:

  * `standard` (Recommended): Products have tax/VAT values, and the footer shows totals with and without tax/VAT
  * `simplified`: Proposal-level setting determines if prices include or exclude tax. Footer only mentions if prices are including/excluding tax
  * `tax-free`: A special tax mode where taxes are exempt at a legal level. A specific message is shown in the footer
  * `none`: No tax information is displayed at all

  **tax\_included**: Determines whether taxes are included in the displayed prices. For `standard` mode, this changes which price is displayed. For `simplified` mode, this determines the footer message.

  **tax\_label\_key**: Custom label for how taxes are referred to in your region (e.g., "Tax" for American companies, "VAT" for European ones).
</ParamField>

<ParamField body="blocks" type="array">
  A list of [blocks](/api-reference/entities/block) to be added to the draft. The `content_id` must be the `variation_id` of the product in the content library. Additional block data can be passed to overwrite the content library defaults.

  Video blocks can be added either by referencing a video from the content library using `content_id` and `type: 'video-block'`, or by passing in the video url, title, and setting the block type to `video-block`.

  Needs to satisfy this shape:

  ```ts theme={null}
  (
    { content_id: number, type?: 'product-block' | 'video-block' } |
    {
      type: 'video-block',
      video_url: string,
      title: string,
    }
  )[]
  ```
</ParamField>

<ParamField body="attachments" type="array">
  A list of attachments to be added to the draft. Attachments can be provided in three ways, and you can mix different types in a single request:

  **1. Reference from Content Library** - Reuse existing attachments without re-uploading:

  ```ts theme={null}
  { id: number }
  ```

  The attachment will be fetched from your content library. Access control is enforced - the attachment must belong to your company or be shared via content providers.

  **2. HTML Link** - Store a URL directly without uploading:

  ```ts theme={null}
  { mime_type: 'text/html', name: string, url: string }
  ```

  The URL is stored as-is and displayed as a clickable link.

  **3. PDF Upload** - Upload a file from a URL:

  ```ts theme={null}
  { mime_type: 'application/pdf', name: string, url: string }
  ```

  The file will be fetched from the URL and hosted reliably by Proposales.

  **Example with mixed attachment types:**

  ```ts theme={null}
  [
    { id: 123 },  // Reuse from content library
    { mime_type: 'text/html', name: 'Documentation', url: 'https://example.com/docs' },
    { mime_type: 'application/pdf', name: 'Terms', url: 'https://example.com/terms.pdf' }
  ]
  ```
</ParamField>

### Related endpoints

* **Update the same draft in place** (partial body): [`Patch proposal (draft)`](/api-reference/proposals/patch-draft) — `PATCH /v3/proposals/{uuid}`.
* **New version of an existing proposal** (duplicate then apply body): [`Create new version of proposal`](/api-reference/proposals/new-version) — `POST /v3/proposals/{uuid}` (same payload shape as create; returns a new draft UUID in the same proposal series).

### Response

<ResponseField name="proposal" type="object">
  <Expandable title="properties">
    <ResponseField name="uuid" type="string">
      The UUID of the newly created proposal.
    </ResponseField>

    <ResponseField name="url" type="string">
      The URL to view the proposal in Proposales.
    </ResponseField>
  </Expandable>
</ResponseField>
