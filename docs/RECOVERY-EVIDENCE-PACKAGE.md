# LINGO Recovery Evidence Package Contract

Status: proposed; review required. This document defines evidence required for work tracked by Master Recovery #480. It does not authorize production changes, credential access, billing, DNS changes, deployment, merge, or promotion.

## 1. Required identity and scope

Every evidence package must identify:

- Master Recovery #480 work package and related issue/PR.
- Repository: `thelingolegacy-blip/TheLingoLegacy`.
- Exact base SHA and tested head SHA.
- Environment and resource identity (staging/test only unless a separately approved production procedure applies).
- Owner/agent role and reviewer who is independent of the implementer.
- UTC start/end timestamps.
- Change classification: documentation, source, test, configuration, infrastructure, data, or release.

## 2. Change record

List every changed path and explain:

- Intended behavior and defect addressed.
- Trust boundary affected (identity, authorization, tenant, payment, publishing, routing, or infrastructure).
- Dependencies and version pins.
- Whether any external provider, account, credential, paid resource, or customer data is involved.
- Explicitly state what was not changed, including production, DNS, secrets, billing, payment settings, and LKG.

## 3. Reproduction record

Provide exact commands, in order, from a clean checkout:

```sh
git clone https://github.com/thelingolegacy-blip/TheLingoLegacy.git
cd TheLingoLegacy
git checkout <tested-commit-sha>
# Add the exact project-specific install, validation, build, and test commands here.
```

Record tool/runtime versions, lockfile state, environment variable names (never values for secrets), exit codes, and whether network/provider access was required. A command not executed must be marked NOT RUN.

## 4. Results and artifacts

For each check, report one status: PASS, FAIL, BLOCKED, or NOT RUN.

| Check | Status | Exact command / method | Evidence URI or artifact SHA | Notes |
|---|---|---|---|---|
| Clean checkout | | | | |
| Dependency integrity | | | | |
| Static analysis / lint | | | | |
| Unit tests | | | | |
| Integration tests | | | | |
| End-to-end tests | | | | |
| Security / negative tests | | | | |
| Build reproducibility | | | | |
| Runtime smoke tests | | | | |
| Rollback verification | | | | |

Evidence must be retrievable and tied to the tested commit, environment, run/job, and artifact. Include sanitized logs and screenshots only when they add evidence; screenshots alone do not prove behavior. Record SHA-256 for exported artifacts and raw logs where feasible.

## 5. Product-specific acceptance predicates

### Gateway and source recovery
- Runtime source is present in the canonical repository and mapped to a precise AppDeploy snapshot/version.
- Clean clone builds the expected output reproducibly.
- Route manifest, static asset manifest, and output hashes are recorded.
- No cross-origin stale preview assets, missing chunks, or unregistered route-data requests remain in the tested staging environment.
- Production traffic and domain routing remain unchanged.

### Firebase identity and authentication
- Intended project identity is approved and mapped separately for development, test, staging, and production.
- No placeholder values are accepted as configured credentials.
- Registration, verification, sign-in, sign-out, and recovery are tested in a non-production project.
- Authorization, account isolation, session expiry, and denial paths are tested.
- No live credential is stored in source, logs, or agent context.

### Enterprise workflows
- Role/action matrix includes allow and deny expectations.
- Every privileged action checks authorization server-side.
- Audit records identify actor, action, target, result, and timestamp without leaking secrets.
- Unauthorized, cross-tenant, replay, and invalid-state tests are included.

### Commerce
- Test-mode provider account only.
- Success, decline, timeout, duplicate request/idempotency, cancellation, refund, partial refund, and reconciliation paths are exercised.
- Provider event/log IDs are correlated with internal order records.
- No live payment key, real charge, payout, or cashout is used.

### Infrastructure and release
- Branch/ruleset and workflow permissions are captured from authoritative provider state.
- G02 runner identity, labels, service health, job assignment, instantiated steps, sentinel, logs, artifacts, and run/job/commit correlation are independently verified.
- Hosted smoke tests remain distinct from self-hosted G02 acceptance.
- Monitoring, alerting, backup, restore, rollback, and LKG procedures are tested in an approved non-production scope.
- Production remains protected until a separate authorization and acceptance decision.

### Publishing and media
- Asset provenance, rights holder, license/permission, territory, duration, and approval are recorded where applicable.
- Draft, review, approved, scheduled, published, and withdrawn states are distinct.
- A test publication is verified end-to-end in non-production.
- Script/storyboard/prompt/source/render/export/published artifact are not conflated.

## 6. Risks, rollback, and residual work

Document:

- Observed side effects and residual risks.
- Known gaps, external blockers, and accountable owner.
- Exact rollback/reversal steps and evidence that rollback was tested.
- Data migration/recovery implications, if any.
- Whether the change is safe to merge, and why. Merge approval is separate from technical test results.

## 7. Independent verification and decision

The independent reviewer must retrieve the cited evidence and repeat or validate the decisive checks. The reviewer records:

- Evidence inspected and hashes/identifiers.
- Discrepancies or missing evidence.
- Acceptance decision: ACCEPTED, REJECTED, or BLOCKED.
- Explicit scope of acceptance; acceptance of one product does not accept the enterprise.

The mandatory sequence is:

SOURCE → ACTUAL EXECUTION → RETRIEVABLE EVIDENCE → INDEPENDENT VERIFICATION → ACCEPTANCE → AUTHORIZATION → PROMOTION

No item may be marked DONE based only on a deployment-ready status, queued workflow, proposed patch, passing static validation, mockup, generated plan, or implementer self-report.

## 8. External blocker handling

If provider access, account ownership, credentials, quotas, credits, or billing prevent execution:

1. Mark the affected check BLOCKED.
2. Name the provider-side requirement without exposing secrets.
3. Record the smallest owner-controlled action needed.
4. Stop that execution path. Do not create alternate accounts, bypass limits, retry paid operations, or substitute unapproved infrastructure.

## 9. Final hand-off summary

| Field | Value |
|---|---|
| Work package / issue | |
| PR / branch | |
| Base SHA / head SHA | |
| Environment | |
| Changed paths | |
| Checks PASS | |
| Checks FAIL | |
| Checks BLOCKED | |
| Checks NOT RUN | |
| Evidence package | |
| Independent reviewer / decision | |
| Rollback verified | |
| Production changed? | NO unless separately authorized and evidenced |
| Next owner action | |
