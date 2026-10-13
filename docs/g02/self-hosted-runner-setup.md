# G02 Self-Hosted Runner Setup, Timer, Diagnostics, and Evidence Packets

## Operating boundary

This setup is isolated to the recovery branch and is not production authorization. Do not merge, promote, or activate production from this runbook. The scheduled diagnostic workflow is read-only: it inspects the latest qualified-probe run, records job assignment telemetry, hashes its JSON/text outputs, and uploads a seven-day artifact. It does not dispatch a sentinel, register/restart a runner, read secrets, or change settings.

The timer workflow is defined at `.github/workflows/g02-timer-diagnostics.yml`. GitHub scheduled workflows run from the default branch, so this timer will not become active until the workflow has passed normal review and is present on the default branch. It is not active merely because the file exists on this recovery branch.

## 1. Create/register the runner on the intended Linux host

1. In the repository, open **Settings → Actions → Runners → New self-hosted runner**.
2. Select **Linux** and **x64**. Follow GitHub's current on-screen download and configuration instructions for the intended host.
3. Use the canonical runner name `lingo-legacy-g02` and labels `self-hosted`, `linux`, `x64`, and `lingo-g02`.
4. Use the short-lived registration command/token directly in the trusted host terminal. Never paste the token into ChatGPT, logs, PRs, packet files, or shell history shared with others.
5. From the runner installation directory, verify the service instructions shown by GitHub. Only install/start the service after the operator confirms the host and authorization scope. Do not blindly register a duplicate runner or restart a service to mask a dispatch failure.

## 2. Collect Packet A — host/runner evidence

From the repository root on that host:

```bash
bash ops/g02/capture-host-telemetry.sh /tmp/lingo-g02-host-telemetry.txt
rc=$?
echo "TELEMETRY_CAPTURE_EXIT=$rc"
cat /tmp/lingo-g02-host-telemetry.txt
sha256sum /tmp/lingo-g02-host-telemetry.txt
```

Review/redact before sharing. Packet A at `docs/g02/packet-a-host-runner.json` is a template only. Populate a separate evidence copy using observed values; do not overwrite the template, invent unknown values, or include runner credentials/raw logs.

## 3. Trigger and timer behavior

- The timer workflow checks GitHub-side state hourly using `ubuntu-latest`; it does not require the self-hosted runner to be available.
- Manual `workflow_dispatch` is available as an operator-invoked diagnostic after the workflow exists on the default branch.
- The timer cannot make G02 pass. An assigned-success candidate is still blocked pending raw job logs, a retrievable artifact, host evidence, and independent correlation.
- The timer does not dispatch `g02-qualified-evidence-probe.yml` and does not automatically retry failed jobs.
- No scheduled acceptance, promotion, deployment, or activation is permitted.

## 4. Packet B — sentinel execution evidence

Packet B at `docs/g02/packet-b-sentinel-execution.json` is also a template only. Populate a separate evidence copy from the authoritative GitHub run/job response after a real sentinel executes. Required fields include run ID/attempt, job ID, commit SHA, runner ID/name, assigned status, instantiated steps, UTC start/completion, exit code 0, raw-log SHA-256/reference, artifact reference, and redaction/independent-review results.

## 5. Acceptance gate

Run the validator only against collected packet copies:

```bash
node ops/g02/validate-evidence-packets.mjs /path/to/packet-a-evidence.json /path/to/packet-b-evidence.json
```

A nonzero exit is a block, not an invitation to edit values until it passes. P1–P9 must all be supported by real evidence, hashes, and independent verification. The validator's PASS only qualifies evidence for separate governance review; it does not authorize a merge, deployment, or production activation.

## 6. Recovery checklist

- [ ] Actual host report and SHA-256 received and verified.
- [ ] Runner identity/name and labels observed on the host and in GitHub.
- [ ] GitHub job has runner ID > 0 and name `lingo-legacy-g02`.
- [ ] Steps instantiated and sentinel exits 0.
- [ ] Raw logs retrievable and hashed.
- [ ] Artifact retrievable and manifest hashed.
- [ ] Packet A and Packet B share a correlation ID and match repository/run/job/commit/runner/time.
- [ ] Redaction reviewed and independent verifier accepts evidence.
- [ ] G02 accepted through normal governance; G03–G12 remain blocked until their own evidence is accepted.
