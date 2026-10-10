# G02 Runner Control Plane

## Purpose
Define a reviewable runner assignment contract, fail-closed state machine, and trigger policy for the canonical runner `lingo-legacy-g02`. This package is a control-plane specification; it does **not** provision a VM, register a runner, start a daemon, or prove GitHub job execution.

## Current status
- Host provisioning: NOT PROVISIONED / NOT VERIFIED
- Runner registration: NOT ESTABLISHED
- Live assignment: NOT ESTABLISHED
- Sentinel execution: NOT ESTABLISHED
- G02 acceptance: BLOCKED
- Production mutation freeze: ACTIVE
- Last-known-good: PROTECTED

## Components
- `runner-state-machine.json`: permitted states, guarded transitions, invariants, and P1–P9 acceptance predicates.
- `trigger-rules.yaml`: default-deny/manual-only trigger contract and production boundary.
- `runner-assignment.yaml`: canonical identity, labels, workload scope, and evidence requirements.

## Provisioning sequence
1. Use an authorized, dedicated Linux x64 host. Capture hostname, OS/architecture, disk/memory, service inventory, runner directory inventory, and active runner processes.
2. Inspect for an existing runner before installing or registering anything. Do not create a duplicate.
3. Confirm repository-scoped runner permissions and least privilege. Do not grant production secrets or deployment rights.
4. Obtain a fresh short-lived registration token through the authorized host/operator workflow. Never paste it into chat, logs, committed files, or artifacts.
5. Register exactly one runner named `lingo-legacy-g02` with labels `self-hosted, linux, x64, lingo-g02`; verify repository scope.
6. Start/enable the service only after the host preflight and operator approval. Capture redacted service status and runner diagnostics.
7. Run the manually authorized sentinel only after the workflow has been reviewed and is available on the allowed ref.
8. Capture the real run ID, job ID, runner ID/name, steps, exit code, retrievable logs, artifact ID, SHA-256, and candidate commit SHA.
9. Have a separate reviewer verify correlation and all P1–P9 predicates. Only then may G02 be considered accepted.

## Fail-closed rules
- Missing host telemetry, runner identity, job assignment, steps, logs, artifacts, or SHA correlation means BLOCKED.
- An unexpected runner identity, labels, privilege, or credential exposure means QUARANTINED.
- A passing local validator or synthetic fixture is not live runner evidence.
- G02 acceptance never authorizes production deployment or activation.
- Do not merge this branch, dispatch a job, mutate production, or activate a release as part of this specification-only change.

## Evidence record minimum
Record UTC timestamps, repository, branch, candidate SHA, workflow run ID/attempt, job ID, runner ID/name/labels, sentinel exit code, log retrieval result, artifact ID, SHA-256 manifest, collector identity, independent reviewer identity, and acceptance decision. Redact credentials and sensitive host details.

## Current limitation
The connected GitHub integration can inspect workflow runs but does not expose a private Linux shell, compute provisioning, runner registration token issuance, or a live runner inventory API in this session. Therefore this package is not a claim that the runner has been created or is online.
