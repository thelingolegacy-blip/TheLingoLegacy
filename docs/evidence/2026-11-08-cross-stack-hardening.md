# LINGO Legacy cross-stack hardening evidence — 2026-11-08

## Scope and disposition

This is an evidence and remediation plan for the cross-stack recovery request. It records verified live configuration, source-of-truth findings, safe changes already performed, and controls that must remain in place. It does not authorize broad production promotion, credential changes, data migrations, DNS removal, or application deletion.

## Production Cloudflare security change performed

- Zone: `thelingolegacy.com`
- Zone ID: `91c3f6315fb3ca132b22744721103f88`
- Change: created a zone phase entrypoint for `http_request_firewall_managed`.
- New ruleset ID: `0ea606cf0280453cb0a89e871ab520ce`
- Ruleset name: `LINGO Zone Managed WAF`
- Managed ruleset executed: Cloudflare Managed Free Ruleset, ID `77454fe2d30c4220b5701f6fdfb893ba`
- Rule ID: `ed6f7d52a9b54d4081a8b90bbbe42e5e`
- Action: `execute`; expression: `true`; enabled: `true`.
- API accepted the new ruleset at `2026-11-08T20:17:23.316475Z`; a subsequent GET of the phase entrypoint returned the same ruleset ID, phase, version, enabled rule and target managed ruleset ID.
- Scope: Cloudflare managed free WAF rules now execute for incoming zone requests. This is a production security configuration change, not an application deployment.
- Rollback reference: remove only the newly created entrypoint ruleset `0ea606cf0280453cb0a89e871ab520ce` after assessing impact; do not delete the pre-existing custom firewall or rate-limit entrypoints.

## Verified Cloudflare baseline

- Cloudflare authenticated identity has Super Administrator role. Account-level 2FA is currently disabled on that identity; this is a high-priority account security action requiring the owner to complete the interactive enrollment flow.
- Zone is active and unpaused; SSL mode is `strict`, minimum TLS is `1.3`, Always Use HTTPS is `on`, Automatic HTTPS Rewrites is `on`, HTTP/3 is `on`, Browser Check is `on`, Hotlink Protection is `on`.
- Before the WAF change, the legacy `waf` zone setting read `off`, and no managed-WAF phase entrypoint existed. The managed-free ruleset is now attached through the current Rulesets API.
- Existing custom firewall entrypoint has several active rules. It includes duplicate POST `/admin` challenge rules and a later POST `/admin` block rule. Do not remove or reorder these without confirming the intended admin access flow; current behavior may intentionally deny the path.
- Existing rate-limit phase entrypoint exists. Do not replace it.
- DMARC is currently `p=none`; SPF uses `~all`. Do not strengthen DMARC to quarantine/reject until aggregate reports, legitimate senders, Google Workspace configuration and forwarding behavior have been reviewed.
- DNS includes two Vercel verification TXT records for `_vercel.thelingolegacy.com`, an `app` CNAME to `my-flutter-app.pages.dev`, an `admin` CNAME to Firebase Hosting, and an AppDeploy-backed `casino` CNAME. Do not delete or retarget these until domain ownership and active application mapping are confirmed.
- Many application subdomains and the apex/www hostnames route to `thelingolegacyv-5`. Apex root path `/` has a more specific route to `lingo-flagship-root`. No route or DNS changes were made.
- Production Worker `thelingolegacyv-5` has a deployment record dated 2026-10-25; its script metadata was modified 2026-11-08 by a version upload/probe annotation. Do not assume that uploaded version is active: the latest deployment history still shows the 2026-10-25 deployment at 100%.
- Staging Worker `lingo-game-engine-staging` is isolated with D1 and `ENVIRONMENT=staging`; it has no Firebase project binding. Its current deployed version is settings-only, not the PR #503 source.
- Staging D1 `lingo-game-engine-staging-20261107` has five application tables; `lingo_api_rate_limits` is absent, so migration `0002` remains unapplied.

## GitHub source and control-plane findings

- Canonical repository: `thelingolegacy-blip/TheLingoLegacy`, default branch `main`.
- PR #498 and PR #503 remain open and draft; neither is merged.
- GitHub Actions validation and independent hosted-runner probes have been failing before job creation, with zero jobs and zero artifacts. No tests, build, or Wrangler dry-run have executed for those attempts.
- The repository integration cannot read Actions repository permissions, runner registration, or branch-protection configuration; branch protection read returned 403. Do not infer that these settings are disabled or enabled from the unavailable endpoints.
- The production workflows intentionally hold Cloudflare deployment behind `if: false` until independent acceptance and staging isolation exist. Preserve that hold.
- The repository contains a Flutter/Firebase integrity workflow which correctly fails if Firebase option placeholders remain.

## Firebase and Flutter blockers

- `.firebaserc` currently names `lingo-legacy-production`.
- `lib/firebase_options.dart` still contains placeholder API keys and app IDs for web, Android, iOS, macOS, and the messaging sender ID. These are not valid release credentials.
- `scripts/verify-flutter-firebase.mjs` correctly rejects these placeholders. Do not weaken or bypass the validator.
- No Firebase connector is available in this environment to inspect project app registrations, Auth providers, App Check, Firestore/Realtime Database rules, Storage rules, Hosting releases, or API-key restrictions.
- Required: owner supplies/validates real Firebase app configuration through Firebase Console/FlutterFire CLI or a secure CI secret-entry process. Never commit service-account private keys or real secret values.
- Required: confirm whether Firebase is intended to remain the canonical production app backend or only an identity provider. The existing production workflow describes Firebase as contract-only while the Flutter app declares Firebase Auth, Realtime Database, Storage, and Analytics dependencies. This architecture contract must be reconciled before production activation.

## Frontend, backend, and AppDeploy

- AppDeploy account listing returned 18 deployed app records. The same 18 records appeared under two linked account handles; a third linked handle returned no apps. Treat the duplicate listing as account-link duplication until confirmed; do not delete apps.
- Descriptions for the Studio Hub, Enterprise Control Center, Loyalty staging preview, and game apps explicitly describe staging/demo-only behavior. Do not infer that a deployed AppDeploy preview is a production release.
- No production custom domain, Firebase project, Cloudflare route, or payment integration was changed for these apps.
- Backend service integrations and application-specific runtime health still require per-app status/log inspection and authenticated end-to-end tests.

## Required owner / provider actions

1. Enable Cloudflare account 2FA for the Super Administrator identity; verify recovery codes and at least one second factor.
2. Restore GitHub Actions control-plane access: inspect repository Actions settings, runner registration and service health, and branch protection/rulesets. Do not rerun G02 until the token-exposure remediation and duplicate-runner registration checks are complete.
3. Provision/verify dedicated Firebase staging project and registered platform apps; deliver configuration through an approved secret/config path.
4. Decide and document Firebase's production role versus Cloudflare/Firebase contract-only architecture.
5. Apply staging D1 migration `0002` only after backup/export and exact migration review; verify the table and constraints before deploying any Worker source that reads it.
6. Run current-head CI, Node/Python/Flutter tests, Wrangler dry-run, authenticated staging wallet/reward journeys, browser/device QA, and independent review.
7. Review DMARC aggregate reports and all legitimate sending sources before tightening email authentication.
8. Reconcile Vercel verification TXT records, Flutter Pages CNAME, Firebase admin CNAME, and AppDeploy casino hostname against current owners before removing any stale records.
9. Audit production Worker active deployment/version versus uploaded source and perform controlled staged promotion only after independent tests and rollback readiness.

## State-change record

- Timestamp (UTC): `2026-11-08T20:17:23.316475Z`
- Environment: Cloudflare production zone `thelingolegacy.com`
- Change type: add zone managed-WAF phase entrypoint
- Actor: connected Cloudflare Super Administrator integration
- Authorization basis: user requested enabling safe security hardening and updating live production.
- Verification: immediate GET of the phase entrypoint confirmed ruleset ID `0ea606cf0280453cb0a89e871ab520ce`, phase `http_request_firewall_managed`, version `1`, enabled execute rule `ed6f7d52a9b54d4081a8b90bbbe42e5e` targeting managed free ruleset `77454fe2d30c4220b5701f6fdfb893ba`.
- No Worker source, DNS, route, Firebase, D1, GitHub Actions, or production application code was changed by this hardening operation.


## Additional live endpoint and AppDeploy readback

- Public production homepage `https://thelingolegacy.com/` responds and renders the current flagship candidate experience. Its page text explicitly labels the destination catalog as a navigation-ready design candidate, says destinations must be connected to verified routes before production activation, and says account/wallet actions should only be enabled after secure services are verified. This is consistent with the fail-closed release posture; it is not evidence that all ecosystem products are production-active.
- Public `https://thelingolegacy.com/healthz` returned plain-text `ok` after the managed-WAF ruleset was attached. This is a basic edge health probe only; it does not validate authenticated application APIs or downstream services.
- The `/api/v1/runtime` endpoint could not be retrieved through the available public web reader. Treat runtime health as unverified rather than failed.
- AppDeploy reports 18 apps as deployed under one linked account handle; the same 18 appeared under a second linked handle, while a third handle had no apps. No apps were changed or deleted.
- Read-only AppDeploy QA snapshots for `LINGO Enterprise Control Center`, `LINGO Studio Hub`, `Hello The Lingo Legacy`, and `That's My Lingo` showed no frontend or network errors at their recorded QA timestamps; Studio Hub and That's My Lingo also reported valid source snapshots. These are provider QA snapshots, not a current authenticated end-to-end production certification.
- AppDeploy account reports an exhausted credit balance. The `Hello The Lingo Legacy` `media-health-monitor` cron is disabled with reason `credits_exhausted`; it has no failures recorded at its last successful run. Do not re-enable it until the account is funded and the job is verified not to incur unexpected cost. No app redeploy or resource mutation was attempted.


## Latest GitHub control-plane readback

- PR #506 current head: `66c01e221d83bc900f06562ae2067cfb79825c9a`; open, draft, unmerged; GitHub reports mergeable with state `unstable`.
- PR #503 remains open, draft and unmerged; current head `e31ddc707bbe91244c8711538be2b1a304d8de63`; mergeable state `unstable`.
- Immediately after PR #506 creation, three workflows (Static CI run `42519423483`, G02 Runner Image Build run `42519422765`, Crimson Smoke UI run `42519421875`) all ended `startup_failure` at commit `f76fc7da30ccaccc88e4540d6ef68280ae5cc838`. The preceding commit `7f74a2ad90da59e6bc9523f4d778fb0e82eaf4e0` also had the same three workflow startup failures.
- These are new examples of the same pre-job failure across unrelated workflow definitions. No job execution evidence has been produced; treat repository Actions service/settings/runner integration as a shared upstream blocker, not a failing application test.

- Follow-up readback of those three runs confirmed exactly 0 jobs and 0 artifacts for each run.
