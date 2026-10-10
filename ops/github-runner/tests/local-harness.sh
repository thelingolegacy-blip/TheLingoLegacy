#!/usr/bin/env bash
set -euo pipefail

echo "=========================================================="
echo " LINGO LEGACY — Production-Aligned Local Diagnostic Suite"
echo "=========================================================="

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"

SANITIZER="$REPO_ROOT/ops/github-runner/lib/telemetry-sanitizer.sh"
SCHEMA_VALIDATOR="$REPO_ROOT/ops/github-runner/lib/telemetry-schema.sh"
COLLECTOR="$REPO_ROOT/ops/github-runner/collect-host-telemetry.sh"

[[ -f "$SANITIZER" && -f "$SCHEMA_VALIDATOR" && -f "$COLLECTOR" ]] || {
  echo "[FAIL] Required production helper or collector is missing." >&2
  exit 1
}
bash -n "$SANITIZER" "$SCHEMA_VALIDATOR" "$COLLECTOR"

# shellcheck source=/dev/null
source "$SANITIZER"
# shellcheck source=/dev/null
source "$SCHEMA_VALIDATOR"

TEST_TMP_DIR="$(mktemp -d /tmp/lingo-harness.XXXXXX)"
chmod 700 "$TEST_TMP_DIR"
cleanup() { rm -rf -- "$TEST_TMP_DIR"; }
trap cleanup EXIT

echo "[RUNNING] Check 1: Collector output, exact schema, and timestamp..."
OUTPUT_FILE="$TEST_TMP_DIR/telemetry.out"
bash "$COLLECTOR" "$OUTPUT_FILE"
[[ -s "$OUTPUT_FILE" ]] || { echo "[FAIL] Collector output is empty." >&2; exit 1; }
validate_telemetry_schema "$OUTPUT_FILE" || {
  echo "[FAIL] Production schema validator rejected collector output." >&2
  exit 1
}
echo "[PASS] Collector output satisfies the production schema validator."

echo "[RUNNING] Check 2: Output file permissions..."
PERMS="$(stat -c '%a' "$OUTPUT_FILE")"
[[ "$PERMS" == "600" ]] || {
  echo "[FAIL] Expected mode 600, received $PERMS." >&2
  exit 1
}
echo "[PASS] Telemetry report mode is 600."

echo "[RUNNING] Check 3: Production sanitizer redacts credentials and preserves ordinary text..."
SYNTHETIC="$TEST_TMP_DIR/synthetic.txt"
SANITIZED="$TEST_TMP_DIR/sanitized.txt"
cat > "$SYNTHETIC" <<'EOF'
ordinary telemetry line remains visible
Authorization: Bearer ghp_1234567890SecretTokenValueABCD
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
EOF
sanitize_telemetry < "$SYNTHETIC" > "$SANITIZED"
if grep -Eqi 'ghp_1234567890SecretTokenValueABCD|wJalrXtnFEMI/K7MDENG|wJalrXUtnFEMI/K7MDENG|SecretTokenValueABCD' "$SANITIZED"; then
  echo "[FAIL] A synthetic credential survived sanitization." >&2
  exit 1
fi
grep -Fq 'ordinary telemetry line remains visible' "$SANITIZED" || {
  echo "[FAIL] Sanitizer removed ordinary telemetry." >&2
  exit 1
}
grep -Fq '[REDACTED]' "$SANITIZED" || {
  echo "[FAIL] Expected redaction marker missing." >&2
  exit 1
}
echo "[PASS] Production sanitizer redacts both synthetic credentials and preserves ordinary text."

echo "[RUNNING] Check 4: Production validator rejects malformed reports..."
BAD_SCHEMA="$TEST_TMP_DIR/bad-schema.out"
printf '%s\n' 'G02_HOST_TELEMETRY_SCHEMA=2' 'CAPTURED_AT_UTC=2026-10-10T12:00:00Z' 'HOSTNAME=test-host' > "$BAD_SCHEMA"
if validate_telemetry_schema "$BAD_SCHEMA"; then
  echo "[FAIL] Validator accepted incorrect schema version." >&2
  exit 1
fi

MISSING_FIELD="$TEST_TMP_DIR/missing-field.out"
printf '%s\n' 'G02_HOST_TELEMETRY_SCHEMA=1' 'HOSTNAME=test-host' > "$MISSING_FIELD"
if validate_telemetry_schema "$MISSING_FIELD"; then
  echo "[FAIL] Validator accepted a missing timestamp." >&2
  exit 1
fi

BAD_TIMESTAMP="$TEST_TMP_DIR/bad-timestamp.out"
printf '%s\n' 'G02_HOST_TELEMETRY_SCHEMA=1' 'CAPTURED_AT_UTC=2026-02-30T12:00:00Z' 'HOSTNAME=test-host' > "$BAD_TIMESTAMP"
if validate_telemetry_schema "$BAD_TIMESTAMP"; then
  echo "[FAIL] Validator accepted an invalid calendar timestamp." >&2
  exit 1
fi
echo "[PASS] Production validator rejects wrong versions, missing fields, and invalid timestamps."

echo "[RUNNING] Check 5: Shell syntax negative case..."
INVALID="$TEST_TMP_DIR/invalid.sh"
printf 'if then\n' > "$INVALID"
if bash -n "$INVALID" >/dev/null 2>&1; then
  echo "[FAIL] Shell syntax check accepted malformed script." >&2
  exit 1
fi
echo "[PASS] Malformed shell syntax rejected."

echo "=========================================================="
echo "NON_AUTHORITATIVE_LOCAL_DIAGNOSTIC=VERIFIED"
echo "LOCAL_HARNESS_TEST=PASS"
echo "AUTHORITATIVE_G02_ACCEPTANCE=NOT_EVALUATED"
echo "=========================================================="
