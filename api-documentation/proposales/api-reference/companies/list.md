> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# List Companies

> Lists all companies the user is a member of.

### Response

<ResponseField name="data" type="array">
  <Expandable title="properties">
    <ResponseField name="id" type="number">
      The ID of the company.
    </ResponseField>

    <ResponseField name="created_at" type="number">
      The UNIX timestamp when the company was created.
    </ResponseField>

    <ResponseField name="name" type="string">
      The name of the company.
    </ResponseField>

    <ResponseField name="currency" type="string">
      The default currency of the company.
    </ResponseField>

    <ResponseField name="tax_mode" type="string">
      The tax mode of the company, can be `standard`, `simplified` or `none`.
    </ResponseField>

    <ResponseField name="registration_number" type="string">
      The registration number of the company.
    </ResponseField>

    <ResponseField name="website_url" type="string">
      The website URL of the company.
    </ResponseField>

    <ResponseField name="logo_url" type="string | null">
      The URL of the company logo, if set.
    </ResponseField>

    <ResponseField name="inbox_token" type="string | null">
      The token of the company's inbox,
      usable for inbox-scoped integrations.
    </ResponseField>
  </Expandable>
</ResponseField>
