# Cloudflare route, Worker and DNS reconciliation — 2026-11-08

## Scope and disposition

Read-only snapshot for `thelingolegacy.com`, account `16cb6f247cd1b28fca864760c7269606`, zone `91c3f6315fb3ca132b22744721103f88`. The live API returned **21 Worker routes**, 11 Worker scripts, and DNS records. No route, DNS record, Worker version, deployment, security policy, or origin was changed.

**Disposition: RECONCILIATION REQUIRED — NO DEPLOYMENT OR ROUTE ACTIVATION.**

## Worker uploaded/deployed identity

| Worker | Latest uploaded | Latest deployment record | Deployment version ID | Disposition |
|---|---:|---|---|---|
| `thelingolegacyv-5` | v270 (`d17ceee2-d8ab-4c30-8b8a-b8f87bd5f398`) | `ecd71a70-e476-4318-92a7-35249ced360b`, 2026-10-25 | `2d161fa5-598f-4998-ada8-7ac4c72c3461` | Uploaded version and deployed version differ by ID; resolve deployed version number and source commit |
| `lingo-flagship-root` | v2 (`1009da37-9128-44c2-9853-f277eb791c31`) | `31ccefbb-ddf4-4a62-974b-3ee9d0bc81d3`, 2026-10-25 | `658acd1a-997b-45cd-b8fc-e59c59b26b45` | Uploaded v2 differs from deployed v1 ID |

Version upload is not deployment. A deployment record is not source provenance. Before candidate promotion, resolve each deployed version ID through Cloudflare's version-detail endpoint and correlate its source, bindings, compatibility date, and Git commit.

## Route findings

- `thelingolegacy.com/*` -> `thelingolegacyv-5`
- `thelingolegacy.com/` -> `lingo-flagship-root`
- `www.thelingolegacy.com/*` -> `thelingolegacyv-5`
- `atlas.thelingolegacy.com/*` -> `lingo-ecosystem-atlas`
- `launch.thelingolegacy.com/*` -> `lingo-static-backup-proxy`
- Remaining routes are recorded in `config/registry/cloudflare-route-inventory.v1.json`.

The exact-root and wildcard apex patterns overlap. Do not assume precedence from route listing order. Candidate-only probes must test `/`, `/index.html`, representative deep paths, static assets, redirects, and error paths against both intended handlers.

The repository `wrangler.jsonc` declares `thelingolegacyv-5` for apex wildcard and www, but does not declare the separately observed exact-root `lingo-flagship-root` route. This is a configuration-to-live-inventory mismatch. Do not run `wrangler deploy` until ownership and route intent are reconciled.

## DNS risk inventory

- Apex A record points to `192.0.2.0`, a TEST-NET-1 documentation address. Treat this as a critical origin/fallback validation blocker; do not replace it based on guesswork.
- `app.thelingolegacy.com` CNAME points to `my-flutter-app.pages.dev`; app ownership/build identity is unverified.
- `admin.thelingolegacy.com` CNAME points to `admin-thelingolegacy.firebaseapp.com`; reconcile with the configured Firebase project and actual Hosting site.
- `_dmarc` policy is `p=none`; mail authentication enforcement needs a separate measured rollout.
- Two `_vercel` domain-verification TXT records remain. Do not delete until all dependent ownership and validation flows are confirmed.

## Candidate acceptance sequence

1. Retrieve active deployment details and resolve deployed version IDs to version numbers.
2. Retrieve Worker settings/bindings and compare with `wrangler.jsonc` and source.
3. Produce a route matrix for all 21 routes: hostname, pattern, Worker, intended owner, source commit, origin, auth, cache, rate-limit, health check, rollback.
4. Reproduce root/wildcard routing on an isolated hostname or preview URL.
5. Validate DNS origin ownership and fallback without mutating production.
6. Verify Access, rate limiting, WAF, logs, analytics, error budgets, and rollback target.
7. Obtain independent review and separate release-owner approval before any production mutation.

## Change safety

No route deletion, DNS correction, version deployment, Worker activation, secret update, Access policy change, or paid-service change is authorized by this inventory. Preserve last-known-good until every candidate test and rollback requirement is satisfied.
