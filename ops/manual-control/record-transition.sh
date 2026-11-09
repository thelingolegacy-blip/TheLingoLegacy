#!/usr/bin/env bash
set -euo pipefail

REPOSITORY="${REPOSITORY:-thelingolegacy-blip/TheLingoLegacy}"
: "${PROJECT_KEY:?Set PROJECT_KEY}"
: "${COMMAND:?Set COMMAND}"
: "${FROM_STAGE:?Set FROM_STAGE}"
: "${TO_STAGE:?Set TO_STAGE}"
: "${EVIDENCE_URL:?Set EVIDENCE_URL}"
: "${RATIONALE:?Set RATIONALE}"

command -v gh >/dev/null 2>&1 || { echo "GitHub CLI (gh) is required." >&2; exit 1; }
gh auth status >/dev/null
GITHUB_ACTOR="$(gh api user --jq .login)"
GITHUB_REPOSITORY_OWNER="$(gh api "repos/${REPOSITORY}" --jq .owner.login)"
export GITHUB_ACTOR GITHUB_REPOSITORY_OWNER
export PROJECT_KEY COMMAND FROM_STAGE TO_STAGE EVIDENCE_URL RATIONALE
export DEPLOYMENT_EVIDENCE_URL="${DEPLOYMENT_EVIDENCE_URL:-}"
export CONFIRMATION="${CONFIRMATION:-}"
export PROJECT_REGISTRY="${PROJECT_REGISTRY:-ops/manual-control/projects.json}"

bash ops/manual-control/validate-transition.sh

CREATED_AT="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
TITLE="Manual transition: ${PROJECT_KEY} ${FROM_STAGE} -> ${TO_STAGE}"
BODY="$(cat <<EOF
## Manual advancement record

- Project: ${PROJECT_KEY}
- Command: ${COMMAND}
- Previous stage: ${FROM_STAGE}
- Requested stage: ${TO_STAGE}
- Actor: @${GITHUB_ACTOR}
- Timestamp: ${CREATED_AT}
- Evidence: ${EVIDENCE_URL}
- Deployment/live evidence: ${DEPLOYMENT_EVIDENCE_URL:-Not applicable}
- Rationale: ${RATIONALE}

**G02/Fallgate dependency:** None.

**Execution boundary:** This record documents the validated manual transition request. It does not deploy, merge code, change runtime state, or independently certify product completion. The project owner must review this record and reconcile the accepted state in the project registry.
EOF
)"
gh issue create --repo "${REPOSITORY}" --title "${TITLE}" --body "${BODY}"
