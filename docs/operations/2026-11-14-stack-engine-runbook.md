# Stack Engine — Build, Verification & Release Runbook

**Date:** 2026-11-14  
**Scope:** isolated staging implementation and verification  
**Production disposition:** no deployment or configuration mutation authorized

## Objective

Deliver a dependable orchestration layer for The Lingo Legacy that exposes liveness, readiness, runtime manifest, module registry, independently controlled feature gates, and graceful disable/resume semantics. The Stack Engine must coordinate existing services rather than duplicate their business logic.

## 1. Non-negotiable implementation rules

- GitHub remains source of truth; Cloudflare remains target edge.
- Never route a staging Worker to the production Firebase project.
- Do not treat a static assets binding as a Worker-internal fetch router.
- Do not expose `Object.keys(env)`, raw environment values, tokens, secrets, or personal data.
- Do not use an unrestricted repository root as the static asset directory.
- Liveness must not depend on D1, Firebase, KV, or external providers.
- Missing or invalid gate configuration is disabled.
- Demo credits are virtual and non-redeemable; payments, cashout, and real-value awards remain closed.
- Disable blocks new operations but preserves durable state.
- No deployment until current-head CI, dry-run, staging identity, schema and rollback requirements pass.

## 2. Runtime route contract

| Route | Method | Expected behavior |
|---|---|---|
| `/healthz` | GET | 200 while Worker can answer; no dependency calls |
| `/readyz` | GET | 200 only when required configured dependencies pass; otherwise 503 with redacted per-dependency state |
| `/api/v1/platform/manifest` | GET | Versioned, non-secret capability manifest |
| `/api/v1/platform/status` | GET | Runtime state, release disposition, safe public module statuses |
| `/api/v1/platform/gates` | GET | Effective gates and reasons; never secret values |
| `/api/v1/platform/modules` | GET | Registry entries, owners, health contracts and gate bindings |
| `/api/v1/admin/gates/:id` | POST | Disabled by default; authorized admin mutation, CSRF/origin validation and append-only audit |

If a route is not implemented, return 404. Do not report a module as operational solely because it is registered.

## 3. Gate model

Use an explicit schema with fields:

- `id`, `enabled`, `environment`, `risk_class`, `required_dependencies`, `reason`, `updated_at`, `updated_by`, `version`.
- Environment is explicit and must never default to production.
- Gate changes use compare-and-swap/version checks.
- Every transition emits a redacted append-only audit event.
- Admin mutations require authenticated authorization, origin/CSRF validation, schema validation, request-size limits and rate limiting.

Suggested independent gates:

| Gate ID | Default | Scope |
|---|---|---|
| `public_hq` | enabled | Public static/content routes only |
| `demo_gameplay` | disabled | Anonymous virtual demo |
| `registered_play` | disabled | Authenticated player sessions |
| `wallet_mutation` | disabled | Virtual ledger writes |
| `commerce_checkout` | disabled | Real merchant checkout |
| `ai_provider_calls` | disabled | External model/provider calls |
| `community_interaction` | disabled | User-generated content and messaging |
| `real_value_rewards` | permanently closed | Out of current launch scope |

## 4. Probe semantics

### Liveness

- No D1 query.
- No Firebase call.
- No external network request.
- No configuration failure should prevent liveness response.
- Return only a minimal status and build/version identifier.

### Readiness

- Validate environment configuration.
- Probe only dependencies required by the selected service profile.
- D1 probe uses a bounded read-only query and validates expected schema version.
- Firebase probe verifies the configured non-production project identity and token-verification metadata; never returns credentials.
- Optional dependencies appear as optional/unconfigured rather than making unrelated services appear unhealthy.
- Return 503 when a required dependency is absent or fails.

## 5. Disable/resume lifecycle

1. Receive authenticated admin request.
2. Validate origin, CSRF token, role, payload schema, size and idempotency key.
3. Check expected gate version; reject stale writes.
4. Persist gate transition and append audit event atomically where the storage model permits.
5. Block new requests at the service boundary.
6. Preserve active durable records; do not delete balances, sessions, checkpoints or ledger entries.
7. Resume only after fresh identity verification, dependency readiness, schema compatibility and current policy evaluation.
8. Emit an audit event for resume and expose a redacted status.

For a game session, the session state machine must be separate from spin idempotency rows:

`active → suspended → active`, and terminal states `completed` or `expired`.

A suspended session cannot accept spins. Resume must use the same authenticated owner, a valid session version, and a fresh gate check.

## 6. Game-session integration acceptance

Issue #584 is the controlling implementation record. Required model:

- Durable player session ID and owner UID.
- Game/product ID and rules version.
- State: active, suspended, completed, expired.
- Monotonic state version.
- Checkpoint/state payload with strict schema and size limits.
- Created, updated, last-action and expiry timestamps.
- Idempotency key and append-only lifecycle events.
- Optimistic concurrency on every transition.
- Spin debit, payout, XP, session version and event append must commit atomically.
- Replay of a completed request returns the original result without a second debit/payout.
- Disable/re-enable preserves state and does not duplicate a settlement.

Do not repurpose `lingo_game_sessions` if it currently stores per-spin settlement/idempotency records. Add a distinct player-session table and event table with explicit migration and tests.

## 7. Build and test sequence

Run on the exact candidate commit after GitHub Actions job instantiation is restored:

1. Syntax checks for Worker, service modules, auth modules and tests.
2. Node unit tests for route contracts, gate defaults, schema validation and authorization.
3. SQLite/D1 migration tests including fresh install and repeat application.
4. Ledger tests for integer arithmetic, insufficient balance rollback, idempotency and append-only constraints.
5. Session tests for create, inspect, suspend, resume, complete, expiry and stale-version rejection.
6. Atomicity tests for failed spin settlement and failed session transition.
7. Rate-limit tests at threshold, over threshold, and new window.
8. Firebase token tests for correct audience/issuer/project and invalid/expired tokens.
9. Wrangler v4 dry-run against staging config.
10. Browser E2E for anonymous demo, registered sign-in, game session, disable, resume and logout.
11. Failure injection for D1 outage, Firebase outage, malformed flags, stale config and missing optional dependencies.
12. Accessibility, keyboard/gamepad/TV navigation and mobile viewport QA.
13. Artifact upload containing test logs, dry-run output, migration readback, commit SHA and environment identifiers (no secrets).

## 8. Staging prerequisites

- Dedicated Firebase staging project and Web app are verified from the provider console/API.
- Project ID is explicitly non-production and matches the Firebase app config.
- `FIREBASE_PROJECT_ID` and any secret bindings are provisioned through approved secret management, not committed source.
- D1 database ID is verified and migrations are applied through the controlled migration workflow.
- Expected schema and migration ledger are read back.
- Staging browser origin is verified before adding it to CORS allowlist.
- Staging Worker source and route are absent or independently inventoried before any deployment attempt.
- A rollback artifact and exact prior deployment version are recorded.

## 9. Rollback and incident response

- Gate off the affected feature first; do not delete state.
- Preserve request IDs, commit SHA, environment, deployment ID and redacted error details.
- If data integrity is uncertain, stop writes and reconcile ledger/session events before resuming.
- Roll back to the last accepted staging artifact; never replace the protected production last-known-good.
- Re-enable only after replay/concurrency tests and independent review pass.
- Escalate any suspected secret exposure, cross-tenant access, unauthorized payment, real-value path or production-data mutation as a security incident.

## 10. Release acceptance checklist

- [ ] Current-head GitHub Actions run has instantiated jobs and completed steps.
- [ ] All required tests pass and artifacts are retrievable.
- [ ] Wrangler dry-run passes for the exact commit and staging config.
- [ ] Dedicated Firebase staging project/app verified; no production project binding.
- [ ] D1 schema and migration state verified.
- [ ] Liveness works during dependency outage.
- [ ] Readiness accurately reports dependency failure.
- [ ] Unknown/missing gates are disabled.
- [ ] Admin gate changes are authenticated, audited and version-checked.
- [ ] Disable preserves session and ledger state.
- [ ] Resume does not duplicate or lose state.
- [ ] Spin and session updates are atomic and idempotent.
- [ ] Browser, mobile and TV QA passes for the declared scope.
- [ ] Security/privacy review and independent staging acceptance are recorded.
- [ ] Production release remains a separate approval with explicit authorization.

**Current disposition:** DESIGN / SOURCE PREPARATION ONLY. No production or staging deployment is approved by this runbook.
