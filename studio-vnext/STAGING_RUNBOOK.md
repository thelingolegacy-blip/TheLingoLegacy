# Studio VNext — Isolated Preview Runbook

## Objective
Create a reviewable preview of the new studio without touching `thelingolegacy.com`, `www.thelingolegacy.com`, the active production Worker, Firebase production, Shopify, or payment configuration.

## Current status
- Source: isolated branch `studio/enterprise-environment-vnext-2026-10-24`.
- Prototype: `studio-vnext/index.html`.
- Automated contract tests: added in `studio-vnext/tests/studio-contract.test.mjs`.
- CI workflow: `.github/workflows/studio-vnext-contract.yml`.
- Deployment: **not performed**; preview URL not yet established.
- Real-browser and integration acceptance: pending.

## Stage 1 — deterministic source checks
Run locally with Node.js 20+:
```sh
cd studio-vnext
npm run check
```
The contract suite checks required page/navigation coverage, catalog inventory, inline JavaScript syntax, safety copy, accessibility foundations, and key interaction wiring. These are source-level checks, not a substitute for browser E2E.

## Stage 2 — preview hosting
Before selecting a provider, confirm an authorized isolated project and target. Use a provider-generated preview URL or a dedicated non-production hostname; do not configure apex/www custom domains. Do not use production environment variables or credentials. Keep preview access private if any non-public functionality is later added.

## Stage 3 — browser acceptance
Against the exact preview URL:
- Desktop viewport 1440×900 and mobile viewport 390×844.
- Exercise every navigation destination and return path.
- Verify all buttons and local checklist actions.
- Keyboard-only operation, focus visibility, Escape behavior where relevant.
- Reduced-motion and forced-colors emulation.
- Contrast measurements for rendered text and controls.
- Console/network errors, broken assets, unexpected external requests.
- Screen-reader landmarks, headings, control names and live-region feedback.
- Security headers, dependency/secret scans, no production credentials.

Record screenshots, browser/version, commit SHA, preview URL, test logs and result hashes in the evidence artifact.

## Stage 4 — functional backend work
Implement separately from the static preview:
- Authentication adapter and server-enforced authorization.
- Database schema, migrations, environment separation and rules.
- Agent registry with allowlisted tools, least privilege, bounded runs, audit traces and human approvals.
- Workflow state machine with schema validation, idempotency, retries and dead-letter/error handling.
- Integration adapters with sandbox credentials and signed webhook validation.
- Health, telemetry, incident response and rollback mechanisms.

## Promotion policy
No merge or production promotion from this runbook. The existing Protected HOLD and canonical gate matrix remain authoritative. Promotion requires independently verifiable evidence, administrator approvals, and explicit authorization for each affected system.
