# LINGO Authentication, Identity & Secrets Baseline

**As of:** 2026-11-16  
**Canonical source:** `thelingolegacy-blip/TheLingoLegacy`  
**Release posture:** PROTECTED HOLD; no production activation is authorized by this document.

## 1. Purpose and scope

This is the portfolio-wide authentication contract for web, mobile, API, edge, cloud, game, CI/CD, and connected-tool integrations. It distinguishes application-user authentication from workload identity, provider credentials, and authorization. A connection or an environment-variable name is not proof of a working integration.

Allowed integration states are: `CONNECTED_VERIFIED`, `CONNECTED_UNVERIFIED`, `AUTH_REQUIRED`, `CONFIG_REQUIRED`, `DEGRADED`, `DISABLED`, and `NOT_IN_SCOPE`. Every `CONNECTED_VERIFIED` claim requires dated evidence, exact project/account scope, and negative authorization tests.

## 2. Canonical security architecture

```text
Human / service identity
        |
        v
Identity provider (OIDC / Firebase Auth / approved enterprise IdP)
        |
        v
API Gateway / edge ingress
        |
        v
Token verification (signature, issuer, audience, expiry, subject)
        |
        v
Safety Gateway + authorization policy
        |
        v
Application service / data adapter
        |
        v
Least-privilege data store
```

Applications must not bypass the gateway, authorization policy, secret manager, CI/CD gates, or data boundaries. Authentication proves who or what is calling. Authorization separately decides what that identity may do.

### Identity domains are separate

- **Human sign-in:** LINGO ID / Firebase Authentication is the currently documented candidate, not yet certified as the single canonical provider across products.
- **Workload identity:** GitHub Actions OIDC is the CI identity issuer. It is distinct from user sign-in and must be exchanged by the target cloud provider.
- **Service-to-service identity:** short-lived workload credentials or narrowly scoped service tokens; never reuse a human login.
- **Game identity:** a signed-in user ID may identify a player, but wallet, inventory, ledger, purchases, and rewards remain server-authoritative.
- **Admin identity:** separate privileged role, phishing-resistant MFA, protected routes, audited actions, and explicit environment approval.

## 3. Repository and provider inventory

### GitHub Actions

- Canonical repository ID: `1279436411`; default branch: `main`.
- Draft PR #609 adds manual-only OIDC preflight and this portfolio baseline.
- Workflow permissions: `contents: read` and job-scoped `id-token: write`.
- The preflight pins repository ID, repository name, main ref, workflow ref, audience, issuer, and manual-dispatch event.
- It decodes claims for diagnostics; it does **not** independently verify the JWT signature. The relying cloud provider must verify signature, issuer, audience, expiry, and attribute conditions.
- No static cloud credentials, GitHub secrets, environment rules, or repository policies were created or changed.
- Hosted CI job creation remains unverified/blocked. Do not activate G02.

### Google Cloud / Firebase

- Repository declares Firebase project `lingo-legacy-production`, but client configuration still has placeholder API/app values and deployment verification is `NOT_VERIFIED`.
- Firebase project registry records additional project IDs in other product repositories. Do not consolidate projects or Auth identities without a migration and rollback plan.
- Firebase Hosting currently publishes from repository root (`public: "."`); publication must remain blocked until a reviewed public output directory and file allowlist exist.
- Existing `src/auth/firebase-id-token.mjs` verifies Firebase ID-token signature using Google's published signing keys and checks issuer, audience, subject and time claims. Callers must still perform authorization.
- Oasis callable functions require authenticated users and use Admin SDK transactions; Firestore client writes to player wallet/inventory/ledger are denied in its rules. App Check enforcement and emulator acceptance remain outstanding.
- No Google Cloud Workload Identity Pool/provider, service account, Firebase credentials, or IAM bindings were created. Firebase/GCP administrative API access is not connected in this session.

### Cloudflare

- Authenticated Cloudflare user connection is present. This is not proof that a deployment token or workload federation exists.
- Cloudflare is the intended edge. Existing production routes and Workers remain unchanged.
- No Cloudflare API token was created or stored. If a token is needed, create a narrowly scoped token through the owner-controlled dashboard, store it only in the approved secret manager / GitHub protected environment, and never expose it to browser code.
- Keep Worker secrets in Worker secret bindings, not `vars`, source files, or static assets.

### AppDeploy

- 18 owned apps were enumerated and secret metadata was checked without reading values.
- All 18 apps returned an empty secret-entry list in the inspected AppDeploy account.
- This is not proof that the apps require no secrets; classify each app's backend dependencies first.
- AppDeploy secure secret-entry workflow is available. Secret names can be prepared in one batch and values entered by the owner in the secure form; never request values in chat.
- Previous account status reported exhausted deployment credits. No app secret was created, bound, or changed.

### Supabase

- One authenticated Supabase organization and one active project were visible: project ref `zoksxavxmgnkrthselek`, region `us-west-2`.
- No evidence currently maps this project to the canonical LINGO application or identifies its approved auth/database role.
- Do not bind, migrate, modify Auth providers, alter RLS, or deploy functions until project ownership and application scope are explicitly reconciled.
- No Supabase schema, Auth, or project configuration was changed.

### Auth0 / Vercel / Render

- Historical repository pages describe an Auth0 Marketplace connection and environment-variable names in Vercel. Those pages are stale/historical and are not proof of current Auth0 wiring or secrets.
- Vercel is retired by the current platform direction; do not create new Vercel projects, keys, environments, or deployments.
- Render has no workspace selected in the current connection. Do not select a workspace or modify Render resources without an explicit workspace choice.
- No Auth0, Vercel, or Render credential was created or changed.

### Other frameworks and tools

| Surface | Required identity pattern | Current acceptance |
|---|---|---|
| React / Next.js web | Firebase client SDK for sign-in; verify ID token server-side; secure HttpOnly session cookie where server sessions are needed | CONFIG_REQUIRED |
| Flutter mobile | Firebase Auth SDK; secure platform storage handled by SDK; refresh/revoke through provider; App Check before sensitive data | CONFIG_REQUIRED |
| Go API | OIDC/JWKS verification; issuer + audience + subject; authorization separate from identity | SOURCE_BUILT_UNVERIFIED |
| Cloudflare Workers | Verify bearer ID token or trusted service identity at ingress; bind server secrets only; apply per-route authorization | SOURCE_BUILT_UNVERIFIED |
| Firebase Functions | Firebase Auth context + App Check + server-side authorization; Admin SDK only server-side | CONFIG_REQUIRED |
| Unity clients | Treat client as untrusted; authenticate through approved provider and API gateway; no service credentials in game build | CONFIG_REQUIRED |
| Docker / Kubernetes / OpenTofu / Ansible | workload identity or external secret manager; no static keys in images/state/plans; separate plan and apply identities | CONFIG_REQUIRED |
| GitLab CI / CircleCI / Jenkins | separate workload identity per runner/provider; least privilege; masked/protected variables only as temporary fallback | CONFIG_REQUIRED |
| Shopify / Stripe / commerce | provider-owned app credentials in secret manager; signed webhooks; idempotency; server-side authorization | NOT_VERIFIED |
| OpenAI / other model providers | project-scoped API keys in secret manager; provider adapter/gateway; budget and tool scopes; never client-side | AUTH_REQUIRED |
| AppDeploy | secure secret-entry records; bind only to the intended backend app | AUTH_REQUIRED |
| Supabase | Supabase Auth only if project/product mapping is approved; RLS on every exposed table; service role server-only | CONFIG_REQUIRED |

## 4. Framework implementation requirements

### Web (React / Next.js)

1. Use the provider SDK only for public client configuration and user sign-in.
2. Treat Firebase API key as a public project identifier, not an authorization secret; never place service-account credentials in the browser.
3. Send ID tokens over TLS to the API gateway; verify signature, issuer, audience, expiry and subject server-side.
4. For server-rendered sessions, issue Secure + HttpOnly + SameSite cookies; rotate and revoke sessions; prevent CSRF on state-changing routes.
5. Protect admin, studio, wallet, commerce and personal-data routes with server-side role/policy checks. Hiding a button is not authorization.

### Flutter / iOS / Android

1. Use official Firebase Auth SDK flows; never embed admin credentials or provider secrets.
2. Use platform-backed secure storage only for application-managed secrets; do not roll custom token persistence.
3. Enforce App Check where supported before sensitive reads/writes and callable functions.
4. Sign-out must clear local session state; account deletion and token revocation require server-side policy.
5. Android release signing is separate from application authentication and must use a protected signing process; current debug signing is not release-ready.

### Go services

1. Validate JWT signature against trusted JWKS; pin issuer and audience; validate exp/iat/nbf and subject.
2. Bind identity to issuer + subject; do not accept caller-supplied user IDs as proof of identity.
3. Enforce scopes/roles/tenant ownership on every handler.
4. Use TLS to the database, least-privilege DB roles, bounded request bodies, structured redacted logs, rate limits, and audit events.
5. Outbox publishers and consumers require workload identity, idempotency, lease ownership, retry/backoff, and dead-letter policy.

### Cloudflare Workers

1. Use `env.*` secret bindings for private credentials; use `vars` only for non-sensitive configuration.
2. Never expose secrets through static assets, browser bundles, logs, traces, or error responses.
3. Verify JWTs at the edge or forward to a trusted API gateway; never trust unsigned decoded claims.
4. Apply route-level authorization and rate limits; separate public, authenticated, admin and service routes.
5. Bind production secrets only after environment approval and independent route verification.

### Firebase / Firestore / Functions

1. Authenticated identity must be verified by Firebase Auth; App Check is an additional app-integrity signal, not a replacement for Auth.
2. Firestore rules must default-deny and authorize owner/admin operations with schema and field constraints.
3. Wallet, inventory, ledger, purchase, reward, payout, and entitlement mutations are server-only.
4. Use Admin SDK only in trusted server functions; never ship service-account keys to clients.
5. Run Firebase Emulator Suite tests for allow/deny matrices, cross-user access, App Check, idempotency, concurrency and migrations.

### Unity

1. No Firebase Admin, cloud service account, payment secret, or signing secret in Unity assets or build output.
2. Authenticate users with approved provider SDK and exchange tokens only with the API gateway.
3. Keep player progression and economy server-authoritative; local saves are cache only.
4. Verify release signing, deep-link callback allowlists, and token storage per target platform.

## 5. Secret-management contract

The user's standing rule is authoritative: Secret Manager is the source of truth for credentials. No secret values in source, Firestore, Cloud SQL, issue comments, build artifacts, app bundles, or chat.

- Prefer short-lived OIDC/workload identity over static keys.
- Store unavoidable provider secrets in the approved secret manager and inject only at runtime.
- Separate development, staging and production credentials and identities.
- Never reuse a human access token as a machine credential.
- Rotate on suspected exposure, personnel change, or provider policy; revoke old credentials after verified cutover.
- Logs may include secret names and credential metadata, never values, JWTs, refresh tokens, cookies, or authorization headers.
- Use a documented owner-mediated break-glass procedure with expiry and audit trail.

## 6. Authorization baseline

- Default deny.
- Least privilege by resource, action, tenant, and environment.
- Separate roles: public, user, creator, moderator, support, operator, release approver, service workload, owner.
- High-risk actions require step-up authentication and/or second-person approval.
- User-supplied identifiers never override the authenticated subject.
- Every write to financial, wallet, entitlement, moderation, child-data, or production-control surfaces is server-authoritative and audited.
- Child/minor data remains disabled until privacy and guardian-consent obligations are reviewed.

## 7. Required negative and positive tests

- Missing, malformed, expired, not-yet-valid, wrong-issuer, wrong-audience, bad-signature, unknown-key and rotated-key JWT.
- Cross-user and cross-tenant object access denied.
- Public identity cannot call admin/operator/release endpoints.
- Client cannot write wallet, inventory, ledger, entitlement, payout or catalog state.
- App Check missing/invalid denied on protected Firebase endpoints.
- OIDC rejects wrong repository, repository ID, ref, workflow, audience and environment.
- Secret scanning confirms no credentials in source, bundles, logs or artifacts.
- Login, logout, refresh, revoke, account deletion, mobile deep-link callback and session expiry verified.
- All positive and negative tests run in non-production before acceptance.

## 8. Activation order

1. Restore GitHub-hosted CI job creation without activating G02.
2. Review and merge the OIDC preflight through normal controls.
3. Run the GitHub OIDC preflight and inspect job logs/artifacts for zero token leakage.
4. Verify canonical non-production Google Cloud/Firebase project and create WIF provider/service account with repository + branch + workflow + environment conditions.
5. Verify Cloudflare account/zone scope and create a limited staging-only token or approved federation.
6. Configure AppDeploy backend secrets through secure entry only for apps with confirmed dependencies.
7. Reconcile Auth0 historical records, Supabase project scope, Unity callbacks and third-party commerce provider ownership.
8. Execute framework-specific positive/negative tests, then independent security review.
9. Production credentials and environments remain disabled until separate release acceptance.

## 9. Current stop conditions

- CI job startup remains unverified/blocked.
- PR #609 is draft and unmerged.
- Firebase project identity and deployed target are unverified; client config placeholders remain.
- Cloudflare authenticated user exists, but deployment auth is not set up.
- All 18 AppDeploy apps had empty secret inventories in the inspected account.
- Supabase project exists but is not mapped to an approved LINGO product.
- Auth0/Vercel records are historical; Vercel is retired.
- No Firebase/GCP, Cloudflare, Supabase, AppDeploy, Stripe, Shopify, OpenAI or other provider secret was created or changed.

**No production release, G02 activation, DNS change, credential creation, project migration, or paid provisioning is authorized by this baseline.**
