# LINGO CORE V2 — API and Integration Standards

**Status:** PROPOSED  
**Applies to:** new CORE V2 services and adapters

## API contract
- Publish OpenAPI 3.x for every HTTP API.
- Use explicit versioned paths for breaking changes and additive evolution for compatible changes.
- Standardize JSON request/response envelopes, pagination, validation errors and problem codes.
- Require authentication and server-side authorization for protected routes.
- Define request timeouts, payload limits, rate limits, retry budgets and idempotency per operation.
- Never expose internal stack traces, secrets or provider credentials.
- Use correlation/trace IDs across gateway, services, event producers and consumers.

## Event contract
- Use versioned JSON Schema (or another approved schema format).
- Include event ID, event type, schema version, producer, aggregate ID, occurred-at timestamp and trace context.
- Consumers must be idempotent and tolerate duplicate delivery.
- Define retry, dead-letter, replay, retention and schema-compatibility policy.
- Do not include secrets, access tokens or unnecessary personal data.

## Service registration
Every service declares: stable ID, name, owner, repository path, lifecycle, environment, contract location, dependencies, data classification, health/readiness probes, SLO, operational runbook, cost owner and release status.

## Connection status
- NOT_STARTED: no implementation/proof.
- BUILT: source exists; no verified connection claim.
- TESTED: automated checks ran and passed.
- CONNECTED: non-production systems exchanged data with evidence.
- CERTIFIED: security, resilience and operational acceptance passed.
- PRODUCTION: separately approved release and post-deploy verification.

## Client SDK rules
TypeScript and Dart clients are generated or maintained against the same published contracts. Token refresh, error mapping, retries, timeout budgets and idempotency are consistent. Client-side checks never replace server authorization.

## Observability
Use structured logs with redaction, metrics, distributed traces and audit events. Define SLOs before production. Do not log credentials, tokens or raw sensitive payloads.
