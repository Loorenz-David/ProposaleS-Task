> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Proposal Status Update

This webhook is triggered for each stage of the Proposal lifecycle. It is first triggered when a `draft` changes to an `active` proposal, which might then get `accepted`, `rejected`, `withdrawn` or `expired`. You will also get notified if a draft is turned into a `template`.

The resulting `POST` request will have the following data in its body:

```typescript theme={null}
{
  id: string;
  created: number;
  type: 'proposal.statusChanged';
  integration: IntegrationSessionData;
  proposal: Proposal;
}
```

`id` and `created` are a random UUID and UNIX timestamp, respectively, and common for all webhooks.

Refer to the [IntegrationSessionData](/api-reference/entities/integrations-session-data) and [Proposal](/api-reference/entities/proposal) entities for the exact shape the payload can take.

## Optional response

In some cases the integration might want to store some metadata
in the sent proposal (for example an external booking ID or similar).
In these cases, you can respond to this webhook with the following format

<CodeGroup>
  ```typescript Type theme={null}
  {
    bookingId?: string;
    bookingStatus?: 'none' | 'booked' | 'pending';
    bookingStatusText?: string;
    data: {
      [key: string]?: string | boolean | number
    }
  }
  ```

  The booking ID and status properties can also be set, which will
  update the booking status built into Proposales (if the powerup is enabled).

  ```typescript Example response theme={null}
  {
    data: {
      internalBookingId: 'ABC-123',
      bookingCreationDate: '2032-01-13',
    }
  }
  ```
</CodeGroup>

The values in `data` will be stored in the [proposal's](/api-reference/entities/block) integration metadata (`proposal.data.integrations`).
