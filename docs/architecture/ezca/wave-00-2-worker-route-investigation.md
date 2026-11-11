# Wave 00.3 — Apex Worker Route Investigation

Status: ROUTE MATCHING DETERMINED — NO ROUTE MUTATION AUTHORIZED

## Live Cloudflare route inventory

Read-only Cloudflare zone API inspection confirms these two overlapping apex routes:

- Route ID `04e6903aedf14510b58b34b57df699e1`: `thelingolegacy.com/` → `lingo-flagship-root`
- Route ID `41e8d027e8cd4cb19d21df7143a2c25e`: `thelingolegacy.com/*` → `thelingolegacyv-5`

The zone currently has 21 Worker routes. The apex wildcard also covers `www.thelingolegacy.com/*` and product/utility subdomains. Full patterns and route IDs are recorded in `infrastructure/registry/workers.json`.

## Deterministic route-selection result

Cloudflare's Workers Routes documentation says matching considers the entire request URL, including its query string. Route patterns cannot contain query parameters. More-specific patterns win when they match. Therefore:

| Request | Selected route | Worker |
|---|---|---|
| `https://thelingolegacy.com/` | Exact apex-root route | `lingo-flagship-root` |
| `https://thelingolegacy.com/?probe=1` | Apex wildcard route | `thelingolegacyv-5` |
| `https://thelingolegacy.com/healthz` | Apex wildcard route | `thelingolegacyv-5` |
| `https://thelingolegacy.com/api/v1/runtime` | Apex wildcard route | `thelingolegacyv-5` |
| `https://thelingolegacy.com/app` | Apex wildcard route | `thelingolegacyv-5` |
| `https://www.thelingolegacy.com/` | www wildcard route | `thelingolegacyv-5` |

This is a route-selection determination from the live route inventory plus Cloudflare's documented matching semantics. It is not a claim that response headers were captured for every URL.

## Deployed Worker source inspection

The Cloudflare Worker Script API was used read-only to inspect both deployed scripts:

- `lingo-flagship-root` has no regular bindings. Its fetch handler serves a standalone HTML homepage only for GET/HEAD requests to `/`; every other pathname returns 404. It does not delegate non-root paths to `thelingolegacyv-5`.
- `thelingolegacyv-5` has the `ASSETS` binding plus plain-text `CANONICAL_DOMAIN` and `PUBLIC_SITE_URL` bindings. Its handler implements `/healthz`, `/api/v1/runtime`, platform status/gates/modules and site-context endpoints, then delegates non-API paths to `ASSETS.fetch(request)`.
- A live GET of `/healthz` returned `ok`. Web inspection could not retrieve query-bearing root or runtime endpoint responses, and a local direct HTTP header probe was unavailable in this execution environment.

## Impact

The apex has two different handlers depending on the query string: a bare root request receives the isolated homepage Worker, while a query-bearing root request reaches the dynamic flagship Worker. This is a real split-entry-point condition, not merely an unresolved documentation question. The exact root Worker also cannot serve `/app`, `/healthz`, or API paths.

## Recommended normalization path

The canonical `wrangler.jsonc` declares only the apex wildcard and www wildcard routes to `thelingolegacyv-5`; the exact-root route is an out-of-band Cloudflare route not represented in the canonical deployment config. The source-controlled root `index.html` served by the flagship Worker's ASSETS binding redirects to `/studio-hub/`, while the isolated root Worker's HOME serves a distinct crimson/white flagship homepage. This suggests the exact-root route may be intentional, but it creates query-string-dependent homepage behavior.

Two valid normalization paths remain:

1. **Single flagship Worker:** move/align the standalone root homepage into the flagship Worker assets, verify root and Studio Hub navigation, then remove the out-of-band exact-root route through a reviewed reversible Cloudflare change.
2. **Root gateway Worker:** preserve the standalone root homepage, add a tested service binding from `lingo-flagship-root` to `thelingolegacyv-5`, change the apex wildcard to the root gateway, and have the gateway delegate all non-root paths to the flagship Worker. The current root Worker has no binding or delegation, so this requires a code/settings change.

Do not perform either production change as part of this investigation. The intended homepage and preferred normalization path require review before route mutation.

## Source-of-truth drift

The main-branch `wrangler.jsonc` currently declares `thelingolegacy.com/*` and `www.thelingolegacy.com/*` only. The Cloudflare zone also has the exact apex-root route to `lingo-flagship-root`, which is not represented in that Wrangler file. The root Worker's source exists at `cloudflare/flagship-root/worker.js`; its deployed settings currently show no regular bindings. The canonical `index.html` is a redirect stub to `/studio-hub/`, not a copy of the standalone root homepage.

## Acceptance criteria

- One documented apex-root owner for both bare and query-bearing URLs.
- No unexplained route overlap or split behavior.
- No regression in apex wildcard, www, API, or product subdomain paths.
- Reversible change plan with all pre-change route IDs and Worker versions.
- Post-change live probes for bare root, query root, /healthz, /api/v1/runtime, /app and www.
- Confirmed response markers, request IDs and cache headers after the change.

## Protection

No Cloudflare route create/update/delete, Worker deployment, DNS change or production cutover is part of this investigation.
