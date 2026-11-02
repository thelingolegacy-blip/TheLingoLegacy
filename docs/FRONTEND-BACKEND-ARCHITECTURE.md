# LINGOlegacy Frontend, Backend and Edge Architecture

## Canonical platform direction

- **Source and CI:** GitHub, with pull-request checks and immutable build artifacts.
- **Production edge and web delivery:** Cloudflare Workers, Pages, DNS, CDN and security controls.
- **Mobile:** Flutter for iOS and Android.
- **Identity and application services:** Firebase only after project/app registration, security rules and environment separation are verified.
- **Structured world and knowledge metadata:** Cloudflare D1.
- **Cache:** Cloudflare KV for non-authoritative, TTL-bound data.
- **Media and approved documents:** Cloudflare R2.
- **AI retrieval:** Workers AI and Vectorize behind explicit policy, consent, cost and feature gates.
- **Preview/studio delivery:** Existing AppDeploy applications; a preview being deployed does not certify the Cloudflare production release.
- **Creative and design:** Figma, Adobe and Canva; exported assets must pass provenance, rights and asset-manifest checks.

Vercel is not the approved production deployment target for this architecture.

## Product surfaces

The LINGOlegacy Studio Hub is the ecosystem gateway. Product-specific surfaces remain separately registered and owned by the canonical product tree: LINGOlegacy, LINGOlane, LINGOslots, LINGOarcade, LINGOlibrary, LINGOmedia and LINGOworld.

Every surface must declare a canonical product ID, owner, repository path, source commit, runtime, environment, public route, API contract, identity requirements, data classification, asset-rights manifest, support owner, release gate and rollback target.

## Environment separation

Use distinct development, staging and production resource identifiers. Never point a staging build at the production D1 database, Firebase project, R2 bucket, KV namespace, payment provider or secret set. Production IDs are injected through protected deployment configuration; they are not copied into preview manifests.

## Data flow

`Flutter / Web → Cloudflare Edge → authenticated Worker API → D1 metadata / R2 objects / KV cache / AI retrieval`

Firebase Auth may provide identity tokens where configured. The Worker must verify issuer, audience, signature, expiry and entitlement claims before authorizing writes. A client-side feature flag is never an authorization boundary.

## Service responsibilities

- **D1:** authoritative world registry, immutable versions, knowledge metadata, feature flags, idempotency and audit records.
- **KV:** non-authoritative cache only, namespaced by environment and schema version with explicit TTLs.
- **R2:** media and approved documents with MIME, size, hash, rights and provenance checks.
- **Workers AI / Vectorize:** governed retrieval and inference, disabled by default until privacy, cost, access and safety gates pass.
- **Firebase:** identity/mobile services only after app registration and security rules are verified.
- **AppDeploy:** isolated preview and Studio surfaces; not a substitute for production release acceptance.

## Reliability and fallback

- Public static content may use a versioned offline cache.
- Private, authenticated, API, payment and user-specific responses must not be cached by the service worker.
- KV cache misses fall back to D1; D1 failures fail closed for mutations.
- R2 media failure falls back to a known approved asset or explicit unavailable state.
- AI failure falls back to deterministic search/help content; never fabricate a successful AI response.
- Firebase unavailability must not create anonymous elevated access.
- Payment provider or webhook failure never grants entitlements.
- Release-gate failure stops promotion and preserves last-known-good.

## Release sequence

`DISCOVER → DESIGN → SPECIFY → IMPLEMENT → TEST → BUILD → DEPLOY CANDIDATE → LIVE PROBE → CERTIFY → AUTHORIZE → ACTIVATE`

No production mutation occurs before independent acceptance and explicit release authorization.
