# G02 persistent systemd runner lifecycle

Status: controlled migration runbook; **not executed on the host**.
Branch: `infra/g02-runner-recovery-clean-2026-10-09`.

## Architecture decision and hard preconditions

The current `ops/github-runner/bootstrap.sh` launches a Docker-based **ephemeral** runner. A native GitHub runner configured with `config.sh` and `svc.sh` is a different lifecycle. Do not run both for the same runner identity.

The persistent systemd model is the target described by ADR-001 and requested for G02. Before migration, an operator with host access must:
1. Confirm the dedicated Linux x64 host, systemd, disk, outbound HTTPS and host ownership.
2. Confirm the repository runner inventory and record the exact existing runner ID/name/status/labels. Never delete by name alone.
3. Stop and verify the existing Docker/ephemeral process before configuring a native runner. Preserve diagnostics and evidence first.
4. Confirm the workflow trust policy prevents untrusted fork/PR code and production secrets from reaching this persistent runner.
5. Confirm no other process is using the selected runner name. Do not use `--replace` or create a second registration to bypass an existing identity.
6. Use a dedicated unprivileged Linux account (for example `runner`); do not run the runner daemon as root.

If any precondition fails, stop and retain G02 as FAIL / UNVERIFIED.

## Native runner installation

Run from an approved, owner-controlled Linux host. Commands below are an operator procedure, not evidence that installation has occurred.

1. Download and verify the official GitHub Actions runner release for Linux x64 from GitHub's official runner releases/documentation. Extract it into a dedicated directory owned by the service account, e.g. `/opt/actions-runner`.
2. Authenticate GitHub CLI as a repository administrator, or use an approved short-lived repository registration token obtained securely at execution time. Never paste tokens into chat, commit them, put them in shell history, or print them to logs.
3. From the runner directory, configure the runner non-interactively with the repository URL, short-lived token, exact name `lingo-legacy-g02`, and labels `self-hosted,linux,x64,lingo-g02`. Do not use `--replace`. Keep the registration token out of command transcripts where possible; prefer a protected interactive/secret-injection mechanism.
4. Verify the generated `.runner` configuration and confirm the GitHub repository runner inventory shows exactly one intended registration with the required name and labels.
5. Install the service as the dedicated account:
   `sudo ./svc.sh install runner`
6. Start and inspect it:
   `sudo ./svc.sh start`
   `sudo ./svc.sh status`
7. Discover the exact generated unit name rather than assuming a wildcard:
   `systemctl list-units --type=service --all 'actions.runner*'`
   `systemctl status <exact-generated-unit-name>`
8. Inspect recent service logs without exposing credentials:
   `journalctl -u <exact-generated-unit-name> -n 200 --no-pager`

The generated unit name is determined by the runner configuration and may include repository/owner identity; do not assume it is literally `actions.runner.lingo-legacy-g02.service`.

## Acceptance — all three layers required

### A. Host service
- systemd unit is enabled for boot and reports `active (running)`;
- a real main PID exists and belongs to the dedicated service account;
- restart policy and boot enablement are confirmed from the generated unit;
- no duplicate native runner or competing Docker runner process exists.

### B. GitHub control plane
- exactly one intended runner is present;
- runner name is `lingo-legacy-g02`;
- labels include `self-hosted`, `linux`, `x64`, `lingo-g02`;
- GitHub reports the runner `Online` / `Idle` before dispatch.

### C. Actual G02 execution
- a trusted G02 sentinel job is dispatched with the exact required labels;
- job is assigned to this runner with `runner_id > 0` and `runner_name = lingo-legacy-g02`;
- steps are instantiated and complete; sentinel passes;
- logs and `g02-execution-evidence-<run_id>` artifact are retrievable;
- run ID, job ID, runner ID/name, commit SHA, logs and artifact checksums correlate;
- independent verification and formal acceptance are recorded.

A green systemd status or GitHub Online/Idle indicator alone is not G02 acceptance.

## Failure handling

- For service failure, inspect `svc.sh status`, exact systemd unit, `journalctl`, and runner `_diag/` before changing state.
- For HTTP 401/403, validate registration state and token lifecycle; never expose tokens.
- For TLS/DNS/proxy errors, repair the actual outbound connectivity issue; do not disable TLS verification.
- For stale registration, reconcile the exact runner ID in GitHub before removing it. Preserve logs before cleanup.
- For a failed job, inspect runner/job logs and workflow permissions before restarting or re-registering.
- Do not mix ephemeral and persistent registration modes. Do not cache runner credentials or workspace state.

## Authority boundary

`SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → AUTHORIZATION → PROMOTION`

This runbook does not authorize merge to the default branch, production deployment, payment activation, downstream gate advancement, or replacement of the protected last-known-good release.
