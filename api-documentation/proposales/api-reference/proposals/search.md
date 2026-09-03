> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Proposal Search

> Search for proposals by company ID and filtering based on its data.

<ParamField query="company_id" type="number">
  Restricts results to proposals belonging to a specific company. The company
  must be available to the API token.
</ParamField>

<ParamField query="filter[property_name]" type="string">
  Searches for properties in the proposals data field, in this example
  it looks for a property named `property_name`.

  Another example would be to search for proposals in a specific time zone:
  `filter[timezone]="Europe/Amsterdam"`.
</ParamField>

<ParamField query="recipient_email" type="string">
  Restricts results to proposals whose recipient email matches the given
  value. Comparison is case-insensitive.
</ParamField>

<ParamField query="limit" type="number">
  Maximum amount of search results. Defaults to 1, with an upper limit of 25.
</ParamField>

<ParamField query="exclude_revision_drafts" type="boolean">
  When `true`, excludes draft revisions from proposal series that already have
  recipient tokens. Defaults to `false`.
</ParamField>

<ParamField query="include_archived" type="boolean" default="false">
  Set to `true` to include archived (deleted) drafts. By
  default only non-archived rows are returned.
</ParamField>

### Response

Returns a list of up to 25 proposals, ordered by `updated_at` descending
(most recently updated first).

<ResponseField name="data" type="object">
  <Expandable title="properties">
    <ResponseField name="created_at" type="number">
      UNIX timestamp
    </ResponseField>

    <ResponseField name="updated_at" type="number">
      UNIX timestamp
    </ResponseField>

    <ResponseField name="title" type="string" />

    <ResponseField name="uuid" type="string" />

    <ResponseField name="series_uuid" type="string" />

    <ResponseField name="company_id" type="number" />

    <ResponseField name="version" type="number" />

    <ResponseField name="status" type="string" />

    <ResponseField name="data" type="object" />

    <ResponseField name="url" type="string">
      Editor URL for the proposal.
    </ResponseField>
  </Expandable>
</ResponseField>
