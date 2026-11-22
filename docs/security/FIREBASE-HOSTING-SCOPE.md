# Firebase Hosting publication boundary

**Decision:** Firebase Hosting is intentionally unconfigured in this repository. Cloudflare Workers remain the canonical web delivery path. Firebase may provide explicitly assigned application services, but this repository does not authorize Firebase Hosting publication.

The previous `firebase.json` declared `hosting.public: "."`, which could publish repository-root files if a Hosting deployment were invoked. This change removes that unsafe target rather than selecting an unverified replacement directory.

## Controls

- `firebase.json` contains no `hosting` key.
- `scripts/verify-firebase-hosting-scope.mjs` fails closed if a Hosting key is reintroduced.
- `scripts/test-firebase-hosting-scope.mjs` covers valid service-only configuration and invalid Hosting scopes.
- Flutter web build output is checked at `build/web/index.html`; it is not automatically deployed.
- Firebase Auth, Firestore, Storage, App Check, app registrations, project identity, and security rules are not certified by this boundary.

## Acceptance

Run the scope verifier and its tests, then run Flutter dependency resolution, analysis, tests, and web build on the exact reviewed commit. Confirm the deployed canonical web origin remains Cloudflare-managed. Do not deploy Firebase Hosting or change provider resources under this contract.
