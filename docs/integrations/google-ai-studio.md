# Google AI Studio + Gemini Integration Contract

**Integration status:** Designed; not connected or activated  
**Prototype surface:** [Google AI Studio](https://aistudio.google.com/)  
**Runtime boundary:** Cloudflare Worker server-side adapter  
**Default state:** Disabled  
**Production data:** Prohibited during reconstruction

## 1. Responsibility split

- **Google AI Studio:** prompt engineering, model experiments, structured-output prototyping, safety evaluation, and export of reviewed prototype code.
- **GitHub:** versioned prompts, adapter source, policy tests, model allowlist, and review history. Never commit provider keys.
- **Cloudflare Worker:** authenticated server-side Gemini API calls, input validation, rate limiting, request correlation, redacted telemetry, and policy enforcement.
- **Firebase Auth:** identity and authorization. A valid login is not blanket permission to call every tool or read every record.
- **Firestore / Cloud Functions:** existing application data and privileged operations remain behind their own authorization contracts. The model never receives direct database credentials.
- **Flutter / browser:** calls only the LINGO backend API; never calls Gemini using a private API key.
- **AppDeploy:** isolated integration QA using synthetic data and a test key only.

## 2. Configuration contract

Set the following in staging first:

- `AI_PROVIDER=gemini`
- `AI_ENABLED=false` (default; enable only for a specifically authorized staging test)
- `AI_MODEL=<owner-approved-supported-model-id>` (must be allowlisted; do not assume a model ID from a prototype)
- `AI_MAX_OUTPUT_TOKENS=<bounded-positive-integer>`
- `AI_REQUEST_TIMEOUT_MS=<bounded-positive-integer>`
- `AI_DAILY_BUDGET_USD=<approved-limit>`
- `GEMINI_API_KEY` as a Cloudflare Worker secret, not a plaintext variable.

The API key must be created/rotated by the owner in Google AI Studio, stored through the Cloudflare secret mechanism for the staging Worker, and verified by a minimal staging-only request. The key value must never be sent in chat, an issue, a workflow artifact, a prompt, a source file, or a browser/mobile request. No secret was provisioned by this architecture change.

## 3. Request and response flow

1. Client calls an authenticated LINGO API endpoint.
2. Worker validates identity, entitlement, request size, rate limit, and consent.
3. Worker applies a fixed system policy and a strict input/output schema.
4. Worker invokes the configured Gemini API model server-side with timeout and bounded output.
5. Worker validates the returned shape, strips unsafe markup, and treats model output as untrusted data.
6. Worker returns a typed result with a request ID; telemetry records model/version, latency, status, token usage when available, and policy outcome—never the API key or unnecessary user content.
7. Any proposed action is shown to the user/operator for explicit approval. No model output is directly executed.

## 4. Safe modes

- **Observe:** health/telemetry only; no model call or mutation.
- **Analyze:** read-only summaries over explicitly authorized, minimized inputs.
- **Propose:** produce a recommendation or patch proposal only; no tool execution, writes, merges, deployment, activation, DNS changes, wallet/financial actions, or gate overrides.
- **Verify:** compare an expected contract with supplied evidence; read-only and must identify missing/contradictory evidence.

There is no autonomous “execute” mode. Any future tool/action capability requires a separate threat model, allowlisted tool registry, per-action authorization, replay protection, audit log, and human approval.

## 5. Privacy, safety, and cost controls

- Minimize and redact personally identifiable, financial, health, authentication, and confidential data before model submission.
- Never send passwords, API keys, OAuth tokens, session cookies, raw payment data, private runner logs with secrets, or Firebase service-account credentials.
- Enforce server-side authz, per-user/per-IP rate limits, payload limits, timeout, retry budget, circuit breaker, output token cap, and daily spend ceiling.
- Validate model output against schema; do not use it as SQL, shell, JavaScript, HTML, a URL fetch target, or a privileged command without independent validation.
- Keep user consent and disclosure requirements explicit. Provide a no-AI fallback for core flows.
- Log request ID, selected model ID, policy version, status, latency, and token/cost metadata where available. Avoid logging raw prompts/responses by default.
- Pin an approved model identifier in reviewed config; do not silently follow a moving alias.
- Review Google terms, data handling, retention, region, and billing settings before production authorization.

## 6. Required staging tests

- Missing key, invalid key, quota exceeded, timeout, 429, and provider 5xx fail safely.
- `AI_ENABLED=false` makes no provider request.
- Unauthorized and oversized requests are rejected before provider invocation.
- Prompt injection attempts cannot enable tools, reveal secrets, bypass system policy, or authorize mutations.
- Output schema violations are rejected and never rendered as trusted HTML.
- Rate limits, budget guard, circuit breaker, and no-AI fallback behave as expected.
- Logs contain no API key or sensitive prompt content.
- Mobile/browser bundles contain no provider key.
- All tests use synthetic data and a staging project/key.

## 7. Activation gates

AI integration activation is blocked until all are true: staging secret exists without being exposed; approved model is allowlisted; authz/privacy review passes; deterministic tests pass; cost limits are configured; redaction is verified; staging QA evidence is retrievable; owner authorizes enablement. Production activation additionally requires the platform's complete G00–G11 release chain and independent live verification.

## 8. Current limitations

This change adds the integration contract only. It does not create a Google AI Studio project, generate or store a key, make a Gemini API call, alter Firebase, deploy a Worker, or enable AI. Those actions require real owner-controlled configuration and staging evidence.
