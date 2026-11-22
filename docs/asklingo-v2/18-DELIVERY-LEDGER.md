# askLINGO v2.0 — Delivery Ledger

## Governance state

**Current overall state:** IN PROGRESS / PROTECTED HOLD  
**Working branch:** `feat/asklingo-v2-foundation-2026-11-21`  
**Review:** Draft PR #644; stacked workstreams #645–#647  
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

## Infrastructure evidence

- Read-only Cloudflare inventory found 10 Worker scripts and no dedicated askLINGO staging Worker.
- Existing `lingo-studio-control-center-staging` is explicitly tagged `read-only`; it was not repurposed.
- Four listed D1 databases each report zero tables; none is an askLINGO-specific persistent store.
- No secrets, routes, bindings, settings, databases, or deployments were changed.

## Test evidence

- Local syntax checks: `node --check` on all four new runtime modules and all four test files — PASS.
- Local policy, mode, agent, and request tests: `npm run test:asklingo` — 29 passed, 0 failed.
- Latest GitHub Actions askLINGO run 44968003469 on head `a4b6e76a2ab6843a16363491a258f549ba6d1fe5` — `startup_failure`, zero jobs, no steps; other observed repository workflows on the same head also failed startup with zero jobs; NOT PASS.
- Full repository `npm test` — NOT RUN in this execution.
- Worker integration and live probes — NOT RUN.
- Production deployment — NOT AUTHORIZED and NOT RUN.

## Blocking dependencies

1. A dedicated isolated staging Worker/environment and separately configured staging identity issuer/project.
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


## 2026-11-22 parallel workstream reconciliation

The following stacked/parallel pull requests were inspected after the initial foundation was prepared:

| PR | Branch relationship | Scope | Observed state |
|---|---|---|---|
| #644 | base: `main` | Canonical architecture, 4 isolated v2 modules, tests, workflow, 23 askLINGO docs/index, package test wiring | OPEN / DRAFT; 33 files; 2,111 additions; 2 deletions |
| #645 | base: #644 head branch | 17-workstream execution plan | OPEN / DRAFT; 1 additive document |
| #646 | base: #645 head branch | SAAAE policy kernel and tests | OPEN / DRAFT; 4 files; local test result reported as 11/11; no hosted CI pass |
| #647 | base: #645 head branch | Agent capability registry and tests | OPEN / DRAFT; 3 files; local test result reported as 6/6; no hosted CI pass |

Do not merge these out of order. #645 is stacked on #644; #646 and #647 are parallel children of #645. The PRs remain review candidates, not accepted releases.

### Independent code-review findings

- **#646 — action-digest canonicalization:** fixed on the PR branch with null-prototype canonical objects, `__proto__` preservation, cycle detection, sparse-array rejection, and regression tests. Targeted isolated Node regression checks passed 3/3; this is not a full PR-suite or hosted CI pass. Follow-up review comment: `7071852441`. Atomic approval consumption and trusted server adapters remain mandatory.
- **#647 — capability duplicate key:** fixed on the PR branch with unambiguous JSON tuple encoding and a delimiter-injection regression test. Targeted isolated Node regression check passed 1/1; this is not a full PR-suite or hosted CI pass. Follow-up review comment: `7071852721`. Workload identity attestation, tenant binding, revocation, and authoritative registry loading remain future adapter requirements.

The initial findings have code/test changes on their respective branches, but independent re-review, complete branch test suites, and hosted CI evidence are still outstanding. Neither PR is approved for integration.

### Current hosted validation evidence

At the latest inspected foundation-branch commit, GitHub Actions run IDs `44968046838`, `44968046027`, `44968045281`, `44968044464`, and `44968043725` all completed with `startup_failure`. Each failed before a job was created; no steps or test evidence were produced. This is a repository runner/startup blocker, not a passing test result. Local test evidence remains limited to the individual reported suites; full repository `npm test` and hosted CI acceptance are still outstanding.

### Integration and release posture

No PR was merged, no branch was force-updated, and no production or staging infrastructure was changed. The public facade remains disabled. The dedicated askLINGO staging identity, Worker, persistent approval/audit stores, provider decision, shared rate limiting, web/mobile/voice integration, and independent security/privacy acceptance remain outstanding. Production remains NOT ENABLED; G02 remains FAIL / UNVERIFIED; downstream release gates remain held.


## 2026-11-22 isolated staging provisioning
- Cloudflare D1 `asklingo-v2-staging-20261122` created in US jurisdiction, ENAM primary, read replication disabled.
- Dedicated Worker `asklingo-v2-staging` uploaded with D1 binding; workers.dev and preview URLs explicitly disabled; no routes; observability off; no provider secrets.
- Worker scaffold is fail-closed only (health diagnostic returns 503; all other paths 404); it is not an active askLINGO runtime.
- Migration source `migrations/asklingo-staging/0001_initial.sql` defines identity bindings, exact-scope grants, approvals, append-only audit, rate limits, and idempotency; no conversation content tables.
- Firebase Auth provisioning is blocked: no Firebase/Google Cloud project-management connector or authorized Admin API action is available. No alternate identity provider was substituted.
- D1 schema migration execution, Firebase Auth, trusted server adapters, atomic approval consumption, rate limiting, runtime tests, and end-to-end acceptance remain pending. See [staging provisioning record](23-STAGING-PROVISIONING.md).


### Provisioning verification update — 2026-11-22
- Applied migration `0001_initial.sql` successfully to the dedicated staging D1 database.
- Verified six application tables, five secondary indexes, two append-only audit triggers, and zero rows in all six application tables.
- Worker source and Wrangler configuration are now committed under `workers/asklingo-v2-staging/`; the config pins the D1 binding and explicitly disables workers.dev and preview URLs.
- Re-read Cloudflare metadata: worker subdomain disabled, preview URLs disabled, no routes reported, observability off, no inference/provider binding, and no records in the D1 tables.
- Firebase Auth remains blocked pending connection to the Firebase plugin/project and project-level authorization. The Firebase plugin is available in ChatGPT's plugin directory; no Firebase project has yet been created.
