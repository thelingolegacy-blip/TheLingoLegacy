# System topology and integration contract

## Request path

```text
Browser / Flutter
      |
Cloudflare DNS + WAF + rate controls
      |
AWS ALB
      +--> Next.js web service (ECS)
      +--> Go API gateway / domain services (ECS)
                 |
                 +--> Cognito (OIDC identity)
                 +--> PostgreSQL (transactional truth)
                 +--> Redis (cache / sessions / presence)
                 +--> Kafka (versioned domain events)
                 +--> S3 (private media / assets)
                 +--> provider adapters (payments, email, push)
                              |
                         external providers
```

## Service contracts

| Component | Owns | Must not own |
|---|---|---|
| Web BFF | Web composition, SSR, browser-safe session handoff | Wallet truth, privileged provider credentials |
| Go API | Authorization, domain rules, stable API contracts | Client UI state |
| Identity adapter | OIDC validation and identity mapping | Product entitlements as Cognito custom claims |
| PostgreSQL | Profiles, memberships, ledger, entitlements, game records | Ephemeral cache |
| Redis | Cache, throttles, presence, short-lived coordination | Durable balances or audit history |
| Kafka | Durable domain events and consumer offsets | Transactional source-of-truth records |
| Worker services | Idempotent asynchronous processing | Direct unreviewed writes to unrelated domains |
| Cloudflare | DNS, WAF, edge protections | Competing application routing authority |
| Datadog | Metrics, logs, traces, alerts | Business-critical transactional state |

## Required integration envelope

Every service-to-service request carries:
- trace ID / traceparent
- request ID
- authenticated service identity
- idempotency key for mutations
- schema/API version
- structured error code

Every event carries:
- event ID, event type, schema version
- occurred-at timestamp
- producer/service identity
- aggregate ID and sequence/version
- trace context
- payload with classified fields only

## Security baseline

- TLS in transit; encryption at rest with managed keys.
- Private subnets for data services; no public database endpoints.
- Least-privilege IAM roles per task/service.
- Secrets Manager references at runtime; rotation plan.
- OIDC short-lived credentials for GitHub Actions; no long-lived cloud keys.
- WAF, abuse controls, rate limits, and bot protections at the edge and API.
- PII minimization, retention schedule, deletion/export workflows, and audit logs.
- Signed media URLs; malware/content validation for uploads.
- Threat modeling for wallet, rewards, game outcomes, moderation, and account recovery.

## Reliability baseline

- Health and readiness endpoints per workload.
- Bounded retries with jitter; circuit breakers around external providers.
- Transactional outbox for DB-to-event consistency.
- Dead-letter queues/topics and replay runbooks.
- PITR backups, restore drills, and documented RPO/RTO.
- Blue/green or canary deployment with automated rollback criteria.
- SLOs and alerts defined before production traffic.
