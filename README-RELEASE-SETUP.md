# LINGO Release Setup — Import / Export Guide

This branch contains a non-production readiness and build configuration starter.

## Files
- `.github/workflows/lingo-parallel-build-readiness.yml` — hosted parallel Flutter Web and Android Debug build matrix.
- `scripts/verify-release-foundation.mjs` — registry and fail-closed readiness validator.
- `release/platform-matrix.json` — product/platform routing register.
- `release/publisher-connection-register.json` — portal connection and approval tracking.
- `release/signing-policy.json` — protected signing controls.
- `release/release-manifest-template.json` — release evidence and approval manifest.
- `release/observed-infrastructure-state-2026-11-14.json` — read-only GitHub, Firebase, Cloudflare and release status snapshot.
- `android/app/build.gradle` and `android/RELEASE-SIGNING-SETUP.md` — release signing now fails closed unless the protected upload-key environment is provisioned.
- `docs/operations/UNIFIED-BUILD-ACCELERATION-AND-RELEASE-READINESS-2026-11-14.md` — full implementation plan and observed blockers.

## Import
Review the pull request and merge only after required CI checks and independent engineering/security review. The workflow is PR-scoped and workflow-dispatchable. It uses GitHub-hosted runners only and does not deploy or sign.

## Export
Download the branch archive from GitHub:
`https://github.com/thelingolegacy-blip/TheLingoLegacy/archive/refs/heads/recovery/build-release-acceleration-2026-11-14.zip`

## Current limitation
The connected GitHub API can read and write repository contents but cannot access branch-protection administration or directly dispatch workflows in this session. Existing PR checks are returning `startup_failure` before jobs are instantiated. Firebase credentials, publisher portal access, signing material and review receipts are not connected. Do not add secrets to this branch.
