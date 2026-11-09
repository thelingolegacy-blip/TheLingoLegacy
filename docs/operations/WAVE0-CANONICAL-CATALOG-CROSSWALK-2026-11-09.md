# Wave 0 ↔ Canonical 45-Property Catalog Crosswalk

**Snapshot:** 2026-11-09  
**Wave 0:** PR #511, draft/unmerged  
**Catalog comparison source:** PR #456, draft/unmerged  
**Purpose:** owner-reviewable reconciliation; not an accepted identity map, product readiness assessment, or release authorization.

## Reconciliation rules

- The 45-property catalog candidate is treated as the naming baseline for this comparison only; PR #456 is not merged.
- Exact/case/punctuation-normalized matches are candidate matches, not proof that the runtime or repository is the same product.
- Alias rows are proposed from recognizable naming variants and require owner confirmation.
- No Wave 0-only record is deleted or silently renamed.
- Every Wave 0 product inventory record currently has `repositoryPath: not-mapped`.

## Canonical properties

| Catalog ID | Canonical property | Category | Wave 0 record | Match type |
|---|---|---|---|---|
| `lingolegacy` | LINGOlegacy | flagship-platform | flagship-website | proposed alias — confirm |
| `lingolane-apparel` | LINGOlane Apparel | apparel | Loyalty Lane Apparel | proposed alias — confirm |
| `lingolane-cycle` | LINGOlane Laundry-Cycle | community-commerce | Loyalty Lane Cycles | proposed alias — confirm |
| `thats-my-lingo` | That’s My Lingo | game | That’s My Lingo | normalized-name candidate |
| `spades-is-my-lingo` | Spades Is My Lingo | game | Spades Is My Lingo | normalized-name candidate |
| `uhno-lingo-u-no` | Uhno Lingo U-No | game | Uhno Lingo U-No | normalized-name candidate |
| `lingo-lions-eruptions` | Lingo Lions Eruptions | game | Lingo Lions Eruptions | normalized-name candidate |
| `cashman-lingo-mania` | Cashman Lingo Mania | game | Cashman Lingo Mania | normalized-name candidate |
| `tricias-escape` | Tricias Escape | game | Tricias Escape | normalized-name candidate |
| `doughboys-oasis` | Doughboys Oasis | game | Doughboys Oasis | normalized-name candidate |
| `crazy-weasols` | Crazy Weasols | game | Crazy Weasols | normalized-name candidate |
| `silly-in-philly` | Silly in Philly | game | Silly in Philly | normalized-name candidate |
| `jersey-shore-undead` | Jersey Shore: The Undead | game | Jersey Shore: The Undead | normalized-name candidate |
| `kottons-code` | KottonsCode | books-and-learning | KottonsCode | normalized-name candidate |
| `the-block-i-grew-up-on` | The Block I Grew Up On | book | The Block I Grew Up On | normalized-name candidate |
| `say-it-again` | Say It Again | book | Say It Again | normalized-name candidate |
| `dice-shift-hotel` | Dice Shift Hotel | book-and-game | Dice Shift Hotel | normalized-name candidate |
| `legacy-legends` | Legacy Legends | book-and-media | Legacy Legends | normalized-name candidate |
| `rise-of-zavione-part-1` | Rise of Zavione — Part 1 | media | Rise of Zavione P1 | proposed alias — confirm |
| `rise-of-zavione-part-2` | Rise of Zavione — Part 2 | media | Rise of Zavione P2 | proposed alias — confirm |
| `lingo-travel` | LINGOtravel | service | LINGOtravel | normalized-name candidate |
| `asklingo` | askLINGO | ai-service | askLINGO | normalized-name candidate |
| `lingoai` | LINGOai | ai-platform | LINGOai | normalized-name candidate |
| `lingoboom` | LINGOboom | audio-service | LINGOboom | normalized-name candidate |
| `lingocampus` | LINGOcampus | education-service | LINGOcampus | normalized-name candidate |
| `lingosupport` | LINGOsupport | support-service | LINGOsupport | normalized-name candidate |
| `lingowifi` | LINGOwifi | connectivity-service | LINGOwifi | normalized-name candidate |
| `lingovoice` | LINGOvoice | voice-service | LINGOvoice | normalized-name candidate |
| `lingoshield` | LINGOshield | security-service | LINGOshield | normalized-name candidate |
| `lingolounge` | LINGOlounge | community-service | LINGOlounge | normalized-name candidate |
| `lingodonations` | LINGOdonations | community-service | LINGOdonations | normalized-name candidate |
| `legacyxclub` | LegacyXclub | membership | LegacyXclub | normalized-name candidate |
| `lingo-slots` | LINGOslots | game-platform | — | not represented |
| `lingo-arcade` | LINGOarcade | game-platform | — | not represented |
| `lingo-library` | LINGOlibrary | publishing-platform | — | not represented |
| `lingo-media` | LINGOmedia | media-platform | — | not represented |
| `lingo-world` | LINGOworld | services-platform | — | not represented |
| `lingo-nexus` | LINGO Nexus | discovery-platform | — | not represented |
| `lingo-id` | LINGO ID | identity-service | LINGO-ID | normalized-name candidate |
| `universal-legacy-wallet` | Universal Legacy Wallet | wallet-service | universal-legacy-wallet | normalized-name candidate |
| `lingo-coins` | Lingo Coins | virtual-currency | — | not represented |
| `lingolane-designs-promotions` | LINGOlane Designs & Promotions | creative-commerce | Loyalty Lane Designs & Promotions | proposed alias — confirm |
| `lingostudios` | LINGOstudios | creative-campus | — | not represented |
| `lingo-towers` | LINGO Towers | hotel-and-hospitality | — | not represented |
| `bridged-gap` | Bridged Gap | community-infrastructure | — | not represented |

## Wave 0-only records

| Wave 0 record | Division | Proposed disposition |
|---|---|---|
| master-registry | LINGOlegacy_MASTER | Retain as a platform capability, not a canonical catalog property |
| master-control-center | LINGOlegacy_MASTER | Retain as a platform capability, not a canonical catalog property |
| release-governance | LINGOlegacy_MASTER | Retain as a platform capability, not a canonical catalog property |
| operations-runbooks | LINGOlegacy_MASTER | Retain as a platform capability, not a canonical catalog property |
| flagship-website | LINGOlegacy | Candidate alias of **LINGOlegacy**; owner confirmation required |
| community | LINGOlegacy | Retain as a platform capability, not a canonical catalog property |
| Loyalty Lane Designs & Promotions | LINGOlane | Candidate alias of **LINGOlane Designs & Promotions**; owner confirmation required |
| Loyalty Lane Apparel | LINGOlane | Candidate alias of **LINGOlane Apparel**; owner confirmation required |
| Loyalty Lane Cycles | LINGOlane | Candidate alias of **LINGOlane Laundry-Cycle**; owner confirmation required |
| Rise of Zavione P1 | LINGOmedia | Candidate alias of **Rise of Zavione — Part 1**; owner confirmation required |
| Rise of Zavione P2 | LINGOmedia | Candidate alias of **Rise of Zavione — Part 2**; owner confirmation required |

## Acceptance actions

1. Product owner confirms the 45 canonical property IDs and names against the current brand canon.
2. Product owner accepts or rejects each proposed alias.
3. Decide whether the five master/community records are platform capabilities rather than product properties.
4. Add the ten catalog-only properties to the Wave 0 inventory after division/ownership decisions.
5. Map each accepted property to repository path, public surface, runtime, route, API, identity/data store, assets, tests, and release gate.
6. Re-run registry validation and independent review after mappings are committed.

**Current disposition:** PARTIAL / NOT ACCEPTED. This crosswalk makes the discrepancy inspectable; it does not resolve ownership or establish product completion.
