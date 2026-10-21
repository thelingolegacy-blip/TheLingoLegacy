# DOUGHBOY'S OASIS Platform Starter

This folder is an isolated, non-production scaffold for the next implementation phase.

- `api/openapi.yaml`: versioned API contract.
- `cloudflare/worker.js`: edge routes for public catalog, fictional landmarks and health; private routes fail closed unless a trusted backend URL is configured.
- `cloudflare/wrangler.toml`: local/dev Worker settings only; no production route is declared.
- `firebase-functions/`: server-authoritative demo-DOUGH purchase callable and default-deny Firestore rules. Populate `oasisCatalog/{itemId}` through the included catalog-only seed utility. The utility does not create player balances.
- `flutter/`: cross-platform storefront/map starter. GPS is only requested after the player taps “Enable my location”; coordinates remain in memory and the map works without location.
- `../doughboys-oasis-store.html`: current web store prototype.

## Important integration gaps
The Firebase function is a callable function, while the Worker proxy expects a trusted HTTP API adapter. Do not set `OASIS_BACKEND_URL` directly to a Firebase callable endpoint without implementing and testing the protocol adapter and Firebase token verification. Until that adapter exists, keep the Worker private routes disabled.

Before deployment: install pinned dependencies, run TypeScript/Flutter checks, test Firestore rules and purchase concurrency with emulators, verify OSM tile policy and attribution, add platform-specific foreground location permission declarations, configure rate limits and allowed origins, scan secrets/dependencies, and complete security/privacy/legal/device review. No production deploy, real payments, cash-out or wagering is enabled.


## Source-control boundary
Git is the version-control protocol; GitHub PR #294 is the current canonical review authority. The root .gitlab-ci.yml is a mirror-ready validation template only. GitLab is not connected by this commit. Do not enable a second deployment authority or add production credentials to GitLab until mirror direction, branch protections and release gates are approved.
