> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Proposal

> Get a proposal by its UUID

<ParamField path="uuid" type="uuid">
  The UUID of the proposal
</ParamField>

### Response

<ResponseField name="data" type="object">
  <Expandable title="properties">
    <ResponseField name="title" type="string" />

    <ResponseField name="title_md" type="string" />

    <ResponseField name="description_html" type="string" />

    <ResponseField name="description_md" type="string" />

    <ResponseField name="archived_at" type="number">
      The UNIX timestamp when the proposal was archived. `null` if active.
    </ResponseField>

    <ResponseField name="attachments" type="array">
      <Expandable>
        <Attachment />
      </Expandable>
    </ResponseField>

    <ResponseField name="background_image" type="object">
      <ResponseField name="id" type="number" />

      <ResponseField name="uuid" type="string" />
    </ResponseField>

    <ResponseField name="background_video" type="object">
      <ResponseField name="id" type="number" />

      <ResponseField name="uuid" type="string" />
    </ResponseField>

    <ResponseField name="blocks" type="array">
      <Expandable>
        <Block />
      </Expandable>
    </ResponseField>

    <ResponseField name="company_address" type="string" />

    <ResponseField name="company_email" type="string" />

    <ResponseField name="company_id" type="number" />

    <ResponseField name="company_logo_uuid" type="string" />

    <ResponseField name="company_powerups" type="object" />

    <ResponseField name="company_powerups_live" type="object" />

    <ResponseField name="company_name" type="string" />

    <ResponseField name="company_phone" type="string" />

    <ResponseField name="company_registration_number" type="string" />

    <ResponseField name="company_tax_mode_live" type="string" />

    <ResponseField name="company_timezone" type="string" />

    <ResponseField name="company_avatar_uuid" type="string" />

    <ResponseField name="contact_email" type="string" />

    <ResponseField name="contact_name" type="string" />

    <ResponseField name="contact_phone" type="string" />

    <ResponseField name="contact_title" type="string" />

    <ResponseField name="creator_id" type="number" />

    <ResponseField name="creator_name" type="string" />

    <ResponseField name="currency" type="string" />

    <ResponseField name="data" type="object" />

    <ResponseField name="editor" type="object">
      <ResponseField name="notification_user_ids" type="object" />
    </ResponseField>

    <ResponseField name="expires_at" type="number">
      Expiration date as UNIX timestamp, null if no expiration date.
    </ResponseField>

    <ResponseField name="invoicing" type="object" />

    <ResponseField name="is_agreement" type="boolean" />

    <ResponseField name="is_only_proposal_in_series" type="boolean" />

    <ResponseField name="is_test" type="boolean" />

    <ResponseField name="pending" type="boolean" />

    <ResponseField name="pending_reason" type="string" />

    <ResponseField name="recipient_company_name" type="string" />

    <ResponseField name="recipient_email" type="string" />

    <ResponseField name="recipient_id" type="number" />

    <ResponseField name="recipient_is_set" type="boolean" />

    <ResponseField name="recipient_name" type="string" />

    <ResponseField name="recipient_phone" type="string" />

    <ResponseField name="recipient_sources" type="object" />

    <ResponseField name="series_uuid" type="string" />

    <ResponseField name="signatures" type="array" />

    <ResponseField name="status_changed_at" type="number" />

    <ResponseField name="tax_options" type="object" />

    <ResponseField name="tracking" type="object" />

    <ResponseField name="updated_at" type="number" />

    <ResponseField name="value_with_tax" type="number" />

    <ResponseField name="value_without_tax" type="number" />

    <ResponseField name="version" type="number" />

    <ResponseField name="payments_enabled" type="boolean" />

    <ResponseField name="contact_avatar_transform" type="string" />

    <ResponseField name="user_email" type="string" />

    <ResponseField name="payment" type="object" />

    <ResponseField name="status" type="string">
      The status of the proposal.
    </ResponseField>

    <ResponseField name="uuid" type="string">
      The proposal UUID.
    </ResponseField>

    <ResponseField name="language" type="string">
      The language of the proposal.
    </ResponseField>

    <ResponseField name="background_image_uuid" type="string">
      The background image UUID of the template.
    </ResponseField>
  </Expandable>
</ResponseField>
