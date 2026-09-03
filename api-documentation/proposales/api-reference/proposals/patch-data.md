> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Patch Proposal Data

> Patch the proposal data field.

<Note>
  This route **only** shallow-merges the `data` JSON object. To change title, blocks, recipient, attachments, and other draft fields on the same proposal UUID, use [`Patch proposal (draft)`](/api-reference/proposals/patch-draft) (`PATCH /v3/proposals/{uuid}`).
</Note>

### Body

<ParamField path="uuid" type="string" required>
  The UUID of the proposal to update
</ParamField>

<ParamField body="data" type="object" required>
  The fields to update in the proposal's `data` property.
  Passing `null` as a key will delete it from the proposal data.
  Omitted and `undefined` values are left unchanged.
</ParamField>

### Response

<ResponseField name="data" type="object">
  The updated `data` field of the proposal.
</ResponseField>
