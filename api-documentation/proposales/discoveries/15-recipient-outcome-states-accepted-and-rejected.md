# Discovery 15 — What happens when the recipient responds

Discovery 14 covered everything I could drive from my side: draft, send, revise, send again. The states I hadn't seen were the ones the recipient causes.

I ran both, on two different proposals, through the recipient-facing Proposales UI.

## Accepted

I accepted the active version 2 of the series from Discovery 14.

Before:

```
status:     active
version:    2
signatures: []
```

After:

```
status:  accepted
version: 2
```

Same UUID, same version. `status_changed_at` and `updated_at` both moved.

And `signatures` filled in. The signature object contained:

```
ip
name
signed_at
user_agent
verification_mode
user_agent_is_mobile
handwritten_signature
```

Worth comparing that to the schema, which declares `ip`, `name`, `user_agent`, `date` and `user_id`. So the runtime object carries several fields the spec doesn't describe — `verification_mode`, `user_agent_is_mobile` and `handwritten_signature` — and I recorded `signed_at` where the schema declares `date`. My note says "including," so I can't claim `date` was absent, only that it isn't what I wrote down.

Same pattern as everywhere else in this API: the response is a superset of the contract, and the extra fields are interesting but not something to depend on.

```
active / version 2
        ↓ recipient accepts
accepted / version 2
```

## Rejected

For rejection I used a separate proposal, in a different series:

```
uuid:        253e5b1c-4bb3-4c56-9382-46168d2226ef
series_uuid: 33ecc2b8-8e98-4313-8f3d-9d16c0eafaf2
```

After the recipient rejected it:

```
version:     1
status:      rejected
signatures:  []
expires_at:  null
```

Again the UUID and version were preserved, and `status_changed_at` moved.

`signatures` stayed empty, which is the sensible difference — a rejection has nothing to sign. `expires_at` stayed `null`.

```
active / version 1
        ↓ recipient rejects
rejected / version 1
```

## Both together

```
              active
              /    \
        accept      reject
          ↓            ↓
      accepted      rejected
```

Neither transition creates a new resource and neither increments the version. That's a real difference from the revision flow in Discovery 14, where sending a revision produced a new UUID and a new version number. Outcome states are transitions on the sent proposal; new versions are new resources.

So `uuid`, `series_uuid` and `version` are stable across a recipient's response, and only `status` (plus timestamps, plus signatures on acceptance) changes.

## The boundary

I found no documented public endpoint for setting `accepted` or `rejected` directly. Both states were reached through the recipient-facing Proposales workflow and then observed through the API afterwards.

For an integration, that makes them read-only in practice: workflow-derived states you observe, not fields you write. Which is the second time this pattern showed up — and the third one, sending, is where it got interesting enough to chase properly.
