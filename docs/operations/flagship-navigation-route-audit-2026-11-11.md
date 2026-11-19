# Flagship Navigation Route Audit

**Date:** 2026-11-11  
**Source of truth inspected:** `thelingolegacy-blip/TheLingoLegacy` `main` tree at `aaa9cd8462ced19ea86cb4d8bfd21672409c8b6e`  
**Live surface inspected:** https://thelingolegacy.com/

## Finding

The public homepage is live, but its catalog is not fully reconciled with the canonical GitHub route tree. Several catalog links in the current Cloudflare exact-root Worker source point to paths that do not exist in the current GitHub tree, while corresponding canonical product pages exist at root-level paths.

This is a source/route reconciliation issue. It is not proof that those paths currently return 404 in the deployed asset bundle; the live subpath responses could not be independently fetched in this inspection environment. Confirm with a browser/HTTP smoke test before claiming an outage or changing production routes.

## Route mapping

| Catalog destination | Current root-Worker href | Canonical GitHub route | Disposition |
|---|---|---|---|
| The Lingo Legacy HQ | `/studio-sites/` | `/studio-hub/` and `/studio-sites/` | Existing routes; confirm intended destination |
| Loyalty Lane Apparel | `/studio-sites/loyalty-lane-apparel/` | `/loyalty-lane-apparel/` | Current href has no matching tree path; use canonical root-level page |
| KOTTONSCODE | `/studio-sites/kottons-code/` | `/kottons-code/` | Current href has no matching tree path; use canonical root-level page |
| That's My Lingo | `/studio-sites/lingoslots/#play` | `/thats-my-lingo/` and `/studio-sites/lingoslots/` | Both source routes exist; prefer product-specific route after functional QA |
| LINGOarcade | `/studio-sites/lingoarcade/` | `/lingoarcade/` and `/studio-sites/lingoarcade/` | Both source routes exist; confirm canonical product entry |
| LINGOslots | `/studio-sites/lingoslots/` | `/studio-sites/lingoslots/` | Existing source route |
| LINGO Nexus | `/studio-sites/` | `/studio-sites/play/` | Game-discovery destination exists; verify desired Nexus semantics |
| LINGOmedia | `/studio-sites/virtual-music-studio/` | `/media/` | Current href has no matching tree path; use media hub |
| LINGOlibrary | `/studio-sites/virtual-library/` | `/library/` | Current href has no matching tree path; use library hub |
| Virtual Cinema | `#module-info` | No dedicated cinema route found | Keep as explicitly planned until a real destination is built |
| askLINGO | `#ask-l-dock` | `/ai/` | Existing AI route; verify dock integration before linking |
| LINGO ID | `#module-info` | `/account/` exists | Identity is still a stub; do not activate account actions |
| Universal Legacy Wallet | `#module-info` | No wallet route found | Keep gated until secure authoritative wallet is provisioned |
| Creator Marketplace | `#module-info` | No marketplace route found | Keep planned until product and transaction flows are built |
| Community Laundromat Hub | `/studio-sites/loyalty-lane-cycle/` | `/loyalty-lane-cycles/` | Current href has no matching tree path; use canonical root-level page |
| Doughboys Oasis | `#module-info` | `/studio-sites/games/doughboys-oasis-vertical-slice.html` | Link only as a preview/vertical slice, not a production launch |
| LINGOworld | `#module-info` | `/worlds/` | Existing world directory; verify its current page purpose |
| Business & Services | `/studio-sites/loyalty-lane-designs/` | `/lane/` | Current href has no matching tree path; verify Lane page content before remapping |
| Invest & Partner | `#module-info` | No dedicated partner route found | Keep planned until a verified page and contact workflow exist |
| Support Center | `#ask-l-dock` | `/beta-support/` and `/contact/` | Existing support/contact routes; verify which should be primary |

## Recommended implementation

1. Track the exact-root Worker source in GitHub as a separate Cloudflare Worker entry point. The current exact-root Worker source is not represented by a clearly named, independently buildable source directory in the repository.
2. Replace only the stale hrefs whose canonical destinations have been confirmed in the route tree.
3. Keep wallet, identity, marketplace, cinema, and investment actions in a planned/disabled state until their respective service and legal/security gates pass.
4. Label the Doughboys Oasis page as a preview/vertical slice until game QA and production backend gates pass.
5. Add automated internal-link checks that compare all public navigation hrefs against the generated static asset tree.
6. Preview and test all changed destinations before any production promotion.

## Release constraint

No production route, Worker version, DNS record, Firebase Hosting target, payment service, identity service, or wallet service is changed by this audit. The root Worker preview remains unpromoted pending functional QA and release evidence.


## Preview candidate uploaded

The route corrections are now implemented in the source-tracked exact-root Worker candidate at `cloudflare/flagship-root/worker.js` on PR #548. Cloudflare accepted it as preview version 3 (`fa6ca7f6-7431-4d22-885d-782c5c9e3631`) with alias `flagship-nav-repair-2026-11-11`. It is not deployed to production. The active root deployment remains version 1 at 100% traffic. Independent browser QA of the preview URL is still required.
