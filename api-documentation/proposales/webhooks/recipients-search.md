> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Recipients Search

This webhook is triggered when a user searches for a recipient. If the registered endpoint answers with a list of contacts, they will be shown in the UI and automatically imported into Proposales when added as a proposal recipient.

It will send a `POST` request with `search` in the path, containing the URL encoded search terms, and [IntegrationSessionData](/api-reference/entities/integrations-session-data) as the body.

The response needs to be in this shape:

```ts theme={null}
{
  data: {
    uniqueId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    isBusiness?: boolean;
    phone?: string;
    companyName?: string;
    metadata?: Record<string, unknown>;
  }[]
}
```

It's important that `uniqueId` is a unique identifier for the contact.
