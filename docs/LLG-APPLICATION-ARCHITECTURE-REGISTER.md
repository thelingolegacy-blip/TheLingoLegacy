# LINGO Application Architecture Register

**Parent standard:** [LINGO MASTER Architecture & Governance Standard](LLG-MASTER-ARCHITECTURE-STANDARD.md)  
**Owner:** LINGOlegacy_MASTER / LLG Tech Corps  
**Status:** Portfolio register and planning baseline; statuses require evidence before promotion.

## 1. Product-family register

| Product family | Application / product plans covered | Primary architecture focus |
|---|---|---|
| LINGOlegacy | Flagship web/mobile, account, Lingo ID, community, wallet architecture | Identity, consent, profile, account recovery, ledger separation |
| LINGOlane | Designs & Promotions, Loyalty Lane Apparel, Laundry-Cycle | Catalog/content, commerce boundary, operations, game experience |
| LINGOslots | That’s My Lingo, Spades Is My Lingo, Uhno Lingo U-No, Cashman Lingo Mania, Lingo Lions Eruptions | Shared game services, isolated rules/economy, non-cash demo mode |
| LINGOarcade | Tricias Escape, Doughboys Oasis, Crazy Weasols, Silly in Philly, Jersey Shore: The Undead | Game discovery, title-specific runtimes, saves and progression |
| LINGOlibrary | KottonsCode, The Block I Grew Up On, Say It Again, Dice Shift Hotel, Legacy Legends | Reading/media catalog, learning interactions, family safety and rights |
| LINGOmedia | Rise of Zavione Part 1 and Part 2 | Media production, publishing, rights and asset pipeline |
| LINGOworld | LINGOai, askLINGO, LINGOboom, LINGOtravel, LINGOcampus, LINGOsupport, LINGOwifi, LINGOvoice, LINGOshield, LINGOlounge, LINGOdonations | Modular services, distinct data/permission scopes, shared identity where approved |
| LegacyXclub | Membership and community experience | Membership policy, consent, moderation and entitlements |

This register records the requested portfolio architecture. It does not assert that all products have complete application plans or functioning integrations. Product-specific plans remain authoritative for title mechanics, audience, content and scope, provided they conform to the parent security and governance contracts.

## 2. Required per-application plan

Each product plan must contain these headings or a linked equivalent:

1. **Identity and ownership** — canonical name, parent family, accountable owner, intended audience, status and scope.
2. **Experience** — user journeys, navigation, account requirements, responsive/mobile/TV support, accessibility and localization.
3. **Runtime** — web/mobile/game client, engine and version, build targets and minimum device/browser matrix.
4. **Services** — API boundaries, Cloudflare routes, Firebase project/app IDs, server functions, data stores and environment separation.
5. **AI integration** — provider(s), purpose, consent, data sent, no-cross-provider-sharing default, budget and off-switch; or “not used”.
6. **Identity and data** — Lingo ID integration, data classification, schema owner, retention, export/deletion, backups and migration.
7. **Security and trust** — threat model, authorization matrix, abuse controls, moderation, secrets and incident handling.
8. **Economy and commerce** — virtual/demo vs real-value boundary, payment provider, entitlements, ledger authority and legal review. Default to disabled.
9. **Creative assets** — original masters, licenses, provenance, checksums, captions/transcripts, alt text and usage approvals.
10. **Verification** — unit/integration/e2e, accessibility, security, performance, device QA, independent acceptance and rollback.
11. **Operations** — owner, monitoring, support, SLOs, runbook, cost ceiling and escalation path.

## 3. Shared-service integration rules

- Lingo ID is an identity service, not blanket consent for every product or data use.
- Shared profile fields are minimized; each application declares the fields it needs.
- Wallets, balances, commerce, sweepstakes and reward entitlements remain separate domains with explicit APIs and audit trails.
- Game progression events are idempotent and server-validated when authoritative.
- AI calls go through the LLG gateway; application clients never embed model-provider credentials.
- Shared assets are versioned and licensed; product-specific visual identity remains owned by that product.
- Cross-product data sharing requires purpose, consent/legal basis, schema contract and revocation path.

## 4. Initial implementation sequencing

1. **Foundation:** canonical portfolio registry, identity/data classification, environment inventory, threat model and cost controls.
2. **Shared platform:** gateway contracts, Lingo ID boundaries, asset registry, telemetry schema and CI evidence contract.
3. **Product vertical slices:** one user journey per family with mocks first; no provider spend or real-value flows.
4. **Hardening:** security, accessibility, privacy, performance, backup/restore and independent QA.
5. **Controlled activation:** only after all applicable gates and human authorization are recorded.

## 5. Application status vocabulary

- `concept`: idea/brief only.
- `design`: product and technical specifications exist.
- `prototype`: local or isolated proof of concept.
- `staging`: deployed to a non-production environment with test data.
- `verified`: acceptance evidence exists for the stated scope and environment.
- `production`: live and independently verified for the stated scope.

Do not upgrade a status based on a mock, screenshot, design document, repository folder or unverified endpoint alone.

## Architecture review

See the [Application-by-Application Architecture Review](LLG-APPLICATION-BY-APPLICATION-ARCHITECTURE-REVIEW.md) for source-based findings, conflicts, blockers and required closure evidence across all eight portfolio families.
