# LINGO Environment, Configuration & Secret-Handling Standard

**Baseline:** 2026-11-14  
**Purpose:** standardize setup without storing credentials in GitHub source.  
**Status:** control document only; no secret values or provider resources are created by this document.

## 1. Environment separation

| Environment | Purpose | Data | Identity | Release rule |
|---|---|---|---|---|
| local | Developer iteration | Synthetic fixtures only | Emulator/test tenant | Never use production credentials |
| test | Automated unit/integration tests | Disposable fixtures | Mock or emulator | Deterministic, no external paid calls |
| staging | Controlled end-to-end verification | Synthetic test users/data | Dedicated non-production Firebase project | Requires explicit staging acceptance |
| production | Public live service | Real user data only after approval | Production identity tenant | Protected release process only |

The environment name is mandatory. Missing or unknown environment values are configuration errors, not production defaults.

## 2. Configuration inventory (names only)

### Cloudflare Worker

- ENVIRONMENT
- STACK_ENGINE_VERSION
- CANONICAL_DOMAIN
- PUBLIC_SITE_URL
- FIREBASE_PROJECT_ID (non-secret identifier; staging must be non-production)
- GATE_PUBLIC_HQ
- GATE_DEMO_GAMEPLAY
- GATE_REGISTERED_PLAY
- GATE_WALLET_MUTATION
- GATE_COMMERCE_CHECKOUT
- GATE_AI_PROVIDER_CALLS
- GATE_COMMUNITY_INTERACTION

Secret bindings (names and ownership must be inventoried separately; never commit values):
- Firebase service credentials only if a server-side integration explicitly requires them; prefer provider-native verification/JWKS where possible.
- Provider API keys for AI adapters.
- Webhook signing secrets.
- Any third-party integration credential approved by security review.

### D1 / data

- D1 database binding name and database ID.
- Migration directory and migration ledger.
- Schema version and expected table inventory.
- Backup/export and restore procedure.
- Data retention and deletion policy.

Never store raw user tokens, passwords, full payment credentials, or secret values in D1 application tables.

## 3. Secret lifecycle

1. Create secrets only in approved provider secret management.
2. Grant least-privilege access to the deployment identity and runtime that requires them.
3. Keep separate values for staging and production.
4. Never paste secret values into issue bodies, PR comments, logs, screenshots or documentation.
5. Rotate exposed or suspected credentials immediately through the provider's supported process.
6. Verify rotation by reading metadata/status only; do not echo secret contents.
7. Remove unused credentials and integrations after confirming no active dependency.
8. Audit access and rotation events.

## 4. Cloudflare setup checklist

- [ ] Confirm account and zone ownership.
- [ ] Inventory exact Worker name, script, deployment version, route and environment.
- [ ] Reconcile repository Wrangler name with live Worker identity.
- [ ] Confirm compatibility date and required flags.
- [ ] Confirm assets directory is a curated build output, not repository root.
- [ ] Confirm D1 binding points to the intended environment database.
- [ ] Confirm KV/R2/service bindings are optional or required explicitly.
- [ ] Confirm observability redaction and sampling policy.
- [ ] Confirm rollback deployment/version and route ownership.
- [ ] Run Wrangler dry-run on exact commit before deployment.
- [ ] Do not deploy until release authority is granted.

## 5. Firebase staging setup checklist

- [ ] Verify the dedicated staging project exists and is owned by the organization.
- [ ] Verify exact project ID and project number from the provider console/API.
- [ ] Create or verify the matching Web app and authorized domains.
- [ ] Obtain the public client configuration from the staging app; do not copy production options.
- [ ] Verify token issuer and audience expected by the Worker.
- [ ] Configure server-side verification using the provider's recommended secure method.
- [ ] Verify staging Worker rejects the production project ID.
- [ ] Add only the verified staging web origin to the CORS allowlist.
- [ ] Test sign-in, token refresh, logout, expiry and unauthorized requests.
- [ ] Keep production identity and account creation gated until separate acceptance.

## 6. D1 migration discipline

- Use versioned, additive migrations.
- Run migrations through the controlled Wrangler migration workflow.
- Read back the migration ledger and expected schema after application.
- Do not fabricate migration-ledger rows.
- Test fresh database install, repeat migration, rollback/recovery and concurrency.
- Keep production migration and staging migration operations separate.
- Record database ID, migration name, commit SHA, timestamp and readback evidence without exposing user data.

## 7. Build and release configuration

- Pin runtime/toolchain versions where practical.
- Use lockfiles and reproducible dependency installation.
- Do not rely on unpinned npx tooling in production release workflows without a reviewed version pin.
- Separate static asset build output from source repository.
- Require current-head CI jobs, logs and artifacts.
- Require environment-specific dry-run and release manifests.
- Require a rollback plan and explicit acceptance.

## 8. Cost and free-tier guardrails

- External AI calls, SMS, email, storage, analytics and payment APIs remain off by default.
- Apply request limits, per-user quotas, provider budgets and maximum retry policies.
- Use synthetic data and local tests before calling paid services.
- Do not enable scheduled polling or background work without a defined frequency and cost ceiling.
- Alert before a budget threshold; fail closed at hard limits.
- Prefer existing verified infrastructure over duplicate services.

## 9. Recovery and incident controls

- Preserve the last-known-good production artifact.
- Keep production mutations frozen while release evidence is incomplete.
- On a suspected credential leak, rotate first and preserve an incident record without copying the secret.
- On data-integrity uncertainty, stop writes, preserve evidence, reconcile ledger and session records, then resume only after review.
- Test backup restore before relying on a backup.
- Keep incident owner, severity, timeline, impact, containment and closure evidence.

## 10. Current environment disposition

- GitHub: source of truth.
- Cloudflare: intended authoritative edge; live Worker identity/configuration requires reconciliation.
- Firebase: dedicated staging project and Web app not yet verified.
- D1: staging database exists; migration state and Worker integration require controlled current readback.
- Vercel: retired from target production architecture.
- Payments, cashout, real-value rewards and registered play: disabled.
- G02: FAIL / UNVERIFIED; do not activate.
- Production: PROTECTED HOLD.
