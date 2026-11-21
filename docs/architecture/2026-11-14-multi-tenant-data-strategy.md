# LINGO Multi-Tenant Data Partitioning and Migration Strategy

**Date:** 2026-11-14  
**Status:** Draft schema contract; do not apply migrations from this document.

## 1. Default partition model

Use a shared D1 database for the bounded MVP, with explicit tenant/world/product scoping. Use separate databases for environments and for future domains that require stronger operational or regulatory isolation. Avoid creating a database for every feature or every small world.

D1 has no Postgres-style Row Level Security. Every read and write must pass through server-side tenant-scoped repositories. A missing tenant context is an authorization failure.

## 2. Common columns

Tenant-owned tables should include:

- `tenant_id` TEXT NOT NULL
- `world_id` TEXT NOT NULL
- `product_id` TEXT NOT NULL
- `created_at` TEXT NOT NULL
- `updated_at` TEXT NOT NULL
- `created_by_subject` TEXT where appropriate
- `record_version` INTEGER NOT NULL DEFAULT 1 where concurrent updates are possible

Use composite uniqueness and foreign keys that carry tenant/world scope. Example:

~~~sql
CREATE TABLE world_memberships (
  tenant_id TEXT NOT NULL,
  world_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','suspended','revoked')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (tenant_id, world_id, subject_id)
);

CREATE INDEX idx_world_memberships_subject
  ON world_memberships(subject_id, tenant_id, world_id, status);
~~~

This is illustrative only. It is not a migration to apply until aligned with the existing LINGO ID schema.

## 3. Repository boundary

Application code should not call `env.DB.prepare(...)` from arbitrary route handlers. Use a scoped repository factory:

~~~js
const scope = await authorizeScope(request, identity);
if (!scope.ok) return forbidden();

const repos = createRepositories({
  db: env.DB,
  tenantId: scope.tenantId,
  worldId: scope.worldId,
  productId: scope.productId
});

return repos.players.getById(playerId);
~~~

The repository adds scope predicates to every query and refuses empty scope values. Avoid generic unscoped get/list methods.

## 4. Data placement

| Data | Primary store | Notes |
|---|---|---|
| Identity subject mapping | Identity domain / D1 metadata | Never store passwords or raw tokens |
| World memberships | D1 | Server-authorized membership |
| Virtual Demo Coin ledger | D1 | Append-only, integer units, idempotent |
| Game rules/version | Versioned source/registry | Do not let client define payout rules |
| Durable player session metadata | D1 | State/version/lifecycle events |
| Live room coordination | Durable Object | Serialize actions; D1 remains business record |
| Queue payload | Queue | Minimal identifiers, re-authorize at consume |
| Workflow checkpoint | Workflows | No secrets in metadata |
| Cache | KV | Non-authoritative only |
| Images/audio/video | R2 | Rights and publication metadata |
| Analytics | Later analytics store | Separate from transactional ledger |

## 5. Isolation test matrix

- [ ] Tenant A cannot read tenant B player by ID.
- [ ] Tenant A cannot update tenant B balance/session.
- [ ] World A cannot call World B private route.
- [ ] Queue message with forged tenant ID is rejected at consumption.
- [ ] Workflow resume re-checks authorization/entitlement where required.
- [ ] Cross-world admin access requires a privileged role and audit event.
- [ ] Missing tenant/world context fails closed.
- [ ] Duplicate idempotency keys across different tenants do not collide.
- [ ] Indexes and unique constraints include the correct scope.
- [ ] Deletion/export requests remain scoped to the correct tenant.

## 6. When to split databases

Split a world/product/domain into its own D1 database only when at least one is true:
- Independent backup/restore or retention requirements.
- Stronger blast-radius or access separation is required.
- Data volume or query load exceeds the shared database budget.
- Migration/release cadence is independently controlled.
- A product has a distinct legal/privacy boundary.

For complex reporting, cross-domain joins, advanced RLS or higher relational workloads, evaluate Supabase/Postgres as a system-of-record adapter. Keep the edge Worker as the only public API boundary.

## 7. Supabase future adapter

If adopted later:
- Supabase Auth becomes the identity authority only after a planned user-subject migration and explicit cutover.
- Postgres RLS policies enforce tenant/world access as a second authorization layer.
- Use service-role keys only server-side; never expose them to browsers.
- D1 may remain as cache/hot-state or be retired per domain after reconciliation.
- Establish dual-read validation, migration checksums, backfill reconciliation, rollback and cutover acceptance before moving any authoritative ledger.
- Do not run Firebase and Supabase as competing identity authorities for the same account population.
