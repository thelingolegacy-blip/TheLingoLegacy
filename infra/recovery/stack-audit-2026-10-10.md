# Stack Audit — 2026-10-10

## Results from repository/API inspection

| Layer | Observed state | Gate |
|---|---|---|
| GitHub source | `thelingolegacy-blip/TheLingoLegacy`, default branch `main`; isolated recovery branch created | Source available |
| Production Cloudflare routes | Apex and www route to existing `thelingolegacy` Worker | Protected; unchanged |
| New sandbox | `lingo-recovery-sandbox-2026-10-10`, `workers.dev` enabled, preview URLs disabled, zero bindings | Created; runtime probe pending |
| Production frontend Worker | `wrangler.jsonc` identifies `thelingolegacyv-5` and `worker.js`; configured apex/www routes remain unchanged | Configuration observed |
| Firebase client config | `firebase.client.json` contains placeholder API key, sender ID, and app ID | BLOCKED |
| Firebase Hosting config | `firebase.json` uses `public: "."` | BLOCKED — repository root is too broad to publish safely |
| Flutter | Root `pubspec.yaml` exists with Firebase packages | Build not run; no connected Flutter shell/toolchain |
| Backend | Separate `nextjs-lingolegacy` Worker has a D1 binding and Access public-bypass configuration was observed in prior read-only audit | Security review required; do not add public route |
| CI runner | G02 runner execution evidence still absent | BLOCKED |
| Cache cleanup | No production cache purge performed | Audit-first |

## Sandbox endpoints

- `/healthz` — JSON health response, `Cache-Control: no-store`.
- `/readyz` — readiness response; explicitly reports that promotion and production routes are disabled.
- Other paths return JSON 404.
- No D1/KV/R2 bindings, secrets, custom domains, or production routes are configured.
- The Cloudflare API confirmed the Worker upload and workers.dev enablement. Independent HTTP verification is pending because the available fetch environment blocks requests to this host; its 403 is a tool egress policy response, not proof of the Worker response.

## Required repairs before original connection can be restored

1. Replace Firebase placeholders only after confirming the correct Firebase project and Web App in the Firebase Console.
2. Change Firebase Hosting output to a dedicated built directory, not repository root. For Flutter Web, build into `build/web` and deploy only that directory after review.
3. Confirm Firebase Auth providers, Realtime Database/Firestore rules, Storage rules, Functions, app origins, and OAuth domains; do not print or commit service-account credentials.
4. Install/use an authorized Flutter SDK host and run `flutter pub get`, `flutter analyze`, and `flutter build web --release`; record exit codes and logs.
5. Test the API/Worker authentication and tenant scoping before exposing any D1-backed endpoints.
6. Independently probe the sandbox from a browser or shell outside the connector egress environment.
7. Keep the apex/www production routes unchanged until all evidence is correlated and accepted.

No production DNS, route, Access policy, Firebase resource, database, or cache mutation was performed.
