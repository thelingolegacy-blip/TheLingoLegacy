# Observability and Integration Contracts

## Goals

Make failures diagnosable, distinguish configured systems from proven live systems, and ensure every critical integration has an owner, evidence, and recovery procedure.

## Integration inventory

Maintain one record per integration with its name and purpose; owner and escalation path; environment and source of truth; authentication mechanism and secret-manager reference (never secret value); least-privilege permissions and allowed egress; health/probe method and last successful verification timestamp; data classification, retention and redaction rules; retry, timeout, idempotency and rate-limit policy; failure mode, runbook, rollback and rotation cadence.

Suggested initial entries:
- GitHub Actions — source, CI, release evidence and workflow execution.
- Cloudflare Workers/Pages — current production edge runtime and assets.
- Firebase — authentication/data/backend integration; status must be independently verified.
- Commerce/payment — test-mode versus live-mode separation; no payment mutation during platform recovery.
- Analytics/telemetry — event delivery, data quality, privacy, retention, and alert ownership.
- Design/creative systems — source assets and approvals, not deployment authorization.
- Optional Kubernetes capacity lab — non-production only, conditional on approved provisioning.

Label each entry ACTIVE-VERIFIED, CONFIGURED-UNVERIFIED, PLANNED, or RETIRED. Do not infer status from a README mention.

## Logging

Use structured logs with UTC timestamps and stable fields where applicable: service, environment, runtime version, request/correlation ID, workflow run ID, attempt, job ID, commit SHA, outcome, duration, retry count, dependency, and sanitized error category.

Never log tokens, authorization headers, registration tokens, full environment dumps, payment data, or unnecessary personal information. Apply retention and access controls appropriate to the data.

## Metrics

Runtime metrics: request rate and successful request rate; error rate by status/error class; latency p50/p95/p99; saturation (CPU/memory, active requests, connections); queue depth and oldest item age for asynchronous work; dependency timeout/retry/circuit-breaker counts; deploy version and rollback events.

CI/release metrics: workflow dispatch-to-start latency; queued job age and assignment success; runner ID/name and labels where returned; step initialization/execution and conclusion; log/artifact availability; build duration, test outcome, and provenance verification.

## Tracing and correlation

Propagate a request/correlation ID across service boundaries when supported. For CI evidence, correlate repository, commit SHA, workflow run ID, run attempt, job ID, runner identity, timestamp, log URL, and artifact ID. A missing field is recorded as missing; do not synthesize it.

## Alerts and runbooks

Every alert needs a named owner, severity, actionable threshold, and runbook. Initial alert candidates:
- repeated workflow dispatch failures or queued jobs over an agreed threshold;
- critical endpoint availability or latency SLO breach;
- increased 5xx/timeout rate;
- telemetry pipeline silence;
- artifact/provenance mismatch;
- capacity-lab runaway cost or stop-condition violation.

Test alerts with a controlled synthetic event before relying on them. No alert is operationally complete until a person or rotation is assigned to respond.

## Integration acceptance

1. Verify configuration without exposing secrets.
2. Make a safe, non-destructive test request.
3. Confirm success and failure telemetry.
4. Verify timeout/retry/idempotency behavior.
5. Confirm alerting and runbook.
6. Record evidence and timestamp.
7. Re-test after credential rotation or major version change.

## Current limitations

This document establishes a contract, not live observability. It does not create dashboards, connect external telemetry, validate secret bindings, or prove integrations are healthy. Those require account access and safe test execution.
