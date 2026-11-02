# LINGOlegacy Flutter + Firebase + Cloudflare Roadmap

## Current verified state

- Flutter/Firebase repository scaffolding exists.
- `.firebaserc` currently points to `lingo-legacy-production`.
- `lib/firebase_options.dart` still contains placeholder API keys and app IDs.
- The Flutter/Firebase integrity verifier correctly blocks while placeholders remain.
- The separate Cloudflare `world-engine-db` D1 database was inspected and has no application tables.
- Production Workers and routes remain protected; no new resource bindings are active.
- Mobile store registration, signing and publication are not verified.

## Target architecture

| Capability | Target | Authority |
|---|---|---|
| Mobile client | Flutter | Signed release artifacts |
| Identity | Firebase Auth, after registration | Verified server-side token |
| User-owned application records | Firebase or approved API model | Authenticated service |
| World registry and internal KB metadata | Cloudflare D1 | Worker API |
| Non-authoritative cache | Cloudflare KV | TTL-bound cache |
| Media and approved documents | Cloudflare R2 | Rights-aware upload pipeline |
| AI retrieval | Workers AI + Vectorize | Consent, access and cost gates |
| Public edge and routing | Cloudflare | Protected production configuration |
| Source/build | GitHub Actions | Verified execution evidence |

## Required implementation sequence

1. Create a dedicated Firebase staging project or confirm an existing non-production project.
2. Register distinct web, Android and iOS Firebase apps; record real app IDs and non-secret client configuration.
3. Configure Firebase Auth providers and restrictive Firestore/Storage rules only where those products are actually needed.
4. Build Flutter environment configuration that fails closed when required values are missing; never commit private keys or signing material.
5. Apply the world-engine D1 migration locally, test rollback/forward-fix and validate schema.
6. Provision staging-only D1/KV/R2/Workers AI/Vectorize resources, then add their IDs as environment-specific bindings.
7. Implement Worker authorization, audit, idempotency, rights checks and API contracts before connecting clients.
8. Run web, Flutter, Firebase emulator, D1 local and security tests.
9. Produce signed iOS and Android release candidates from an accepted commit.
10. Complete store metadata, privacy disclosures, age/content ratings, screenshots, support and privacy URLs.
11. TestFlight and Google Play internal testing; staged rollout only after acceptance.
12. Production route/resource changes require a separately authorized release plan and rollback.

## Safety and cost controls

- Keep AI, payment processing, SMS, location and public user-generated publishing disabled until each has a separate acceptance record.
- Use Cloudflare free-tier resources only within current account quotas; confirm quotas and billing before provisioning or enabling billable products.
- Do not rely on a free-tier promise for availability, global rate limits, data retention or production SLA.
- Use no real-money wagering, cash-out or financial-value prizes in game surfaces.
- Never place Firebase Admin credentials, store signing keys, Stripe secrets or Cloudflare API tokens in source control.
