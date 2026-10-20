# Firebase Emulator Suite tests

This directory contains **test-only security-rule fixtures** and tests. These fixtures are not the production security rules and must never be deployed.

## Isolation guarantees

- Firebase project ID is fixed to `demo-lingo-legacy-emulator`.
- The workflow invokes the Firebase CLI with that explicit demo project.
- The canonical `firebase.json`, `.firebaserc`, and production deployment workflow are not modified.
- The workflow has read-only repository permissions and no deploy job.
- The existing G02 self-hosted runner workflow is not changed or bypassed.

## Run locally

Requires Node.js 20+, Java 21+, and network access to download the Firebase CLI/emulator artifacts.

```sh
npm install --prefix tests/firebase-emulator --ignore-scripts --no-audit --no-fund
npx --yes firebase-tools@13.35.1 emulators:exec \
  --config firebase.emulator.json \
  --project demo-lingo-legacy-emulator \
  --only auth,firestore,storage \
  "npm test --prefix tests/firebase-emulator"
```

The test suite checks Auth emulator account creation, Firestore profile ownership, denial of client wallet writes, Storage ownership, invalid avatar content types, and denial of client product-media writes.

## Coverage limitation: Cloud Functions

The repository audit did not find a product Cloud Functions source tree or package manifest. The workflow records Cloud Functions coverage as **BLOCKED** instead of creating a fake function and claiming product coverage. Add function-emulator tests only after the actual backend source and its supported test entry point are identified.

## Production rules

No production Firestore or Storage rules were found at the expected root paths during the initial audit. The rules in this directory are fixtures to validate the proposed policy shape, not evidence that production data is secured. Production rule creation, review, and deployment remain separate gated work.
