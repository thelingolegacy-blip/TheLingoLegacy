# LINGO Build & Recovery Instructions
Version 1.0.0 · 2026-11-15

## Before starting work
1. Confirm canonical repository, branch, commit SHA and current release hold.
2. Read the ecosystem blueprint, realm registry, dispatch routes and current master recovery issues (#480 and #575).
3. Identify the realm/service owner and dependency chain.
4. Check for existing PRs/issues before creating duplicate work.
5. Create an isolated feature branch; never work directly on protected production branch.
6. Use synthetic data and preview resources by default. Keep secrets out of source and logs.

## For every build task
- State the user-visible outcome and measurable acceptance criteria.
- Identify UI, API, data, identity, event, asset, observability and operational dependencies.
- Add or update the registry entry before exposing a new route.
- Keep contracts versioned and document backwards compatibility.
- Add unit, integration, authorization, route, accessibility and failure-path tests.
- Record build instructions, environment variables by name only, secret ownership, cost guardrails and rollback.
- Attach commit-correlated logs and artifacts after tests actually execute.
- Update the blocker register with exact missing evidence.

## Parallel work rules
Parallelize independent, non-overlapping workstreams: web/landing, realm route inventory, API/identity contracts, game engine specs, publishing/media rights, observability/recovery and QA. Each workstream uses a separate branch or explicitly assigned file ownership. Shared files such as registry, package manifests, routing and CI workflows have one designated integrator. No parallel task may change production, shared secrets, branch protection, identity, payment, wallet, DNS or infrastructure without separate approval.

## Recovery procedure
1. Stop unsafe writes; preserve last-known-good and evidence.
2. Classify severity and identify affected realm, service and environment.
3. Dispatch using the versioned route map; include correlation and idempotency keys.
4. Prefer read-only diagnosis and isolated reproduction.
5. Apply only scoped, reversible changes in preview/integration.
6. Verify with actual tests, browser checks, logs and artifacts.
7. Obtain required owner/security/privacy acceptance.
8. Promote only after all release gates pass; otherwise leave status BLOCKED/HOLD.
9. Record incident timeline, root cause, recovery actions and prevention follow-ups.

## Required completion report
Report exact PR/commit, changed paths, tests run and results, artifacts/logs, preview URL, unresolved blockers, security/privacy disposition, cost implications, rollback target and release status. Distinguish BUILT, TESTED, VERIFIED and PRODUCTION. Never label a preview as production or a queued workflow as a passing test.

## Current hard boundaries
GitHub remains source of truth; Cloudflare remains intended edge. Do not activate protected G02, live payments, wallet transfers, sweepstakes, real-money wagering, production DNS/Worker changes or destructive infrastructure as part of routine recovery. PR #548 and PR #596 retain their existing scopes and gates. Keep PR #602 stacked on PR #548 until the base is reconciled.
