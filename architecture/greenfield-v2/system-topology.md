# System topology and contracts

```text
Browser / Flutter
  -> Cloudflare DNS + WAF
  -> AWS ALB
     -> Next.js web (ECS)
     -> Go API/domain services (ECS)
        -> Cognito OIDC
        -> PostgreSQL (transactional truth)
        -> Redis (cache/presence)
        -> Kafka (durable events)
        -> S3 (private media)
        -> provider adapters (payments/email/push)
```

## Ownership
- Web BFF: rendering and web composition; no wallet truth or privileged provider keys.
- Go APIs: authorization, domain rules, stable contracts.
- Cognito: authentication only; platform owns roles and entitlements.
- PostgreSQL: durable profiles, memberships, ledger, entitlements, game records.
- Redis: cache, throttling, ephemeral presence; never durable balances or audit history.
- Kafka: versioned events and consumer offsets; not transactional truth.
- Cloudflare: audited DNS/WAF/edge entry; no competing application routing authority.
- Datadog: telemetry, not business state.

## Request/event envelope
Requests carry trace context, request ID, authenticated service identity, schema/API version, and idempotency key for mutations. Events carry event ID/type/version, timestamp, producer, aggregate ID/version, trace context, and classified payload only.

## Security baseline
TLS in transit, encryption at rest, private data subnets, least-privilege task IAM, short-lived GitHub OIDC credentials, runtime secrets from Secrets Manager, WAF/rate limits, signed media URLs, PII minimization, retention/deletion workflows, audit logs, and threat models for wallet/rewards/game outcomes/account recovery.

## Reliability baseline
Health/readiness endpoints; bounded retries with jitter; circuit breakers; transactional outbox; DLQ/replay runbooks; PITR and restore drills; canary/blue-green deploys; SLOs and actionable alerts.
