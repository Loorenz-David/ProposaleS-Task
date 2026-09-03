> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Integrations Session Data

Configuration data for a connection that is sent along with each webhook request. Its purpose is, primarily, to authenticate a user against the connected system. The most important information is contained in `data`, and the exact shape of that object depends on the type of connection.

## OAuth

If the integration has enabled OAuth, and the user has signed in to the third party service,
`auth.access_token` will be included with each webhook request.

<ResponseExample>
  ```typescript Configuration theme={null}
  {
    title: string
    id: number
    data: Record<string, unknown>
    logo_uuid: string
    auth?: {
      type: 'oauth',
      access_token?: string;
    },
    webhooks: {
      'integration-config-schema'?: string;
      'content-import'?: string;
      'content-availability-search'?: string;
      'content-details'?: string;
      'recipients-search'?: string;
      'proposal-widget-unconnected'?: string;
      'proposal-widget-connected'?: string;
      'proposal-status-update'?: string;
    }>
  }
  ```
</ResponseExample>
