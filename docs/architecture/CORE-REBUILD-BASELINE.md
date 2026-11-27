# LINGO Legacy Core Reconstruction — Baseline and Work Plan

**Status:** Discovery baseline; no production mutation authorized by this document  
**Date:** 2026-11-24  
**Canonical Core:** `thelingolegacy-blip/TheLingoLegacy`  
**Connected Web application:** `thelingolegacy-blip/TheLingoLegacy-Web`

## 1. Objective

Reconstruct and reconcile the LINGO Legacy platform around one authoritative Core, shared service contracts, explicit security boundaries, and independently verified release gates. Preserve working assets and behavior; do not replace or migrate systems until their dependencies and rollback paths are documented.

## 2. Confirmed repository observations

### Core repository

- The default-branch tree contains 881 entries in the inspected recursive tree response.
- The repository contains a Cloudflare Worker entry point at `worker.js` and a Wrangler configuration at `wrangler.jsonc`.
- The Wrangler configuration names the Worker `thelingolegacyv-5`, points to `worker.js`, and declares routes for `thelingolegacy.com/*` and `www.thelingolegacy.com/*`.
- The Core `package.json` currently exposes Node test scripts for the slot engine and That's My Lingo preview engine; its declared Node engine is `>=20`.
- A Flutter project manifest exists at `pubspec.yaml`. It declares Flutter, `firebase_core`, and an offline-preview note; the manifest alone does not prove that Firebase staging is provisioned or connected.
- The Core Worker contains a release-gate constant that reports G02 as FAIL / UNVERIFIED and downstream gates G03–G11 as BLOCKED. This is source-level declared state, not independent live infrastructure evidence.
- The Core Worker checkout endpoint explicitly returns `BILLING_DISABLED` with HTTP 410. Preserve this fail-closed behavior unless a separately approved billing release changes it.
- The Core repository has numerous product, infrastructure, security, mobile, and workflow directories. Directory presence is not proof that a feature is complete or operational.

### Web repository

- The Web repository is a separate Next.js App Router application using React and TypeScript.
- Its package scripts include type checking, production gate checks, preview smoke tests, OpenNext build/preview/deploy commands, and a live smoke test.
- Its package declares Node `>=22` and npm `>=10`; Core's package declares Node `>=20`. CI must use an explicit per-repository runtime matrix rather than assuming one version fits both.
- Its Wrangler configuration names a separate Worker `the-lingo-legacy-web`, points to `.open-next/worker.js`, and currently sets `workers_dev: true`.
- The Web README describes Cloudflare Workers/OpenNext as the runtime architecture and Firebase as the application data/identity layer where already integrated. Actual bindings and service connectivity still require verification.

### GitHub Actions recovery

- Issue #663 records the verified cross-repository startup-failure incident, including a Core run with zero jobs, zero check runs, and no artifacts.
- The exact upstream admission/orchestration cause is not established by those API responses.
- The Core workflow `.github/workflows/actions-runner-smoke.yml` has its job disabled with `if: false`; it is not currently an executable G02 acceptance test.
- The read-only runner-observation workflow captures provider job/runner identity, but it only produces evidence when a job is actually admitted and executed.
- PR #662 is an open, unmerged documentation-only Troubleshooting Center foundation. It is not an operational UI or a CI repair.

## 3. Architecture decisions to validate before implementation

1. **Source authority:** Core remains the canonical platform contract; Web remains a connected application repository. Avoid a second competing Core.
2. **Runtime separation:** The Core Worker and Web Worker are separate deployable runtimes. Document which APIs, routes, and assets belong to each before consolidating or redirecting traffic.
3. **Environment isolation:** Production and staging must have distinct, verified Firebase and Cloudflare bindings. Never infer an environment from a project name or a source default.
4. **Security:** SAAAE policy enforcement must be server-side, default-deny, auditable, and tested at the API boundary. UI visibility is not authorization.
5. **Wallet and value boundaries:** Preserve demo/virtual-credit behavior as non-cash and non-redeemable. No real-value ledger migration or payment activation in this reconstruction phase.
6. **Release authority:** A successful build is not production acceptance. Require provider job evidence, tests, security review, deployment identity, live probes, rollback readiness, and independent sign-off.
7. **Compatibility:** Maintain separate Node runtime requirements until package manifests and lockfiles prove a safe shared baseline. Preserve Android minSdk 21 unless a documented compatibility audit supports a change.

## 4. Execution sequence and acceptance gates

### Phase 0 — Baseline inventory (in progress)
- Record repositories, branches, workflows, runtimes, entry points, deploy targets, domains, environments, data stores, integrations, and owners.
- Identify duplicate or conflicting source-of-truth definitions.
- Capture current production and staging state read-only.
- **Acceptance:** each discovered component has an owner, source, environment, dependency list, evidence pointer, and status of verified / unverified / blocked.

### Phase 1 — Canonical contracts
- Publish system context, service boundaries, API contracts, event schemas, identity claims, authorization model, and environment matrix.
- Define stable compatibility/versioning rules for Core ↔ Web ↔ mobile.
- **Acceptance:** contract tests and ownership map reviewed; no unresolved authority conflict.

### Phase 2 — CI and verification foundation
- Restore GitHub Actions job admission separately in Core and Web.
- Prove job ID, runner ID/name, executed steps, retrievable logs, and downloadable non-secret artifact.
- Validate G02 separately; hosted-runner success is not G02 success.
- **Acceptance:** evidence-backed green CI on each repository and independently accepted G02 evidence.

### Phase 3 — Core services and security
- Reconcile identity, SAAAE authorization, audit, API gateway, configuration, health, and service registry.
- Add tests for default-deny, tenant/environment isolation, least privilege, and audit completeness.
- **Acceptance:** security tests pass and negative authorization cases fail closed.

### Phase 4 — Data and integration reconciliation
- Map data ownership, schemas, migrations, event flows, retries, idempotency, and rollback.
- Verify Firebase staging and production bindings without copying production data into staging.
- **Acceptance:** integration contract tests pass; migration plans have backups, dry runs, and rollback.

### Phase 5 — Web and mobile integration
- Connect Web and Flutter clients through versioned Core contracts.
- Validate auth/session handling, offline behavior, device compatibility, accessibility, and responsive UI.
- **Acceptance:** automated integration and device/browser test evidence for supported targets.

### Phase 6 — Product migration
- Migrate products in small cohorts onto shared Core services, starting with a low-risk preview surface.
- Keep demo wallets and virtual gameplay separate from payments, prizes, and cash-out.
- **Acceptance:** each product passes its own functional, security, and operational checklist.

### Phase 7 — Release readiness
- Review monitoring, incident response, rollback, backup/restore, capacity, privacy, and support readiness.
- Promote only explicitly approved release candidates.
- **Acceptance:** production probes and independent acceptance evidence match the exact deployed commit and configuration.

## 5. Safety boundaries

This baseline is documentation and read-only discovery. It does not authorize:
- production DNS or route changes;
- production Worker or Pages deployments;
- secret rotation or credential changes;
- database migrations, destructive writes, or data deletion;
- runner registration or deregistration;
- billing changes, payment activation, or paid-spend increases;
- merging protected changes or lifting the production hold.

Use isolated branches and reviewable pull requests for implementation. Preserve the last-known-good production state until replacement evidence is accepted.

## 6. Immediate next discovery tasks

1. Fetch and inspect Core and Web workflow definitions, lockfiles, test inventories, and build configuration.
2. Inventory Cloudflare Worker/Pages bindings and route ownership read-only.
3. Map Firebase project IDs and client/server binding references without exposing secret values.
4. Trace identity and authorization enforcement from UI to server-side data access.
5. Produce a dependency graph and prioritized remediation backlog with evidence links.

## 7. Evidence language

Use only these states:
- **VERIFIED:** direct evidence from the relevant provider or executed test.
- **PRESENT:** source/configuration exists, but runtime behavior is not established.
- **UNVERIFIED:** evidence is missing or stale.
- **BLOCKED:** a named dependency prevents acceptance.
- **PASS / FAIL:** only for a defined test or gate with recorded evidence.

Do not mark a component complete based only on file presence, a successful dispatch request, a build upload, or a source-level status constant.
