#!/usr/bin/env bash
# Repository factory: dry-run by default. Requires authorized gh CLI login.
set -euo pipefail
MANIFEST="${1:-ops/estate/estate-manifest.json}"
if ! command -v gh >/dev/null 2>&1; then echo "ERROR: GitHub CLI (gh) is required." >&2; exit 2; fi
if ! command -v node >/dev/null 2>&1; then echo "ERROR: Node.js is required." >&2; exit 2; fi
OWNER="${GITHUB_REPOSITORY_OWNER:-thelingolegacy-blip}"
APPLY="${APPLY_REPOSITORY_CREATION:-false}"
CONFIRM="${CONFIRM_REPOSITORY_CREATION:-}"
node -e 'const x=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));for(const r of x.repositories||[])if(r.status==="PROPOSED_NOT_CREATED")console.log(r.name+"\t"+r.purpose)' "$MANIFEST" |
while IFS="$(printf '\t')" read -r name purpose; do
  [ -n "$name" ] || continue
  full="$OWNER/$name"
  if gh repo view "$full" >/dev/null 2>&1; then
    printf 'EXISTS %s\n' "$full"
    continue
  fi
  if [ "$APPLY" != "true" ]; then
    printf 'DRY_RUN would create private repository %s — %s\n' "$full" "$purpose"
    continue
  fi
  if [ "$CONFIRM" != "CREATE_PRIVATE_LINGO_REPOSITORIES" ]; then
    echo "ERROR: set CONFIRM_REPOSITORY_CREATION=CREATE_PRIVATE_LINGO_REPOSITORIES to authorize creation." >&2
    exit 3
  fi
  gh repo create "$full" --private --description "$purpose" --add-readme
  printf 'CREATED %s\n' "$full"
done
echo "NEXT: apply and verify branch rulesets separately; repository creation alone does not configure rules or prove CI."
