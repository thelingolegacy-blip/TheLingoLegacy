# Clean-Room Rebuild — Recovery Contract

**Branch:** `recovery/clean-room-rebuild-2026-10-25`  
**Baseline:** `24d6d45bbe073b189b004f68e7b3feb11f9cf55e`  
**Purpose:** Establish a separate, least-privilege source-validation lane while the existing G02 self-hosted runner admission incident is investigated.

## What this patch changes

- Adds a manually triggered GitHub-hosted `ubuntu-latest` validation workflow.
- Runs the existing Studio VNext `npm run check` script (which includes its test suite).
- Performs Wrangler v4 dry-runs against the validation and isolated-preview configurations.
- Grants only `contents: read`; no Cloudflare credentials, deployment token, secret writes, production routes, or production promotion are configured.
- Does not automatically dispatch on push or pull request. An authorized operator must explicitly run the workflow after reviewing this patch.

## What it deliberately does not change

- It does **not** repair or certify `lingo-legacy-g02`, and a hosted-runner success does not satisfy G02.
- It does not alter repository/org Actions policies, runner groups, billing, Vercel settings, Firebase credentials, DNS, Worker traffic, or production secrets.
- It does not merge PR #378, deploy a Worker, or promote a release.
- It does not claim tests or dry-runs have passed; they remain pending until the workflow produces inspectable evidence.

## Required rebuild sequence

1. Review this patch and confirm the hosted runner is permitted by the repository/org policy.
2. Manually run **Clean-Room Rebuild Validation** on the exact intended commit. Record the run URL, SHA, exit status, and logs.
3. If source validation fails, patch only the demonstrated source/config defect on this branch and rerun after review.
4. In parallel, collect the G02 admin policy/runner inventory and sanitized host daemon/polling telemetry in Issue #379. Do not use the hosted lane as a substitute for this evidence.
5. Resolve the independently demonstrated Vercel build-rate-limit issue with the Vercel project administrator; it is not proof of the Actions startup-failure cause.
6. Replace Firebase placeholders only through the authorized Firebase project configuration process; never commit API secrets or private credentials.
7. Keep production Protected Hold until source, infrastructure, security, accessibility, and deployment evidence are independently accepted.

## Evidence rules

- A workflow file existing is not evidence that the workflow ran.
- A queued run is not a passed run.
- A successful dry-run is not a deployment.
- A hosted runner does not establish self-hosted runner admission.
- Do not remove branch protections, fail-closed checks, or security controls to make a build appear green.
