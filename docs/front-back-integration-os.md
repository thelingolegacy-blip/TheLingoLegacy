# Front-to-Back Integration OS

This is the integration blueprint for LINGO Legacy across Flutter, Firebase, GitHub, Cloudflare Workers, storage, and studio pipelines. It documents target architecture and guardrails; it does not activate backend writes, payments, advertisements, Firebase writes, DNS changes, or external storage.

## Verified source/release posture

- GitHub repository: `thelingolegacy-blip/TheLingoLegacy`.
- Intended runtime authority: Cloudflare Worker `thelingolegacy`, entry point `worker.js`.
- Production config: `wrangler.jsonc`.
- Isolated workers.dev staging config: `wrangler.staging.jsonc`, public assets limited to `staging-public/`.
- Production promotion is blocked until a real G02 runner, passing CI, staging live probes, rollback target, and independently correlated release evidence are accepted.
- Current Actions jobs have reported runner ID 0, empty runner name, no steps, and unavailable logs/artifacts. Therefore source validators have not been proven to execute on the latest runs.
- Cloudflare Builds triggers remain deliberately contained; build commands and route ownership must be reviewed before re-enabling them.

## Flutter app layer

Future mobile surfaces include:
- Splash and last-active-world resume.
- Lingo ID profile, avatar, badges, XP, accessibility preferences, and settings.
- Virtual wallet display for Demo Coins, Loyalty Bucks, Lingo Tokens, cosmetics, and collectibles with no cash-out route.
- Store preview, world home, notifications surface, and safe sync states.

All client-held state is untrusted. Wallet, rewards, entitlements, and progression changes require authenticated server-side validation, idempotency, audit records, and a rollback policy before activation.

## Firebase optional layer

Optional services after a separate backend activation plan:
- Firebase Authentication for account sessions.
- App Check for application integrity.
- Firestore for profiles, inventories, progression, audit trails, and configuration.
- Cloud Storage only after bucket rules, retention, access controls, cost limits, and media lifecycle are reviewed.
- FCM, Crashlytics, Analytics and Remote Config only after environment separation, privacy/consent, and budget review.

Nothing in this blueprint proves that Firebase project configuration, credentials, rules, or backups are currently production-ready.

## Cloudflare Worker runtime and routing

The intended runtime path is:

`GitHub source → validated CI → isolated staging Worker → live probes → accepted rollback/evidence → explicit production authorization`

The canonical apex/www routes are assigned to Worker `thelingolegacy` in current provider readback. Repository configuration originally named `thelingolegacyv-5`, which created a mismatch; the correction is staged in draft PR #235 and has not been merged or deployed.

Four Cloudflare Builds triggers are currently contained by nonmatching path filters. Leave them contained until:
- intended Worker ownership is independently reviewed;
- build commands are validated in a nonproduction job;
- public asset scope is explicit and safe;
- G02 and source CI execution are verified;
- staging routes/APIs/security/error paths are independently probed.

Do not change DNS or live route ownership based only on this document.

## Storage and external service contracts

Neon, Upstash Redis, object storage such as Cloudflare R2, and Firebase Storage remain possible integrations, not claims of currently configured production services. Select a provider only after confirming account ownership, credential scope, access controls, backups, retention, recovery, cost controls, and validated client/server contracts.

No credential, token, private key, password, or service-account JSON belongs in the repository.

## GitHub source and CI

- Use focused branches and pull requests for configuration changes.
- Treat static page badges as copy, not release evidence.
- A job is accepted only when the actual Jobs API record contains a nonzero runner ID and populated runner name, steps execute, logs/artifacts can be downloaded, and run/job/commit identities correlate.
- If both `ubuntu-latest` and self-hosted jobs fail before step initialization, investigate Actions policy/account limits/runner dispatch and escalate exact run/job IDs to GitHub Support. Do not attribute the failure to a source script without executed logs.
- Current recovery work is in draft PR [#235](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/235).

## Activation requirements before live services

1. Auth and role checks.
2. Schema validation and idempotency.
3. Rate limits and abuse controls.
4. Audit logs and evidence retention.
5. Spend/billing hard stop.
6. Verified rollback target.
7. No-wagering, no-cash-out and no-cash-equivalent enforcement.
8. Domain-specific verification before DNS or route changes.
9. Separate environment variables/secrets in each owning provider; never commit secret values.

## Source of truth

- Integration map: `/integration-os/`
- Static config contract: `config/integration/front-back-stack.json`
- Deployment and release runbook: `docs/deploy.md`
