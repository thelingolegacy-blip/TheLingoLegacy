# Infrastructure Reconciliation and Release Execution Plan

**Status:** SOURCE-ONLY RECONCILIATION — NOT ACCEPTANCE OR DEPLOYMENT AUTHORITY  
**Date:** 2026-10-30  
**Production:** HOLD / LAST-KNOWN-GOOD PROTECTED

## 1. Authoritative environment boundaries

| Plane | Source/configuration | Intended role | Current decision |
|---|---|---|---|
| GitHub | `main`, PRs, Actions | Source, review, CI evidence | Connected; G02 execution blocked |
| Cloudflare production | Root `wrangler.jsonc`, Worker `thelingolegacyv-5` | Existing flagship runtime | Read-only; no mutation |
| Cloudflare staging artifact | `cloudflare/wrangler.toml`, Worker `lingo-legacy-studio-build` | Isolated studio build | Keep separate; verify account-side script and routes before any deploy |
| Firebase console project | `flutter-ai-playground-e9ad0` | User-confirmed project identity | Candidate project only; runtime and intended environment mapping unverified |
| Firebase repository alias | `.firebaserc` = `lingo-legacy-production` | Existing repository expectation | Conflict; do not silently repoint |
| Render | Workspace `tea-dbiev1gae00c738hk28g` | Optional distinct staging/support workload | Inventory unresolved; no provisioning |
| AppDeploy | 15 discovered app surfaces | Existing app previews/staging surfaces | Continue read-only QA; do not infer production acceptance |

## 2. Firebase reconciliation gate

The Firebase console identity and repository alias differ. Before any Flutter/Firebase deployment:
1. Owner confirms whether `flutter-ai-playground-e9ad0` is the intended development/staging project, a temporary playground, or the intended canonical project.
2. Define separate environment mappings for development, staging, and production; do not use one default alias for all environments.
3. Verify app registrations and generated Flutter options against the chosen project IDs.
4. Verify Authentication providers, Firestore or Realtime Database selection, Storage rules, App Check, backups, and least-privilege access.
5. Run authenticated read/write probes in a non-production test namespace and capture logs/artifacts.
6. Keep production credentials and service-account material outside source control.

Until those checks pass, Firebase state is `IDENTITY_CONFLICT / RUNTIME_UNVERIFIED`.

## 3. Cloudflare target isolation

- Root Wrangler config is the production target. Do not deploy it during reconciliation.
- The nested studio Wrangler config is a separate build target, but its name and entrypoint alone do not prove its account-side bindings, routes, environment variables, or deployment permissions.
- Before a staging deployment, inspect the Cloudflare account for the exact Worker script, existing versions, routes, custom domains, bindings, and rollback target.
- Staging deployment must use a distinct Worker name, no production routes, no production secrets, and explicit staging-only bindings.
- Verify `/healthz`, `/api/v1/runtime`, error handling, telemetry, and rollback on the staging hostname.
- Production promotion remains a separate approved gate and is not part of this plan.

## 4. Render decision

Render is not automatically required for the application runtime because the repository documents Cloudflare Workers as the canonical runtime. The Render workspace is confirmed, but the service inventory endpoint returned null. PostgreSQL and Key Value inventories returned no instances, and no root Render/Docker deployment manifest was found in inspected paths.

Do not create a Render service merely to make the workspace appear active. First identify a separate workload that cannot or should not run on Cloudflare, then specify region, instance type, expected monthly cost, persistence, health checks, secrets, scaling, and rollback. No chargeable provisioning is authorized by this source document.

## 5. G02 evidence contract

A valid G02 acceptance packet must correlate:
- repository and immutable commit SHA;
- workflow file/name, run ID, run attempt, event, ref;
- numeric job ID and job name from GitHub Jobs API;
- numeric runner ID greater than zero and runner name exactly `lingo-legacy-g02`;
- canonical labels `self-hosted, linux, x64, lingo-g02`;
- instantiated job steps and retrievable step logs;
- sentinel correlation markers in the job log;
- uploaded artifact with checksum and retrievable bytes;
- independent comparison of run, job, runner, commit, logs, and artifact;
- explicit acceptance record.

A queued/cancelled/startup-failed run, UI Online status, source patch, hosted runner, syntax check, or status badge is not G02 acceptance. Do not register a duplicate runner, loosen labels, skip required jobs, or convert an infrastructure failure into PASS.

## 6. Safe blocker handling

May be disabled only after source inspection proves they are non-production and reversible:
- unused demo/onboarding overlays;
- debug-only UI toggles;
- placeholder tips and tutorial popups;
- duplicate preview auto-starts that do not perform production mutation.

Must remain enabled:
- branch protection and required reviews;
- self-hosted runner labels and runner gate;
- production approval and deployment hold;
- secret scanning and least-privilege controls;
- audit logging and telemetry;
- rate limiting, abuse protection, and security headers;
- rollback/LKG protection;
- payment, wallet, identity, age, and responsible-play safety controls.

## 7. Execution order and acceptance

1. Correct this source registry and obtain review.
2. Resolve Firebase environment identity without changing production.
3. Verify Cloudflare account-side staging target and isolation.
4. Resolve G02 host availability and execute the real sentinel.
5. Validate app/backend integration and telemetry against staging.
6. Verify artifacts, checksums, provenance, and independent acceptance.
7. Complete mobile builds and device/store certification.
8. Review production release packet and rollback plan.
9. Only then consider an explicitly scoped production promotion.

**No merge, production deployment, DNS/route change, secret mutation, billing change, Firebase rules deployment, payment activation, wallet activation, AI activation, or real-money wagering activation is authorized by this document.**
