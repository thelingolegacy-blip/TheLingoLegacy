# Orchestrator provenance and redirect repairs — 2026-11-20

## Scope

Static source changes made on PR #615 branch `audit/reconciled-v1-1-live-inventory-2026-11-19`. Latest reviewed PR #615 head: `272bff018c17f358a95d26bd847ab4e6306aa627`.

No orchestrator execution, workflow dispatch/rerun, merge, deployment, runner activity, Firebase mutation, Cloudflare/Worker/DNS mutation, or production promotion occurred.

## Repairs committed

1. **Firebase staging identity forwarding:** `LINGO_FIREBASE_STAGING_PROJECT_ID` is allowlisted only as an explicit child-process extra and passed only to `scripts/verify-flutter-firebase.mjs`. It is not inherited from the parent environment by default.
2. **Redirect destination validation:** public probes capture the `Location` header and resolve relative targets. A redirect is accepted only for HTTPS on the original probe hostname, with no embedded credentials and only the default HTTPS port. Redirects remain unfollowed. Malformed ports fail closed.
3. **Root checkout SHA binding:** CLI now requires `--source-expected-sha`; root Git cleanliness and exact HEAD are checked before and after the copy. Source integrity evidence records the expected SHA and match result.
4. **Copy provenance / TOCTOU mitigation:** deterministic SHA-256 manifests are computed before and after source copying and on the copied tree. Root, CORE V2, and Firebase candidates are rechecked for clean Git state and stable expected HEAD across the copy boundary. Failed candidate copies are recorded as FAIL and are not passed to downstream validators.

## Regression tests added

- Stable source/copy manifest equality.
- Simulated source mutation during copy is rejected.
- Firebase staging ID is absent from default child environment and present only when explicitly scoped.
- Same-host HTTPS redirects accepted; cross-host, downgrade, userinfo, and malformed-port redirects rejected.
- Root expected SHA CLI argument is mandatory.

The CLI examples and operator README were updated to describe the new SHA and copy-integrity requirements.

## Validation boundary

The files were read back from GitHub after the changes. The regression tests and Python compilation have **not** executed. The four current-head Actions runs (44848252241, 44848253114, 44848251106, 44848250035) all ended `startup_failure`; their latest-attempt jobs arrays are empty. No cause for the provider/admission failure is inferred.

The candidate checkout expected-SHA gates for CORE V2 and Firebase were already present before this repair series; the separate root checkout expected-SHA requirement was missing and is now added.

**Disposition:** source repair proposed; runtime/test acceptance BLOCKED / NOT VERIFIED; PROTECTED HOLD remains.
