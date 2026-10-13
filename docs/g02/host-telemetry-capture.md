# G02 Linux host telemetry capture

## Purpose
Collect a minimal, read-only host report to distinguish an absent/non-running runner from a runner process or service that is present but not visibly connected to GitHub. This report does not establish G02 acceptance by itself.

## Run on the authorized Linux runner host
From a trusted checkout of the recovery branch, run:

```bash
bash ops/g02/capture-host-telemetry.sh
```

The script writes a report under `/tmp/lingo-g02-host-telemetry-<UTC timestamp>.txt`, sets restrictive file permissions, and prints the report path and SHA-256. To choose a specific report path:

```bash
bash ops/g02/capture-host-telemetry.sh /tmp/lingo-g02-host-telemetry.txt
```

Then inspect the report before sharing:

```bash
cat /tmp/lingo-g02-host-telemetry.txt
sha256sum /tmp/lingo-g02-host-telemetry.txt
```

## Data minimization
The script intentionally does not print runner credentials, tokens, environment variables, full process arguments, or raw diagnostic log lines. It reports only host/kernel identity, runner config-file presence, runner process names/times, runner service names/states, counts of selected connection/error signals from runner diagnostic logs, and a basic HTTPS connectivity status.

Still review the output before sharing. Redact any organization, host, or infrastructure details you do not want to disclose. Do not upload `.runner`, `.credentials`, `.credentials_rsaparams`, runner tokens, or raw diagnostic logs.

## Acceptance boundary
A report showing a runner process or a “Connected to GitHub” signal is diagnostic evidence, not proof of assignment. G02 remains blocked until the authoritative GitHub job has runner ID > 0, the expected runner name, an assigned job, instantiated steps, sentinel exit code 0, retrievable raw logs/artifacts, and independently correlated evidence satisfying P1–P9. If the runner is absent or not connected, use the report to choose the next diagnosis; do not blindly restart or re-register it.
