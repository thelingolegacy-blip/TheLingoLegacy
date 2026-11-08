# LINGO Legacy Work Breakdown, Budget & Operations Plan

Version 1.0.0 | Planning categories only; obtain vendor quotes and owner approval before spending.

## Work breakdown structure
### Governance, legal and portfolio
Corporate/brand structure; naming; IP ownership; copyright/trademarks; contributor agreements; licenses; privacy, terms and consent; game/sweepstakes jurisdictional review; product registry; decision/risk logs; retention; age ratings.

### Website and UX
Sitemap; navigation; responsive design system; public/product/support pages; accounts and protected routes; search; metadata; canonical URLs; sitemap/robots; consent; accessible forms; status and release notes; device/browser testing.

### Platform and infrastructure
Cloudflare zone/routes/Workers/assets/bindings; Firebase projects/Auth/Firestore rules/indexes/backups; storage lifecycle; cache; queues/events; secrets; monitoring/alerts; incident response; environment isolation; IaC drift control.

### Engineering and CI/CD
Runner health/labels/dispatch; pinned toolchain; reproducible builds; unit/integration/E2E/regression; security/accessibility/performance tests; artifact provenance; SBOM; dependency/license scan; preview; approvals; rollback; post-deploy probes.

### Product segments
For every product: concept, user journey, functional specification, design, prototype, backend, analytics, privacy/security, content, QA, release and support.
- LINGOlegacy identity/account.
- LINGOlane apparel/promotions/laundry.
- LINGOslots portfolio.
- LINGOarcade portfolio.
- LINGOlibrary publishing/learning.
- LINGOmedia creator/music/film.
- LINGOworld services.
- LegacyXclub membership.
- LLG Tech Corps AI command center.

### Creative production
Brief intake; approvals; brand kits; templates; scripts; storyboards; character/set/shot planning; image/audio/voice/music/video/animation/3D; source preservation; rights/provenance; edit/render; captions/transcripts/localization; live presentation rehearsal; cue sheet and fallback media.

### Commercial and finance
SKU/catalog; Shopify inventory/orders; Stripe sandbox/live separation; webhook idempotency; refunds/disputes/tax/settlement; bookkeeping; pricing/subscriptions; unit economics; monthly close; cash runway; renewals.

### Operations and safety
Service inventory; on-call owner; patch calendar; backup/restore; incident severity; vulnerability SLAs; physical site/equipment safety; licensed contractors; permits and inspections.

## Budget codes and bill of materials
| Code | Cost category | Unit | Control |
|---|---|---|---|
| B-01 | Domain/DNS | Annual | Renewal owner, registrar lock, MFA |
| B-02 | Edge/runtime | Monthly usage | Free-tier limits, request/CPU alerts |
| B-03 | Database/identity | Usage/month | Reads, writes, storage, egress caps |
| B-04 | Object storage/CDN | GB-month + egress | Lifecycle and retention |
| B-05 | CI/build | Minutes/month | Concurrency and artifact retention |
| B-06 | App builder/studio credits | Credits/job | Preflight balance and approval |
| B-07 | AI providers | Tokens/requests | Per-provider budgets and quotas |
| B-08 | Creative tools | Seat/month + generation | License and usage review |
| B-09 | Commerce/payment | Transaction fees | Settlement/refund reconciliation |
| B-10 | Email/SMS | Message volume | Consent and opt-out |
| B-11 | Monitoring/security | Events/seat/month | Retention and alert value |
| B-12 | Legal/accounting | Hour/project | Scope and jurisdiction |
| B-13 | Physical equipment | Unit/installation | Supplier quote, certification, inspection |
| B-14 | Permits/inspections | Per permit/visit | Authority fee schedule |
| B-15 | Maintenance/support | Monthly/contract | SLA and escalation |

## Budget approval
Record vendor, product, quantity, unit price, currency, tax, renewal, cancellation, owner and whether one-time/recurring/usage-based. Require explicit approval for any nonzero purchase, seat, credit top-up, domain order or infrastructure resource. Alert at 50%, 75% and 90% of approved budgets. Do not enter payment credentials or purchase without provider authorization.

## Resource roles
Executive sponsor/product owner; architect; frontend/mobile; backend/data; cloud/SRE; security/privacy; QA/accessibility; game engineers/designers; creative director/editor; commerce/finance; legal/compliance; support/moderation; licensed electrical/mechanical/building professionals where physical work exists. Do not invent named assignments.

## Estimation
XS < 1 engineer-day; S 1–3 days; M 4–10 days; L 2–4 engineer-weeks; XL multi-team or multi-month. Include discovery, implementation, tests, review, deployment, documentation and handoff.

## Maintenance cadence
Daily: availability, error budget, failed jobs, security alerts, payment/webhook failures, unauthorized changes. Weekly: vulnerabilities, CI reliability, rights, backup points, cost/quota, Surface Matrix drift. Monthly: restore drill, access recertification, vendor reconciliation, SLO/performance, incident tabletop. Quarterly: security assessment, continuity review, physical inspection by qualified personnel, vendor exit review, disaster recovery exercise.

## Installation and repair workflow
1. Identify exact asset/service/equipment/location.
2. Establish ownership, authority and environment.
3. Capture non-destructive diagnostics and current condition.
4. Classify risk and determine qualified professional requirements.
5. Obtain permits, vendor approvals and change authorization.
6. Prepare backups, rollback and safety controls.
7. Execute only approved work.
8. Inspect/test against manufacturer and code requirements.
9. Capture before/after evidence and hashes where applicable.
10. Update inventory, drawings, manuals, maintenance and handoff.
11. Obtain independent acceptance.

Physical electrical work is performed by qualified licensed personnel under applicable codes and permits. Software repairs require known API, scope, environment and rollback.

## Stop conditions
Stop if costs are unknown/unapproved; access scope unclear; secret exposed; backups unverified; production route/database at risk; physical hazard present; permits unresolved; or rollback cannot be demonstrated.
