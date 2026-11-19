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

### 4.3 Worker script inventory

The nine live script names returned by the Cloudflare account API:

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
