> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Proposal Invoice Update

This webhook is triggered when invoicing information is updated for an accepted proposal. The invoice update can occur through the proposal viewer (when the client fills in their invoicing details) or through the editor (when the proposal creator updates the invoicing information).

The resulting `POST` request will have the following data in its body:

```typescript theme={null}
{
  id: string;
  created: number;
  type: 'proposal.invoiceUpdated';
  integration: IntegrationSessionData;
  proposal: Proposal;
}
```

`id` and `created` are a random UUID and UNIX timestamp, respectively, and common for all webhooks.

Refer to the [IntegrationSessionData](/api-reference/entities/integrations-session-data) and [Proposal](/api-reference/entities/proposal) entities for the exact shape the payload can take.

## Invoicing Data

The invoicing information can be found in the `proposal.invoicing` field, which may contain:

* `address` - Invoice address (string)
* `city` - City (string)
* `companyName` - Company name for invoicing (string)
* `invoiceAddress` - Alternative invoice address (string)
* `organizationNumber` - Organization/VAT number (string)
* `reference` - Invoice reference/PO number (string)
* `zipCode` - Postal/ZIP code (string)

All fields are optional and depend on what information was provided by the client or proposal creator.
