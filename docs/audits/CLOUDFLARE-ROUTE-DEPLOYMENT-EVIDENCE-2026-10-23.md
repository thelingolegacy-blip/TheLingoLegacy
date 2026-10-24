# Cloudflare Route and Deployment Evidence Addendum — 2026-10-23

This addendum records a second read-only Cloudflare API pass performed after the initial audit matrix was committed. No Cloudflare resource was changed.

## Verified live route inventory

Zone `thelingolegacy.com`:
- Zone ID: `91c3f6315fb3ca132b22744721103f88`
- Status: active; not paused.
- Read-only `GET /zones/{zone_id}/workers/routes` returned 18 routes. The apex `thelingolegacy.com/*`, `www.thelingolegacy.com/*`, and the other returned routes all target Worker `thelingolegacyv-5`.
- Apex route ID: `41e8d027e8cd4cb19d21df7143a2c25e`.
- www route ID: `c861b5b2158745f2bcfbfdca9778c325`.

Worker script inventory (read-only `GET /accounts/{account_id}/workers/scripts`) returned:
- `thelingolegacyv-5`
- `thelingolegacy-web-recovery-preview`
- `obsidian-closet-design-preview`

## Production Worker metadata

Read-only `GET /accounts/{account_id}/workers/scripts/thelingolegacyv-5/settings` returned:
- Compatibility date `2026-09-01`, flag `nodejs_compat`.
- Bindings listed: `ASSETS`, `CANONICAL_DOMAIN=thelingolegacy.com`, `PUBLIC_SITE_URL=https://thelingolegacy.com`.
- Metadata annotations include `workers/alias=ops-lingo-assister-parallel-audit-2026-10-23` and `workers/triggered_by=version_upload`.
- Latest deployment returned by the deployments endpoint was created `2026-08-31T05:55:46.692084Z`, version `d1c4f26b-0e79-4aec-9821-8dea6381c051`, at 100%. Other returned production deployments are dated August 30–31.

**Interpretation:** live apex/www routes still map to the production Worker, and the most recent deployment record returned for that Worker is old relative to the October recovery work. The alias annotation is metadata, not sufficient proof that the audit branch is deployed or that runtime source matches the repository. Confirm the active version's source/build provenance and compare it with the current main/release commit before any release decision. Do not update or roll back the Worker speculatively.

## Preview Worker metadata

Read-only settings for `thelingolegacy-web-recovery-preview` returned compatibility date `2026-09-07`, an `ASSETS` binding, and observability enabled with persisted invocation logs. The ten most recent deployment records returned were created on October 23, 2026, with source `wrangler`, each listing a single version at 100%. This proves recent deployment activity, not that the current deployment is accepted, correctly isolated, or built from the desired PR SHA.

The preview settings returned `redact_query_string=false`. Treat query strings as potentially sensitive; review whether query-string logging is needed and redact sensitive query data in the application and logs. Do not change settings in this audit.

## Actions required

1. Capture current deployed Worker version and script source with immutable version/deployment IDs.
2. Correlate production Worker source with the authorized main/release SHA and preview Worker source with the intended repository/branch/SHA.
3. Run fresh public smoke tests for apex, www, health, unknown routes and relevant API contracts; capture status, response headers, console/network evidence and timestamp.
4. Review query-string redaction and ensure secrets or personal data are never placed in URLs.
5. Keep production routes, Worker code, build controls and DNS unchanged until explicit release authorization.

This addendum is read-only inventory evidence. It does not establish complete runtime, security, accessibility, backend or disaster-recovery acceptance.
