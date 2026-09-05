# Source evidence: Proposales public API and AI layer, for the Proposal Preparation Backend

| | |
|---|---|
| **Artifact class** | Investigation / source evidence (companion to [proposal-preparation-backend-intention.md](proposal-preparation-backend-intention.md)) |
| **Evidence date** | 2026-09-05 |
| **Sources** | `api-documentation/proposales/openapi.json` and the Markdown pages in the same snapshot (vendored, never hand-edited); `architectural_contracts/README.md` "Resolved decisions" for runtime observations recorded before this feature; `package.json` and `node_modules` for the AI layer; the public-API draft experiment recorded in §8 |
| **Rule** | "Established from vendor documentation" means stated in the vendored snapshot. "Established empirically" means observed reproducibly through the documented public API. Neither runtime observation is promoted to a vendor guarantee unless the snapshot says so. |

## 1. Transport and authentication (established)

- Base URL: `https://api.proposales.com` (OpenAPI `servers`). No other host is documented. The web application's internal `secure.proposales.com/api/...` endpoints are not part of the public contract and are excluded by decision.
- `Authorization: Bearer <TOKEN>`; the token is bound to one user and inherits that user's access. Company resources need `company_id` as a query parameter or in the body. This deployment supplies it from `PROPOSALES_COMPANY_ID` server-side.
- All requests and responses are JSON. Error body: `{ "error": { "message": string } }`; messages are documented as neutral and safe for user interfaces. Strict-body endpoints return 400 with `error.issues` per field.
- Versioning is per endpoint (`/v1/attachments`, `/v3/content`, `/v3/proposals`). Responses may gain keys without a version bump; only read the keys you need.
- **No pagination** exists on any endpoint ("we don't provide a way to fetch data via API yet" for pagination; planned for the future).

## 2. Endpoint inventory (established, from `openapi.json` paths)

| Method and path | Summary | Relevance to this feature |
|---|---|---|
| `GET /v3/content` | List content | content search / get (id filters only) |
| `POST /v3/content` | Create or restore content | out of scope (agent must not create content) |
| `PUT /v3/content` | Update content | out of scope |
| `DELETE /v3/content` | Archive content | out of scope |
| `POST /v3/proposals` | Create proposal (draft) | the one execution mutation |
| `GET /v3/proposals/{uuid}` | Get proposal | optional result enrichment (`series_uuid`, `status`, totals) |
| `POST /v3/proposals/{uuid}` | Create proposal version | out of scope (already-sent proposals) |
| `PATCH /v3/proposals/{uuid}` | Update proposal draft | not expected; fallback only if a single create cannot express the payload |
| `PATCH /v3/proposals/{uuid}/data` | Update proposal data (shallow merge) | not expected |
| `GET /v3/proposal-search` | Search proposals | duplicate recovery by generation ID |
| `GET /v3/companies` | List companies | not needed (company id is configured) |
| `GET /v3/companies/{companyId}/templates` | List company templates | deferred (templates out of scope) |
| `GET /v1/attachments` | List attachments | deferred (attachments out of scope) |
| `POST /v1/inbox/{token}` | Create an RFP | out of scope |

**There is no send, publish, activate, or status-change endpoint in the public API.** Sending is a Proposales UI action. Webhooks (`proposal.statusChanged`, recipients search, content import, and others) are calls *from* Proposales *to* an integration and are not usable to send or to look up contacts from this application.

## 3. Content (established)

`GET /v3/content` query parameters: `company_id`, `external_id`, `variation_id` (single or comma-separated), `product_id` (single or comma-separated), `include_archived`, `include_sources`. **No free-text, title, or semantic search parameter exists.**

`ContentItem` response fields (OpenAPI component): `created_at` (int64), `description` (LocalizedText: language code → string), `deactivated_at`, `product_id`, `variation_id`, `title` (LocalizedText), `is_archived` (only with `include_archived`), `sources` (only with `include_sources`), `images` (included for detailed variation queries), `integration_id`, `integration_metadata`.

**No price, currency, unit, discount, tax, or package-split field is present in `ContentItem`.** The content library's commercial defaults are applied by Proposales when a block references the content on proposal creation ("Additional block data can be passed to overwrite the content library defaults"). Consequence for the intention: Proposales content cannot be a *pre-creation* source of price values through the public API; see owner card 2.

Product vs variation: each product has exactly one variation in the current system; `product_id` and `variation_id` are interchangeable for lookup, but a proposal block's `content_id` **must be the `variation_id`**.

Content can be a product or a video; both attach to proposals as blocks.

## 4. Proposal creation (established)

`POST /v3/proposals`, `CreateProposalRequest` (strict: `additionalProperties: false`):

| Field | Required | Notes |
|---|---|---|
| `company_id` | yes | integer ≥ 1 |
| `language` | yes | string; docs say two-letter code (`en`, `sv`) |
| `creator_email`, `contact_email` | no | must be company members; otherwise token owner / creator is used |
| `title_md` | no | Markdown; only data URLs for variables supported, other syntax ignored |
| `description_md` | no | Markdown subset: `#` headers, `*` bold, `<` left-align prefix, data URLs for variables |
| `recipient` | no | `{ id }` for an existing contact **or** `{ first_name?, last_name?, email?, phone?, company_name?, sources? }` inline |
| `data` | no | free-form object; fills proposal variables; preserved when the draft is sent; used for app metadata |
| `tracking` | no | `created_from_rfp`, `created_from_template` |
| `invoicing_enabled`, `invoicing` | no | out of scope |
| `tax_options` | no | `{ mode?: standard \| simplified \| tax-free \| none, tax_included?, tax_label_key? }` |
| `blocks` | no | array of `ProposalBlockInput` (below) |
| `attachments` | no | out of scope |
| `background_image`, `background_video` | no | out of scope |

`ProposalBlockInput` properties (OpenAPI): `content_id` (int64; the variation id), `type` (`product-block` \| `video-block`), `uuid` (only meaningful on patch), `video_url`, `title`, `description`, `image_uuids`, `currency`, `quantity` (number), `quantity_editable`, `optional`, `package_split[]`, `multi_product_enabled`, `multi_product_data[]`, and the four `unit_value_*` numbers (cents). The docs describe the create shape as `{ content_id, type? } | { type: 'video-block', video_url, title }`.

Response `ProposalMutationResponse`: `{ proposal: { uuid, url } }`. Docs: `url` is "the URL to view the proposal in Proposales" (create) and "Editor URL for this proposal draft" (patch) / "Editor URL for the proposal" (search). **`series_uuid` and `status` are not in the create response**; they are available from `GET /v3/proposals/{uuid}` and from proposal search.

Status codes: 200 created; 400 validation; 401; 403; 404 (for example `tracking` references outside the company); 500.

## 5. Proposal search and metadata (established)

`GET /v3/proposal-search` parameters: `company_id`, `filter[property_name]` (matches a key in the proposal `data` object), `recipient_email` (case-insensitive exact), `limit` (default 1, max 25), `exclude_revision_drafts`, `include_archived`. Results ordered by `updated_at` descending. `ProposalSearchResult` fields: `created_at`, `updated_at`, `title`, `uuid`, `series_uuid`, `company_id`, `version` (nullable), `status`, `data`, `url`.

Runtime observation recorded in the repository (`architectural_contracts/README.md` "Proposales create idempotency", `04-server-architecture.md` §8): an app-owned custom key in `proposal.data` participated in `filter[<key>]=<value>` filtering for the key tested. **Established only for flat keys with the value shapes tested**; nested keys and non-string values are not established.

`ProposalData` is `additionalProperties: true`; the docs note that `data` also supplies proposal variables shown in the description, so app keys share a namespace with a company's variables.

## 6. Proposal entity facts used by the intention (established)

- Statuses: `draft`, `template`, `active`, `expired`, `accepted`, `replaced`, `rejected`, `withdrawn`, and `null` for non-latest historical versions.
- `PATCH /v3/proposals/{uuid}` is allowed only for `draft` or `template`; other statuses return 409; `withdrawn` returns 400. Its `blocks` array replaces the whole block list; block matching is by `uuid`; per-block `title`, `description`, `image_uuids` are ignored on patch.
- `POST /v3/proposals/{uuid}` creates a new draft version with a **new UUID in the same series**; repeated calls return the same draft UUID until it is sent or archived.
- A proposal has one `currency` (3-letter code); Proposales does not support multiple currencies per proposal. Block `currency` is informational.
- `tax_options` is captured on the proposal from the company configuration at send time; `company_tax_mode_live` is the live company value used on unsent drafts.
- `value_with_tax` and `value_without_tax` are integer cents; block `unit_value_*` are cents per unit; `percent_discount` is a 0–1 float; `fixed_discount` is cents excluding tax.
- `recipient_is_set` is false on a fresh draft by default; all sent versions have a recipient.
- `is_agreement` marks a proposal without products (text-only offer).
- Timestamps are typed int64 without a documented unit; runtime observations recorded in the repository are millisecond-scale; the adapter owns the interpretation.

## 7. Not established (verify before relying on it)

| Question | Status | Why it matters |
|---|---|---|
| Does omitting `tax_options` on create give the draft the company default tax behavior? | expected from entity docs, not stated for create | intention omits `tax_options`; execution must not set tax treatment without a human source |
| Is an inline recipient deduplicated against an existing contact with the same email? | not documented | risk of duplicate contacts in Proposales when the MVP supplies inline recipients |
| Are nested `data` keys or non-string values filterable in proposal search? | only flat tested keys verified | drives the flat-key metadata rule |
| Does Proposales document a guarantee that one `unit_value_*` is enough to derive the other values or the VAT split? | no | §8 empirically finds no such derivation on create; the absence of derivation is not itself a vendor guarantee against future behavior |
| Does `ProposalBlockInput` accept discount fields absent from its OpenAPI schema? | entity lists them, input schema does not; no `additionalProperties: false` on the block input | discounts are deferred regardless |
| Which languages does the target company's content carry, and how large is the catalog? | unknown to the repository | owner cards 3 and 4 |
| Is `url` on the create response always the editor URL for drafts? | create doc says "view", patch and search docs say "editor" | the intention treats it as the editor handoff URL; confirm during the first live smoke test |

## 8. Price override investigation (public API, empirical; 2026-09-05)

### 8.1 Scope and method

- Public host only: `https://api.proposales.com`. No `secure.proposales.com` endpoint, content mutation, proposal update, or send operation was used.
- Test content: product `188558`, variation `188485`, title `API Test Service`, language `en`. The create request used the variation id as `blocks[].content_id`, `quantity: 1` unless named otherwise, no recipient, and no explicit `tax_options`.
- Every draft had a title beginning `[DISPOSABLE API PRICE TEST]` plus `data = { investigation: "proposal-price-override-2026-09-05", test_case, disposable: true }`, and was fetched immediately through `GET /v3/proposals/{uuid}`.
- The control read back `currency: EUR`, `company_tax_mode_live: standard`, and `tax_options: { mode: "standard", tax_included: false }`. Its single library split was `{ type: "other", vat: 0, fixed: false, enable_discount: true, value_without_tax: 10000, value_with_tax: 10000 }`. `GET /v3/companies` separately returned only the company's `currency: EUR` and `tax_mode: standard`; it did not return a VAT rate.

### 8.2 Vendor documentation (established from the vendored snapshot)

- `ProposalBlockInput` names the four price fields `unit_value_with_discount_without_tax`, `unit_value_with_discount_with_tax`, `unit_value_without_discount_without_tax`, and `unit_value_without_discount_with_tax`. The short forms `unit_value_without_tax`, `unit_value_with_tax`, `unit_value_without_tax_before_discount`, and `unit_value_with_tax_before_discount` are not properties of that public OpenAPI schema.
- `PackageSplit` is an array of objects whose only required field is `type`; documented price/tax fields are `vat`, `value_without_tax`, `value_with_tax`, `value_saved_with_tax`, `fixed`, and `enable_discount`. The Package Split documentation says it determines the VAT value(s) used in calculation and says its stored values are taken from user input or calculated when a product is edited. It does not guarantee create-time derivation of missing block `unit_value_*` values.
- `GET /v3/content` does not expose content prices or package splits. `GET /v3/companies` exposes a default currency and tax mode, not VAT rates. A fetched proposal exposes its stored `tax_options`, live company tax mode, proposal totals, block unit values, and block package split, but only after a draft exists.

### 8.3 Runtime results (established empirically; not a vendor guarantee)

Amounts below are cents. `wd-wo`, `wd-w`, `wo-wo`, and `wo-w` mean the four documented fields in the order above. A `10000` value is the content-library default.

| Case | Request price fields / split | Read-back unit values `(wd-wo, wd-w, wo-wo, wo-w)` | Proposal totals `(without, with)` | Finding |
|---|---|---:|---:|---|
| Control | none | `(10000, 10000, 10000, 10000)` | `(10000, 10000)` | library defaults |
| Requested short-name tests 1–4 | one, two, or all supplied short names at `1200000` | `(10000, 10000, 10000, 10000)` | `(10000, 10000)` | HTTP 200, but none persisted or affected totals |
| Documented test 1 | `wd-wo=1200000` | `(1200000, 10000, 10000, 10000)` | `(1200000, 10000)` | only supplied field changed |
| Documented test 2 | `wd-w=1200000` | `(10000, 1200000, 10000, 10000)` | `(10000, 1200000)` | only supplied field changed |
| Documented test 3 | `wd-wo=1200000`, `wo-wo=1200000` | `(1200000, 10000, 1200000, 10000)` | `(1200000, 10000)` | no with-tax derivation |
| Documented test 4 | all four `=1200000` | `(1200000, 1200000, 1200000, 1200000)` | `(1200000, 1200000)` | all supplied values persisted and totals changed |
| Documented test 5 | all four `=1200000`; explicit VAT-0 package split with both split values `1200000` | all four `1200000` | `(1200000, 1200000)` | package split persisted; it was not needed for these stored totals |
| Quantity targeted case | `quantity=2`, `wd-wo=1200000` | `(1200000, 10000, 10000, 10000)` | `(2400000, 20000)` | each independently stored price component was multiplied by quantity |
| Currency targeted case | `currency=SEK`, `wd-wo=1200000` | `(1200000, 10000, 10000, 10000)` | `(1200000, 10000)` | proposal and block currency became `SEK`; no conversion or reconciliation occurred |
| Non-zero VAT single-field cases | a complete `vat=0.25` split (`1200000` without / `1500000` with) plus only `wd-wo=1200000` or only `wd-w=1500000` | the opposite three fields remained `10000` | `(1200000, 10000)` or `(10000, 1500000)` | even an explicit, internally complete VAT split did not derive missing unit fields |
| Non-zero VAT split-only case | complete `vat=0.25` split (`1200000` without / `1500000` with), no unit fields | `(10000, 10000, 10000, 10000)` | `(10000, 10000)` | package split persisted but did not override price totals |
| Non-zero VAT full case | all four `(1200000, 1500000, 1200000, 1500000)` plus the matching complete `vat=0.25` split | exactly those values | `(1200000, 1500000)` | complete values and split persisted consistently |

### 8.4 Findings and limits

- **Established empirically:** on the tested API version, price inputs are independently persisted. A partial documented `unit_value_*` write changes the corresponding proposal total but leaves the counterpart and before-discount fields at the library default. This was reproduced with the library's VAT-0 split and with a supplied 25% split.
- **Established empirically:** `package_split` is not required for the proposal totals to reflect four explicitly supplied unit values. It is nevertheless required to replace the inherited VAT split itself; without it, the block can contain custom unit values alongside the old library package split.
- **Established empirically:** a consistent price/tax state was created only when all four documented unit fields and a matching complete package split were supplied. This is the minimum observed *tax-consistent* combination, not a documented vendor guarantee.
- **Not established / not safe to infer:** Proposales did not calculate a tax counterpart from one canonical amount in any test. Therefore the application cannot safely rely on automatic derivation, even though the vendor documentation describes package-split calculation in other editing contexts.
- **Public information available to an application:** company currency and tax mode from `GET /v3/companies`; post-creation proposal tax options, live tax mode, totals, and package split from `GET /v3/proposals/{uuid}`. The public content API provides neither a price nor a content VAT split before creation, and no public endpoint in the snapshot exposes company VAT-rate configuration. The post-create data arrives too late to safely construct the initial custom price payload.
- **Limitation:** the test content's library VAT was 0. The 25% cases prove only that a caller-supplied split is persisted and still does not trigger unit-field derivation; they do not establish that 25% is a company or content tax rate.

### 8.5 Disposable draft UUIDs

`cf938eaf-3618-41b2-9a58-8282ffa0cdc4`, `76e7a101-c40b-491c-b6e4-54946cfb0a99`, `21df16ae-ca34-4465-b938-8039613e14b9`, `a6498023-685f-41e4-8aad-a59a8535399f`, `2aaa2213-cd91-4e8e-9dcd-31a09a58f01b`, `3e34f7ec-5ba6-4518-b42d-30823ecb8822`, `3e4e31a2-cfb0-4509-8442-fdc8b22e41ca`, `509ece0e-cf9a-45c3-953b-6d6adf11230a`, `36408eda-6f23-4428-94fa-b62ab2ee2fb5`, `13c71781-2537-47e7-8352-6d3f17fb93d7`, `8d47fe31-9431-44c2-868d-a43f95915df8`, `83e1c194-0647-4b6c-849d-b976d3439a09`, `40a2c899-aa68-4fa8-9b08-6ac71c460883`, `bbc88bec-1a2c-4c8b-bb61-245baf4b89a2`, `c6edc4ba-5127-43fc-b67a-355c889126df`, `06c93f43-4cd8-472e-8997-6ce4fbc8d5d4`, `4c1f1b7a-40f5-4202-8235-d874c7afd602`, `6b538867-4066-4eb3-96cb-0620c968b669`.

## 9. AI layer state (established from the repository)

- `ai` 7.0.92 installed. Transitive packages present: `@ai-sdk/gateway`, `@ai-sdk/provider`, `@ai-sdk/provider-utils`. No `@ai-sdk/<vendor>` package, no `openai`, `@anthropic-ai/*`, or Google SDK is installed.
- No AI-related environment variable exists in `.env.example`.
- The root README states: "Vercel AI SDK (`ai`) installed; no model provider configured yet."
- Consequence: provider choice is genuinely open (owner card 5); the intention binds provider neutrality through `@/lib/ai` (contracts 07 §8, 08 §8) and requires the test suite to run on a scripted fake.

## 10. Experiment P1 status (superseded)

The earlier narrow P1 plan must not be run in addition to this investigation. Section 8 executed the required clean-create matrix against one safe content item, including the equivalent baseline, partial-field, complete-field, package-split, quantity, currency, and non-zero supplied-VAT cases. Its outcomes replace the P1 open question; the owner card remains unresolved until the owner makes the product decision.
