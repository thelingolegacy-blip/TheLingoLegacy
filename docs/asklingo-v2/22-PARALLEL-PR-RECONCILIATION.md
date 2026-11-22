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

- **#646 — action-digest canonicalization:** the canonicalizer builds ordinary objects and assigns arbitrary keys. A `__proto__` property can mutate the output prototype and be omitted by JSON serialization, potentially making distinct action descriptors hash to identical canonical bytes. Add prototype-safe serialization and regression tests for top-level/nested `__proto__`; add deterministic cycle rejection. A review comment was posted (review ID `6009244396`). The PR's own documentation correctly states that approval consumption must still be atomic and server-side.
- **#647 — capability duplicate key:** joining six arbitrary scope strings with U+001F is ambiguous when a field contains that delimiter. Replace with an unambiguous tuple encoding and add a delimiter-injection regression test. A review comment was posted (review ID `6009244459`). Server-side identity attestation, tenant binding, revocation, and authoritative registry loading remain future adapter requirements.

These comments are review findings, not accepted fixes. Both PRs remain unapproved for integration until addressed and re-reviewed.

### Current hosted validation evidence

At the latest inspected foundation-branch commit, GitHub Actions run IDs `44968046838`, `44968046027`, `44968045281`, `44968044464`, and `44968043725` all completed with `startup_failure`. Each failed before a job was created; no steps or test evidence were produced. This is a repository runner/startup blocker, not a passing test result. Local test evidence remains limited to the individual reported suites; full repository `npm test` and hosted CI acceptance are still outstanding.

### Integration and release posture

No PR was merged, no branch was force-updated, and no production or staging infrastructure was changed. The public facade remains disabled. The dedicated askLINGO staging identity, Worker, persistent approval/audit stores, provider decision, shared rate limiting, web/mobile/voice integration, and independent security/privacy acceptance remain outstanding. Production remains NOT ENABLED; G02 remains FAIL / UNVERIFIED; downstream release gates remain held.
