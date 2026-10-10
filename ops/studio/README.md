# Studio Infrastructure CI/CD — Isolated Implementation

## Scope
This branch introduces a pull-request-only Studio operations view, read-only runner assignment probe, fail-closed infrastructure contract checks, and deterministic media asset manifest. It does not deploy, merge, activate, or change production configuration.

## Workflows
- `.github/workflows/studio-platform-ci.yml`: validates the existing release-critical static site, Cloudflare binding contract, Studio UI/contract files, and creates a media manifest. Artifacts are retained for 14 days. No deploy step exists.
- `.github/workflows/g02-runner-assignment-probe.yml`: manual dispatch only. It records the actual hosted runner context and attempts a read-only repository runner inventory request. It always retains probe evidence when a runner actually executes the steps.
- The canonical self-hosted sentinel job is opt-in using repository variable `LINGO_G02_SENTINEL_ENABLED=true`. It remains disabled unless an administrator intentionally enables it after checking the runner inventory and host safety.

## Evidence acceptance
A successful workflow status alone is not sufficient for G02. Acceptance requires all of:
1. Real runner assigned, with ID greater than zero.
2. Runner name populated and equal to the approved runner for the self-hosted sentinel.
3. Steps instantiated and sentinel step executed.
4. Logs retrievable.
5. Artifact retrievable and checksums verified.
6. Run, attempt, job, runner identity, and full commit SHA correlated.
7. Independent verification of the evidence.

The runner inventory API can return 403 when the workflow token lacks the endpoint's administration permission. The probe records that result as unavailable; it must not infer that no runner exists. Do not grant extra permissions solely to make the probe green without an administrator review.

## UI and media
- `studio/ops/index.html` is a static, responsive Industrial Noir dashboard with accessible landmarks, focus styling, and reduced-motion support.
- `studio/ops/studio.js` only reads a user-selected JSON file locally, caps the file at 2 MiB, and never uploads or changes gate state.
- `ops/studio/media-pipeline.json` defines accepted formats, intended transforms, metadata quality gates, and output paths.
- `ops/studio/build-media-manifest.mjs` currently builds a deterministic SHA-256 manifest and validates registry entries. Image/audio/video transformation itself is configuration only and is not claimed to run yet.
- `studio/assets/asset-registry.json` begins empty. Add assets only with license/source records and required accessibility metadata.

## Security and promotion
- Default token permissions are read-only; checkout credentials are not persisted.
- No API token is created, echoed, or committed.
- No secrets, billing identifiers, production Worker bindings, or DNS changes are part of this branch.
- Auto-merge, deploy-on-push, and automatic activation remain disabled.
- Do not run untrusted pull-request code on a self-hosted runner. Review the trigger policy and isolate the runner before enabling its sentinel.
- Production mutation remains FROZEN and last-known-good remains PROTECTED. This branch must stay separate until checks execute and independent review accepts the evidence.
