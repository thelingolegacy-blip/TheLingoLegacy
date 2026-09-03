# Production Integration Audit

## Status

The Cloudflare-first production runtime is verified live through the current release gate. The production Worker serves the dynamic runtime/API surface, while GitHub remains source control and CI/evidence and the controlled local Wrangler executor is the production release path.

## Verified

- Primary production domain: `https://thelingolegacy.com`
- Deployment provider: Cloudflare
- Dynamic runtime endpoints: `/healthz`, `/api/v1/runtime`, `/api/v1/platform/manifest`, `/api/v1/platform/status`
- Consolidated live-probe contract: reported PASS for `/`, `/healthz`, `/api/v1/runtime`, `/api/v1/platform/manifest`
- Platform-status endpoint is included in the controlled production probe set
- Local production executor: `scripts/deploy-production.mjs`
- Production deploy requires explicit `--execute` and fails closed on preflight/probe failures

## Dynamic Platform Status

`/api/v1/platform/status` is the governed, non-secret runtime status contract. It exposes operational states without exposing credentials, tokens, service-account material, or provider secrets.

The endpoint deliberately reports Firebase and application services as `unverified` until authoritative production bindings are proven. This prevents the frontend, Flutter clients, and studio control surfaces from treating planned integrations as live integrations.

## Firebase Gate

Firebase remains an integration hard-lock, not a claimed active production binding. The repository environment contract declares the required public Firebase configuration keys, but repository declarations do not prove that the authoritative Firebase project, Auth configuration, Firestore rules, Storage rules, backups, and environment separation are connected to production.

Required verification before activating Firebase-backed writes or identity:

1. Confirm the authoritative Firebase project from the owning Firebase console.
2. Confirm production Web/App configuration values through the owning provider, without committing secrets.
3. Verify Firebase Auth providers and authorized domains.
4. Verify Firestore security rules and production database mode.
5. Verify Storage rules and production bucket.
6. Verify backup/restore posture and environment separation.
7. Verify Cloud Functions/service integrations if used.
8. Run authenticated read/write smoke tests using non-production test identities/data.
9. Record only non-secret resource identifiers and evidence in the release record.

The repository environment contract explicitly prohibits service-account JSON, private keys, API tokens, passwords, raw webhook secrets, and payment-provider secret keys from source control. See `config/production/env-contract.json`.

## Application Services Gate

Lingo ID, Universal Wallet, XP, Rewards, leaderboards, cloud saves, commerce, and Flutter synchronization must remain behind explicit service contracts until their authoritative production bindings are verified. Missing resource IDs are treated as unknown, not synthesized.

## Safety Gate

The following remain disabled by policy:

- Real-money gameplay
- Cash-out flows
- Harmful bypass behavior

Deployment hardening does not override these controls.

## AppDeploy

AppDeploy remains non-authoritative for production runtime because the provider's Free-plan lifetime deployment quota is exhausted. No quota bypass is used. Existing deployment assets can remain available while Cloudflare remains the production runtime authority.

## Next Evidence Required

- Controlled local Wrangler dry-run and production deployment evidence for the current `production-deploy` commit
- Five-route live-probe evidence: `/`, `/healthz`, `/api/v1/runtime`, `/api/v1/platform/manifest`, `/api/v1/platform/status`
- Authoritative Firebase project/binding evidence
- Authenticated Firebase smoke-test evidence
- Cloudflare production binding inventory from the owning account
- Versioned rollback/deployment evidence
- Frontend route/interaction/accessibility/performance evidence
- Flutter-to-production API contract evidence
