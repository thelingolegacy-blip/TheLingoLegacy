# askLINGO v2.0 — Cloudflare Infrastructure Inventory

**Inspection type:** Read-only account/resource inventory  
**Date:** 2026-11-21/22 UTC inspection window  
**Mutation status:** No resources created, modified, deployed, or deleted.

## Worker inventory

The connected Cloudflare account returned ten Worker scripts:

- `lingo-ecosystem-atlas`
- `lingo-flagship-root`
- `lingo-flagship-site-preview`
- `lingo-integration-config-404`
- `lingo-resilience-gateway`
- `lingo-static-backup-proxy`
- `lingo-studio-control-center-staging`
- `lingo-unified-control-tower-preview`
- `thelingolegacy-web`
- `thelingolegacyv-5`

No Worker named askLINGO or a dedicated askLINGO staging service was identified in this list.

## Existing staging Worker

`lingo-studio-control-center-staging` has tags:

- `lingo`
- `staging`
- `read-only`
- `studio-control-center`

Its Worker subdomain is enabled and Preview URLs are enabled. Observability and persisted invocation logs are enabled, with query-string redaction. This is an existing Studio Control Center staging resource, not an askLINGO staging environment. Its explicit `read-only` tag is preserved; do not repurpose it or attach askLINGO data or write capabilities.

## D1 inventory

Four D1 databases were listed:

| Database | Reported tables |
|---|---:|
| `lingo-game-engine-staging-20261107` | 0 |
| `lingo-loyalty-staging` | 0 |
| `world-engine-db` | 0 |
| `lingo-production` | 0 |

No askLINGO-specific D1 database was identified. The zero-table result is a current inventory observation, not a claim that no data exists in other services or external stores.

## Decision

- Do not bind askLINGO to an existing production Worker.
- Do not repurpose the read-only Studio Control Center staging Worker.
- Do not attach askLINGO to game, loyalty, or production D1 databases.
- A dedicated, isolated staging environment remains a prerequisite for runtime acceptance.
- Identity, policy/grant store, approval store, audit sink, and idempotency semantics must be selected and reviewed before resource provisioning.

## Scope and privacy

This inspection read account and Worker/D1 metadata only. It did not retrieve secret values, inspect user data, run SQL, change Worker settings, alter routes, provision databases, or deploy code.


## 2026-11-22 authorized askLINGO staging changes
- Created D1 `asklingo-v2-staging-20261122` (US jurisdiction, ENAM primary, read replication disabled), ID `e041e690-2a45-4c82-8b46-6e012d739972`.
- Uploaded Worker `asklingo-v2-staging`, attached D1 binding `ASKLINGO_DB`, tagged staging/disabled/no-inference, and disabled workers.dev and preview URLs. No routes. No production resource changed.
- Worker is fail-closed scaffold only, not an application runtime. The diagnostic route returns 503; other paths return 404.
- No Firebase project could be provisioned from the available connected tools. Firebase Auth remains a named blocker; no substitution.
- Full details: [23-STAGING-PROVISIONING.md](23-STAGING-PROVISIONING.md).
