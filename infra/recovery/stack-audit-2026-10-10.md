# Stack Audit — 2026-10-10

## Results from repository/API inspection

| Layer | Observed state | Gate |
|---|---|---|
| GitHub source | `thelingolegacy-blip/TheLingoLegacy`, default branch `main`; isolated recovery branch created | Source available |
| Production Cloudflare routes | Apex and www route to existing `thelingolegacy` Worker | Protected; unchanged |
| Source-to-live Worker naming | `wrangler.jsonc` names `thelingolegacyv-5`, while live apex/www routes target `thelingolegacy` | BLOCKED — reconcile only after reviewing source/version intent |
| New sandbox | `lingo-recovery-sandbox-2026-10-10`, `workers.dev` enabled, preview URLs disabled, zero bindings | Created; runtime probe pending |
| Sandbox source/config | `infra/recovery/sandbox-worker.js` and `wrangler.recovery.jsonc` committed to the isolated branch | Source scaffold available |
| Firebase client config | `firebase.client.json` contains placeholder API key, sender ID, and app ID | BLOCKED |
| Firebase Hosting config | `firebase.json` uses `public: "."` | BLOCKED — repository root is too broad to publish safely |
| Flutter | Root `pubspec.yaml` exists with Firebase packages | Build not run; no connected Flutter shell/toolchain |
| Backend | Separate `nextjs-lingolegacy` Worker has a D1 binding and Access public-bypass configuration was observed in prior read-only audit | Security review required; do not add public route |
| CI runner | G02 runner execution evidence still absent; the new Recovery Sandbox Audit run failed before steps were instantiated (`steps=null`, `logs_url=null`) | BLOCKED |
| Cache cleanup | No production cache purge performed | Audit-first |
| Vercel alternative | Project reports `live=false`; latest production-target deployment is `READY` | Not a verified active origin |
| AppDeploy alternative | Existing project snapshots were previously recorded ready, but deployment quota was previously exhausted | Do not rely on new deployment capacity without verifying quota |

## Sandbox deployment evidence

- Worker: `lingo-recovery-sandbox-2026-10-10`
- Deployment ID: `3cb43f72-2e3d-4ff6-aa9d-31552290cea0`
- Version ID: `e9d59f4f-9d9f-40d7-b507-7e3c9453e3b7`
- Cloudflare API upload: HTTP 200; active deployment reports 100% on the new version.
- Workers.dev subdomain: enabled; preview URLs disabled.
- Bindings: none; no secrets, D1/KV/R2, custom domains, or production routes.
- Production route inventory rechecked after creation: apex and www still target `thelingolegacy`; no sandbox production route exists.
- Independent HTTP verification is pending because the available fetch environment blocks requests to this host; its 403 is a tool egress policy response, not proof of the Worker response.

## Sandbox endpoints

- `/healthz` — JSON health response, `Cache-Control: no-store`.
- `/readyz` — readiness response; explicitly reports that promotion and production routes are disabled.
- Other paths return JSON 404.

## Required repairs before original connection can be restored

1. Reconcile `wrangler.jsonc` Worker name `thelingolegacyv-5` with the actual live apex/www route target `thelingolegacy`. Do not blindly rename or change the production route.
2. Replace Firebase placeholders only after confirming the correct Firebase project and Web App in the Firebase Console.
3. Change Firebase Hosting output to a dedicated built directory, not repository root. For Flutter Web, build into `build/web` and deploy only that directory after review.
4. Confirm Firebase Auth providers, Realtime Database/Firestore rules, Storage rules, Functions, app origins, and OAuth domains; do not print or commit service-account credentials.
5. Install/use an authorized Flutter SDK host and run `flutter pub get`, `flutter analyze`, and `flutter build web --release`; record exit codes and logs.
6. Test API/Worker authentication and tenant scoping before exposing any D1-backed endpoints.
7. Independently probe the sandbox from a browser or shell outside the connector egress environment.
8. Keep the apex/www production routes unchanged until all evidence is correlated and accepted.

No production DNS, route, Access policy, Firebase resource, database, or cache mutation was performed.
