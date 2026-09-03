> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Content Availability

This webhook is called when checking a product's availability during proposal creation.
The request URL contains the search parameters `start`, `end`, and an optional `attendees`.

For **multi-day** ranges the editor may send `start` and `end` as **date-only** strings (`YYYY-MM-DD`) so calendar-day boundaries stay stable across environments. Single-day checks may still use full ISO timestamps that include time-of-day when the user set explicit times.

The body of the `POST` request that we'll call contains the following fields:

```typescript Check Availability for a product theme={null}
{
  id: string;
  created: number;
  type: 'content.availability';
  integration: IntegrationSessionData;
  integrationBlockSource: {
    integrationId: number;
    uniqueId: string;
    metadata: Record<string, unknown>;
  },
  /**
   * Optional. Either one row payload or an ordered array (one entry per breakdown row).
   * When an array is sent, each index should match the row order in the proposal UI.
   */
  row?:
    | {
        integration?: Record<string, unknown>;
        quantity?: number;
        /** Local calendar date for this row (`YYYY-MM-DD`). Used for per-row iteration. */
        date?: string;
        /** Local time-of-day (`HH:mm`, 24h). Optional; narrows the check for that row. */
        startTime?: string;
        endTime?: string;
      }
    | Array<{
        integration?: Record<string, unknown>;
        quantity?: number;
        date?: string;
        startTime?: string;
        endTime?: string;
      }>;
}
```

The response we expect from your side is JSON whose `data` field is **either** a single availability object **or** an array of objects (batched multi-day or per-row results). Each list item must include a `uniqueId` so the client can map results back to the correct slot.

```typescript Response (single) theme={null}
{
  data: {
    available?: boolean;
    quantity?: number;
    message?: string;
  }
}
```

```typescript Response (list) theme={null}
{
  data: Array<{
    uniqueId: string; // e.g. `row_0`, `row_1`, … or `day_0`, `day_1`, … depending on your contract
    available?: boolean;
    quantity?: number;
    message?: string;
  }>;
}
```

If availability is not applicable for a specific product, return an object with
an empty data field. Otherwise you can either set `available` or `quantity`, depending
on if it is a single resource, or numbered.

For list responses, omit `available` (or leave it unset) for slots where no determination
can be made, for example a row with no date yet.

Once a block has been added to a proposal and opened in the sidebar, the `row` property
will be included in the call. Integration blocks may send `row` as an **array** so all
rows are checked in one request; your implementation should accept both shapes for backward compatibility.
