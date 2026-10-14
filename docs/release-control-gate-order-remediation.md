# Production Promotion Gate-Order Remediation

Status: review candidate only. This branch is not merged and must not be dispatched against production.

## Changes in this candidate

- Preserves the G02 runner boundary and requires the expected runner identity before proceeding.
- Adds a pre-deployment authorization job between repository gates and the Cloudflare deployment job.
- Correlates pre-deployment evidence to the exact dispatched commit.
- Requires explicit repository-level verification attestations for the evidence ledger and rollback target.
- Keeps the Cloudflare deployment behind the pre-deployment gate and the configured GitHub Environment protection rules.
- Persists post-deployment live-probe output as an artifact.
- Makes the final acceptance job depend on successful pre-deployment authorization and successful deployment/probes; checks commit correlation, gate evidence, rollback evidence, and probe status.
- Adds a static contract test for the workflow dependency boundaries.

## Required repository variables

Before this workflow can pass its pre-deployment gate, repository/org variables visible to the jobs must be set only after the associated evidence has been independently verified:

- `PROMOTION_EVIDENCE_VERIFIED=true`
- `ROLLBACK_TARGET_VERIFIED=true`
- `ROLLBACK_TARGET=<immutable, previously deployed Worker version/release identifier>`

These variables are attestations, not substitutes for the underlying evidence. Preserve the independent evidence record and rollback rehearsal results in the release evidence ledger. Do not set these values simply to make the workflow green.

## Required GitHub Environment protections

Configure required reviewers and appropriate deployment protection rules for both `staging` and `production`. The deployment job uses the selected environment; a repository variable alone is not deployment approval.

## Validation limitations

- This candidate has not been merged, dispatched, or deployed.
- GitHub Actions execution has not been demonstrated because the repository has an existing pre-step runner/log retrieval incident.
- The static contract test must pass in a functioning CI run before merge.
- The rollback target's actual reversibility and evidence ledger must be independently checked by an authorized operator. A boolean variable cannot itself prove rollback readiness.
- Production live probes have not been run by this candidate. No production certification or activation is issued by this document.

## Acceptance checklist

- [ ] Static contract test passes in CI.
- [ ] Workflow syntax and job dependency graph independently reviewed.
- [ ] G02 host evidence verified and G02 sentinel passes with real runner ID/name and retrievable logs.
- [ ] Evidence ledger integrity and exact commit correlation verified.
- [ ] Rollback target is immutable and a rollback rehearsal is evidenced.
- [ ] GitHub Environment reviewers/protection rules independently confirmed.
- [ ] Staging validation and post-deployment probes pass.
- [ ] Independent acceptance is recorded.
- [ ] Explicit authorization is recorded before production promotion.

Until every required item passes, fail closed and keep production promotion blocked.
