# Architecture Decision Record — LINGO Cloudflare-Native Modular Platform

**Decision date:** 2026-11-14  
**Status:** Proposed; draft implementation plan only  
**Decision owner:** The Lingo Legacy platform governance  
**Source of truth:** This repository

## Decision

Adopt a Cloudflare-native modular platform as the immediate execution target. Keep Cloudflare Workers as the edge/runtime and Stack Engine as the control plane. Use D1 for transactional application records and virtual-economy ledger, Durable Objects for coordination requiring per-entity strong consistency or live connections, KV for cache/config snapshots only, R2 for approved assets, Queues for asynchronous messages, and Workflows for durable multi-step jobs.

Design provider-neutral interfaces so Supabase/Postgres and Supabase Auth can be added as optional adapters after operational readiness, cost, security and migration reviews. Do not introduce Supabase, Clerk, Auth0 or a second identity provider as an immediate dependency while GitHub Actions and the existing Cloudflare/Firebase staging baseline remain unresolved.

## Why this decision

- Preserves the existing Cloudflare-first architecture and avoids a second control plane.
- Uses managed primitives already aligned with the current Workers deployment direction.
- Supports many LINGO worlds and games through explicit tenant/world/product partitioning.
- Allows new jobs to be added through reviewed, versioned modules and registry entries.
- Keeps the current virtual-credit game isolated from payments and real-value flows.
- Avoids premature database, identity-provider and hosting migration.

## Target service map

| Layer | Primary choice | Responsibility | Authority |
|---|---|---|---|
| Source/governance | GitHub | Source, review, CI, releases, registry | Authoritative source |
| Edge/runtime | Cloudflare Workers | HTTP/API entry, routing, auth verification, gates | Runtime |
| Control plane | Stack Engine | Service manifest, gate evaluation, readiness, registry | Capability control |
| Transactional store | D1 | Users' app metadata, world/game records, virtual ledger, session metadata | Authoritative records within its domain |
| Live coordination | Durable Objects | Per-player/per-room serialization, WebSockets, transient coordination | Coordination only |
| Cache/config snapshot | KV | Non-authoritative cache and replicated flags | Never ledger/auth authority |
| Object storage | R2 | Publicly approved assets, private generated files | Object storage |
| Async messaging | Queues | At-least-once event delivery and decoupled consumers | Delivery, not business truth |
| Durable jobs | Workflows | Multi-step orchestration, retries, waits and checkpoints | Job execution state |
| Identity | Existing LINGO ID/Firebase staging bridge | Authentication subject and session proof | Identity authority after verification |
| Optional relational expansion | Supabase/Postgres adapter | Relational workloads, analytics and future RLS tenancy | Not selected for MVP |

## Multi-world and multi-tenant data model

Start with one staging D1 database for shared platform metadata and bounded MVP records, subject to its current plan limits. Use explicit `tenant_id`, `world_id`, `product_id` and `environment_id` columns in every tenant-owned record. Enforce ownership in server-side repository functions; D1 does not provide Postgres-style row-level security. Never trust tenant or world identifiers supplied by a browser without deriving and authorizing them against the verified identity and entitlement.

Use composite keys and indexes that include the tenant/world scope. Cross-world queries must be explicit, privileged service operations with an audit record. Do not use KV as an authorization boundary. Keep separate D1 databases for production vs staging and for high-risk isolation boundaries; do not create one database per small feature by default.

### Domain boundaries

- Identity owns identity subjects and authentication lifecycle.
- Wallet owns append-only virtual ledger entries and reconciled balance projections.
- Game Engine owns game rules, RNG/outcomes, session state and settlement intent.
- Commerce owns real-world catalog/order/payment-provider state and remains disabled until accepted.
- Stack Engine owns service registry, runtime health and feature gates, not business data.
- Community, content and support have scoped data access and their own retention policies.

## Job and system factory

New systems are introduced as reviewed code modules, not arbitrary uploaded code:

1. Define a system descriptor with stable ID, owner, version, environment, dependencies, required bindings, routes, events and gates.
2. Define input/output schemas and an idempotency contract.
3. Implement a Worker service module, Queue consumer or Workflow class.
4. Register it in the versioned registry.
5. Add tenant/world authorization, quotas, timeouts, retry limits and redacted audit events.
6. Add unit, contract, integration and failure-recovery tests.
7. Run CI on the exact commit; publish artifacts and evidence.
8. Enable the feature only through a separate gate review.

Dynamic Workers / dynamic workflows are not part of the MVP. They can execute runtime-loaded code and therefore require a separate sandbox, code provenance, permission, network egress, resource budget and abuse review. Tenant-provided code must never receive production secrets or unrestricted bindings.

## Data ownership and consistency

- D1 is authoritative for the virtual ledger and durable game/business records.
- Durable Objects coordinate concurrent session actions; persist only the coordination state needed and reconcile to D1.
- A wallet mutation and its idempotency record must be atomic in the authoritative ledger.
- If a game action changes both ledger and durable session state, use an explicit transaction/outbox or idempotent saga design; do not assume D1 and Durable Object storage form one cross-product transaction.
- Queues are at-least-once: every consumer must deduplicate by event ID and tolerate retries.
- Workflow steps must be idempotent; external side effects require idempotency keys and reconciliation.
- KV is eventually consistent and must not hold authoritative balances, permissions or session ownership.

## Identity decision

Keep the existing LINGO ID / Firebase path as the bridge while the dedicated staging project and app are verified. Define a provider-neutral `IdentityVerifier` interface so a later Supabase Auth adapter can be added without changing product APIs. Do not run two active identity authorities for the same user population. User IDs must be mapped to a stable LINGO-owned subject.

## Cost and plan guardrails

- Start with local tests and synthetic data; do not provision new paid services for architecture validation.
- Cloudflare free limits are finite and change over time. As of the reviewed 2026-11-14 docs, Workers Free includes 100,000 requests/day and 10 ms CPU per invocation; Queues Free includes 10,000 operations/day and 24-hour message retention; Workflows has usage-based steps/storage billing beginning Aug 10, 2026; D1 Free has 10 databases and 500 MB per database in the current published limits.
- Configure spending limits and fail-closed quotas before enabling external AI, high-volume queues, long-running workflows or Durable Object traffic.
- Do not treat “included on Free” as “unmetered” or “no cost”.
- Re-check provider pricing and limits before launch or scale changes.

## Rejected for immediate adoption

- Supabase as the immediate primary store/auth: strong future option, but adds another provider and migration surface before current CI/staging readiness.
- Clerk/Auth0/WorkOS: not required until a verified product need for hosted UI, enterprise SSO or B2B federation exists.
- Vercel/Next.js migration: not required for current Cloudflare-first public candidate.
- Dynamic Workers for tenant-authored jobs: too much runtime code-execution risk for the MVP.
- Database-per-feature: increases provisioning, migrations and operational overhead without a current isolation requirement.

## Consequences

Positive:
- One runtime/control plane and consistent gates.
- New product systems can be registered without inventing a separate stack.
- Tenant/world boundaries are explicit and testable.
- Future database and identity provider changes can be isolated behind adapters.

Trade-offs:
- D1 tenancy enforcement is application-level and must be tested rigorously.
- D1 is not a universal replacement for Postgres analytics or high-contention relational workloads.
- Queue/Workflow delivery requires idempotency, observability and budget controls.
- Cloudflare plan limits may require later paid capacity.

## Activation gates

This ADR does not authorize deployment. Stack Engine integration, staging Firebase verification, D1 schema readback, CI startup recovery, browser/security tests and independent release acceptance remain required. Production remains PROTECTED HOLD; G02 remains FAIL / UNVERIFIED.
