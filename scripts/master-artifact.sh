#!/usr/bin/env bash
# =============================================================================
# LINGO Legacy — Master Artifact Generator
# Purpose : Create a dated, inspectable, checksummed evidence package for #612.
# Safety  : Local/read-only evidence capture. No network, secrets, G02, merges,
#           deployments, DNS/Worker/Firebase/payment/provider mutations.
# Usage   : chmod +x scripts/master-artifact.sh && ./scripts/master-artifact.sh
#
# A successful exit means package integrity passed, NOT release acceptance.
# Missing or inaccessible evidence is recorded as UNVERIFIED/BLOCKED.
# =============================================================================

set -Eeuo pipefail
IFS=$'\n\t'
umask 077

readonly SCRIPT_DIR="$(cd -- "$(dirname -- "$BASH_SOURCE")" && pwd -P)"
readonly REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd -P)"
readonly TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
readonly ARTIFACT_ROOT="$REPO_ROOT/artifacts"
readonly ARTIFACT_DIR="$ARTIFACT_ROOT/master-$TIMESTAMP"
readonly MANIFEST="$ARTIFACT_DIR/MANIFEST.json"
readonly CHECKSUMS="$ARTIFACT_DIR/SHA256SUMS"
readonly REPORT="$ARTIFACT_DIR/EVIDENCE-REPORT.md"

on_error() {
  local code=$?
  trap - ERR
  if [[ -d "$ARTIFACT_DIR" && ! -L "$ARTIFACT_DIR" ]]; then
    {
      printf 'generation_status=FAIL\n'
      printf 'exit_code=%s\n' "$code"
      printf 'failed_at_utc=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
      printf 'note=Partial package; MUST NOT be treated as complete evidence.\n'
    } > "$ARTIFACT_DIR/GENERATION-FAILED.txt" 2>/dev/null || true
  fi
  printf '\nERROR: artifact generation failed (exit %s). Partial output is not accepted.\n' "$code" >&2
  exit "$code"
}
trap on_error ERR

die() { printf 'FATAL: %s\n' "$*" >&2; exit 1; }
require_command() { command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"; }

for command_name in git python3 sha256sum find sort wc tr date; do
  require_command "$command_name"
done

[[ -d "$REPO_ROOT/.git" || -f "$REPO_ROOT/.git" ]] || die "Script is not inside a Git worktree."
[[ "$(git -C "$REPO_ROOT" rev-parse --show-toplevel)" == "$REPO_ROOT" ]] || die "Git root does not match script repository root."
[[ -n "$(git -C "$REPO_ROOT" rev-parse --verify HEAD 2>/dev/null)" ]] || die "Cannot resolve repository HEAD."
[[ ! -L "$ARTIFACT_ROOT" ]] || die "Refusing symlinked artifacts directory."
mkdir -p -- "$ARTIFACT_ROOT"
[[ ! -e "$ARTIFACT_DIR" ]] || die "Refusing to overwrite existing artifact directory: $ARTIFACT_DIR"
mkdir -- "$ARTIFACT_DIR"

printf '=== LINGO Master Artifact Generator ===\n'
printf 'Timestamp : %s\nOutput    : %s\n\n' "$TIMESTAMP" "$ARTIFACT_DIR"
cd -- "$REPO_ROOT"

# 1. Repository baseline — local Git reads only.
printf '[1/9] Capturing repository baseline...\n'
HEAD_SHA="$(git rev-parse HEAD)"
BRANCH_NAME="$(git rev-parse --abbrev-ref HEAD)"
DIRTY_COUNT="$(git status --porcelain=v1 --untracked-files=all -- . ":(exclude)artifacts/master-$TIMESTAMP" | wc -l | tr -d ' ')"
ORIGIN_RAW="$(git remote get-url origin 2>/dev/null || true)"
ORIGIN_SAFE="$(python3 - "$ORIGIN_RAW" <<'PY'
import re, sys
value = sys.argv[1].strip()
if not value:
    print("UNAVAILABLE")
elif re.match(r"^[A-Za-z][A-Za-z0-9+.-]*://", value):
    value = re.sub(r"^([A-Za-z][A-Za-z0-9+.-]*://)[^/@]+@", r"\1[REDACTED]@", value)
    print(value.split("?", 1)[0].split("#", 1)[0])
elif re.match(r"^[^@]+@[^:]+:.+$", value):
    print("[REDACTED]@" + value.split("@", 1)[1])
else:
    print(value.split("?", 1)[0].split("#", 1)[0])
PY
)"
{
  printf '# Repository Baseline\n\n'
  printf -- '- Generated UTC: %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf -- '- Repository root: %s\n' "$REPO_ROOT"
  printf -- '- Origin (credentials/query redacted): %s\n' "$ORIGIN_SAFE"
  printf -- '- Branch: %s\n' "$BRANCH_NAME"
  printf -- '- HEAD: %s\n' "$HEAD_SHA"
  printf -- '- Dirty worktree entries: %s\n' "$DIRTY_COUNT"
  printf -- '- Capture mode: local Git read-only; no remote requests\n\n'
  if [[ "$DIRTY_COUNT" -eq 0 ]]; then
    printf 'Worktree disposition: CLEAN at capture time.\n'
  else
    printf 'Worktree disposition: DIRTY; inspect git-status.porcelain.\n'
  fi
} > "$ARTIFACT_DIR/01-baseline.txt"
printf '%s\n' "$HEAD_SHA" > "$ARTIFACT_DIR/HEAD.sha"
git status --porcelain=v1 --untracked-files=all -- . ":(exclude)artifacts/master-$TIMESTAMP" > "$ARTIFACT_DIR/git-status.porcelain"
git log -5 --date=iso-strict --format='%H %ad %s' > "$ARTIFACT_DIR/git-log-recent.txt"

# 2. PR inventory seed — explicitly not a live GitHub query.
printf '[2/9] Recording recovery PR inventory seed...\n'
cat > "$ARTIFACT_DIR/02-recovery-prs.md" <<'EOF'
# Recovery / Implementation PR Inventory Seed

This is a seed list from the #612 workstream, NOT a live GitHub status query.
Every PR state is UNVERIFIED by this local-only generator. Reconcile against
GitHub before making decisions.

| PR | Workstream | Required disposition |
|---:|---|---|
| 611 | Fail-closed LINGO dispatch contract | Draft/review/hosted CI evidence required |
| 613 | Hosted Actions probe + Flutter API 21 | Reconcile; no execution assumed |
| 614 | Firebase Hosting quarantine boundary | Reconcile; no publication assumed |
| 615 | Infrastructure reconciliation/orchestrator | Preserve draft; isolated-host controls required |
| 616 | That’s My Lingo preview alignment | Reconcile; no product acceptance assumed |
| 617 | Release governance preview | Reconcile; no release authority implied |
| 618 | GitHub-hosted Actions canary | Reconcile; no successful run assumed |
| 619 | Master recovery audit | Preserve evidence and review history |

No merge, close, retarget, branch deletion, or workflow dispatch is performed.
Source presence, draft status, mergeability, or an issue comment is not runtime
acceptance.
EOF

# 3. Safety controls.
printf '[3/9] Writing safety controls...\n'
cat > "$ARTIFACT_DIR/03-safety-controls.md" <<'EOF'
# Non-Negotiable Safety Controls

- Production: PROTECTED HOLD.
- G02: FAIL / UNVERIFIED; no runner registration, activation, or dispatch.
- G03–G11: BLOCKED / HELD pending their own prerequisites and evidence.
- No merges, force-pushes, branch deletion, or protected-baseline replacement.
- No production deployments, DNS edits, Cloudflare Worker/route changes, or Pages publication.
- No Firebase production selection, credentials, migrations, or publication.
- No payment, checkout, cashout, real-value reward, or commerce activation.
- No secrets, tokens, private keys, or credential-bearing URLs in evidence.
- No paid provisioning, billing changes, or unapproved spend.
- No provider API calls or network requests are made by this generator.
- The canary is a template, not an executed workflow or CI recovery evidence.
- Successful script exit validates package integrity only; it does not certify
  any program phase or authorize production promotion.
EOF

# 4. Hosted Actions canary template — not dispatched.
printf '[4/9] Emitting hosted Actions canary template...\n'
mkdir -- "$ARTIFACT_DIR/workflows"
cat > "$ARTIFACT_DIR/workflows/actions-startup-canary.yml" <<'EOF'
# TEMPLATE ONLY — not committed to .github/workflows and not dispatched here.
# Review/pin the upload action to a verified immutable SHA before dispatch.
name: Actions Startup Canary (GitHub-hosted only)

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  canary:
    name: GitHub-hosted evidence canary
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Collect non-sensitive runner evidence
        shell: bash
        run: |
          set -euo pipefail
          mkdir -p evidence
          {
            echo "timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
            echo "run_id=$GITHUB_RUN_ID"
            echo "run_attempt=$GITHUB_RUN_ATTEMPT"
            echo "sha=$GITHUB_SHA"
            echo "ref=$GITHUB_REF"
            echo "runner_name=$RUNNER_NAME"
            echo "runner_os=$RUNNER_OS"
            echo "runner_arch=$RUNNER_ARCH"
            grep '^PRETTY_NAME=' /etc/os-release || true
          } > evidence/runner.env
          printf 'Canary executed successfully\n' > evidence/status.txt
          sha256sum evidence/runner.env evidence/status.txt > evidence/SHA256SUMS

      # Pin to a reviewed immutable commit SHA before dispatch.
      - name: Upload evidence artifact
        uses: actions/upload-artifact@v4
        with:
          name: actions-startup-canary
          path: evidence/
          if-no-files-found: error
          retention-days: 30
EOF

# 5. Master acceptance checklist.
printf '[5/9] Writing master acceptance checklist...\n'
cat > "$ARTIFACT_DIR/04-master-checklist.md" <<'EOF'
# Master Execution Checklist — Issue #612

Status vocabulary: PASS, FAIL, UNVERIFIED, BLOCKED, NOT_AUTHORIZED.
No checkbox is checked by this generator.

## Phase 0 — Baseline and preservation
- [ ] Capture current main SHA and timestamp from GitHub.
- [ ] Inventory branches, tags, releases, workflows, environments and available metadata.
- [ ] Preserve last-known-good references and reconcile active PRs.
- [ ] Record permission gaps and unknown states.

## Phase 1 — GitHub Actions recovery
- [ ] Inspect Actions policy, hosted-runner entitlement, quota and concurrency.
- [ ] Execute an approved GitHub-hosted ubuntu-latest canary.
- [ ] Verify instantiated job, completed steps, logs and run/commit correlation.
- [ ] Download artifact and independently verify its checksum.
- [ ] Repeat successfully; keep G02 quarantined.

## Phase 2 — Governance and access
- [ ] Owner verifies App permissions, branch protection, rulesets and bypass actors.
- [ ] Verify reviews, CODEOWNERS, required checks and environment protections.
- [ ] Record effective settings and audit evidence.

## Phase 3 — PR/branch/workflow reconciliation
- [ ] Reconcile PR dependencies, duplicate work and exact candidate SHAs.
- [ ] Review #611, #592, #574, #589, #579, #602 and related work as applicable.
- [ ] Preserve draft PRs until independent review and real CI evidence exist.

## Phase 4 — Security and supply chain
- [ ] Secret/history scan; remediate through approved rotation process.
- [ ] SAST, dependency, license, SBOM, provenance and vulnerability evidence.
- [ ] Review OIDC, token permissions, authN/authZ, PII and data handling.
- [ ] Independent security review and residual-risk acceptance.

## Phase 5 — Build/publication boundaries
- [ ] Verify explicit output directories and publication allowlists.
- [ ] Verify Firebase staging identity and client configuration without fabricating values.
- [ ] Verify Cloudflare identity, route ownership, deployment provenance and rollback.
- [ ] No live provider change without separate owner authorization.

## Phase 6 — Application/product engineering
- [ ] Flagship web, CORE V2, APIs, Flutter/mobile and product realms independently built/tested.
- [ ] Browser, accessibility, API, device and integration journeys verified.
- [ ] Product-specific privacy, rights and virtual-credit controls accepted.

## Phase 7 — Data/provider integration
- [ ] Source-of-truth, schema, access and migration mapping documented.
- [ ] Sanitized migration rehearsal, reconciliation and rollback evidence.
- [ ] Provider integration independently verified; unknowns remain blocked.

## Phase 8 — Reliability/operations
- [ ] Monitoring, SLOs, alerting, backup/restore and disaster recovery demonstrated.
- [ ] Load/failure testing, incident response, cost guardrails and rollback verified.

## Phase 9 — Final acceptance/release readiness
- [ ] Commit, PR review, workflow/run/job, logs, artifacts and checksums correlated.
- [ ] Independent browser/API/device/security/accessibility acceptance recorded.
- [ ] Owner acceptance and rollback path recorded.
- [ ] Separate production promotion authorization recorded.

Production remains PROTECTED HOLD until a separate explicit release authorization.
EOF

# 6. Evidence skeleton and missing-evidence register.
printf '[6/9] Creating evidence directories and missing-evidence register...\n'
mkdir -- "$ARTIFACT_DIR/ci" "$ARTIFACT_DIR/cloudflare" "$ARTIFACT_DIR/firebase" \
  "$ARTIFACT_DIR/flutter" "$ARTIFACT_DIR/security" "$ARTIFACT_DIR/docs"

cat > "$ARTIFACT_DIR/05-acceptance-matrix.json" <<EOF
{
  "schema": "lingo-master-acceptance-v1",
  "generated_utc": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "issue": 612,
  "overall": "UNVERIFIED",
  "release_disposition": "PROTECTED HOLD",
  "g02": "FAIL / UNVERIFIED",
  "g03_g11": "BLOCKED / HELD",
  "phases": [
    {"id": 0, "name": "baseline_and_preservation", "status": "UNVERIFIED"},
    {"id": 1, "name": "github_actions_recovery", "status": "BLOCKED"},
    {"id": 2, "name": "governance_and_access", "status": "UNVERIFIED"},
    {"id": 3, "name": "pr_branch_workflow_reconciliation", "status": "UNVERIFIED"},
    {"id": 4, "name": "security_and_supply_chain", "status": "UNVERIFIED"},
    {"id": 5, "name": "build_and_publication_boundaries", "status": "UNVERIFIED"},
    {"id": 6, "name": "application_and_product_engineering", "status": "UNVERIFIED"},
    {"id": 7, "name": "data_and_provider_integration", "status": "UNVERIFIED"},
    {"id": 8, "name": "reliability_and_operations", "status": "UNVERIFIED"},
    {"id": 9, "name": "final_acceptance_and_release_readiness", "status": "NOT_AUTHORIZED"}
  ],
  "canary_template": "PRESENT_NOT_EXECUTED",
  "runtime_ci_evidence": "NOT_CAPTURED",
  "provider_inventory": "NOT_CAPTURED",
  "production_promotion": "NOT_AUTHORIZED"
}
EOF

cat > "$ARTIFACT_DIR/06-missing-evidence.md" <<'EOF'
# Missing / Unverified Evidence Register

This package is generated locally. It does not query GitHub, Cloudflare,
Firebase, Actions, mobile build services, or other providers.

| Evidence requirement | Status | Required source |
|---|---|---|
| Current GitHub main SHA and settings | UNVERIFIED | GitHub readback |
| Live PR/branch dependency inventory | UNVERIFIED | GitHub readback |
| Hosted Actions job/run/step/log evidence | BLOCKED | Actual ubuntu-latest run |
| Downloadable canary artifact + checksum | BLOCKED | Actual workflow artifact |
| G02 runner identity and executed evidence | FAIL / UNVERIFIED | Separate authorized evidence; runner remains quarantined |
| G03–G11 acceptance | BLOCKED | Phase-specific evidence |
| Cloudflare live inventory/provenance | UNVERIFIED | Read-only provider evidence |
| Firebase staging identity/build/publication | UNVERIFIED | Owner-authorized staging evidence |
| Flutter/web/Android build and device QA | UNVERIFIED | Reproducible CI/device results |
| Security/SBOM/provenance review | UNVERIFIED | Inspectable scan outputs and independent review |
| Backup/restore/incident-response proof | UNVERIFIED | Controlled non-production drills |
| Owner and independent acceptance | NOT AUTHORIZED | Explicit recorded approvals |

No empty evidence directory, template, source file, screenshot, HTTP response, or
provider status is treated as proof of completion.
EOF

cat > "$ARTIFACT_DIR/README.md" <<EOF
# LINGO Legacy — Master Evidence Package

**Generated UTC:** $TIMESTAMP  
**Repository:** thelingolegacy-blip/TheLingoLegacy  
**Source HEAD:** $HEAD_SHA  
**Master Issue:** https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/612

## Disposition
- Production: **PROTECTED HOLD**
- G02: **FAIL / UNVERIFIED**
- G03–G11: **BLOCKED / HELD**
- Overall acceptance: **UNVERIFIED**

## Contents
- \`01-baseline.txt\`, \`HEAD.sha\`, Git status and recent history
- \`02-recovery-prs.md\` — unverified PR inventory seed
- \`03-safety-controls.md\` — execution boundaries
- \`04-master-checklist.md\` — Issue #612 phase checklist
- \`05-acceptance-matrix.json\` — machine-readable states
- \`06-missing-evidence.md\` — explicit evidence gaps
- \`workflows/actions-startup-canary.yml\` — template only; not dispatched
- \`ci/\`, \`cloudflare/\`, \`firebase/\`, \`flutter/\`, \`security/\`, \`docs/\` — reserved evidence locations
- \`MANIFEST.json\`, \`SHA256SUMS\`, \`EVIDENCE-REPORT.md\`

## Integrity and interpretation
The manifest enumerates every package file except itself and SHA256SUMS.
SHA256SUMS includes the manifest and all other package files except itself.
The generator verifies both before reporting success.

A successful generator exit means only that this local package was generated
and integrity-checked. It does not mean GitHub Actions, product builds, staging,
security, or release acceptance passed.

## Usage
\`\`\`bash
chmod +x scripts/master-artifact.sh
./scripts/master-artifact.sh
\`\`\`

Attach the resulting directory or a separately created archive to Issue #612
only after inspecting its contents. Do not include secrets or private data.
EOF

# 7. Human report, written before manifest/checksums.
printf '[7/9] Writing human evidence report...\n'
cat > "$REPORT" <<EOF
# LINGO Legacy — Master Evidence Report

**Generated UTC:** $TIMESTAMP  
**Repository:** thelingolegacy-blip/TheLingoLegacy  
**Source HEAD:** $HEAD_SHA  
**Branch:** $BRANCH_NAME  
**Master Issue:** #612

## Disposition
- Production: **PROTECTED HOLD**
- G02: **FAIL / UNVERIFIED**
- G03–G11: **BLOCKED / HELD**
- Overall program acceptance: **UNVERIFIED**
- Generator scope: local Git baseline + package templates + integrity validation

## Findings
- Dirty worktree entries at capture: **$DIRTY_COUNT**
- Live GitHub/Actions/provider queries: **not performed**
- Hosted canary: **template only; not dispatched**
- CI logs, run IDs, job IDs, downloadable artifacts: **not captured**
- Production/provider changes: **none performed by this generator**

## Required next evidence
1. Obtain current GitHub main/settings/PR readback.
2. Restore GitHub-hosted Actions job startup and obtain repeated correlated canary runs.
3. Download and checksum actual workflow artifacts.
4. Reconcile PR dependencies and candidate SHAs with independent review.
5. Complete each applicable product, security, staging, reliability and rollback gate.
6. Obtain separate owner acceptance and production-promotion authorization.

## Integrity
See MANIFEST.json and SHA256SUMS. The generator performs a final manifest
consistency check and \`sha256sum -c SHA256SUMS\` before returning success.

---
This report is an evidence index, not a release certificate or authorization.
EOF

# 8. Manifest + checksums, generated after all package content is final.
printf '[8/9] Generating manifest and checksums...\n'
python3 - "$ARTIFACT_DIR" "$TIMESTAMP" <<'PY' > "$MANIFEST"
import datetime, hashlib, json, pathlib, sys
root = pathlib.Path(sys.argv[1]).resolve(strict=True)
timestamp = sys.argv[2]
files = []
for path in sorted(root.rglob("*")):
    if path.is_symlink():
        raise SystemExit(f"Refusing symlink in artifact package: {path}")
    if path.is_file() and path.name not in {"MANIFEST.json", "SHA256SUMS"}:
        data = path.read_bytes()
        files.append({
            "path": path.relative_to(root).as_posix(),
            "sha256": hashlib.sha256(data).hexdigest(),
            "size": len(data)
        })
manifest = {
    "schema": "lingo-master-artifact-v2",
    "generated_utc": datetime.datetime.strptime(timestamp, "%Y%m%dT%H%M%SZ").replace(
        tzinfo=datetime.timezone.utc
    ).isoformat().replace("+00:00", "Z"),
    "issue": "https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/612",
    "source": {
        "repository": "thelingolegacy-blip/TheLingoLegacy",
        "head": (root / "HEAD.sha").read_text().strip()
    },
    "controls": {
        "production": "PROTECTED HOLD",
        "g02": "FAIL / UNVERIFIED",
        "g03_g11": "BLOCKED / HELD",
        "overall_acceptance": "UNVERIFIED"
    },
    "generation_scope": "local-only; no network/provider/workflow execution",
    "files": files
}
print(json.dumps(manifest, indent=2, sort_keys=True))
PY

(
  cd -- "$ARTIFACT_DIR"
  find . -type f ! -name 'SHA256SUMS' -print0 | sort -z | xargs -0 sha256sum > SHA256SUMS
)

# 9. Fail-closed integrity verification.
printf '[9/9] Verifying manifest and every checksum...\n'
python3 - "$ARTIFACT_DIR" <<'PY'
import hashlib, json, pathlib, sys
root = pathlib.Path(sys.argv[1]).resolve(strict=True)
manifest = json.loads((root / "MANIFEST.json").read_text())
if manifest.get("schema") != "lingo-master-artifact-v2":
    raise SystemExit("Unexpected manifest schema")
expected = {item["path"]: item for item in manifest.get("files", [])}
actual = {}
for path in root.rglob("*"):
    if path.is_symlink():
        raise SystemExit(f"Symlink found: {path}")
    if path.is_file() and path.name not in {"MANIFEST.json", "SHA256SUMS"}:
        rel = path.relative_to(root).as_posix()
        data = path.read_bytes()
        actual[rel] = (hashlib.sha256(data).hexdigest(), len(data))
if set(expected) != set(actual):
    raise SystemExit("Manifest file set does not match package file set")
for rel, (digest, size) in actual.items():
    record = expected[rel]
    if record.get("sha256") != digest or record.get("size") != size:
        raise SystemExit(f"Manifest mismatch: {rel}")
print(f"Manifest verified: {len(actual)} files")
PY

(
  cd -- "$ARTIFACT_DIR"
  sha256sum --check --strict SHA256SUMS
)

printf '\n=== Master Artifact package generated and integrity-verified ===\n'
printf 'Location : %s\n' "$ARTIFACT_DIR"
printf 'Manifest : %s\n' "$MANIFEST"
printf 'Checksums: %s\n' "$CHECKSUMS"
printf 'Report   : %s\n' "$REPORT"
printf '\nPackage integrity PASS does not change any acceptance status.\n'
printf 'Production remains PROTECTED HOLD; G02 remains FAIL / UNVERIFIED.\n'
