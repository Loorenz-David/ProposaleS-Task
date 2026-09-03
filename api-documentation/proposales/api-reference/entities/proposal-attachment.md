> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Proposal Attachment

> An attachment linked to a proposal. Attachments are displayed at the end of a proposal, after all the products are listed. Usually they link to a PDF file containing administrative details, like the terms and conditions that apply to your property.

```typescript theme={null}
{
    id: number
    mime_type: string
    name: string
    // For text/html: url is present, uuid is absent
    // For other types: uuid is present, url is absent
    url?: string
    uuid?: string
}
```

<ResponseField name="id" type="number">
  The id of the attachment file in the Proposales database
</ResponseField>

<ResponseField name="mime_type" type="string">
  What type of file the attachment represents. It can be `application/pdf` for a PDF file, or `text/html` for a URL.
</ResponseField>

<ResponseField name="name" type="string">
  A short, descriptive text to be shown as the title for the attachment.
</ResponseField>

<ResponseField name="url" type="string">
  Present for `text/html` attachments. Contains the direct URL to link to. When this field is present, the attachment displays as a link without file upload.
</ResponseField>

<ResponseField name="uuid" type="string">
  Present for PDF attachments. The UUID under which the file contents are saved in Proposales hosting. When this field is present, the attachment links to the uploaded file.
</ResponseField>
