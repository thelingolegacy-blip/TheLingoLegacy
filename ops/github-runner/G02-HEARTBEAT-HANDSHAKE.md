# G02 heartbeat and handshake verification

This probe is intentionally non-destructive. It records a UTC heartbeat, host identity, runner-process/service visibility, HTTPS/TLS timing for `api.github.com` and `github.com`, and a SHA-256 sidecar. It does **not** reset, restart, re-register, delete, or restore any runner.

## Run on the intended Linux x64 host

From the repository root:

```bash
bash ops/github-runner/g02-heartbeat-handshake.sh capture /tmp/g02-heartbeat.txt
capture_rc=$?
echo "HEARTBEAT_CAPTURE_EXIT_CODE=$capture_rc"

bash ops/github-runner/g02-heartbeat-handshake.sh verify \
  /tmp/g02-heartbeat.txt /tmp/g02-heartbeat.txt.sha256
verify_rc=$?
echo "HEARTBEAT_VERIFY_EXIT_CODE=$verify_rc"

cat /tmp/g02-heartbeat.txt
cat /tmp/g02-heartbeat.txt.sha256
```

Review the output before sharing. Do not share tokens, runner credentials, `.env` files, or raw runner logs. The report and checksum are created with restrictive permissions where supported.

## Reset / restore governance

`reset-plan` and `restore-plan` only print gated plans. They do not execute changes. Do not restart, reset, re-register, or restore the runner until the actual host report, runner inventory, job assignment data, and diagnostic logs have been correlated and independently reviewed.

## Interpretation limits

- A heartbeat proves only that this script ran on the machine where it was executed at the capture time.
- Successful HTTPS/TLS probes prove general network reachability to those hosts from that machine. They do **not** prove the GitHub Actions runner daemon is polling, that the repository permits runner assignment, or that a workflow job was assigned.
- SHA-256 detects report changes relative to the captured sidecar; it does not independently authenticate the source host or prove the report is complete.
- G02 remains blocked until the real matching runner is assigned, its job steps execute, logs/artifacts are retrievable, and the evidence is independently verified.
