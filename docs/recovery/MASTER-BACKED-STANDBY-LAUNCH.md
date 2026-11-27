# Master-backed LINGO Legacy standby launch

**Prepared:** 2026-11-24  
**Canonical source:** \`thelingolegacy-blip/TheLingoLegacy\`, \`main\`  
**Standby Pages project:** \`thelingolegacy-static-backup\`  
**Pages build root:** \`static-site\`

## Scope

Create a one-page LINGO Legacy public front door and a separately hosted static standby while preserving the existing curated route set. The static content is copied from the current canonical \`main\` tree for the 68 existing public files that were already part of the curated standby. Only those curated paths are mirrored; internal admin, governance, operations, source and private data paths are not copied into the public Pages root.

The former backup homepage is preserved at `static-site/legacy-home/index.html`. The public navigation manifest contains exactly the eight public portfolios. Six related concepts (LINGO ID, Universal Legacy Wallet, LINGO Nexus, LINGO Studios, LINGO Towers and Bridged Gap) remain preserved in a separate non-realm list with no public routes. This manifest is not the internal 14-node realm registry; that separate candidate must be reconciled against current main, reviewed and accepted before it is treated as authoritative.

## Existing Cloudflare state observed 2026-11-24

- Pages project \`thelingolegacy-static-backup\` exists at \`thelingolegacy-static-backup.pages.dev\`.
- Git source was \`thelingolegacy-blip/TheLingoLegacy\`, branch \`recovery/static-backup-2026-10-24\`, build root \`static-site\`.
- Automatic deployments were disabled; production deployments were disabled; preview deployment setting was \`none\`.
- Latest recorded deployment was \`88e177e8-79c0-4aff-8243-308f405b04fe\`, from commit \`0c9f4c85aed17ece871fae6f515d9c8384509a2d\`, dated 2026-10-25. Cloudflare reported queued, initialize, clone, build and deploy stages successful.
- Preview and production deployment configurations reported \`fail_open: true\`. This remains a security review blocker; do not promote or change it without reviewed evidence.
- No custom domain was attached to this Pages project in the observed configuration. No DNS or Worker route was changed.
- A Worker named \`lingo-static-backup-proxy\` was present in the account inventory; its source and behavior were not established by this inspection.

These are an observed configuration snapshot, not a fresh live route/security verification.

## Public site design

The first public surface is a single responsive landing page. It links to existing curated public routes for the flagship, LINGOlane, LINGOslots, LINGOlibrary, LINGOmedia, LINGOworld, community and trust information. The complete public portfolio manifest also records planned/portfolio brands without fabricating a live URL.

The standby retains a noindex response header and a canonical URL pointing to the primary domain. It is a static mirror, not a dynamic application failover.

## Master foundation map

| Domain | Implementation boundary | Acceptance evidence |
|---|---|---|
| Governance and release authority | Canonical repository policies and human approval records | Policy review, scoped approval, immutable evidence, independent acceptance |
| Portfolio and brand registry | Versioned manifest plus canonical master documentation | Every entry has canonical name, owner, lifecycle state and route or explicit no-route state |
| SAAAE security | Server-side default-deny RBAC/ABAC, least privilege, approval records and audit trails | Positive/negative authorization tests, audit trace, secret isolation and independent review |
| Identity and sessions | Existing identity provider and server-side session contracts | Provider configuration, threat review, login/logout/session tests |
| Public website | Curated \`static-site/\` root | Route crawl, asset checks, accessibility, headers, canonical/robots and 404 review |
| Backup and recovery | Existing Pages project, isolated source, deployment history and recovery runbook | Fresh deployment, source/assets backup, restore drill, measured RTO/RPO |
| CI evidence | GitHub Actions and alternate CI validation | Actual job assignment, steps, logs, artifacts, exact SHA and independent verification |
| Data, wallet and payments | Separate backend and transaction boundaries | Server-authoritative ledger, idempotency, reconciliation, compliance review and explicit activation approval |
| Observability | Health endpoints, uptime checks, structured logs and alert ownership | Live probes, alert-delivery test, incident owner and retained evidence |
| Legal, privacy and content | Approved public policies and rights-cleared assets | Legal review, privacy/data-flow review, content provenance and publication approval |

This map defines implementation and acceptance work. It does not claim that every provider, API, account, policy or production control is operational.


## Existing launch hostname integration — observed 2026-11-24

The Cloudflare account has an existing launch endpoint; it is not a blank hostname:

- DNS: \`launch.thelingolegacy.com\` is a proxied CNAME to \`thelingolegacy-static-backup.pages.dev\`.
- Worker route: \`launch.thelingolegacy.com/*\` is assigned to \`lingo-static-backup-proxy\`.
- Worker behavior: \`GET\` and \`HEAD\` for \`/\` and \`/index.html\` return a pinned Studio HTML asset from GitHub commit \`9eaa20fd8872b940a157f16a8bbd5ddb04371597\`; five whitelisted SVGs are pinned to that same commit. Other paths are proxied to the Pages hostname.
- This means changing the Pages \`static-site/index.html\` alone will not change the page served at the launch hostname root. A separate Worker-source reconciliation and deployment is required.
- An external browser probe was redirected to a Cloudflare Access login page. The hostname is therefore not confirmed as anonymously/publicly accessible. Preserve that access gate until a separate public-launch decision.
- Pages configuration currently has deployments disabled, production deployments disabled and preview deployment setting \`none\`. This PR cannot produce a Pages preview until that configuration is separately changed.
- The previously noted \`fail_open: true\` value was not present in the retrieved \`lingo-static-backup-proxy\` source or its script settings. Treat the exact source of that earlier flag as unresolved; do not attribute it to this Worker without further evidence.

No Worker route, DNS record, Access policy, Pages setting or deployment was changed by this PR.

## Security and publishing boundaries

1. Only \`static-site/\` is eligible for Pages publication. Do not change the build root to the repository root.
2. Keep \`X-Robots-Tag: noindex, nofollow, noarchive\` on the standby hostname until a separately approved public cutover.
3. Keep standby hostname and custom domains separate from the primary site.
4. Static backup cannot authenticate users, process payments, run wallets, execute live game transactions or guarantee dynamic API behavior.
5. \`fail_open: true\` remains a review blocker. Do not call the standby security-certified or takeover-ready until access/failure behavior is tested and corrected.
6. Keep internal Master controls, audit evidence, secrets, runbooks and private data outside \`static-site/\`.
7. No production DNS, Worker route, production secret, Firebase production setting, payment configuration or customer data is changed by this change.

## Validation

Run \`node scripts/verify-static-backup.mjs\`. The verifier checks the homepage structure, canonical host, noindex/security headers, manifest validity, local route targets, static-only health contract and preservation of the previous homepage.

CircleCI receives a Node 22 validation job on non-main branches. A config file is not execution evidence; the CircleCI integration and first real run must be confirmed independently.

## Release and recovery sequence

1. Review this feature branch and exact diff against current \`main\`.
2. Run the static verifier and alternate CI; preserve logs and exact SHA.
3. Independently crawl the Pages preview: homepage, every manifest route, assets, 404, CSP, HSTS, frame policy, noindex and robots/sitemap.
4. Confirm the published root remains \`static-site\`; confirm no internal repository files are exposed.
5. Resolve \`fail_open\` through a reviewed, tested security change.
6. Obtain separate human authorization before a Pages deployment or public release.
7. Verify deployment ID, source SHA, response headers, routes and rollback target.
8. DNS/Worker-route failover remains a separate, explicitly authorized operation.


## CI admission evidence for this change

For head commit \`eedbe54b6ae8e7b9d19e63013b5436390867db79\`, GitHub returned four associated workflow runs, all completed with \`startup_failure\`:

- \`45503584615\` — Lingo Legacy Static CI
- \`45503582909\` — Crimson Smoke UI — static validation
- \`45503581327\` — G02 Runner Image Build (no publish)
- \`45503579804\` — LINGO Legacy DevOps Foundation Validation

The jobs endpoint returned zero jobs for all four runs. The Static CI artifacts endpoint returned zero artifacts. No successful execution, test result, runner assignment, steps or build artifact is claimed. This is consistent with the existing job-admission blocker, not evidence that the new static verifier itself failed.


## Source-controlled launch proxy prepared

The live Worker was uploaded directly to Cloudflare and was not represented in the canonical repository. This branch now adds:

- \`cloudflare/static-backup-proxy.mjs\` — proposed replacement source. It proxies the root and deep links to the Pages standby, allows only GET/HEAD, checks the exact launch hostname and default port, rewrites Pages-origin redirects, applies noindex/security headers, and returns 502 on origin failure. It does not fall back to the primary site.
- \`cloudflare/wrangler-static-backup.toml\` — isolated Worker configuration for the existing \`launch.thelingolegacy.com/*\` route.
- \`scripts/tests/static-backup-proxy.test.mjs\` — focused behavior and failure-mode tests.
- CircleCI's standby job now runs both the static verifier and proxy unit tests.

The existing direct-upload Worker remains live and unchanged until a separately approved deployment. The new source is a proposed, reviewable replacement only.

## Local proxy unit-test result

Executed in Node.js v22.16.0:

\`\`\`
node --test scripts/tests/static-backup-proxy.test.mjs
9 tests passed
0 failed
\`\`\`

The suite covers Pages-root routing, deep links/query strings, redirect rewriting, non-default-port rejection, non-read-only-method rejection, unexpected-host rejection, fail-closed origin errors, security headers and HEAD behavior. This is local unit-test evidence for the proxy module, not a Cloudflare deployment or end-to-end Access test.

## Honest status

- The canonical GitHub Actions job-admission failure is not repaired by this static-site work.
- CircleCI configuration is prepared; no CircleCI run is claimed.
- No new Pages deployment was triggered.
- No fresh live HTTP probe or restore drill was completed.
- Existing \`fail_open\` configuration requires security review.
- SAAAE, identity, dynamic APIs, wallets, payments, monitoring and restore drills require their own execution evidence.

## Latest live verification update — 2026-11-24

This addendum supersedes the earlier point-in-time deployment statements above where they conflict.

- Cloudflare Pages preview deployment succeeded for branch `feat/master-backed-standby-mainline-2026-11-24`, commit `ef84df2f6e3ce47d4c676f7288d96bd4a0afd734`, deployment `cfbb7cae-096c-4967-a75f-cc60eeee8763`. Queued, initialize, clone, build and deploy stages all reported success.
- Preview URL: `https://cfbb7cae.thelingolegacy-static-backup.pages.dev`.
- Cloudflare Pages project now has preview deployments enabled for the feature branch. Production deployments remain disabled.
- The Pages project still names `recovery/static-backup-2026-10-24` as its production branch. Do not promote that branch.
- Cloudflare Pages `fail_open` was verified to mean whether to fail open when deployment configuration cannot be applied. It is not an Access-policy bypass. It has now been set to `false` for both preview and production and read back as `false`.
- The existing `launch.thelingolegacy.com/*` Worker route still points to the old direct-upload Worker, whose root response is pinned to the older Studio homepage. The proposed source-controlled proxy has not been deployed.
- The Pages project has no custom domains attached. The main domain continues serving the existing public game-floor homepage.
- An external browser probe could not retrieve the Pages preview; a local network probe was blocked by DNS resolution in this execution environment. Therefore live HTTP headers, routes, assets, Access behavior and visual/mobile rendering remain unverified.
- GitHub PR #665 remains open and draft. The preview deployment does not constitute merge approval or production acceptance.
- No DNS, Worker route, Access policy, production branch, production deployment setting, Firebase, Supabase, payment or customer-data changes were made.

**Current disposition:** preview deployment confirmed; deployment configuration made fail-closed; public-site acceptance, alternate CI execution, Worker review/deployment, Access review, restore drill and production promotion remain pending.
