# askLINGO v2.0 — Parallel PR Reconciliation


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
