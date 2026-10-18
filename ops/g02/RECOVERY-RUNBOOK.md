# G02 Runner Recovery Runbook

**Scope:** isolated recovery branch and the dedicated GitHub Actions self-hosted runner only.  
**Production posture:** fail-closed; no production deployment, merge, DNS change, or activation is authorized by this runbook.

## Acceptance target

Runner name: `lingo-legacy-g02`  
Required labels: `self-hosted`, `linux`, `x64`, `lingo-g02`  
Expected install directory (if this host uses the existing convention): `/opt/actions-runner`

A host being online is not G02 acceptance. G02 requires a matching runner to receive a job, a nonzero runner ID and populated runner name, instantiated steps, a successful sentinel with an exit code, retrievable logs and artifact, and independent run/job/commit correlation.

## 1. Collect host evidence before changing anything

Run from the repository root on the intended Linux runner host:

```bash
set +e
printf '%s\n' '=== HOST ==='
hostname
uname -a
id
printf '%s\n' '=== RUNNER PROCESSES ==='
ps -eo pid,etime,comm,args | grep -E '[R]unner.Listener|[r]unsvc\.sh'
printf '%s\n' '=== SERVICES ==='
systemctl list-units --all 'actions.runner.*.service' --no-pager
systemctl list-unit-files 'actions.runner.*.service' --no-pager
printf '%s\n' '=== G02 DIAGNOSTIC ==='
bash ops/g02/diagnose-runner.sh
rc=$?
printf 'G02_DIAGNOSTIC_EXIT_CODE=%s\n' "$rc"
```

Save the complete terminal output as an evidence artifact. Redact host public IPs, usernames if required by policy, tokens, registration credentials, and other secrets before sharing it. Do not paste runner tokens into chat or commit them.

## 2. If the runner service already exists

Identify the exact service unit from the previous output; do not guess its name. Inspect it before restarting:

```bash
sudo systemctl --no-pager --full status '<EXACT_SERVICE_UNIT>'
sudo journalctl -u '<EXACT_SERVICE_UNIT>' -n 150 --no-pager
```

If the unit is clearly the dedicated G02 runner and the configuration is correct, restart only that unit and capture the result:

```bash
sudo systemctl restart '<EXACT_SERVICE_UNIT>'
sleep 3
sudo systemctl --no-pager --full status '<EXACT_SERVICE_UNIT>'
sudo journalctl -u '<EXACT_SERVICE_UNIT>' -n 80 --no-pager
```

Do not stop or restart unrelated services. If the runner is not dedicated to G02, stop and obtain owner approval before modifying it.

## 3. If no service is registered

Use GitHub's repository **Settings → Actions → Runners → New self-hosted runner** for this repository. Select Linux and the host's correct architecture. Follow the current commands GitHub displays for the runner package; package versions and registration tokens are time-limited, so do not reuse an old token.

Before configuring, verify whether the directory is already configured. Do not overwrite or replace an existing runner registration without confirming its owner and purpose. If a new isolated runner is approved, configure it with the exact name and labels above. Enter the short-lived registration token only in the local host shell, never in a ticket, workflow file, command history, log, or chat. Prefer the interactive GitHub-provided configuration flow; unset any temporary token variable immediately afterward.

After successful configuration, install and start the service using the runner package's `svc.sh` instructions and confirm that the service is enabled and active. Do not claim registration succeeded until GitHub's runner page shows this exact runner online.

## 4. Execute the G02 sentinel

Once the runner is online and the repository workflow is configured for the required labels:

1. Dispatch the approved **staging-only** recovery workflow from GitHub Actions.
2. Confirm the job is assigned to `lingo-legacy-g02` with a nonzero runner ID.
3. Confirm each step is instantiated and the sentinel exits zero.
4. Retrieve the complete job logs and workflow artifacts through GitHub.
5. Correlate the workflow run ID, job ID, commit SHA, runner ID, and runner name.
6. Independently verify the saved evidence packet.
7. Mark G02 PASS only if every acceptance predicate is evidenced.

If the job remains queued, do not relax the labels or substitute a GitHub-hosted runner. Capture the queue state and runner page, then investigate repository Actions policy, runner group scope, organization/enterprise restrictions, and host polling logs.

## 5. GitLab restriction and credential hygiene

The observed GitLab pipeline creation restriction required identity verification. Do not retry pipeline creation until the account restriction is cleared in GitLab. A runner-registration credential was exposed in an earlier diagnostic response; an authorized GitLab maintainer must rotate/revoke it and verify revocation. Do not include the old credential in evidence.

## 6. Evidence packet checklist

Capture and correlate:

- UTC timestamp and repository/branch/commit SHA.
- Host OS/architecture and runner service status.
- GitHub runner name, labels, online state, and nonzero runner ID.
- Workflow run ID and job ID.
- Step names, conclusions, sentinel exit code, and retrievable logs.
- Artifact ID/name and successful retrieval.
- Independent reviewer verification.
- Any failure reason, without secrets.

## Stop conditions

Stop and leave the release blocked if the runner cannot be assigned, logs are missing, the evidence does not correlate to the tested commit, the staging approval variable or credentials are unverified, or any acceptance predicate is false. Never merge or promote as a workaround.
