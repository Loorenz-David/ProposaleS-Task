> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Patch proposal (draft)

> Partially update an existing draft or template proposal in place (same UUID).

Use this endpoint when you want to change blocks, title, recipient, attachments, or other draft fields **without** creating a new version. For a **new version** (duplicate + apply body), use [`Create new version of proposal`](/api-reference/proposals/new-version) — `POST /v3/proposals/{uuid}`. To update only the JSON **`data`** metadata blob with a shallow merge, use [`Patch proposal data`](/api-reference/proposals/patch-data).

## Eligibility

* The proposal must exist (`404` if the UUID is unknown).
* The authenticated user must be allowed to edit the proposal (`401` if not).
* `company_id` in the body must match the proposal’s company (`400` if not).
* Status must be **`draft`** or **`template`**. Other statuses return **`409`** (e.g. `active`, `accepted`).
* **`withdrawn`** proposals return **`400`**.

## Request body

The body is **strict**: only documented fields are accepted; extra keys return **`400`** with `error.issues` describing each problem (field path and message).

* **`company_id`** (number, **required** on every request) — must match the proposal’s company.
* **At least one other field** is required besides `company_id` (empty patches are rejected).

All other fields match **[Create proposal](/api-reference/proposals/create)** in shape, but they are **optional**: send only the keys you want to change. Omitted keys are left as-is on the server.

**Not accepted on this endpoint**

* **`creator_email`** — use [Create proposal](/api-reference/proposals/create) only.
* **`status`** — not used for publishing; see warning above.

**`language`**

* Optional on the patch if the proposal already has a language and you are not changing blocks that depend on the content library.
* If you send **`blocks`** with **`content_id`**, you must supply **`language`** in the body **or** the proposal must already have a language stored.

## Path

<ParamField path="uuid" type="uuid" required>
  The UUID of the draft or template to update (same UUID after a successful patch).
</ParamField>

## Common body fields

The following mirror [Create proposal](/api-reference/proposals/create); all are optional except `company_id`, subject to the rules above.

<ParamField body="company_id" type="number" required>
  Must equal the proposal’s `company_id`.
</ParamField>

<ParamField body="language" type="string">
  ISO-style language code (e.g. `en`, `sv`). Required when adding/updating blocks with `content_id` if the proposal has no stored language.
</ParamField>

<ParamField body="title_md" type="string">
  Proposal title as Markdown.
</ParamField>

<ParamField body="description_md" type="string">
  Proposal description as Markdown.
</ParamField>

<ParamField body="recipient" type="object">
  Same shape as [Create proposal](/api-reference/proposals/create).
</ParamField>

<ParamField body="data" type="object">
  Proposal metadata when you need to change it together with other draft fields. For a **merge-only** update of `data` without touching other fields, prefer [`PATCH /v3/proposals/{uuid}/data`](/api-reference/proposals/patch-data).
</ParamField>

<ParamField body="blocks" type="array">
  Same block shape as [Create proposal](/api-reference/proposals/create). **If you include `blocks`, the array replaces the proposal’s entire block list** for this update (same as create semantics). Omit `blocks` to leave the current layout unchanged. To change one block, send the full ordered list with that block updated. For blocks tied to the content library (`content_id`), the server merges your fields into the stored snapshot for each block you send; it does not accept a sparse “only these block UUIDs” delta.

  **Per-block `title`, `description`, and `image_uuids` are not honored on PATCH** — they are owned by the content library and the editor. If sent on a block, they are silently ignored. Update them in the Proposales editor instead.

  **Block identity for editor-edits preservation:** matching is strictly by **`uuid`**. The editor's manual edits to a block's title, description, or images are preserved only when the PATCH block carries the same `uuid` as the existing block. PATCH blocks without `uuid` are always treated as brand-new blocks (catalog title/description, server-generated `uuid`); the order in the resulting proposal mirrors the order in your request body. To update existing blocks, fetch current `uuid`s via `GET /v3/proposals/{uuid}` and echo them on PATCH. Position in the array is never used to match.
</ParamField>

<ParamField body="attachments" type="array">
  Same attachment shapes as [Create proposal](/api-reference/proposals/create).
</ParamField>

<ParamField body="background_image" type="object" />

<ParamField body="background_video" type="object" />

<ParamField body="contact_email" type="string" />

<ParamField body="invoicing_enabled" type="boolean" />

<ParamField body="invoicing" type="object" />

<ParamField body="tax_options" type="object" />

## Response

<ResponseField name="proposal" type="object">
  <Expandable title="properties">
    <ResponseField name="uuid" type="string">
      The UUID of the updated proposal (unchanged from the path).
    </ResponseField>

    <ResponseField name="url" type="string">
      Editor URL for this proposal draft.
    </ResponseField>
  </Expandable>
</ResponseField>

## Status codes

| Code  | Meaning                                                                                                                           |
| ----- | --------------------------------------------------------------------------------------------------------------------------------- |
| `200` | Draft updated                                                                                                                     |
| `400` | Validation failed (strict body, withdrawn, or `company_id` mismatch). Response may include `error.issues` with per-field details. |
| `401` | Missing/invalid token, or user cannot edit this proposal                                                                          |
| `404` | Unknown `uuid`                                                                                                                    |
| `409` | Proposal is not `draft` or `template`                                                                                             |
