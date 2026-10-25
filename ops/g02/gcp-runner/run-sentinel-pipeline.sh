#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

# LINGO Legacy G02 orchestration. This script never merges code or clears production hold.
# Infrastructure creation is gated by APPLY_INFRA=1 and an interactive confirmation.
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel 2>/dev/null)" || REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
TF_DIR="$SCRIPT_DIR"
REPO="${GH_REPO:-thelingolegacy-blip/TheLingoLegacy}"
GIT_REF="${G02_GIT_REF:-infra/gcp-self-hosted-runner-g02-2026-10-24}"
PROJECT_ID="${GCP_PROJECT_ID:-}"
REGION="${GCP_REGION:-us-east1}"
ZONE="${GCP_ZONE:-us-east1-b}"
RUNNER_NAME="lingo-legacy-g02"
WORKFLOW="runner-dispatch-diagnostic.yml"
INCIDENT_REFERENCE="${INCIDENT_REFERENCE:-}"
EVIDENCE_DIR="${EVIDENCE_DIR:-$REPO_ROOT/evidence_g02_$(date -u +%Y%m%dT%H%M%SZ)}"

die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
note() { printf '\n[%s] %s\n' "$(date -u +%FT%TZ)" "$*"; }
need() { command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"; }

for cmd in terraform gcloud gh jq curl; do need "$cmd"; done
[[ -n "$PROJECT_ID" ]] || die "Set GCP_PROJECT_ID to the real Google Cloud project ID; placeholder project IDs are not accepted."
[[ "$REPO" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]] || die "GH_REPO must be owner/repository."
[[ -n "$INCIDENT_REFERENCE" ]] || die "Set INCIDENT_REFERENCE to the approved recovery ticket/checkpoint."
[[ "$GIT_REF" == "infra/gcp-self-hosted-runner-g02-2026-10-24" ]] || die "This workflow branch must be reviewed and explicitly updated in the script before use."
mkdir -p "$EVIDENCE_DIR"
chmod 700 "$EVIDENCE_DIR"
printf 'project_id=%s\nregion=%s\nzone=%s\nrepository=%s\nref=%s\nincident_reference=%s\nstarted_utc=%s\n' \
  "$PROJECT_ID" "$REGION" "$ZONE" "$REPO" "$GIT_REF" "$INCIDENT_REFERENCE" "$(date -u +%FT%TZ)" > "$EVIDENCE_DIR/00_context.txt"

note "Checking local identity and target project"
gcloud auth list --filter=status:ACTIVE --format='value(account)' | tee "$EVIDENCE_DIR/00_gcloud_identity.txt"
gcloud config set project "$PROJECT_ID" >/dev/null
gcloud projects describe "$PROJECT_ID" --format=json > "$EVIDENCE_DIR/00_project.json"
gh auth status > "$EVIDENCE_DIR/00_github_auth.txt" 2>&1 || die "GitHub CLI authentication is unavailable."

# Provisioning is blocked unless the workflow on the DEFAULT branch accepts the
# required inputs and routes only to the dedicated lingo-g02 runner. GitHub
# dispatch uses the default-branch workflow definition even when --ref selects
# a feature branch. A branch-only workflow edit is not enough for safe dispatch.
if [[ "${APPLY_INFRA:-0}" == "1" ]]; then
  note "Checking default-branch sentinel compatibility before any cloud mutation"
  if ! gh api "repos/$REPO/contents/.github/workflows/$WORKFLOW?ref=main" > "$EVIDENCE_DIR/00_default_branch_workflow.json"; then
    die "Cannot read the sentinel workflow from main; refusing cloud provisioning."
  fi
  if ! jq -e '.content' "$EVIDENCE_DIR/00_default_branch_workflow.json" >/dev/null; then
    die "Default-branch workflow content unavailable; refusing cloud provisioning."
  fi
  MAIN_WORKFLOW="$(jq -r '.content' "$EVIDENCE_DIR/00_default_branch_workflow.json" | base64 -d)"
  if ! grep -q 'incident_reference:' <<<"$MAIN_WORKFLOW" ||
     ! grep -q 'confirm_runner:' <<<"$MAIN_WORKFLOW" ||
     ! grep -q 'lingo-g02' <<<"$MAIN_WORKFLOW" ||
     ! grep -q 'lingo-legacy-g02' <<<"$MAIN_WORKFLOW"; then
    printf '%s\n' "$MAIN_WORKFLOW" > "$EVIDENCE_DIR/00_default_branch_workflow_incompatible.yml"
    die "The sentinel workflow on main does not yet match the required incident inputs and dedicated runner identity. Review and merge the workflow change through normal governance before provisioning; no cloud resources were changed."
  fi
fi

note "Terraform formatting, initialization, and validation"
terraform -chdir="$TF_DIR" fmt -check -recursive | tee "$EVIDENCE_DIR/01_terraform_fmt.txt"
terraform -chdir="$TF_DIR" init -input=false -no-color | tee "$EVIDENCE_DIR/01_terraform_init.log"
terraform -chdir="$TF_DIR" validate -no-color | tee "$EVIDENCE_DIR/01_terraform_validate.txt"

note "Creating a plan for the specified project"
terraform -chdir="$TF_DIR" plan -input=false -no-color \
  -var="project_id=$PROJECT_ID" -var="region=$REGION" -var="zone=$ZONE" \
  -var="admin_ssh_cidr=" -out="$EVIDENCE_DIR/g02.tfplan" | tee "$EVIDENCE_DIR/02_terraform_plan.log"
terraform -chdir="$TF_DIR" show -no-color "$EVIDENCE_DIR/g02.tfplan" > "$EVIDENCE_DIR/02_terraform_plan_review.txt"

if [[ "${APPLY_INFRA:-0}" != "1" ]]; then
  note "PLAN ONLY: Terraform validation and plan completed. No cloud resources were changed."
  printf 'Review %s, then rerun with APPLY_INFRA=1 to request provisioning.\n' "$EVIDENCE_DIR/02_terraform_plan_review.txt"
  exit 0
fi

printf '\nReview the plan at: %s\n' "$EVIDENCE_DIR/02_terraform_plan_review.txt"
printf 'Type exactly APPLY G02 to create the VM, VPC, firewall, and reserved external IP in project %s: ' "$PROJECT_ID"
read -r approval
[[ "$approval" == "APPLY G02" ]] || die "Provisioning not approved; no apply was performed."

note "Applying the reviewed Terraform plan"
terraform -chdir="$TF_DIR" apply -input=false -no-color "$EVIDENCE_DIR/g02.tfplan" | tee "$EVIDENCE_DIR/03_terraform_apply.log"
terraform -chdir="$TF_DIR" output -json > "$EVIDENCE_DIR/03_terraform_outputs.json"
VM_NAME="$(terraform -chdir="$TF_DIR" output -raw instance_name)"
VM_IP="$(terraform -chdir="$TF_DIR" output -raw external_ip)"
VM_ZONE="$(terraform -chdir="$TF_DIR" output -raw zone)"
[[ -n "$VM_NAME" && -n "$VM_IP" && -n "$VM_ZONE" ]] || die "Terraform outputs did not include instance_name, external_ip, and zone."
printf 'vm_name=%s\nexternal_ip=%s\nzone=%s\n' "$VM_NAME" "$VM_IP" "$VM_ZONE" > "$EVIDENCE_DIR/03_vm_address.txt"
note "VM provisioned with reserved external IP $VM_IP. SSH remains IAP-only unless explicitly changed in Terraform."

note "Checking IAP SSH and bootstrap status"
# This is a connectivity check only; it does not install or register a runner.
gcloud compute ssh "$VM_NAME" --project="$PROJECT_ID" --zone="$VM_ZONE" --tunnel-through-iap \
  --quiet --command='hostname -f; test -r /var/log/lingo-g02/bootstrap-status.txt && sudo cat /var/log/lingo-g02/bootstrap-status.txt' \
  2>&1 | tee "$EVIDENCE_DIR/04_iap_ssh_bootstrap.log"

note "Runner enrollment must be performed with the repository's reviewed registration script"
printf '%s\n' \
  "Next, securely copy ops/g02/gcp-runner/register-runner.sh to the VM and run it as a sudo-capable administrator." \
  "Generate a short-lived token in GitHub Settings > Actions > Runners immediately before enrollment." \
  "Do not put the token in command arguments, shell history, logs, metadata, or this evidence directory." \
  "The script will not fetch or embed the token automatically." | tee "$EVIDENCE_DIR/05_enrollment_instructions.txt"

if [[ "${AUTO_ENROLL:-0}" != "1" ]]; then
  note "STOPPING before enrollment. Set AUTO_ENROLL=1 only after reviewing the enrollment instructions and confirming interactive SSH access."
  exit 0
fi

# Interactive enrollment avoids putting the ephemeral registration token in process arguments/logs.
gcloud compute scp "$SCRIPT_DIR/register-runner.sh" "$VM_NAME:/tmp/lingo-register-runner.sh" \
  --project="$PROJECT_ID" --zone="$VM_ZONE" --tunnel-through-iap --quiet
gcloud compute ssh "$VM_NAME" --project="$PROJECT_ID" --zone="$VM_ZONE" --tunnel-through-iap \
  --command='chmod 700 /tmp/lingo-register-runner.sh && /tmp/lingo-register-runner.sh' -- -t \
  2>&1 | tee "$EVIDENCE_DIR/05_runner_enrollment.log"

note "Waiting for GitHub to report the dedicated runner online"
online=0
for attempt in $(seq 1 20); do
  gh api "repos/$REPO/actions/runners?per_page=100" > "$EVIDENCE_DIR/06_runners_latest.json"
  if jq -e --arg name "$RUNNER_NAME" '.runners[]? | select(.name == $name and .status == "online")' \
      "$EVIDENCE_DIR/06_runners_latest.json" > "$EVIDENCE_DIR/06_runner_online.json"; then
    online=1
    break
  fi
  sleep 6
done
[[ "$online" == "1" ]] || die "GitHub did not report $RUNNER_NAME online within the retry window. Production hold remains."

note "Dispatching the repository's manual G02 sentinel"
gh workflow run "$WORKFLOW" --repo "$REPO" --ref "$GIT_REF" \
  -f "incident_reference=$INCIDENT_REFERENCE" -f "confirm_runner=true"
sleep 5
RUN_ID="$(gh run list --repo "$REPO" --workflow "$WORKFLOW" --branch "$GIT_REF" --event workflow_dispatch \
  --limit 10 --json databaseId,headBranch,event,status,createdAt \
  --jq 'map(select(.headBranch == "'"$GIT_REF"'" and .event == "workflow_dispatch")) | sort_by(.createdAt) | last | .databaseId // empty')"
[[ -n "$RUN_ID" ]] || die "Could not identify the dispatched workflow run. Production hold remains."
printf 'workflow_run_id=%s\n' "$RUN_ID" > "$EVIDENCE_DIR/07_workflow_run.txt"
# Preserve logs and artifacts even when the sentinel fails.
watch_status=0
gh run watch "$RUN_ID" --repo "$REPO" --exit-status 2>&1 | tee "$EVIDENCE_DIR/07_sentinel_watch.log" || watch_status=$?
gh run view "$RUN_ID" --repo "$REPO" --json databaseId,url,headBranch,status,conclusion,jobs,event,createdAt,updatedAt \
  > "$EVIDENCE_DIR/07_sentinel_run.json"
gh run view "$RUN_ID" --repo "$REPO" --log > "$EVIDENCE_DIR/07_sentinel_job_logs.txt"
gh run download "$RUN_ID" --repo "$REPO" --dir "$EVIDENCE_DIR/08_artifacts" 2>&1 | tee "$EVIDENCE_DIR/08_artifact_download.log"

CONCLUSION="$(jq -r '.conclusion // "unknown"' "$EVIDENCE_DIR/07_sentinel_run.json")"
if [[ "$CONCLUSION" != "success" || "$watch_status" != "0" ]]; then
  die "Sentinel conclusion is '$CONCLUSION' (watch exit $watch_status). G02 remains blocked; production hold is unchanged."
fi
grep -q 'RUNNER_EXECUTION_SENTINEL=PASS' "$EVIDENCE_DIR/07_sentinel_job_logs.txt" || \
  die "Sentinel PASS marker was not found in job logs. G02 remains blocked."

sha256sum "$EVIDENCE_DIR/07_sentinel_run.json" "$EVIDENCE_DIR/07_sentinel_job_logs.txt" > "$EVIDENCE_DIR/09_evidence_sha256.txt"
printf 'result=G02_SENTINEL_EXECUTED_SUCCESSFULLY\nproduction_hold=REMAINS_IN_FORCE_PENDING_INDEPENDENT_GATE_REVIEW\nrun_id=%s\nrun_url=%s\n' \
  "$RUN_ID" "$(jq -r '.url // ""' "$EVIDENCE_DIR/07_sentinel_run.json")" > "$EVIDENCE_DIR/FINAL_STATUS.txt"
note "Sentinel succeeded and evidence was collected. This script does not merge, deploy, authorize promotion, or clear production hold."
printf 'Evidence directory: %s\n' "$EVIDENCE_DIR"
