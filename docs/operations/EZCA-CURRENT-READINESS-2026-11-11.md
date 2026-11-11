# EZCA Current Readiness Snapshot — 2026-11-11

**Scope:** read-only repository, Cloudflare, and Supabase verification  
**Related proposal:** PR #549 — Wave 00.2–00.3 EZCA registry, route audit and P0 remediation  
**Disposition:** source integrity PASS; operational acceptance remains BLOCKED  
**Production:** no mutation performed

## 1. Registry source verification

Read the ten JSON files in `infrastructure/registry/` from branch `feature/wave-00-2-ezca-registry` and independently evaluated the invariants in `scripts/validate-ezca-registry.mjs`.

| Inventory | Observed | Result |
|---|---:|---|
| Canonical repository inventory | 38 | PASS |
| Shared engine packages | 12 | PASS |
| Cloudflare Workers | 7 | PASS |
| Worker route IDs and assignments | 21 | PASS |
| Worker binding catalog entries | 7 | PASS |
| Firebase project records | 3 | PASS — explicitly NOT_VERIFIED |
| Dependency repository assignments | 38 | PASS — zero unmapped, zero disposition mismatches |

The canonical repository declaration and production Worker declaration are present. Production promotion remains `BLOCKED`; G02 remains `FAIL_UNVERIFIED`. This validates the registry's current structure and consistency, not the runtime correctness of every record.

## 2. Cloudflare live account observations

Read-only Cloudflare API reads on 2026-11-11 confirmed:

- Zone `thelingolegacy.com` is active.
- 21 Worker route assignments are present.
- 34 DNS records are present.
- The production wildcard route `thelingolegacy.com/*` targets `thelingolegacyv-5`.
- The separate exact-root route `thelingolegacy.com/` targets `lingo-flagship-root`.
- `www.thelingolegacy.com/*` targets `thelingolegacyv-5`.
- `atlas.thelingolegacy.com/*` targets `lingo-ecosystem-atlas`.

### Active deployment and preview separation

- `thelingolegacyv-5`: active deployment remains 100% on version `2d161fa5-598f-4998-ada8-7ac4c72c3461` (historically identified as version 137).
- `lingo-flagship-root`: active deployment remains 100% on version `658acd1a-997b-45cd-b8fc-e59c59b26b45` (version 1).
- Main Worker version 303 (`0d7c7e6c-7594-4cce-b9ea-25c82c9250ac`) was uploaded with `has_preview=true`; it is not the active deployment.
- Exact-root Worker version 3 (`fa6ca7f6-7431-4d22-885d-782c5c9e3631`) was uploaded with `has_preview=true`; it is not the active deployment.

No DNS, Worker route, active deployment percentage, secret, or production configuration was changed.

### Route and DNS caveat

The proxied apex A record's configured content is `192.0.2.0` (TEST-NET-1). Because the record is proxied and Worker routes intercept the observed apex patterns, this value alone does not prove a public DNS outage or the origin path used by matching Worker requests. Preserve it pending a separate route/origin and DNS review; do not change it based solely on the configured value.

## 3. Supabase live project observations

The connected Supabase project `zoksxavxmgnkrthselek` reports `ACTIVE_HEALTHY`. Read-only project inventory returned:

- public tables: 0
- migrations: 0
- Edge Functions: 0

The project is reachable but has no inspected application schema or function surface. It is not yet an accepted application backend. No schema, migration, function, branch, or paid resource was created.

## 4. GitHub Actions startup evidence

On the exact inspected PR #549 branch head previously recorded as `647ecfb2fa31ee2e1475a17fb2879e4dd3f56e93`, four workflows returned `startup_failure`:

- Crimson Smoke UI — run `43021319272`
- EZCA Registry Validation — run `43021315110`
- Lingo Legacy Static CI — run `43021317026`
- G02 Runner Image Build (no publish) — run `43021313333`

The jobs endpoint returned zero jobs for all four runs. No instantiated steps, runner IDs, logs, or artifacts are available. These runs do not establish source-test failures or a definitive provider-side cause.

## 5. Remaining blockers

1. Restore GitHub Actions job startup and obtain provider-side diagnostic evidence.
2. Keep G02 blocked until the exact runner identity, nonzero runner ID, completed sentinel steps, logs, and artifact are proven.
3. Obtain authorized Firebase project/app configuration and verify the real deployed project/database before selecting an environment or deploying rules.
4. Keep Supabase non-authoritative until a backend decision is approved and a reviewed schema/migration/restore plan exists.
5. Complete application browser/device QA and route/health probes; API inventory and preview upload are not equivalent to runtime acceptance.
6. Review the production apex origin/DNS configuration with Cloudflare route semantics and rollback evidence before any change.
7. Complete privacy, security, payments, identity, wallet, legal and per-product release gates.

## 6. Release decision

**Do not merge or promote on the strength of registry validation.** The registry checks pass, but operational evidence is incomplete. Keep PR #549 in review, G02 at `FAIL_UNVERIFIED`, and production promotion at `BLOCKED`.

No runner activation, production deployment, route/DNS mutation, Firebase deployment, database migration, payment activation, or incremental paid resource creation occurred during this snapshot.
