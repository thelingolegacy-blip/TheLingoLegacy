# Four-product application build baseline

**Portfolio owner:** LINGOlegacy_MASTER  
**Products:** Loyalty Lane Cycle, Loyalty Lane Apparel, That's My Lingo, Kotton's Code  
**Disposition:** Build and repair in isolated branches/previews; production promotion remains protected.  
**Source of truth:** This GitHub repository. AppDeploy snapshots are preview/deployment artifacts and must be reconciled to GitHub before they are treated as canonical.

## 1. Preservation and current inventory

Do not replace existing product identities, working assets, routes, content, or last-known-good snapshots without an evidence-backed migration and rollback target.

| Product | Existing evidence | Current limitation / next action |
|---|---|---|
| Loyalty Lane Cycle | Canonical route `/loyalty-lane-cycles/`; AppDeploy Loyalty Lane Community Hub preview; community/laundry/market/rewards UI and API | Existing API uses one shared state record, has no member authentication on reward/laundry/message mutations, and accepts client-supplied reward values. Introduce per-member ledgers, authenticated requests, server-defined reward rules, idempotency, transaction audit records, branch/location scoping, and staff authorization before real member value is enabled. |
| Loyalty Lane Apparel | Canonical route `/loyalty-lane-apparel/`; dedicated `Loyaltylaneapparel` repository; AppDeploy hub integration; approved product/brand brief | Current canonical page says browse-only and explicitly accepts no orders or payments. Shopify Admin API access currently returns `operation_not_allowed` / store unavailable. Restore provider access first; then verify catalog, variants, inventory, cart, checkout handoff, order webhooks, returns, tax/shipping, fulfillment and customer support. No fake checkout success or fabricated stock. |
| That's My Lingo | Canonical route `/thats-my-lingo/`; `THATS-MY-LINGO` repository; AppDeploy game studio with 5x3 virtual reels, 20 paylines, Bulldog word game, player profile, wallet and leaderboard | Existing backend authenticates profile/wallet/spin operations and explicitly disables cash-out, cash-equivalent redemption and sweepstakes entries. Preserve virtual-only Demo Coins. Add deterministic game-math tests, responsible-play and age/jurisdiction controls, secure admin roles, immutable economy ledger and compliance review before any sweepstakes capability. |
| Kotton's Code | Canonical route `/kottons-code/`; `Kotton-code-engine` and `kottens-code-engine` repositories; AppDeploy Cartoon Studio with persistent catalog and 12-stage production pipeline | Production OS is not proof of a child-facing release. Backend pipeline/catalog writes currently lack authenticated staff/parent role enforcement. Repair four broken world-image URLs, verify canonical character/world assets, implement parent/guardian consent and family controls, age-appropriate data minimization, content moderation/review, and child-safe analytics before child accounts or publishing. |

## 2. Shared platform architecture

- **Identity:** Lingo ID as the shared identity boundary; each product must authorize its own resources and roles server-side.
- **Authorization:** Default deny; least privilege; unique user/service identities; product, tenant, resource and operation scoping; immediate revocation; server-side role/attribute checks.
- **Approval and audit:** Persist approval records and append-only audit events for privileged actions, reward adjustments, refunds, content publication, staff access, and release promotion.
- **Data separation:** Separate product records and ledgers. Cross-product reads/writes require explicit scopes and documented purpose.
- **Economy separation:** Keep Cycle Points, Laundry Credit, redeemable Rewards, work Earnings, LINGOcoins/promotional credits, and That’s My Lingo Demo Coins distinct. No silent conversion, transfer, cash value, or redemption equivalence.
- **Infrastructure:** GitHub canonical source; Cloudflare edge/routing; Firebase/Auth/Firestore only where configured and verified; Flutter mobile; React/Next web as appropriate; Stripe only after live account and product eligibility checks.
- **Observability:** Structured events, request correlation, error monitoring, audit trails, and release evidence without collecting unnecessary child or personal data.
- **Cost controls:** Free-tier-first; no paid plan, domain purchase, paid provider activation, or unbounded usage without a separate budget approval.

## 3. Product completion requirements

### Loyalty Lane Cycle
1. Member sign-in and verified identity.
2. Separate member ledger and transaction history.
3. Server-owned reward catalog, earning rules, caps, eligibility and idempotency.
4. Laundry hub/location registry, operating hours, service catalog, machine availability and booking/queue workflow.
5. QR redemption with signed, short-lived, one-time tokens and server-side validation.
6. Staff/operator console with branch-scoped permissions.
7. Customer messaging with moderation, abuse controls and privacy boundaries.
8. Grocery/market partner integrations only after partner authorization and receipt-verification controls.
9. Accessibility, mobile touch, offline/retry and error states.

### Loyalty Lane Apparel
1. One cohesive app shell with landing, collection, product detail, variants, cart, account, lookbook and Tap Stitch.
2. Real catalog and inventory provider adapter; no fabricated stock.
3. Secure checkout handoff and verified payment/order webhooks.
4. Customer order history, fulfillment tracking, cancellation/returns and support.
5. Rewards/XP kept distinct from money and order totals.
6. Apparel Expert / askLINGO integration behind approved API authorization.
7. Responsive web and Flutter/mobile parity.
8. Product analytics and accessible/reduced-motion UI.

### That's My Lingo
1. Preserve original Vegas Studio / crimson-black-gold visual identity.
2. Free virtual gameplay only; Demo Coins have zero cash value and cannot be purchased, transferred or redeemed.
3. Server-authoritative outcomes, wallet ledger, limits, replay protection and game math.
4. Authenticated profiles and role-protected operator tools.
5. Leaderboard integrity, moderation, anti-abuse and responsible-play controls.
6. Sweepstakes remain disabled until official rules, no-purchase entry method, eligibility, age/jurisdiction, odds/prize disclosures, privacy/terms and legal approval are independently verified.
7. Test desktop/mobile, accessibility, fairness calculations and failure/retry behavior.

### Kotton's Code
1. Preserve the canonical story, eight-world architecture, Core Nine cast and existing book/episode canon.
2. Family Mode, parent/guardian consent, child account boundaries and age-appropriate defaults.
3. No behavioral advertising, public child profiles, open direct messaging, precise child location or unnecessary personal data.
4. Curated, moderated learning content and approved publishing workflow.
5. Interactive reading, literacy/logic mini-games, accessible audio, captions and progress controls.
6. Parent-visible progress and deletion/export controls consistent with applicable law.
7. Separate production studio roles from child/family consumer roles.
8. Repair missing imagery and test all world routes on mobile and desktop.

## 4. Integration status from the current connected workspace

- GitHub repository access is available.
- Cloudflare account identity is available; production route changes are not authorized by this build brief.
- AppDeploy has existing preview apps; deployed status does not establish production readiness.
- Stripe account currently reports `livemode=false`; do not accept real payments or configure live commerce.
- Shopify store API is unavailable pending merchant-side account access/billing resolution.
- Canva returned no Brand Kits; do not invent or overwrite brand kits.
- No production Firebase project, production credentials, or provider linkage is assumed solely from a source-code reference.

## 5. Release gates

A product can be marked **preview-ready** only after source is committed, build/type checks pass, automated tests pass, mobile and desktop smoke tests pass, backend authorization tests pass, integrations are clearly marked connected/unconnected, and errors are reviewed.

A product can be marked **production-ready** only after all applicable legal, privacy, security, accessibility, data-retention, provider, domain, payment, support, backup/restore, incident-response and rollback gates have evidence.

Production promotion remains blocked until the exact commit, build artifact, test run, deployment, domain, integrations, rollback target and approvals are correlated and verified. A deployed preview URL or a passing frontend check alone is insufficient.

## 6. Execution sequence

1. Reconcile the four canonical product directories and related dedicated repositories; identify duplicates and retain historical copies.
2. Implement shared authorization, approval, audit and product-scope contracts.
3. Repair Cycle member identity and ledger boundaries.
4. Restore Apparel provider access and complete commerce handoff without taking live payments during preview.
5. Verify That’s My Lingo virtual economy and compliance gates.
6. Harden Kotton's Code family controls and production/child-content separation.
7. Build/test web and mobile surfaces, add integration contract tests, and capture evidence.
8. Deploy isolated previews, compare against canonical GitHub commit, run QA, record rollback points.
9. Keep production promotion on protected hold until all gates pass.

## 7. Explicit non-actions

This work does not authorize real-money wagering, live sweepstakes, cash-equivalent game credits, production payments, legal acceptance, public child data collection, paid subscriptions, new recurring spend, destructive data migrations, production DNS/Worker changes, or production release promotion. Those remain separately gated and require verifiable service readiness and any required user/provider approvals.
