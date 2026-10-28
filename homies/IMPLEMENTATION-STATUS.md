# Homies implementation status

Last updated: 2026-10-27  
Branch: `feature/homies-design-system-grok`  
Release state: **NOT RELEASE-CERTIFIED / NO PROMOTION**

| Workstream | Source implementation | Verification status |
|---|---|---|
| PostgreSQL/PostGIS schema | `homies/database/001_initial_schema.sql` | Not executed against PostgreSQL/PostGIS |
| Design tokens, icons, buttons, tabs | `homies/design-system/` | Static test execution pending |
| Next.js web companion | `homies/web/` | Preview scaffold committed; dependency install, lint, typecheck, production build, accessibility audit, and browser smoke tests not run |
| Expo mobile app shell | `homies/mobile/` | Source committed; dependency install, typecheck, Expo bundling, and device smoke tests not run |
| Grok service | Contract documented; mobile preview screen added | Provider and streaming backend not connected |
| Chat and profile routes | UI scaffolds added | Authenticated API and WebSocket services not connected |
| Paywall | Preview-only screen | Billing and store receipt validation not connected |
| CI workflow | Path-scoped workflow added | Latest observed run ended in startup_failure with zero jobs/artifacts |
| G02 / release gates | Existing canonical runbooks retained | G02 remains blocked; no gate bypass or promotion |

## Explicitly not claimed
- No successful Expo install, TypeScript check, bundling, simulator, or device run is claimed.
- The SQL migration has not been executed against a PostgreSQL/PostGIS server.
- No xAI provider endpoint, authenticated chat service, payment webhook, or IAP validation is connected.
- No browser/device accessibility audit or production security/load audit has been performed.
- No G02 acceptance, merge, deployment, or production promotion is authorized.

## Mobile app scaffold
The isolated Expo Router app lives under `homies/mobile/`. It includes a package manifest, Expo/TypeScript/Babel/Metro/NativeWind configuration, a React Query provider, five tabs (Explore, Map, Chat, Circles, Profile), a reusable button, a Grok floating action button, and preview routes for Grok, paywall, conversation, and public profile.

The preview deliberately does not fabricate live profiles or conversations. Grok send and paywall checkout are disabled until secure backend contracts are connected. No client app should contain provider API keys or treat client state as authoritative payment entitlement.

## GitHub Actions evidence
The latest observed Homies workflow run `40610896298` ended in `startup_failure`, with zero jobs and zero artifacts. The test steps did not execute. This establishes a failure before observable job execution but does not prove its root cause. Do not claim a test pass until a real job executes and logs are retrievable.

## Exit criteria
1. Install dependencies and generate/commit a reproducible lockfile.
2. Run TypeScript and Expo platform bundling checks; retain logs tied to the commit.
3. Validate SQL in a disposable PostgreSQL/PostGIS instance.
4. Add app-level component, accessibility, and integration tests.
5. Implement authenticated API and server-authorized WebSocket membership checks.
6. Implement consent-aware Grok streaming with server-side credentials, rate limits, cancellation, and deletion.
7. Implement backend-authoritative Stripe/IAP entitlements and verified webhooks/receipts.
8. Complete mobile security, privacy, accessibility, load, and legal reviews.
9. Keep all release gates fail-closed until independent evidence supports each acceptance decision.
