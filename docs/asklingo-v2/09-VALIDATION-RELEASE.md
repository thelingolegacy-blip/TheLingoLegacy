# askLINGO v2.0 — Validation and Release Criteria

## Acceptance model

Every deliverable earns its own state. A design document does not establish a runtime. A passing unit test does not establish production readiness. Production promotion remains separate from implementation acceptance.

## Foundation acceptance

- [ ] Existing assets inventoried and linked.
- [ ] Historical and current contracts distinguished.
- [ ] Product identity and domain boundaries accepted.
- [ ] Agent registry and capability vocabulary reviewed.
- [ ] Identity and authorization model reviewed.
- [ ] SAAAE policy and approval model reviewed.
- [ ] Memory and retention model reviewed.
- [ ] API and connector contracts reviewed.
- [ ] UX states and accessibility requirements reviewed.
- [ ] Infrastructure, cost, and operational constraints reviewed.
- [ ] Contradictions and open decisions recorded.

## Runtime acceptance

- [ ] Real staging identity provider provisioned and token verification tested.
- [ ] Default-deny authorization tested at the server boundary.
- [ ] Approval record persistence, digest binding, expiry, revocation, and replay prevention tested.
- [ ] Audit records are durable, access-controlled, and correlated.
- [ ] Provider adapter selected through documented review.
- [ ] Secrets remain server-side and are absent from client bundles/logs.
- [ ] Shared rate limiting and abuse controls tested.
- [ ] Conversation persistence remains off unless separately approved.
- [ ] Product and tenant isolation tested.
- [ ] Prompt-injection and tool-escalation tests pass.
- [ ] Timeouts, retries, idempotency, and provider outage behavior tested.
- [ ] Web and Flutter clients use the same versioned API contract.
- [ ] Accessibility and privacy controls reviewed.
- [ ] Independent security review completed.

## Release acceptance

Require exact source SHA, reviewable diff, CI run/job/step evidence, artifact provenance where applicable, security review, test results, operational runbook, rollback plan, and independent reviewer disposition.

## Production gate separation

1. Architecture acceptance.
2. Implementation acceptance.
3. Pull request review and merge authorization.
4. Release candidate acceptance.
5. Deployment authorization.
6. Deployment execution.
7. Live validation.
8. Production activation authorization.

No stage automatically grants the next stage.

## Current disposition

This document set is architecture work only. No askLINGO production runtime is enabled by this branch. G02 remains BLOCKED / UNVERIFIED; production promotion remains on HOLD; last-known-good remains protected.
