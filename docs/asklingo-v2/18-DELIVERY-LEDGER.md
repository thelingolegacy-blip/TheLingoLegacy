# askLINGO v2.0 — Delivery Ledger

## Governance state

**Current overall state:** IN PROGRESS / PROTECTED HOLD  
**Working branch:** `feat/asklingo-v2-foundation-2026-11-21`  
**Review:** Draft PR #644  
**Production:** NOT ENABLED  
**G02:** FAIL / UNVERIFIED  
**G03–G11:** BLOCKED  
**LKG:** PROTECTED

This ledger records milestone state from inspected source and attributable test evidence. A milestone advances only on its own acceptance criteria.

## Milestone register

| ID | Milestone | Deliverable / acceptance | State |
|---|---|---|---|
| M00 | Preserve and inspect existing assets | Current runtime contract, facade, UI, historical branches, Library source artifacts inventoried | PARTIALLY COMPLETE — remaining branch/library inventory |
| M01 | Canonical product and system architecture | Product charter, architecture, agent registry, identity, SAAAE, memory, API, UX, operations, release docs | DRAFT COMPLETE |
| M02 | Canonical modes and voice architecture | Reconcile 13 source modes, operating states, WebRTC/session-broker requirements, mode resolver, and master system prompt | DRAFT COMPLETE |
| M03 | Historical branch reconciliation | Assess old voice/books branch and retain reusable requirements without unsafe transplant | COMPLETE FOR INSPECTED BRANCH |
| M04 | Policy primitive | Exact-scope default-deny evaluator, action digest, approval snapshot validator | IMPLEMENTED / LOCAL TESTED |
| M05 | Persistent grant and approval adapters | Authoritative grants, atomic approval consumption, revocation, idempotency | BLOCKED — storage and staging identity not selected |
| M06 | Durable audit and evidence | Append-only/tamper-evident audit sink, correlation, retention, verification | BLOCKED — durable store and ownership not established |
| M07 | Isolated staging identity and API | Verified staging identity, policy-enforced query endpoint, disabled-by-default flag | BLOCKED — staging identity/config unavailable |
| M08 | Provider-neutral inference integration | Provider due diligence, data terms, cost ceiling, adapter, timeouts, safety | BLOCKED — provider not selected/approved |
| M09 | Web and Flutter experience integration | Shared API client, privacy UX, auth/session, accessibility, failure states | NOT STARTED — dependent on M05–M08 |
| M10 | Voice and multimodal integration | Authenticated session broker, consent, short-lived session credentials, client/device tests | NOT STARTED — dependent on M05–M08 |
| M11 | Security, privacy, and recovery acceptance | Independent threat review, adversarial tests, retention/deletion, restore exercises | NOT RUN |
| M12 | Release candidate and production gates | Independent acceptance, G02 and downstream gates, explicit deployment/activation authorization | BLOCKED / NOT AUTHORIZED |

## Test evidence

- Local syntax checks: `node --check src/ai/v2/policy.mjs` and `node --check scripts/tests/ask-lingo-governance.test.mjs` — PASS.
- Local policy tests: `npm run test:asklingo` — 10 passed, 0 failed.
- Latest GitHub Actions askLINGO run 44967512863 on head `3a05947d5f3e0a0a51c3eb2228f5a05a03154fb1` — `startup_failure`, zero jobs, no steps; other observed repository workflows on the same head also failed startup with zero jobs; NOT PASS.
- Full repository `npm test` — NOT RUN in this execution.
- Worker integration and live probes — NOT RUN.
- Production deployment — NOT AUTHORIZED and NOT RUN.

## Blocking dependencies

1. A separately configured staging identity issuer/project and verified token lifecycle.
2. A selected persistence platform with atomic approval consumption and durable audit semantics.
3. Independent approval for any provider, data processing, retention, and cost ceiling.
4. A shared rate-limit and abuse-control design.
5. Successful hosted CI execution and full repository test evidence.
6. Independent security/privacy review and recovery evidence.
7. Separate human release and deployment authorization.

## Stop conditions

Do not merge PR #644, enable the production facade, change `ask_lingo: false`, transplant the historical provider routes, enable the staging sentinel, alter production bindings/routes/secrets, persist conversations, provision paid resources, or deploy as a workaround for a blocked milestone.

## Completion definition

askLINGO v2.0 is not complete until M00–M11 have independently earned acceptance and M12 has received its separate authorization. Architecture completeness, local tests, and a draft PR are not runtime launch evidence.
