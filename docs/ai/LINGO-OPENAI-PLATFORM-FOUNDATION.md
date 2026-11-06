# LINGO OpenAI Platform Foundation

Status: implementation scaffold; production integration and acceptance are NOT certified.

## Non-negotiable operating policy

- API spend is **$0 authorized**. Do not buy credits, enable automatic recharge, or issue paid API requests.
- `LINGO_AI_PAID_API_ENABLED` must remain unset or `false`.
- The gateway blocks inference before making a network request unless the paid-inference flag is explicitly enabled.
- Enabling paid inference requires a separate, explicit founder approval and a documented budget. This document does not grant that approval.
- Never put an API key in Git, client-side JavaScript, mobile applications, Unity/Unreal builds, public Worker variables, logs, issues, or chat messages.
- Use a Cloudflare Worker secret for `OPENAI_API_KEY` only after paid use is approved. Do not configure it during the zero-spend phase.

## Initial endpoints

- `GET /api/v1/ai/status`: reports service readiness and whether paid inference is disabled.
- `POST /api/v1/ai/responses`: server-side Responses API adapter; returns HTTP 423 while paid inference is disabled.
- The current model default is `gpt-6-astra`. Model access and account eligibility must be confirmed before activation.

## Platform responsibilities

- OpenAI: model inference and, later, approved agent workflows.
- Cloudflare Worker: server-side API boundary, secret isolation, request validation and response shaping.
- GitHub: source of truth, review and CI evidence.
- Firebase: identity/data services only after project identity, rules, App Check and consent contracts are verified.
- Web/mobile/desktop/TV/game clients: call the LINGO gateway; never call OpenAI directly with a long-lived secret.

## Node.js SDK example (reference only; NOT executed)

Install the SDK in a server-side Node project and store the credential in the server environment. This example can incur charges and must not be run under the current zero-spend policy.

```js
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await client.responses.create({
  model: "gpt-6-astra",
  input: "Write a short bedtime story about a unicorn."
});

console.log(response.output_text);
```

The model identifier `gpt-6-astra` is documented for the Responses API. API access is separately billed; the ChatGPT subscription does not authorize API usage.

## OpenAI Developers plugin

The OpenAI Developers plugin is a development-tooling workflow for Codex and supported coding environments. It is not an API runtime dependency and does not itself provide free API inference. In Codex, install it through `/plugins`, connect the OpenAI Platform app when prompted, and start a new chat. Plugin installation and local Codex setup must be completed by the account holder in their own Codex environment.

## Acceptance checklist

- [x] Zero-spend default and pre-network inference guard implemented.
- [x] Server-only credential contract documented.
- [x] Responses API adapter and bounded input validation implemented.
- [x] Automated tests authored for disabled, missing-key, success, and input-limit paths.
- [ ] CI execution and passing test evidence.
- [ ] Independent security review.
- [ ] Account-level billing and auto-recharge settings visually verified.
- [ ] Staging integration and cross-platform client contracts verified.
- [ ] Founder approval for any paid API activation (not granted).
- [ ] Production promotion (not authorized).
