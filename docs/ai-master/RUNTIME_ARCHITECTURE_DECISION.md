# LINGO AI Master — Runtime Architecture Decision

**Decision:** Use a separately scoped AI Master service; do not add experimental orchestration or model-provider execution to the flagship production Worker.
**Status:** PROPOSED — implementation and security review required.
**Baseline:** Master Recovery #480; canonical branch `main`; bootstrap specification branch `ai-master/bootstrap-phase0-1-2026-11-06`.

## Observed source facts
- The canonical `worker.js` currently serves health, runtime/manifest, platform status/gates/modules, site context, checkout-disabled and beacon-alert endpoints.
- Unknown `/api/*` routes return HTTP 404.
- The site-context feature flags currently set `ask_lingo: false`.
- The runtime manifest reports Firebase only as a boolean derived from the presence of `FIREBASE_PROJECT_ID`; this does not prove Firebase authentication or data integration.
- The current Worker exposes no verified AI Master router, provider adapter, agent registry runtime, task queue, authenticated tool-call API or evidence-generation service.

## Decision
1. Keep the flagship Worker limited to its current approved site/runtime responsibilities.
2. Build AI Master as an independently scoped service with its own source directory, configuration, staging deployment identity and service-level authentication.
3. Do not bind it to production domains or enable public askLINGO routing during bootstrap.
4. Start with read-only GitHub and staging diagnostics.
5. Keep model-provider adapters disabled until credentials are stored in server-side secret storage, per-provider budgets and limits are set, and connection tests pass.
6. Keep tools deny-by-default. Each tool has a declared scope, input schema, audit event and authorization check.
7. Require a human approval token or equivalent explicit approval record for protected actions. The service must not be able to self-approve.
8. Keep the evidence store append-only or versioned, redact secrets and personal data, and retain artifact hashes and source/run correlation.
9. Have LUNA or a separate verification process challenge execution claims before a package can be marked PASS.
10. Integrate the public askLINGO experience only after authentication, abuse protection, privacy review, rate limiting, monitoring and end-to-end acceptance pass.

## Proposed service boundaries
- **Control API:** task intake, status, delegation and report retrieval.
- **Router:** deterministic task classification and policy-checked delegation.
- **Agent registry:** logical role IDs, model adapter references and tool scopes.
- **Provider adapters:** server-side calls to approved providers; no client-side API keys.
- **Tool gateway:** allowlisted tools, schema validation, scope enforcement and audit.
- **Evidence service:** run manifests, raw result references, SHA-256 checksums and independent acceptance.
- **Approval service:** pending/approved/rejected records tied to a specific action, target and expiry.
- **Observability:** sanitized structured logs, correlation IDs, provider health and cost counters.

## Minimum safe bootstrap
- Implement pure routing logic with no external model calls.
- Add unit tests for task classification, invalid input, denied tools, provider timeout and fallback.
- Add an authorization middleware that denies by default.
- Add an evidence-package validator against `EVIDENCE_PACKAGE_SCHEMA.json`.
- Add a read-only GitHub diagnostic adapter with a fixed allowlist.
- Run locally or in an isolated preview; do not bind production domains or secrets.

## Explicit non-goals for bootstrap
- No autonomous production deploys.
- No DNS, production Worker, Firebase identity, billing or credential mutations.
- No payments, wallet transfers, game-credit redemption or sweepstakes activation.
- No unrestricted shell, arbitrary HTTP fetch, arbitrary repository write or open-ended tool execution.
- No claim that Grok, Claude, GPT or Gemini is connected until a real provider call succeeds in a controlled test.

## Acceptance gates
1. Threat model and data-flow review approved.
2. Unit and integration tests pass with retrievable logs.
3. Negative authorization tests prove default denial.
4. Secrets remain outside source, client bundles and logs.
5. Provider budget, timeout, retry and fallback behavior verified.
6. Read-only GitHub diagnostic run yields reproducible inventory and evidence.
7. Independent verifier validates the evidence package.
8. Staging-only deployment and rollback are demonstrated.
9. Owner separately approves any later public integration or production action.

## Rollback
Disable the isolated service deployment or its staging route; revoke its service credentials; preserve sanitized logs and evidence. No flagship Worker rollback is required because this decision explicitly avoids modifying that Worker.
