# The Lingo Legacy — Sovereign Ecosystem

> **Canonical source:** `thelingolegacy-blip/TheLingoLegacy` (`main`)  
> **Public flagship:** https://thelingolegacy.com/  
> **Intended production edge:** Cloudflare Workers / Pages  
> **Release posture:** PROTECTED HOLD — last-known-good preserved

## Mission

The Lingo Legacy is a connected creative and technology ecosystem. Its realms retain distinct identities while sharing governed capabilities for identity, APIs, data, events, assets, creation, operations, security, recovery and release.

## Portfolio canon

- **LINGOlegacy** — flagship identity, account and discovery experience.
- **LINGOlane** — Loyalty Lane Apparel, Loyalty Lane Cycle, and Designs & Promotions capabilities.
- **LINGOslots** — That’s My Lingo, Spades Is My Lingo, Uhno Lingo U-No, Lingo Lions Eruptions, and Cashman Lingo Mania.
- **LINGOarcade** — Tricias Escape, Doughboys Oasis, Crazy Weasols, Silly in Philly, and Jersey Shore: The Undead.
- **LINGOlibrary** — Kotton’s Code, The Block I Grew Up On, Say It Again, Dice Shift Hotel, and Legacy Legends.
- **LINGOmedia** — music, film and creator production, including Rise of Zavione.
- **LINGOworld** — LINGOai, askLINGO, LINGOboom, LINGOtravel, LINGOcampus, LINGOsupport, LINGOwifi, LINGOvoice, LINGOshield, LINGOlounge and LINGOdonations.
- **LegacyXclub** — planned member community and shared-culture experiences.

## Shared engines and control systems

- **LINGOcore / Stack Engine:** service contracts, APIs, events, configuration, feature gates, health and readiness.
- **LINGOidentity / LINGO ID:** authentication, authorization, account lifecycle, consent and recovery.
- **Universal Legacy Wallet:** future rewards and virtual-credit architecture; real-value transfers and redemption remain disabled.
- **LINGOstudio:** design, engineering, game, book, media and asset-production workflows.
- **Master Control Plane:** portfolio registry, service inventory, monitoring, approvals, evidence and release authority.
- **Recovery & Dispatch:** event, schedule, webhook and manual triggers; incident routing, job ownership, retries, runbooks and audit history.
- **LINGOshield:** security, privacy, trust, abuse prevention and resilience.

## Technology and provider boundaries

- **GitHub** is the canonical source of truth and review/evidence history.
- **Cloudflare** is the intended public edge and DNS/Worker authority. Existing route scopes and deployed versions must be reconciled before any production change.
- **Firebase** is retained only for explicitly verified legacy or product-specific capabilities. Project identity, publication boundaries and client configuration remain under reconciliation.
- **Flutter** is the mobile target; toolchain, lockfiles and release signing must be reproducible before distribution.
- **Web** uses standards-based HTML/CSS/JavaScript today; Next.js/React and Go/PostgreSQL are proposed CORE V2 candidates, not blanket production defaults.
- **Unity** remains a target for selected game builds where appropriate.
- **AppDeploy** is a staging/build/preview surface. A deployed preview is not production certification.
- **Vercel retirement/cutover is not yet certified.** Do not detach domains or delete projects until Cloudflare provenance, route ownership, rollback and cutover acceptance are documented.

## Release and recovery contract

`DESIGNED → BUILT → TESTED → CONNECTED → CERTIFIED → PRODUCTION`

Each state requires evidence. Source creation or a deployment label is not proof of acceptance.

Current controls:
- GitHub Actions job startup remains blocked; recent attempts have failed before jobs were created.
- G02 remains FAIL / UNVERIFIED; do not activate the protected self-hosted runner as a workaround.
- Main branch protection and required release checks require restoration and verification.
- Production deployment, DNS/route mutation, payment activation, identity cutover, last-known-good replacement and production promotion remain blocked pending separate evidence and release approval.
- No paid cloud resources or recurring commitments without explicit cost/account/region approval.
- Virtual game credits remain non-cash and non-redeemable; real-money gameplay and cash-out are disabled.

## Public website

- `/` — flagship discovery landing page.
- `/worlds/` — canonical realm directory.
- `/studio/` — creative studio entry point.
- `/trust-compliance/` — trust and safety.
- `/community-guidelines/` — community expectations.
- `/privacy/`, `/terms/`, `/contact/` — public policy and support.

See `docs/operations/flagship-homepage-build-2026-11-15.md` for the current website build scope and acceptance checklist.
