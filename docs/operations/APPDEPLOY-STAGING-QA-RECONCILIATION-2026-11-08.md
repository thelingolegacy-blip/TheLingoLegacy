# LINGO AppDeploy Staging QA Reconciliation — 2026-11-08

**Scope:** Read-only review of the connected AppDeploy account and six critical staging apps.  
**Production changes:** None.  
**Account selection:** Two connected AppDeploy links resolve to the same account identity and identical app inventory; the third link resolves to a different identity with no apps and was not used for project changes.

## Account inventory

- The intended AppDeploy account returned 18 apps, all listed as deployed in the account overview.
- The account overview reported 20.892937682 monthly credits available, resetting 2026-11-17 UTC, and zero top-up credits.
- Individual get_app_status responses emitted a generic "credit balance is exhausted" alert while also reporting deployments as ready. This conflicts with the account overview. Treat build/deploy capacity as **not conclusively reconciled**; verify the dashboard before starting additional builds. No paid plan or top-up was initiated.

## Critical app status observations

| App | AppDeploy deployment status | QA / validation evidence | Disposition |
|---|---|---|---|
| LINGO Studio Hub | ready | Validation valid; 8 tests warning; no frontend/network/backend errors in returned status | Staging ready; acceptance still separate |
| Enterprise Control Center | ready | No validation result returned; no frontend/backend errors in returned status | Staging ready; integrated control-plane health not certified |
| LINGOlegacy Universe Gateway | ready | QA snapshot contains failed Next.js chunks and 404 "Route not registered" responses under studio-preview.thelingolegacy.com | Investigate custom preview host/runtime mapping; AppDeploy app itself still reports ready |
| That’s My Lingo | ready | Validation valid; 6 tests warning; no frontend/network/backend errors in returned status | Staging ready; demo-only and non-cash-out boundary remains |
| Kotton's Code Cartoon Studio | ready | Four image-load errors reported against studio-preview.thelingolegacy.com/resources/KottonsCode-world-*.jpeg; resource inventory separately lists all four public/resources assets | Investigate preview-host asset mapping; do not treat source assets as missing |
| Loyalty Lane Community Hub | ready | No validation result or frontend/backend errors returned | Staging ready; integrations and commerce not certified |

## Key reconciliation

The Universe Gateway and Kotton's Code errors reference studio-preview.thelingolegacy.com, while the inspected app source/resource inventory does not prove that this host is the current app origin. Therefore these errors are confirmed in the returned QA telemetry but their exact runtime owner is **not yet attributed**. Do not rewrite working app source based only on a possibly stale or cross-app preview URL.

The Kotton's Code resource inventory lists:
- public/resources/KottonsCode-world-1.jpeg
- public/resources/KottonsCode-world-2.jpeg
- public/resources/KottonsCode-world-3.jpeg
- public/resources/KottonsCode-world-4.jpeg

The current app source references the corresponding browser paths under /resources/. A targeted browser check on the app's own AppDeploy URL is needed to determine whether the issue is asset binding, preview-host routing, stale QA telemetry, or another runtime mapping problem.

## Next safe actions

1. Capture app-specific browser smoke results from each app's own v2.appdeploy.ai URL, not the shared studio-preview host.
2. Inspect the DNS/custom-domain owner and route behavior for studio-preview.thelingolegacy.com before changing any route.
3. Compare current source snapshot version, last valid version, and QA timestamp for the two affected apps.
4. Keep LINGO Studio Hub and That’s My Lingo staging-only until their integration and product acceptance criteria are independently met.
5. Reconcile AppDeploy credit reporting in the dashboard before any new builds; no top-up or paid-plan change is authorized.

## Non-actions

No app source, resource binding, custom domain, deployment, billing, subscription, payment, production route, or DNS record was changed. This report does not certify launch readiness.
