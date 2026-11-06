# LINGO AI Master — Phase 0 and Phase 1 Execution

**Status:** plan and acceptance contract; no claim of runtime activation.  
**Baseline:** Master Recovery #480.  
**Execution boundary:** isolated development branch and non-production environments only.

## Phase 0 — AI Master bootstrap

| ID | Work package | Acceptance evidence | Initial disposition |
|---|---|---|---|
| AI-001 | Master charter and architecture | reviewed charter, boundaries, dependency map | SPECIFICATION ADDED |
| AI-002 | Intelligent router | unit tests for classification, delegation, fallback and timeout | NOT RUN |
| AI-003 | Agent registry | schema validation, unique IDs, scope review | REGISTRY FILE ADDED; NOT RUNTIME |
| AI-004 | Model adapters | provider connection tests using server-side secrets; cost/timeout tests | BLOCKED: credentials/config not verified |
| AI-005 | Permission system | positive/negative authorization tests and audit events | NOT RUN |
| AI-006 | Evidence generator | schema validation, artifact hashes, reproducible package | SPECIFICATION PENDING IMPLEMENTATION |
| AI-007 | Control dashboard | working controls, role checks, loading/error states | NOT RUN |
| AI-008 | GitHub diagnostics | read-only repository/issue/PR/commit inventory with provenance | PARTIAL: connector inspection only |
| AI-009 | Human approval workflow | deny-by-default tests for all critical actions | NOT RUN |
| AI-010 | Independent acceptance | verifier checklist and signed/retrievable results | NOT RUN |

### Phase 0 exit criteria
- Router and registry execute in a controlled test environment.
- Provider adapters are configured without exposing secrets.
- Tool scopes are least-privilege and tested.
- Human gate blocks every protected action without explicit approval.
- Evidence package is generated from actual runs and independently checked.
- No production mutation or billing action is performed.

## Phase 1 — Foundation lock

| ID | Work package | Acceptance evidence | Initial disposition |
|---|---|---|---|
| FND-001 | Restore main branch protection | live GitHub ruleset/branch protection readback; required checks verified | BLOCKED / NOT VERIFIED |
| FND-002 | G02 runner execution | runner identity, isolated host proof, executed job steps, logs/artifacts and commit correlation | FAIL / UNVERIFIED |
| FND-003 | Gateway asset and route repair | reproduced defect, before/after preview probes, browser journey, no stale chunk/route URLs | BLOCKED |
| FND-004 | Firebase project identity | owner-confirmed project, app IDs, config inventory and secret-safe verification | BLOCKED |
| FND-005 | Reproducible source builds | pinned dependencies, clean build, test logs and artifact digest | NOT VERIFIED |
| FND-006 | LINGO ID auth | register, verify, login, logout, recovery, session and role tests | BLOCKED |
| FND-007 | LegacyXclub membership | enrollment, role/entitlement, renewal/cancel and access tests | NOT VERIFIED |
| FND-008 | Wallet core | ledger invariants, idempotency, reconciliation, authorization and audit tests | NOT VERIFIED |

### Phase 1 exit criteria
- Gateway and Studio routes resolve from canonical GitHub source.
- Firebase project identity and all app configurations agree.
- Identity and membership journeys pass end-to-end tests.
- Wallet ledger invariants and access controls pass.
- G02 is independently verified or a documented alternative isolated CI path is accepted.
- Branch protection and required checks are effective.
- No production release until separate owner authorization.

## Dependency order
1. Repository governance and reproducible source.
2. AI Master read-only diagnostics and evidence generation.
3. Firebase identity resolution.
4. Gateway repair and Studio navigation acceptance.
5. LINGO ID authentication.
6. Membership entitlements.
7. Wallet ledger and commerce certification.
8. Product-by-product parallel activation after shared services pass.

## Work execution record
For each work package, append a dated record with branch, commit, environment, commands, raw result references, hashes, verifier and disposition. Do not change a status to PASS from a plan or unexecuted test.
