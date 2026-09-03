> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Proposal

> Represents a proposal in Proposales. A proposal is the document that you send to your recipient with an offer for your services.

## Overview

<Note>
  Depending on its status, a proposal can be either a draft, template or a version of a sent proposal.
</Note>

For more chances of your proposal getting accepted, we recommend using an attractive video in the heading (`background_video`), with a descriptive, but not too long title, a description of who your company is and what experience you aim to give them.

Follow this with a clear collection of products that you're offering, but don't make it too detailed - try to look at the proposal from the perspective of the person receiving it - they want to have a good overview of what they're paying for, but don't want to get overwhelmed by unnecessary details. If details are important for e.g. explaining price, and you already have more than 8 products in your proposal, you can always add a short descriptive entry in the [block pricing breakdown](/api-reference/entities/multi-product-row), rather than adding a whole separate block for it.

Finally, for more administrative content - like an official terms and conditions document, add an attachment at the end of the proposal that the recipient can read separately, before they respond to your proposal.

## Proposal versioning

Proposales is built from the ground up so that every state of a proposal that you're actively sending to your recipient is saved as a version of that proposal. Basically, every time you press the `Send` button, and the recipient receives changes to the proposal - usually as a result of adding or removing some products, we internally keep a new "version" of it available for both you and the recipient, so that the history of what was offered is clear for both parties.

For your recipient, and for you, this will look like one proposal that allows you to go through previous versions. But internally we see this rather as all versions being proposals that belong to a proposal series.

Keeping previous versions as close as possible to the original data is important for the contractual nature of a proposal, and holding them as separate data entities ensures that only the minimum necessary is changed when a new version is sent.

Let's consider an example, to make the versioning model more clear. You've created a proposal containing 2 products: "Double room" with quantity 10 and "Meeting room" with quantity 1 based on the initial conversation you had with the customer. After seeing the proposal, they ask if it would be possible to also add 3 single rooms on top of that. So, you edit the proposal, and add a third product "Single room" with quantity 3 which you then send to your recipient. What both you and the recipient will see at this point is one proposal with 2 versions via the dropdown on the top right. Internally, we call this a proposal series, with each entry in the proposal series (including the lastest one) being a version of the proposal.

## Proposal Status

A proposal version in Proposales can have one of the following status values:

`draft` - a proposal draft is a proposal that hasn't been sent to the recipient yet. It might be the first draft created before any version has been sent to the recipient, but it might also be a new version currently in progress for a proposal series that has already been sent.

`template` - a special unsent proposal draft that is marked to be used as a model for future proposals. In Proposales users rarely start from a completely empty proposal. Usually they will create a new proposal by duplicating one of the templates already prepared. Templates cannot be sent.

Templates are prepared by admin users in your company and are not listed together with the normal proposals in the Proposales UI, but rather they have their own listing when the user creates a new proposal. The intention is to help keep a consistent look and feel accross your company's offerings.

`active` - this is the latest version sent to the recipient and it hasn't expired yet. They can respond to it at any time, as well as select / unselect optional products, and update variable quantities.

`expired` - this is the latest version sent to the recipient, but the expiration date has passed. The recipient can't take any action on it. The sender can chose to continue by updating the expiration date or by making more changes to the proposal and sending a new version.

`accepted` - the recipient has already accepted this version of the proposal and is bound by it contractually. The sender can choose to continue the proposal series with a new version, in which case a later version of the proposal might be active at the same time.

If the edit button is disabled for you once a version has been accepted, get in touch with our customer success - some conditions apply that might disable "Continue after accept" for your company.

`replaced` - this version of the proposal was previously accepted by the recipient of the proposal, then a later version has been accepted as well. This version is available for historical information, the latest accepted version is the one that's contractually binding.

For statuses `accepted` and `replaced` note that I mention that the recipient accepted the proposal, but in truth the sender of a proposal can mark a proposal as accepted as well. If it's necessary to know exactly who marked the proposal as accepted, check the `signatures` field.

`rejected` - the recipient has rejected this version of the proposal.

`withdrawn` - the sender of the proposal has decided to withdraw this proposal. The recipient has been notified.

`null` - this is not the latest version in the proposal series, and is only available as read-only historical information. The recipient can use the version selector to inspect previous versions of the Proposal.

## Fields

```ts theme={null}
{
  archived_at: number | null
  attachments: proposal_attachment[]
  background_image: {
    id: number
    uuid: string
  } | null
  background_video: {
    id: number
    uuid: string
  } | null
  blocks: proposal_block[]
  company_powerups: Powerups
  company_registration_number: string | null
  company_tax_mode_live: 'standard' | 'simplified' | 'tax-free' | 'none'
  company_website: string | null
  contact_avatar_uuid: string | null
  contact_email: string
  contact_id: number
  contact_name: string | null
  contact_phone: string | null
  contact_title: string | null
  creator_id: number
  creator_name: string | null
  currency: string
  data: ProposalData
  description_md: string | null
  editor: {
    cc?: number[]
    notification_user_ids?: number[]
  }
  expires_at: number | null
  invoicing: {
    data_prefill?: any
    data?: {
      [x: string]: string
    }
    enabled?: boolean
    form_overrides?: object
    reminder_sent_at?: string
    submitted_at?: string
  }
  is_agreement: boolean
  is_only_proposal_in_series: boolean
  is_test: boolean
  language: string
  pdf_url: string | null
  pending: boolean
  pending_reason: string | null
  recipient_company_name: string | null
  recipient_email: string | null
  recipient_id: number | null
  recipient_is_set: boolean
  recipient_name: string | null
  recipient_phone: string | null
  signatures: {
    date: string
    ip: string
    name: string
    user_agent: string
    user_id?: number
  }[]
  status_changed_at: number
  status: ('accepted' | 'active' | 'draft' | 'expired' | 'rejected' | 'template' | 'withdrawn' | 'replaced') | null
  tax_options: {
    mode?: ('standard' | 'simplified' | 'tax-free' | 'none')
    tax_included?: boolean
    tax_label_key?: string
  }
  title_md: string | null
  tracking: {
    accepted_at?: string
    accepted_by_mobile?: boolean
    created_from_proposal?: string
    created_from_rfp?: number
    created_from_template?: string
    expired_at?: string
    expiration_reminder_sent_at?: string
    first_viewed_at?: string
    last_viewed_at?: string
    number_of_views?: number
    rejected_at?: string
    sent_at?: string
    withdrawn_at?: string
    marked_as_accepted_by_user?: {
      email?: string
      id: number
      name?: string
    }
  }
  updated_at: number
  uuid: string
  value_with_tax: number
  value_without_tax: number
  version: number | null
}
```

## Fields explained

<ResponseField name="archived_at" type="timestamp">
  The UNIX timestamp of when the version was marked as deleted, `null` otherwise.
</ResponseField>

<ResponseField name="attachments" type="list of attachment objects">
  The list of attachments connected to the proposal. Documented in [Proposal Attachment](proposal-attachment)
</ResponseField>

<ResponseField name="background_image" type="asset object">
  Shown as the background for the proposal heading, in case no video background is defined. If the video is defined, this image will be displayed in cases where the video is not playable, for example if the user prints the proposal as a PDF.

  `id` - the id of the image file in the Proposales database

  `uuid` - the uuid under which the contents of the image file are saved in the Proposales backend
</ResponseField>

<ResponseField name="background_video" type="asset object">
  Shown as the background for the proposal heading, it will be played without sound on repeat. We recommend using a short presentational video aligned with your brand.

  `id` - the id of the video file in the Proposales database

  `uuid` - the uuid under which the contents of the video file are saved in the Proposales backend
</ResponseField>

<ResponseField name="blocks" type="proposal_block[]">
  The products and videos that make up the proposal.

  See [Proposal Block](proposal-block) for more details.
</ResponseField>

<ResponseField name="company_powerups" type="object">
  A list of the powerups connected to the company at the time when the proposal was created. The configuration is very specific to each powerup.

  A powerup can for example be a connection to Proposales, or various Proposales features that are enabled on your company. Some powerups can change the way proposals are displayed.
</ResponseField>

<ResponseField name="company_registration_number" type="string">
  The registration number for the company, at the time when the proposal was created. This value is shown in the footer of the proposal.
</ResponseField>

<ResponseField name="company_website" type="string">
  The website set for the company, at the time when the proposal was created. This value is shown in the footer of the proposal.
</ResponseField>

<ResponseField name="contact_avatar_uuid" type="string">
  The uuid for the profile image of the user that's representing the company. The avatar image will be shown in the footer of the proposal, and next to comments.
</ResponseField>

<ResponseField name="contact_email" type="string">
  The email at which the user representing the company can be reached. This can be the username of the contact user, or the contact email of the company, depending on your settings.
</ResponseField>

<ResponseField name="contact_id" type="string">
  The internal id for the user that's representing the company. If a contact user is set, then it will be the contact user, otherwise it defaults to the creator of the proposal.
</ResponseField>

<ResponseField name="contact_name" type="string">
  The name for the user representing the company. Shown in the proposal footer and in the comments.
</ResponseField>

<ResponseField name="contact_phone" type="string">
  The phone number at which the user representing the company can be reached. Shown in the proposal footer.
</ResponseField>

<ResponseField name="contact_title" type="string">
  The title of the user representing the company. Shown in the proposal footer.
</ResponseField>

<ResponseField name="creator_id" type="string">
  The internal id for the user who created the proposal. This user can be different than the contact user when a contact user is set on the proposal. Otherwise, the 2 ids are the same.
</ResponseField>

<ResponseField name="creator_name" type="string">
  The name of the user that created the proposal.
</ResponseField>

<ResponseField name="currency" type="string">
  A 3-letter code that identifies the currency in which the values in the proposal are represented. Example: USD.
</ResponseField>

<ResponseField name="description_md" type="string">
  The description of the proposal saved in an internal format derived from markdown. Among other modifications, proposal variables will be retained in this format and at the same time specify the value that they show in plain text (the values for the proposal variables in the proposal are not calculated when the proposal is displayed, but when the proposal is edited - to ensure that what we display doesn't change over time)
</ResponseField>

<ResponseField name="data" type="string">
  The value for all proposal variables. If the proposal is initiated from an RFP for example, the values that the website visitor filled in will be available in this data.

  These are the values that Proposales uses to populate proposal variables in the proposal.

  If you're implementing a connection to Proposales, this is also where you'll find connection specific id's and data for this proposal.
</ResponseField>

<ResponseField name="editor" type="Object">
  An object containing configurations for the proposal that are guaranteed to not affect the way we display the proposal.

  A configuration that would be stored here is for example the list of user ids that should be notified via email of changes in the lifecycle of the proposal (e.g. the proposal got accepted)
</ResponseField>

<ResponseField name="expires_at" type="string">
  The timestamp when the proposal will be set as expired, and user actions will be disabled on it. The user can update the expiry date for an expired proposal from the Proposales UI.
</ResponseField>

<ResponseField name="invoicing" type="Object">
  If invoicing is enabled on a proposal, once the proposal was accepted by the recipient, or marked as accepted by a user, the recipient will see a dialog being asked to fill in their invoicing information when visiting the proposal.

  This object contains the configuration used for showing the dialog, as well as the data filled in for the invoicing.

  The configuration is saved at the level of the proposal so that it doesn't change after the proposal is created.

  **enabled** - Determines whether invoicing is enabled for the proposal - whether the dialog will be displayed at all.

  **data\_prefill** - If the recipient of the proposal filled in this information on a previously accepted proposal, we'll pre-fill the form with the values they filled in the previous time. They will still have the option to write new values.

  **form\_overrides** - Overrides to be applied to the invoicing form. This configuration is taken over from the company.

  **data** - The actual data that was sent in by either the recipient, or filled in by the user for this proposal.

  **reminder\_sent\_at** - If the customer hasn't filled in the invoicing form, we send them a reminder via email. This field annotates that the reminder has already been sent.

  **submitted\_at** - A timestamp of when the invoicing data was submitted. Used mostly as a boolean that the form was filled in.
</ResponseField>

<ResponseField name="is_agreement" type="boolean">
  A special type of proposal that doesn't have a price and doesn't contain any products. It's intended to be used as a text document (using the proposal description). A usecase for this kind of proposal is for example an offer for a yearly discount.
</ResponseField>

<ResponseField name="is_test" type="boolean">
  A proposal marked as test will not be part of statistics and insights. This is a means for users to be able to experiment with Proposales functionality, while not influencing the data for the user or for the company.
</ResponseField>

<ResponseField name="language" type="string">
  The language that the proposal is set to, determining what language the products are displayed in, as well as the Proposales UI.

  Usually it's a 2-letter code, like `us`, but in some cases, it will contain the region as well.
</ResponseField>

<ResponseField name="pending" type="boolean">
  A proposal can be set to pending. In this state the proposal is considered pending from the sender's perspective and is blocked from responding to.

  An example of a reason why a proposal could be pending is if a resource is offered to two parties for the same period. The first party who made the inquiry can accept or reject their proposal, but during that time the offer may be extended to a second party with the note that it would only be available if the first party declines.
</ResponseField>

<ResponseField name="pending_reason" type="string">
  If the proposal is set as pending, this is the reason we provide to the recipient for the accept button being disabled.
</ResponseField>

<ResponseField name="recipient_is_set" type="boolean">
  Determines whether a recipient is already set on a proposal. All sent versions have a recipient, but a draft in the series will start off not having a recipient usually.
</ResponseField>

<ResponseField name="recipient_id" type="number">
  The internal id of the contact that serves as recipient for this proposal.
</ResponseField>

<ResponseField name="recipient_name" type="string">
  The name of the person that is the recipient of the proposal. If the company is not set (for example if the proposal is addressed to a private person) this value is shown on the proposal heading
</ResponseField>

<ResponseField name="recipient_company_name" type="string">
  The company that the recipient of the proposal represents. We show this value in the proposal heading.
</ResponseField>

<ResponseField name="recipient_email" type="string">
  The email of the main recipient of the proposal. This is where we send all the recipient notifications. Note that for the purpose of notifications Proposales also supports multiple recipients, but the other recipients will only be able to see the proposal, and the notifications for its lifecycle, not respond to it.
</ResponseField>

<ResponseField name="recipient_phone" type="string">
  The phone number of the recipient. This is not used or displayed by Proposales in any way, other than allow the user to annotate it and call the recipient at a later point.
</ResponseField>

<ResponseField name="signatures" type="object[]">
  A list of signatures associated with the proposal, as well as various identification information on the device that the proposal was accepted on. At the moment we only support one signature, but there's optional plans for multiple partial signatures.
</ResponseField>

<ResponseField name="title_md" type="string">
  The title of the proposal in a modified markdown format. The main reason for customizing the markdown format for proposals is to encode proposal variable data. The proposal variable will contain information on the key that's associated with the proposal variable, as well as the current value of the proposal variable.
</ResponseField>

<ResponseField name="updated_at" type="number">
  The timestamp when any field on the proposal was last updated.
</ResponseField>

<ResponseField name="uuid" type="string">
  The internal Proposales uuid associated with the version. Look at `series_uuid` for the uuid of the series that contains this version.
</ResponseField>

<ResponseField name="series_uuid" type="string">
  The uuid associated with a proposal series. A proposal series can contain one proposal or multiple versions. For the recipient a proposal series looks like one proposal - with a dropdown where they can see previous versions if any exist.
</ResponseField>

<ResponseField name="is_only_proposal_in_series" type="boolean">
  Determines if the proposal series contains only one version.
</ResponseField>

<ResponseField name="value_with_tax" type="number">
  The total amount of the proposal, including VAT, in cents. This is the sum of all products included in the proposal, including optional products that were enabled by the recipient.
</ResponseField>

<ResponseField name="value_without_tax" type="number">
  The total amount of the proposal, excluding VAT, in cents. This is the sum of all products included in the proposal, including optional products that were enabled by the recipient.
</ResponseField>

<ResponseField name="version" type="number">
  The version number of the proposal. This is determined by the order in which the proposals in the series were sent. If the version number is null, then this version is a draft and hasn't been sent out yet.
</ResponseField>

<ResponseField name="tax_options" type="object">
  An object that determines various tax-related configurations on the proposal. All the values saved in this object are determined at the time when the proposal is sent, and don't change subsequently.

  `mode` - This is a company-level configuration that determines the behaviour of all its proposals when it comes to taxes. This object contains the company configuration at the moment when the proposal was sent, to keep the proposal unchanged after it's been sent, independent of whether this configuration changed at the company level or not.

  `mode: standard` - \[Recommended] This is the behaviour that you would generally expect from a proposal with tax/VAT. Products have tax/VAT values, and the footer of the proposal will mention the total with tax/VAT, as well as the total without tax/VAT.

  `mode: simplified` - It is determined on Proposal-level whether prices that are entered for products include or exclude tax. The proposal footer only mentions whether the prices are including or excluding tax, and no re-calculation between with and without tax is possible.

  `mode: tax-free` - A special tax mode where taxes are exempt at a legal level. A specific message will be shown in the footer of the proposal.

  `mode: none` - No information is given on taxes at all on the proposal. We don't show anything related to taxes in the proposal footer. This is the default for all countries where the taxes aren't configured yet.

  `tax_included` - Determines whether the taxes are included or not in the price. For standard mode, we change what price we display for the products depending on this setting. For simplified mode, we just display the relevant message in the footer.

  `tax_label_key` - A custom configuration for the company, that determines how taxes are referred to in that region. For example, "Tax" for American companies, "VAT" for European ones.
</ResponseField>

<ResponseField name="company_tax_mode_live" type="object">
  The mode configuration queried from the company at this moment. The same as the tax mode in `tax_options` above, but this value is live. Most of the behaviour on the proposal is determined by the `tax_options` to insure the proposal doesn't change behaviour after it's sent. It's mostly on unsent drafts that we rely on the live values.
</ResponseField>

<ResponseField name="status" type="string">
  The status of the proposal version. See a detailed description on each status in the [Proposal Status](/api-reference/entities/proposal#proposal-status) section of this page.
</ResponseField>

<ResponseField name="status_changed_at" type="number">
  The timestamp when the status was changed to the current value.
</ResponseField>

<ResponseField name="tracking" type="object">
  This field contains various information that is important for a more detailed tracking of events related to the proposal, or data that is deemed important related to the proposal. This data is not used to determine how the proposal is displayed to the recipient, and it will change after the proposal was sent.

  `accepted_at`, `expired_at`, `withdrawn_at`, etc. - Various timestamps for important lifecycle events for the version.

  `accepted_by_mobile` - Determines whether the proposal was accepted on a mobile phone.

  `marked_as_accepted_by_user` - If the proposal was marked as accepted by a user, rather than the recipient, this information keeps a data record of the user that marked the proposal as accepted.

  `first_viewed_at`, `last_viewed_at`, `number_of_views` - The timestamp when the proposal version was first viewed by the main recipient, the latest timestamp when it was viewed and the total number of views. Note that this is specific to this version, and not the entire proposal series. Check the latest version for the timestamps. The number of views starts from 0 on each version.

  `expiration_reminder_sent_at` - The timestamp when the email reminding that the proposal is expiring was sent to the recipient. If the proposal is set as active again, this value is reset.
</ResponseField>

<ResponseField name="pdf_url" type="string">
  The URL to access the PDF version of the proposal. This URL points to the eSign service where the proposal can be viewed as a PDF document. This field is only present for proposals that have been sent (not drafts or templates).
</ResponseField>
