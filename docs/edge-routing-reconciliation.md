# Edge routing reconciliation — protected patch

## Finding

The live Cloudflare route inventory currently assigns both `thelingolegacy.com/*` and `www.thelingolegacy.com/*` to Worker `thelingolegacy`. The repository's `wrangler.jsonc`, however, declares the deployment name `thelingolegacyv-5` while also declaring those apex/www routes. This is a deployment-target/routing identity mismatch: a deployment using that config can target the shared `thelingolegacyv-5` Worker used by other product subdomains.

## Patch in this branch

- Align the flagship Wrangler name with the actual canonical apex/www Worker: `thelingolegacy`.
- Keep only the apex and www routes in this flagship deployment config.
- Add `scripts/verify-edge-routing.mjs` to verify configuration and handler contracts without network access by default.
- Optional `--live` mode issues only synthetic read-only GETs for homepage, health, runtime, gate, and www redirect checks.

## Routing/interception/mirroring safety

The Worker already intercepts `/healthz`, `/api/v1/runtime`, `/api/v1/platform/gates`, and canonicalizes www requests. The verifier checks these contracts. It does **not** mirror real user requests or forward cookies, credentials, POST bodies, or customer data to a second origin. For production diagnosis, synthetic probes are safer than shadow-copying live traffic.

Other product subdomain routes currently targeting `thelingolegacyv-5` are intentionally untouched.

## Run

```bash
node scripts/verify-edge-routing.mjs
node scripts/verify-edge-routing.mjs --live
```

## Gate

This is a source-level patch only. Do not deploy or alter Cloudflare routes until G02 runner execution evidence is accepted, the patch is reviewed, the live probes pass, and the release authority explicitly unlocks promotion. The production mutation freeze and LKG protection remain in force.
