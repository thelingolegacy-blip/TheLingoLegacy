# LINGO Systems Factory — Modular System and Job Creation Standard

**Version:** 1.0-draft  
**Date:** 2026-11-14  
**Status:** Design contract; no runtime job creation is enabled.

## 1. Objective

Provide one governed way to register, build, test, enable, disable and retire systems across LINGOlegacy, LINGOslots, LINGOarcade, LINGOlibrary, LINGOmedia, LINGOworld and future worlds.

A system is a versioned deployable capability. A job is a bounded unit of asynchronous or durable work. A tenant is an authorized organization/account boundary. A world is a product-space boundary. A game is a specific interactive product. These identifiers are related but not interchangeable.

## 2. Canonical hierarchy

`portfolio → tenant → world → product → system → module → job`

- Portfolio: The Lingo Legacy.
- Tenant: customer/organization/account boundary.
- World: LINGO product family or experience.
- Product: That’s My Lingo, KOTTONSCODE, Doughboys Oasis, etc.
- System: identity, wallet, game engine, content, support, commerce, AI gateway.
- Module: versioned implementation unit.
- Job: one execution of a registered task/workflow.

Every request must resolve the authenticated principal, tenant, world, product, system and operation before touching tenant-owned data.

## 3. System descriptor

Each system descriptor must include:

- `system_id` — immutable lowercase slug.
- `display_name` — user-facing name.
- `owner` — accountable team/service.
- `version` — semantic version.
- `environment` — local/test/staging/production.
- `status` — planned/registered/ready/enabled/disabled/deprecated.
- `tenant_scope` — global/tenant/world/product.
- `dependencies` — required service IDs and minimum versions.
- `bindings` — named, least-privilege bindings only.
- `routes` — method/path/schema/auth/gate.
- `events` — consumed and emitted versioned event types.
- `jobs` — job IDs, trigger types, retry policy, timeout, idempotency.
- `quotas` — per-tenant and global limits.
- `data_classification` — public/internal/confidential/restricted.
- `health_checks` — liveness/readiness requirements.
- `rollback_version` — last accepted version.

Unknown fields, duplicate IDs, missing owners, unbounded retries, wildcard permissions and unknown dependencies must fail validation.

## 4. Job classes and trigger model

| Job class | Primitive | Example |
|---|---|---|
| Immediate request | Worker module | Validate and accept a command |
| Async event | Queue + consumer | Process game analytics event |
| Durable multi-step | Workflow | Account onboarding or content approval |
| Per-entity serialized | Durable Object | Live game room / player session coordination |
| Scheduled | Cron → Queue/Workflow | Daily reward eligibility evaluation |
| Human approval | Workflow wait/event | Rights review or release acceptance |

Do not create one Queue per user or one Workflow class per product by default. Partition messages by stable tenant/world/resource IDs and use bounded concurrency.

## 5. Job execution contract

Every job must define:
- Input schema and maximum payload size.
- Tenant/world scope and authorization source.
- Unique job ID and idempotency key.
- Correlation ID and causation ID.
- Maximum attempts, exponential backoff and dead-letter strategy.
- Wall-clock and CPU budget.
- Cancellation and timeout behavior.
- Retry-safe side-effect policy.
- Redacted structured logs and metrics.
- Result schema and terminal states.
- Retention and replay policy.

Suggested job states: queued, running, retry_wait, succeeded, failed, cancelled, dead_lettered.

Consumers must assume at-least-once delivery. A successful operation followed by a lost acknowledgment may be delivered again. Deduplicate using a durable idempotency record, not an in-memory set.

## 6. Registry and gates

The registry is versioned in GitHub and loaded as a validated manifest. It is not an arbitrary public API that accepts executable code.

Each system has independent gates for:
- registration
- public visibility
- authenticated use
- data writes
- queue production
- workflow execution
- external provider calls
- commerce/payment
- production release

Unknown or absent gates default to disabled. The public status endpoint reveals only safe capability states and reasons; it never lists secret binding names or values.

## 7. Multi-tenant isolation requirements

- Derive tenant membership from verified identity and server-side membership records.
- Validate tenant and world access on every request and every background job.
- Include tenant/world identifiers in every tenant-owned primary/unique key and relevant index.
- Bind Queue messages and Workflow payloads to a tenant/world and re-authorize at execution time.
- Do not rely on a client-supplied tenant ID, KV key prefix or route path as authorization.
- Never allow cross-tenant object lookup by globally guessable ID alone.
- Add negative tests for tenant A attempting to read/write tenant B records.
- Require explicit privileged service role and audit trail for cross-world operations.

## 8. Workflow design and Dynamic Workers caution

Use statically reviewed Workflow classes for the initial platform. Cloudflare Dynamic Workers can load and execute runtime code in a sandbox, and can be paired with Workflows for dynamic workflow definitions. This is an advanced extension, not a shortcut for routine job registration.

Before considering dynamic tenant code, require:
- Signed/verified code provenance and version pinning.
- A sandbox with minimal bindings and network access disabled by default.
- No production secrets or direct ledger/database credentials.
- CPU, memory, wall-clock, storage and invocation quotas.
- Per-tenant isolation and abuse detection.
- Audit, kill switch, artifact retention and reproducible replay.
- Security review and explicit feature gate.

## 9. Operational controls

- Liveness is independent of database/provider dependencies.
- Readiness verifies only required dependencies and reports safe failure reasons.
- Queue depth, age, retry count, dead-letter count and consumer failures are observable.
- Workflow step failures, retry exhaustion and long waits are observable.
- Every deployment is correlated with commit SHA, manifest version and environment.
- Disable stops new work; drain/cancel policy is explicit; durable state is retained.
- Re-enable requires a fresh readiness check and gate evaluation.

## 10. New system onboarding checklist

- [ ] Product and system IDs approved in the portfolio register.
- [ ] Owner, scope, data classification and rights/privacy review recorded.
- [ ] Descriptor and schemas committed.
- [ ] Dependencies and least-privilege bindings reviewed.
- [ ] Tenant/world authorization tests pass.
- [ ] Idempotency, retries, dead-letter and cancellation tested.
- [ ] Cost/quota limits set.
- [ ] Liveness/readiness probes implemented.
- [ ] CI jobs execute and artifacts are retrievable.
- [ ] Staging browser/integration test passes.
- [ ] Independent acceptance and gate authorization recorded.

## 11. Explicit non-goals

This standard does not enable self-service executable code uploads, arbitrary dynamic Workers, tenant-controlled secrets, real-money game features, payments, cashout, or production release. Those require separate security, legal, operational and release decisions.
