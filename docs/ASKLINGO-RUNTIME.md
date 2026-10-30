# askLINGO runtime and integration contract

## Universal UI
The L-shaped askLINGO dock is injected by the flagship Cloudflare Worker into HTML surfaces. The Flutter client mounts the same assistant through its mobile dock. The assistant is a public navigation and product guide, not an authenticated account operator.

## API
- `GET /api/v1/asklingo/status` reports whether the optional model binding is available.
- `POST /api/v1/asklingo/chat` accepts a JSON body with one `message` string.
- Input is bounded to 1,200 characters; request body to 5 KB; requests are rate-limited per IP per isolate; origins are checked against the canonical domain allowlist.
- A correlation ID is returned for support diagnostics.
- The default guided fallback runs without an AI model binding or provider token.
- User messages are not persisted by this Worker endpoint. Do not submit passwords, payment data, API keys, or other secrets.

## Optional model activation
Model inference is intentionally opt-in. Do not set `ASKLINGO_AI_ENABLED=true` until an authorized administrator has reviewed the provider/model, the Cloudflare AI binding, usage limits, privacy disclosure, and billing. When enabled, configure the `AI` binding and `ASKLINGO_MODEL` variable in the Worker environment. Missing configuration keeps the guided fallback active.

Cloudflare Workers AI binding documentation: https://developers.cloudflare.com/workers-ai/get-started/workers-wrangler/

## Not included
This assistant does not have GitHub write access, deployment authority, store credentials, payment authority, user-account access, or background autonomy. Future agent tools must be separately permissioned, audited, rate-limited, and approved before they can execute mutations.
