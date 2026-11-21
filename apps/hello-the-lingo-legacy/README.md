# Hello The Lingo Legacy — AppDeploy source snapshot

**Import status:** IMPORTED / PENDING INDEPENDENT REVIEW  
**AppDeploy app ID:** `hello-the-lingo-legacy-ois1rj`  
**Source snapshot:** `1793389793355`  
**Captured:** 2026-11-21  
**Preview:** https://hello-the-lingo-legacy-ois1rj.v2.appdeploy.ai/

This directory preserves the non-secret runtime source from the identified AppDeploy snapshot so it can be reviewed and versioned in the canonical GitHub repository. It is an imported snapshot, not yet the accepted source of truth and not proof of a reproducible deployment.

## Included source

- Seven backend TypeScript modules.
- `cron.json` with the existing media health monitor schedule.
- `package.json` dependency/script metadata.
- `tests/tests.txt`, preserved as the original test inventory. It is descriptive text, **not an executable test suite**.

See [APPDEPLOY-SNAPSHOT.json](./APPDEPLOY-SNAPSHOT.json) for exact source version, file line counts, current observed runtime issue, and validation limits.

## Known runtime observation

AppDeploy reported the `media-health-monitor` cron handler `automatedHealthMonitor` returning HTTP 503 with `AppDatabaseGatewayUnavailable`. The source uses the AppDeploy database gateway abstraction (`db.list`, `db.add`, `db.update`). This observation does not establish whether the fault is provider-side, app configuration, or a runtime contract defect. No credential or provider change was attempted.

## Acceptance still required

1. Independent source review and a complete secret/PII scan.
2. Add executable unit and integration tests for runtime, events, publish, subscriptions, media health, recovery, and audit routes.
3. Verify endpoint authorization against issue #468.
4. Validate the imported source against a clean, isolated AppDeploy export and deterministic sync process.
5. Run tests/builds in an approved isolated environment and record correlated evidence.
6. Keep deployment, provider repair, and production promotion separately authorized.

No secrets are intentionally included. A limited pattern scan for private-key headers, common token formats, and credential assignments found no matches; this is not a comprehensive security audit.
