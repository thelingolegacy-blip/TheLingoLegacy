# Loyalty Lane Cycles — End-to-End Build Contract

## Product outcome

A responsive web and mobile service for finding participating laundry hubs, checking operator-confirmed hours and machine availability, starting and tracking wash/dry cycles, receiving service alerts, earning non-cash Lingo Coins from verified participation and eligible bike-generated energy, and redeeming approved laundry/community rewards.

The public web surface remains `/loyalty-lane-cycles/`. GitHub is the source of truth. Cloudflare Worker is the edge/API runtime. Firebase is the intended identity/data platform, but the canonical Firebase project and deployed database are not yet independently verified.

## Cumberland County rollout

Nine candidate slots are configured: three in Vineland, three in Millville, and three in Bridgeton. Candidate business names, addresses, public directory hours, and contact numbers are research data only. No partner agreement, 24/7 operation, machine integration, safety inspection, or access authorization is implied.

Target coverage: 24 hours a day, seven days a week. A hub may only be displayed as "Open 24/7" after direct operator confirmation and operational approval. If a partner cannot support round-the-clock access, keep its real verified hours and fill the 24/7 target with a separately approved owned/leased site or another partner.

## Current implementation in this branch

- Cumberland County nine-slot candidate registry.
- Public read-only Worker endpoint: `GET /api/v1/loyalty-lane-cycles/hubs`.
- Regional hub directory section on the existing Cycles page.
- Responsive city cards, candidate labels, listed-hours disclosure, map links, and call links.
- Domain model contract for hubs, agreements, schedules, machines, cycles, signed cycle events, bike energy sessions, immutable wallet ledger, rewards, redemptions, Beacon contacts, and audit events.

## Full-stack target architecture

### Web
- Existing Cloudflare-served page remains the canonical web entry.
- Mobile-first hub directory, city filters, map/deep links, verified-hours labels, machine status, cycle start/progress/completion, service requests, reward wallet, and accessible status/error states.
- Public candidate listings must remain visibly separate from approved partner hubs.

### Mobile
- Flutter app surface for iOS and Android.
- Shared domain models and API contracts with the web app.
- LINGO ID authentication, deep links to hubs, push notifications, offline-safe read-only hub directory, and accessible cycle status.
- Do not bundle production Firebase credentials in source control.

### Edge and backend
- Cloudflare Worker validates input, applies rate limits, authenticates requests, routes Beacon contacts, and serves public hub data.
- Add durable event/queue storage for cycle and Beacon event processing only after the selected binding and retention design are reviewed.
- Firebase Auth and Firestore are intended for identity and operational records only after the actual deployed project/database is verified.
- Server-side functions own cycle completion, coin calculations, redemptions, machine-event verification, and audit writes.
- Machine gateways use signed, timestamped, replay-protected events and idempotency keys.

### Core services
1. Hub registry and partner onboarding.
2. Operator-confirmed hours and real-time machine status.
3. Booking/cycle orchestration and machine integration.
4. Bike energy verification and cycle crediting.
5. Immutable Lingo Coins ledger and reward catalog.
6. Beacon contact intake, routing, acknowledgement, escalation, and audit.
7. Notifications with explicit SMS/push consent.
8. Admin console with role-based access, partner review, support, and reconciliation.

## Data and security rules

See `infrastructure/registry/loyalty-lane-cycles-model.json`. Clients must never write wallet balances or authoritative cycle-completion records. Signed machine events and trusted server processing are required before crediting rewards. Candidate sites must not be represented as partners. Minimize personal data, use least-privilege roles, record consent, and define deletion/retention policy.

## Required implementation phases

- [x] Add Cumberland County candidate registry with three slots per city.
- [x] Add read-only edge API for the candidate registry.
- [x] Add regional directory to the existing web surface.
- [x] Define core domain models and trust invariants.
- [ ] Verify canonical Firebase project, Auth configuration, Firestore database, deployed rules, and credentials without exposing secrets.
- [ ] Add versioned Firestore rules and emulator tests after project verification.
- [ ] Implement authenticated user profile and hub/partner administration.
- [ ] Implement booking, machine telemetry, bike-energy verification, and cycle event processing.
- [ ] Implement server-authoritative Lingo Coins ledger and reward redemption.
- [ ] Implement Beacon durable queue, retry, overflow, and notification-provider consent.
- [ ] Build Flutter iOS/Android clients and API integration.
- [ ] Add end-to-end tests, accessibility checks, security review, observability, backup/restore, and rollback evidence.
- [ ] Verify all nine partner sites, operator permissions, accessibility, safety, insurance, and 24/7 operating agreements.
- [ ] Obtain explicit release approval and complete independent production verification.

## Release controls

This branch is a reviewable implementation increment only. Do not merge, deploy, activate Firebase production writes, enable paid notification providers, activate payments, issue coins, or represent any candidate site as an approved 24/7 hub until the corresponding evidence and human approval exist. Existing production hold, G02 fail-closed state, and last-known-good protection remain unchanged.
