# Production launch gate — 2026-10-24

## Decision

**NO-GO / PROTECTED HOLD.** This document is an acceptance checklist, not a release approval. Keep the canonical domain, production Worker, DNS, billing, secrets, and release gates unchanged until every required check below has fresh evidence and an authorized reviewer accepts it.

## Evidence baseline

The recovery audit at [static-backup-seo-security-audit.md](./static-backup-seo-security-audit.md) records:
- The isolated Cloudflare Pages backup serves 37 curated public routes, with matching canonical paths, 24 linked local assets returning 200, nine tested aliases, and security/noindex headers on tested responses.
- Accessibility acceptance remains incomplete: keyboard-only interaction, forced-colors, and contrast testing are not accepted.
- Production-domain probes found incorrect responses for `/healthz`, `/sitemap.xml`, `/robots.txt`, `/assets/studio-ui-icons.svg`, and unknown paths (homepage HTML with 200); `/api/v1/runtime` and `/api/v1/platform/gates` returned 404; the live homepage lacked CSP.
- The active production Worker version and the repository's current configuration are out of sync. The newer uploaded version was preview-only during the audit. Do not infer that repository configuration is active production behavior.
- GitHub Actions/G02 is still blocked; successful test, runner, and production-deployment evidence is not established by a workflow file or a dry-run.

## Ordered acceptance gates

### 1. Freeze and preserve the last-known-good release
- Do not change apex/www DNS, production routes, the canonical Worker, production secrets, billing, or release authority as part of this checklist.
- Preserve run IDs, timestamps, deployment IDs, source SHAs, version IDs, and probe output.
- Identify the exact active Cloudflare deployment, Worker version, bindings, compatibility settings, and source commit from the Cloudflare control plane. Reconcile differences with `wrangler.jsonc` before proposing any promotion.

### 2. Restore and verify public HTTP contracts in an isolated candidate
Run real HTTP GET and HEAD probes against the candidate for:
- `/`, `/healthz`, `/sitemap.xml`, `/robots.txt`, `/assets/studio-ui-icons.svg`
- `/api/v1/runtime`, `/api/v1/platform/gates`, `/api/v1/platform/modules`, `/api/v1/platform/manifest`, `/api/v1/platform/status`, `/api/v1/site/context`
- A deliberately nonexistent route and representative sensitive paths such as `/.env.example`, `/.git/config`, `/wrangler.jsonc`, `/.github/workflows/`, and `/scripts/`

Acceptance criteria:
- Health endpoint returns its documented plain-text response and correct content type.
- Sitemap and robots return their own expected content types and contents.
- Known static assets return 200 with correct MIME types; missing assets and unknown routes return a real 404, not homepage HTML with 200.
- Required API endpoints return their documented JSON schemas and statuses; unknown API paths return JSON 404.
- CSP, frame denial, nosniff, referrer, permissions, HSTS, and cache policy are checked on actual responses, not inferred from source configuration.
- Sensitive paths never expose source/configuration content.

### 3. Run code and build checks
- Execute the existing Node test suite and dynamic-runtime contract verifier in a real checkout.
- Run Wrangler validation and a `deploy --dry-run` against the candidate configuration.
- Validate every public route, redirect, canonical URL, sitemap entry, local CSS/JS/SVG reference, and content type.
- Record exact command, exit code, commit SHA, and logs. A workflow that fails before creating a job is not a code-test result.

### 4. Close accessibility and responsive acceptance
- Test at narrow mobile, tablet, and desktop breakpoints.
- Complete keyboard-only navigation including skip link, focus order, menus, forms, and visible focus.
- Run forced-colors/high-contrast and reduced-motion checks.
- Verify contrast, headings, landmarks, labels, image alternatives, error states, and touch targets. Record failures and remediation.

### 5. Verify real integrations without enabling unapproved commerce
- Firebase Auth, database and storage rules, backups, and runtime access must be validated with owner-provided project configuration; placeholder client values are not a functioning integration.
- Stripe checkout, receipts, refunds, tax, webhook signatures/idempotency, and support/refund flows remain unverified. Do not enable paid checkout until the authorized owner verifies them.
- Wallet, loyalty, XP, rewards, and game state must be server-authoritative and tested for replay, duplicate submissions, authorization, and data consistency. Demo-only values must be clearly labeled and must not imply cash value.
- Verify monitoring, error reporting, rate limits, abuse controls, privacy/terms, contact path, and incident rollback.

### 6. Resolve CI/G02 independently
- Diagnose the zero-job `startup_failure` at the GitHub Actions admission/control-plane layer; preserve the affected run metadata.
- Confirm a runner is online and eligible, then execute a minimal canary that emits a sentinel and produces retrievable logs.
- Run the real validation workflow and retain artifact/checksum evidence.
- Do not treat workflow YAML, a registered-runner plan, or a dry-run as proof that CI executed.

### 7. Promote only after independent sign-off
Promotion requires all prior checks, a reviewed change set, a verified rollback target, explicit owner approval, and fresh post-deployment probes. Verify the canonical domain only after promotion and stop/rollback if any required route, header, integration, or health check regresses.

## Evidence ledger

For each check, record:
- UTC timestamp
- environment and URL
- source commit and deployed Worker/version/deployment ID
- request method, status, content type, relevant security headers
- command or test name, result, and log/artifact reference
- reviewer and acceptance decision

## Current release decision

**Blocked.** The backup is an isolated static fallback, not a replacement for the dynamic production runtime. No DNS, production Worker, custom domain, billing, secret, or release-gate mutation is authorized by this checklist.

## CI startup evidence update — 2026-10-25

A follow-up check of the connected GitHub Actions API returned zero job records and zero artifacts for each of these runs:

| Run ID | Workflow | Jobs | Artifacts |
|---:|---|---:|---:|
| [40151883992](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/40151883992) | G02 Runner Image Build (no publish) | 0 | 0 |
| [40151884541](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/40151884541) | Lingo Legacy Static CI | 0 | 0 |
| [40151885025](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/40151885025) | Crimson Smoke UI | 0 | 0 |
| [40158678664](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/40158678664) | Crimson Smoke UI — static validation (run against recovery commit `8def930c077509a5c5f785963d050ba4d94b9792`) | 0 | 0 |

This is API-observed evidence that job-level logs/artifacts are unavailable for these sampled runs through the connected endpoints. It does not establish the backend cause of startup failure. The records and timestamps are also documented in [Issue #368](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/368#issuecomment-6392988093). A subsequent run, [40158678664](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/40158678664), was triggered for recovery commit `8def930c077509a5c5f785963d050ba4d94b9792` and also concluded `startup_failure`; its jobs endpoint returned zero jobs and its artifacts endpoint returned zero artifacts. This confirms the latest documentation commit did not produce executable CI evidence. It still does not establish the backend cause. GitHub Support escalation remains prepared but not submitted. No rerun, workflow dispatch, production deployment, or infrastructure/settings change was performed for this update.
