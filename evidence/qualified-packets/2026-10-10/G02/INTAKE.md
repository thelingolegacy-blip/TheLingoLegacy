# G02 Evidence Intake — Host + GitHub Job

## What is available now
The linked observation file records two real connector-retrieved GitHub job records with failure, null steps, null log URL, and no listed artifacts. No host output, current runner inventory, raw logs, or sentinel artifact has been captured in this packet.

## Capture host telemetry
On the authorized Linux host, from the repository root, run the read-only collector from this branch:

```bash
bash ops/estate/diagnostics/capture-g02-host-evidence.sh
rc=$?
echo "G02_HOST_CAPTURE_CALLER_EXIT_CODE=$rc"
```

The script writes `runner-context.txt`, `host-checks.txt`, `sentinel-result.txt` explicitly marked NOT CAPTURED, and `SHA256SUMS` to a timestamped output folder. It does not start/stop services or read runner credentials. It may return nonzero if checks fail; preserve the real exit code and output. Do not replace missing values with guesses.

## Capture runner inventory separately
In GitHub repository Settings → Actions → Runners, capture the actual row for `lingo-legacy-g02`: ID, name, status, group, labels, last check-in. In Settings → Actions → General, capture applicable Actions permissions and hosted/self-hosted restrictions. Redact secrets and unrelated personal data.

## Sentinel proof is separate
Do not fabricate a sentinel result from host status. A valid sentinel must come from a real GitHub Actions job assigned to the exact runner labels `self-hosted`, `linux`, `x64`, `lingo-g02`. Preserve run ID, job ID, commit SHA, runner ID/name, instantiated steps, sentinel exit code, retrievable raw logs, artifact ID/download, and SHA-256. An independent reviewer must correlate these identifiers.

## Acceptance
Host capture PASS is not G02 PASS. G02 requires all predicates and independent evidence verification. No runner registration changes, service restarts, credential resets, merge, deploy, activation, or promotion are authorized by this intake procedure.
