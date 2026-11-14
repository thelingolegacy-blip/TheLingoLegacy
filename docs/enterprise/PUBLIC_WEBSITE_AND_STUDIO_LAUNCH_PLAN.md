# LINGO Legacy Public Website & Studio Launch Plan

Version 1.0.0 | Candidate plan; no production changes authorized.

## Dated known condition
The 2026-11-04 production cutover runbook records:
- Zone thelingolegacy.com.
- Exact-root route handled by lingo-flagship-root; catch-all and www by thelingolegacyv-5.
- Auxiliary launch, atlas and other routes use separate Workers.
- Active production versions and rollback references are in the cutover runbook.
- /healthz and selected status endpoints responded at that runbook's timestamp.
- /studio-hub/ returned not found.
- /studio-sites/ and /kottons-code/ returned HTTP 200.
- /ai/ was runtime-dependent; /app/ was a browser-side local demo; /lane/ was source-only.
- Firebase, Stripe, D1, KV, R2, webhook and SMS integrations were reported false in that runtime snapshot.
- G02 was FAIL / UNVERIFIED and G03–G11 blocked.

These are dated observations, not fresh November 8 live tests.

## Public navigation
Home; Explore the Universe; Products & Experiences; Games & Arcade; Apparel & Lifestyle; Library & Learning; Media; LINGOai; Community; About; Support; Status/Release Notes.

## Authenticated Studio navigation
Executive Overview; Product Portfolio; Surface Matrix; Engineering & Infrastructure; Engine Control; Creative Studio; Asset Library; Production Board; Presentation Studio; Integration Center; Knowledge Hub; Security & Compliance; Launch War Room; Maintenance & Incidents; Audit & Evidence.

## Public site requirements
Accurate brand and product status; responsive phone/tablet/desktop/TV; semantic HTML; keyboard/focus; captions/alt text; optimized assets; canonical metadata; sitemap/robots; privacy/terms/consent; secure server-side form validation; no unsupported claims about availability, prizes, payments, multiplayer or AI. Demo features must be labeled. No private routes, source maps, secrets or internal telemetry in public output.

## Studio requirements
Existing Studio Control Center source includes protected-hold banner, live status refresh, runtime status and gate links, access/approval indicators, module registry and operations checklist. Visible controls must not imply authority to mutate production.
Required modules: executive dashboard; product/service registry; Surface Matrix; engine/integration control; asset search/rights; creative briefs/storyboards/timeline; render/export jobs; live presentation stage/cue sheet/fallback; knowledge search/citations/version history; release gates/evidence; maintenance/incidents/costs; audit/roles.

## Routing/deployment controls
Preserve exact-root precedence and rollback references. Build to allowlisted output directory. Never publish repository root, source/config/environment files or private assets. Test root, www, nested routes, assets, APIs, redirects, 404/500. Verify CSP, CORS, HSTS, cache and canonical redirects. Verify bindings and probes. Disable payment CTAs until end-to-end acceptance. Use isolated staging Workers and test domains. Promote only after gates and explicit approval.

## Live website acceptance
| Test | Pass condition |
|---|---|
| Root/www | Correct canonical home and safe redirect |
| Product routes | Correct content and no broken links |
| Studio | Authentication, role checks and audit events |
| API | Contract-valid response; no secret leakage |
| Assets | Required files load with correct MIME |
| Forms | Validation, abuse controls, privacy disclosure |
| Mobile | No horizontal overflow; touch targets work |
| Accessibility | Keyboard, screen reader, contrast, captions |
| Performance | Approved budgets and stable error rate |
| Security | Headers, authZ, secrets, dependency checks |
| Recovery | Rollback and restore drills demonstrated |
| Content truth | No unsupported feature/availability claims |

## Launch communications
Public product directory; launch announcement/media kit; demo scripts; known issues/FAQ; support escalation; status/incident messages; privacy/terms/accessibility; release notes and rollback communications.

## Go-live decision
A public homepage may remain reachable while Studio and ecosystem are under development. Label feature availability accurately. Domain reachability or one healthy Worker does not mean the ecosystem is live.
