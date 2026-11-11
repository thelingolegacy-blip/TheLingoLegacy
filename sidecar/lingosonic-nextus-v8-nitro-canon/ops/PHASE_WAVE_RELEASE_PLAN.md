# LINGOsonic Nexus — Phase, Wave, Sprint, and Release Control

This plan is a control document for the isolated sidecar. It does not activate cloud resources or authorize a production merge.

## Current control state (2026-10-10)

- Source branch: `sidecar/lingosonic-nextus-v8-nitro-canon-2026-10-10`
- Review vehicle: draft PR #249 targeting `main`
- Source implementation: scaffold present; CloudFormation Lambda inline handler aligned to the checked-in handler contract.
- Automated execution: **BLOCKED / UNVERIFIED**. Latest observed CI run failed before steps were instantiated; job steps and logs were unavailable. A new run must be observed against the current head before tests count as evidence.
- Hosting: Vercel reported a Ready preview status in a PR bot comment, but this is not sufficient by itself to certify the intended sidecar route, artifact, or public reachability. Verify exact URL and deployed commit before accepting.
- AWS: identity/account and template validation not verified; no AWS stack deployment authorized or recorded.
- Production: no merge, DNS change, Cloudflare mutation, Firebase mutation, or activation from this branch.

## Phase 0 — Source authority and isolation
**Exit criteria:** exact branch and PR head recorded; diff reviewed; no secret material; no unrelated flagship changes.  
**Current:** source isolation established; re-check current head before each promotion decision.

## Phase 1 — Build and test evidence
**Work items:** frontend production build; Python syntax and unit tests; dependency audit; secret scan; Docker build; CloudFormation validation.  
**Evidence required:** successful workflow run tied to exact head SHA, job IDs with nonempty steps, retrievable logs, test output, artifact digest, and independent review. A queued job or a status badge alone is not evidence.

## Phase 2 — Security and architecture acceptance
**Work items:** review IAM scope, API Gateway IAM auth, SQS/DynamoDB partial-failure behavior, S3 privacy, retention, alarms, budgets, dependency/image vulnerabilities, and rollback.  
**Exit criteria:** written review with all critical findings fixed or explicitly accepted by an authorized reviewer. No public unauthenticated job endpoint.

## Phase 3 — Development environment provisioning
**Prerequisites:** verified AWS account/role using `aws sts get-caller-identity`; approved budget and region; stack name reserved; CloudFormation template validates; change set reviewed.  
**Execution:** deploy only to a dedicated development stack after prerequisites pass. Capture stack ID, change set, outputs, CloudTrail/CloudWatch evidence, and teardown command. Do not reuse flagship production resources.

## Phase 4 — Integration and observability
**Work items:** API smoke tests with IAM-signed requests; SQS delivery and DLQ exercise; DynamoDB status verification; S3 access denial test; CloudWatch log/alarm verification; backup and restore drill.  
**Exit criteria:** correlated request ID/job ID, independently captured evidence, recovery test passes, and no public exposure.

## Phase 5 — Release candidate
**Work items:** tag immutable candidate SHA; attach SBOM/dependency audit, build artifacts and digests, test report, security review, infrastructure validation, rollback/teardown evidence.  
**Exit criteria:** all prior gates PASS, PR review completed, and a named release approver explicitly accepts the candidate.

## Phase 6 — Promotion and activation
**Current state:** BLOCKED. Requires a separate explicit promotion decision after evidence acceptance. Merge and activation are not implied by implementation or by this plan. No DNS or flagship routing changes in this phase without a separately reviewed change.

## Waves and sprints

- **Wave 0 / Sprint 0 — Scaffold and isolate:** source, dashboard, handler, infrastructure baseline, tests, runbooks. Status: implemented, execution evidence incomplete.
- **Wave 1 / Sprint 1 — Reproducible build:** repair runner/CI execution, execute tests, Docker build, CloudFormation validate, dependency/security checks. Status: BLOCKED on trustworthy execution evidence.
- **Wave 2 / Sprint 2 — Dev stack:** account/role verification, budget, reviewed change set, dedicated development deployment. Status: NOT STARTED.
- **Wave 3 / Sprint 3 — Integration and recovery:** end-to-end IAM API/SQS/DynamoDB, failure-path and restore tests, observability. Status: NOT STARTED.
- **Wave 4 / Sprint 4 — Candidate and release:** independent acceptance, immutable evidence bundle, rollback proof, release approval. Status: NOT STARTED.
- **Wave 5 — Promotion/activation:** only after all gates pass and separately authorized. Status: BLOCKED.

## Registry semantics

The agent registry in `ops/agent-registry.json` is a **proposed role registry**, not a list of running agents. A role is considered registered only when its identity, owner, least-privilege permissions, runtime, health check, audit trail, and revocation path are verified. No bot, runner, host, cloud role, or external provider is represented as active without its own evidence.

## Evidence record fields

For each execution, record: `run_id`, `job_id`, `runner_id`, `runner_name`, `runner_group`, `labels`, `head_sha`, `started_at`, `completed_at`, `step_summaries`, `log_reference`, `artifact_name`, `artifact_digest`, `test_results`, `independent_verifier`, `gate_decision`. Missing or uncorrelated fields mean HOLD.

## Fail-closed rule

`SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → PASSED → AUTHORIZATION → PROMOTION`

Any failed, missing, stale, or uncorrelated evidence stops progression. Repair in the isolated branch, rerun, and independently verify. Never infer a PASS from a planned action, green deployment badge on a different project, or unassigned runner.
