# askLINGO v2.0 — Parallel PR Reconciliation

## 2026-11-22 verified reconciliation

This document records the current PR topology and staging boundary. It is an evidence ledger, not merge approval.

### Current PR topology

| PR | Base / dependency | Scope | Current observed state |
|---|---|---|---|
| #643 | `main@3fe099eb11329cc333ffa5a1ea36affcd0375343` | SAAAE foundation and Firestore-oriented adapter/test work | OPEN / DRAFT; head `dcf0f2ed49d596df55ac599850d3099e4ac58000`; 19 files |
| #644 | `main@3fe099eb11329cc333ffa5a1ea36affcd0375343` | askLINGO v2 architecture, 4 isolated modules, focused tests, workflow, docs, staging scaffold | OPEN / DRAFT; 38 files; head was `54cd1d2abcc38e0f9bbb1a1e89359986770a04c9` immediately before this reconciliation update |
| #645 | stacked on #644 | 17-workstream execution plan | OPEN / DRAFT; head `61f10551ee7f6681753344873b25fabf9d5e67e4`; 1 document |
| #646 | stacked on #645 | SAAAE pure policy kernel and tests | OPEN / DRAFT; head `60c1153639c3f9fabda3ee1bf10de9dad5107873`; 4 files |
| #647 | stacked on #645 | Agent capability registry and tests | OPEN / DRAFT; head `18d5dfa06e5af892091992cd6f86445be3a568ef`; 3 files |
| #648 | `main@3fe099eb11329cc333ffa5a1ea36affcd0375343` | Four-product application build baseline and source reconciliation | OPEN / DRAFT; head `79c58f7376c5639caf4dda876b2f7c3966fdfbed`; 1 document |

All six PRs are open, draft, and unmerged at this inspection. GitHub's mergeable flag is not acceptance. #645 depends on #644; #646 and #647 depend on #645. #643 independently overlaps package/test integration concerns with #644 and must be reconciled before integration. #648 is documentation evidence, not implementation or product acceptance.

### Security review findings

- **#646 — action-digest canonicalization:** the PR branch records null-prototype canonical objects, `__proto__` preservation, cycle detection, sparse-array rejection, and targeted regression checks (3/3 reported). Its aggregate `npm test` now preserves slot, TML preview, askLINGO v2, and SAAAE suites. Latest branch sync is based on #645; full suite and hosted CI remain unverified.
- **#647 — capability duplicate key:** the PR branch records unambiguous JSON tuple encoding and a delimiter-injection regression check (1/1 reported). Complete branch suite, hosted CI, workload identity attestation, tenant binding, revocation, and authoritative registry integration remain outstanding.
- **#643 — SAAAE foundation:** the PR contains pure policy, approval, audit, idempotency, and injected Firestore adapter work. A review found a time-of-check/time-of-use gap: the transactional approval consume previously bound only a subset of the signed envelope. The branch now binds request ID, requester/approver identity and type, exact action scope, payload digest, policy version, issuance/expiry, key ID, signature, nonce, and approved status; authored regression cases reject approver and expiry substitution. The changes were fetched back and verified, but tests have not been run in this continuation. No approved non-production Firebase project, IAM proof, signing/key custody, independent audit checkpoint, or protected-operation integration is established. Fake adapters do not prove Firestore transaction concurrency, IAM, or restore behavior.

Targeted regression results are author-reported evidence, not independent acceptance. No PR is approved for integration by this document.

### Hosted CI and G02

The latest recorded Actions evidence in the control tower shows startup failures before job creation, with zero jobs and zero artifacts on the inspected runs. Therefore no test execution, runner identity, sentinel, logs, or artifact evidence is established by those runs. The G02 acceptance contract remains conjunctive and unchanged; G02 is FAIL / UNVERIFIED. Do not enable its protected sentinel, register or relabel a runner, substitute a hosted runner, or weaken its acceptance predicates as a workaround.

The foundation PR's local askLINGO test result is recorded as 29 passed / 0 failed. Full repository `npm test` and hosted CI acceptance are not established by that targeted result. Reconcile #643 and #644 package scripts into one deterministic aggregate test path before integrating either foundation.

### Isolated askLINGO staging resources

A separate Cloudflare staging scaffold has since been provisioned and read-only verified:

- Worker: `asklingo-v2-staging`; one uploaded version and a 100% deployment to this separate Worker.
- Tags: `asklingo`, `staging`, `disabled`, `no-inference`.
- No production route, workers.dev subdomain, preview URL, model/provider binding, or provider secret.
- One D1 binding: `ASKLINGO_DB`, database ID `e041e690-2a45-4c82-8b46-6e012d739972`.
- Worker settings show observability disabled. The scaffold is fail-closed and is not a callable askLINGO service.
- PR #644's staging record states migration 0001 created six application tables, five secondary indexes, and two append-only audit triggers; the application tables were empty at verification.

This is infrastructure provisioning, not a functioning service, identity integration, authorization boundary, persistent approval/audit acceptance, or production activation. Firebase Auth remains blocked pending an approved dedicated non-production Firebase project and authorized access. No production Worker route, DNS, binding, secret, or data was changed.

### Remaining integration sequence

1. Reconcile #643 and #644 package scripts, test ownership, and overlapping policy boundaries. Preserve the exact base/head SHAs and avoid blind merging.
2. Rebase/reconcile #645 on the accepted #644 foundation; then independently re-review #646 and #647 against the resulting exact parent SHA.
3. Run focused tests and the complete repository suite on a functioning, policy-compliant execution path. Keep local, hosted, and independent-review evidence distinct.
4. Obtain an approved non-production Firebase project, service identity, IAM and key-custody plan before testing real identity or Firestore adapters. Do not substitute production credentials.
5. Implement and test durable approval consumption, append-only audit, revocation, tenant/product scoping, idempotency, rate limits, and restore behavior against real authorized staging dependencies.
6. Complete web/mobile/voice integration, browser/device QA, privacy/security review, and independent acceptance before any enablement.
7. Keep provider selection, public facade enablement, production deployment, and promotion as separately authorized decisions.

### Release posture

No merge or production promotion is authorized by this record. The public askLINGO facade remains disabled; staging remains a fail-closed scaffold; G02 remains FAIL / UNVERIFIED; production remains PROTECTED HOLD. Specification, code, provisioning, execution, evidence, independent verification, acceptance, authorization, and promotion are distinct states.


### Additional backend inventory — 2026-11-22

A separate read-only inspection of the connected Supabase account found one active project (ref `zoksxavxmgnkrthselek`, status `ACTIVE_HEALTHY`). Its `public` schema currently has zero application tables; the project reports zero migrations and zero Edge Functions. Security, performance, and health advisor queries returned no lints at inspection time. These empty advisor results are not a security certification.

This Supabase project is not identified in the current askLINGO architecture as the selected backend. Do not create schema, deploy functions, or route application traffic into it until backend ownership, environment, data model, identity integration, and migration authority are explicitly reconciled. The askLINGO Cloudflare D1 staging scaffold remains a separate resource and must not be conflated with this Supabase project.

### Snapshot freshness rule

The #644 head SHA above is a historical pre-update checkpoint. This documentation-only commit advances the #644 branch again. For live branch heads and base relationships, query the current PR metadata; do not treat a SHA recorded inside the branch being updated as a self-updating pointer. No merge, CI pass, backend activation, or production promotion is implied by this documentation correction.


### Latest SAAAE branch repair snapshot — 2026-11-22

PR #643 now includes the approval-envelope compare-and-set hardening described above. Current branch head at the time of this note: `dcf0f2ed49d596df55ac599850d3099e4ac58000`. The repair is source-verified only; no local Node suite, Firestore emulator, live staging transaction, hosted CI, or independent acceptance result is claimed.



### Latest dependency-stack state — 2026-11-22

The prior #645 branch divergence was repaired with non-force merge commit `cdd16b85661ceb347cb0f897f800ca2b0650d6ad`; #645 now compares ahead 4 / behind 0 relative to #644 and is reported mergeable. #646 and #647 were then synchronized with #645 using merge commits `9ae4112819a7d25c4668ab82290b1d958c40d5fc` and `18d5dfa06e5af892091992cd6f86445be3a568ef`; both compare ahead 11 / behind 0 and are reported mergeable. PR #646's aggregate test script was corrected in commit `60c1153639c3f9fabda3ee1bf10de9dad5107873` to include the inherited askLINGO v2 suite as well as SAAAE.

These branch merges are feature-branch synchronization only. All PRs remain draft/unmerged. The most recent inspected workflow runs for #643, #644, and #646 ended `startup_failure`; representative runs had zero jobs and zero artifacts. No full test pass or hosted acceptance is established.
