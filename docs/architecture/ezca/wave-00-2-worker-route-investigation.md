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

The canonical repository and production release contract designate `thelingolegacyv-5` as the flagship runtime. The preferred target is one consistent apex entry point on that Worker, after verifying that its root asset matches the intended flagship homepage and that rollback evidence is captured. The exact-root route should then be removed through a reviewed, reversible Cloudflare change. Do not perform that production change as part of this investigation.

Alternative: if the isolated root homepage must remain, it needs an explicit, tested service-binding/delegation design and a query-string-safe routing plan. The current deployed root Worker has no such binding or delegation.

## Acceptance criteria

- One documented apex-root owner for both bare and query-bearing URLs.
- No unexplained route overlap or split behavior.
- No regression in apex wildcard, www, API, or product subdomain paths.
- Reversible change plan with all pre-change route IDs and Worker versions.
- Post-change live probes for bare root, query root, /healthz, /api/v1/runtime, /app and www.
- Confirmed response markers, request IDs and cache headers after the change.

## Protection

No Cloudflare route create/update/delete, Worker deployment, DNS change or production cutover is part of this investigation.
