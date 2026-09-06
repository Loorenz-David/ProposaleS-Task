# Discovery 13 — No templates to build on

A proposal tool with templates is the normal expectation, and building from a template would be a much better starting point than assembling blocks by hand. So I checked what the account had.

```http
GET /v3/companies/{companyId}/templates
```

```json
{ "data": [] }
```

Nothing. The endpoint documents itself as returning "active proposal templates for a company the authenticated user can access," and this fresh company has none.

That's a short discovery, but it settled a design question. Anything I build for the take-home can't assume a template exists, because in a brand-new account one doesn't — and setting one up would mean configuring it manually outside the API flow I'm demonstrating.

So generating proposals directly through `POST /v3/proposals` is the self-contained path, and that's the one I stayed on.
