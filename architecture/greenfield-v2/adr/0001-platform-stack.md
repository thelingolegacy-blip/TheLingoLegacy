# ADR-0001: Greenfield Go + PostgreSQL platform core

- Status: Accepted baseline — provider implementation selection intentionally deferred
- Accepted by Program Owner: 2026-11-15
- Date: 2026-11-15

## Context
The current environment spans Next.js, Flutter, Supabase, Firebase, Cloudflare and GitHub, with overlapping identity, hosting and backend responsibilities. Previous audits identified fragmented authority, route/version drift, incomplete backend schemas, unverified mobile/API/game integrations and unreliable runner startup. The greenfield platform must improve consistency without creating duplicate production authorities or unapproved recurring costs.

## Decision
Adopt a provider-neutral modular application baseline:
- Next.js/TypeScript for web and Flutter/Dart for mobile.
- Go modular services with versioned REST/OpenAPI contracts.
- PostgreSQL as the transactional authority for each migrated domain, beginning with an isolated development profile slice.
- Transactional outbox at the database boundary; defer broker selection until delivery volume, ordering, retention and operational requirements are measured.
- OIDC-compatible identity adapter; do not create or switch production identity authority until account-linking and recovery are proven.
- Cloudflare remains the intended public edge, subject to verified zone, route, Worker and origin ownership.
- GitHub remains canonical source and engineering evidence.
- Existing Firebase, Supabase and Worker capabilities are retained only where individually verified and explicitly bounded; no co-equal authority for the same data domain.

## Provider evaluation — not approved for provisioning
AWS services (Cognito, RDS, ECS/Fargate, ElastiCache, MSK, S3), Cloudflare-native services, Firebase/Supabase and managed PostgreSQL alternatives may be evaluated against the same workload requirements. This ADR does not select an AWS account, region, service bundle or IaC tool.

Before selecting a provider, record:
1. Workload fit, data residency, security and operational ownership.
2. Monthly cost estimate at minimum, expected and peak usage, including networking, backups, logs and egress.
3. Free-tier eligibility, quotas, expiry and cost-overrun controls.
4. Exit/migration strategy, portability and restore evidence.
5. Account, region, budget ceiling, owner, alerts and teardown approval.

## Minimum launch topology
Start with the smallest independently testable slice: one modular Go API, PostgreSQL, an atomic outbox record, and a local/disposable integration test environment. Add cache, broker, multi-region and additional managed services only when measured requirements and cost/security review justify them.

## Alternatives
- Continue Firebase and Supabase as co-equal authorities for the same domain: rejected because it creates conflicting ownership and reconciliation risk.
- Move all workloads to Cloudflare Workers/D1 immediately: deferred pending workload-specific compatibility and migration evidence.
- Adopt Kubernetes or active-active multi-cloud for initial launch: deferred until scale and recovery evidence justify the operational complexity.
- Provision a full AWS service bundle before cost/account review: rejected.



## Ratified architecture boundary
The accepted baseline is Go modular services + PostgreSQL transactional authority for migrated domains + transactional outbox, with provider-neutral interfaces. Firebase remains an existing specialist integration where justified; it is not a co-equal transactional authority for the same domain. Cloudflare remains the complementary public edge and delivery layer. Supabase is not selected as the primary authority by this ADR; it may be evaluated only as a PostgreSQL hosting/adapter option against the same workload, cost, portability and operations criteria. No provider is provisioned or migrated by this decision.

## Consequences
Existing identities and data require controlled inventory, canonical ID mapping, account linking, checksummed migration, reconciliation and rollback rehearsal. Wallet/ledger balances, entitlements and game outcomes require domain-specific migration and independent reconciliation; they must not be treated as ordinary profile data. No provider provisioning, production identity/data changes, DNS/route changes, payment activation or deployment is authorized by this ADR.
