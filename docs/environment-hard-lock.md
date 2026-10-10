# Environment Hard-Lock Contract

This document defines environment-variable names and ownership rules only. It does **not** prove that a variable is set, valid, or safe for production.

## Canonical ownership

- **Cloudflare Worker runtime secrets and variables:** configure in the intended Worker’s settings. Keep Stripe secret keys, webhook secrets, Twilio tokens, and other server-only credentials in the Worker secret store.
- **GitHub Actions:** put CI-only tokens in repository/environment secrets with the minimum required permissions. Never copy a production secret into workflow logs or artifacts.
- **Firebase:** store service-account credentials only in approved secret storage. Firebase client configuration values may be public client-side settings, but their project, authorized domains, App Check policy and security rules still require verification.
- **GitLab:** project/group CI variables may be used only after GitLab identity verification and project access have been restored.
- **External data/storage providers:** do not treat a marketplace/integration record as proof of active credentials, permissions, backup, or production readiness.

## Environment contract

The repository’s `config/production/env-contract.json` records required variable names, including:

- `SITE_URL` and `PUBLIC_SITE_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

The Worker checkout path also expects `STRIPE_SECRET_KEY` and tier price identifiers `STRIPE_PRICE_XP_PACK`, `STRIPE_PRICE_MYSTERY_KEY_PACK`, and `STRIPE_PRICE_AVALON_BADGE_SET`. Their live values and end-to-end checkout status are not verified by this source contract. Optional providers require their own approved variable list and run-time checks before enabling any integration.

## Current verified limits

- The GitHub repository has a declared environment contract, but the current Actions runs are failing before steps initialize. This means the validators have not been shown to pass.
- G02 runner assignment is not established.
- Stripe credentials/price IDs, Firebase production rules/backups, current analytics, and external provider configuration remain unverified.
- Production promotion and activation remain blocked pending real CI execution, staging probes, rollback evidence, and independent acceptance.

## Non-negotiable controls

- Never commit API keys, access tokens, private keys, passwords, service-account JSON, webhook secrets, or real customer data.
- Never echo secret values in shell commands, logs, pull requests, diagnostics, or artifacts.
- Rotate any credential exposed in a previous response, build log, repository field, or issue before further use.
- Use separate development/staging/production credentials and least-privilege scopes.
- A name appearing in this contract is not evidence that a secret exists, works, or is authorized.
