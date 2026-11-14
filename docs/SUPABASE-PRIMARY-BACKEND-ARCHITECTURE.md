# LINGO Supabase-primary backend architecture

## Status and authority

- Decision: Supabase is the primary target for transactional application data and shared backend capabilities.
- Identity transition: Firebase Auth remains the compatibility identity provider until account mapping and token/RLS tests pass.
- Specialist services: retain Firebase products that are materially better suited to their role.
- Edge and delivery: Cloudflare remains the authoritative edge, routing, and public asset layer.
- Source of truth: GitHub repositories and reviewed migrations.
- Release state: PROTECTED HOLD. This document and related pull requests do not authorize production migration, deployment, DNS changes, or Firebase removal.

This is a staged architecture decision, not a claim that the connected Supabase project is already a populated LINGO application backend. The inspected project currently has no LINGO application tables, migration history, or Edge Functions.

## Target service map

Flutter mobile / React-Next web / Unity games
  -> LINGO application service boundary
  -> Supabase PostgreSQL: profiles, entitlements, wallet ledger, commerce, inventory, game progression, community metadata
  -> Supabase Auth / Firebase Auth bridge
  -> Supabase Storage / Realtime / Edge Functions
  -> trusted server-side integration adapters

Cloudflare Workers, R2, DNS, routing, caching, and request controls remain the edge and delivery layer.
Firebase FCM, Crashlytics, Analytics, Remote Config, App Check, App Distribution, and Test Lab remain specialist services where they fit.
GitHub remains source, migrations, CI, reviews, evidence, and release provenance.

## Responsibility boundaries

### Supabase — primary application backend

Use PostgreSQL as the system of record for relational and transactional LINGO data. Evaluate these domains as independently versioned schemas/modules before implementation:

- Identity mapping and profile preferences.
- Roles, permissions, entitlements, and account-level settings.
- Catalogs, products, orders, inventory, and commerce events.
- Wallet accounts, immutable ledger entries, holds, reversals, and reconciliation.
- Game profiles, progression, achievements, tournaments, and leaderboards.
- Community membership, follows, moderation state, and user-generated metadata.
- Content metadata and cross-world relationships.
- AI orchestration configuration, task metadata, and audit events.

Use Supabase Auth when a new identity flow is ready, or integrate existing Firebase Auth tokens as a third-party provider after validating issuer, audience, role claims, and restrictive RLS boundaries. Do not assume Firebase UIDs and Supabase user UUIDs are interchangeable; use an explicit identity mapping.

### Firebase — retained specialist and compatibility layer

Keep existing Firebase integrations during the transition. Retain or evaluate these services independently:

- Firebase Authentication for existing accounts until identity migration is proven.
- Firebase Cloud Messaging for push notifications.
- Crashlytics for Flutter and Unity crash diagnostics where supported.
- Analytics for product telemetry where the privacy and consent model permits.
- Remote Config for client feature flags and staged rollout controls.
- App Check for supported Firebase endpoints.
- App Distribution and Test Lab for mobile distribution/testing workflows.

Do not remove Firebase packages, projects, rules, or credentials as part of the first Supabase integration.

### Cloudflare — edge and delivery

Cloudflare remains responsible for DNS, Workers, routing, request controls, edge caching, and public asset delivery. Use R2 for large public media when it is more appropriate than database-adjacent storage. Keep privileged backend keys in server-side Worker secrets only. Never expose service-role credentials to browsers, Flutter, or Unity.

### Application adapters

- Web: server-only integration for privileged operations; browser clients use publishable keys and user sessions only after RLS is implemented.
- Flutter: introduce the official Supabase Flutter client only after package/lockfile and Firebase-token compatibility work is reviewed. Existing Firebase initialization remains in place during the transition.
- Unity: communicate through authenticated application APIs or scoped user tokens; never embed a service-role key.
- Games and wallet: clients submit intents; trusted server-side logic validates and executes mutations.

## Wallet and virtual-economy invariants

Wallet and Lingo Coin balances must never be client-authoritative. The implementation must provide:

1. Immutable ledger entries; corrections are compensating entries, not edits to history.
2. Atomic debit/credit and transfer operations.
3. Idempotency keys for every mutation and retry.
4. Server-side authorization and ownership checks.
5. Explicit separation of promotional, earned, purchased, and non-redeemable play balances where product rules require it.
6. Reconciliation, audit events, and deterministic replay tests.
7. No cash-out or real-money wagering capability unless separately reviewed and legally authorized.

## Environment and configuration policy

- Keep development, preview, and production configuration separate.
- Prefer local Supabase development for schema iteration before provisioning additional hosted environments.
- Do not create paid projects or branches without reviewing the quoted cost and obtaining approval.
- Store only SUPABASE_URL and the publishable key in public-capable runtime configuration.
- Store secret/service-role keys only in trusted server-side secret stores; never commit them.
- Do not place credentials in wrangler configuration, client bundles, build artifacts, logs, or issue comments.
- Do not configure production Worker variables until the isolated preview is independently verified.

## Migration sequence

### Phase 0 — inventory and contract
- Inventory Firebase Auth, Firestore/Realtime Database, Storage, Functions, rules, and app-specific data usage.
- Inventory all current consumers in Flutter, web, Unity, and Workers.
- Identify existing user IDs, ownership relationships, retention rules, and data sensitivity.
- Publish domain ownership and API contracts before DDL.

### Phase 1 — safe connectivity
- Add server-only Supabase configuration and a non-sensitive connectivity probe.
- Configure preview-only environment variables.
- Verify build, type-check, preview runtime, and secret non-disclosure.
- Do not move user data or create application tables in this phase.

### Phase 2 — identity compatibility
- Configure Firebase third-party auth integration only after Firebase project ownership and token claims are verified.
- Establish explicit provider/subject-to-internal-user mapping.
- Test sign-up, sign-in, refresh, logout, account linking, disabled users, and cross-project token rejection.
- Keep Firebase Auth as rollback path until independent acceptance.

### Phase 3 — domain schema and authorization
- Design migrations for profiles and least-privilege ownership first.
- Enable RLS on every exposed table; write per-operation policies and negative tests.
- Keep internal-only tables and functions out of exposed schemas.
- Run Supabase security/performance advisors and independent SQL review.

### Phase 4 — first application vertical
- Choose a low-risk read-only catalog/profile vertical.
- Run dual-read comparisons if needed; do not dual-write without idempotency and reconciliation.
- Validate Flutter, web, and Worker consumers in isolated preview.
- Promote only after traceable test evidence and rollback rehearsal.

### Phase 5 — transactional services
- Implement commerce, inventory, and wallet ledger as server-authorized transactions.
- Add idempotency, replay, reconciliation, and concurrency tests.
- Keep economy features disabled until all security and product/legal gates pass.

### Phase 6 — games, community, and AI
- Migrate progression, achievements, leaderboards, community, and AI task metadata by domain.
- Use Realtime or Cloudflare Durable Objects only where the measured interaction pattern justifies them.
- Preserve Firebase specialist telemetry and notifications as appropriate.

### Phase 7 — controlled retirement
- Remove an old Firebase data path only after consumer inventory is complete, parity is independently proven, backups/exports are verified, rollback has been rehearsed, and production authorization is explicit.

## Acceptance evidence

Each gate requires retrievable evidence tied to source commit, build, test run, artifact, deployment version, and runtime probe. A code change, a green-looking status label, or a successful API connection alone is insufficient.

Required evidence includes:

- Migration diff and clean apply/replay on an isolated database.
- RLS positive and negative tests across anonymous, authenticated, cross-user, and privileged contexts.
- Auth compatibility tests for existing Firebase identities.
- Flutter/web/Unity integration test results.
- Wallet concurrency, idempotency, replay, and reconciliation tests before wallet activation.
- Secret scanning and proof that no privileged key is shipped to a client.
- Preview runtime health and rollback evidence.
- Independent release approval before production changes.

## Current execution status

- Supabase project connection: verified by provider tooling.
- Supabase project health: provider reports healthy.
- LINGO application schema: NOT BUILT.
- Migrations: NONE.
- Edge Functions: NONE.
- Web connectivity integration: implemented on a draft PR; build and runtime verification pending.
- Flutter/Unity data adapters: NOT IMPLEMENTED.
- Firebase Auth bridge: NOT CONFIGURED.
- Production cutover: NOT AUTHORIZED.
