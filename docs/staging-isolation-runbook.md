# Isolated Cloudflare Staging Runbook

## Scope

This staging lane deploys the canonical Worker source to the separately named `thelingolegacy-staging` Worker on its `workers.dev` endpoint. It must not add custom routes, alter production DNS, or reuse production credentials or data resources.

## Configuration boundaries

- Production remains defined by `wrangler.jsonc` and its canonical routes.
- Staging is defined only by `wrangler.staging.jsonc`.
- The staging config intentionally declares no custom routes, no D1/KV/R2/service bindings, and no integration secrets.
- The Worker uses the incoming request origin for staging canonical links and CORS, and suppresses the production `www` to apex redirect in staging.
- The `staging.invalid` values are sentinels that prevent accidental fallback to the production hostname; staging request-origin handling takes precedence.
- `.assetsignore` excludes repository controls, operational scripts, environment files, runtime source, and internal configuration from public asset delivery. The verifier fails closed if required exclusions are missing.

## Credentials

Create GitHub environment `staging` and configure:
- `CLOUDFLARE_STAGING_API_TOKEN`: dedicated token restricted to the intended Cloudflare account and Worker deployment permissions.
- `CLOUDFLARE_ACCOUNT_ID`: the target Cloudflare account ID.

Do not use the production API token. Do not configure production Stripe, Twilio, webhook, Firebase, D1, KV, R2, Durable Objects, queue, or service-binding secrets for this staging lane. Add isolated test integrations only through a separately reviewed change.

## Execution gates

1. The staging-specific self-hosted runner must be online with labels `self-hosted, linux, x64, lingo-legacy-g02-staging`.
2. Dispatch only from the reviewed branch/commit and enter `STAGING`.
3. `node --check worker.js` and `node scripts/verify-staging-isolation.mjs` must pass.
4. Wrangler dry-run must complete using staging-only credentials.
5. Deploy only `wrangler.staging.jsonc`.
6. Record the exact run ID, attempt, commit SHA, runner identity, deployment output, staging URL, response headers, `/healthz`, `/api/v1/runtime`, `/api/v1/platform/manifest`, and artifact hashes.
7. Independently verify that the staging hostname serves the expected commit, does not redirect to production, and exposes no internal files.
8. Record rollback instructions and the exact staging Worker version before acceptance.

## Rollback

Disable or roll back only the named `thelingolegacy-staging` Worker version after correlating the deployment ID and evidence. Do not delete the production Worker, alter canonical routes, or change production DNS as part of staging rollback.

## Current limitations

A successful source-level verifier is not a deployed runtime test. The workflow does not create a runner, provision secrets, create custom domains, or establish G02 acceptance by itself. If the required runner or staging-only credentials are missing, the deployment remains blocked.
