# Discovery 06 — Editing a draft in place

I had an empty draft. Before building anything on top of it, I wanted to know whether editing a proposal mutates the existing resource or produces a new one. If every edit minted a new UUID, that changes how an integration has to track things.

```http
PATCH /v3/proposals/{uuid}
```

I sent `title_md` and `description_md`.

## Result

The UUID didn't change. Same proposal, updated in place.

What I got back:

- `title_md` persisted as sent
- `title` derived automatically from `title_md`
- `description_md` persisted as sent
- `description_html` generated from the Markdown
- `updated_at` changed
- `status` still `draft`
- `status_changed_at` **unchanged**

The `status_changed_at` detail is the one I found most useful. Content edits and lifecycle changes are tracked by different timestamps, so editing a draft doesn't look like a state transition to anything downstream.

## What I learned

Markdown is the input format, and the rendered HTML is derived. I send `title_md` and `description_md`; Proposales owns `title` and `description_html`. So an integration writes Markdown and should not try to author the HTML — there's no reason to, and the derived fields would just be overwritten anyway.

And drafts are incrementally editable. I can build a proposal up over several requests rather than having to assemble the whole thing in one shot.

So I could now create a proposal and write text into it. What I still had no idea about was where the line items were supposed to come from — a proposal with a title and a description isn't a proposal. That sent me looking at the content API.
