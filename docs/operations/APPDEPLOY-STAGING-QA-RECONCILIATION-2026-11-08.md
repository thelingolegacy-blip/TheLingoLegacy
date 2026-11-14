# LINGO AppDeploy Staging QA Reconciliation — 2026-11-08

**Scope:** Read-only review of the connected AppDeploy account and six critical staging apps.  
**Production changes:** None.  
**Account selection:** Two connected AppDeploy links resolve to the same account identity and identical app inventory; the third link resolves to a different identity with no apps and was not used for project changes.

## 2026-11-09 refresh — all 18 existing apps

A read-only account overview and per-app status pass were completed on 2026-11-09.

- Account overview: Free plan; 20.892937682 monthly credits available; reset 2026-11-17T00:00:00Z; zero top-up credits.
- All 18 listed apps returned deployment status `deployed` in the account overview and `ready` from the per-app status endpoint.
- All 18 stored QA snapshots report zero frontend and network errors, but snapshot timestamps range from 2026-09-03T04:15:28Z to 2026-11-05T00:10:05Z; these are not current live-browser acceptance.
- The account overview reports 0 page views for each of the 18 apps on 2026-11-08 compared with 0 on 2026-11-07.
- Per-app status responses for all 18 apps still append an "exhausted credit balance" alert. This contradicts the account overview's positive monthly balance. The account overview and per-app alert must remain a documented conflict; do not claim the balance is exhausted or spend credits until independently reconciled.
- Stored frontend error records are present for three apps: Universe Gateway (10), Kotton's Code (5), and Lingo Travel (2). The Gateway and Kotton's Code errors reference the shared `studio-preview.thelingolegacy.com` host and are dated 2026-11-06T03:34:38Z and 2026-11-06T03:07:30Z respectively. Lingo Travel's two script errors are older; its app status remains ready.

A second independent browser-fetch attempt on 2026-11-09 could not retrieve the AppDeploy preview URLs for Kotton's Code, Universe Gateway, Lingo Travel, or Studio Hub from that browser vantage. This is an **inaccessible-from-this-browser** result, not evidence that the deployments are down.

A resource-only inventory confirms Kotton's Code has four uploaded paths:
`public/resources/KottonsCode-world-1.jpeg` through `public/resources/KottonsCode-world-4.jpeg`. The Gateway and Travel resource-only responses list no resource paths. This supports keeping the four Kotton assets intact and investigating the shared preview-host/runtime mapping rather than deleting or regenerating the source images.

This refresh does not change the disposition of the six critical apps above: AppDeploy `ready` is a deployment-state label, not product acceptance, functional QA, security acceptance, or production authorization. No upload, build, retry, deployment, billing, subscription, route, DNS, or production change was made.

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
