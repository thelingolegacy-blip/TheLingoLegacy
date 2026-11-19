# LINGOlegacy_MASTER v1.1 — Live Reconciliation Evidence

**Captured:** 2026-11-19 (UTC)  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Base branch:** `main`  
**Inspected main commit:** `1a60e2314cb3f9b5e3efe648ade83121080cb7b2`  
**Disposition:** READ-ONLY AUDIT; PROTECTED HOLD  
**Certification:** NOT CERTIFIED; this document records observations, not release approval.

## 1. Control state

- Program baseline: Reconciled Candidate Baseline v1.1.
- G02: FAIL / UNVERIFIED.
- G03–G11: BLOCKED.
- Production, DNS, Worker routes/deployments, Firebase publication, G02 runner activation, credentials, checkout, paid ads, and destructive infrastructure remain protected.
- This audit performed read-only GitHub and Cloudflare requests. It did not change DNS, routes, Workers, deployments, production configuration, repository settings, or credentials.
- A review branch and this evidence document were created in GitHub; no changes were made to `main`.

## 2. GitHub source snapshot

### 2.1 Repository

- Canonical repository: `thelingolegacy-blip/TheLingoLegacy`.
- Default branch: `main`.
- Repository is public and not archived.
- Connected GitHub integration reports repository permissions: admin, maintain, push, pull, and triage.
- Effective organization/repository Actions policies, branch protection, and all ruleset settings were not established by this inventory and must not be inferred from connector access.

### 2.2 Current main configuration risks

Read from `main` at the inspected commit:

**`firebase.json`**
- Hosting `public` is `.` (repository root).
- Ignore entries are `firebase.json`, `firebase.client.json`, `**/.*`, and `**/node_modules/**`.
- This is not a dedicated generated-output boundary. Treat it as a P0 publication-scope defect until a reviewed allowlist build is accepted.

**`.firebaserc`**
- Default Firebase project is `lingo-legacy-production`.
- This is configuration evidence only; it does not establish that a Firebase deployment occurred during this audit.

**`wrangler.jsonc`**
- Worker name is `thelingolegacyv-5`, matching the currently observed Cloudflare wildcard Worker name.
- Canonical route declarations include apex wildcard and www wildcard.
- The live exact-root route `thelingolegacy.com/` is absent from this file. This is source-to-runtime route drift and requires a documented ownership decision; do not normalize live routes without approval.

### 2.3 Main commit status

The GitHub combined-status endpoint returned one reported status:
- Context: `Vercel – the-lingo-legacy`
- State: `failure`
- Target indicates a Vercel build-rate-limit/upgrade page.

This is not a GitHub Actions job result and does not establish the status of every check or workflow on main.

## 3. G02 execution evidence spot-check

The GitHub workflow Jobs and Artifacts endpoints were queried for these recorded workflow runs:

| Run ID | Jobs returned | Artifacts returned |
|---|---:|---:|
| 43719253275 | 0 | 0 |
| 43719257087 | 0 | 0 |
| 44560383636 | 0 | 0 |

These observations do not satisfy any execution-based G02 acceptance predicate. In particular, they do not provide an assigned runner ID/name, instantiated job, completed steps, logs, or sentinel artifact. The nine-predicate G02 acceptance checklist remains unchanged and FAIL / UNVERIFIED.

## 4. Cloudflare live inventory

### 4.1 Account and zone

- Authenticated Cloudflare profile was verified.
- One account was returned: `Thelingolegacy@gmail.com's Account`.
- Active zone: `thelingolegacy.com`.
- Zone ID: `91c3f6315fb3ca132b22744721103f88`.
- Zone status: `active`.
- Plan returned: `Free Website`.

### 4.2 Counts

| Inventory | Live API observation |
|---|---:|
| Worker routes | 27 |
| Worker scripts | 9 |
| DNS records | 34 |

The repository file `infrastructure/registry/workers.json` records 21 routes and has `observed_at: 2026-11-11`. The six-route difference is accounted for by six live integration-configuration quarantine routes added after that snapshot. Refresh the evidence and registry deliberately; do not edit live routes.

### 4.3 Route assignments

| Pattern | Assigned Worker |
|---|---|
| `thelingolegacy.com/*` | `thelingolegacyv-5` |
| `www.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `thelingolegacy.com/` | `lingo-flagship-root` |
| `atlas.thelingolegacy.com/*` | `lingo-ecosystem-atlas` |
| `launch.thelingolegacy.com/*` | `lingo-static-backup-proxy` |
| `theriseofzavione.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `thats-my-lingo.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `sparkling-rain.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `therealzavione.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `lingo.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `cyber.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `solar.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `drip.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `site.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `luxe.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `web.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `hub.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `v4.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `v3.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `ai.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `blog.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `thelingolegacy.com/integration-configurations` | `lingo-integration-config-404` |
| `thelingolegacy.com/integration-configurations/` | `lingo-integration-config-404` |
| `thelingolegacy.com/integration-configurations/*` | `lingo-integration-config-404` |
| `www.thelingolegacy.com/integration-configurations` | `lingo-integration-config-404` |
| `www.thelingolegacy.com/integration-configurations/` | `lingo-integration-config-404` |
| `www.thelingolegacy.com/integration-configurations/*` | `lingo-integration-config-404` |

The apex exact-root route and apex wildcard route are distinct live assignments. Preserve both in the inventory until the Program Owner approves a single canonical homepage/delegation design. Runtime response-marker attribution remains a separate verification item.

### 4.4 Worker versions and deployment distinction

**`thelingolegacyv-5`**
- Live route assignment includes apex wildcard, www wildcard, and product/utility subdomains.
- Latest observed uploaded version: **363**, version ID `ddbff6a2-769e-43d9-978f-9a89b8d4cc35`, uploaded 2026-11-19 20:17:50 UTC.
- Version 363 carries alias `recovery-ci-evidence-gate-2026-11-19` and `has_preview: true`.
- The deployment inventory still reports version ID `2d161fa5-598f-4998-ada8-7ac4c72c3461` (version **137**) at **100%** in the latest listed deployment, created 2026-10-25 16:21:58 UTC.
- Therefore version 363 is an uploaded preview candidate, not evidence of production promotion.

**`lingo-flagship-root`**
- Exact-root route `thelingolegacy.com/` is assigned to this Worker.
- Version **3** is in its listed deployment at 100%; deployment record created 2026-10-25 16:38:23 UTC.
- The existing source inventory describes it as a standalone GET/HEAD homepage and says non-root paths return 404. Preserve the exact-root/wildcard split until the intended homepage behavior is approved and browser-attributed.

**`lingo-unified-control-tower-preview`**
- Separate preview Worker; no production route assignment was returned in the 27-route inventory.
- Latest listed version is 2, uploaded 2026-11-16.
- Keep it a preview/read-only surface.

### 4.5 DNS observations

- Apex `thelingolegacy.com`: proxied A record to `192.0.2.0`.
- `www.thelingolegacy.com`: proxied CNAME to `thelingolegacy.com`.
- Google Workspace MX records and SPF TXT record are present.
- The apex A target is in the TEST-NET-1 documentation range. Confirm whether this is an intentional proxied placeholder/origin arrangement with the account holder; no DNS change was made.

## 5. Program-pack arithmetic and status reconciliation

The pasted v1.1 material preserves three different counting concepts:

1. **39-task legacy baseline:** C01–C12 (12), L01–L10 (10), P01–P13 (13), and PR-001–PR-004 (4) = 39 identifiers.
2. **51-row operational decomposition:** C01–C12 (12), L01–L10 (10), P01–P13 (13), plus 16 Wave 4–10 decompositions = 51 rows.
3. **Separately preserved records:** PR-001–PR-004 are legacy mapping rows outside the 51-row operational decomposition; ENG-01 is also separate from P01–P13.

The pasted register consequently displays 56 identifiers if all 51 operational rows, four PR mapping rows, and ENG-01 are counted together. Keep the 39-task baseline, 51-row decomposition, four PR mapping records, and ENG-01 separate in the crosswalk and register. Verify the actual CSV row counts before publishing a corrected count claim.

### C08 status conflict

The supplied register labels C08 `AUTHORIZED` and its completion record `Hold Active - Read-Only Verified`, while its next action still requires conducting the read-only production-isolation verification. Do not mark C08 accepted until the underlying evidence artifact is found, reviewed, and linked. If the evidence is absent, change the status to pending/unverified in the next reviewed register revision.

## 6. Existing remediation candidates — do not duplicate

- **PR #614** is the current draft candidate for Firebase Hosting quarantine. It empties the Firebase default project mapping on its branch, introduces an explicit generated-output builder and publication-boundary tests, and has a recorded successful Cloudflare Pages preview on its exact inspected head. It remains draft/unmerged; staging Firebase identity is still blocked. Continue review on this candidate rather than creating a competing Firebase repair.
- **PR #613** substantially overlaps #614 (previous review records 38 overlapping paths out of 43). Preserve the unique historical documentation deliberately; do not blindly merge both.
- **PR #602** provides the 14-realm registry/control framework. Its existing review records a diverged stacked dependency, stale 21-route snapshot, and missing hosted validator evidence. Keep it draft and reconcile its dependency/route inventory.
- **PR #574** provides public-surface security and restricted-path controls; it remains draft/unmerged and requires full publication-boundary and route-security execution evidence.
- **PR #611** provides fail-closed dispatch-contract primitives; it is not a live scheduler or authorization grant. Keep dispatch non-operational until independently reviewed and tested.

## 7. Next executable actions

1. C09: refresh `infrastructure/registry/workers.json` in a reviewed branch using the 27-route snapshot, include all six quarantine routes, exact route IDs, Worker assignments, version/deployment distinctions, and capture timestamp.
2. C09/P02: record the exact-root route as out-of-band relative to `wrangler.jsonc`; present the homepage/delegation options for owner decision. No live route mutation.
3. C01/C06: continue hosted Actions admission diagnosis using existing runs; require nonzero runner ID/name, instantiated job, completed steps, logs, artifact download, checksum, and commit correlation. Do not activate G02.
4. C02/C03/C04/C05: preserve explicit authorization and read-only boundaries; do not rotate credentials, inspect a host, alter GitHub policies, or open provider cases without the required authority and access.
5. Firebase: finish review of PR #614 and reconcile #613; keep Firebase production publication blocked.
6. L03/L04: obtain local recursive library inventory and actual file bytes before counts or hashes are certified.
7. Governance: correct the 39/51/56 accounting and C08 evidence contradiction in the next reviewed register revision.

## 8. Explicit non-authorization

This evidence document does not authorize:
- production deployment or promotion;
- DNS, Worker route, Worker version, or traffic changes;
- G02 runner activation or runner credential changes;
- GitHub organization/repository policy changes;
- Firebase production deployment or migration;
- payment, checkout, cashout, sweepstakes, real-value rewards, or paid-ad activation;
- destructive cleanup, deduplication, or storage reclamation;
- lifting PROTECTED HOLD.

**Final disposition:** PROTECTED HOLD remains active. G02 remains FAIL / UNVERIFIED. G03–G11 remain BLOCKED. This is a read-only reconciliation record and a candidate input to C09/C01/C06, not a certificate or release authorization.
