> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Integration Config Schema

This webhook is queried for when the integration is being configured.
The integration can then respond with a configuration object, specifying
which options the user can configure themselves.

The `POST` request will have the following data in its body:

```typescript Request theme={null}
{
  id: string;
  created: number;
  type: 'integration.config';
  integration: IntegrationSessionData;
}
```

The expected response to this is a json object with the following format

<CodeGroup>
  ```typescript Type theme={null}
  type IntegrationConfigSchemaResponse = {
    data: {
      fields: IntegrationConfigField[];
    }
  }

  type IntegrationConfigField = IntegrationField & {
    refreshOnModify?: boolean;
  }
  ```

  ```typescript Example Response theme={null}
  {
    data: {
      fields: [
        {
          name: 'Example Field',
          type: 'text',
          id: 'exampleField',
          defaultValue: 'test text',
        },
        {
          name: 'API URL',
          type: 'url',
          id: 'apiUrl',
          defaultValue: 'https://api.com',
          refreshOnModify: true,
        },
        {
          name: 'Default User',
          type: 'select',
          id: 'defaultUserId',
          options: [
            {
              name: 'Joe 1',
              value: 'user_1239',
            },
            {
              name: 'Jane',
              value: 'user_122229',
            },
          ]
        }
      ]
    }
  }
  ```
</CodeGroup>

See [IntegrationField](/api-reference/entities/integration-field) for information on how to use them.

If a field is marked with `refreshOnModify: true`, the configuration webhook will
be called when the user has changed the field. This can be useful if some integration
configuration properties depend on other settings the user needs to fill in first.

The values configured using this schema are stored in the `data` property of [IntegrationSessionData](/api-reference/entities/integrations-session-data).
