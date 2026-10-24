# Controlled Development Override

Status: **DEVELOPMENT ONLY — production remains protected**

## Purpose

This override removes GitHub Actions availability as a prerequisite for isolated prototype work. It does not represent a GitHub Actions success, does not disable mandatory release checks, and does not authorize production changes.

## Allowed without GitHub Actions

- Edit prototype source and documentation on an isolated development branch.
- Run local Node.js static contract checks and unit tests.
- Run local builds where the project's dependencies and runtime are available.
- Publish a preview-only deployment with no production secrets or live customer data.
- Perform manual route, navigation, responsive-layout, and interaction checks; record the exact scope and environment.

## Required status vocabulary

Every check must be recorded as one of:

- **PASS** — execution occurred and the stated acceptance criteria were met.
- **FAIL** — execution occurred and the criteria were not met.
- **UNVERIFIED** — evidence is missing, inaccessible, stale, or not independently reviewable.
- **NOT RUN** — the check has not been executed.

A missing GitHub Actions job, empty job list, absent artifact, or unavailable runner is **UNVERIFIED/BLOCKED**, never PASS.

## Fail-closed boundaries

The override MUST NOT:
- change production DNS, custom-domain assignments, production Worker routing, or production deployment aliases;
- read, copy, expose, or substitute production credentials in preview;
- activate Firebase Auth, Firestore writes, payments, commerce webhooks, privileged agents, or other sensitive integrations;
- bypass branch protection, required approvals, secret scanning, security review, or release authorization;
- mark G02 or any other release gate passed without qualifying evidence.

Use separate preview configuration and synthetic data. Do not add secrets to source files, HTML, browser bundles, test fixtures, or artifacts.

## Local workflow

From `studio-vnext/`:

```sh
node scripts/dev-verify.mjs
npm test
npm run check
```

These commands provide local/source-level evidence only. They do not prove browser behavior, deployed behavior, runner dispatch, or production readiness.

## Re-entry to production release

Before any production-ready declaration or sensitive-feature activation, restore the mandatory CI runner and branch checks; run build, type, lint, unit, contract, E2E, security, accessibility, telemetry, rollback, and domain/auth checks; capture retrievable evidence with checksums; obtain independent review and explicit authorization. Keep G02 and downstream gates blocked until then.
