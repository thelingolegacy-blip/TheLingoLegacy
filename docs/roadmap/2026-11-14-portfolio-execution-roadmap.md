# The Lingo Legacy — Portfolio Execution Roadmap

**Baseline:** 2026-11-14  
**Planning rule:** execute in parallel where dependencies permit; do not bypass shared security, identity, data or release gates.

## 1. Delivery strategy

Build the shared platform once, then connect products through stable contracts. Prioritize a dependable flagship shell and demo-only experience while hardening identity, wallet and session infrastructure. Product teams may prepare content and UI in parallel, but no product may claim operational status until its dependencies and acceptance evidence pass.

## 2. Wave plan

### Wave 0 — Recovery and truth baseline (P0)

**Work**
- Restore GitHub Actions job instantiation on safe hosted probes.
- Reconcile repository branches, workflow triggers, rulesets, release gates and artifact retention.
- Reconcile Cloudflare Worker names, versions, routes, bindings and canonical source.
- Verify dedicated Firebase staging project/app.
- Preserve production last-known-good and keep G02 inactive.

**Exit**
- Jobs instantiate and complete on exact commits.
- Logs/artifacts are retrievable.
- Cloudflare and GitHub source identities agree.
- Staging identity is independently verified.
- No production mutation is required to establish evidence.

### Wave 1 — Shared runtime and control plane (P0)

**Work**
- Review Stack Engine pure core.
- Integrate Worker adapter behind staging-only configuration.
- Add dependency-independent liveness and explicit dependency-aware readiness.
- Add service manifest, module registry and independently evaluated gates.
- Add secure durable gate transitions and audit events.
- Curate static asset build output.

**Exit**
- /healthz remains responsive during dependency outage.
- /readyz correctly reports missing or failed dependencies.
- Invalid configuration and unknown gates fail closed.
- Public status is redacted.
- Staging tests, dry-run, browser QA and independent review pass.

### Wave 2 — Identity, wallet and registered sessions (P0)

**Work**
- Verify Firebase staging tenant and app.
- Implement LINGO ID token/session lifecycle.
- Harden virtual wallet ledger, idempotency and reconciliation.
- Implement durable player sessions separate from spin settlement rows.
- Add suspend/resume and disable/re-enable behavior.
- Bind spin, wallet, XP and session version changes atomically.

**Exit**
- Authenticated browser journey passes.
- Tenant isolation and token validation pass.
- Replays do not duplicate balances or XP.
- Session disable/resume preserves state.
- Independent staging acceptance recorded.

### Wave 3 — HQ and That’s My Lingo public MVP (P0)

**Work**
- Stabilize flagship navigation and responsive public shell.
- Correct status and compliance copy.
- Keep game demo virtual-only and clearly labeled.
- Remove confusing checkout, cash-value or production-ready claims.
- Add support, privacy, terms and contact pathways.
- Add accessibility and mobile QA.

**Exit**
- Public candidate has truthful status.
- Anonymous demo flow works within accepted limits.
- No payment, cashout, real-value prize or unverified account route is exposed.
- Browser and accessibility QA pass.

### Wave 4 — Commerce and lifestyle products (P0/P1)

**Work**
- Loyalty Lane Apparel catalog, supplier, inventory and fulfillment audit.
- Commerce order lifecycle, refunds, tax, shipping and merchant setup.
- Laundry-Cycle experience and shared loyalty presentation.
- Separate payment processing from game/virtual economy.

**Exit**
- End-to-end test order, refund and inventory reconciliation pass.
- Merchant/legal/tax/support readiness accepted.
- Checkout remains disabled until all gates pass.

### Wave 5 — AI and productivity services (P0/P1)

**Work**
- LLG-owned gateway and provider-neutral adapters.
- Individual provider chat, comparison, multi-agent orchestration and developer workflows.
- Cost budgets, rate limits, privacy filters, redaction and audit.
- askLINGO, LINGOai and LINGOboom integration.

**Exit**
- Adapter conformance tests pass.
- User consent and data handling reviewed.
- Provider spend ceilings and failure behavior verified.
- No provider key is exposed to browser clients.

### Wave 6 — Community, media, library and arcade (P1/P2)

**Work**
- LINGO Nexus, LegacyXclub, LINGOmedia and LINGOlibrary.
- KOTTONSCODE content and privacy review.
- Doughboys Oasis and remaining arcade titles.
- Moderation, rights, age/privacy and content safety.

**Exit**
- Per-product owner and rights records exist.
- Moderation and support escalation tested.
- Device/browser QA complete.
- Each product has separate acceptance evidence.

### Wave 7 — Mobile, TV and ecosystem expansion (P1/P2)

**Work**
- Flutter mobile shell using shared API contracts.
- Smart-TV experience with remote navigation/accessibility.
- Unity game integrations where they add value.
- LINGOtravel, LINGOcampus, LINGOsupport, LINGOwifi, LINGOvoice, LINGOshield, LINGOlounge and LINGOdonations.

**Exit**
- Device matrix passes.
- Offline/error behavior and session recovery verified.
- Each service has owner, health contract, privacy review and release gate.

## 3. Parallel execution lanes

| Lane | Can proceed in parallel | Must wait for |
|---|---|---|
| Governance/docs | Register, architecture, policies, acceptance checklists | None; keep status truthful |
| CI recovery | Hosted-runner probes, workflow inspection, branch protection | No G02 activation |
| Cloudflare inventory | Read-only worker/route/binding reconciliation | Production changes require separate approval |
| Stack Engine | Pure module, unit tests, staging adapter | CI and verified staging prerequisites |
| Identity | UI scaffold, Firebase staging setup, auth contract | Staging tenant verification |
| Wallet/game | Migrations, ledger/session model, deterministic tests | Identity contract and D1 verification |
| Public web | Content cleanup, accessibility, static QA | Production deployment acceptance |
| Creative/content | Art, story, catalog metadata, rights records | Rights/privacy review before publication |
| Commerce | Catalog and fulfillment design | Merchant, tax, payment acceptance |
| AI | Adapter interface, mock provider tests, cost policy | Secrets, privacy and provider approval |

## 4. Priority and blocker register

| Priority | Blocker | Governing record |
|---|---|---|
| P0 | GitHub Actions startup failure and missing job/artifact evidence | Issue #575 |
| P0 | Master recovery and portfolio acceptance | Issue #480 |
| P0 | Stack Engine Worker integration and truthful readiness | Issue #587 |
| P0 | Durable game-session lifecycle and safe disable/resume | Issue #584 |
| P0 | LINGO ID staging identity and public readiness | Issue #575; PR #588 |
| P0 | Stack Engine source core review | PR #586 |
| P0 | Portfolio register and release runbook | PR #585 |
| P1 | AI gateway/provider adapters and cost governance | Portfolio workstream |
| P1 | Apparel, commerce and fulfillment acceptance | Portfolio workstream |
| P1/P2 | Community, publishing, media, arcade and device expansion | Per-product acceptance records |

## 5. Definition of done for every product

A product is complete only when it has:
- A named owner and canonical repository path.
- A product brief and user-facing scope.
- An architecture and dependency map.
- A versioned API/data contract.
- Security, privacy, rights and safety review.
- Build/test workflow and exact-head CI evidence.
- Health/readiness and observability contract.
- Rollback and incident runbook.
- Browser/device accessibility QA.
- Independent acceptance and explicit release authority.

## 6. Current bounded MVP

The near-term public MVP may include:
- The Lingo Legacy HQ public candidate.
- That’s My Lingo virtual-credit demo with no real-money, cashout or prize path.
- A Stack Engine scaffold and verified liveness/readiness only after staging integration passes.
- Identity-ready UI scaffold with public login still disabled.
- Portfolio registry, runbooks and roadmap.

The bounded MVP does not imply:
- Registered identity or account creation.
- Production wallet or real-value rewards.
- Multiplayer, commerce, paid credits or cashout.
- All portfolio products being complete.
- Production acceptance without evidence.

## 7. Release authority

The roadmap is not a release authorization. Current disposition remains PROTECTED HOLD; G02 is FAIL / UNVERIFIED; G03–G11 remain held; last-known-good remains protected; production promotion is unauthorized. Any change to that state requires current evidence, independent review and separate explicit approval.
