# G02 Administrative Controls and Evidence Procedure

## Immutable control state

| Control | Required state |
|---|---|
| G02 | BLOCKED until independently verified |
| Production | HOLD |
| Fail-closed | ACTIVE |
| Last Known Good (LKG) | PROTECTED |
| Promotion / activation | BLOCKED |

## Required evidence classes
- Repository/effective Actions policy, including selected-action restrictions where applicable.
- Runner inventory: positive runner ID, exact name, status, labels, group and repository association.
- Runner host: UTC timestamp, hostname, OS/kernel/architecture, exact service unit/status, relevant journal output.
- Dispatch: run ID/attempt, commit, job ID, runner ID/name, instantiated steps, sentinel execution and retrievable logs.
- Integrity: SHA-256 per evidence file, source provenance, capture timestamp, collector and reviewer.
- Governance: administrator authority, branch/review policy evidence and explicit acceptance record.

## Capture from a trusted administrator session

```bash
set -euo pipefail
umask 077
mkdir -p g02-admin-capture
date -u +%Y-%m-%dT%H:%M:%SZ > g02-admin-capture/captured-at-utc.txt
gh auth status > g02-admin-capture/gh-auth-status.txt 2>&1
gh api repos/thelingolegacy-blip/TheLingoLegacy/actions/permissions > g02-admin-capture/repository-actions-permissions.json
gh api 'repos/thelingolegacy-blip/TheLingoLegacy/actions/runners?per_page=100' > g02-admin-capture/repository-runners.json
gh api 'repos/thelingolegacy-blip/TheLingoLegacy/actions/workflows/g02-aws-sentinel.yml/runs?per_page=10' > g02-admin-capture/g02-sentinel-runs.json
# Replace RUN_ID with the run under review.
gh api "repos/thelingolegacy-blip/TheLingoLegacy/actions/runs/RUN_ID/jobs?per_page=100" > g02-admin-capture/run-jobs.json
find g02-admin-capture -type f ! -name SHA256SUMS.txt -print0 | sort -z | xargs -0 sha256sum > g02-admin-capture/SHA256SUMS.txt
```

If selected-actions policy is enabled, capture the selected-actions endpoint when available. Capture effective organization/enterprise policy from the governing administrator surface if applicable. A denied endpoint is an evidence gap, not permission to infer a value.

## Read-only runner-host capture

```bash
date -u
hostname
uname -srmo
systemctl list-units --type=service 'actions.runner*' --all --no-pager
systemctl status '<EXACT_RUNNER_SERVICE_UNIT>' --no-pager
sudo journalctl -u '<EXACT_RUNNER_SERVICE_UNIT>' --since '24 hours ago' --no-pager
```

Use the exact service unit returned by the listing. Do not restart, unregister, reconfigure, or relabel the runner during capture. Keep raw logs in a controlled store and redact credentials.

## G02 acceptance predicate
All must be independently evidenced:
- Positive runner ID and job ID; runner name exactly `lingo-legacy-g02`; Linux/X64 and canonical labels present.
- Steps instantiated; sentinel actually executed; logs retrievable and consistent with run, attempt, commit and runner.
- Authoritative policy and runner inventory captured; host evidence fresh and traceable.
- Every evidence file's SHA-256 verified; independent reviewer explicitly records ACCEPTED.
- No unresolved policy, security, access, or governance blocker.

Startup failure, empty jobs/artifacts, inaccessible endpoints, missing host logs, or unreviewed evidence is BLOCKED. The validator is structural assistance only; it cannot authenticate evidence or authorize promotion. Any future transition requires a separate explicit human authorization after all gate requirements pass.
