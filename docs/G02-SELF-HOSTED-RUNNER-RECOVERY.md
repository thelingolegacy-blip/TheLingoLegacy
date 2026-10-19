# G02 — Self-Hosted Runner Recovery Runbook

**Purpose:** diagnose why GitHub Actions jobs remain queued or complete with no assigned runner, no steps, and no retrievable logs.  
**Scope:** read-only diagnosis first; no production deployment, merge, DNS, or secret changes.  
**Required labels for the current sentinel:** `self-hosted`, `linux`, `x64`, `lingo-g02`.

## Acceptance predicate

G02 is not PASS until all are evidenced for the same sentinel run:

1. A real matching runner is online and authorized for the repository.
2. `runner_id > 0` and `runner_name` is populated.
3. The job is assigned and workflow steps are instantiated.
4. A harmless sentinel step executes and returns success.
5. Job logs are generated and retrievable.
6. The evidence is tied to the exact workflow run and independently checked.

A green workflow label, queued job, runner marked Online Idle, or empty step list does not satisfy this predicate.

## Phase A — Identify runner and service (Linux host)

Run these on the machine intended to host the runner, from the runner installation directory where applicable. Do not paste tokens, credential files, environment dumps, or private keys into logs or chat.

```bash
# 1. Confirm host and user
hostname
id

# 2. Locate candidate runner services
systemctl list-units --type=service --all 'actions.runner*' --no-pager

# 3. Inspect runner directory (run from the configured runner directory)
pwd
test -x ./run.sh && echo "runner executable present" || echo "run.sh not found"
test -x ./svc.sh && sudo ./svc.sh status || echo "svc.sh not found"

# 4. Read only configured labels from runner metadata, if present
if command -v jq >/dev/null 2>&1 && test -f .runner; then
  jq -r '.labels[]?.name' .runner
else
  echo "Cannot inspect labels here; use GitHub Settings > Actions > Runners."
fi

# 5. Check basic HTTPS reachability (does not prove runner registration)
curl -sS -o /dev/null -w 'github.com HTTP %{http_code}\n' --max-time 10 https://github.com/
```

**Never** print `.credentials`, `.credentials_rsaparams`, personal access tokens, runner registration tokens, or the entire process environment.

## Phase B — Verify GitHub-side authorization

In the repository, open **Settings → Actions → Runners** and verify:

- The expected runner appears in the correct repository or authorized organization runner group.
- It is online (not merely a stale or duplicate runner record).
- Its labels include all labels requested by the workflow: `self-hosted`, `linux`, `x64`, `lingo-g02`.
- The runner group permits this repository and the workflow is not restricted by an Actions policy.
- No second stale runner record is being mistaken for the live host daemon.

If the runner is only registered at organization level, verify the runner-group repository access policy. Do not weaken organization-wide security controls just to force a job through.

## Phase C — Service repair, only after Phase A/B evidence

If the configured runner exists but its service is stopped, first record the current service name and state. Then, with an authorized host operator, use the documented service script from the runner directory:

```bash
sudo ./svc.sh status
# If status confirms the configured service is stopped:
sudo ./svc.sh start
sudo ./svc.sh status
```

If the runner was configured but its service was never installed, confirm the directory is the intended runner and that GitHub shows that registration before installing/starting the service:

```bash
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

Do not reconfigure or remove the runner until registration state, labels, and group access are recorded. If the runner configuration is missing, expired, or unregistered, an authorized repository/organization administrator must generate a fresh short-lived runner registration token through GitHub's runner settings/API and perform the documented registration procedure on the host. Never place that token in the repository, issue comments, workflow files, or chat.

## Phase D — Collect minimal diagnostic evidence

For the exact runner service name identified in Phase A:

```bash
# Replace the placeholder with the exact unit name found by systemctl.
sudo systemctl status 'actions.runner.REPLACE_WITH_EXACT_UNIT.service' --no-pager
sudo journalctl -u 'actions.runner.REPLACE_WITH_EXACT_UNIT.service' --since '30 minutes ago' --no-pager
```

Redact hostnames if sensitive, usernames, internal IPs, tokens, URLs with secrets, and any unrelated application data before sharing logs.

## Phase E — Re-run and verify the sentinel

After the service and GitHub authorization are confirmed:

1. Trigger the existing G02 sentinel workflow; do not create a new workflow as a substitute for runner recovery.
2. Retrieve the workflow run and job records.
3. Confirm the runner ID/name, assigned job, nonempty steps, sentinel output, and retrievable logs.
4. Save the run URL/ID, commit SHA, job ID, runner ID/name, timestamps, step summary, and log/artifact references to the ledger.
5. Set G02 PASS only if every acceptance predicate above is satisfied. Then proceed to downstream CI validation; do not treat G02 alone as release certification.

## If the job still queues

Capture, without secrets:

- Exact workflow `runs-on` labels.
- GitHub runner status and displayed labels.
- Runner group name and whether this repository is authorized.
- Service status and recent redacted journal output.
- Workflow run ID, job ID, and runner assignment fields.

Escalate to the repository/organization administrator or GitHub Support if service polling and authorization both appear healthy but GitHub still never assigns the job. Do not disable required checks or bypass the fail-closed release gates.

## Current known state (2026-10-19)

The recent retry of run `39222173722` produced run `39222222337`; the validation job failed with no usable step list or retrievable logs, and log retrieval returned `BlobNotFound`. This is insufficient to identify the host-side root cause. The runbook is a diagnostic procedure, not evidence that the runner has been repaired.
