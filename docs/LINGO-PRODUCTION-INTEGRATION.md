# LINGOlegacy Production Integration

## Target architecture

Browser / Flutter app -> Cloudflare Edge Worker -> LINGOlegacy assets + API -> Firebase services.

Commerce remains isolated behind Shopify checkout and fulfillment integrations. Tapstitch connects to Shopify for product publishing, order synchronization, inventory and fulfillment. Stripe is the payment layer configured through Shopify/approved payment configuration or existing Worker checkout endpoints where explicitly enabled.

## Domains

- Canonical: https://thelingolegacy.com
- Alias: https://www.thelingolegacy.com
- Current Cloudflare design: both hostnames are routed through the LINGOlegacy Worker; the Worker canonicalizes www to root.

Do not replace existing DNS records with guessed values. Cloudflare already owns the active zone and the current records must be verified before promotion.

## Flutter + Firebase

Firebase project target is `lingo-legacy-production`. The repository's `lib/firebase_options.dart` currently contains placeholder client credentials, so Firebase client activation is NOT certified until real project configuration is supplied and a Flutter build proves Auth/Firestore initialization.

Required production checks:
1. FlutterFire configuration for web/iOS/Android.
2. Firebase Auth initialization.
3. Firestore read/write smoke test in a non-production test path.
4. Edge API contract test against `/api/v1/runtime` and `/api/v1/platform/status`.
5. Correlate build, deployment, runtime and Firebase evidence.

## Loyalty Lane migration

`loyaltylaneapparel.square.site` can be retired as the primary storefront after the Shopify store is populated and verified. Shopify provides a Square migration path using product CSV import and optional customer/order migration. The Square URL itself is controlled by Square; it cannot simply be renamed from inside Shopify. The intended target is a Shopify storefront branded **LOYALTY LANE APPAREL**, with the existing Square address redirected/retired only after migration verification.

Tapstitch should be connected to the Shopify store so products, orders, inventory and fulfillment can synchronize. Stripe should be configured only after the merchant's Shopify/payment configuration is verified.

## Gate discipline

This branch is an implementation artifact only. It does NOT authorize production promotion. G02 runner evidence remains the controlling prerequisite for CI execution, certification and deployment. No production DNS cutover, Firebase activation, payment activation, or Shopify/Square retirement should be treated as PASS without independently verified evidence.
