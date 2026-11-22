# SAAAE policy kernel — implementation boundary

## Delivered in this change

- A pure server-side decision function with default-deny behavior.
- Exact tenant, product, resource type, resource ID, operation, and environment matching.
- Active subject/grant checks, grant validity windows, explicit policy availability/version, and an explicit approval-policy flag.
- Revocation must be affirmatively clear; unknown or unavailable revocation state denies.
- When policy requires approval: requester/approver separation, exact action-digest match, exact scope match, expiry, and unconsumed approved state are required.
- A deterministic SHA-256 action-descriptor digest helper using prototype-safe canonical objects, cycle detection, and sparse-array rejection.
- Node test coverage integrated into the repository's npm test script.

## Deliberate limitations

This is a decision kernel, not a complete SAAAE service. It does not authenticate Firebase tokens, resolve authoritative grants, query revocation state, persist/consume approvals, write durable audit events, enforce distributed rate limits, execute downstream actions, or prove identity-provider availability. The adapter that supplies subject, grant, policy, revocation, and approval must obtain each from trusted server-side sources and must atomically consume single-use approvals before execution. A caller-supplied object or client claim is not an authoritative record.

The kernel is not wired into handleAskLingoRequest; the public facade remains disabled. No inference provider, secret, database, Cloudflare binding, route, DNS record, Firebase resource, or production runtime is configured or changed.

## Decision contract

evaluateAuthorization(input, nowMs) returns only ALLOW or DENY with a stable reason and policy version. Missing or malformed inputs, missing policy flags, scope drift, stale grants, uncertain revocation, and invalid approval state deny. Scope matching is exact; wildcard grants and implicit inheritance are not supported.

createActionDigest(descriptor) canonicalizes plain JSON-compatible objects by sorting object keys, preserving special keys such as `__proto__` as data, rejecting cycles and sparse arrays, and hashing the resulting UTF-8 JSON with SHA-256. The caller must include every material effect and target in the descriptor and validate it against an authoritative action schema before approval.

## Validation

Run:

    npm run test:asklingo:saaae
    npm test

Expected environment: Node.js >=20. CI execution evidence must be collected from the actual workflow run, job, steps, logs, and artifacts. A source-level test file or queued workflow is not a test pass.

## Next integration gates

1. Trusted server adapters for verified identity, grants, policy, revocation, approvals, and durable audit.
2. Transactional approval consumption and idempotency.
3. Cross-isolate/distributed rate limiting and replay protection.
4. Threat-model review and independent security tests.
5. Staging-only integration behind a separate reviewed feature gate.
6. Independent acceptance before any production authorization.