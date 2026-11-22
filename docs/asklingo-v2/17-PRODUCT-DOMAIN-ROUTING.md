# askLINGO v2.0 — LINGO Product-Domain Routing

## Purpose

Provide a stable routing map so askLINGO can understand which LINGO domain owns a request without assuming access to that domain's private data or operations.

This is a domain taxonomy, not an integration-status claim. A product name in the registry does not prove that an API, connector, database, or live service exists.

## Known portfolio domains

| Domain | Product scope | Typical request routing |
|---|---|---|
| LINGOlegacy | Flagship identity, accounts, wallet, community | Account guidance, identity context, wallet explanations |
| LINGOlane | Designs & Promotions, Apparel, Laundry-Cycle | Brand, apparel, and physical-service information |
| LINGOslots | That's My Lingo, Spades Is My Lingo, Uhno Lingo U-No, Lingo Lions Eruptions, Cashman Lingo Mania | Casino-style entertainment and card-game product support |
| LINGOarcade | Tricias Escape, Doughboys Oasis, Crazy Weasols, Silly in Philly, Jersey Shore: The Undead | Games, stories, gameplay, and world-building |
| LINGOlibrary | KottonsCode, The Block I Grew Up On, Say It Again, Dice Shift Hotel, Legacy Legends | Publishing, reading, learning, audio, rights, and creator support |
| LINGOmedia | Rise of Zavione P1 / P2 | Film, music, production, and media development |
| LINGOworld | LINGOai, askLINGO, LINGOboom, LINGOtravel, LINGOcampus, LINGOsupport, LINGOwifi, LINGOvoice, LINGOshield, LINGOlounge, LINGOdonations | Ecosystem intelligence and specialist experiences |
| LegacyXclub | Membership and community experience | Membership guidance and authorized member services |

The authoritative portfolio registry remains the source of truth for the full brand/product inventory. This routing document records the known domain families and must be reconciled against the current canonical portfolio register before being treated as exhaustive.

## Routing contract

Every request is classified by:
- intent and task type;
- named product/domain, if any;
- verified tenant and user context;
- resource owner and data classification;
- requested operation and risk;
- source freshness requirements;
- required capability and approval tier.

The router may recommend a product domain from the request, but it may not grant access. A product selection or URL, brand name, conversation history, or agent role is not an authorization token.

## Product isolation

- Product APIs remain authoritative for their own data.
- Cross-product retrieval requires explicit, server-side grants for both source and destination context.
- Wallet, financial, identity, HR, health, legal, and other sensitive domains require dedicated policy and data-minimization controls.
- Read access does not imply write access.
- Drafting or preparing an action does not imply executing it.
- Agent delegation cannot expand the original principal's authority.
- A product outage or unavailable policy decision must not trigger unscoped fallback retrieval.

## Universal service boundaries

Common ecosystem services such as identity, wallet, registry, event fabric, observability, and governance may be shared only through versioned contracts and separately permissioned service identities. Ledger authority remains with the owning financial/product service; telemetry and AI-generated summaries are evidence inputs, not ledger authority.

## Evaluation

Test ambiguous product selection, lookalike names, cross-product data requests, tenant boundaries, stale registry entries, unavailable product APIs, conflicting source records, and unauthorized cross-domain writes.
