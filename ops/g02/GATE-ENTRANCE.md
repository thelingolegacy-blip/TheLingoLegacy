# G02 Gate Entrance

This is the single manual entrance for assigning one of three bounded G02 tasks to the dedicated repository runner.

## Workflow

- Workflow: `.github/workflows/g02-gate-entrance.yml`
- Trigger: manual `workflow_dispatch`
- Required runner labels: `self-hosted`, `linux`, `x64`, `lingo-g02`
- Required runner name: `lingo-legacy-g02`
- Repository: `thelingolegacy-blip/TheLingoLegacy`

## Assigned operations

1. `sentinel` — prove a real runner assignment and execute a bounded host/runtime sentinel.
2. `host-diagnostics` — invoke the existing read-only, redacting host diagnostic script. The report is evidence, not an automatic acceptance.
3. `recovery-preflight` — record non-mutating readiness facts. It does not register, restart, delete, or reconfigure a runner.

## Dispatch

After this workflow is merged to the default branch, open the repository Actions tab, select **G02 Gate Entrance**, choose the operation, add an incident/change reference, and select **Run workflow**.

A workflow queued without an assigned runner is a blocker, not a pass. A successful run must show:
- runner ID greater than zero;
- runner name exactly `lingo-legacy-g02`;
- Linux x64 self-hosted runtime;
- populated job ID, run ID, and full commit SHA;
- completed task steps;
- retrievable `g02-gate-entrance-<run_id>` artifact and matching SHA256 manifest.

The artifact explicitly leaves independent verification and formal acceptance pending. An artifact cannot approve itself.

## Safety and recovery boundary

- No pull-request trigger is configured; public/untrusted PR code is not dispatched to this runner.
- Workflow token permissions are limited to repository contents read and Actions read.
- Checkout does not persist credentials.
- No secrets, registration tokens, PATs, or cloud credentials are printed or written.
- No production deployment, DNS/Worker mutation, Firebase write, billing action, or downstream gate promotion is performed.
- Runner registration, service restart, remote runner deletion, and host provisioning are outside this workflow. Those require the approved host/provider and separate evidence.
- Do not create a duplicate runner. Inspect the repository runner inventory before any registration attempt.

## Current acceptance status

The entrance is source-level infrastructure until merged and actually dispatched. G02 remains **FAIL / UNVERIFIED** until a real runner accepts and completes a task and the evidence is independently reviewed.
