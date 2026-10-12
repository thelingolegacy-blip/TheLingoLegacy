# Stack Audit — 2026-10-10

## Results from repository/API inspection

| Layer | Observed state | Gate |
|---|---|---|
| GitHub source | `thelingolegacy-blip/TheLingoLegacy`, default branch `main`; isolated recovery branch created | Source available |
| Production Cloudflare routes | Apex and www route to existing `thelingolegacy` Worker | Protected; unchanged |
| Source-to-live Worker naming | `wrangler.jsonc` names `thelingolegacyv-5`, while live apex/www routes target `thelingolegacy` | BLOCKED — reconcile only after reviewing source/version intent |
| New sandbox | `lingo-recovery-sandbox-2026-10-10`, `workers.dev` enabled, preview URLs disabled, no database/storage bindings | Deployed; independent runtime probe pending |
| Cloudflare Git connection | Repository connection restored/updated for GitHub repo ID `1279436411`; connection UUID `da80dc1d-3b08-4fbd-bfc6-4645156558c9` | API PASS |
| Cloudflare build | Build `2bb69a60-708b-45dd-b13f-a81d36124641`, pinned commit `67fb8eb73c6a1552416ae6acb0d109106bfdb9a2`, outcome `success` | PASS |
| Deployed sandbox version | `caf4b7f9-ee55-4eb4-87f0-0c5714fd3d15` (latest); prior versions `7e7a83d2-b4c5-48e9-9939-c1d01e136a0a`, `fc2767b9-3503-46b9-a82d-2d59c4db609d` | Cloudflare build/deploy logs PASS |
| Sandbox runtime response | Available web/connector fetch tools reject this hostname before a Worker response can be verified | UNVERIFIED |
| Firebase client config | `firebase.client.json` contains placeholder API key, sender ID, and app ID | BLOCKED |
| Firebase Hosting config | Draft branch now serves only `build/web` and rewrites Flutter routes to `/index.html` | CONFIG FIX IN DRAFT — not merged or deployed; Firebase client placeholders still block deployment |
| Flutter | Root `pubspec.yaml` exists with Firebase packages | Build not run; no connected Flutter shell/toolchain |
| Backend | Separate `nextjs-lingolegacy` Worker has a D1 binding and Access public-bypass configuration was observed in prior read-only audit | Security review required; do not add public route |
| CI runner | G02 runner execution evidence still absent; the GitHub Recovery Sandbox Audit run failed before steps were instantiated (`steps=null`, `logs_url=null`) | BLOCKED |
| Cache cleanup | No production cache purge performed | Audit-first |
| Vercel alternative | Project reports `live=false`; latest production-target deployment is `READY` | Not a verified active origin |
| AppDeploy alternative | Existing project snapshots were previously recorded ready, but deployment quota was previously exhausted | Do not rely on new deployment capacity without verifying quota |

## Sandbox deployment evidence

- Worker: `lingo-recovery-sandbox-2026-10-10`
- Initial API deployment ID: `3cb43f72-2e3d-4ff6-aa9d-31552290cea0`
- Cloudflare Workers Builds build UUID: `2bb69a60-708b-45dd-b13f-a81d36124641`
- Source commit: `67fb8eb73c6a1552416ae6acb0d109106bfdb9a2`
- Build outcome: `success`
- Deployed version: `fc2767b9-3503-46b9-a82d-2d59c4db609d`
- All three build logs include `RECOVERY_SANDBOX_SOURCE_VALIDATION=PASS`, `Success: Build command completed`, `Deployed lingo-recovery-sandbox-2026-10-10`, and `Success: Deploy command completed`.
- Workers.dev subdomain: enabled; preview URLs disabled.
- Bindings are limited to non-secret text flags `RECOVERY_SANDBOX=true` and `PRODUCTION_PROMOTION=disabled`; no D1/KV/R2, secrets, custom domains, or production routes.
- Production route inventory rechecked after deployment: apex and www still target `thelingolegacy`; no sandbox production route exists.
- Independent HTTP verification is pending because the available fetch environment blocks requests to this host before returning Worker content. Do not interpret that fetch block as the Worker status.

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
