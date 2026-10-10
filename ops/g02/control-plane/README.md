# G02 Runner Control Plane

## Purpose
Define a reviewable runner assignment contract, fail-closed state machine, trigger policy, timer controls, and dependency-free Node.js static validator for the canonical runner `lingo-legacy-g02`. This package does **not** provision a VM, register a runner, start a daemon, or prove GitHub job execution.

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
- `assignment-watch.sh`: read-only, timestamped host/runner process observation.
- `assignment-watch.service` and `assignment-watch.timer`: hardened systemd units; timer is disabled by default.
- `assignment-timer-control.sh`: explicit `create`, `status`, and `reset` commands. `create` installs the unit files but does not enable/start them. `reset` restarts only the timer.
- `validate-node.mjs`: dependency-free static contract and Bash syntax validator.
- `.github/workflows/g02-control-plane-static-validation.yml`: separate hosted-runner static validation lane. It is not G02 acceptance evidence.

## Static validation
From the repository root, with Node.js 22 and Bash installed:

```bash
node ops/g02/control-plane/validate-node.mjs
```

The validator checks required files, JSON schema/acceptance predicates, canonical labels, fail-closed assignment and trigger policies, manual-only sentinel workflow rules, timer safety invariants, and Bash syntax. The repository currently has no root `package.json`; this infrastructure validator intentionally does not claim an application build/test.

The hosted static-validation workflow uses `ubuntu-latest` only as an independent check. A successful hosted/static run does not satisfy any G02 runner predicate. If GitHub assigns no runner, creates no steps, or exposes no logs, the workflow result is infrastructure-blocked and the validator has not executed.

## Timer installation on an authorized Linux host
Prerequisites: dedicated Linux x64 host, systemd, an approved checkout located at `/opt/lingo-g02`, and operator authorization for installing system-level unit files. First complete the host/runner inventory and verify no duplicate runner registration. Do not use this timer as a substitute for the Actions runner daemon.

```bash
cd /opt/lingo-g02
node ops/g02/control-plane/validate-node.mjs
sudo bash ops/g02/control-plane/assignment-timer-control.sh create
sudo bash ops/g02/control-plane/assignment-timer-control.sh status
```

`create` installs the service/timer unit files and reloads systemd but deliberately leaves the timer disabled and stopped. After a host owner reviews the read-only probe and explicitly approves periodic observation, the owner may enable/start the timer with systemd and capture the resulting status. The control script deliberately refuses to automate `enable`.

To reset an already-installed timer, without restarting the Actions runner or cancelling/requeuing GitHub jobs:

```bash
sudo bash ops/g02/control-plane/assignment-timer-control.sh reset
sudo bash ops/g02/control-plane/assignment-timer-control.sh status
```

The service uses systemd `DynamicUser=yes` and `StateDirectory=lingo-g02`, avoiding dependence on a manually provisioned `lingo-runner` account. The service executable path assumes the checkout is at `/opt/lingo-g02`; do not install the unit from a different checkout without adjusting and reviewing the unit.

## Provisioning sequence
1. Use an authorized, dedicated Linux x64 host. Capture hostname, OS/architecture, disk/memory, service inventory, runner directory inventory, and active runner processes.
2. Inspect for an existing runner before installing or registering anything. Do not create a duplicate.
3. Confirm repository-scoped runner permissions and least privilege. Do not grant production secrets or deployment rights.
4. Obtain a fresh short-lived registration token through the authorized host/operator workflow. Never paste it into chat, logs, committed files, or artifacts.
5. Register exactly one runner named `lingo-legacy-g02` with labels `self-hosted, linux, x64, lingo-g02`; verify repository scope.
6. Start/enable the runner service only after host preflight and operator approval. Capture redacted service status and runner diagnostics.
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
