# Hello The Lingo Legacy — AppDeploy source archive

**Import status:** IMPORTED / PENDING INDEPENDENT REVIEW  
**AppDeploy app ID:** `hello-the-lingo-legacy-ois1rj`  
**Source snapshot:** `1793389793355`  
**Captured:** 2026-11-21  
**Preview:** https://hello-the-lingo-legacy-ois1rj.v2.appdeploy.ai/

This directory preserves the non-secret runtime source from the identified AppDeploy snapshot for review and versioning in the canonical GitHub repository. It is an imported snapshot, not yet the accepted source of truth and not proof of a reproducible deployment.

## Public asset boundary

The archive is stored under `ops/appdeploy-snapshots/`. Current main `.assetsignore` excludes `ops/` from the Cloudflare Worker static asset directory. Do not relocate this archive under a public path unless the publication allowlist has been independently verified.

## Included source

- Seven backend TypeScript modules.
- `cron.json` with the existing media health monitor schedule.
- `package.json` dependency/script metadata.
- `tests/tests.txt`, preserved as the original test inventory. It is descriptive text, **not an executable test suite**.

See [APPDEPLOY-SNAPSHOT.json](./APPDEPLOY-SNAPSHOT.json) for exact source version, file line counts, current runtime readback, and validation limits.

## Runtime readback (2026-11-21)

AppDeploy reports the app deployment as `ready`. The `media-health-monitor` cron handler `automatedHealthMonitor` is enabled every five minutes; its latest run was successful at timestamp `1795287055` with `failure_count: 0`.

Retained backend error history still contains an earlier HTTP 503 `AppDatabaseGatewayUnavailable` event (timestamp `1794887729466`). The latest retained frontend error is `Request aborted` (timestamp `1795284351243`). A subsequent status query from that timestamp returned no newer frontend or backend errors. This is a status refresh, not proof of complete backend correctness.

## Acceptance still required

1. Independent source review and a comprehensive secret/PII scan.
2. Add executable unit and integration tests for runtime, events, publish, subscriptions, media health, recovery, and audit routes.
3. Verify endpoint authorization against issue #468; imported modules contain no explicit route-level auth guard in the inspected source.
4. Validate the imported source against a clean, isolated AppDeploy export and deterministic sync process.
5. Run tests/builds in an approved isolated environment and record correlated evidence.
6. Keep provider repair, deployment, and production promotion separately authorized.

No secrets are intentionally included. A limited credential-pattern scan found no matches in inspected source modules; this is not a comprehensive security audit.
