> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Proposal Data Widget

<img noZoom src="https://mintcdn.com/proposalesab/-5otOw2eXOA6LlgK/images/integration-fields/data-widget.png?fit=max&auto=format&n=-5otOw2eXOA6LlgK&q=85&s=0125b026b0f96c07cfbdeab5de396c28" width="608" height="248" data-path="images/integration-fields/data-widget.png" />

Example data widget with a [link button](/api-reference/entities/integration-field#link-button) integration field.

This webhook is queried to determine the appearance of the sidebar data widget
of sent proposals. It is useful if you want to display integration specific
data, or add links to external locations.

The layout is built up of a list of [integration fields](/api-reference/entities/integration-field).

The `POST` request will contain this in its body:

```typescript Content Details Request theme={null}
{
  type: 'proposal.dataWidget';
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

Take notice that input fields will not modify any data, this widget is only meant
to contain read only fields.
