# Migration and release gates

## Parallel workstreams
1. Foundation: account/region/quotas, Terraform state, network, IAM, KMS, logs.
2. Identity: Cognito test pool, OIDC adapter, account mapping, recovery/MFA.
3. Data: PostgreSQL schema, migrations, outbox, fixtures, backup/restore.
4. Runtime: Go API/workers/realtime, Next.js web, Flutter client.
5. Events: Kafka topics, schema policy, consumers, DLQ/replay.
6. Edge: Cloudflare inventory, canonical origin, route ownership, WAF/DNS plan.
7. Delivery: GitHub Actions hosted runner, OIDC federation, SBOM, signed artifacts.
8. Operations: OpenTelemetry, Datadog dashboards/alerts, incident/rollback drills.
9. Product slice: account → profile → event → notification; then community, games, rewards, commerce.

## Gates
G0 architecture/cost approval. G1 non-production account/network/IAM/secrets. G2 identity/database tests. G3 API/events/workers/web/mobile contracts. G4 security/threat model/SBOM. G5 load, restore, DR, telemetry drills. G6 migration and rollback rehearsal. G7 explicit production approval, staged traffic, post-deploy verification. A failed gate blocks progression.

## Migration
Inventory current users/data/auth/DNS/routes/secrets/jobs/webhooks/assets. Map canonical IDs; export and classify; run checksummed resumable migrations into isolated PostgreSQL; validate counts, references, entitlements, and ledger totals. Rehearse account linking and recovery. Cut over by cohorts with rollback triggers. Keep legacy systems read-only for the approved retention window; retire only after sign-off.

## Approval boundaries
Owner approval required before paid resource provisioning, production DNS/Cloudflare changes, production identity/data/payment changes, IAM/secret changes affecting live services, merge to main, or production deployment.

## Launch exit criteria
All integrations CERTIFIED; no unresolved critical/high security findings; SLOs/alerts live; restore and rollback drills pass; financial/reward ledger reconciles; web/mobile supported paths pass; monetization compliance reviewed; owner approves release.
