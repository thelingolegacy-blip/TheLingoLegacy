# Isolated candidate execution runbook — 2026-10-25

## Purpose

Provide a repeatable path to collect execution evidence without depending on GitHub Actions startup or touching production. This is a procedure, not evidence that the commands have already passed.

## Safety constraints

- Use a disposable checkout and an isolated candidate URL owned by the release team.
- Do not point acceptance probes at the production domain while the launch gate is NO-GO.
- Do not run `wrangler deploy` without `--dry-run` for this procedure.
- Do not add, print, or paste credentials, tokens, secrets, or environment files into logs or support tickets.
- Stop if the checked-out branch/commit differs from the intended recovery revision, the candidate URL is not isolated, or a command proposes a live deployment.

## 1. Identify the exact revision

From a trusted machine with Git and Node.js installed:

```sh
git clone https://github.com/thelingolegacy-blip/TheLingoLegacy.git
cd TheLingoLegacy
git fetch origin recovery/static-backup-2026-10-24
git checkout --detach origin/recovery/static-backup-2026-10-24
git rev-parse HEAD
node --version
npm --version
```

Record the full commit SHA, UTC timestamp, OS, Node version, and npm version in the test record. Confirm the checkout contains `worker.js`, `wrangler.jsonc`, and `scripts/production-acceptance-probes.mjs`.

## 2. Run local, non-deploying checks

```sh
node --check worker.js
node --check scripts/production-acceptance-probes.mjs
npx --yes wrangler@4 deploy --dry-run --config wrangler.jsonc
```

Record each command, exit code, and complete non-secret output. A successful syntax check is not a passing application test. A Wrangler dry-run is not a deployment and does not prove the production Worker matches this source.

If Wrangler reports missing bindings, configuration problems, or asks to authenticate, preserve the sanitized output and stop; do not create credentials or change Cloudflare resources as part of this runbook.

## 3. Probe only an isolated candidate

After an authorized operator has published a separate candidate (not the apex/www production routes), set its exact HTTPS URL:

```sh
BASE_URL=https://YOUR-ISOLATED-CANDIDATE.example node scripts/production-acceptance-probes.mjs
```

Replace the example with the actual candidate URL before running. Do not run with the placeholder. The script performs read-only HTTP GET requests. It expects the health, static assets, runtime APIs, missing-route behavior, caching, and security headers defined in the script.

Save the JSON report and process exit code as a CI-independent evidence artifact. Treat any failed probe as a release blocker; do not weaken expected assertions just to obtain a green result. Redact any sensitive data before sharing reports.

## 4. Evidence record template

Record:

- UTC start/end time:
- Full Git commit SHA:
- Host OS and Node/npm versions:
- Exact command:
- Exit code:
- Log/report path and SHA-256:
- Candidate hostname (no credentials or tokens):
- Failed checks and follow-up owner:
- Confirmation that no production deployment or configuration change occurred:

## Acceptance boundary

A passing local syntax check only validates parsing. A passing dry-run only validates the portion Wrangler can check without publishing. A passing candidate probe validates the observed HTTP responses from that candidate. None alone authorizes production release. Keep the launch gate at **NO-GO / PROTECTED HOLD** until all release-gate items have fresh evidence and an authorized reviewer approves the release.
