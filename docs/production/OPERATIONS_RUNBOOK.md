# The Lingo Legacy — Production Operations Runbook

**Status:** Proposed operating procedure; not evidence of live operational readiness  
**Rule:** Never perform a production, provider, account, payment, DNS, route, secret, database or access-policy mutation solely because this document exists. Obtain explicit change approval and use the approved change record.

## 1. Daily operations

1. Review service dashboards, error/latency/saturation metrics, dependency health and alert queue.
2. Review failed and delayed jobs, webhook delivery, queue depth and scheduled-task outcomes.
3. Confirm backup completion and security-monitoring status; investigate failures.
4. Review open incidents, high-priority vulnerabilities, expiring certificates/keys and upcoming provider limits.
5. Confirm no unexpected billing, provider spend, traffic spikes or unauthorized configuration changes.
6. Record operator, timestamp, service, observed state, evidence and follow-up owner.

A green health endpoint alone is not proof of application readiness. Verify dependencies and critical user journeys.

## 2. Release procedure

### Before release
- Open a change record and link the issue, pull request and approved release scope.
- Freeze scope; identify source SHA, artifact digest, target environment, dependencies and data migrations.
- Confirm branch protection, peer review, all required CI jobs and security scans.
- Verify staging acceptance, accessibility, privacy, API contracts, negative tests and cost limits.
- Confirm backup/restore point, rollback method, monitoring dashboard and on-call coverage.
- Obtain all required engineering, security, privacy, business and production approvals.

### Deployment
- Promote the exact artifact already accepted in staging.
- Verify provider deployment ID, active version, routes, bindings, environment and asset manifest.
- Use canary/gradual rollout if available; monitor predefined abort thresholds.
- Do not change unrelated provider settings during the release.

### After release
- Run authenticated and unauthenticated smoke tests, critical user journeys and negative security tests.
- Verify logs, metrics, traces, alert delivery, webhooks and business transaction reconciliation.
- Compare actual deployed version to approved SHA/artifact digest.
- Record the observation window and release decision.
- If acceptance fails, stop rollout and execute the approved rollback.

## 3. Rollback procedure

1. Incident/change commander declares rollback and records reason/time.
2. Stop further rollout or mutation.
3. Restore the last known-good immutable artifact/configuration using the approved provider procedure.
4. For schema changes, use a tested backward-compatible migration or documented recovery plan; never blindly reverse destructive data changes.
5. Verify DNS/route, TLS, active version, health/readiness, authentication, critical flows and data integrity.
6. Reconcile any in-flight transactions or queued events.
7. Notify stakeholders and open a post-incident review.
8. Preserve logs, deployment IDs, diffs and timestamps.

Rollback is not complete until user-facing behavior and data integrity are independently verified.

## 4. Incident response

### Severity
- **SEV-1:** confirmed broad outage, active compromise, sensitive-data exposure, data corruption or unsafe financial/game outcome.
- **SEV-2:** major critical journey unavailable or significant degradation without safe workaround.
- **SEV-3:** limited feature degradation or localized impact with workaround.
- **SEV-4:** minor defect, question or low-impact issue.

### Response sequence
1. Acknowledge and assign incident commander.
2. Establish incident channel and timeline; record facts separately from hypotheses.
3. Assess scope, affected users, data classes, providers and safety/financial impact.
4. Contain with the smallest reversible action; obtain approval for privileged changes.
5. Preserve forensic evidence; do not expose sensitive data in public tickets.
6. Recover using a tested procedure and verify critical flows.
7. Communicate status, impact and next update time without speculation.
8. Complete postmortem and assign corrective actions.

For suspected credential compromise, restrict affected access and follow the approved credential rotation/revocation procedure. Do not paste credentials into tickets or chat.

## 5. Security event procedure

- Preserve timestamps, request IDs, relevant logs and immutable snapshots.
- Determine whether the issue is exposure, exploit attempt, successful compromise or false positive.
- Identify affected identities, data stores, endpoints, builds and provider resources.
- Revoke sessions/tokens or rotate keys only under the approved incident/change procedure.
- Patch through source control, peer review, CI and staged rollout.
- Validate remediation with independent tests and check for persistence or secondary access.
- Apply legal/privacy notification requirements with the designated reviewer.
- Do not run destructive cleanup or publish sensitive evidence before forensic review.

## 6. Data operations

- Require an approved ticket for schema changes, exports, bulk updates, deletion and retention changes.
- Test migrations on a production-like synthetic dataset.
- Capture pre-change backup and verify restore before high-risk migration.
- Use least-privilege operator identity and dual approval for sensitive data operations.
- Validate record counts, invariants, ownership and referential integrity after execution.
- Record query/script hash, operator, reviewer, time, environment and outcome.
- Never use production personal data in development or public examples.

## 7. Provider operations

For Cloudflare, Firebase, Supabase, GitHub, analytics, commerce, messaging and mobile distribution, maintain a provider record containing:
- Named owner and support escalation.
- Project/account and environment identifier (never secrets).
- Products/features enabled and purpose.
- Routes/domains, bindings, regions and data classification.
- Roles/permissions and credential lifecycle owner.
- Quotas, rate limits, billing/cost ceiling and alert.
- Backup/export/restore capability.
- Webhook signing and replay controls.
- Last verified timestamp, evidence and next review.

A connected account or repository integration does not prove that the production project is configured or operational.

## 8. Change classes and approvals

| Change class | Examples | Minimum control |
|---|---|---|
| Standard | Reviewed docs, non-production tests | Peer review and recorded result |
| Normal | Application code, staging configuration | PR, CI, test evidence, owner approval |
| High risk | Auth, data rules, migrations, secrets, edge routes, DNS, production deployment | Independent security/operations review, backup, rollback, explicit production approval |
| Financial/legal | Billing, cash-out, paid provider, tax, consumer terms | Explicit owner approval plus legal/compliance/provider acceptance |
| Emergency | Active incident containment | Incident commander, smallest reversible action, retrospective approval |

No broad blanket authorization substitutes for a specific approval on consequential production or financial changes.

## 9. Scheduled reviews

- Weekly: release blockers, failed jobs, vulnerabilities, incident actions, backup status, provider quota and alert review.
- Monthly: access review, dependency/SBOM review, data-retention and privacy review, cost review, recovery readiness.
- Quarterly: restore exercise, rollback exercise, incident tabletop, threat-model review, provider/route inventory and business continuity review.
- After every material change: invalidate affected evidence and re-run relevant acceptance gates.

## 10. Operational record template

- Record ID:
- Date/time and timezone:
- Operator / reviewer:
- Environment / service:
- Change or incident summary:
- Approved issue/change ID:
- Source SHA / artifact digest / deployment ID:
- Pre-checks and backup evidence:
- Procedure and tool version:
- Commands/actions performed:
- Result and validation:
- Rollback status:
- Alerts/communications:
- Follow-up owner and due date:
- Evidence location and classification:
