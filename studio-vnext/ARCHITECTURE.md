# Studio VNext — System Architecture

## Context
This workspace is a separate branch-based design environment. It does not replace the protected production runtime. The visual shell is a static prototype; real capabilities are proposed below.

## Logical layers
1. **Experience shell** — public universe gateway, member area, property microsites, commerce entry points, studio console.
2. **Edge and delivery** — Cloudflare Worker routing, asset delivery, security headers, rate limits, request correlation.
3. **API boundary** — versioned TypeScript service contracts; validation at ingress; explicit authorization per operation.
4. **Identity and domain services** — Lingo ID, profile, wallet ledger, progression/XP, rewards, game contracts, content catalog.
5. **Integrations** — Shopify, Firebase, analytics, error monitoring, email/notification providers, agent model/tool providers.
6. **Operations plane** — CI, evidence collector, incident journal, release gates, telemetry, rollback and audit.

## Environment model
- `local`: mock adapters, fixtures, no production credentials.
- `preview`: isolated deployment target and non-production services.
- `staging`: release-candidate verification with controlled test data.
- `production`: existing protected runtime; promotion only after independent authorization.

Configuration should be schema-validated at startup. Missing required values fail closed. Secrets are stored in provider-managed secret stores, never committed or shipped to the browser.

## Agent runtime contract
Each agent declares owner, purpose, model/provider, permitted tools, data classifications, maximum steps, timeout, retry policy, approval policy, and audit fields. Tool calls are denied by default. External writes require scoped authorization and, where consequential, human approval. Every run has a trace ID and records input/output metadata consistent with privacy policy.

## Workflow contract
Events use versioned schemas and idempotency keys. State transitions are explicit: `created → validated → awaiting_approval → executing → verified → completed`; failures transition to `blocked` or `failed`, never silently to success. Retries are bounded and observable.

## Security baseline
- Least privilege and short-lived credentials.
- CSRF/origin protections for browser mutations.
- Signature validation for webhooks.
- Input schema validation and output encoding.
- Rate limiting, abuse controls, secret scanning, dependency auditing.
- Data minimization, retention policy, access logs and incident response.
- Accessible controls, keyboard focus visibility, reduced-motion support, responsive layouts.

## Promotion evidence
Maintain immutable references to source commit, build artifact digest, test report, security scan, accessibility report, E2E report, deployment ID, smoke-test results, rollback reference, approver and timestamp. Any missing or contradictory evidence blocks promotion.
