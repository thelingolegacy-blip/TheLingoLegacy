#!/usr/bin/env bash
set -euo pipefail

# G02 external evidence assistant.
# Run on the real lingo-g02 host AFTER GitHub assigns and completes the sentinel.
# This collector does not establish G02 authority; it only gathers independently
# retrievable execution evidence for later verification.

REPO="${GITHUB_REPOSITORY:-thelingolegacy-blip/TheLingoLegacy}"
RUN_ID="${1:-${G02_RUN_ID:-}}"
OUT="${2:-g02-external-evidence-${RUN_ID:-unknown}}"

if [[ -z "$RUN_ID" ]]; then
  echo "ERROR: supply a completed G02 workflow run ID: $0 <run-id> [output-dir]" >&2
  exit 2
fi

command -v gh >/dev/null || { echo "ERROR: gh CLI is required" >&2; exit 2; }
gh auth status >/dev/null 2>&1 || { echo "ERROR: gh is not authenticated" >&2; exit 2; }

mkdir -p "$OUT"
{
  echo "EVIDENCE_ASSIST_VERSION=1"
  echo "REPOSITORY=$REPO"
  echo "RUN_ID=$RUN_ID"
  echo "COLLECTED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "PRODUCTION_AUTHORITY=NONE"
} > "$OUT/collection-status.txt"

# Capture run metadata and the latest-attempt job payload.
gh api "repos/$REPO/actions/runs/$RUN_ID" > "$OUT/run.json"
gh api "repos/$REPO/actions/runs/$RUN_ID/jobs?filter=latest&per_page=100" > "$OUT/jobs.json"

JOB_ID="$(python3 - "$OUT/jobs.json" <<'PY'
import json, sys
data=json.load(open(sys.argv[1], encoding="utf-8"))
jobs=data.get("jobs", [])
g02=[j for j in jobs if "G02" in (j.get("name") or "").upper()]
if not g02:
    print("")
else:
    print(g02[0].get("id",""))
PY
)"

if [[ -z "$JOB_ID" ]]; then
  echo "JOB_ASSIGNMENT=NOT_FOUND" >> "$OUT/collection-status.txt"
  echo "P8_LOGS_RETRIEVABLE=NOT_ESTABLISHED" >> "$OUT/collection-status.txt"
  echo "P9_INDEPENDENT_VERIFICATION=REQUIRED" >> "$OUT/collection-status.txt"
  exit 3
fi

gh api "repos/$REPO/actions/jobs/$JOB_ID" > "$OUT/job.json"

python3 - "$OUT/job.json" "$OUT/collection-status.txt" <<'PY'
import json, sys
job=json.load(open(sys.argv[1], encoding="utf-8"))
with open(sys.argv[2], "a", encoding="utf-8") as f:
    f.write(f"JOB_ID={job.get('id','')}\n")
    f.write(f"JOB_STATUS={job.get('status','')}\n")
    f.write(f"JOB_CONCLUSION={job.get('conclusion','')}\n")
    f.write(f"RUNNER_ID={job.get('runner_id','')}\n")
    f.write(f"RUNNER_NAME={job.get('runner_name','')}\n")
    f.write(f"RUNNER_LABELS={','.join(job.get('labels') or [])}\n")
    f.write(f"STEPS_COUNT={len(job.get('steps') or [])}\n")
PY

# Preserve exact step summaries as independent evidence.
python3 - "$OUT/job.json" "$OUT/steps.json" <<'PY'
import json,sys
job=json.load(open(sys.argv[1],encoding="utf-8"))
json.dump(job.get("steps") or [],open(sys.argv[2],"w",encoding="utf-8"),indent=2)
PY

# GitHub log retrieval is intentionally attempted separately.
if gh run view "$RUN_ID" --repo "$REPO" --log > "$OUT/github-run.log" 2> "$OUT/github-run-log-error.txt"; then
  echo "P8_LOGS_RETRIEVABLE=TRUE" >> "$OUT/collection-status.txt"
else
  echo "P8_LOGS_RETRIEVABLE=FALSE" >> "$OUT/collection-status.txt"
fi

# Capture available artifacts; do not treat artifact presence as authority.
gh api "repos/$REPO/actions/runs/$RUN_ID/artifacts?per_page=100" > "$OUT/artifacts.json"

# Attempt to download the sentinel artifact if present.
if gh run download "$RUN_ID" --repo "$REPO" --name "g02-executing-runner-evidence-$RUN_ID" --dir "$OUT/artifact" 2> "$OUT/artifact-download-error.txt"; then
  echo "G02_ARTIFACT_RETRIEVED=TRUE" >> "$OUT/collection-status.txt"
else
  echo "G02_ARTIFACT_RETRIEVED=FALSE" >> "$OUT/collection-status.txt"
fi

echo "P9_INDEPENDENT_VERIFICATION=REQUIRED" >> "$OUT/collection-status.txt"
echo "G02_ACCEPTANCE=NOT_ESTABLISHED_BY_COLLECTOR" >> "$OUT/collection-status.txt"
echo "PRODUCTION_AUTHORITY=NONE" >> "$OUT/collection-status.txt"

echo "Evidence collection written to: $OUT"
