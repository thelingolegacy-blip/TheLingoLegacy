# LINGO Legacy Enterprise Completion Program

Version 1.0.0 | Prepared 2026-11-08 | Documentation baseline

## Mission
Consolidate the LINGO Legacy portfolio into a secure, observable, maintainable and expandable operating environment. Establish one authoritative catalog, shared contracts, explicit ownership, repeatable installation and recovery procedures, independent verification, and a credible public website release path.

Documentation, mockups, prototypes, CI configuration, deployment creation, or HTTP reachability do not equal production acceptance.

## Non-negotiable controls
- GitHub is canonical source of truth.
- Cloudflare is authoritative DNS and edge/runtime platform.
- Firebase is preferred identity/application data foundation where approved.
- React/Next web; Flutter mobile; Unity where game requirements justify it.
- Vercel is not a target for new LINGO production deployments.
- Preserve last-known-good deployments, rollback references, user data and audit records.
- No destructive reset, production mutation, credential rotation, route/secret change, payment enablement, migration or promotion without scoped authorization, pre-change evidence, rollback and verification.
- No physical electrical, mechanical, construction or life-safety work by software automation. Licensed professionals and authorities inspect, permit, install and sign off where required.
- Never expose secrets in source, logs, screenshots, issues or artifacts.
- Label every capability planned, prototype, staging, production, verified or accepted.

## Workstreams
| ID | Workstream | Deliverables |
|---|---|---|
| WS-00 | Governance & portfolio | Catalog, decision log, ownership, risk register |
| WS-01 | Architecture & Surface Matrix | Product/surface/dependency/evidence matrix and typed contracts |
| WS-02 | Website & public experience | Accessible sitemap, routes, content, SEO, forms |
| WS-03 | Identity & accounts | Authentication, authorization, session, recovery, privacy |
| WS-04 | Platform & infrastructure | Cloudflare, Firebase, storage, runtime, networking, telemetry |
| WS-05 | CI/CD & release | G00–G11 gates, runner, reproducible builds, artifacts, rollback |
| WS-06 | Security & safety | Threat model, secrets, dependency scanning, privacy, abuse controls |
| WS-07 | Games & experiences | Registry, game engine, gameplay, saves, rating and fairness |
| WS-08 | Commerce & finance | Shopify/Stripe, catalog, billing, refunds, reconciliation |
| WS-09 | Creative & media | Briefs, scripts, storyboards, assets, rights, render, delivery |
| WS-10 | Publishing & education | Books, learning products, accessibility, editorial, distribution |
| WS-11 | AI & digital services | Provider adapters, gateway, quotas, evaluation, safety |
| WS-12 | Community & support | Membership, moderation, support, privacy, incident response |
| WS-13 | Operations & maintenance | Runbooks, backups, patching, monitoring, restore drills |
| WS-14 | Launch & growth | Launch checklist, analytics, communications, support |

## Canonical portfolio segments
- LINGOlegacy: flagship identity, account, wallet architecture and community.
- LINGOlane: Designs & Promotions, Apparel, Laundry-Cycle.
- LINGOslots: That's My Lingo, Spades Is My Lingo, Uhno Lingo U-No, Lingo Lions Eruptions, Cashman Lingo Mania.
- LINGOarcade: Tricias Escape, Doughboys Oasis, Crazy Weasols, Silly in Philly, Jersey Shore: The Undead.
- LINGOlibrary: KottonsCode, The Block I Grew Up On, Say It Again, Dice Shift Hotel, Legacy Legends.
- LINGOmedia: Rise of Zavione and related media.
- LINGOworld: LINGOai, askLINGO, LINGOboom, LINGOtravel, LINGOcampus, LINGOsupport, LINGOwifi, LINGOvoice, LINGOshield, LINGOlounge, LINGOdonations.
- LegacyXclub: membership and community benefits.
- LINGOlegacy_MASTER: governance, legal, brand, creative, products, website, engineering, business, releases and archive.
- LLG Tech Corps: multi-provider AI gateway and engineering.

## Delivery phases
### P0 — Protect and discover
Inventory repositories, branches, workflows, deployments, domains, applications, data stores, integrations, files and archives. Capture UTC timestamps, source references, hashes, owners and environment labels. Identify exposed secrets, unsupported dependencies, stale routes, duplicate assets and unowned services. Exit with signed inventory, risk register, dependency graph, backup evidence and explicit unknowns.

### P1 — Canonical foundations
Establish product/service registry, versioned contracts, architecture decisions, roles, environment separation, audit log, change manifest, reproducible builds and artifact provenance. Exit with schema validation, ownership completeness, security review and CI evidence.

### P2 — Website and shared platform
Resolve exact-root/catch-all routing precedence. Build allowlisted output and runtime package. Verify staging routes, APIs, redirects, mobile/desktop, CSP/CORS and accessibility. Verify identity/data features or clearly disable them. Exit with route matrix, SLO checks, rollback drill and independent review.

### P3 — Revenue-ready products
Commerce, payments, tax, refunds and settlement remain sandboxed until legal, financial, security and reconciliation controls pass. Exit with end-to-end evidence, financial reconciliation, policy review and approval.

### P4 — IP portfolio and expansion
Build product vertical slices and reusable creative/engineering systems. Validate IP ownership, licenses, ratings, accessibility, moderation and platform compatibility. Exit with product-specific acceptance and support readiness.

## Required ownership
Every product, service, integration and procedure needs accountable owner, technical maintainer, business approver, data classification, support escalation, environment/dependencies, recovery owner, evidence and last verification time.

## Status vocabulary
PLANNED = scoped, no implementation evidence. PROTOTYPE = local/demo. STAGING = isolated non-production deployment. SERVING = endpoint responds, functionality may not be accepted. VERIFIED = defined checks passed with retrievable evidence. ACCEPTED = independent review. PRODUCTION = explicitly authorized and confirmed live. BLOCKED = dependency/control prevents progression. UNKNOWN = insufficient evidence.

## Completion criteria
Every in-scope workstream has owner, requirements, implementation reference, tests, security/privacy review, operational runbook, backup/restore plan, monitoring, cost owner, rollback and independent acceptance. Unknowns remain visible.
