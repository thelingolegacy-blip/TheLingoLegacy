# Environment Hard-Lock Contract

**Current platform direction:** GitHub is source of truth; Cloudflare is the intended production edge. Vercel is retired and is not an approved location for new LINGO secrets or deployments.

This document defines non-secret variable names and secret-handling rules only. It contains no credential values.

## Source of truth

- Secret Manager is authoritative for credentials.
- Prefer short-lived workload identity (GitHub Actions OIDC → provider federation) over long-lived API keys.
- Cloudflare Worker secrets are bound through the Cloudflare secret-binding mechanism and are never placed in `vars`, source, or static assets.
- AppDeploy secrets, when needed, must be entered through its secure secret-entry flow and bound only to the intended backend app.
- Never store secret values in GitHub source, Firestore, Cloud SQL, logs, issue comments, artifacts, client bundles, Flutter/Unity packages, or chat.

## Public configuration versus secrets

Firebase web API keys, auth domain, project ID, app ID, sender ID and storage bucket identifiers are client configuration values, not service-account credentials. They still must match a verified project and must be protected by Firebase Security Rules, App Check, authorized domains and API restrictions.

Private values include service-account private keys, OAuth client secrets, Cloudflare API tokens, webhook signing secrets, payment secrets, Twilio auth tokens, model-provider API keys, database passwords and private signing keys. These must remain server-side.

## Canonical environment separation

Use distinct development, staging and production identities. Production identity must not be available to pull-request jobs or untrusted branches. Grant `id-token: write` only to the exact job that exchanges a workload identity token. Use protected GitHub Environments with reviewers for deployment.

## Historical configuration notice

Older Auth0/Vercel environment audits and readiness pages are historical snapshots. They do not prove current provider connections, environment values, callbacks, session wiring, or production authentication. Vercel is retired; do not use historical Vercel environment-variable instructions as current setup guidance.

## Required review before activation

- Verify the owning provider account, project, tenant and environment.
- Identify exact code consumers and required secret names.
- Verify scopes and resource permissions are least-privilege.
- Enter values only through the provider's secure secret manager.
- Verify the application can use the credential without revealing it.
- Test rotation, revocation, negative authorization and rollback.
- Obtain separate release authorization before production activation.
