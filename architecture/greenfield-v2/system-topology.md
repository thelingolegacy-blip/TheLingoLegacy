# System topology and contracts

```text
Browser / Flutter
  -> verified public edge (existing Cloudflare, subject to route audit)
  -> canonical application origin
     -> Next.js web experience
     -> Go modular API / workers
        -> OIDC identity adapter
        -> PostgreSQL (transactional authority per migrated domain)
           -> transactional outbox
              -> publisher / broker adapter (selected only when justified)
                 -> idempotent consumers
        -> optional cache / private object storage adapters
        -> OpenTelemetry-compatible telemetry
GitHub
  -> source, review, CI evidence and release governance
```

## Ownership
- Web BFF: rendering and web composition; no wallet truth or privileged provider keys.
- Go APIs: authorization, domain rules and stable contracts.
- OIDC adapter: authentication verification; platform owns roles, entitlements and issuer-plus-subject mapping.
- PostgreSQL: durable records for explicitly migrated domains; no cross-domain direct writes.
- Outbox: atomic event intent in the same transaction as the domain mutation.
- Broker/consumer adapters: delivery and processing, never transactional truth; require idempotency, retry, DLQ and replay controls.
- Cache: ephemeral performance/presence only; never durable balances or audit history.
- Cloudflare: intended public edge after route, zone, Worker and origin ownership verification.
- Telemetry: operational evidence, not business state.
- GitHub: canonical source and engineering/release evidence.

## Request/event envelope
Requests carry trace context, request ID, authenticated service identity, API/schema version and idempotency key for mutations. Events carry event ID/type/version, timestamp, producer, aggregate ID/version, trace context and classified payload only.

## Security baseline
TLS in transit, encryption at rest, least-privilege identities, short-lived CI credentials, external runtime secrets, rate limits, PII minimization, retention/deletion workflows, audit logs and threat models for wallet/rewards/game outcomes/account recovery.

## Reliability baseline
Health/readiness endpoints; bounded retries with jitter; circuit breakers; transactional outbox; DLQ/replay runbooks; backup/restore drills; staged release controls; SLOs and actionable alerts.

## Provisioning boundary
No provider, account, region, managed service, IaC engine, paid resource or recurring cost is selected or authorized by this topology. Provider choices require workload evidence, cost comparison, ownership and explicit approval.
