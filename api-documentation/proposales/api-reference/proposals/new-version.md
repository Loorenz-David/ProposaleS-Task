> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Create new version of proposal

> Create a new draft version of an existing proposal in the same proposal series.

Use this endpoint to create a new draft **version** of a proposal that has already been sent. The new draft is a fresh copy of the source proposal in the same proposal series, with a new UUID, and the request body lets you override fields on the new draft. For partial in-place updates of a draft you have not sent yet, use [`Patch proposal (draft)`](/api-reference/proposals/patch-draft). For an entirely new proposal series, use [`Create proposal`](/api-reference/proposals/create).

## When to use this endpoint

Pick the right v3 endpoint based on the current state of the proposal on Proposales' side:

* **Proposal does not exist yet** → [`POST /v3/proposals`](/api-reference/proposals/create).
* **Proposal exists and is still `draft` or `template`** → [`PATCH /v3/proposals/{uuid}`](/api-reference/proposals/patch-draft) (in-place update, same UUID).
* **Proposal exists and has already been sent** (`active`, `accepted`, `replaced`, `expired`, or `rejected`) → this endpoint (`POST /v3/proposals/{uuid}`) — it creates a new draft version in the same proposal series.

Calling this endpoint while the source proposal is still a `draft` is allowed, but it creates a *separate* draft alongside the existing one rather than a true new version. For changes to a proposal you have not yet sent, prefer [`PATCH /v3/proposals/{uuid}`](/api-reference/proposals/patch-draft).

## Eligibility

* The source proposal must exist.
* The caller must have access to the source proposal's company.
* `body.company_id` must match the source proposal's company.
* The source proposal must **not** be `withdrawn`. Any other status is accepted (`draft`, `template`, `active`, `accepted`, `replaced`, `expired`, `rejected`).

## Idempotency

Calling this endpoint repeatedly for the same source UUID returns the **same** draft UUID until that draft is sent or archived. Each call applies your latest body to that draft, so callers should treat this endpoint as "create-or-replace the next-version draft" rather than "always create a new draft". Once the draft is sent (or archived), a subsequent call mints a fresh new-version draft.

## What carries over from the source

The new draft inherits the following from the source proposal, unless overridden in the request body:

* Blocks, including any title, description, and image customisations made in the editor
* Attachments
* Recipient
* Language
* Title and description
* Tax options
* Background image and background video
* Payment configuration
* Proposal metadata (`data`)
* Creator and contact person

The new draft belongs to the **same proposal series** as the source. When the series contains a previously accepted proposal, the new draft is automatically linked to it so version history is preserved in the editor.

## Path

<ParamField path="uuid" type="uuid" required>
  The UUID of the source proposal to create a new version from.
</ParamField>

## Request body

The body shape mirrors [`Create proposal`](/api-reference/proposals/create); most fields are **optional** and override the value carried over from the source, but `company_id` and `language` are **required** (see [Eligibility](#eligibility)). The body is **strict** — extra keys return **`400`** with `error.issues` describing each problem.

* **`creator_email`** is **ignored** on this route. The creator is preserved from the previous version.

<ParamField body="company_id" type="number" required>
  Must equal the source proposal's `company_id`.
</ParamField>

<ParamField body="language" type="string" required>
  ISO-style language code (e.g. `en`, `sv`).
</ParamField>

<ParamField body="title_md" type="string">
  Proposal title as Markdown. Overrides the carried-over title.
</ParamField>

<ParamField body="description_md" type="string">
  Proposal description as Markdown. Overrides the carried-over description.
</ParamField>

<ParamField body="recipient" type="object">
  Same shape as [Create proposal](/api-reference/proposals/create).
</ParamField>

<ParamField body="contact_email" type="string">
  Email of the internal contact person. Same rules as [Create proposal](/api-reference/proposals/create).
</ParamField>

<ParamField body="data" type="object">
  Proposal metadata. Replaces the carried-over `data`.
</ParamField>

<ParamField body="blocks" type="array">
  Same block shape as [Create proposal](/api-reference/proposals/create). When provided, the array replaces the carried-over block list on the new draft.
</ParamField>

<ParamField body="attachments" type="array">
  Same attachment shapes as [Create proposal](/api-reference/proposals/create). When provided, replaces the carried-over attachments.
</ParamField>

<ParamField body="background_image" type="object" />

<ParamField body="background_video" type="object" />

<ParamField body="invoicing_enabled" type="boolean" />

<ParamField body="invoicing" type="object" />

<ParamField body="tax_options" type="object">
  Same shape as [Create proposal](/api-reference/proposals/create).
</ParamField>

## Response

<ResponseField name="proposal" type="object">
  <Expandable title="properties">
    <ResponseField name="uuid" type="string">
      The UUID of the new draft version (always different from the path UUID; the same draft UUID is returned on repeated calls until that draft is sent or archived — see [Idempotency](#idempotency)).
    </ResponseField>

    <ResponseField name="url" type="string">
      Editor URL for the new draft.
    </ResponseField>
  </Expandable>
</ResponseField>

## Status codes

| Code  | Meaning                                                                                      |
| ----- | -------------------------------------------------------------------------------------------- |
| `200` | New draft version created (or existing one returned and updated under the idempotency rule). |
| `400` | Body validation failed. Response includes `error.issues` with per-field details.             |
| `401` | Missing or invalid API token.                                                                |
