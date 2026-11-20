# LINGO Recovery, Dispatch & Trigger Framework
Version 1.0.0 · 2026-11-15 · State: operational design; dispatch execution gated.

## Purpose
Detect failures, classify impact, route work to the correct owner, execute safe recovery, capture evidence, and decide whether a service can advance. This framework does not authorize protected production changes.

## Dispatch envelope
Every dispatch carries dispatch_id, correlation_id, parent_dispatch_id, event_type, schema_version, occurred_at, detected_at, source_system, source_resource, environment, realm_id, service_id, repository, branch, commit_sha, severity (SEV0-SEV3), impact, customer_scope, idempotency_key, trigger_evidence, owner_team, runbook_id, requested_action, approval_reference, state, attempt, next_retry_at, deadline, final_outcome, artifact_refs and audit_record_ref. Never include credentials, access tokens, payment data, secrets or unnecessary personal information.

## Event taxonomy and triggers
| Trigger | Detection | Dispatch | Safe first response |
|---|---|---|---|
| CI startup failure | queued/startup_failure, no job or runner identity | ci-recovery | preserve run IDs; inspect Actions policy and runner availability; no G02 activation |
| CI test failure | job started and test step failed | code-owner | reproduce in isolated branch; attach logs |
| Missing artifact | expected artifact absent or BlobNotFound | build-artifact | verify upload path, retention and job completion |
| Worker route 404/5xx | synthetic probe or edge telemetry | edge-routing | compare active/preview versions; never auto-promote |
| Missing asset | asset manifest reference fails | asset-integrity | verify case-sensitive path, hash, license and fallback |
| Authentication spike | issuer/audience/signature/expiry errors exceed threshold | identity-security | fail closed; inspect issuer/JWKS/config drift |
| Database unavailable | readiness probe fails | data-platform | preserve read-only behavior; verify connectivity/TLS/limits |
| Queue backlog/poison event | oldest-event age, retry cap or dead-letter threshold | event-operations | pause affected consumer; inspect schema/idempotency |
| Payment webhook anomaly | signature mismatch, replay or reconciliation gap | commerce-security | quarantine event; do not mutate order/balance |
| Privacy/security incident | confirmed sensitive-data exposure or unauthorized access | incident-command | contain access, preserve evidence, notify authorized owner |
| Backup/restore failure | backup missing or restore rehearsal fails | recovery-operations | mark recovery unverified; block release |
| Cost threshold breach | budget alert or spend anomaly | cost-guardrail | stop optional preview jobs; no destructive cleanup |
| User support request | verified support intake | support-queue | acknowledge, classify and route minimum data |

## Severity
SEV0: active compromise, material data exposure, unsafe financial mutation or widespread critical outage. Immediate incident command; contain first.
SEV1: flagship/multiple realm outage, auth/data integrity failure or major customer impact.
SEV2: single realm degradation, repeated job failure, broken route or non-critical integration outage.
SEV3: cosmetic, content, documentation or low-impact issue.
Targets must be approved per service; define SLO, alert window, RPO, RTO and support coverage before production.

## Dispatch state machine
DETECTED -> TRIAGED -> DISPATCHED -> ACKNOWLEDGED -> INVESTIGATING -> MITIGATING -> VERIFYING -> RESOLVED.
Alternate states: DUPLICATE, CANCELLED, BLOCKED, ESCALATED, POSTMORTEM_REQUIRED.
Retry only if action is idempotent and retry budget/backoff permit it. Human approval is mandatory for production mutations, credential rotation, data repair, payment/ledger correction, identity migration, destructive infrastructure and release promotion.

## Automation boundaries
Allowed automatically in isolated environments: read-only health checks and route probes; lint/format/static analysis/unit tests; preview build and synthetic-data contract tests; issue/PR creation with evidence references; non-destructive retry of idempotent preview tasks; artifact integrity checks and status reporting.
Human approval required: production Worker/Pages promotion or DNS changes; branch protection/ruleset/secrets/IAM changes; production DB migration/restore/deletion/data correction; payment/wallet/credit/sweepstakes activation; identity provider changes; G02 runner registration/activation; destructive infrastructure; publication of family/minor personal data or rights-restricted content.

## Recovery playbooks
### GitHub Actions startup
1. Record repository, workflow, run ID, commit SHA, event, runner labels and status.
2. Determine whether a job was instantiated. If no job exists, do not diagnose a test failure.
3. Inspect workflow syntax, repository/org Actions policy, runner availability, concurrency and required environments using read-only access.
4. Run a minimal ubuntu-latest smoke on an authorized isolated branch only if policy permits; do not activate protected G02.
5. Require job ID, runner name/ID, completed steps, logs and artifacts correlated to commit.
6. Update blocker register and retain last-known-good release.

### Cloudflare edge
1. Identify hostname, route, Worker/script, active version, traffic percentage and preview version.
2. Verify GitHub source SHA matches uploaded bundle.
3. Run route probes and independent browser QA on desktop/mobile; validate redirects, headers, CSP, cache and 404/5xx behavior.
4. Confirm rollback target and owner acceptance.
5. Promote only through separate approval; otherwise keep preview isolated.

### Identity and data
Fail closed on issuer, audience, signature, token-type, expiry, tenant or key-rotation ambiguity. Preserve immutable audit evidence without logging raw tokens or sensitive payloads. Validate backup freshness and restore procedure before repair. Use least-privilege runtime role, separate migration role and verified TLS. Test on synthetic data and reconcile writes before production repair.

### Product and assets
Resolve product ID and canonical source path from registry. Verify asset hash, license/rights, privacy class and rendition. Restore from versioned source; never invent or silently substitute licensed content. Run link, accessibility and responsive checks. Mark route verified only after independent QA.

## Recovery/release gates
R0 source and owner known; R1 isolated build reproducible; R2 automated checks actually ran and passed; R3 security/privacy/accessibility/rights passed; R4 integration and operational checks passed; R5 backup/restore/rollback/monitoring verified; R6 authorized owner accepted exact commit/version/environment. Missing gate means HOLD, not inferred pass.

Each production service owns a service catalog entry, dependency map, threat model, data map, owner route, SLO, dashboards, alert rules, deployment procedure, rollback, backup/restore, incident response, privacy request handling, vendor contact, cost ceiling and change log.

## Initial recovery priority
P0: GitHub Actions startup, branch/release governance, PR #574 security verification, issue #575 cross-stack blockers, issue #480 master record, Cloudflare flagship preview QA.
P1: realm registry reconciliation, identity/API contracts, asset inventory, service observability and route smoke coverage.
P2: per-realm integrations, mobile shell, commerce test mode and game service adapters.

Current release disposition: protected hold. This document defines dispatch behavior; it does not claim that triggers, alert channels, schedules, queues or automated remediation have been provisioned.
