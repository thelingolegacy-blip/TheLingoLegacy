# Lingo Legacy Cloudflare Production Setup

## Authority

- GitHub is the source repository and release evidence plane.
- Cloudflare Workers is the production runtime authority.
- `thelingolegacy.com` is canonical.
- `www.thelingolegacy.com` must redirect to the apex domain with HTTP 301 while preserving path and query string.
- Vercel is retired and is not production authority.

## Worker contract

- Worker: `thelingolegacy`
- Entrypoint: `worker.js`
- Assets binding: `ASSETS`
- `workers_dev`: disabled
- Compatibility flag: `nodejs_compat`
- Required probes: `/healthz`, `/api/v1/platform/manifest`, `/api/v1/platform/status`, `/api/v1/platform/routes`, `/api/v1/site/context`

## Cloudflare resource synchronization

The repository intentionally does not invent Cloudflare resource IDs. Before resource bindings are added to `wrangler.jsonc`, obtain the authoritative Cloudflare inventory and synchronize these logical bindings:

- D1: `DB`
- KV: `LEADERBOARD_KV`, `STUDIO_KV`, `SUBMISSIONS`, `MAINTENANCE_KV`, `JACKPOT_KV`
- R2: `ASSET_BUCKET`

Wrangler configuration remains the source of truth for deployed Worker configuration. Dashboard-only changes must be reconciled back into `wrangler.jsonc` before the next release.

## GitHub Actions

The repository now has:

- static validation with Node.js 24;
- runner identity evidence;
- Cloudflare binding validation;
- dependency update automation for GitHub Actions;
- a controlled Cloudflare deployment workflow requiring `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the protected `production` environment.

## Release gate

No merge or production activation is certified until all of the following are observable for the exact release SHA:

1. runner allocation with `runner_id > 0` and a real runner name;
2. executed workflow steps;
3. retrievable job logs;
4. validation artifact;
5. successful Cloudflare deployment evidence;
6. live apex probe returns the intended Master Home;
7. live `www` probe returns the canonical 301 redirect;
8. runtime and route-registry probes pass;
9. LKG remains protected.

A workflow configuration that merely parses successfully is not deployment evidence.
