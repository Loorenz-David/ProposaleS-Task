# AI provider boundary

The application imports `@/lib/ai` for model generation. This server-only adapter owns provider
selection, vendor SDK imports, model construction, message/tool conversion, timeout forwarding,
usage shaping, and provider error translation. Features and the agent runtime do not import
`@ai-sdk/anthropic`, `@ai-sdk/openai`, or `ai` directly.

`AI_PROVIDER`, `AI_MODEL`, and the conditional provider keys are validated by
`src/lib/env/server.ts`; the adapter selects the configured key and constructs a model instance
through the matching vendor factory. A string model id is deliberately not accepted by the
internal SDK call seam because the AI SDK resolves strings through its default provider/gateway
path. The installed-package evidence for that hazard is recorded in
`build_docs/under_constroction/initial_core_feature_proposales/planing/proposales-source-evidence.md`
§9.1.

Every SDK call disables SDK retries (`maxRetries: 0`) and receives the caller's timeout signal.
The agent runtime owns bounded output correction, with a 120-second per-call ceiling inside a
240-second run budget. The adapter reports only the three application usage fields, using `null`
when the provider did not report a figure. Provider failures become `AiProviderError` with a fixed
safe message. If the SDK cannot parse an object from a completed response, the adapter returns a
typed parse-failure marker without the generated text; the runtime logs the safe failure kind and
may spend one of its two bounded output-correction retries regenerating it. Schema failures return
compact path-and-message feedback plus a size-bounded, explicitly untrusted prior candidate. The
runtime may mechanically restore `known: true` only when the affected object already carries both
`value` and `source`; the repaired object still passes through the unchanged authoritative schema.

The scripted fake is the default test seam. It records attempted calls, including exhaustion, and
the failing fake makes accidental model use explicit. No default-suite test makes a real provider
call or reads `.env`.
