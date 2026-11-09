# The Lingo Legacy — Production Operations Procedures

**Status:** Proposed; requires system-owner approval before production use.  
**Companion:** ../governance/production-certification-standard.md

## 1. Change intake and risk classification

Every change requires a tracked issue and PR with owner, affected services, source commit, environment, customer impact, data classification, risk, dependencies, cost impact, privacy/security/legal implications, acceptance criteria, test plan and rollback plan.

- R0: documentation-only; no runtime/policy effect.
- R1: isolated UI/content or non-production change.
- R2: API, schema, identity, data rules, integrations, security headers or shared libraries.
- R3: production infrastructure, DNS/routes, access policy, payments, wallet/ledger, secrets, migrations, user permissions, legal terms or irreversible operations.

R2 requires domain-owner and independent review. R3 requires explicit scoped production authorization plus relevant provider/security/legal approvals. General project authorization is not blanket approval for R3.

## 2. Branch, review and source integrity

1. Branch from verified canonical base; keep PRs narrow and reversible.
2. Link issue, owner, service IDs, acceptance criteria and evidence.
3. Require independent review for runtime/security/data changes.
4. Protect main from force pushes and unreviewed bypass.
5. Verify required checks executed against exact PR head SHA.
6. Do not merge if a required job is missing, skipped, cancelled, stale or has no job record.
7. Record commit SHA, approvals and check-run URLs.

## 3. Build and CI

1. Use pinned toolchain versions and lockfiles.
2. Use least-privilege ephemeral runners where feasible; do not persist credentials on shared hosts.
3. Build from a clean checkout.
4. Run format, lint, type, unit, integration, contract, E2E, security and build checks.
5. Preserve logs, reports, SBOM, provenance and artifact digest.
6. Re-run on exact final commit after any change.
7. If workflow ends before jobs instantiate, classify CI as BLOCKED; do not call it a test failure or pass.
8. Never bypass CI by asserting success or weakening required checks.

## 4. Environment and secrets

Maintain distinct development, test, staging and production projects/accounts. Verify hostnames, project IDs, databases, storage buckets, auth issuers, webhook endpoints, keys and payment modes before release.

Store secrets only in provider-managed secret stores or approved CI vaults. Never place secrets in Git, logs, client builds, issue comments or reports. Rotate only with approved change, dual-control plan and tested recovery.

## 5. Data and migration

1. Identify system of record, data classes, affected records and dependencies.
2. Review forward/backward compatibility.
3. Back up and verify restore before destructive migration.
4. Prefer expand/migrate/contract; avoid incompatible one-step migrations.
5. Test in staging with production-like synthetic data.
6. Define idempotency, checkpointing, reconciliation and abort conditions.
7. Obtain explicit R3 approval before production migration.
8. Validate counts, constraints, permissions and compatibility after migration.

## 6. Deployment and rollback

**Pre-deploy:** approved change, exact artifact digest, target account/project/environment, deployment window, health baseline, migration state, reviewer and rollback owner.

**Deploy:** staged rollout, health checks, error/latency thresholds, synthetic journeys and immediate abort on unexpected data/security behavior.

**Post-deploy:** verify canonical/www host, TLS, routes, headers, API contracts, anonymous/authenticated journeys, data boundaries, integrations and monitoring.

**Rollback:** restore last known-good immutable artifact or execute approved forward-recovery. Do not roll back schema/data independently without compatibility analysis. Record operator, time, reason, artifact IDs and validation.

## 7. Identity and access review

Quarterly and after role changes:
- Inventory human, bot, agent, service and runner identities.
- Confirm MFA, role, scope, owner, last use and expiry.
- Remove stale access with owner approval.
- Test anonymous, authenticated, cross-user and privileged authorization boundaries.
- Validate token signature, issuer, audience, expiry, rotation and revocation.
- Review break-glass accounts and audit trail.
- Verify operator-only routes are protected independently of UI navigation.

## 8. Security and vulnerability handling

For each release review dependency alerts, secret scan, SAST, IaC, container/image, DAST and risk-based penetration evidence. Triage by severity and exposure. P0/P1 findings block release unless a formal, time-limited exception is approved by accountable owner and security reviewer; legal/privacy obligations cannot be waived by engineering.

Keep vulnerability reports private. Preserve logs and evidence. Track remediation owner and deadline.

## 9. Privacy operations

Use synthetic data for demos and tests. Review public bundles, source maps, logs, analytics payloads, issue trackers and exports for sensitive data. Maintain consent and retention rules. Verify deletion/export procedures and vendor subprocessors. A confirmed exposure triggers incident handling and blocks release until containment and privacy review are complete.

## 10. Observability and service health

Each production service must have:
- SLIs/SLOs and error budget.
- Structured logs with safe correlation IDs.
- Metrics, traces and deployment/version tags.
- Alert thresholds, delivery tests and escalation owner.
- Dashboard and runbook.
- Dependency health and graceful degradation.
- Backup/restore schedule and recovery objectives.

Test alert delivery and restore procedures on a defined cadence. A green dashboard screenshot is insufficient without query, environment, time range and alert-delivery evidence.

## 11. Incident management

1. Declare severity and appoint incident commander.
2. Protect people and data; contain impact without destroying evidence.
3. Record UTC timeline, affected systems, versions, scope and decisions.
4. Communicate through approved channels.
5. Recover using known-good artifacts and verified data.
6. Validate customer journeys and security boundaries.
7. Complete blameless postmortem and tracked corrective actions.
8. Review whether release gates or vendor controls failed.

Severity: SEV-1 critical security/data loss/major outage/payment harm; SEV-2 major degradation/high-risk exposure; SEV-3 limited impact; SEV-4 minor.

## 12. Payments, rewards and promotions

No live payment, cash-out, real-money gameplay, prize fulfillment, gift-card issuance or paid messaging without separate written authorization and documented test acceptance.

Required: processor account/project verification, test mode, webhook signature validation, idempotency, refunds/disputes/tax and reconciliation procedures, security/privacy review, legal/jurisdiction review, cost ceiling, support escalation and kill switch. Outcomes and balances must be server-authoritative and auditable. Demo balances must be unmistakably non-redeemable.

## 13. Provider integration verification

For each provider record account/project identity, environment, scopes, endpoints, data flow, secret location (never secret value), billing mode, quotas, webhook status, logs, test transaction and rollback/disable path. Verify active deployed configuration, not just source manifests or connector presence.

## 14. Certification and go/no-go

Release approver reviews gates G00–G11 and evidence pack. Any P0/P1, missing mandatory artifact, unknown production target, failed critical journey, untested rollback, missing alert or unapproved paid/regulated capability means NO-GO.

GO is scoped to exact source commit, artifact digest, named environment/provider project, deployment/route/binding, approved feature set, approval identities and timestamp. Any material change invalidates affected evidence.

## 15. Exceptions and evidence retention

An exception must include control ID, rationale, risk, impact, compensating controls, owner, approver, expiration and remediation issue. No permanent exception.

Store evidence in controlled access-limited repository: PR approvals, CI logs, reports, SBOM, provenance, deployment IDs, provider snapshots, approvals, rollback tests, incidents and postmortems. Apply retention/deletion rules. Never store credentials or raw sensitive customer payloads.

## 16. Current known blockers to revalidate

- GitHub Actions/G02 startup failures have returned zero instantiated jobs; no CI pass can be inferred.
- Cloudflare Access behavior and public/operator/internal route classification remain unverified.
- Active Cloudflare Worker version, deployed asset manifest, routes and bindings need provider-side provenance.
- Firebase Hosting currently points at repository root; determine actual build output and inspect publication scope before changing it.
- Gateway token verification is fail-closed pending approved cryptographic identity configuration.
- Root Worker and askLINGO rate limiters are isolate-local; shared abuse controls require complete endpoint inventory and provider-supported design.
- CSP permits unsafe inline scripts/styles; report-only telemetry and compatibility testing are required before enforcement changes.
- Privacy remediation, provider-side Firebase/Supabase/Stripe/Shopify/Flutter verification, observability, restore drills and independent release acceptance remain open.

These are audit findings, not claims that every component is currently exposed or deployed. Re-test target environments before closing items.
