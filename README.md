# The Lingo Legacy — One Legacy. Many Worlds.

> **Canonical source:** `thelingolegacy-blip/TheLingoLegacy` (`main`)  
> **Architecture direction:** GitHub source of truth · Cloudflare edge · Firebase where verified and approved · React/Next web · Flutter mobile · Unity for game workloads where appropriate  
> **Release posture (2026-11-11):** production promotion HOLD · G02 FAIL / UNVERIFIED · last-known-good protected

The Lingo Legacy is a connected portfolio of original brands, products, stories, games, media, creator services and community experiences. Each product has its own world identity while sharing governed platform services where those integrations are implemented and accepted.

**LINGOlegacy-LoyaltyLane #StayLoyaltoYourOwnLane #StayLoyal**

---

## Canonical portfolio architecture

The following names are the canonical portfolio taxonomy. Catalog placement does not change a product's world ownership.

| Portfolio / world | Canonical scope |
|---|---|
| `LINGOlegacy_MASTER` | Governance, legal, brand, creative, product, website, engineering, business, release control and archive |
| `LINGOlegacy` | Flagship identity, account, wallet architecture, community and shared platform |
| `LINGOlane` | Designs & Promotions, Apparel, Laundry-Cycle |
| `LINGOslots` | That's My Lingo, Spades Is My Lingo, Uhno Lingo U-No, Lingo Lions Eruptions, Cashman Lingo Mania |
| `LINGOarcade` | Tricias Escape, Doughboys Oasis, Crazy Weasols, Silly in Philly, Jersey Shore: The Undead |
| `LINGOlibrary` | KottonsCode, The Block I Grew Up On, Say It Again, Dice Shift Hotel, Legacy Legends |
| `LINGOmedia` | Rise of Zavione and related music, film and creator media |
| `LINGOworld` | LINGOai, askLINGO, LINGOboom, LINGOtravel, LINGOcampus, LINGOsupport, LINGOwifi, LINGOvoice, LINGOshield, LINGOlounge, LINGOdonations |
| `LegacyXclub` | Membership, loyalty and community benefits |
| `LLG Tech Corps` | Shared engineering, platform reliability and multi-provider AI gateway |

### Product/world ownership

- KottonsCode is a distinct world and IP owned within the LINGO ecosystem; its book is also cataloged through LINGOlibrary.
- Loyalty Lane Cycle belongs within LINGOlane; its game and laundromat hub experience remain separate from any real-world service operation.
- Doughboys Oasis belongs within LINGOarcade; its game concepts, progression and vertical slices do not imply live commerce or real-value transactions.
- That’s My Lingo belongs within LINGOslots; demo coins and game progression remain distinct from cash, redeemable value, wagering or sweepstakes activation.

Do not revive superseded portfolio labels as canonical product names. Product aliases may be retained only when explicitly mapped and approved in the registry.

---

## Platform and deployment authority

- **GitHub:** canonical source, reviewed changes, release evidence and artifact provenance.
- **Cloudflare:** authoritative DNS, edge routing and intended production Worker platform.
- **Firebase:** identity/application-data foundation only where the real project, app configuration, rules, environment and ownership are verified.
- **Web:** React/Next and static assets where appropriate.
- **Mobile:** Flutter.
- **Games:** Unity or another engine selected per product requirements.
- **AI:** provider adapters behind an LLG-owned gateway; provider credentials remain server-side.

The target production path is:

`GitHub → trusted CI gates → reviewed artifact → Cloudflare runtime → verified domain routes`

Vercel is not the target production platform. Its remaining repository integration/status contexts must be retired or isolated and must not be treated as authoritative Cloudflare release evidence.

---

## Current verified operational baseline — 2026-11-11

This section is an evidence snapshot, not a claim that the entire portfolio is production-ready.

| Surface | Verified state |
|---|---|
| Public apex homepage | Reachable; still serves older candidate-status copy |
| Apex `/healthz` | Returns `ok`; this verifies only that endpoint |
| Cloudflare zone | Active |
| Worker routes | 21 observed route assignments |
| DNS records | 34 observed records |
| `thelingolegacyv-5` | Production traffic remains 100% on version 137 |
| `lingo-flagship-root` | Production traffic remains 100% on version 1 |
| New Worker uploads | Main version 303 and root version 3 are preview-only; not production traffic |
| GitHub Actions | Recent workflows fail before job creation; zero jobs/steps/logs/artifacts |
| G02 | FAIL / UNVERIFIED |
| Supabase project | ACTIVE_HEALTHY, but zero public tables, migrations and Edge Functions |
| Firebase | Project/app deployment verification NOT VERIFIED; placeholder configuration remains a blocker |
| Production promotion | BLOCKED |

The updated flagship navigation source is under review in PR #548. Its preview has not passed independent browser/device QA and has not been promoted. Do not describe the repaired navigation or updated copy as live until the active Worker deployment and public route are verified.

The current EZCA source registry is under review in PR #549. Its structural checks pass for 38 repositories, 12 shared engines, 7 Workers, 21 route assignments and 38 dependency assignments. Structural validation is not runtime certification.

---

## Release and safety contract

A successful source edit, JSON parse, build upload, preview URL, HTTP health response, provider connection or draft PR does not equal production acceptance.

Required progression:

`INVENTORY → RECONCILE → IMPLEMENT → TEST → REVIEW → STAGING QA → ACCEPT → PROMOTE → VERIFY LIVE`

Before promotion, require:
- exact source commit and reproducible artifact provenance;
- successful trusted CI with instantiated jobs, completed steps, logs and retrievable artifacts;
- real G02 runner evidence where the gate applies;
- route-to-runtime and active Worker version agreement;
- verified backend, identity, rules and data contracts;
- security, privacy, legal, accessibility and supported-device acceptance;
- observability, rollback, backup and restore evidence;
- separate release authorization by the responsible owner.

### Protected controls

- Preserve last-known-good production versions and user data.
- Do not bypass failing or unavailable release gates.
- Do not fabricate Firebase IDs, provider credentials, owners, OAuth scopes, legal approvals or operational evidence.
- Do not deploy repository root as Firebase Hosting content; use only the verified build output after build validation.
- Keep payments, wallet value, wagering, cash-out, sweepstakes, merchant redemption and other value-bearing actions disabled until their server-authoritative ledger, provider, legal and reconciliation gates pass.
- Keep AI provider keys and other secrets in approved server-side secret stores.
- Do not perform physical electrical, mechanical, construction or life-safety work through software automation. Qualified professionals and required authorities must inspect, install and sign off.

## Enterprise execution index

- [Enterprise completion program — PR #510](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/510)
- [Master registry and dependency graph — PR #511](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/511)
- [EZCA registry and route audit — PR #549](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/549)
- [Flagship navigation repair — PR #548](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/548)
- [Enterprise Completion Control Tower — issue #517](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/517)

Keep the main branch and production environment protected until the Control Tower records the evidence and separate acceptance required for each applicable gate.
