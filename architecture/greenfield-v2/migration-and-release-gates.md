# Migration and release gates

## Parallel workstreams
1. CI recovery: hosted GitHub Actions startup, workflow policy, quotas, completed jobs, logs and artifacts.
2. Architecture and provider evaluation: canonical responsibility matrix, workload fit, portability, free-tier limits and total-cost comparison.
3. Identity: OIDC test issuer, issuer/audience/signature/expiry/key-rotation tests, issuer-plus-subject mapping and account-recovery design.
4. Data: PostgreSQL schema, versioned migrations, TLS, least-privilege roles, fixtures, transactional outbox and backup/restore.
5. Runtime: Go API/workers, Next.js web and Flutter client with shared versioned contracts.
6. Events: outbox publisher, schema policy, idempotent consumers, bounded retry, dead-letter and replay.
7. Edge: Cloudflare inventory, canonical origin, route ownership and WAF/DNS plan; read-only until separately approved.
8. Operations: OpenTelemetry, dashboards/alerts, incident, rollback and recovery drills.
9. Product slices: account → profile → event → notification; then community, games, rewards and commerce.

## Gates
G0 architecture and cost approval. G1 isolated non-production environment and least-privilege identity. G2 OIDC/database tests. G3 API/events/workers/web/mobile contracts. G4 security/threat model/SBOM. G5 load, restore, DR and telemetry drills. G6 migration and rollback rehearsal. G7 explicit production approval, staged traffic and post-deploy verification. A failed gate blocks progression.

## Migration
Inventory current users, data, authentication, DNS/routes, secrets, jobs, webhooks and assets. Map canonical identities using issuer-plus-subject; export and classify; run checksummed resumable migrations into isolated PostgreSQL; validate counts, references, entitlements and ledger totals. Rehearse account linking and recovery. Cut over by cohorts with rollback triggers. Keep legacy systems read-only for the approved retention window; retire only after sign-off.

## Approval boundaries
Owner approval required before paid resource provisioning, production DNS/Cloudflare changes, production identity/data/payment changes, IAM/secret changes affecting live services, merge to main or production deployment.

## Launch exit criteria
All integrations CERTIFIED; no unresolved critical/high security findings; SLOs/alerts live; restore and rollback drills pass; financial/reward ledger reconciles; web/mobile supported paths pass; monetization compliance reviewed; owner approves release.
