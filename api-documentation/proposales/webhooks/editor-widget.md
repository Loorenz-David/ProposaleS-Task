> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Proposal Editor Widget

<img noZoom className="h-80" src="https://mintcdn.com/proposalesab/-5otOw2eXOA6LlgK/images/integration-fields/editor-widget.png?fit=max&auto=format&n=-5otOw2eXOA6LlgK&q=85&s=f97365c169a48c1c0e84318e53a99292" width="608" height="320" data-path="images/integration-fields/editor-widget.png" />

Example editor widget with a [text input](/api-reference/entities/integration-field#text-input) field

This webhook is queried to determine the appearance of the sidebar widget
of draft proposals. It can be used to set custom values in the proposal's `data` field.

The layout is built up of a list of [integration fields](/api-reference/entities/integration-field).

The `POST` request will contain this in its body:

```typescript Content Details Request theme={null}
{
  type: 'proposal.editorWidget';
  integration: IntegrationSessionData;
  proposal: Proposal;
}
```

The response needs to be in the following shape.

```typescript theme={null}
{
  data: {
    fields: IntegrationField[]
  }
}
```

Input fields will modify properties in the proposal's `data` field.
