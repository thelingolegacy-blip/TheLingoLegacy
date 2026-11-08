# LINGO Legacy — Resilience, Backup, and Community Safety Baseline

**Status:** Proposed baseline; documentation only. No backup, restore, monitoring, security, healthcare, or production control is claimed to be active based on this document.

## 1. Operating principles

- Fail closed: an unknown, stale, missing, or contradictory signal is not a pass.
- Protect the last-known-good (LKG) release and preserve an auditable rollback path.
- Prefer reversible, least-privilege changes; isolate recovery work from production.
- Never store credentials, personal health information (PHI), or sensitive incident details in logs, artifacts, issues, or public repositories.
- Separate platform availability work from clinical decision-making. LINGO infrastructure is not an emergency service or a substitute for qualified healthcare and emergency responders.

## 2. Recovery objectives — set targets before claiming compliance

Owners must approve service-specific recovery point objectives (RPO) and recovery time objectives (RTO) before implementation. Until approved and tested, mark both **UNDEFINED / NOT VERIFIED**; do not invent an achieved recovery time.

Inventory and classify:
- Git source, workflow definitions, release manifests, and evidence bundles.
- Firebase Authentication configuration, Firestore data and indexes, Cloud Functions, rules, and required secrets references.
- Cloudflare DNS, Worker source/configuration, route inventory, and deployment identifiers.
- Shopify commerce configuration/webhook contracts, Flutter/mobile release artifacts, and game/content assets.
- Domain/registrar records, third-party dependency inventory, monitoring configuration, and incident runbooks.

For each system, record owner, data classification, backup method, schedule, retention, encryption, access boundary, restore procedure, latest successful backup, latest restore test, and evidence link. Do not place secret values in the inventory.

## 3. Backup controls

- Use provider-supported backups/exports and versioned source-controlled configuration where appropriate.
- Store recovery copies separately from the production credential boundary; restrict write/delete access and enable immutable retention where supported and approved.
- Encrypt backups in transit and at rest. Keep key-management and access-recovery procedures separate from the data backup itself.
- Define retention and deletion policies for each data class, including privacy and legal requirements.
- Monitor backup age, completion, size anomalies, and restore-point availability. A scheduled job's green status is not proof of a usable backup.
- Produce a manifest with system, source revision/configuration version, capture time (UTC), object identifiers, size, checksum, retention, and verification status. Never include credentials or personal health details.
- Backups must be independently readable and checksummed before they count as verified.

## 4. Restore and disaster-recovery drills

Perform drills in an isolated non-production environment first:
1. Select a documented restore point and verify its manifest/checksum.
2. Restore to an isolated target without overwriting production.
3. Validate schema/index compatibility, authentication/rules, critical API contracts, and representative user journeys.
4. Compare record counts or provider-supported integrity checks; record expected exclusions and data-loss window.
5. Measure actual restore duration and recovered data point; compare to approved RTO/RPO.
6. Capture sanitized logs, command/version metadata, checksums, reviewer, and outcome in a run-scoped evidence bundle.
7. Tear down temporary resources safely and record the cleanup result.
8. Repeat failures until the runbook is reproducible; do not declare DR-ready from backup creation alone.

No production restore or destructive overwrite is authorized by this baseline.

## 5. Reliability, telemetry, and speed

- Measure latency percentiles, availability, error rate, queue depth, dependency failures, mobile crash rate, and backup freshness by service.
- Define service-level indicators/objectives and alert thresholds with owners; distinguish synthetic edge probes from real user success.
- Add correlation IDs across request, job, deployment, and artifact metadata; redact secrets and sensitive payloads.
- Use bounded retries with backoff, timeouts, idempotency, and dead-letter handling where relevant.
- Set performance budgets and test build/package size, startup time, API latency, and critical journeys before release. Do not trade away access controls, data integrity, or evidence for speed.
- Alerts must route to a named on-call owner or documented fallback; test alert delivery periodically.

## 6. Community health and safety

- Provide clear, accessible paths to local emergency services, crisis resources, and qualified healthcare providers where community features discuss urgent risk. Validate resource geography and review dates before publishing.
- Do not present the platform or its bots as clinicians, dispatchers, or emergency responders; do not automate diagnosis or high-impact interventions without an approved clinical, legal, privacy, and safety review.
- Collect the minimum data necessary; restrict access to sensitive reports, establish retention/deletion rules, and log access to sensitive records.
- Create a human-reviewed incident pathway: intake → severity triage → designated owner → escalation → resolution → post-incident review. Define response targets with the accountable safety owner.
- Make reports accessible, support abuse prevention and anti-harassment controls, and provide a safe appeal path.
- Test the incident workflow with synthetic, non-identifying scenarios. Never use real personal health information in test fixtures.

## 7. CI/CD and release gate

A release candidate must not pass unless the applicable stages have actual evidence:
1. Source/ref/commit identity and clean change scope.
2. Static analysis, dependency/license/security checks, unit/integration tests, and build/package.
3. Configuration and policy validation with secrets excluded from logs.
4. Backup freshness check and a successful isolated restore test when the release affects stateful systems.
5. Deploy to non-production, smoke/E2E tests, performance and accessibility checks.
6. Artifact manifest and checksums, retrievable logs, and independent run/job/commit correlation.
7. Explicit review/acceptance and rollback readiness.
8. Production authorization by the existing governance process.

A missing runner, empty steps, missing logs, absent artifacts, or unresolved correlation is a failure—not a warning that can be waived.

## 8. Current G02 dependency

The known recovery blocker is GitHub Actions runner dispatch. Before this baseline can be tested by CI, the runner must be eligible and assigned, have a populated runner identity, execute the sentinel, and generate retrievable logs/artifacts. Host process/service state remains unverified until captured from the actual host. Do not terminate processes, reset credentials, re-register, or restart the runner without state-aware diagnosis and explicit operational approval.

## 9. Evidence record template

For each backup, restore drill, or release check, capture:
- UTC timestamp and operator/reviewer.
- System/environment and scope.
- Repository/ref/commit, workflow run ID, job ID, runner ID/name where applicable.
- Backup/restore point ID and checksum (never secret values).
- Tool/provider versions and sanitized command/result summary.
- Expected versus observed RPO/RTO, integrity checks, and test outcomes.
- Artifact IDs/links and independent verification result.
- Gate decision: PASS only when every required predicate is true; otherwise BLOCKED/FAIL.
- Remediation owner and next review date.

## 10. Initial action register

| Priority | Action | Acceptance evidence | Gate |
|---|---|---|---|
| P0 | Resolve G02 runner assignment/dispatch | Assigned runner, executed sentinel, retrievable logs and artifact correlated to run/job/commit | G02 |
| P1 | Inventory backup coverage and owners | Completed inventory with explicit unknowns and approved RPO/RTO | Backup readiness |
| P1 | Prove one isolated restore per critical stateful system | Integrity checks, measured restore, reviewer, sanitized artifact bundle | DR readiness |
| P1 | Establish SLOs and alert ownership | Approved SLI/SLO sheet and a tested alert route | Observability |
| P2 | Exercise community safety escalation flow | Reviewed protocol and synthetic tabletop evidence | Safety readiness |

**Fail-closed statement:** This document is a proposal for review, not evidence that backups, restore drills, monitoring, healthcare pathways, or production controls have been configured or tested.