# LINGO Legacy Configuration Recovery Audit

**Classification:** Investigation record — not release evidence or certification  
**Audit date:** 2026-10-09  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Recovery branch:** `studio/configuration-recovery-2026-10-09`  
**Draft PR:** [#235](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/235)

## Executive finding

This is not currently a safe-to-promote release. Cloudflare build triggers have been contained by provider-side path filters, but the GitHub Actions execution plane is still not producing usable job assignments or logs. A PR contains configuration and workflow repairs; it has not been merged, and no production deployment or activation was performed.

## Confirmed issues and corrective action

### 1. GitHub Actions jobs fail before step initialization

**Evidence**
- G02 sentinel run [37850490883](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/37850490883), job 113561905777: cancelled; runner ID 0; runner name empty; steps/logs unavailable; no artifacts.
- Static CI run [38006462392](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38006462392), job 114076271774: failure; runner ID 0; runner name empty; no steps; log download returns `BlobNotFound`.
- Static CI run [38007388568](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38007388568), job 114079218236: same pre-step signature despite using `ubuntu-latest`.

**What this proves:** the records do not show real runner assignment or step execution. This is not proof of a shell/script failure; the job has no step output to evaluate.

**What it does not prove:** the exact platform-level cause. A self-hosted daemon issue could explain G02, but cannot alone explain the same signature on a GitHub-hosted `ubuntu-latest` job.

**Fix path**
1. Check repository Settings → Actions → General for Actions enablement, policy/allow-list restrictions, and PR workflow permissions.
2. Check GitHub account usage/billing/resource limits and whether Actions has an account-level restriction.
3. Check self-hosted runner registration, runner group access, service health, labels and listener polling.
4. If `ubuntu-latest` jobs still have runner ID 0, no steps and no logs after the settings check, open GitHub Support with the run/job IDs above and ask for a runner-dispatch investigation.
5. Do not pass G02 until a fresh run provides a nonzero runner ID, populated name, executed steps, downloadable logs/artifact, and exact run/job/commit correlation.

Tracker: [Issue #236](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/236), [Issue #237](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/237).

### 2. Runner identity checks used an undocumented context property

Several workflows attempted to use `${{ runner.id }}`. The documented Runner context has runner name, OS, architecture and environment, but does not establish the numeric runner ID as a `runner.id` property. The repaired draft queries the current run's Jobs API record to validate `runner_id` and `runner_name` instead.

This code correction does not make GitHub allocate a runner. It can only verify an assignment once one exists.

### 3. Worker routing identity conflicts with repository config

**Observed state**
- Live Cloudflare route owner for apex and `www`: Worker `thelingolegacy`.
- Original `main/wrangler.jsonc` Worker name: `thelingolegacyv-5`, while it also declares apex and `www` routes.

The draft aligns the canonical Worker config and authority check to `thelingolegacy`, and adds a separate `workers.dev` staging Worker configuration. This change is in PR #235 only; it has not been deployed.

### 4. Cloudflare build triggers had unsafe/wildcard scope and unvalidated commands

**Provider-side readback after containment**
- `thelingolegacy` preview trigger: nonmatching path filter `__LINGO_PREVIEW_DISABLED__/**`.
- `thelingolegacy` production trigger: branch restricted to `__LINGO_FAIL_CLOSED_HOLD__` plus nonmatching path filter `__LINGO_DEPLOYMENT_DISABLED__/**`.
- `thelingolegacyv-5` preview trigger: nonmatching path filter `__LINGO_PREVIEW_DISABLED__/**`.
- `thelingolegacyv-5` production trigger: branch restricted to `__LINGO_FAIL_CLOSED_HOLD__` plus nonmatching path filter `__LINGO_DEPLOYMENT_DISABLED__/**`.

The disable patterns are absent from the current repository tree, and the reserved hold branch has not been created. The trigger commands (`launchv-1`, `loyalty build`, and the existing Wrangler commands) remain unvalidated and must not be relied on until a controlled build proves them. Provider trigger containment is not itself proof that any build/deploy command works.

Tracker: [Issue #238](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/238).

### 5. Potential public asset exposure from a repository-root asset directory

The production config uses `assets.directory: "."` and the Worker calls `env.ASSETS.fetch(request)`. That can make repository files candidates for public delivery; actual exposure must be confirmed with controlled requests, not assumed.

The draft staging config uses `./staging-public`, an explicit directory with a noindex staging landing page and no production custom routes. Production asset scope remains unchanged pending a complete public-asset inventory and verified staging tests.

Tracker: [Issue #239](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/239).

### 6. Alternate manual workflow could reach production deployment

The original `lingo-autorepair-deploy.yml` offered a `deploy=true` path that ran `wrangler deploy` against the production config after its repair job. The repair script generates an evidence report but does not prove live deployment, rollback acceptance or certification by itself.

The draft changes the runner identity check and inserts an explicit fail-closed step before checkout/credential access in the production deploy job. This safeguard is only in PR #235, not yet in `main`.

The existing production-promotion workflow in the draft likewise deploys only to staging and deliberately fails closed for a production input.

### 7. Static CI token permissions and evidence correlation

The Static CI workflow used `actions: write` despite only running validation and uploading an artifact. The draft narrows this to `actions: read`, adds run/attempt/commit metadata, and keys artifacts by run and attempt. These are least-privilege and forensic improvements; they cannot repair pre-step runner allocation failures.

### 8. Vercel status context

A Vercel commit-status context exists even though the stated architecture retires Vercel. Earlier PR commit statuses included a Vercel failure; the latest inspected PR head reported Vercel success. This is a separate integration/status-context issue, not the current proven root cause of the missing GitHub runner assignment.

**Fix path:** inspect Vercel's GitHub integration/project settings and repository branch protection. If Vercel is truly retired, disable the obsolete integration/status source only after verifying which required checks protect `main`; do not remove a required check blindly.

Tracker: [Issue #237](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/237).

### 9. GitLab CI creation blocked by account identity verification

Pipeline [2928475549](https://gitlab.com/zavionecook/FameMoneyFortune/-/pipelines/2928475549) is failed with zero jobs. A later pipeline-create API attempt returned an identity-verification requirement.

**Fix path:** complete GitLab's legitimate account verification, then run a fresh pipeline and inspect the job list/logs. Rotate the legacy runner registration credential through GitLab settings; never paste it into logs or issues.

## Current change set

The draft PR includes:
- canonical Worker name alignment;
- staging config using an explicit staging-only asset directory;
- corrected GitHub job API identity checks for G02-related workflows;
- correlated sanitized evidence artifacts;
- reduced Static CI token permission;
- a production hold in both promotion paths.

PR: [#235](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/235).

## Acceptance and release state

The following remain **NOT ESTABLISHED / BLOCKED** until verified:
- hosted GitHub Actions job allocation and retrievable logs;
- G02 self-hosted runner dispatch and acceptance;
- static validation and Wrangler dry runs on an executing runner;
- staging deployment and live probes;
- production asset exposure test and asset-scope remediation;
- GitLab pipeline execution after identity verification;
- independent rollback target and release-evidence correlation.

**No production deployment, activation, merge, or new last-known-good baseline is authorized by this audit.**


## Additional findings staged in the recovery branch

### 10. Public release pages had unsupported green/ready claims
The flagship homepage, launch-verification page, release-notes page, Production Lock page, integration map, digital-drop page, universe map, and Live Casino Studio concept contained text implying a production deployment, checkout, analytics, or launch state was ready/verified. These were source-text assertions and did not match the actual CI/G02 evidence state.

**Source repair:** the affected pages now say source present, blocked, staged, or unverified as appropriate; old analytics script loaders were removed from the audited core pages. This updates the recovery branch only. It does not change the currently deployed public site until a reviewed release is authorized.

### 11. Release manifest and integration status contract overstated acceptance
The original release manifest listed TLS/domain aliases, static validation, and Vercel analytics as verified gates despite the current Actions run exposing no executed validation steps and no artifacts. The integration contract also reported `deployed=true` and `live=true` alongside `certified=false` without an accepted current evidence chain.

**Source repair:** the release manifest now states `BLOCKED_NOT_CERTIFIED`, lists only source-contract facts as verified, and moves CI, G02, staging, external reachability/TLS, rollback, Stripe/Firebase, and GitLab execution into pending hard locks. The integration contract now reports deployment/live evidence as not established and labels Worker/Cloudflare surfaces `configured_release_locked`. Static configuration inspection also confirmed required manifest source routes, canon entries, 48px minimum touch target, required icon entries/files, asset registry required fields, environment contract keys, and required sitemap URLs are present in the recovery branch. This is a manual readback, not a CI pass or live-route proof.

### 12. Stripe return flow could falsely imply a successful payment
The previous drop-page script interpreted `?checkout=success` as a completed checkout without checking the Stripe session. A user could manually supply that query parameter. The Worker success URL also did not include a session ID.

**Source repair staged:** the Stripe return URL now includes `{CHECKOUT_SESSION_ID}`; the Worker draft adds `GET /api/checkout-status` to retrieve the session from Stripe and checks payment status and store metadata; the browser only displays a paid status when the server returns a verified `paid=true`. The UI still warns that fulfillment requires a matching order record.

**Still required before payment can be activated:** edge-level abuse/rate controls, verified Stripe environment configuration, signature-verified/idempotent webhook handling, durable order records, amount/tier/currency/order binding and full test-mode end-to-end tests. This is tracked in [Issue #241](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/241). Nothing has been deployed.

### 13. Latest GitHub Actions failure re-confirms a provider-side blocker
Latest observed Static CI run when this audit was updated: [run 38009850298](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38009850298), job `114087075726`, commit `1a44e169876e68f19c59169eca0ca3f747259bf6`. The API returns failure, runner ID `0`, empty runner name, label `ubuntu-latest`, empty steps, no log URL and no artifacts.

**Interpretation:** this run did not execute the repository validators. The exact dispatch/platform cause remains unproven; repository/account Actions policy, account resource limits, runner-group/host registration and GitHub backend telemetry must be checked. If both hosted and self-hosted jobs continue failing before step initialization, escalation to GitHub Support with run/job identifiers is necessary.

### Current recovery tracker
- [#236 — G02 runner assignment and evidence](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/236)
- [#237 — Actions pre-step failures and missing logs](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/237)
- [#238 — Cloudflare triggers, route ownership, and build commands](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/238)
- [#239 — production root asset directory exposure review](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/239)
- [#241 — Stripe session verification, abuse controls, and order evidence](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/241)

## Final recovery posture

The current draft includes useful source repairs and clearer release truth, but **it is not a validated release**. The Cloudflare triggers remain contained; no staging or production deployment has occurred; the branch has not been merged; G02 and Actions execution remain unestablished; GitLab remains blocked by identity verification; and production activation remains blocked. Do not promote until the exact reviewed SHA receives real runner assignment, executed CI steps, retrievable logs/artifacts, successful staging probes, valid rollback/evidence acceptance and a separate explicit production authorization.
