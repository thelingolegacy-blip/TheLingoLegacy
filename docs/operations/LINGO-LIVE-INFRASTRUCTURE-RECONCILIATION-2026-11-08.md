# LINGO Live Infrastructure Reconciliation — 2026-11-08

**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Control branch:** `feat/lingo-master-registry-wave0-2026-11-08`  
**Disposition:** READ-ONLY RECONCILIATION / PROTECTED HOLD  
**Production mutations:** None  
**Evidence class:** Live provider API observations plus repository workflow evidence

## Executive findings

1. GitHub Actions startup failures remain pre-job failures. The three inspected runs completed with `startup_failure`; the jobs endpoint returned zero jobs and the artifacts endpoint returned zero artifacts for each.
2. Cloudflare currently reports 21 Worker routes, 33 DNS records, and 11 uploaded Worker scripts.
3. The four routed Workers inspected have active deployments at 100% traffic. The active deployment IDs and version IDs are recorded in `config/registry/cloudflare-route-inventory.v1.json`.
4. The apex DNS A record is `thelingolegacy.com -> 192.0.2.0` (proxied). `192.0.2.0/24` is TEST-NET-1, reserved for documentation by RFC 5737. This is a confirmed origin/fallback blocker; it is not proof that Worker-routed requests are currently down.
5. The apex has two overlapping routes: `thelingolegacy.com/*` to `thelingolegacyv-5` and `thelingolegacy.com/` to `lingo-flagship-root`. Cloudflare documents that the most specific matching route wins, so the exact root route should win for `/`; live HTTP smoke testing is still required.
6. The latest uploaded Worker versions are not necessarily the versions serving traffic. Preserve active deployments until source provenance and candidate smoke tests are established.

## GitHub Actions evidence

Commit inspected: `b171c3a534eeee61cc648c42111b2ab4a73de309`.

| Workflow | Run ID | Conclusion | Jobs | Artifacts |
|---|---:|---|---:|---:|
| Lingo Legacy Static CI | 42539590962 | startup_failure | 0 | 0 |
| G02 Runner Image Build (no publish) | 42539590108 | startup_failure | 0 | 0 |
| Crimson Smoke UI — static validation | 42539589042 | startup_failure | 0 | 0 |

Interpretation: the evidence does not show a test assertion failure or a runner step failure. It shows workflow startup did not instantiate a job. The next diagnostic boundary is GitHub Actions control-plane/repository policy and runner assignment evidence. Do not repeatedly rerun the same startup-failing jobs as a substitute for diagnosis.

## Cloudflare live inventory

- Zone: `thelingolegacy.com`
- Zone ID: `91c3f6315fb3ca132b22744721103f88`
- Routes: 21
- DNS records: 33
- Uploaded Worker scripts: 11

### Active routed deployments

| Worker | Active deployment | Active version | Traffic |
|---|---|---|---:|
| `thelingolegacyv-5` | `ecd71a70-e476-4318-92a7-35249ced360b` | `2d161fa5-598f-4998-ada8-7ac4c72c3461` | 100% |
| `lingo-flagship-root` | `31ccefbb-ddf4-4a62-974b-3ee9d0bc81d3` | `658acd1a-997b-45cd-b8fc-e59c59b26b45` | 100% |
| `lingo-static-backup-proxy` | `738c80e8-f535-4712-9339-e8b495152c89` | `a60ca6d2-fc20-4bf8-8e42-cb4a4b3b9708` | 100% |
| `lingo-ecosystem-atlas` | `6dfd9de7-c594-4cce-8b24-4cb6c2868bc7` | `367586a9-f3c9-4fa4-838e-38c3014575d2` | 100% |

The registry's existing version-detail observations identify the primary Worker as deployed v137 while uploaded v270 is newer, and the root Worker as deployed v1 while uploaded v2 is newer. Uploading a version does not make it active. This discrepancy must be reconciled against the source commit, build provenance, compatibility date, bindings and smoke results before promotion.

### DNS and route safety

The apex A record is a proxied TEST-NET-1 address. Do not replace it with a guessed address. First identify the intended origin or determine whether the apex Worker should be converted to a Custom Domain (if the Worker is itself the origin) rather than retaining an origin-backed Route. Cloudflare documentation distinguishes Routes (Worker in front of an origin) from Custom Domains (Worker is the origin).

The route overlap should be tested with requests to:
- `https://thelingolegacy.com/`
- `https://thelingolegacy.com/index.html`
- `https://thelingolegacy.com/<known-safe-nested-path>`
- `https://www.thelingolegacy.com/`

Capture status, redirect chain, response headers, body fingerprint and Worker invocation logs. Do not change route patterns until the intended ownership and request behavior are proven.

## Immediate corrective sequence

### CI / G02
1. Obtain GitHub Actions administrative evidence for repository/org Actions policy, runner groups, runner inventory and workflow restrictions.
2. Obtain authorized host inventory and inspect the existing runner service before restarting or re-registering anything.
3. Confirm no duplicate runner registration and reconcile runner ID/name/labels with the host.
4. Run a harmless hosted smoke job independent of G02.
5. Run the G02 sentinel only after host identity and service health are proven.
6. Require executed steps, logs, artifacts, checksums and commit/run correlation before acceptance.

### Cloudflare
1. Preserve the active deployments and export their version metadata/source annotations.
2. Verify source commit and bindings for deployed v137/v1 versus latest uploaded v270/v2.
3. Establish whether the apex Worker is the origin or a proxy in front of an origin.
4. Identify the correct origin before any DNS change.
5. Perform candidate-only HTTP smoke tests and route-specificity checks.
6. Prepare a rollback map before any approved production change.

### Firebase / application runtime
1. Confirm the authoritative Firebase project and registered app IDs through an authorized provider read.
2. Keep placeholder client config blocked; never substitute guessed IDs or keys.
3. Validate Hosting output scope, Firestore rules, indexes, Auth providers and App Check in an isolated staging project.
4. Run emulator-based security/rules tests and reproducible web/mobile builds.

## Boundaries and non-actions

No DNS, Worker route, Worker deployment, Firebase resource, secret, GitHub policy, runner registration, billing or production state was changed. No runner host restart was attempted because no authorized host connection was available. This report is not a production acceptance certificate.

## External technical references

- RFC 5737 — IPv4 Address Blocks Reserved for Documentation: https://www.rfc-editor.org/rfc/rfc5737.html
- Cloudflare Workers route matching and specificity: https://developers.cloudflare.com/workers/configuration/routing/routes/
- Cloudflare Routes and Domains guidance: https://developers.cloudflare.com/workers/configuration/routing/
