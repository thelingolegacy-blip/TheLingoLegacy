# LINGO Legacy Waves 0–4 Execution Checklist

**Snapshot:** 2026-11-08 UTC  
**Status:** Work package prepared; completion and production activation not certified.

## Wave 0 — Source of truth and registry

- [x] Canonical GitHub repository identified: `thelingolegacy-blip/TheLingoLegacy`.
- [x] Product groups and product names captured from existing canon.
- [x] Flat product inventory generated; owner, repo path, public surface, runtime, API and gate remain explicitly unverified where absent.
- [x] Dependency graph baseline captured.
- [x] 21 Cloudflare routes and Worker/DNS inventory refreshed.
- [x] 18 AppDeploy application records captured in baseline.
- [ ] Assign accountable owners and map every product to repository paths, surfaces, runtime, API and test evidence.
- [ ] Independent registry review and schema validation in executable CI.

## Wave 1 — CI / G02

- [x] Startup-failure evidence recorded for current runs.
- [x] Latest inspected Static CI run returned zero jobs.
- [x] PR #508 sentinel path diff reviewed; it corrects fixture path references.
- [ ] Diagnose GitHub Actions startup failure with GitHub support/authorized administration evidence.
- [ ] Confirm dedicated runner registration, runner ID/name, labels, service health and assignment.
- [ ] Execute G02 sentinel on dedicated runner and collect raw logs/artifact/checksum.
- [ ] Execute hosted smoke separately.
- [ ] Independent acceptance of M04/M05/M06; G02 remains FAIL until then.

## Wave 2 — Cloudflare edge

- [x] Live routes, scripts, DNS and deployment/version records read.
- [x] Upload/deployment version-ID mismatches documented for primary and root Workers.
- [x] Apex wildcard and exact-root overlap documented.
- [x] TEST-NET-1 apex A record documented as a critical origin/fallback blocker.
- [ ] Resolve deployed version IDs to exact version metadata and source commits.
- [ ] Reconcile `wrangler.jsonc` with all 21 routes and intended ownership.
- [ ] Verify Access, WAF, rate limiting, bindings, observability, origin health and rollback.
- [ ] Candidate-only probes and independent acceptance.

## Wave 3 — Firebase / identity

- [x] Repository Firebase project identity and config files inspected.
- [x] Placeholder API keys/app IDs identified in client config and Flutter options.
- [x] Root Hosting publish directory `.` and absence of root Firestore rules documented.
- [x] Separate Oasis Firestore rules and Functions source identified.
- [ ] Confirm authoritative Firebase project and app registrations through authorized provider console/API.
- [ ] Create or verify isolated staging project, Auth providers, App Check, indexes, rules, backups and restore drills.
- [ ] Replace placeholders only with authorized project-generated public client configuration; no service-account secrets in source.
- [ ] Flutter analyze/test/build and emulator-based auth/rules tests.

## Wave 4 — LINGO ID / wallet

- [x] Non-production identity/wallet/API architecture proposal and invariants authored.
- [x] Existing Oasis demo wallet function inspected; it is product-specific DOUGH demo currency, not the universal wallet.
- [ ] Define canonical user profile, roles, entitlements and account recovery contracts.
- [ ] Implement server-owned ledger and idempotency service in isolated staging.
- [ ] Add property, concurrency, reconciliation, replay and restore tests.
- [ ] Prove demo currency and Lingo Coins remain separate and non-redeemable.
- [ ] Independent security and product-owner acceptance.

## Non-negotiable control status

- Main branch protection API state: reported disabled; restore through a reviewed policy change after required check names are proven.
- PR #511: draft/unmerged registry baseline.
- PR #508: draft/unmerged sentinel path correction.
- G02: FAIL / UNVERIFIED.
- Production deployment and activation: BLOCKED / HOLD.
- No Cloudflare route/DNS/Worker deployment, Firebase mutation, runner registration/activation, policy weakening, payment activation or production promotion was performed.

## Resume order

1. Obtain administrative evidence for Actions startup failure and runner health.
2. Establish isolated G02 runner control plane without exposing privileged runner to untrusted PR code.
3. Review and merge registry only after schema/test evidence and independent review.
4. Restore branch protection with verified required-check contexts and tested emergency recovery.
5. Reconcile Cloudflare candidate versions/routes and Firebase staging identity.
6. Implement and test LINGO ID/wallet contracts in staging.
7. Continue product surfaces only against stable, versioned contracts.
