# LINGO Legacy — External Recovery Checklist (2026-10-23)

Status: **BLOCKED / READ-ONLY CHECKPOINT**  
Production: **PROTECTED HOLD**  
PR: https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/349

This checklist records actions that require an authorized GitHub/Cloudflare administrator or an operator on the actual Linux runner host. It is not proof that those actions have been completed.

## Evidence verified in this checkpoint

- PR branch `fix/legacy-api-compatibility-2026-10-23` contains the legacy API compatibility implementation and tests.
- GitHub Actions runs on the branch, including the new non-deploying unit-test workflow, concluded `startup_failure`; the latest inspected run had zero jobs. Therefore tests have not executed.
- G02's canonical workflow still requires `[self-hosted, linux, x64, lingo-g02]` and runner name `lingo-legacy-g02`.
- The canonical `ops/g02/host-provisioning.md` states that a dedicated Linux x64 host is NOT CREATED / NOT VERIFIED at its checkpoint. No host provisioning API is connected in this session.
- Cloudflare zone `thelingolegacy.com` is active. Apex and `www` routes target the existing Worker `thelingolegacyv-5`.
- Read-only inspection of the deployed Worker source found no `/api/health`, `/api/metrics`, `/api/checkout`, or `/api/rewards/claim` route handlers.
- Cloudflare build preview attempted target `thelingolegacy`, which does not exist. The existing build configuration for `thelingolegacyv-5` has sentinel branch/path filters and previews disabled. These hold controls must not be loosened as a workaround.
- Source search did not verify a flagship Next.js app manifest, a flagship Firestore durable-truth integration, or operational Shopify/Square/TapStitch integrations.

## A. GitHub Actions / G02 — administrator and host operator

1. In **Repository Settings → Actions → Runners**, establish whether `lingo-legacy-g02` already exists. Record runner ID, exact name, status, labels, scope, and runner-group repository access. Do not create a duplicate.
2. In **Settings → Actions → General**, verify Actions are enabled, permitted actions/reusable workflows, hosted-runner availability, and any organization/enterprise policy overrides. Record values and screenshots/timestamps; do not weaken policy globally.
3. On the approved Linux x64 host, run the existing read-only checks:
   - `hostname; uname -a; id`
   - `systemctl list-units --type=service --all 'actions.runner*' --no-pager`
   - From the actual runner directory: `pwd; test -x ./run.sh; test -x ./svc.sh && sudo ./svc.sh status`
   - `bash ops/g02/diagnose-runner.sh`
4. If the expected service exists but is stopped, the authorized host operator may start that exact existing service using the repository's guarded procedure. Do not register/remove/reconfigure until inventory and authorization are established.
5. If no host/registration exists, the authorized administrator must approve a dedicated host and use a short-lived repository-scoped registration token. Never place the token in chat, logs, workflow files, or source control.
6. Trigger the canonical `.github/workflows/g02-sentinel.yml` only after host and GitHub-side authorization are established. Capture run ID, job ID, full commit SHA, runner ID/name/labels, instantiated steps, sentinel output, retrievable logs, retrievable artifact, timestamps, and artifact checksum.
7. Mark G02 PASS only after every predicate in `docs/runbooks/G02-CANONICAL-RUNNER-RECOVERY.md` is independently verified. Empty jobs, runner ID 0, empty steps, or missing logs are a failure.

## B. Cloudflare build/preview integration — administrator

1. Keep production Worker routes and production Worker code unchanged.
2. Compare the failing build's `external_script_id` and target name with the actual deployed script `thelingolegacyv-5` and the existing Worker Builds configuration.
3. Identify the stale/nonexistent `thelingolegacy` target and its trigger/configuration owner. Do not delete unrelated resources based on name alone.
4. Approve a separate staging Worker/script name and staging route/domain before enabling any preview build.
5. Create/update only the staging build configuration after its target identity, branch filters, path filters, and deploy command have been reviewed. Preserve the production sentinel branch/path filters and disabled production deployment gate.
6. Prove a staging build succeeds, capture its build UUID/logs, and verify staging-only hostnames/routes. Do not deploy the PR to production as a diagnostic step.

## C. Runtime/data integration work — engineering owner

- Identify the authoritative Next.js repository/origin and deployment mapping from source/hosting ownership records. Do not infer it from the domain alone.
- Connect the flagship server runtime to Firestore as durable truth only after confirming the correct project, Auth/App Check posture, rules, and least-privilege runtime identity. Redis remains cache/telemetry only.
- Implement metrics with a real configured backend, bounded cardinality, auth/retention policy, and tests. Until then `/api/metrics` remains 503.
- Implement rewards claims with authenticated identity, server-authoritative eligibility, Firestore transaction/idempotency key, duplicate-claim prevention, audit ledger, abuse controls, and reconciliation. Star Points remain non-wagering promotional points with no cash-out or cash-equivalent redemption. Until then `/api/rewards/claim` remains 503.
- Verify Shopify as primary apparel commerce, Square failover/mirror semantics, and TapStitch inventory sync using actual provider credentials stored only in approved secret stores. Define idempotent webhook handling, retries, reconciliation, and failure alerts before enabling writes.
- Verify disaster recovery: backup target access, encryption, restore test, Firestore PITR availability/configuration, Redis recovery semantics, and a tested rollback target. Never commit credentials or service-account JSON.

## D. Acceptance sequence

1. G02 host/assignment evidence passes.
2. Run the PR's non-deploying tests and all required static checks on the exact full commit SHA.
3. Fix any test/build findings; attach raw run/log/artifact references.
4. Review the Cloudflare staging configuration independently; run staging build and live staging smoke tests.
5. Verify all 20 behavioral release gates, accessibility, security headers, route contracts, commerce, rewards, backups/restore, and rollback against the same release candidate.
6. Obtain independent review and explicit release authorization.
7. Only then consider changing release disposition. The production deployment job currently has `if: ${{ false }}`; keep it disabled until the formal release authority changes that control through a separate reviewed change.

## Current acceptance state

- G02: BLOCKED
- CI/tests: NOT EXECUTED / BLOCKED
- Cloudflare staging build: BLOCKED
- Legacy routes: IMPLEMENTED IN PR ONLY / NOT DEPLOYED
- Metrics backend: NOT VERIFIED
- Rewards ledger: NOT IMPLEMENTED/VERIFIED
- Next.js origin: NOT VERIFIED
- Shopify/Square/TapStitch integration: NOT VERIFIED
- DR/PITR restore proof: NOT VERIFIED
- 20 release gates/live smoke tests: NOT RUN
- Production promotion/activation: NOT AUTHORIZED
