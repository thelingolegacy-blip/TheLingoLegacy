# Worker-first static asset routing repair — 2026-11-20

## Cloudflare routing behavior

Current Cloudflare Workers Static Assets documentation states:
- `assets.run_worker_first` defaults to `false`.
- With the default, a matching static asset is served without invoking Worker code.
- `run_worker_first = true` invokes Worker code before asset serving for all requests; an array of path patterns can selectively invoke the Worker first.

Sources:
- https://developers.cloudflare.com/workers/static-assets/binding/
- https://developers.cloudflare.com/workers/static-assets/routing/worker-script/

## Candidate gap identified

PR #574's prior `wrangler.jsonc` defined `assets.directory` and `assets.binding`, but omitted `assets.run_worker_first`. Its unit test directly invoked `worker.fetch()` and proved the handler denied a path before calling `env.ASSETS.fetch()`; that did not prove Cloudflare's static-asset router would invoke the Worker for a matching uploaded asset.

## Isolated repair

On branch `security/two-layer-public-surface-repair-2026-11-14`:

- `wrangler.jsonc` now includes 13 selective Worker-first glob patterns:
  - Nine restricted register, identity and console directory roots.
  - Four restricted operational prefixes (`/ops*`, `/config/ops*`, `/docs/ops*`, `/docs/superpowers*`).
- `scripts/verify-asset-publication-scope.mjs` now fails closed if `assets.run_worker_first` is not an array or any required pattern is missing.
- `scripts/test-verify-asset-publication-scope.mjs` fixture includes the expected patterns and a regression test proves omission of `/auth0-details*` fails the validator.

GitHub readback verified:
- Wrangler config blob: `4720b8eaae811d8f1e7dc642231a2ad21f9a8153`
- Validator blob: `742bbf1c769b71edb89e13df5363767924c4e3fb`
- Test blob: `84bfe83965a6e618f820ddc005353f72a931bb1b`
- PR #574 head: `604a1b32e975a39800ce4ab8fd4bb88e46712b5f`

## Verification boundary

The current-head workflow run `44824051003` ended `startup_failure`, with zero jobs and zero artifacts. No Node test, Wrangler dry-run, preview deployment, or real path probe executed. The change is source-verified only.

Before acceptance:
1. Execute both focused policy workflows on this exact SHA after Actions admission is restored.
2. Run Wrangler configuration validation and dry-run against the exact asset root; inspect the generated asset manifest.
3. Verify each restricted path returns the Worker deny response before any matching static asset is served.
4. Verify customer-facing readiness/product routes and static assets remain available.
5. Keep production unchanged until independent security review and explicit release authorization.

No production Worker, route, DNS, Pages, asset version, or deployment configuration was changed by this branch edit.
