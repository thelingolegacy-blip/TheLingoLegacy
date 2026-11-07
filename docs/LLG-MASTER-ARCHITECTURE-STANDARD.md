# LINGO MASTER — Enterprise Architecture & Governance Standard

**Authority:** LINGOlegacy_MASTER  
**Technology owner:** LLG Tech Corps  
**Version:** 1.0.0  
**Record date:** 2026-11-07  
**Status:** Proposed reference standard on an isolated review branch; not production authorization.

## 1. Purpose and hierarchy

This standard connects the LINGOlegacy_MASTER governance tree to every LINGO application, shared service, and game. It preserves existing product ownership and departmental responsibilities while making architecture, security, evidence, and release controls consistent.

```
LINGOlegacy_MASTER (governance, legal, brand, creative, products, engineering, business, releases)
├── LINGOlegacy (flagship identity, account, wallet architecture, community)
├── LINGOlane (designs, promotions, apparel, Laundry-Cycle)
├── LINGOslots (That’s My Lingo, Spades Is My Lingo, Uhno Lingo U-No, Cashman Lingo Mania, Lingo Lions Eruptions)
├── LINGOarcade (Tricias Escape, Doughboys Oasis, Crazy Weasols, Silly in Philly, Jersey Shore: The Undead)
├── LINGOlibrary (KottonsCode, The Block I Grew Up On, Say It Again, Dice Shift Hotel, Legacy Legends)
├── LINGOmedia (Rise of Zavione P1/P2 and creative media)
├── LINGOworld (LINGOai, askLINGO, LINGOboom, LINGOtravel, LINGOcampus, LINGOsupport, LINGOwifi, LINGOvoice, LINGOshield, LINGOlounge, LINGOdonations)
└── LegacyXclub
```

This tree is a portfolio and ownership map, not a claim that every named product is implemented, funded, launched, or production-ready. KottonsCode remains its own IP/world while its book and interactive experiences may also be catalogued through LINGOlibrary.

## 2. LLG Tech Corps — preserved five-department structure

1. **AI Systems** — provider adapters, gateway, routing, comparison, agents, privacy and model evaluation.
2. **Software Engineering** — web/mobile/backend architecture, product engineering, APIs, code quality and GDeveloper.
3. **Cloud & Infrastructure** — Cloudflare edge, Firebase/Google Cloud services, environments, CI/CD and observability.
4. **Cybersecurity** — identity boundaries, secrets, threat modeling, secure SDLC, incident response and defensive monitoring.
5. **Research & Innovation** — feasibility, prototypes, benchmarks, accessibility research and emerging technology evaluation.

**GDeveloper** is the Game Developer discipline within Software Engineering. It is distinct from Google Developer Services. Google Developer Services means Firebase, Google Cloud, SDKs and developer APIs; it is infrastructure/tooling, not the GDeveloper division.

## 3. Shared AI architecture

The LLG AI Command Center comprises AI Chat, AI Compare, AI Agents and AI Developer. It can expose OpenAI, Anthropic Claude, Google Gemini and xAI Grok as independently selected providers.

- All clients call LLG-owned server-side endpoints; no provider key in a browser, mobile app, game build, source map or public repository.
- Provider credentials, model IDs, budgets, flags, rate limits and telemetry are isolated per provider.
- Modes: individual provider; side-by-side comparison; coordinated workflow with declared task boundaries and explicit approvals.
- No silent fallback. Provider outages fail closed and are surfaced clearly.
- A provider response is not forwarded to another provider unless the user explicitly authorizes that workflow.
- Agents use least privilege, bounded inputs/outputs, scoped tools, budget ceilings, audit events and human approval for consequential actions.
- Private conversation content is not shared across providers by default. Data retention, training, region and subprocessors must be reviewed provider-by-provider.
- Provider activation requires owner approval, credential provisioning, budget authorization, privacy/security review, staging integration tests and retrievable evidence.

## 4. Platform baseline

| Layer | Standard direction | Control |
|---|---|---|
| Source | GitHub canonical repository | Branch + PR + commit evidence |
| Edge/API | Cloudflare Workers | No production route/deploy change without release authorization |
| Backend/identity | Firebase / Google Cloud | Verify project, app IDs, rules and data owner first |
| Web | React / Next.js or existing native runtime | Per-product decision record |
| Mobile | Flutter | Real app registration and device QA required |
| Games | Unity, Unreal Engine 5, or web engine per title | GDeveloper engine decision record |
| AI | LLG-owned provider gateway | Server-side secrets, independent adapters |
| Assets | Git LFS + approved asset pipeline | Rights, provenance, checksum and version manifest |
| Data | Firestore, SQL, D1 only by explicit decision | Schema, retention, access and migration plan |

Free-tier-first is the default procurement posture. No new paid service, provider spend, database instance or subscription is activated without explicit budget and account authorization.

## 5. Application architecture contract

Every application plan must declare:
- portfolio owner, product owner, intended audience, product status and canonical name;
- user journeys, supported platforms and accessibility requirements;
- frontend, backend, identity, data stores, edge/API and environment boundaries;
- AI provider usage, user consent, privacy, data retention and spend policy, or explicit “no AI” status;
- shared identity/profile/progression integrations, with explicit separation of wallet, commerce and rewards;
- API contracts, schema ownership, migration and backup/recovery strategy;
- security threat model, secret inventory, permissions and incident path;
- asset rights/provenance and content moderation requirements;
- test matrix, acceptance gates, rollback and operational owner;
- status labels that distinguish concept, design, prototype, staging, verified production.

A product may reuse shared services, but it must not inherit permissions, wallet balances, payment entitlements, user data or release approval implicitly from another product.

## 6. Governance and authority

- GitHub is the source of truth. Work proceeds on scoped branches and pull requests.
- Main/production is not a scratchpad. Preserve the last-known-good state.
- PROTECTED HOLD remains in force; G02 remains FAIL / UNVERIFIED; downstream G03–G11 remain held until their own criteria are met.
- No merge, production deployment, DNS/route mutation, provider activation, payment/prize activation, or irreversible data migration is authorized by this architecture document.
- Production changes require exact commit/build/environment/artifact correlation, independent verification, human approval, rollback readiness and a recorded authorization.
- A proposed change, code presence, passing local test, green badge or “ready” label alone is not acceptance.
- Security incidents and exposed credentials are handled before runner activation or privileged automation.

## 7. Release evidence lifecycle

`SCOPE → DESIGN → SOURCE → BUILD → TEST → SECURITY → ACCESSIBILITY → RIGHTS/COMPLIANCE → INDEPENDENT QA → ACCEPTANCE → AUTHORIZATION → CONTROLLED RELEASE → MONITORING`

Each gate must have retrievable evidence tied to the exact source commit, build, environment and artifact. Failed or unavailable evidence leaves the gate blocked.

## 8. Decision records and change control

Architecture deviations require a short ADR with context, options, decision, owner, cost, risk, migration and rollback. Product-specific choices may differ where justified; shared contracts for identity, privacy, security, telemetry, evidence and release governance remain consistent.

## 9. Linked standards

- [LLG Tech Corps AI & Game Development Foundation](LLG-TECH-CORPS-FOUNDATION.md)
- [Application Architecture Register](LLG-APPLICATION-ARCHITECTURE-REGISTER.md)
- [GDeveloper Game Development Execution Standard](../studio-sites/GAME-DEVELOPMENT-EXECUTION-STANDARD.md)
- [Game Master Tree](../studio-sites/GAME-MASTER-TREE.md)

**Disposition:** reference standard proposed for review. No operational activation or production release is implied.