# LINGO Asset Registry — implementation record

## Product outcome

A mobile-responsive, Industrial Noir / Crimson Shadow Studio interface backed by a Cloudflare Worker API and D1 schema. It governs creative-asset identity, ownership, immutable versions, rights evidence, independent reviews, publication history, rollback and append-only audit events.

## Implemented in this branch

- Registry interface at \`studio-sites/asset-registry/\`.
- Worker API at \`services/asset-registry/worker.mjs\`.
- D1 schema and immutability triggers at \`services/asset-registry/migrations/0001_asset_registry.sql\`.
- Cloudflare Access JWT signature, issuer, audience and lifetime verification.
- Role allowlists for administrator, reviewer, creator and viewer.
- Server-enforced owner checks and owner/reviewer segregation of duties.
- SHA-256 and source-reference validation.
- Publication gate requiring evidence, four current approval types and two distinct independent reviewers.
- Append-only publication/rollback and audit history.
- Node built-in tests for validation and role policy.

## Deliberately not activated

This is a staging implementation proposal, not an operational production service. The current Cloudflare account has two D1 databases with zero tables and R2 is not enabled. No existing production database is reused. No Worker is deployed, no route or DNS is changed, and no asset binary is uploaded. A new staging D1 database, Cloudflare Access application, role allowlists and staging-only hostname are prerequisites.

## Verification required before staging acceptance

1. Run \`node --test services/asset-registry/worker.test.mjs\`.
2. Apply the D1 migration to a new staging database and inspect every table and trigger.
3. Configure Access issuer/audience and encrypted role allowlists.
4. Verify unauthorized, viewer, creator, owner, reviewer and admin scenarios.
5. Test immutable-row update/delete rejection and audit completeness.
6. Test publish rejection for missing checksum, evidence, each approval, owner self-approval and single-reviewer concentration.
7. Verify rollback to a previously published version without deleting history.
8. Perform independent security, accessibility and mobile QA.
9. Only after accepted staging evidence, submit a separate production activation request.

## Evidence boundary

A committed implementation, a passing local unit test or a preview page does not prove deployed identity enforcement, D1 persistence, object durability, public reachability or production readiness. Those require actual staging execution and independently retrievable evidence.
