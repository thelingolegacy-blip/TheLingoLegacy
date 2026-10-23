# Production Source Inventory — 2026-10-23

**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Base:** `main` (inspected through GitHub repository tree and file API)  
**Branch:** `audit/production-source-inventory-2026-10-23`  
**Mode:** Read-only source inventory; no production mutation  
**Disposition:** PROTECTED HOLD — this report does not certify implementation, CI execution, or live health.

## Executive summary

The repository has a Cloudflare Worker entrypoint and multiple gate/verification scripts. The inspected source does not by itself establish the complete architecture specified by `docs/MASTER_PRODUCTION_CONTEXT_2026-08-17.md`. Several required contracts have a source-level mismatch or are not established by the files inspected. Findings below distinguish verified source observations from unverified runtime state.

## Confirmed source observations

| Area | Evidence | Observation | Disposition |
|---|---|---|---|
| Edge entrypoint | `wrangler.jsonc`; `worker.js` | Wrangler points to `worker.js`, declares apex/www routes, and binds static assets as `ASSETS`. The Worker serves non-API requests using `env.ASSETS.fetch(request)`. | Source confirmed; deployed version not verified. |
| Versioned runtime APIs | `worker.js`; `scripts/verify-dynamic-runtime.mjs` | Explicit handlers exist for `/api/v1/runtime`, `/api/v1/platform/manifest`, `/api/v1/platform/status`, `/api/v1/platform/gates`, `/api/v1/platform/modules`, and `/api/v1/site/context`. | Source contract present; live availability not verified. |
| Legacy API contract | `docs/MASTER_PRODUCTION_CONTEXT_2026-08-17.md`; `worker.js` | Master context requires `/api/health`, `/api/metrics`, `/api/checkout`, and `/api/rewards/claim`. The inspected Worker exposes `/healthz`, `/api/create-checkout-session`, and `/api/beacon-text-alerts`, and returns 404 for other `/api/*` paths. | Confirmed source-level contract mismatch; reconcile before route changes. |
| Next.js origin | Master context; root tree | Root repository inventory contains `worker.js`, `wrangler.jsonc`, static `index.html`, and static-site assets. No root `package.json` or `next.config.*` appeared in the inspected recursive tree. | Next.js origin implementation/connection not established in this repository snapshot; do not infer that no other connected repository hosts it. |
| Firestore | `studio-sites/games/oasis-platform/firebase-functions/src/index.ts` | A separate Oasis Firebase Functions package initializes Firebase Admin and uses Firestore transactions for demo wallet/inventory operations. | Confirms a scoped Firestore implementation exists; does not establish flagship Next.js persistence or platform-wide durable truth. |
| Commerce | `worker.js`; repository tree | Worker source contains Stripe checkout and beacon alert logic. The inspected path inventory did not establish Shopify-primary, Square-failover, or TapStitch inventory-sync implementations. | Integration state unknown; locate source in connected repositories and verify contract/tests. |
| Recovery/PITR | `infra/recovery/README.md`; `docs/MASTER_PRODUCTION_CONTEXT_2026-08-17.md` | Recovery documentation states production remains frozen and LKG protected. The master context names backup/PITR requirements. | Documentation exists; successful backup, retention, and restore evidence not verified. |
| Release gates | `config/release/gate-matrix.json`; `scripts/run-static-gates.mjs` | Gate matrix defines 20 critical gates and blocks promotion when any critical gate is not PASS. Static runner declares syntax checks, tests, and verification commands. | Definitions exist; this audit did not execute them. |
| G02 | `docs/G02-ACCEPTANCE-CONTRACT.md`; `docs/operations/wave-0-github-actions-restriction-runner-eligibility-report.md`; `infra/recovery/lingo-g02-control-agent.js` | G02 contract requires real runner assignment, positive runner ID, instantiated steps, sentinel, retrievable logs, artifacts, correlation, and independent review. Existing recovery Worker explicitly says it is read-only and not a runner. | G02 remains BLOCKED until fresh evidence satisfies the full contract. |
| Star Points compliance | Master context; Worker runtime manifest | Worker manifest reports `real_money_gameplay: false` and `cash_out: false`. This is a runtime status declaration, not proof that every rewards/ledger path enforces the policy. | Audit ledger, redemption, wallet, and game transaction paths before acceptance. |
| Secrets | `.env.example`; `wrangler.jsonc`; `worker.js` | Worker references environment bindings for sensitive integrations rather than embedding secret values in the inspected checkout code. | No complete secret scan or platform secret inventory performed. |
| Production configuration | `config/production.json`; `scripts/verify-production-authority.mjs` | Production config sets fail-closed activation and requires live probes, rollback target, and evidence ledger. | Policy declaration only; runtime state and evidence ledger were not verified. |

## Required remediation sequence

1. **G02 evidence:** Inspect current workflow runs and job/step/log/artifact records. Verify runner registration, online/polling state, exact labels, runner-group scope, and Actions restrictions through authorized controls. Do not weaken the dedicated runner requirement.
2. **Route reconciliation:** Build a route-by-route compatibility map from the master context and all portal/API consumers. Add or adapt handlers only after identifying expected methods, schemas, authentication, idempotency, and error contracts. Preserve existing versioned endpoints.
3. **Origin and persistence:** Identify the intended Next.js repository/deployment and verify Cloudflare origin routing. Trace reads/writes for authoritative business state to Firestore and prove Redis is cache/telemetry only.
4. **Commerce:** Locate and test Shopify primary operations, Square failover/mirroring behavior, TapStitch inventory sync, idempotency, webhook verification, and reconciliation behavior.
5. **Recovery:** Verify backup schedule and retention, PITR configuration, encrypted backup access, restore runbook, and a non-production restore drill with evidence.
6. **Compliance:** Trace Star Points creation, transfer, redemption, game outcomes, and ledger writes. Confirm no wagering, staking, cash-out, cash-equivalent redemption, or real-money conversion path.
7. **Validation:** Run the existing static/test gates in CI and all 20 behavioral release gates plus live smoke tests against the intended target. Capture exact commit, run, job, step, artifact, and live-probe evidence.
8. **Review and activation:** Obtain independent review and explicit authorization before any production activation. Keep LKG protected until the acceptance chain is complete.
9. **Synchronization:** After approved implementation changes, update this canonical context and open separate reviewable synchronization changes for each verified connected repository. Do not bulk-propagate unreviewed assumptions.

## Execution limitations

- No test suite, 20-gate release run, live smoke test, production deployment, DNS change, secret mutation, merge, or activation was executed as part of this source inventory.
- Public source visibility does not establish live provider configuration, credentials, runner availability, deployment provenance, or production health.
- A missing file in this repository does not prove the feature is absent from all connected repositories.
- No release status is upgraded by this document.

## Acceptance rule

Maintain **PROTECTED HOLD** until current source identity, real CI execution, all mandatory gates, live smoke evidence, rollback readiness, and independent human authorization are established. Never claim production readiness from source inspection alone.
