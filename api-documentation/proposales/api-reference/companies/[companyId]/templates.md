> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# List Company Templates

> Lists proposal templates for a company.

<ParamField path="companyId" type="number">
  The ID of the company
</ParamField>

### Response

<ResponseField name="data" type="array">
  <Expandable title="properties">
    <ResponseField name="title" type="string">
      The title of the template.
    </ResponseField>

    <ResponseField name="uuid" type="string">
      The template UUID.
    </ResponseField>

    <ResponseField name="language" type="string">
      The language of the template.
    </ResponseField>

    <ResponseField name="background_image_uuid" type="string">
      The background image UUID of the template.
    </ResponseField>
  </Expandable>
</ResponseField>
