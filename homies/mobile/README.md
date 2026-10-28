# Homies Mobile (Expo)

**Status: isolated application scaffold; not production-ready or release-certified.**

## Run locally
From this directory:

```sh
npm install
npx expo install --check
npm run typecheck
npx expo start
```

Use a compatible Expo Go version or a development build for the selected Expo SDK. Align Expo-managed packages with `npx expo install` and commit a reproducible lockfile before team use.

## Included
- Expo Router root stack and five tabs: Explore, Map, Chat, Circles, Profile
- Crimson/charcoal NativeWind tokens
- Reusable accessible Button and Grok floating action button
- Explore, map, chat list, circles, profile, Grok, paywall, conversation, and profile route scaffolds
- React Query provider and safe-area/status-bar setup

## Explicitly not connected
Authentication/session refresh, discovery/profile API, map provider or location permissions, chat API/WebSocket, Grok/xAI streaming, Stripe/Apple IAP/Google billing, media upload/moderation, push notifications, and analytics.

The Grok composer and paywall are intentionally disabled in this scaffold. No provider secrets belong in the app. Never present placeholder cards as live users or client-side entitlement state as proof of payment.

## Before device or production acceptance
1. Install dependencies and commit a reproducible lockfile.
2. Run typecheck and Expo platform bundling checks in CI with real logs.
3. Run iOS and Android simulator/device smoke tests.
4. Test navigation, accessibility labels, loading/error/empty states, and privacy-sensitive screens.
5. Connect documented authenticated API and server-authorized WebSocket contracts.
6. Implement consent, block/report UX, account deletion, retention, and age eligibility.
7. Add backend-enforced billing entitlements and store receipt validation.
8. Complete security, accessibility, load, legal, and independent release-gate reviews.

This directory is a frontend starting point only. Its presence does not establish a successful Expo build or production readiness.
