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
| Worker scripts | 10 |
| DNS records | 34 |

The repository file `infrastructure/registry/workers.json` records 21 routes and has `observed_at: 2026-11-11`. The six-route difference is accounted for by six live integration-configuration quarantine routes added after that snapshot. Refresh the evidence and registry deliberately; do not edit live routes.

### 4.3 Worker script inventory

The ten live script names returned by the Cloudflare account API:

| Worker script | Route assignment observed |
|---|---|
| `lingo-ecosystem-atlas` | `atlas.thelingolegacy.com/*` |
| `lingo-flagship-root` | `thelingolegacy.com/` |
| `lingo-flagship-site-preview` | No route in the 27-route inventory |
| `lingo-integration-config-404` | Six integration-configuration quarantine routes |
| `lingo-resilience-gateway` | No route in the 27-route inventory |
| `lingo-static-backup-proxy` | `launch.thelingolegacy.com/*` |
| `lingo-studio-control-center-staging` | No route in the 27-route inventory |
| `lingo-unified-control-tower-preview` | No route in the 27-route inventory |
| `thelingolegacy-web` | No route in the 27-route inventory |
| `thelingolegacyv-5` | Apex/www wildcard and the product/utility subdomain routes |

“No route” means no matching assignment appeared in the returned zone route list; it does not prove the script is unused or safe to delete. Preserve these scripts pending ownership and deployment review.

### 4.4 Route assignments

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

### 4.5 Worker versions and deployment distinction

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

### 4.6 DNS observations

- Apex `thelingolegacy.com`: proxied A record to `192.0.2.0`.
- `www.thelingolegacy.com`: proxied CNAME to `thelingolegacy.com`.
- Google Workspace MX records and SPF TXT record are present.
- The apex A target is in the TEST-NET-1 documentation range. Confirm whether this is an intentional proxied placeholder/origin arrangement with the account holder; no DNS change was made.

## 5. Library metadata observation and program-pack arithmetic

A recursive ChatGPT Library metadata listing of `/LINGOlegacy_MASTER/` was captured at 2026-11-19 21:58:22 UTC:

| Metadata field | Observed |
|---|---:|
| Files | 421 |
| Folders | 68 |
| Reported bytes | 388,754,453 |
| Pages traversed | 5 |
| Remaining cursor | None |
| Listing warnings | None |

This independently matches the reported **421 files in the master folder** count as a Library metadata observation. It does not establish the physical Drive folder count, local file bytes, source-file completeness, or SHA-256 digests. It must not be merged with the separate 674-file/114-folder/679,702,158-byte observation or the 788-entry observation. The discrepancy between 114 folders and 68 Library folder entries remains unresolved because the source scopes may differ.

The named files `LINGOlegacy_MASTER_39_to_51_Crosswalk_v1.1.csv` and `LINGOlegacy_MASTER_REMAINING_WORK_REGISTER_v1.1.csv` were not located in the current ChatGPT Library listing or the GitHub repository default-branch code search. This does not establish that they are absent from an external Drive location; that source remains unverified. Do not claim their physical row counts have been inspected.

## 5.1 Program-pack arithmetic and status reconciliation

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
- **PR #606** now contains the Option 2 server-engine candidate: variable active paylines, integer allocation, explicit remainder rejection, and aggregate feature multiplier. Four hosted workflow attempts failed before job creation; local scratch suite reported 14/14, but hosted acceptance remains absent. Keep draft/unmerged.
- **PR #616** adds a separate front-end preview-parity candidate for the canonical `/thats-my-lingo/` page, with a browser-only 20-payline module, 5/10/20 active-line selection, and deterministic local tests (9/9). It remains draft/unmerged; no hosted CI or deployment has been verified.

## 7. That’s My Lingo — Library source-artifact reconciliation

The current Library contains three materially different product artifacts:

1. `Products/That’s My Lingo/Builds & Documentation/Game_Design_Document.docx` (36,682 bytes) is a one-page placeholder. Its content says the document should be populated and refined as implementation progresses. It is not an approved GDD or payout specification.
2. `Products/That’s My Lingo/Builds & Documentation/thats-my-lingo-production-architecture.md` (9,017 bytes) describes the current standalone preview as entertainment-only: Play Coins have no cash value and cannot be purchased, transferred, redeemed, or cashed out; outcomes and balances are browser-local and not secure. It correctly requires server-authoritative state before multi-device/networked play.
3. `Products/That’s My Lingo/Builds & Documentation/Thats_My_Lingo_Developer_Handoff.pdf` (35,634 bytes) contains legacy mechanics that conflict with the current preview-only contract: premium/real-value conversion language, 96% RTP, a 49% secondary-gamble limit, a $10,000 grand prize, $35 initial and $5 standard cashout thresholds, a wager/deposit velocity gate, and a forced-guaranteed-win event.

**Disposition:** preserve the legacy PDF unchanged as historical source material, but classify its real-value, cashout, prize, RTP, gamble, and guaranteed-win instructions as NON-AUTHORITATIVE / SUPERSEDED for current implementation. Do not implement, advertise, or activate those mechanics. No deletion or Library mutation was performed. Add the PDF to L09 only after its provenance is captured and local SHA-256 is computed. The current Option 2 contract and play-money-only boundary govern the active prototype; the empty GDD must be completed and approved before paytable, weights, RTP, volatility, bonus, or feature rules are certified.

## 8. Active That’s My Lingo repository frontend reconciliation

Read-only inspection of three current `main` HTML files found distinct runtime maturity and math contracts:

**`thats-my-lingo/index.html`** — blob `42d407b5fb79cd81858ca3bd71db9fe890e684dc`
- Clearly labeled free-play preview; no account, purchase, wagering, or cash-out activation.
- Uses browser `localStorage` key `tml-engine-demo` and `Math.random()`; no `fetch()` or server API integration is present.
- Although configured as 5 reels × 3 rows, its evaluator calls `rowWin` once for each of the three horizontal rows. It does not evaluate the approved 20 candidate paylines.
- Each row payout is calculated as `game.bet * result.multiplier`, while the spin debits `game.bet` once. It does not divide the total spin stake across active paylines. Therefore this frontend does not implement the approved Option 2 contract and its current local payout behavior must not be accepted as Option 2 math.

**`casino/index.html`** — blob `fdc6c73d4b13549129bc5b766efdfec58e105b9f`
- Uses browser `localStorage` and `Math.random()`; no server API integration is present.
- The page includes a no-real-money disclaimer, but the display formatter prefixes values with `# LINGOlegacy_MASTER v1.1 — Live Reconciliation Evidence

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
| Worker scripts | 10 |
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

## 5. Library metadata observation and program-pack arithmetic

A recursive ChatGPT Library metadata listing of `/LINGOlegacy_MASTER/` was captured at 2026-11-19 21:58:22 UTC:

| Metadata field | Observed |
|---|---:|
| Files | 421 |
| Folders | 68 |
| Reported bytes | 388,754,453 |
| Pages traversed | 5 |
| Remaining cursor | None |
| Listing warnings | None |

This independently matches the reported **421 files in the master folder** count as a Library metadata observation. It does not establish the physical Drive folder count, local file bytes, source-file completeness, or SHA-256 digests. It must not be merged with the separate 674-file/114-folder/679,702,158-byte observation or the 788-entry observation. The discrepancy between 114 folders and 68 Library folder entries remains unresolved because the source scopes may differ.

The named files `LINGOlegacy_MASTER_39_to_51_Crosswalk_v1.1.csv` and `LINGOlegacy_MASTER_REMAINING_WORK_REGISTER_v1.1.csv` were not located in the current ChatGPT Library listing or the GitHub repository default-branch code search. This does not establish that they are absent from an external Drive location; that source remains unverified. Do not claim their physical row counts have been inspected.

## 5.1 Program-pack arithmetic and status reconciliation

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

## 7. That’s My Lingo — Library source-artifact reconciliation

The current Library contains three materially different product artifacts:

1. `Products/That’s My Lingo/Builds & Documentation/Game_Design_Document.docx` (36,682 bytes) is a one-page placeholder. Its content says the document should be populated and refined as implementation progresses. It is not an approved GDD or payout specification.
2. `Products/That’s My Lingo/Builds & Documentation/thats-my-lingo-production-architecture.md` (9,017 bytes) describes the current standalone preview as entertainment-only: Play Coins have no cash value and cannot be purchased, transferred, redeemed, or cashed out; outcomes and balances are browser-local and not secure. It correctly requires server-authoritative state before multi-device/networked play.
3. `Products/That’s My Lingo/Builds & Documentation/Thats_My_Lingo_Developer_Handoff.pdf` (35,634 bytes) contains legacy mechanics that conflict with the current preview-only contract: premium/real-value conversion language, 96% RTP, a 49% secondary-gamble limit, a $10,000 grand prize, $35 initial and $5 standard cashout thresholds, a wager/deposit velocity gate, and a forced-guaranteed-win event.

**Disposition:** preserve the legacy PDF unchanged as historical source material, but classify its real-value, cashout, prize, RTP, gamble, and guaranteed-win instructions as NON-AUTHORITATIVE / SUPERSEDED for current implementation. Do not implement, advertise, or activate those mechanics. No deletion or Library mutation was performed. Add the PDF to L09 only after its provenance is captured and local SHA-256 is computed. The current Option 2 contract and play-money-only boundary govern the active prototype; the empty GDD must be completed and approved before paytable, weights, RTP, volatility, bonus, or feature rules are certified.

, the jackpot UI shows dollar-denominated amounts, and the bet validation says “virtual bet is $10”. This is a misleading currency presentation for a play-money-only preview.
- Its outcome evaluator uses a single five-symbol result and count-based multiplier; it is not the approved 5×3 / 20-payline Option 2 engine.

**`live-casino-studio/index.html`** — blob `3c2d9c4495c9c9aa3c138596ebc3d06c5aef8e7b`
- Static architecture/launch shell only; no localStorage, random outcome generator, or fetch integration was found in the inspected source.
- It explicitly states that real-money gambling, deposits, withdrawals, sweepstakes redemption, live wagering, and live dealer streams are not enabled.

**Disposition:** `/thats-my-lingo/` remains the clearest free-play preview surface, but it is not yet math-aligned or server-authoritative. Treat `/casino/` as a legacy candidate until its dollar-denominated labels and obsolete one-row math are corrected or it is clearly archived. Treat `/live-casino-studio/` as a static blueprint, not a live studio. PR #606's isolated server engine is not integrated into these pages. No live route, HTML, or deployment was changed by this audit.

## 9. Next executable actions

1. C09: refresh `infrastructure/registry/workers.json` in a reviewed branch using the 27-route snapshot, include all six quarantine routes, exact route IDs, Worker assignments, version/deployment distinctions, and capture timestamp.
2. C09/P02: record the exact-root route as out-of-band relative to `wrangler.jsonc`; present the homepage/delegation options for owner decision. No live route mutation.
3. C01/C06: continue hosted Actions admission diagnosis using existing runs; require nonzero runner ID/name, instantiated job, completed steps, logs, artifact download, checksum, and commit correlation. Do not activate G02.
4. C02/C03/C04/C05: preserve explicit authorization and read-only boundaries; do not rotate credentials, inspect a host, alter GitHub policies, or open provider cases without the required authority and access.
5. Firebase: finish review of PR #614 and reconcile #613; keep Firebase production publication blocked.
6. L03/L04: obtain local recursive library inventory and actual file bytes before counts or hashes are certified.
7. Governance: correct the 39/51/56 accounting and C08 evidence contradiction in the next reviewed register revision.

## 10. Explicit non-authorization

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


## 11. 2026-11-20 route-registry refresh addendum

A fresh read-only GET of the Cloudflare zone Workers Routes API was performed on 2026-11-20. It returned **27 route objects**, each with a route ID, pattern, and assigned script. The reviewed branch now refreshes `infrastructure/registry/workers.json` to match all 27 live route records and all nine script names.

Per-script route counts in the refreshed registry:

| Worker script | Live route count |
|---|---:|
| `thelingolegacyv-5` | 18 |
| `lingo-flagship-root` | 1 |
| `lingo-ecosystem-atlas` | 1 |
| `lingo-static-backup-proxy` | 1 |
| `lingo-integration-config-404` | 6 |
| `lingo-flagship-site-preview` | 0 |
| `lingo-resilience-gateway` | 0 |
| `lingo-studio-control-center-staging` | 0 |
| `lingo-unified-control-tower-preview` | 0 |
| **Total** | **27** |

The six integration-configuration quarantine routes are now individually recorded with their live route IDs and assigned to `lingo-integration-config-404`. The exact-root route `thelingolegacy.com/` remains assigned to `lingo-flagship-root`; the apex wildcard `thelingolegacy.com/*` remains assigned to `thelingolegacyv-5`. These are separate assignments and have not been normalized or changed.

The registry refresh also updates the EZCA validator's expected Worker-script count from 7 to 9 and route count from 21 to 27. The existing `worker-bindings.json` remains explicitly scoped to seven scripts checked in the earlier binding-name inventory; it is not silently relabeled as a nine-script binding audit.

**Validation boundary:** the JSON was parsed and structurally updated from the live API response in this workflow. Hosted CI has not yet executed the updated validator; GitHub Actions startup failures remain an external gate. No Cloudflare route, Worker, deployment, DNS record, binding, secret, or production setting was modified. No route ownership decision beyond recording the observed live assignments is implied.


---

# 8. Consolidated ecosystem restoration register — v1.2 working revision

**Register date:** 2026-11-20  
**Register posture:** READ-ONLY EVIDENCE CONSOLIDATION; DRAFT / NOT ACCEPTED  
**Source baseline:** default branch \`main\` at \`1a60e2314cb3f9b5e3efe648ade83121080cb7b2\`; reconciliation candidate branch at the PR #615 head immediately before this revision.  
**Authority:** Master work order #612; master recovery #480; cross-stack blockers #575; CORE V2 program #597; certification scope #601.  
**Release disposition:** PROTECTED HOLD; G02 FAIL / UNVERIFIED; G03–G11 BLOCKED.

This section consolidates system-level restoration scope and evidence into the existing #615 reconciliation candidate. It does not create a new tracker, replace the 39-task / 51-row crosswalk, or certify any system. Existing child issues and PRs remain the execution records. Unknown or inaccessible states are explicitly left UNKNOWN / UNVERIFIED.

## 8.1 System restoration register

| System / scope | Existing assets and last-known-good evidence | Verified working state | Missing, damaged, conflicting or unknown | Recovery / reconciliation action | Acceptance tests and evidence required | Backup / rollback protection | Status |
|---|---|---|---|---|---|---|---|
| **GitHub source, governance and CI** | Canonical repository \`thelingolegacy-blip/TheLingoLegacy\`; default branch \`main\`; current inspected main SHA \`1a60e2314cb3f9b5e3efe648ade83121080cb7b2\`. Existing master work order #612, master recovery #480, blocker register #575, CORE V2 #597 and child scopes #598–#601. Draft recovery candidates #613–#616; earlier architecture/engine candidates #594/#596 and G02 quarantine #589. | Repository metadata and source files are readable; current draft PRs and issue records are retrievable. PR #615's review branch contains a read-only Cloudflare/library reconciliation candidate. | Main commit is dated 2026-11-14 and is behind current recovery work. Recent Actions runs continue to fail before usable job evidence; root cause, effective Actions policy, account quota/concurrency and branch protection are not established by connector access. Draft source is not executed proof. | Preserve main and LKG. Continue hosted \`ubuntu-latest\` diagnosis under #612/#575; inspect owner-only Actions and protection settings; reconcile PR ancestry and overlapping paths before any merge; retain G02 quarantine. | Repeated hosted jobs instantiated and completed; positive runner/job identity, named steps, logs, correlated artifacts and checksums; exact commit correlation; effective branch/ruleset settings; independent review; reproducible test matrix. | Keep all candidate PRs draft/unmerged; retain main and LKG references; preserve workflow run IDs/logs/artifacts and failed attempts; no force-push or settings relaxation. | **P0 BLOCKED / PARTIAL INVENTORY** |
| **Cloudflare edge, Workers, routes and DNS** | Live read-only observation: zone \`thelingolegacy.com\`; 27 routes, 9 scripts, 34 DNS records. PR #615 updates \`infrastructure/registry/workers.json\` and the EZCA validator on its review branch. Captured wildcard Worker \`thelingolegacyv-5\` version 137 is serving 100%; version 363 is an uploaded preview candidate. Exact-root \`thelingolegacy.com/\` routes to \`lingo-flagship-root\`. | API inventory was retrieved and parsed. Route/script counts and assignments are recorded in the candidate registry. Apex/www wildcard and exact-root route split is observable. | Source/live route registry previously differed 21 vs 27. Worker binding audit covers only seven scripts, not all nine. Version 363 upload is not deployment; version 137 traffic remains the observed 100% deployment. DNS apex A uses TEST-NET-1 address and requires owner interpretation. Runtime response attribution, origin health and complete browser route QA remain unverified. | Preserve all nine scripts, 27 routes and current traffic. Complete the remaining two-script binding inventory; compare route IDs/patterns/script assignments with source; attribute responses by route; reconcile apex/www/exact-root ownership; inspect origin and rollback metadata without mutation. | Read-only repeat inventory; registry validator; all 27 route-to-Worker checks; response-marker and redirect tests for apex/www/product routes; TLS/security headers; health/readiness and origin probes; exact deployment/version provenance; rollback rehearsal in isolated staging. | Keep version 137 and current route assignments untouched as LKG; preserve version 363 as preview evidence only; no route, DNS, deployment or traffic changes. | **P0 PARTIAL / ROUTING ACCEPTANCE BLOCKED** |
| **Firebase project, Hosting, Auth, Firestore and Storage** | Main contains \`firebase.json\` with \`hosting.public: "."\` and \`.firebaserc\` selecting \`lingo-legacy-production\`. Existing Flutter/Firebase code and rules remain in source. PR #614 is the current draft candidate for a generated, quarantined Hosting output boundary; PR #613 contains overlapping Flutter/API-21 and recovery work. | PR #614 source implements a deterministic generated-output boundary, empty/quarantined allowlist, staging-only explicit project input, placeholder client options and startup guard. A specific Cloudflare Pages preview on commit \`fe838d38de2a55578b2d29c6cd7b395a8a685e43\` recorded root/Oasis Flutter analysis/tests and web build success. | No approved staging Firebase project ID or credentials; Firebase Auth/data integration remains disconnected. Main's root-publication setting is unsafe until a reviewed candidate is accepted. Preview evidence does not establish Firebase Hosting publication or live Firebase connectivity. Later Firebase contract/publication test preview was pending in PR #614. | Continue PR #614 as the single Hosting-boundary candidate; preserve PR #613's unique history but do not merge overlapping paths blindly. Verify staging project/site identity separately; complete allowlist and negative tests; keep production alias and publication untouched. | Manifest allowlist tests; reject traversal, symlinks, hidden/config/secret/control-plane files; inspect exact generated output; validate 404, headers, noindex and dependencies; Firebase emulator/contract tests; staging-only Auth/Firestore/Storage integration; retrievable CI logs/artifacts; dry-run/preview and rollback evidence. | No Firebase deploy, production project selection, Auth activation, rules mutation or credential changes. Keep Hosting allowlist empty and startup guard closed until staging identity and acceptance are verified. | **P0 BLOCKED / SOURCE REPAIR CANDIDATE EXISTS** |
| **Flutter web, Android and iOS** | Flutter flagship and Doughboys Oasis source; Android Kotlin scaffold and package identity on PR #613/#614; Android \`minSdk 21\`; pinned Flutter 3.50.0 and compatible FlutterFire package versions. | PR #613 records Flutter analysis clean, 4/4 flagship widget tests, Oasis analysis/catalog test, Flutter web release build and one successful preview deployment for commit \`c7a370e82133f10112e1b8e533d4da05abad16de\`. PR #614 records Android readiness 6/6, root analyze, 2 widget tests, Oasis analyze/test and web build for commit \`fe838d38de2a55578b2d29c6cd7b395a8a685e43\`. | No APK/AAB build or physical Android device test. Android Gradle wrapper behavior has not been exercised in a completed Android build. iOS tree remains incomplete/stubbed; no iOS build/device test. Hosted GitHub Actions startup failure prevents treating unexecuted checks as hosted acceptance. Firebase remains disconnected. | Preserve API 21 and pinned SDK/dependencies; reconcile #613/#614 overlap and lockfiles; complete reproducible Android build and iOS project/configuration; keep release signing unconfigured until approved secure key management exists. | Exact-commit Flutter analyze/tests; web build; Android debug APK build and install/launch/device test; iOS build/simulator/device test; lockfile enforcement; accessibility/responsive/browser tests; Firebase staging contract tests; hosted logs and artifacts. | Keep release signing disabled and no release keys in source; preserve existing working preview builds and lockfiles; no mobile store publication or production Firebase deployment. | **P1 PARTIAL / ANDROID + IOS UNVERIFIED** |
| **LINGO ID / identity / sessions** | Existing \`lingo-id\` route/source and Firebase Auth scaffolding; CORE V2 architecture and implementation candidates #594/#596; #588 public-copy correction candidate. | Source and architecture proposals exist. #588 corrects the preview language to state identity is not connected/verified on that surface and gates login/session/wallet/registered play. | No verified identity provider, staging issuer, client registration, account continuity, session lifecycle, role authorization or production Auth integration. CORE V2 remains non-production draft; no complete vertical-slice evidence. | Reconcile current Firebase identity boundary with provider-neutral CORE V2 identity contract; inventory existing user/profile records without exposing PII; define stable subject mapping and safe migration/recovery plan before any cutover. | Staging-only sign-up/sign-in/reset/sign-out; issuer/audience/signature/JWKS/key-rotation validation; session refresh/expiry/revocation; role/tenant isolation negative tests; audit trail; account continuity and rollback rehearsal using synthetic users. | Do not migrate or overwrite user identities; no production provider cutover; preserve existing account/profile data and current disabled state. | **P1 NOT CONNECTED / BLOCKED** |
| **Universal Legacy Wallet / Lingo Coins / ledger** | LINGOloyalty preview and That’s My Lingo browser-local Demo Coin implementation; wallet/ledger architecture in CORE V2 and product documentation. | Preview-only virtual balances exist in browser-local demo contexts. TML Option 2 math candidates are in PR #606 (engine) and #616 (front-end parity); local test counts are recorded in those PR descriptions. | No shared server-authoritative wallet, durable ledger, authenticated ownership, idempotent posting, cross-device continuity, reconciliation, audit or restore proof. Browser-local balances are not a shared wallet. No cash value, purchase, transfer, cashout or redemption is active. | Inventory every balance/ledger implementation; designate a single future ledger authority; reconcile wallet and game event contracts; implement synthetic non-production ledger vertical slice only after architecture review; never convert demo balances into value. | Double-entry/invariant checks where specified; integer arithmetic; idempotency/replay; concurrency and duplicate request tests; balance-to-entry reconciliation; account isolation; append-only audit; backup/restore and rollback rehearsal. | Keep all real-value paths disabled; preserve local demo data only as demo state; no payment activation, transfers, redemption, cashout or destructive migration. | **P1 ARCHITECTURE / NOT CONNECTED** |
| **LINGOslots — That’s My Lingo, Spades, Uhno, Cashman, Lions** | Existing game routes/assets and preview implementations. TML engine candidate PR #606; front-end Option 2 parity PR #616. | PR #616 records 9/9 isolated local Node tests for 5×3/20-payline preview, variable 5/10/20 active lines, integer stake allocation, remainder rejection and aggregate feature multiplier. PR #606 records a server-engine candidate and local test evidence in its own description. | PRs remain draft/unmerged. Associated hosted runs for #616 ended \`startup_failure\` with zero jobs/artifacts; no hosted tests. TML still uses browser-local Demo Coins and \`Math.random()\`, not server-authoritative state or secure RNG. GDD is a placeholder and legacy developer handoff conflicts with preview-only terms. Other games lack a consolidated per-game acceptance record in this evidence set. | Reconcile #606/#616 against one approved GDD and paytable; preserve Option 2 total-spin stake semantics; separate client presentation from server authority; inventory each slot/card game and identify unique rules, assets, rights and state. Do not duplicate engines. | Deterministic paytable/geometry/stake tests; server RNG and server-authoritative session tests; idempotent spin lifecycle; wallet integration tests; replay/abuse/failure injection; browser/device QA; individual game rules, content and accessibility acceptance; hosted evidence. | Keep preview-only and non-redeemable; no merge, production promotion, wagering, sweepstakes activation, prize redemption, payments or cashout. Preserve legacy docs as historical evidence until conflicts are resolved. | **P1 PARTIAL / PREVIEW ONLY** |
| **LINGOarcade — Doughboys Oasis and other arcade experiences** | Oasis Flutter application, catalog, game routes and source assets; #613/#614 include Oasis Flutter analysis and catalog-test evidence. | PR descriptions record Oasis analysis clean and a catalog test pass in isolated preview/build contexts. | No complete arcade portfolio inventory or end-to-end game-session/progression/multiplayer acceptance is established here. Money Mile and character/asset licensing review remain product-level gates; hosted CI is unavailable. | Inventory each arcade game, route, save/progression model, economy, asset provenance and rights. Preserve existing game code; recover broken routes/assets before replacing. Keep demo economy local/non-cash until ledger authority exists. | Per-game launch/exit/resume; progression/save consistency; input/accessibility; responsive/device QA; catalog/route integrity; deterministic rules tests; asset provenance and licensed-character review; performance and failure recovery. | Preserve existing game builds/assets and source history; no real-value economy, cashout or unreviewed licensed assets. | **P1 PARTIAL / END-TO-END UNVERIFIED** |
| **LINGOlibrary — books, stories and educational content** | Existing story routes, source content, Kotton’s Code and other named literary projects; Library metadata observation below. | GitHub tree and Library metadata confirm some source/content assets exist. This establishes asset presence only, not editorial or publication completion. | Full asset-level inventory, file integrity, canonical manuscript/version reconciliation, export checksums and publication QA are not present in this register. Kotton’s Code privacy/family/minor-content review remains open; no publication acceptance is claimed. | Inventory manuscripts, illustrations, audio/video, source prompts and exported deliverables separately; reconcile version history and duplicates without deletion; complete privacy, rights and editorial reviews before publication. | Manuscript completeness; page/layout/render tests; link/navigation QA; alt text/accessibility; source-to-export checksum and format validation; privacy/consent and rights review; device/browser reading QA. | Preserve original manuscripts, source art and exports; no overwrite or deletion until duplicate and LKG mapping is verified. | **P1 INVENTORY INCOMPLETE / PUBLICATION BLOCKED** |
| **LINGOmedia — Rise of Zavione and media experiences** | Existing media routes, project documentation and creative source artifacts in the ecosystem. | Repository contains media-related source and route surfaces; source presence is not proof of finished media deliverables. | No complete source-to-render inventory, final export metadata, checksums, rights/clearance evidence, or playback/device QA has been established here. | Inventory scripts, lyrics/text, storyboards, project files, stems, generated assets, rendered masters and published versions as separate artifact classes; preserve all originals and reconcile version chains. | Verify exact output files, codecs/formats, duration/dimensions, audio/video playback, captions, metadata, checksum, source/run identity, rights and release approvals. | Preserve original project files and source assets; never replace a master export without verified backup and rollback copy. | **P1 INVENTORY / DELIVERABLE VERIFICATION PENDING** |
| **LINGOworld — AI, travel, campus, support and services** | 14-realm registry and dispatch framework proposed in PR #602; 11 trigger definitions and schemas; askLINGO and other service route/source surfaces. | PR #602 records static parsing/uniqueness checks and route-target inspection on its branch. The proposal preserves realm/service ownership and fail-closed gates. | PR #602 remains draft with a diverged stacked dependency and stale 21-route snapshot; hosted validator evidence is missing. askLINGO provider credentials/model calls/auth/telemetry are unverified. Other world services are not individually acceptance-certified. | Reconcile #602 with the 27-route live Cloudflare registry and current canonical product tree; preserve the existing #548 base relationship until ancestry is understood; inventory each realm's owner, API, data, auth, privacy, cost and failure modes. | Registry/schema validation; all realm route and navigation tests; dispatch authorization, replay/idempotency and fail-closed negative tests; provider sandbox integration; privacy/security review; accessibility and service-specific end-to-end tests. | Keep dispatch non-operational until reviewed; no provider provisioning or paid resource creation without cost approval; preserve preview-only services and source. | **P1 PARTIAL / NOT CERTIFIED** |
| **LINGOlane — Apparel, promotions and Loyalty Lane Cycle** | Apparel/store source, Shopify/Stripe-related integration plans, product catalog artifacts and Loyalty Lane Cycle game/community surfaces. | Some product and preview source exists; #480 records LINGOloyalty preview readiness only, not wallet/ledger/earning/redemption or provider acceptance. | Product inventory, supplier stock, checkout, order, webhook, refunds, tax/shipping, fulfillment and Cycle gameplay acceptance are not established in this register. No live payment activation is authorized. | Reconcile Shopify catalog and source assets; inventory SKUs, supplier availability, product imagery/rights, order flow and promotion surfaces; keep commerce sandbox-only and separate from virtual game credits. | Catalog accuracy; product detail/cart; sandbox checkout/webhooks/refunds; order reconciliation; fulfillment/admin; privacy/accessibility; Cycle game routes and progression tests; legal/brand/asset approval. | No live charges or checkout; preserve current catalog and source exports; no inventory or merchant-account mutation; maintain rollback to existing preview. | **P1 PARTIAL / COMMERCE NOT ACCEPTED** |
| **Cross-stack security, data, observability, backups and disaster recovery** | Existing security/recovery scripts and schemas under \`ops/recovery/\`, G02 acceptance/runbooks, #601 certification scope, repository and Cloudflare inventories, Library metadata observations. | Existing schemas, validators and runbooks are present in source; they provide a starting framework, not proof of completed security or recovery drills. | No independent security/SRE certification, complete secrets/history scan, SBOM/provenance acceptance, load/SLO evidence, full backup catalog, restore test, disaster-recovery rehearsal or local SHA-256 verification is established by this register. Library observations conflict across scopes: 421 files/68 folders/388,754,453 reported bytes vs prior 674/114/679,702,158 and 788-entry observations. Do not combine these counts. | Build one cross-system asset/backup manifest; resolve Library source scope; calculate hashes from actual materialized bytes; map LKG and recovery owner per service; run sanitized restore rehearsals; complete threat, dependency and privacy review. | Secret/SAST/SCA/IaC scans; SBOM/provenance; backup completeness and checksum validation; restore and point-in-time recovery; RPO/RTO drills; data reconciliation; observability/alert tests; load/failure injection; independent reviewer sign-off. | No deletion or cleanup; preserve every candidate backup and LKG; no production data migration; record exact backup locations, timestamps, hashes and restore evidence before changing retention. | **P0/P1 BLOCKED / BACKUP INTEGRITY UNVERIFIED** |

## 8.2 Evidence confidence and status rules

Use these meanings consistently:

- **VERIFIED** — direct, current, attributable evidence exists for the exact resource, commit/version and test claimed.
- **PARTIAL** — a bounded portion is directly verified; the remainder is explicitly listed.
- **FAIL** — an acceptance predicate was tested and failed.
- **BLOCKED** — a required dependency, permission or evidence source prevents the test.
- **UNKNOWN** — no reliable observation is available; absence is not proof of failure or success.
- **NOT STARTED** — no implementation or test has been evidenced.
- **NOT CERTIFIED** — system may contain working components but the complete acceptance chain has not passed.

A source file, PR description, local test, static parse, preview deployment, HTTP 200, provider status label or Library metadata count must not be promoted into a stronger claim than it supports. Every new finding must identify observation time, resource/commit, source reference, expected/observed state, result, evidence artifact/hash if available, owner/next action, and whether it was read-only or a mutation.

## 8.3 Existing program accounting — preserve distinctions

The register does not renumber or collapse the historical work:

- 39-task baseline: C01–C12, L01–L10, P01–P13 and PR-001–PR-004.
- 51-row operational decomposition: C01–C12, L01–L10, P01–P13 and 16 Wave 4–10 decompositions.
- PR-001–PR-004 remain separate legacy mapping records.
- ENG-01 remains separate from P01–P13.
- The actual crosswalk/register source files and physical row counts remain unverified until located and inspected.
- C08 remains pending/unverified until the underlying production-isolation evidence is found and linked; its conflicting AUTHORIZED / hold-active labels are not acceptance.

## 8.4 Consolidated restoration sequence

1. **P0 — Preserve and establish truth:** capture current main/LKG refs; finish repository/branch/PR/issue and backup inventory; resolve permissions and evidence-source gaps; retain the current Cloudflare and Firebase production states.
2. **P0 — Restore executable evidence:** resolve GitHub-hosted Actions startup failure without G02; obtain repeated jobs, steps, logs and artifacts; complete owner-side policy checks.
3. **P0 — Close publication and routing hazards:** continue the existing Firebase allowlist candidate; complete Cloudflare route/script/binding/response reconciliation; do not publish or mutate production.
4. **P1 — Restore application foundations:** complete Flutter Android/iOS builds, Firebase staging identity, LINGO ID and CORE V2 non-production vertical slice.
5. **P1 — Restore product capability:** complete per-product route, journey, game, content, rights, economy and integration tests across slots, arcade, library, media, world and lane.
6. **P1 — Validate data and resilience:** ledger invariants, backup integrity, restore/DR, security, observability, SLO and cost evidence.
7. **Release certification:** independent review and product-specific acceptance; production promotion remains a separate explicit authorization.

## 8.5 Explicitly not authorized or not performed by this register

No merge, G02 runner activation, production deployment, DNS/Worker route or traffic change, Firebase publication or production project mutation, payment/checkout/cashout activation, real-value reward or wagering activation, secret rotation, data migration, paid resource provisioning, backup deletion, last-known-good replacement, or production release is authorized by this document.

**Current outcome:** consolidated system register drafted from the available evidence. It is not a restoration completion certificate. Unknowns remain open until independently inspected and tested.


---

# 9. Live parallel-workstream checkpoint — 2026-11-20

**Observation class:** READ-ONLY provider/source inspection.  
**Register status:** Draft working evidence; this checkpoint does not certify any product or authorize provider mutation.

## 9.1 GitHub hosted Actions — fresh failure correlation

The new PR #615 commit \`1b4f4b5b7be3f6991ee87d0e1cac3399986f0f78\` triggered four workflows at 2026-11-20 09:52 UTC:

| Workflow | Run ID | Conclusion | Jobs | Artifacts |
|---|---:|---|---:|---:|
| EZCA Registry Validation | 44714322084 | \`startup_failure\` | 0 | 0 |
| Lingo Legacy Static CI | 44714320186 | \`startup_failure\` | 0 | 0 |
| G02 Runner Image Build (no publish) | 44714318296 | \`startup_failure\` | 0 | 0 |
| Crimson Smoke UI — static validation | 44714316173 | \`startup_failure\` | 0 | 0 |

All four are correlated to the same PR #615 head SHA and base \`main\` SHA. No job, step, runner identity, test log or artifact was created. This is admission/startup failure, not a test failure. Do not dispatch further repeated probes until the owner-side GitHub Actions admission/quota/policy review is completed. G02 remains quarantined.

GitHub ruleset inventory exposes active ruleset **27403956 — “Lingo - protect main”**. The connector could not return repository Actions permissions or branch-protection details; these remain owner-side verification items. No settings were changed.

## 9.2 Cloudflare — current inventory supersedes earlier nine-script snapshot

Fresh Cloudflare API reads for zone \`thelingolegacy.com\` (zone ID \`91c3f6315fb3ca132b22744721103f88\`) returned:

- **27 live Worker routes**
- **10 Worker scripts**, not nine
- **34 DNS records**
- **5 Pages projects**

The earlier nine-script count in the v1.1 snapshot is superseded by this 2026-11-20 observation. The 10 script names are:

1. \`lingo-ecosystem-atlas\`
2. \`lingo-flagship-root\`
3. \`lingo-flagship-site-preview\`
4. \`lingo-integration-config-404\`
5. \`lingo-resilience-gateway\`
6. \`lingo-static-backup-proxy\`
7. \`lingo-studio-control-center-staging\`
8. \`lingo-unified-control-tower-preview\`
9. \`thelingolegacy-web\`
10. \`thelingolegacyv-5\`

All 10 Worker settings endpoints were successfully read. Nine scripts returned no bindings. \`thelingolegacyv-5\` returned exactly three bindings: \`ASSETS\` (assets), \`CANONICAL_DOMAIN\` (plain text), and \`PUBLIC_SITE_URL\` (plain text). This replaces the prior partial seven-script binding audit; no other binding types were returned by these settings reads.

The 27 route assignments reconcile as:
- 18 routes → \`thelingolegacyv-5\`
- 6 routes → \`lingo-integration-config-404\`
- 1 route → \`lingo-flagship-root\` (exact apex path \`thelingolegacy.com/\`)
- 1 route → \`lingo-ecosystem-atlas\`
- 1 route → \`lingo-static-backup-proxy\`

Five scripts currently have no route assignment in the returned inventory: \`lingo-flagship-site-preview\`, \`lingo-resilience-gateway\`, \`lingo-studio-control-center-staging\`, \`lingo-unified-control-tower-preview\`, and \`thelingolegacy-web\`. This is not proof they are unused; inspect their service bindings, triggers, Pages relationships and invocation history before disposition.

The apex DNS A record remains proxied and points to \`192.0.2.0\`, a documentation-only TEST-NET-1 address. This is a configuration finding requiring owner/provider interpretation, not authorization to edit DNS. Preserve the record pending explicit approval and origin/Worker routing validation.

Cloudflare Pages currently lists five projects. Production deployments are disabled on the two named preview projects, \`lingo-execution-center-preview\` and \`lingo-flutter-firebase-preview\`. The latest preview attempts at 09:51:55 UTC were skipped: execution-center by \`path_config\`; Flutter/Firebase by \`branch_config\`. A skipped deployment is not a build pass. The static-backup Pages project has a successful production deployment dated 2026-10-25; \`my-flutter-app\` has a successful production deployment dated 2026-08-30. These are inventory facts only; do not change them.

## 9.3 Firebase and Flutter — source and branch reconciliation

The current \`main\` source still has:
- Root \`firebase.json\` with \`hosting.public: "."\`.
- \`.firebaserc\` default alias \`lingo-legacy-production\`.
- \`lib/firebase_options.dart\` with placeholder API/app credentials but a production project ID and production-looking Auth/Database/Storage endpoints.
- Root \`pubspec.yaml\` with older Firebase package declarations than the API-21-compatible pins recorded in PR #613/#614.
- Android source on main is incomplete (only a small scaffold inventory was found); iOS contains \`.stub\` project/registrant files, not a complete native project.

PRs #613 and #614 remain separate drafts and overlap across Firebase config, Flutter configuration, Android scaffolding, workflows and tests. #614 adds the generated \`build/firebase-public\` quarantine/empty allowlist, removes the production default alias, uses staging-not-configured Firebase placeholders/startup guard, and adds Firebase publication-boundary tests. PR descriptions record successful preview Flutter analysis, widget/Oasis tests and web build on exact earlier commits, but no GitHub-hosted Actions jobs were created. The #614 preview deployment is not a Firebase Hosting production deploy and does not establish Firebase Auth/Firestore/Storage connectivity.

**Disposition:** preserve both draft histories; treat #614 as the more complete current Hosting-boundary candidate for review, but do not merge, deploy, choose a Firebase project, or mutate rules. Keep production Firebase configuration and publication blocked until staging project identity, credentials, rules, contract tests, exact generated output and hosted evidence are independently accepted.

The repository tree shows Oasis Firestore rules under \`studio-sites/games/oasis-platform/firebase-functions/firestore.rules\`; there is no root-level \`firestore.rules\` file on the inspected refs. Do not infer root Firestore rules are absent from the entire repository.

## 9.4 Seven parallel workstreams — current disposition

| Workstream | New evidence | Current disposition / next safe action |
|---|---|---|
| GitHub CI and governance | Four new \`startup_failure\` runs, each zero jobs/artifacts; active main ruleset 27403956; settings endpoints unavailable through current connector. | **BLOCKED.** Owner must inspect Actions policy/admission, hosted-runner quota/billing and effective branch/ruleset settings. No G02. |
| Cloudflare routing and Workers | 27 routes, 10 scripts, 34 DNS records, 10/10 script settings read; one apex TEST-NET-1 A record; 5 Pages projects and two skipped preview runs. | **PARTIAL / OWNER REVIEW.** Reconcile 10-script registry and route inventory, validate origin/response behavior, and inspect unused-route scripts without mutation. |
| Firebase publication isolation | Main still points Hosting public at repository root and default alias at production; PR #614 has empty allowlist/staging guard candidate. | **BLOCKED / SOURCE CANDIDATE.** Keep PR #614 draft, complete exact artifact/negative tests and staging-only contract proof. |
| Flutter Android/iOS/web | Main Android incomplete and iOS stubbed; PR #613/#614 contain Android API-21 scaffold and successful prior web preview test descriptions. | **PARTIAL.** Preserve candidate work; reconcile overlapping PRs; obtain Android debug build/device evidence and complete iOS project/simulator evidence. |
| Identity and wallet foundations | Main Firebase options contain placeholders plus production project identifiers; CORE V2 #594/#596 remain drafts; no verified staging identity or shared authoritative ledger. | **BLOCKED.** Define and test synthetic non-production identity/session and ledger vertical slices only after provider and data contracts are reviewed. |
| Portfolio product recovery | Source tree contains flagship, games, lane, library, media and world surfaces; product-wide runtime acceptance not established by this parallel inspection. | **INVENTORY PARTIAL.** Continue per-product route, journey, content, rights, economy and integration testing using existing child workstreams. |
| Security, backup and disaster recovery | Existing recovery scripts/schemas and ruleset exist; no verified full backup manifest, local SHA-256 set, restore drill, SBOM/SCA/SAST or RPO/RTO proof retrieved in this pass. | **NOT CERTIFIED.** Preserve all backups; inspect source and provider backup catalogs; schedule isolated restore/security tests after evidence environment is available. |

## 9.5 Explicit evidence limitations and controls

- GitHub connector access did not expose repository Actions permissions or branch protection details; owner-side review is required.
- No Firebase project/account connector was available in this pass; GitHub source/config inspection is not a live Firebase provider inventory.
- Cloudflare inspection used GET operations only. No DNS, route, Worker, Pages, deployment, secret or setting mutations were performed.
- GitHub inspection used GET operations except this document update. No workflow dispatch, rerun, branch deletion, merge or settings change was performed.
- No mobile builds, test suites, browser journeys, provider restore drills or security scans were run in this pass.
- No credential values were retrieved or reproduced.

**Checkpoint conclusion:** parallel evidence gathering advanced all seven workstreams, but the program remains PROTECTED HOLD. The most urgent external dependency is GitHub-hosted Actions startup admission; the most urgent source safety issue is the still-unmerged Firebase root-publication configuration on \`main\`. Unknowns remain unknown until tested.


## 9.6 File-level reconciliation — PRs #613 and #614 (2026-11-20)

A targeted patch comparison was completed for the overlapping Firebase, Flutter, Android, workflow, and publication-boundary files. Both drafts remain preserved and unmerged.

### Reconciled common baseline

- Both PRs change the same core Firebase boundary files: `.firebaserc`, `firebase.json`, `lib/firebase_options.dart`, `lib/main.dart`, root `pubspec.yaml`, Android Gradle scaffolding, and the Firebase publication manifest/builder.
- Both set Firebase Hosting's public directory to `build/firebase-public`, set the Firebase project alias map to empty, and use the non-routable `lingo-staging-not-configured` placeholder project identifiers rather than the production project.
- Both pin the same API-21 FlutterFire package line: `firebase_core 2.32.0`, `firebase_auth 4.20.0`, `firebase_database 10.5.7`, `firebase_storage 11.7.7`, and `firebase_analytics 10.10.7`.
- Both replace the legacy Groovy app Gradle file with Kotlin DSL, declare Android `minSdk = 21`, and add a Gradle wrapper configured for Gradle 9.5.0. These are source declarations only; no Android build was run in this pass.
- Both publication manifests remain `QUARANTINED` with an empty file allowlist. The builder rejects non-empty customer publication while quarantined and emits only a noindex 404 page.

### Meaningful differences and disposition

| Area | PR #613 | PR #614 | Reconciliation |
|---|---|---|---|
| Dart SDK floor | `>=3.6.0` | `>=3.12.0` | #614 aligns its declared SDK floor with its pinned Flutter 3.50.0 workflow; verify the actual lockfile/toolchain in a hosted run. |
| Firebase readiness | `isConfigured` requires every declared platform configuration to be complete. | `isConfigured` validates only the active platform and exposes `isConfiguredFor`. | Prefer #614's per-platform semantics; an unconfigured platform should not disable a separately configured platform. |
| Firebase contract check | Contract verifier allows an explicitly unconfigured, guarded placeholder mode. | Contract verifier requires a staging project ID and real non-placeholder credentials. | #614 is stricter for staging integration acceptance. Its workflow currently marks this step `continue-on-error: true`; therefore a passing overall job must not be interpreted as Firebase integration acceptance. Replace this with explicit, separately reported states: preview-only/disabled when no staging identity exists, and blocked until staging integration evidence is supplied. |
| Publication tests | Rejects a non-empty quarantined allowlist and validates path/symlink protections. | Adds explicit tests for symlinked manifest/config parents and preserves the same quarantine boundary. | Retain #614's additional negative tests. |
| Flutter workflow | Includes root Flutter checks, Android debug build and a narrow generated-output check. | Adds root and Oasis Flutter analysis, root tests/web build, Android readiness inspection, publication boundary checks and longer execution. | #614 is the more complete candidate, but its exact hosted workflow has not executed successfully in this recovery window. |
| Startup probe | Push trigger targets `recovery/actions-startup-probe-2026-11-16`. | Push trigger targets `recovery/firebase-hosting-quarantine-boundary`. | Keep the PR-specific branch trigger only if that branch is still the intended probe source; do not dispatch or rerun while Actions admission remains unresolved. |

### Remaining pre-acceptance checks

1. Resolve the #614 workflow's `continue-on-error` semantics so a green workflow cannot be mistaken for Firebase-connected acceptance while staging is intentionally unconfigured.
2. Reconcile the root `pubspec.yaml` removal of the declared `assets/images/`, `assets/icons/`, `assets/sounds/`, and Inter font entries against the actual repository asset inventory. Do not restore or delete assets by assumption.
3. Verify root and Oasis lockfiles with the exact declared Flutter/Dart toolchain using `flutter pub get --enforce-lockfile`; compare resolved dependencies and generated platform files.
4. Run Android debug build and API-21 compatibility tests on a hosted runner, then obtain device/emulator evidence. Validate the Gradle/AGP/Kotlin/Flutter combination rather than treating the version declarations as proof.
5. Run iOS project generation/build and simulator checks separately; the Android scaffold does not establish iOS readiness.
6. Run the Firebase publication negative tests and inspect the exact generated output inventory. Do not configure a Firebase project or publish to Hosting as part of this review.

### Decision

**PR #614 remains the preferred review baseline, not an approved merge candidate.** Preserve PR #613 as independent history until the file-level checks above are resolved. Do not merge either PR, change the Firebase project, activate Firebase services, or promote a Hosting deployment. No source mutation to PRs #613/#614 was made during this comparison; this section records review findings only.


## 9.7 Post-reconciliation Actions admission check — commit a51dcfc (2026-11-20)

The documentation-only reconciliation commit `a51dcfceea2d90cead0719b99c18990c8781c1fe` was associated with three GitHub Actions runs:

| Workflow | Run ID | Result | Jobs | Artifacts |
|---|---:|---|---:|---:|
| Lingo Legacy Static CI | 44767706209 | `startup_failure` | 0 | 0 |
| Crimson Smoke UI — static validation | 44767704417 | `startup_failure` | 0 | 0 |
| G02 Runner Image Build (no publish) | 44767702639 | `startup_failure` | 0 | 0 |

The runs completed in startup failure before any job was instantiated. The latest-attempt job-list reads returned empty arrays, and artifact-list reads returned empty arrays. No test step, runner assignment, build, log-bearing job, or evidence artifact was produced.

**Interpretation:** this repeats the previously observed Actions admission/startup failure. It is not evidence of test failures in the changed files, nor evidence that the workflows passed. Do not dispatch or rerun more probes. Owner-side repository/organization Actions policy, billing/quota, hosted-runner availability, and admission controls remain the required next investigation.

No G02 runner was activated. No workflow was dispatched or rerun by this continuation. This check only read the runs automatically associated with the documentation commit.


## 9.8 Cloudflare deployment-history and Pages reconciliation — 2026-11-20

Read-only GET inspection was extended from route/script counts to Worker version/deployment history, script observability settings, Pages project configuration, recent deployments and custom domains.

### Worker version versus deployed-version state

- `thelingolegacyv-5` has **367 uploaded versions** in Cloudflare's version inventory. The latest uploaded version is **367**, ID `52b3cfc2-c60c-495b-a873-8ee9d9cb2a12`, created `2026-11-20T06:35:22Z`.
- The same Worker has **five deployment records total**. Its most recent/active deployment record is dated `2026-10-25T16:21:58Z` and explicitly identifies **version 137** (ID `2d161fa5-598f-4998-ada8-7ac4c72c3461`) at 100% traffic. The deployment annotation says it activated uploaded version 137 while preserving existing domain routes and rollback history.
- Therefore, the newest uploaded Worker code is not the currently deployed Worker code. Versions 138–367 are present in the upload/version inventory but are not represented in the five deployment records. This is a material separation between uploaded candidates and deployed production state—not proof that the newer versions are safe or ready.
- Do not promote version 367, change traffic weights, or alter routes. Preserve version 137 as the current deployed baseline until source-to-version provenance, tests, route behavior, and rollback evidence are correlated and accepted.

Other script histories show deployed records for the route-less preview/staging scripts as well. In particular, `thelingolegacy-web` has three uploaded/deployed version records through version 3 on 2026-11-19; `lingo-studio-control-center-staging` has seven versions and a 100% deployment of version 7 dated 2026-11-12; `lingo-unified-control-tower-preview` has version 2 deployed at 100% on 2026-11-16. Thus, a missing custom route is not sufficient evidence that a Worker is unused. All nine non-primary Workers returned empty service-binding arrays; the primary `thelingolegacyv-5` returned only `ASSETS`, `CANONICAL_DOMAIN`, and `PUBLIC_SITE_URL`. Invocation history and all external entry points still need independent review.

### Worker observability configuration

- `thelingolegacyv-5` has persisted invocation logs with 10% head sampling and query-string redaction enabled.
- `lingo-unified-control-tower-preview` has persisted invocation logs at 100% head sampling with `redact_query_string: false`. Treat this as a privacy/security review item: determine whether query strings can contain tokens, identifiers or personal data before relying on these logs. No logging configuration was changed.
- `lingo-ecosystem-atlas`, `lingo-resilience-gateway`, and `lingo-studio-control-center-staging` have persisted invocation logs with query-string redaction enabled. Several other scripts returned no observability settings in the inspected response; absence of returned settings is not proof that no logs exist elsewhere.

### Pages project inventory correction and deployment state

The live account contains these five Pages projects (the names below supersede shorthand labels in earlier notes):

1. `lingo-execution-center-preview` — latest preview deployments for the reconciliation commits were skipped with `path_config`; build command copies `studio-sites/execution-center/index.html` into `dist`. No deployment was executed for the current evidence commits.
2. `lingo-flutter-firebase-preview` — latest preview deployments for the reconciliation commits were skipped with `branch_config`; build command is `bash scripts/cloudflare-pages-preview-build.sh`. No deployment was executed for the current evidence commits.
3. `lingo-legacy-github-integration-test` — latest inspected preview deployment succeeded on 2026-11-06 from branch `security/g02-disable-untrusted-self-hosted-lane-2026-11-05`, commit `a06e2b7f891c1c65188c4d9431a1abac96e1d3e3`. This is a Cloudflare Pages preview build/deploy, not proof of GitHub Actions runner admission or G02 acceptance.
4. `thelingolegacy-static-backup` — production deployment succeeded on 2026-10-25 from branch `recovery/static-backup-2026-10-24`, commit `0c9f4c85aed17ece871fae6f515d9c8384509a2d`. Preserve this backup deployment and its source history.
5. `my-flutter-app` — production deployment succeeded on 2026-08-30. Its active custom domain is `app.thelingolegacy.com`. The recorded build command clones the moving Flutter `stable` branch, runs `flutter pub get` without an enforced lockfile, then builds web; the deployment has an empty commit hash. Treat it as a live legacy surface with reproducibility/provenance gaps, not as proof of current main-branch Flutter readiness.

The two preview project skip reasons repeat on the latest evidence commits: `path_config` for execution-center and `branch_config` for Flutter/Firebase. Do not call either a successful build. No Pages project settings, deployment, domain, or routing changes were made.

### Disposition

Keep the currently deployed `thelingolegacyv-5` version 137 and all existing Pages production/backup deployments protected. Reconcile the 367-version upload history against GitHub source commits and release records before any promotion. Review the Control Tower preview's query-string logging setting. Fix/verify preview project path and branch filters only through a separately reviewed, non-production change. No Cloudflare mutations were performed.


## 9.9 CORE V2 architecture/implementation reconciliation — PRs #594 and #596

A changed-file inventory and targeted source review were completed for the two CORE V2 drafts.

### Branch separation

- PR #594 changes six architecture-only files under `architecture/greenfield-v2/`.
- PR #596 changes 30 implementation, contract, workflow, runbook, registry, security and roadmap files under `platform/lingo-core-v2/`.
- The two PRs have **zero overlapping changed paths**. Preserve their independent histories; there is no file-level merge conflict to resolve at this stage.

### Architecture/implementation alignment

PR #594 proposes a provider-neutral modular baseline: Next.js web, Flutter mobile, Go services, PostgreSQL as the transactional authority for explicitly migrated domains, OIDC identity adapter, transactional outbox, Cloudflare as intended edge subject to route verification, and GitHub as source/evidence authority. Provider provisioning and recurring costs are explicitly deferred pending workload/cost/security approval.

PR #596 implements a narrow non-production profile slice:
- Go HTTP API with `/healthz`, `/readyz`, `GET /v1/me/profile`, and `PUT /v1/me/profile`.
- OIDC ID-token verification through issuer discovery/JWKS and client audience; profile ownership uses verified issuer plus subject rather than client-supplied identity.
- PostgreSQL profile table and an outbox row written in the same transaction.
- Database TLS policy requires `sslmode=verify-full` outside loopback development/test; OIDC issuer requires HTTPS outside loopback development/test.
- Integration tests restrict `TEST_DATABASE_URL` to loopback and database `lingo_test`, create a unique schema per test, apply the migration in that schema, and verify issuer/subject isolation plus rollback when outbox insertion fails.
- No live OIDC issuer, database, publisher, consumer, web client, Flutter client, or production deployment is established by this source review.

### Acceptance status remains intentionally limited

The implementation acceptance matrix labels API/OIDC, API/PostgreSQL and profile/outbox as `BUILT`, not `TESTED`, `CONNECTED` or `CERTIFIED`. Outbox delivery, web API and Flutter API remain `NOT_STARTED`. This is the correct conservative classification until evidence exists.

The API workflow defines a disposable PostgreSQL 16 service and sets a loopback `TEST_DATABASE_URL`, so it is the workflow intended to execute database integration tests. The separate hosted-bootstrap workflow does not define `TEST_DATABASE_URL`; its own description says database integration tests skip without it. Do not count that bootstrap workflow as PostgreSQL integration evidence.

### Remaining review items

1. Obtain completed GitHub Actions jobs before counting any Go test, race, vet, build, coverage, PostgreSQL integration, or hosted runner identity evidence. Current Actions admission failures prevent this.
2. Complete real OIDC issuer/audience/signature/expiry/key-rotation tests and verify issuer-plus-subject tenant isolation against a non-production issuer.
3. Review outbox event idempotency, publisher lease/claim behavior, retry, dead-letter, replay and trace continuity before building consumers. The publisher/consumer is not implemented in this slice.
4. Prove PostgreSQL TLS, least-privilege roles, migration rollback, backup/restore and failure recovery with an isolated test environment.
5. Complete independent threat-model review, SAST/SCA, SBOM/provenance, rate limiting, audit/PII handling and operational telemetry.
6. Keep profile data isolated from wallet balances, rewards, game outcomes and other domain authorities; those domains require their own schemas, ledger contracts and reconciliation.

### Decision

PR #594 remains the proposed architecture baseline and PR #596 remains a non-production implementation candidate. Their source separation is clean, but the implementation is **BUILT / NOT CONNECTED / NOT CERTIFIED**. Do not provision providers, create production databases/identity, merge either draft, migrate data, or deploy.


## 9.10 Pages custom-domain and Worker-route cross-check — 2026-11-20

A final read-only cross-check was performed for the active Pages custom domain `app.thelingolegacy.com`:

- Pages project `my-flutter-app` reports the custom domain as `active`.
- The corresponding Cloudflare DNS record is a DNS-only CNAME: `app.thelingolegacy.com` → `my-flutter-app.pages.dev` (`proxied: false`).
- None of the 27 current Workers route patterns matches `app.thelingolegacy.com`.

This confirms that the active app Pages domain is not currently shadowed by one of the inspected custom Worker routes. Preserve the existing CNAME and Pages domain association; no DNS, Pages or Worker route changes were made.


## 9.11 One-time parallel restoration orchestrator — 2026-11-20

Added `ops/recovery/run_one_time_restoration.py` to the existing PR #615 branch. This is a single-run, fail-closed local orchestrator that executes independent checks concurrently within dependency-ordered waves and emits a consolidated evidence bundle.

### Waves and tasks

| Wave | Parallel work |
|---|---|
| 0 — Source/baseline | Exact HEAD SHA, `git diff --check`, working-tree observation |
| 1 — Repository/contracts | Existing Python recovery-gate unit tests; existing Node static-gate suite; optional gitleaks secret scan; optional PR #614 Firebase publication-boundary tests; optional PR #596 Go tests/race tests/vet |
| 2 — Mobile/web builds | Root Flutter dependency resolution, analyze, tests, web release build, Android debug APK where scaffold exists, iOS simulator build on macOS; same checks for Oasis Flutter project |
| 3 — Public routes | Optional unauthenticated HTTPS GET checks for apex, www and app domains when `--network-enabled` is supplied |
| Final — Acceptance | G02 evidence-gate evaluation only when externally captured evidence JSON and exact SHA are supplied; writes final consolidated JSON and SHA-256 manifest |

Tasks within a wave run concurrently. Waves run in order so baseline checks precede source tests, and mobile builds follow repository/static contract checks. Candidate worktrees for PR #614 and PR #596 must be supplied as existing local directories; the orchestrator copies them into a disposable workspace before running package/build tools. The original checkouts are not modified by those tools.

### Run instructions

From a local checkout of this repository:

```bash
python3 ops/recovery/run_one_time_restoration.py
```

To permit public HTTPS GET probes and dependency downloads:

```bash
python3 ops/recovery/run_one_time_restoration.py --network-enabled
```

To include the separate draft workstreams in the same run:

```bash
python3 ops/recovery/run_one_time_restoration.py \
  --network-enabled \
  --firebase-candidate-dir /path/to/local-pr-614-worktree \
  --firebase-expected-sha b00a1cd3081aef361bc27803cd18427420174179 \
  --core-v2-dir /path/to/local-pr-596-worktree \
  --core-v2-expected-sha 40a53bb9c636c3edd3d6e4e2df531ad3c53abbe1
```

To evaluate a previously captured G02 evidence record, also provide `--g02-evidence` and `--expected-sha`. The tool does not manufacture runner, job, log, artifact, or approval evidence.

### Output and execution boundaries

Each run writes to `release/evidence/one-time-restoration/run-<UTC timestamp>/`, including per-task logs, `final-evidence.json`, and `SHA256SUMS`. The script returns a nonzero exit status when any task or critical gate is FAIL/BLOCKED.

- Default mode is offline; `--network-enabled` permits package downloads and public GET probes only.
- Flutter, Go and Firebase candidate checks run in disposable copies. Existing `PUB_CACHE` is reused rather than replaced with an empty offline cache.
- Missing SDKs, missing lockfiles, unavailable candidate worktrees, absent scanners, missing evidence and unsupported platforms are recorded as BLOCKED rather than skipped as successful.
- GitHub Actions admission, Worker version/source provenance, Firebase live connectivity, identity/wallet integration, backup restore/DR, independent security certification and production activation remain external blocked gates.
- **Production activation is deliberately hard-blocked in the script.** It has no deployment, merge, DNS, Worker, Firebase, payment, runner, data-migration or backup-deletion commands. Passing local tests cannot authorize these actions.

### Verification limitation

The artifact was committed and read-back verified, but it has **not been executed in this ChatGPT environment**: the live GitHub connector exposes repository source but not a local checkout with Flutter/Android/Xcode/Go toolchains. No Actions dispatch was attempted because Actions admission remains unresolved. The first execution must occur in an authorized local recovery checkout; its machine-generated report, not this source commit, will determine which test/build tasks pass.

**Disposition:** orchestrator source added; execution pending local toolchain and optional PR candidate worktrees. PROTECTED HOLD remains active.


**Disposable-copy hygiene:** repository and candidate copies exclude Git metadata, dependency/build caches, generated evidence, `.env` files, secret directories, private-key/certificate files, and service-account/credential JSON patterns. The runner also removes secret-like environment variables before starting child processes. This reduces accidental exposure but does not replace a dedicated secret scan or host-level isolation.


## 9.12 Consolidated test-matrix expansion — 2026-11-20

The orchestrator's Wave 1 was expanded after a complete repository test-path inventory. In addition to the existing static-gate and recovery-gate suites, it now includes these existing project tests/validators:

- Node product regressions: static-gate harness, server slot-engine math/idempotency tests, Worker rate-limit regression tests, Doughboys Oasis campaign-state progression/replay tests, and LINGO repair-engine workflow tests.
- Shell safety regressions: G02 runner-control guard assertions, local runner telemetry/sanitizer harness, and manual advancement lifecycle-validator tests. These tests use local synthetic fixtures; they do not register/restart runners or advance a real production lifecycle.
- Studio/registry contracts: Studio site configuration/assets validation, Studio surface/routes/manifest integrity, and EZCA registry validation.
- Cloudflare source build: Wrangler `deploy --dry-run` only when a pre-installed local Wrangler CLI and the checked-in dry-run config are available. The script does not install Wrangler or publish a Worker.
- DevOps static validation: yamllint, Ansible syntax check, and Terraform fmt/init-backend-false/validate only when each tool and its source configuration are present. Missing tools are recorded as BLOCKED; no tool is installed by the orchestrator.
- Existing recovery Python tests and the complete existing Node static-gate suite remain in the same parallel Wave 1.

These checks run concurrently with the other independent Wave 1 tasks. Flutter/Oasis builds remain in Wave 2. Optional PR #614 and PR #596 worktrees are isolated and copied into a disposable workspace before their tests execute.

No toolchain was installed and no test/build command was executed by this documentation update. The latest script source remains committed on the existing PR #615 draft branch; execution and machine-generated results are still pending an authorized local recovery checkout.


**Execution refinement:** unsupported platform/tool checks remain BLOCKED rather than being misreported as test failures. A genuine nonzero test/build exit is FAIL. Offline mode never initializes Terraform providers; `terraform init -backend=false` and subsequent provider validation require the explicit `--network-enabled` option. No deployment backend is initialized.


**Additional regression coverage:** Wave 1 now also runs the Crimson Smoke homepage/CSS/audio/accessibility source contract and recovery-artifact checks: bridge-adapter shell syntax, evidence/quarantine JSON parsing, and a negative test proving the incomplete G02 evidence template remains BLOCKED. These are source/static checks, not browser playback or real runner execution.


**Lockfile acceptance detail:** Flutter lockfile presence is measured from the supplied source checkout before dependency resolution. A lockfile generated only inside the disposable test copy does not count as committed/reproducible dependency evidence; the corresponding Flutter project remains BLOCKED until its source lockfile is committed and validated.

## 9.13 Orchestrator code-review hardening and latest live inventory — 2026-11-20

A read-only source review identified three evidence-integrity defects in the initial one-time orchestrator draft. These were corrected on the existing PR #615 branch; no local execution or hosted workflow dispatch was performed.

1. **Real wave gates:** W0 now blocks W1 unless the source baseline passes. W1 required contract/product/candidate suites gate W2; W2 Flutter analysis/tests/builds gate W3. Optional scanner/provider-tool checks remain visible as BLOCKED when unavailable and do not suppress independent builds by themselves; any actual FAIL blocks the next wave. Final evidence packaging and G02 evaluation still run after the waves.
2. **Exact source provenance:** W0 now requires a clean checkout and records branch, full commit SHA, working-tree status and git diff --check. The orchestrator excludes its own generated evidence directory from this cleanliness check. PR #614 and PR #596 inputs receive separate Git provenance checks; dirty/unreadable worktrees or missing or mismatched expected SHAs fail closed. Candidate task summaries include their source commit SHA and branch.
3. **CORE V2 module-root handling:** --core-v2-dir now accepts the full PR #596 repository worktree and resolves platform/lingo-core-v2/services/api/go.mod, while still accepting the Go module directory directly. This aligns the documented input with the actual PR layout.

Exact-head correlation flags are mandatory whenever a candidate directory is supplied:
- --firebase-expected-sha for the PR #614 checkout.
- --core-v2-expected-sha for the PR #596 checkout.

At this checkpoint, the connected PR heads observed were PR #614 b00a1cd3081aef361bc27803cd18427420174179 and PR #596 40a53bb9c636c3edd3d6e4e2df531ad3c53abbe1. Re-read each PR head immediately before a local run; do not use these values if either PR has advanced.

The live Cloudflare inventory was re-read through GET-only APIs:
- 27 Worker routes, still assigned 18 to thelingolegacyv-5, 6 to lingo-integration-config-404, and one each to lingo-flagship-root, lingo-ecosystem-atlas, and lingo-static-backup-proxy.
- 10 Worker scripts, including thelingolegacy-web (created 2026-11-19; no custom zone route returned).
- 34 DNS records.
- 5 Pages projects.

The earlier section 4 nine-script count was a stale snapshot and is corrected to 10. The ten-script inventory and the separate binding/deployment findings in section 9.2 remain the current reconciliation. The apex A record still points to proxied TEST-NET-1 address 192.0.2.0; no DNS edit is authorized or performed.

The read-only GitHub branch endpoint reports main at 1a60e2314cb3f9b5e3efe648ade83121080cb7b2 with protected=false, protection.enabled=false, and required_status_checks.enforcement_level=off. The active repository ruleset 27403956 (Lingo - protect main) currently returns deletion, non_fast_forward, and copilot_code_review (review_on_push=true) rules, with no required status-check or required-approval rule in its payload. The branch-protection detail endpoint returned 403 and the Actions permissions endpoint was not accessible through the connected integration. Treat effective branch protection and Actions admission policy as unresolved/high-priority owner-side controls; no repository settings were changed.

The current PR #615 head is c05b127439fdf43d85db4e835aaea4d5d04ab52b. Its five associated Actions runs (44790866031, 44790864533, 44790863158, 44790861524, 44790859742) all concluded startup_failure; every latest-attempt job list and artifact list returned zero entries.

The PR #614 head b00a1cd3081aef361bc27803cd18427420174179 has seven associated runs (44602578320, 44602576340, 44602572139, 44602574262, 44602568797, 44602565745, 44602563123). All seven concluded startup_failure; all seven job lists and artifact lists returned zero entries. The PR #596 head 40a53bb9c636c3edd3d6e4e2df531ad3c53abbe1 has two associated runs (44428739381, 44428737664); both concluded startup_failure with zero jobs and zero artifacts.

These 14 run observations establish repeated Actions admission/startup failure across the current #615, #614 and #596 candidate heads. They do not establish test failure or test execution. No dispatch or rerun was attempted.

**Verification limitation:** the orchestrator changes are committed and have been read back from GitHub for source-level review. They have not been Python-compiled or executed in a local checkout in this environment. Do not claim syntax, unit, build, or end-to-end success until a clean local run emits the evidence bundle.

**Disposition:** PR #615 remains open/draft/unmerged; G02 FAIL / UNVERIFIED; G03–G11 BLOCKED; PROTECTED HOLD active.



## 9.14 One-time orchestrator evidence-integrity fixes and refreshed checkpoint — 2026-11-20

A second read-only code review of the PR #615 orchestrator identified and corrected three remaining evidence-quality issues on the same existing draft branch:

1. **Candidate SHA is now mandatory.** Supplying a PR #614 or PR #596 worktree without its exact expected current PR head SHA records the provenance task as BLOCKED. A dirty checkout, unreadable Git state, mismatched SHA, or missing required source/test files fails closed. The command above includes the currently observed PR heads; re-read both PRs immediately before execution and replace either SHA if its PR has advanced.
2. **Firebase candidate coverage is expanded.** The isolated PR #614 task now requires and executes the publication builder syntax check plus all four available contract suites: Firebase public-output boundary, Flutter Firebase staging identity, Android API-21 Firebase pin compatibility, and Flutter Android scaffold readiness. These remain local contract tests, not Firebase provider connectivity or deployment evidence.
3. **Evidence bundle checksums now cover every artifact.** `SHA256SUMS` is generated for `final-evidence.json` and all task logs, rather than hashing only the summary file. The script reports the checksum-manifest digest separately.

The orchestrator currently contains 840 lines. Its latest script commit is `9c533f4ae5f7d6e0d88274c60f913f49d582937d`; the script blob SHA read back from GitHub is `da6f9aa9fc0bfd86ae0046eddd2390542f48d25f`. The updated file and this document remain on the existing PR #615 branch; PR #615 remains draft and unmerged.

### Latest read-only infrastructure observations

- Cloudflare returned 27 Worker routes, 10 Worker scripts, 34 DNS records and 5 Pages projects.
- Five Worker scripts have no custom zone route in the returned route inventory: `lingo-flagship-site-preview`, `lingo-resilience-gateway`, `lingo-studio-control-center-staging`, `lingo-unified-control-tower-preview`, and `thelingolegacy-web`. No route does not prove unused; retain pending service-binding, trigger, invocation, and ownership review.
- The apex `A` record remains proxied to `192.0.2.0` (TEST-NET-1). The `app` CNAME remains `my-flutter-app.pages.dev` and is not proxied; the `admin` CNAME remains `admin-thelingolegacy.firebaseapp.com` and is not proxied. No DNS changes were made.
- The latest deployments for `lingo-execution-center-preview` and `lingo-flutter-firebase-preview` are both marked skipped. They are not successful preview-build evidence. The `my-flutter-app` production deployment's latest recorded timestamp remains 2026-08-30.
- Current PR #615 head is `8a566ee9c532883046be987bc653d2f7252ddd6a`. Its associated Crimson Smoke static-validation run (44791974453) concluded `startup_failure` with zero jobs and zero artifacts. This is startup/admission failure, not a test-suite result. The preceding-head runs are documented in section 9.13.
- PR #614 remains at `b00a1cd3081aef361bc27803cd18427420174179`; PR #596 remains at `40a53bb9c636c3edd3d6e4e2df531ad3c53abbe1`. Both remain open, draft and unmerged.

No local compile, test, build, or orchestrator execution was performed. No Actions dispatch/rerun, DNS/Worker/Pages/Firebase mutation, merge, runner activation, payment activation, migration, or backup deletion was performed.

**Disposition:** Source-level evidence hardening committed and read-back verified; local execution pending. G02 remains FAIL / UNVERIFIED; G03–G11 remain BLOCKED; PROTECTED HOLD remains active.


## 9.15 Unrouted Worker trigger and subdomain review — 2026-11-20

A further read-only Cloudflare inspection queried deployment history, Cron schedules, Worker settings (bindings and tail consumers), and workers.dev subdomain settings for all five scripts with no custom zone route assignment.

| Script | Latest deployment observed | Cron schedules | Bindings / tail consumers | workers.dev / preview |
|---|---|---:|---|---|
| `lingo-flagship-site-preview` | 2026-11-06; upload; version 100% | 0 | None returned | Enabled / previews disabled |
| `lingo-resilience-gateway` | 2026-11-09; upload; version 100% | 0 | None returned | Enabled / previews disabled |
| `lingo-studio-control-center-staging` | 2026-11-12; deployment; version 100% | 0 | None returned | Enabled / previews enabled |
| `lingo-unified-control-tower-preview` | 2026-11-16; upload; version 100% | 0 | None returned | Enabled / previews enabled |
| `thelingolegacy-web` | 2026-11-19; dashboard-template upload; version 100% | 0 | None returned | Disabled / previews disabled |

Interpretation and controls:
- No Cron schedule, regular binding, or tail-consumer relationship was returned for these five scripts by the queried APIs. This does not establish absence of every possible invocation path or account-level integration.
- Four of the five scripts have workers.dev enabled despite having no custom zone route. The Studio Control Center staging and Unified Control Tower preview scripts also have preview URLs enabled. These are configured alternate access surfaces and must be included in exposure review; do not infer they are private solely because they lack custom DNS routes.
- Thelingolegacy-web has workers.dev and preview access disabled, but its three dashboard-template deployment records show an uploaded version at 100%; preserve pending source, owner, and intended-purpose attribution.
- No deployment, route, subdomain, preview, binding, trigger, or script setting was changed. Do not disable any access surface without owner confirmation, traffic/invocation review, and a rollback plan.

**Disposition:** the five unrouted scripts remain INVESTIGATE / PRESERVE, not RETIRE. Production and staging boundaries remain unchanged; PROTECTED HOLD remains active.

## 9.16 Candidate test coverage, lockfile enforcement, and local integration preconditions — 2026-11-20

The PR #615 orchestrator was expanded again after reviewing the actual PR #614 and PR #596 test paths.

- **PR #614 candidate execution:** W1 now runs syntax checks for the Firebase builder and Firebase/Android contract validators, all four existing Node contract suites, and the concrete Android readiness/API-21 validators against the candidate checkout. W2 also runs the PR #614 root Flutter and Oasis Flutter projects, not just the baseline source branch.
- **Flutter reproducibility:** Every Flutter project requires a committed source pubspec.lock and runs pub get with --enforce-lockfile. Missing lockfiles block that project; the script will not create a new lockfile and treat it as accepted source evidence.
- **Android/iOS toolchain reporting:** Android debug builds run only when an SDK path is found via ANDROID_SDK_ROOT, ANDROID_HOME, or android/local.properties. Otherwise the Android target is recorded BLOCKED. iOS simulator builds require macOS and xcodebuild; an unavailable iOS target remains BLOCKED without suppressing independent web/Android work or W3 GET observation. The overall evidence bundle still remains BLOCKED when any target is blocked.
- **PR #596 Go coverage:** W1 now includes gofmt validation, go mod tidy -diff, verbose Go tests, race tests, vet, and build. The PostgreSQL integration tests self-skip when TEST_DATABASE_URL is absent; the orchestrator explicitly records the integration target BLOCKED in that case instead of treating a passing unit-test command as integration evidence. A supplied TEST_DATABASE_URL is accepted only for localhost/loopback and database lingo_test, and only when the operator also passes --allow-local-postgres-integration. Without that explicit opt-in, the DSN is suppressed from child processes and the integration gate remains BLOCKED. The raw DSN is never written to logs or evidence.
- **Dependency-aware wave policy:** W0 clean-source integrity gates W1. Required baseline repository contracts gate W2. Candidate suites remain explicit in the evidence bundle but a missing optional candidate/tool target is recorded BLOCKED without suppressing independent baseline builds; an actual FAIL still blocks the next wave. W2 baseline root/Oasis Flutter checks gate W3; candidate Flutter tasks are recorded separately. A blocked iOS simulator target does not suppress read-only W3 probes, but remains a final BLOCKED gate.
- **Exact candidate provenance:** When --firebase-candidate-dir or --core-v2-dir is supplied, its matching --firebase-expected-sha or --core-v2-expected-sha is mandatory. The current observed candidate heads remain PR #614 b00a1cd3081aef361bc27803cd18427420174179 and PR #596 40a53bb9c636c3edd3d6e4e2df531ad3c53abbe1; re-read immediately before execution.
- **Evidence hashing:** SHA256SUMS now covers final-evidence.json and every generated task log/artifact; the manifest digest is printed separately.

The latest PR #615 head at this checkpoint is 8a566ee9c532883046be987bc653d2f7252ddd6a. Its associated run 44791974453 ended startup_failure with zero jobs and zero artifacts. The script is read-back verified at source level, but still has not been Python-compiled or executed in a local checkout. No Actions dispatch/rerun was attempted.

**Disposition:** expanded candidate test coverage and execution gates are committed on the existing PR #615 draft branch; local execution remains pending. G02 FAIL / UNVERIFIED; G03–G11 BLOCKED; PROTECTED HOLD active.

## 9.17 Firebase initialization guard hardening — 2026-11-20

A source-level review of PR #614 found that Firebase initialization checked API key, app ID, and messaging sender placeholders but did not independently validate projectId. If the first three values were filled while projectId remained lingo-staging-not-configured, app startup could attempt Firebase initialization with an invalid project target.

The existing PR #614 branch was hardened without changing Firebase project selection or provider state:
- DefaultFirebaseOptions.isConfiguredFor now trims and validates API key, app ID, messaging sender ID, and project ID.
- It rejects an empty project ID, the lingo-staging-not-configured sentinel, and YOUR_* placeholders.
- Added Flutter unit tests for empty, sentinel, and generic project-ID placeholders.
- PR #614 remains open/draft/unmerged at head b00a1cd3081aef361bc27803cd18427420174179. Its current commit-run query returned no associated workflow runs; no local Flutter tests were executed.

The orchestrator's required PR #614 expected SHA was refreshed to b00a1cd3081aef361bc27803cd18427420174179. PR #596 remains at 40a53bb9c636c3edd3d6e4e2df531ad3c53abbe1. Re-read both candidate heads before local execution; any changed head requires updating the supplied expected SHA.

Firebase remains unconfigured: .firebaserc has no staging alias, Firebase options remain placeholders, the Hosting allowlist is empty, and no staging credentials/provider connection were added. This source guard is not Firebase connectivity, a successful Flutter test run, or deployment certification.

**Disposition:** source-level candidate hardening only; no local compile/test/build or hosted success is claimed. PR #614 remains draft; PR #615 remains draft; G02 FAIL / UNVERIFIED; G03–G11 BLOCKED; PROTECTED HOLD active.

## 9.18 Refreshed Pages deployment state — 2026-11-20

A fresh read-only Cloudflare Pages inventory returned five projects and 34 DNS records. The current latest deployments for the two relevant preview projects were inspected individually:

| Pages project | Deployment ID | Source commit | Latest stage | Explicit skip reason |
|---|---|---|---|---|
| lingo-execution-center-preview | 08802470-ba71-42a5-be01-d4a69c780426 | b6a1e6afec01d110912547ba7728a242a892aae5 | queued / idle | is_skipped=true; path_config |
| lingo-flutter-firebase-preview | 1466b367-e36c-4546-a78c-4bd4e73d66fd | b6a1e6afec01d110912547ba7728a242a892aae5 | queued / idle | is_skipped=true; branch_config |

These are not pending builds and are not successful preview deployments: the API explicitly reports both as skipped. The first project is skipped by path configuration; the second by branch configuration. No Pages build was dispatched or retried.

The my-flutter-app production project's latest deployment remains a successful deployment dated 2026-08-30T21:44:09Z. This historical deployment does not certify the current PR branch or the Firebase candidate. No Pages project configuration, domain, deployment, or production setting was changed.

The current DNS observations remain: apex A -> 192.0.2.0 (proxied), www CNAME -> thelingolegacy.com (proxied), app CNAME -> my-flutter-app.pages.dev (unproxied), and admin CNAME -> admin-thelingolegacy.firebaseapp.com (unproxied). DNS remains untouched.

**Disposition:** preview attempts are explicitly SKIPPED, not PASS; production deployment evidence is historical only. PROTECTED HOLD remains active.

## 9.19 Explicit opt-in for local PostgreSQL integration tests — 2026-11-20

The CORE V2 integration test fixture creates and drops a unique PostgreSQL schema. A loopback URL alone cannot rule out an operator-created SSH tunnel to a remote database, so the orchestrator now requires a separate explicit opt-in before it passes TEST_DATABASE_URL to Go test processes.

- Default behavior: TEST_DATABASE_URL is blanked for child processes; PostgreSQL integration tests self-skip and the integration-target gate is BLOCKED.
- Opt-in: pass --allow-local-postgres-integration together with TEST_DATABASE_URL pointing to localhost/loopback database lingo_test.
- The raw DSN is never written to task logs or final-evidence.json. The evidence records only the sanitized host and database name.
- An unsafe scheme, non-loopback host, or database name other than lingo_test fails the target preflight and the DSN is not passed to test processes.
- This flag permits only the test suite's isolated local schema create/drop behavior. It does not authorize production migrations or any provider-side data mutation.

The orchestrator is now 840 lines at script commit 9c533f4ae5f7d6e0d88274c60f913f49d582937d (blob SHA da6f9aa9fc0bfd86ae0046eddd2390542f48d25f). The current PR #615 head is the same script commit; its commit-run query returned no associated workflow runs. No local compile or execution has been performed.

**Disposition:** local PostgreSQL integration remains opt-in and BLOCKED by default; production and all external release gates remain under PROTECTED HOLD.

## 9.20 PostgreSQL DSN isolation and log redaction — 2026-11-20

A final safety pass tightened how the optional CORE V2 test database URL is handled:

- TEST_DATABASE_URL is excluded from the inherited environment for all child processes.
- It is passed only to the Go test commands after both explicit --allow-local-postgres-integration opt-in and loopback/lingo_test target validation.
- When the DSN is passed, PostgreSQL connection URIs are redacted from child-process output before task logs are written; the exact DSN is also replaced if echoed verbatim.
- The final evidence contains sanitized host/database metadata only, never the connection URI.

The orchestrator is now 848 lines at script commit 2a8a75a1f6e09bb5a186416e21f95cd3ab6f0491 (blob SHA 70ddfb3ce89ece551fa4894b7293f404e2953bdf). The code is read back from GitHub but has not been Python-compiled or executed locally. PostgreSQL integration remains disabled by default.

**Disposition:** local test database access remains explicit opt-in and fail-closed; PROTECTED HOLD remains active.

