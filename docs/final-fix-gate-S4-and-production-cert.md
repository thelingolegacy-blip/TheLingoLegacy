# Control-Plane Final Fix & Certification Plan

**Status:** PROPOSED / STAGING-READY  
**Governance:** FAIL-CLOSED ACTIVE → LKG PROTECTED  
**Canonical sequence:** SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → PASSED → AUTHORIZATION → PROMOTION → POST-PROMOTION

## 1. Non-negotiable controls

1. Runtime evidence is produced only by the designated execution environment. No chat, test fixture, or verifier may manufacture it.
2. Code merge, unit-test success, and workflow success never constitute production authorization.
3. Missing, malformed, truncated, stale, or mismatched evidence blocks the next gate.
4. Production mutation remains prohibited until certification is independently accepted and explicit human authorization exists.
5. LKG remains protected throughout every staging and production attempt.

## 2. Phase 1 — PR #218

**Target:** `444e8ce2cce047852d353e10bb770356dd6a0904`

Required before merge:

- Constellation workflow executes on the PR.
- S4 regression suite passes.
- Runner evidence contains an actually allocated runner and executed steps.
- Workflow permissions are read-only for production infrastructure/secrets.
- No production mutation occurs.

A green PR is a code gate only. It does not certify production.

## 3. Phase 2 — staging execution

Two runs are required, sequentially, on an isolated staging host.

### Run 1 — forced failure

```bash
bash scripts/run-forced-failure-staging.sh
```

Required result:

```
MUTATING
→ ROLLBACK_REQUIRED
→ ROLLING_BACK
→ ROLLED_BACK
```

Required artifacts:

- `staging-forced-failure.log`
- terminal `.lkg_journal.json`

### Run 2 — clean activation

```bash
bash scripts/run-clean-staging-activation.sh
```

Required result:

```
AUTHORIZED
→ MUTATING
→ POST_MUTATION_VERIFY
→ PROMOTED
→ POST_PROMOTION_VERIFY
→ ACTIVATED
```

Required artifacts:

- `staging-clean-activation.log`
- terminal `.lkg_journal.json`

### Staging isolation

Every staging target must be explicitly allowlisted. Do not use a loose hostname regex.

Required pattern:

```regex
^(?:[a-z0-9-]+)-(?:staging|stg)\.[a-z0-9.-]+$
```

The executable guard must validate:

- `CF_ACCOUNT_ID`
- `CF_SCRIPT_NAME`
- `FIREBASE_SITE_NAME`
- `CLOUD_RUN_SERVICE`
- canonical staging hostname(s)

against an explicit staging allowlist or deterministic staging naming contract.

A production-looking target is a hard failure.

## 4. Phase 3 — independent 12-point reconciliation

For each staging bundle:

1. Verify staging isolation.
2. Verify pre-mutation Worker LKG version ID.
3. Verify pre-mutation Firebase Hosting rollback identifier using the actual supported API/primitive.
4. Verify observed Cloud Run serving revision from observed traffic state, not merely desired configuration.
5. Correlate mutation events with the journal.
6. Verify intentional Worker failure in Run 1.
7. Verify atomic `ROLLBACK_REQUIRED` and `ROLLING_BACK` transitions.
8. Verify component-specific rollback operations.
9. Verify Worker LKG equality after rollback.
10. Verify Firebase LKG equality after rollback.
11. Verify Cloud Run LKG equality after rollback and terminal reconciliation.
12. Verify terminal journal durability plus authorization/build identity and cryptographic evidence.

All twelve must pass independently.

## 5. Phase 4 — certification disposition

Only after both staging bundles independently pass:

| Gate | Required disposition |
|---|---|
| CI verifier | PASSED |
| Forced-failure rollback | PASSED |
| Clean staging activation | PASSED |
| Independent reconciliation | PASSED |
| Production Certification | READY |
| Production Authorization | PENDING HUMAN APPROVAL |
| Promotion | BLOCKED |
| Activation | BLOCKED |
| Fail-Closed | ACTIVE |
| LKG | PROTECTED |

No status is inferred from another gate.

## 6. Phase 5 — controlled production activation

Production requires all of:

- explicit human authorization outside the verifier;
- production-scoped signed release authorization;
- authenticated LKG baseline;
- independently verified rollback targets;
- successful production preflight;
- successful mutation;
- post-mutation verification;
- post-promotion DNS wire verification;
- Cloudflare edge topology verification;
- public HTTPS 5-tuple verification;
- terminal journal write only after post-promotion verification succeeds.

If any production step fails, the controller must enter its component-scoped rollback path and remain non-activated until reconciliation succeeds.

## 7. Evidence rules

Synthetic fixtures may test verifier behavior but cannot satisfy production or staging evidence gates.

Required evidence must contain enough source metadata to establish:

```
SOURCE
→ timestamp
→ execution identity
→ target identity
→ artifact
→ verification
→ acceptance
```

A unit test saying a rollback works is not evidence that a rollback occurred.

## 8. Current repository boundary

The canonical documentation does not itself create the missing staging execution primitives. Before Phase 2 is declared executable, the repository must contain and independently test:

- `scripts/run-forced-failure-staging.sh`
- `scripts/run-clean-staging-activation.sh`
- the activation/rollback controller they invoke
- the supported Firebase rollback primitive
- the Cloud Run observed-state reconciliation
- the production release-authorization verification path

Until those exist and execute on a real isolated staging target:

```
CERTIFICATION = BLOCKED
AUTHORIZATION  = BLOCKED
PROMOTION     = BLOCKED
ACTIVATION    = BLOCKED
LKG           = PROTECTED
FAIL-CLOSED   = ACTIVE
```

## 9. Final acceptance rule

The final state may be recorded as **CERTIFIED** only when the evidence chain is independently complete:

```
SOURCE
→ EVIDENCE
→ VERIFICATION
→ ACCEPTANCE
→ PASSED
→ AUTHORIZATION
→ PROMOTION
→ POST-PROMOTION
```

No declaration, generated artifact, unit test, or chat message may substitute for a missing runtime stage.
