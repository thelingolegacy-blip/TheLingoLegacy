# DOUGHBOY'S OASIS — Store, Web, Mobile, Edge and Location Integration Blueprint

**Status:** proposed implementation contract; current store is a local browser prototype. **Not production-ready.**  
**Governance:** preserve fail-closed controls. Do not enable production deployment, payments, GPS collection, account writes, cash-out, or competitive server state until the required gates pass.

## 1. Web application
- Route: `/studio-sites/games/doughboys-oasis-store.html`
- Browser experience: responsive storefront, categories for clothing/style, gear/carry, transport, fictional banking/services, tools/upgrades; local earned-DOUGH purchases; owned inventory and equip slots; simulated ledger; fictional static map and local waypoint selection.
- Persistence is localStorage only. It is not authoritative, does not sync with the game or another device, and can be edited by the user.
- Store catalog is data-driven and currently contains demo products only. Transport, tool, home-base and bank items are inventory records or concepts where their underlying gameplay system is not implemented.
- Do not present simulated balances as cash, deposits, financial accounts, or withdrawable funds.

## 2. Economy and monetization
- **Enabled in this prototype:** earned demo DOUGH only, local inventory unlocks.
- **Not enabled:** real-money purchases, subscriptions, loot boxes, real-money wagering, cash-out, deposits, credit, player-to-player transfers, or sweepstakes.
- Potential later revenue: transparent cosmetic outfits, emblems, music packs with cleared rights, optional expansions, and platform-approved subscriptions. Do not sell competitive power or make core progression pay-to-win.
- Any payment rollout requires legal/platform policy review, age and regional eligibility, price disclosure, purchase confirmation, refunds/chargebacks, tax handling, privacy review, fraud controls, receipt verification, support processes, and explicit authorization. Client-side payment status must never grant items.
- Virtual currency must be clearly separated from cash and cannot be exchanged or redeemed for value in this build.

## 3. Backend contract — Firebase
- Firebase Authentication: identity only after provider setup, abuse protection, account deletion/export and privacy notices.
- Firestore candidate collections:
  - `players/{uid}`: public-safe profile fields, schemaVersion, createdAt, updatedAt.
  - `players/{uid}/inventory/{itemId}`: itemId, quantity, equippedSlot, grantedBy, createdAt.
  - `players/{uid}/wallets/demo`: integer demo balance, version, updatedAt; never cash-equivalent.
  - `players/{uid}/ledger/{transactionId}`: signed integer delta, reasonCode, itemId, idempotencyKey, server timestamp.
  - `catalog/{itemId}`: server-controlled category, price, availability, entitlement type.
  - `events/{eventId}`: minimized telemetry, consent state and correlation ID.
- Cloud Functions (or equivalent trusted service) validate identity, catalog status, balance, ownership, idempotency key and request rate; then atomically debit demo currency, grant item and append ledger entry. The client never chooses the resulting balance.
- Firestore rules: deny client writes to wallet balance, ledger, item grants, prices, entitlements and competitive influence. Default deny; scope reads/writes to authenticated owner and approved fields. Server Admin SDK bypasses rules, so validate in every callable function.
- Add emulator tests for unauthorized access, negative/overflow amounts, duplicate requests, concurrent purchases, stale catalog, revoked items and account deletion before enabling remote writes.

## 4. Cloudflare edge/API
- Proposed route: `/api/oasis/v1/*` via Cloudflare Worker; route is not provisioned by this commit.
- Worker responsibilities: schema validation, request-size limits, CORS allowlist, abuse/rate controls, correlation IDs, safe caching for public catalog only, request redaction, and routing to trusted Firebase-backed functions.
- Never trust a client-supplied UID, balance, price, entitlement or purchase result. Verify Firebase ID tokens (issuer, audience, expiry and signature) or use a tightly scoped trusted backend connection. Do not put service-account secrets in Worker variables exposed to the client.
- Keep private player/inventory responses uncached. Do not log raw tokens, precise coordinates or sensitive profile data.
- KV may cache non-sensitive catalog metadata; R2 may store licensed static assets; D1 is optional for edge metadata/operational records, not a replacement for transactional wallet authority without a designed consistency model.
- Define API versioning, OpenAPI contract, timeout/retry budget, idempotency, error codes, health checks and rollback plan before deployment.

## 5. API shape (proposed, not live)
- `GET /api/oasis/v1/catalog?category=clothing` — public, cacheable catalog.
- `GET /api/oasis/v1/me/inventory` — authenticated, private, no-store.
- `GET /api/oasis/v1/me/ledger` — authenticated, private, paginated, no-store.
- `POST /api/oasis/v1/purchases` — authenticated; body contains only `itemId` and `idempotencyKey`; server resolves price and atomically records transaction.
- `POST /api/oasis/v1/inventory/equip` — authenticated; server validates ownership and slot.
- `GET /api/oasis/v1/map/landmarks` — fictional/static public landmarks.
- `POST /api/oasis/v1/location/unlock` — future-only, off by default; coarse location and explicit consent only.
- `GET /healthz` — non-sensitive health signal.
- Common errors: `400 INVALID_REQUEST`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 ITEM_NOT_FOUND`, `409 INSUFFICIENT_FUNDS|ALREADY_OWNED|IDEMPOTENCY_CONFLICT`, `429 RATE_LIMITED`, `503 DEPENDENCY_UNAVAILABLE`.

## 6. Flutter/mobile architecture
- Packages: `oasis_app`, `oasis_domain`, `oasis_data`, `oasis_maps`, `oasis_auth`, `oasis_store`.
- Domain interfaces: `CatalogRepository`, `InventoryRepository`, `WalletRepository`, `MapRepository`, `LocationPermissionGateway`.
- Web/local demo and Firebase-backed repositories must be separate adapters behind interfaces. Offline cache may display owned items, but must not finalize purchases; queue idempotent requests for reconnection only after server authority exists.
- Store UI: responsive category grid, item details, confirmation, purchase pending/success/failure, inventory/equip, ledger, retry state, accessible focus order, screen-reader labels and reduced motion.
- Secure config: public Firebase client config is not a secret; privileged credentials and payment secrets must never ship in Flutter assets, web bundles, Git history or client config.
- Cross-platform acceptance: iOS and Android permission flows, low-memory/resume, offline/timeout, app lifecycle, accessibility, deep links and store-policy review.

## 7. Maps and GPS privacy
- Current web map is fictional/static and uses no device location APIs.
- If GPS is implemented later: ask only after a clear user action; explain purpose; offer manual location/fictional map fallback; deny by default; request foreground/while-in-use only; prefer coarse location and geofencing on device; avoid background tracking; do not store raw coordinates unless strictly necessary and separately consented; short retention; delete/export support; no location-based advertising; no precise location in logs or analytics.
- Never gate core gameplay, purchases, safety tools or account access on GPS. Provide an obvious off switch and revoke handling. Use real maps only after provider licensing, attribution, quotas, API-key restrictions, data-processing terms and platform permissions are reviewed.
- Map provider adapter should isolate Google Maps/Mapbox/OSM-compatible provider details. Provider not selected or configured in this slice.

## 8. Git, GitHub and GitLab workflow
- Git is the source-control baseline; GitHub is the current repository and pull-request authority. GitLab is a potential mirror/secondary CI system, not currently configured by this change.
- Keep one canonical protected branch and one canonical release authority. If GitLab mirroring is approved, use a one-way mirror or explicit promotion pipeline; do not allow independent production deployments from both hosts.
- Branch naming: `feat/oasis-store-*`; pull request includes scope, migration notes, threat model, test evidence and rollback.
- CI stages: format/lint → static validation → unit tests → Firebase emulator/security-rule tests → API contract tests → dependency/license/secrets scans → build → preview → browser/device QA → signed evidence → human acceptance.
- CI should use least-privilege short-lived credentials, pinned actions, protected environments, required reviews and immutable artifacts. Keep G02 runner gate blocked until a real runner is assigned, executes steps and emits retrievable logs.
- No secret values in repo; include `.env.example` with placeholders only. Production deployment stays disabled until all gates and explicit approval pass.

## 9. Acceptance and status
- Static acceptance: page parses, catalog IDs are unique, prices are non-negative integers, category routes render, purchases are idempotent in local demo, insufficient balance cannot purchase, duplicate ownership is blocked, ledger deltas reconcile, local reset works, map is fictional and no GPS APIs are present.
- Runtime acceptance: keyboard/touch, mobile responsive, screen reader, localStorage unavailable/corrupt, race conditions, actual browser console, Flutter device tests, Firebase emulator, Worker staging and API contract suite.
- Security acceptance: authorization matrix, Firestore rules tests, token validation, abuse controls, secrets scan, privacy review, payment threat model, dependency/license review.
- Release status remains `LOCAL_PROTOTYPE`; API/backend `NOT_PROVISIONED`; GPS `OFF`; payments `DISABLED`; production `BLOCKED`.


## Starter source now present in this branch
- OpenAPI contract at games/oasis-platform/api/openapi.yaml.
- Cloudflare Worker and Wrangler config: public catalog/landmark/health routes plus fail-closed private-route proxy; no production route or backend URL is configured.
- Firebase callable purchase transaction, deny-client-write Firestore rules, catalog seed data and ADC-based catalog seed utility. The seed utility does not create wallets or balances.
- Flutter store/map starter with foreground GPS request only after a button tap; map remains usable without location. The map provider may observe tile requests for the visible area.
- Platform permission checklist and root .gitlab-ci.yml for non-deploying validation on a future mirror.
These files are source scaffolding, not deployed/verified services. The Worker must not be pointed at the Firebase callable without an adapter that verifies tokens and translates the protocol.
