> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Create an RFP

> Creates a request for a proposal.

This is a public endpoint and does not require an API token. Data can be sent as `application/json`, `application/x-www-form-urlencoded` or `multipart/form-data`. The parameters listed below are treated specially, but arbitrary form data can be passed and will be associated with the proposal as metadata.

### Body

<ParamField body="email" type="string" required>
  A confirmation email will be sent to this address.
</ParamField>

<ParamField body="company_name" type="string" />

<ParamField body="first_name" type="string" />

<ParamField body="last_name" type="string" />

<ParamField body="phone_number" type="string" />

<ParamField body="message" type="string">
  Displayed in the request excerpt.
</ParamField>

<ParamField body="language" type="string">
  Determines the language of the confirmation email. Falls back to using the `accept-language` header of the request. In ISO 639 Set 1 format.
</ParamField>

<ParamField body="start_date" type="string">
  Start date of the event, in ISO 8601 format.
</ParamField>

<ParamField body="end_date" type="string">
  End date of the event, in ISO 8601 format.
</ParamField>

<ParamField body="is_test" type="string">
  If any data is passed via this parameter, the RFP is considered a test.
</ParamField>

<ParamField body="silent_confirmation" type="string">
  If any data is passed via this parameter, the confirmation email will not be sent to the user.
</ParamField>

### Response

<ResponseField name="id" type="number">
  The ID of the RFP.
</ResponseField>
