# LLG Application-by-Application Architecture Review

**Parent standard:** [LINGO MASTER Architecture & Governance Standard](LLG-MASTER-ARCHITECTURE-STANDARD.md)  
**Register:** [Application Architecture Register](LLG-APPLICATION-ARCHITECTURE-REGISTER.md)  
**Review date:** 2026-11-07  
**Scope:** repository source and documentation review on the LLG Tech Corps feature branch  
**Disposition:** preliminary engineering review; not independent acceptance or production certification.

## Review method and limits

Reviewed the repository tree, current application pages, architecture specifications, integration contracts, game registry, and selected backend readiness documents. This pass did not execute browser/device tests, authenticate to third-party systems, inspect live secrets, change cloud configuration, or certify deployed runtime behavior. Findings are limited to the inspected source and documents.

## Portfolio-wide findings

1. GitHub remains the canonical implementation source. Cloudflare is the intended production edge. Vercel is explicitly retired by the external integration contract, but a Vercel PR integration/check still appears on the current PR head; reconcile the stale integration without changing production routes.
2. Firebase is the preferred backend direction, but the repository documents placeholder Flutter Firebase options and requires verified project/app identity before activation. Do not infer Firebase readiness from config files or existing account resources.
3. Lingo ID has an architectural conflict: `lingo-id/index.html` says Auth0 is connected to a Vercel project, while the newer platform baseline calls for Firebase and the old Vercel runtime is retired. The page also says login/callback/session/protected-route flows remain unimplemented. Select one identity provider, record an ADR, verify real app registrations and callback domains, then update the page and all clients consistently.
4. The new AI gateway is a server-side foundation only. Provider flags remain off; no provider keys, budget, authenticated request, or live model call is proven.
5. Product families must not share wallet, payment, reward, identity or private-data authority implicitly. Explicit API contracts, consent and server-side authorization are required.

## 1. LINGOlegacy — flagship, identity, account, wallet architecture and community

**Inspected evidence:** `lingo-id/index.html`, `docs/FRONTEND-BACKEND-ARCHITECTURE.md`, `docs/FLUTTER-FIREBASE-CLOUDFLARE-ROADMAP.md`, `docs/lingo-master-control-matrix.md`.

**Assessment:** design and integration planning exist; identity and backend activation are not verified.

**Findings**
- Identity provider conflict: Auth0/Vercel claim versus Firebase-first architecture. The page itself states login, logout, callback, profile, session and protected-route work is still required.
- Flutter Firebase options are documented as placeholders; real app registrations and Firebase project identity need confirmation.
- Wallet is an architecture domain, not a live balance service. Ledger ownership, idempotency, reconciliation, reversal, fraud controls and read/write permissions need their own accepted API/data design.
- Community requires distinct moderation, reporting, privacy, consent and retention controls.

**Required closure:** identity ADR; real project/app registration evidence; callback/session/refresh/logout tests; security rules review; wallet ledger threat model and reconciliation tests; community moderation and data-retention plan. Keep wallet and payment writes disabled.

## 2. LINGOlane — Designs & Promotions, Apparel and Laundry-Cycle

**Inspected evidence:** `loyalty-lane-apparel/index.html`, `loyalty-lane-cycles/index.html`.

**Assessment:** public presentation concepts exist; transactional and operational services are not established by the inspected pages.

**Findings**
- Apparel explicitly labels itself browse-only: no orders, checkout, deposits, payments, receipts or fulfillment are active.
- The apparel page links to Shopify readiness, but a link is not an authenticated commerce integration or order workflow.
- Loyalty Lane Cycles presents a district-map experience for laundry/grocery/community/marketplace stops. The inspected page is a visual web surface; no verified hub booking, cycle timer backend, partner marketplace, friend graph, survey service or rewards ledger is evidenced there.
- Apparel commerce and Cycle operational data must remain separate services, with a common identity only after consent and account readiness.

**Required closure:** product/catalog source of truth; inventory and fulfillment contract; checkout/payment provider ADR and test-mode proof before any payment enablement; laundry hub/partner/location data model; booking/timer concurrency and cancellation tests; reward eligibility and abuse rules; privacy review for location and social features. No payments or rewards activation in this review.

## 3. LINGOslots — five-title portfolio

**Titles in portfolio canon:** That’s My Lingo, Spades Is My Lingo, Uhno Lingo U-No, Cashman Lingo Mania, Lingo Lions Eruptions.

**Inspected evidence:** `studio-sites/GAME-MASTER-TREE.md`, `studio-sites/GAME-BIBLE-INDEX.md`, `studio-sites/config/game-registry.json`, title specifications under `studio-sites/games/`, and That’s My Lingo enterprise/roadmap documents.

**Assessment:** core design documents exist for That’s My Lingo, Spades Is My Lingo, UhNo Lingo University, Cashman Lingo Mania and Lingo Eruptions. A dedicated Lingo Lions Eruptions specification was not found in the inspected game-spec paths.

**Findings**
- Naming mismatch: portfolio canon says Uhno Lingo U-No; registry/spec uses UhNo Lingo University. Confirm canonical product name and preserve aliases explicitly if needed.
- Naming mismatch: portfolio canon says Lingo Lions Eruptions; existing spec is Lingo Eruptions. No dedicated Lions-specific title spec was found.
- That’s My Lingo has a clear non-wagering demo boundary. Keep demo balances non-cash, non-transferable and non-redeemable; no paid spins, cash-out, cash prizes or live sweepstakes.
- Each game needs title-specific rules/economy correctness, deterministic or reproducible test fixtures, accessible motion/audio controls and server-authoritative score/reward controls before connected play.

**Required closure:** creator-approved canonical names; add or formally map the Lions title; run rules/math/economy abuse tests per game; validate all client/server boundaries; keep monetization and prize features disabled pending separate legal/compliance approval.

## 4. LINGOarcade — five-title portfolio

**Titles:** Tricias Escape, Doughboys Oasis, Crazy Weasols, Silly in Philly, Jersey Shore: The Undead.

**Inspected evidence:** five title specifications, Doughboys Oasis full-game spec v2, engineering execution plan, Unity vertical-slice bootstrap, mode/platform contract, platform integration and vertical-slice QA document.

**Assessment:** design baselines exist for all five titles. Doughboys Oasis has the deepest implementation planning and a Unity vertical-slice path. None of these documents, by themselves, prove an accepted build or release.

**Findings**
- Engine choice must remain title-specific. Doughboys has a Unity-oriented path; the other titles need documented engine/platform ADRs before committing to a production runtime.
- Doughboys' large-world, racing, life-simulation, economy and multiplayer ambitions require staged vertical slices and separate server-authority, save-migration, performance and network-loss tests.
- Silly in Philly requires cultural review, fictional geography checks, rhythm latency and music/voice rights.
- Jersey Shore: The Undead requires content rating, co-op/network failure handling, accessibility and non-graphic alternatives as appropriate.
- Tricias Escape and Crazy Weasols require puzzle/physics correctness, deterministic state and assist/retry coverage.

**Required closure:** execute each title's vertical-slice plan; capture build/test artifacts; confirm device/browser matrix; verify asset rights; test save/recovery, offline/network failures, anti-cheat and performance. No title is promoted from design/prototype based on a document or registry label.

## 5. LINGOlibrary — books and interactive experiences

**Titles in portfolio canon:** KottonsCode, The Block I Grew Up On, Say It Again, Dice Shift Hotel, Legacy Legends.

**Inspected evidence:** `library/index.html`, `kottons-code/index.html`, `docs/kottons-code-digital-system.md`, `studio-sites/games/kottons-code.md`, Game Bible index/tree.

**Assessment:** the library catalog surface and KottonsCode web/story/game assets are present. KottonsCode remains its own IP/world while also being catalogued through LINGOlibrary. Individual game-spec documents for the other four named interactive titles were not found in the inspected `studio-sites/games/` spec set.

**Findings**
- KottonsCode is family/child-facing. Age-appropriate privacy, parental controls, consent, minimal collection, deletion/export, safe content and no unnecessary child identifiers are release blockers.
- Existing KottonsCode source and docs describe multiple character/story versions; creator canon approval and a single source-of-truth character/story manifest are needed before final production.
- Books and interactive experiences need separate content schemas and rights manifests while sharing catalog metadata only where appropriate.
- The other four portfolio titles need individual briefs/specs before implementation can be validated.

**Required closure:** child-safety/privacy review; creator-approved canon; rights and image/voice provenance; reading-level and accessibility review; separate per-title book/game specs for The Block I Grew Up On, Say It Again, Dice Shift Hotel and Legacy Legends.

## 6. LINGOmedia — Rise of Zavione Part 1 and Part 2

**Inspected evidence:** `media/index.html`, studio media runtime/manifests and media production guide paths.

**Assessment:** a media surface and shared studio runtime are present. The inspected paths do not establish two complete film production/release plans.

**Findings**
- The two-part film portfolio needs separate script, rights, production, edit, audio, caption, distribution and release records.
- Central media runtime and asset manifest should not imply rights clearance or publication authorization.
- Music, footage, performer/voice likeness and location releases must be documented per asset and territory.

**Required closure:** create Part 1 and Part 2 production bibles; versioned screenplay/storyboard; rights/release register; media QC, caption/transcript and final master checksums; distribution and takedown/rollback plan.

## 7. LINGOworld — service and application portfolio

**Products:** LINGOai, askLINGO, LINGOboom, LINGOtravel, LINGOcampus, LINGOsupport, LINGOwifi, LINGOvoice, LINGOshield, LINGOlounge, LINGOdonations.

**Inspected evidence:** `docs/ASKLINGO-AI-INTEGRATION.md`, `docs/google-ai-studio-lingo-workstream.md`, new LLG Tech Corps foundation and repository tree.

**Assessment:** askLINGO has a service contract and explicit not-production-enabled status. The inspected repository tree did not expose individual architecture plans for most other LINGOworld products.

**Findings**
- askLINGO: no implemented production query route is documented; the production Worker returns 404 for unknown API routes; site context reports ask_lingo=false; no model-provider binding is configured.
- LINGOai should own provider-neutral routing and command-center capabilities; askLINGO is a product surface/client, not a second independent secret or routing plane.
- LINGOboom, LINGOtravel, LINGOcampus, LINGOsupport, LINGOwifi, LINGOvoice, LINGOshield, LINGOlounge and LINGOdonations need individual product purpose, data, permissions, risk and runtime plans before engineering activation.
- LINGOshield is defensive security only; LINGOvoice needs voice-consent and likeness safeguards; LINGOdonations needs payment/charity and jurisdiction review before any collection; LINGOtravel needs location/booking privacy and partner API boundaries.

**Required closure:** one service brief and data classification per product; explicit API contracts; provider and budget decisions; abuse/privacy/security review; opt-in and consent; mock-first vertical slice; live test only after account, secret and spend authorization.

## 8. LegacyXclub

**Inspected evidence:** LINGO MASTER portfolio map and repository tree search for a dedicated LegacyXclub app/plan path.

**Assessment:** portfolio ownership is recorded, but a dedicated application architecture plan or distinct implementation surface was not located in the inspected repository tree.

**Required closure:** define membership proposition, audience, age/eligibility, account and entitlements, moderation, privacy, community operations, support, data model and monetization boundary. Do not infer membership or paid access from the name alone.

## Required decision register

| Decision | Owner | Required evidence | State |
|---|---|---|---|
| Canonical Lingo ID provider (Auth0 vs Firebase) | LINGOlegacy / Tech Corps | ADR, project/app registrations, end-to-end auth tests | OPEN |
| Canonical UhNo / Lions title names | Creative + GDeveloper | Creator-approved canon record and registry/spec alignment | OPEN |
| LINGOworld app-by-app plans | Product owners + Tech Corps | Purpose, data, permissions, runtime, risk, test plan | OPEN |
| LINGOlibrary missing title specs | Library + GDeveloper | Four individual approved briefs/specs | OPEN |
| LINGOmedia film plans | Media + rights owner | Part 1/2 production and rights bibles | OPEN |
| LegacyXclub plan | Portfolio owner | Membership product brief and architecture | OPEN |
| Vercel PR integration retirement | Infrastructure | Verified integration removal or explicit exception; no production route changes | OPEN |

## Acceptance boundary

This review is a source-based architecture assessment by the implementation assistant, not independent acceptance. A separate reviewer must validate findings and evidence, challenge the conclusions, and sign off the relevant product owners' decisions. No application is certified by this report.