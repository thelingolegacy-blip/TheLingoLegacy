# Firebase Hosting scope — contract-only boundary

**Status:** Firebase Hosting is intentionally not configured in this repository.

The canonical LINGO web production delivery path is GitHub-reviewed source and release evidence flowing to Cloudflare Workers. Firebase remains an application-services contract for explicitly assigned identity/data capabilities; it is not an alternate web-hosting or production-delivery path.

The previous root `firebase.json` declared `hosting.public: "."`, which could publish the repository root if a Firebase Hosting deployment were invoked. That target is removed. Do not replace it with another directory until a separately reviewed product requirement, allowlisted build output, privacy/security scan, and deployment authority are documented.

## Controls

- `firebase.json` intentionally contains no `hosting` configuration.
- Run `node scripts/verify-firebase-hosting-scope.mjs` to fail if a Hosting target is reintroduced.
- Run `node scripts/test-firebase-hosting-scope.mjs` for positive and negative contract tests.
- Firebase Auth, Firestore, Storage, App Check, and other application services are not disabled by this change.
- This repository change does not alter a Firebase project, deployed resource, Cloudflare Worker, DNS record, secret, or production route.

A passing static contract check is not proof that Firebase credentials, app registrations, rules, or runtime integration are configured.
