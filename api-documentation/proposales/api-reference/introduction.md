> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Introduction

## OpenAPI specification

The complete machine-readable API contract is available at
[docs.proposales.com/openapi.json](/openapi.json). It uses OpenAPI 3.0 and can
be imported into API clients, code generators, and agent tooling.

## Content Type

All requests must be encoded as JSON with the `Content-Type: application/json` header. If not otherwise specified, responses from the Proposales API, including errors, are sent as JSON as well.

## Authentication

Requests to the Proposales API must provide an API token through the Authorization header, unless otherwise specified:

```
Authorization: Bearer <TOKEN>
```

We will issue these tokens on request, so get in touch with our support. A token will be associated with a fixed user, and access to resources will mirror the access rights of that user.

### Accessing Resources Owned by a Company

By default, you can access resources contained within your own user account.

To access resources owned by a company, you must first obtain the company ID. For now, contact our support to provide you with the necessary details.

After you obtained the company ID, append it as a query string at the end of the API endpoint URL:

```
https://api.proposales.com/v1/content?company_id=[company ID]
```

For requests that accept a request body, the company ID can be supplied in the body as well.

## Error Handling

All API endpoints contain a message within the error responses, though some API endpoints extend the error object to contain other information. Each endpoint that does this will be documented in their appropriate section.

While we recommend that you write error messages that fit your needs and provide your users with the best experience, our message fields are designed to be neutral, not contain sensitive information, and can be safely passed down to user interfaces.

An example of an error:

```json theme={null}
{
  "error": {
    "message": "Not authorized"
  }
}
```

## FAQ

<AccordionGroup>
  <Accordion title="How do you handle versioning">
    All endpoints and examples are designated with a specific version. Versions vary per endpoint and are not global.

    The response shape of a certain endpoint is not guaranteed to be fixed over time. In particular, we might add new keys to responses without bumping a version endpoint.

    To ensure the security and correctness of your application, make sure to only read the keys from the response that your application needs. Don't proxy entire responses to third-parties without validation.

    Old versions of each endpoint are supported for as long as possible. When we intend to deprecate, we will notify users.
  </Accordion>

  <Accordion title="How does pagination work with the API?">
    At this moment, there are no pagination parameters since we don’t provide a way to fetch data via API yet. We plan to add pagination capabilities in the future.
  </Accordion>
</AccordionGroup>
