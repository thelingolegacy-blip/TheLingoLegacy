# Master-backed LINGO Legacy standby launch

**Prepared:** 2026-11-24  
**Canonical source:** \`thelingolegacy-blip/TheLingoLegacy\`, \`main\`  
**Standby Pages project:** \`thelingolegacy-static-backup\`  
**Pages build root:** \`static-site\`

## Scope

Create a one-page LINGO Legacy public front door and a separately hosted static standby while preserving the existing curated route set. The static content is copied from the current canonical \`main\` tree for the 68 existing public files that were already part of the curated standby. Only those curated paths are mirrored; internal admin, governance, operations, source and private data paths are not copied into the public Pages root.

The former backup homepage is preserved at \`static-site/legacy-home/index.html\`. The portfolio manifest is a public navigation registry and explicitly distinguishes portfolio/planned/showcase entries from live products. It does not claim that all services are deployed.

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

## Honest status

- The canonical GitHub Actions job-admission failure is not repaired by this static-site work.
- CircleCI configuration is prepared; no CircleCI run is claimed.
- No new Pages deployment was triggered.
- No fresh live HTTP probe or restore drill was completed.
- Existing \`fail_open\` configuration requires security review.
- SAAAE, identity, dynamic APIs, wallets, payments, monitoring and restore drills require their own execution evidence.

**Disposition:** source preparation and reconciliation only; not accepted for public failover.
