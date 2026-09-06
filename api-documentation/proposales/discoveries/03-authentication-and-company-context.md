# Discovery 03 — Does my token work, and what company am I?

Simplest possible first request. I wanted two things: proof that the API key authenticated, and the `company_id` that `CompanyIdQuery` keeps asking for.

```http
GET /v3/companies
```

```bash
curl -sS \
  -H "Authorization: Bearer $PROPOSALES_API_KEY" \
  -H "Accept: application/json" \
  https://api.proposales.com/v3/companies | jq
```

HTTP 200. The token was fine.

The account has access to exactly one company:

```json
{
  "id": 5452,
  "name": "Loorenz",
  "currency": "EUR",
  "tax_mode": "standard",
  "timezone": null,
  "registration_number": "",
  "website_url": "",
  "logo_url": null,
  "inbox_token": null
}
```

So `company_id = 5452` is the value every company-scoped operation needs from here on.

Worth noting the fresh-account defaults, because they show up later on resources I create: currency is `EUR` and `tax_mode` is `standard`. Both get inherited.

One field I noted and then forgot about: `timezone` is `null`. That comes back in Discovery 05 in a way I didn't expect.
