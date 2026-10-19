#!/usr/bin/env bash
set -euo pipefail

# Validates a downloaded G02 artifact bundle's local completeness and hashes.
# It does not query GitHub, verify provider inventory, or independently attest
# the evidence's origin. Those checks remain external acceptance requirements.

ROOT="${1:-evidence}"
fail=0
require_file() {
  if [[ -s "$ROOT/$1" ]]; then echo "PRESENT: $1"; else echo "MISSING: $1"; fail=1; fi
}

echo "G02 EVIDENCE PACKAGE CHECK"
require_file runner-context.txt
require_file host-checks.txt
require_file sentinel-result.txt
require_file SHA256SUMS

if [[ -s "$ROOT/SHA256SUMS" ]]; then
  if (cd "$ROOT" && sha256sum --check SHA256SUMS); then
    echo "CHECKSUMS=PASS"
  else
    echo "CHECKSUMS=FAIL"
    fail=1
  fi
fi

if [[ -s "$ROOT/runner-context.txt" ]]; then
  grep -q '^runner_name=lingo-legacy-g02$' "$ROOT/runner-context.txt" || { echo "FAIL: canonical runner name missing"; fail=1; }
  grep -q '^runner_os=Linux$' "$ROOT/runner-context.txt" || { echo "FAIL: Linux runtime not evidenced"; fail=1; }
  grep -q '^runner_arch=X64$' "$ROOT/runner-context.txt" || { echo "FAIL: x64 runtime not evidenced"; fail=1; }
  grep -q '^github_run_id=[1-9][0-9]*$' "$ROOT/runner-context.txt" || { echo "FAIL: run ID missing"; fail=1; }
  grep -q '^github_sha=[0-9a-f]\{40\}$' "$ROOT/runner-context.txt" || { echo "FAIL: commit SHA missing"; fail=1; }
fi

if [[ -s "$ROOT/sentinel-result.txt" ]]; then
  grep -q '^G02_SENTINEL_EXIT_CODE=0$' "$ROOT/sentinel-result.txt" || { echo "FAIL: sentinel success marker missing"; fail=1; }
fi

if [[ "$fail" -eq 0 ]]; then
  echo "LOCAL_PACKAGE_VALIDATION=PASS"
  echo "G02_ACCEPTANCE=NOT_ESTABLISHED"
  echo "Independent GitHub job assignment, retrievable logs, artifact origin, and commit correlation are still required."
else
  echo "LOCAL_PACKAGE_VALIDATION=FAIL"
  exit 1
fi
