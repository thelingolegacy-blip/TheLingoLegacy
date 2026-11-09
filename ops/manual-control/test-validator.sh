#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
VALIDATOR="$ROOT/validate-transition.sh"
pass=0
fail() { echo "FAIL: $1" >&2; exit 1; }
expect_pass() {
  local name="$1"; shift
  if env "$@" bash "$VALIDATOR" >/dev/null 2>&1; then
    echo "PASS: $name"; pass=$((pass + 1))
  else
    fail "$name should have passed"
  fi
}
expect_fail() {
  local name="$1"; shift
  if env "$@" bash "$VALIDATOR" >/dev/null 2>&1; then
    fail "$name should have been rejected"
  else
    echo "PASS: $name rejected"; pass=$((pass + 1))
  fi
}
BASE=(PROJECT_KEY=LINGOlegacy EVIDENCE_URL=https://example.com/evidence RATIONALE=Test GITHUB_ACTOR=thelingolegacy-blip AUTHORIZED_APPROVERS=thelingolegacy-blip)

expect_pass "initial assessment" "${BASE[@]}" COMMAND=assess FROM_STAGE=NOT_ASSESSED TO_STAGE=PLANNED
expect_pass "planned to ready" "${BASE[@]}" COMMAND=advance FROM_STAGE=PLANNED TO_STAGE=READY
expect_pass "owner approval" "${BASE[@]}" COMMAND=approve FROM_STAGE=REVIEW TO_STAGE=APPROVED CONFIRMATION="APPROVE LINGOlegacy"
expect_fail "skipped lifecycle stage" "${BASE[@]}" COMMAND=advance FROM_STAGE=PLANNED TO_STAGE=RELEASED
expect_fail "unauthorized approval" PROJECT_KEY=LINGOlegacy EVIDENCE_URL=https://example.com/evidence RATIONALE=Test GITHUB_ACTOR=other-user AUTHORIZED_APPROVERS=thelingolegacy-blip COMMAND=approve FROM_STAGE=REVIEW TO_STAGE=APPROVED CONFIRMATION="APPROVE LINGOlegacy"
expect_fail "missing approver allowlist" PROJECT_KEY=LINGOlegacy EVIDENCE_URL=https://example.com/evidence RATIONALE=Test GITHUB_ACTOR=thelingolegacy-blip COMMAND=approve FROM_STAGE=REVIEW TO_STAGE=APPROVED CONFIRMATION="APPROVE LINGOlegacy"
expect_pass "authorized release record" "${BASE[@]}" COMMAND=record-release FROM_STAGE=RELEASE_READY TO_STAGE=RELEASED CONFIRMATION="RELEASE LINGOlegacy" DEPLOYMENT_EVIDENCE_URL=https://example.com/live
expect_fail "release without deployment evidence" "${BASE[@]}" COMMAND=record-release FROM_STAGE=RELEASE_READY TO_STAGE=RELEASED CONFIRMATION="RELEASE LINGOlegacy"
expect_fail "release with wrong confirmation" "${BASE[@]}" COMMAND=record-release FROM_STAGE=RELEASE_READY TO_STAGE=RELEASED CONFIRMATION="RELEASE OTHER" DEPLOYMENT_EVIDENCE_URL=https://example.com/live"
expect_fail "missing evidence" PROJECT_KEY=LINGOlegacy RATIONALE=Test GITHUB_ACTOR=thelingolegacy-blip GITHUB_REPOSITORY_OWNER=thelingolegacy-blip COMMAND=advance FROM_STAGE=PLANNED TO_STAGE=READY
expect_fail "unregistered project" PROJECT_KEY=UnknownProject EVIDENCE_URL=https://example.com/evidence RATIONALE=Test GITHUB_ACTOR=thelingolegacy-blip GITHUB_REPOSITORY_OWNER=thelingolegacy-blip COMMAND=advance FROM_STAGE=PLANNED TO_STAGE=READY
expect_fail "invalid project key" PROJECT_KEY="../bad" EVIDENCE_URL=https://example.com/evidence RATIONALE=Test GITHUB_ACTOR=thelingolegacy-blip GITHUB_REPOSITORY_OWNER=thelingolegacy-blip COMMAND=advance FROM_STAGE=PLANNED TO_STAGE=READY

echo "All $pass manual-transition validator tests passed."
