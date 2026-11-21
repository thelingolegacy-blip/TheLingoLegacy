# LINGOlegacy Enterprise Strengthening Master Plan

**Version:** 1.0.0 · **Date:** 2026-10-31 · **Status:** Architecture and operating baseline; implementation gates remain open.

## Mission

Strengthen the LINGOlegacy ecosystem as one governed enterprise platform serving its products, studios, games, media, community programs, real-world retail and partner operations. The operating promise is **Loyalty. Learning. Love. Legacy.** Growth must be measurable, safe, inclusive and financially sustainable.

## Product canon

Preserve the approved hierarchy and spelling:
- **LINGOlegacy** — flagship identity, account, wallet and community.
- **LINGOlane** — Designs & Promotions, Apparel, Laundry-Cycle.
- **LINGOslots** — That's My Lingo, Spades Is My Lingo, Uhno Lingo U-No, Lingo Lions Eruptions, Cashman Lingo Mania.
- **LINGOarcade** — Tricias Escape, Doughboys Oasis, Crazy Weasols, Silly in Philly: The Streets, Jersey Shore: The Undead.
- **LINGOlibrary** — KottonsCode, The Block I Grew Up On, Say It Again, Dice Shift Hotel, Legacy Legends.
- **LINGOmedia** — Rise of Zavione P1 The Foundation / P2 The Metropolis.
- **LINGOworld** — LINGOai, askLINGO, LINGOboom, LINGOtravel, LINGOcampus, LINGOsupport, LINGOwifi, LINGOvoice, LINGOshield, LINGOlounge, LINGOdonations.
- **LegacyXclub** — membership/community experience.

Do not rename LINGOarcade back to LINGOarena. No star symbol in product names and no Duolingo comparisons.

## Enterprise capability model

1. **People and workforce:** role catalogue, onboarding, training, competency checks, shift readiness, incident escalation, safety and performance coaching.
2. **Hosts and infrastructure:** documented service ownership, health checks, capacity, backups, patching, access reviews and disaster recovery.
3. **Bots and agents:** scoped service identities, tool allowlists, rate limits, audit trails, human approval for consequential actions and kill switches.
4. **Transportation:** asset/vehicle records, dispatch, maintenance, route planning, accessibility, safety checks and delivery proof.
5. **Storage:** inventory locations, custody, lot/serial tracking where relevant, environmental controls, access logging and reconciliation.
6. **Recovery:** incident command, backup restore, business continuity, evidence preservation, communications and post-incident learning.
7. **Gaming:** separate entertainment, promotional sweepstakes and any regulated activity; no real-money wagering activation without a distinct legal and regulatory program.
8. **Math and logistics:** governed pricing, unit economics, demand/capacity planning, inventory reorder points, scheduling, route optimization and KPI definitions.
9. **Graphics and studio:** reusable design tokens, approved asset registry, production pipeline, versioning, accessibility, sound and motion standards.
10. **Commerce and community:** retail partner onboarding, service catalogues, proposals, community impact measurement and transparent sponsor terms.

## Reference architecture

- **Experience layer:** mobile-first Universe Gateway / Studio Hub; product-specific apps and responsive web.
- **Identity layer:** one verified identity service with MFA, role-based access, consent, session management and recovery.
- **Application layer:** independently versioned product services with stable API contracts.
- **Data layer:** purpose-specific data stores, schema ownership, migration history, encryption, retention and export controls.
- **Edge and delivery:** Cloudflare-first production architecture, controlled routes, caching and observability; no Vercel substitution.
- **Build and release:** GitHub source control, CI evidence, staging acceptance, signed artifacts and explicit promotion authority.
- **Integration layer:** documented contracts, webhook signatures, retries/idempotency, dead-letter queues and vendor ownership.
- **Operations layer:** dashboards, alerting, incident command, runbooks, backup restore drills and change records.

## Operating standards

- Every service has an owner, purpose, data classification, dependency map, SLO, runbook, backup/restore test, access model and decommission path.
- Every production change has a change record, peer review, test evidence, rollback plan and explicit approval.
- Every financial or participant-affecting action is idempotent, logged and reconcilable.
- Every bot uses a dedicated identity and least privilege; no shared human credentials.
- Every asset has provenance, licensing status and approved usage scope.
- Every community-facing offer states price, terms, eligibility, privacy practices and support route clearly.

## Studio-grade interaction baseline

- Design for phone-first, then tablet/desktop; preserve consistent navigation and responsive behavior.
- Functional buttons must have real destinations/actions, accessible labels, focus states, loading, success, error and disabled states.
- Background audio is optional, off by default, user-controlled, and stops on navigation or when the app is backgrounded where appropriate.
- Animation supports reduced-motion preferences and never carries essential information alone.
- Pop-ups are accessible, dismissible and non-deceptive.
- Print support is provided for forms, invoices, schedules, campaign rules, receipts and approved business proposals; print output is clean and branded.
- Provide empty, loading, offline, permission-denied and failure states, not just ideal-path mockups.
- Visual target: Industrial Noir / Crimson Shadow for Studio; product-specific palettes such as bright, child-appropriate KottonsCode. Maintain a shared token system.

## Security and trust baseline

- MFA for privileged accounts; RBAC/ABAC for sensitive operations; separation of duties for finance, prizes, moderation and release.
- Secure session lifecycle, CSRF protection, input validation, output encoding, rate limiting, dependency scanning and secret management.
- Data minimization, purpose limitation, consent records, retention schedules and tested deletion workflows.
- No sensitive data in URLs, logs, public analytics, or client-side bundles.
- No payment processing or wallet value movement without a reviewed ledger, reconciliation, fraud controls and required compliance.
- No public launch claim until real deployments and independent acceptance evidence exist.

## Delivery and definition of done

A capability is complete only when:
1. Source is in the correct canonical folder and linked from its index.
2. Requirements, ownership, data contracts and threat model are documented.
3. Functional implementation exists (not only a mockup).
4. Unit, integration, accessibility, security and failure-path tests pass.
5. Staging deployment is observed and verified on target devices.
6. Logs, metrics, artifacts and rollback evidence are retrievable.
7. An independent reviewer records acceptance.
8. Promotion is separately authorized.

## Current known constraints (2026-10-31)

- G02 runner/host acceptance remains BLOCKED/UNVERIFIED; recent GitHub Actions runs fail before job instantiation and have empty jobs/artifacts. Do not infer root cause or call this accepted.
- Firebase options contain placeholders; actual project credentials/services are not verified. Never fabricate keys.
- Android Gradle scaffolding and iOS project are incomplete stubs; native build readiness is not established.
- Cloudflare apex DNS currently shows reserved documentation address 192.0.2.0; do not guess a replacement.
- D1 `lingo-production` has application tables; schema, security, migrations and backup readiness remain unaccepted. `world-engine-db` has no application schema observed.
- AppDeploy Studio Hub and Studio Runtime are staging surfaces with prior successful QA, not production acceptance.
- Production, last-known-good, routes, DNS, secrets, billing and promotion remain protected until the exact gates pass.

## Roadmap waves

- **Wave A — foundation:** service inventory, folder/index cleanup, roles, secrets, CI evidence, observability, data classification.
- **Wave B — experience:** responsive design system, real interactions, accessibility, print, media controls, download/registration flows.
- **Wave C — operations:** workforce academy, host/agent controls, storage/transport workflows, recovery drills.
- **Wave D — products:** game catalog and safe economy, studio media pipeline, retail/community partner CRM and pitch kits.
- **Wave E — revenue:** transparent ads, sponsorships, commerce, subscriptions where appropriate; sweepstakes only after legal approval.
- **Wave F — release:** device QA, security review, independent evidence, staged production acceptance and authorized promotion.

This plan is the organizing baseline. It does not claim that all listed systems are implemented or live.
