# Migration, release gates, and cutover plan

## Workstreams (parallel where safe)

1. **Foundation:** AWS account/region/quotas, Terraform state, network, IAM, KMS, logging.
2. **Identity:** Cognito test pool, OIDC adapter, account/profile mapping, recovery and MFA.
3. **Data:** PostgreSQL schema, migration tooling, outbox, seed fixtures, backup/restore.
4. **Runtime:** Go API, worker, realtime gateway, Next.js web, Flutter API client.
5. **Events:** Kafka topics, schema registry/compatibility policy, consumers, DLQ/replay.
6. **Edge:** Cloudflare inventory, one canonical origin, route ownership, WAF and DNS plan.
7. **Delivery:** GitHub Actions hosted-runner pipeline, OIDC federation, SBOM, signed artifacts, deploy gates.
8. **Operations:** OpenTelemetry, Datadog dashboards/alerts, runbooks, incident and rollback drills.
9. **Product vertical slice:** account → profile → event → notification; then community/game/rewards/commerce.

## Gate sequence

- G0 — architecture and cost approval.
- G1 — non-production account, network, IAM, secrets, Terraform state.
- G2 — identity and database integration tests.
- G3 — API, events, workers, web and mobile contract tests.
- G4 — security review, threat model, dependency/SBOM scan, penetration test plan.
- G5 — resilience, load, backup restore, disaster recovery, observability drills.
- G6 — migration rehearsal, reconciliation, rollback rehearsal, parity sign-off.
- G7 — explicit production approval, change window, staged traffic and post-deploy verification.

A failed gate blocks progression. No gate is satisfied by documentation alone.

## Migration strategy

1. Inventory current data, users, auth providers, DNS, routes, secrets, jobs, webhooks, and assets.
2. Establish canonical IDs and mapping tables; never assume provider IDs are interchangeable.
3. Export and classify data; build repeatable, checksummed, resumable migration jobs.
4. Run migrations into isolated non-production PostgreSQL; validate counts, referential integrity, entitlements, and ledger totals.
5. Use a temporary dual-read or shadow-compare period only where safe; avoid dual-write for balances and entitlements.
6. Rehearse account linking and password-reset/recovery; preserve user access.
7. Cut over by bounded cohorts with rollback triggers and a tested reverse-routing plan.
8. Keep legacy systems read-only for the approved retention window; retire only after sign-off.

## Mandatory approval boundaries

Owner review is required before:
- AWS spend or paid resource provisioning;
- production DNS/origin/Cloudflare changes;
- production identity, user data, or payment changes;
- account permissions, IAM trust, or secret rotation affecting live services;
- merging to main or production deployment.

## Launch exit criteria

All integrations are CERTIFIED; no critical/high unresolved security findings; SLOs and alerts operational; restore and rollback drills passed; financial/reward ledger reconciles; mobile/web supported paths pass; legal/compliance review completed for each monetized mechanic; owner approves release.
