# Environment Hard-Lock Contract

This document is non-secret. It defines required variable names and dashboard checks only.

- Store secret values only in Vercel project environment variables or the owning provider dashboard.
- Do not commit API keys, tokens, private keys, passwords, Firebase service-account JSON, or webhook secrets.
- Use `config/production/env-contract.json` as the source of truth for expected production variable names.

Current Vercel env-name audit showed asset path variables and `SITE_URL` exist. Stripe and Firebase production names still need to be added and verified in dashboards before those systems are marked production-ready.
