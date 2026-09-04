# THE LINGO LEGACY — MASTER EXECUTION BLUEPRINT

Status: STAGED / FAIL-CLOSED
Date: 2026-09-04

## 1. Mission

Bring the Lingo Legacy platform to a studio-grade, premium, dynamic production standard across frontend, backend, mobile, edge, data, creative, games, commerce, education, and world experiences.

## 2. System boundary

GitHub is the source of truth. Flutter is the mobile/super-app layer. Cloudflare is the edge/runtime layer for the canonical web surface. Firebase is used only where an actual Firebase project/configuration exists. Creative tooling feeds approved assets into the repository through an auditable asset registry.

## 3. Waves

### Wave 0 — Foundation
Repository inventory, branch discipline, architecture map, environment contracts, secrets policy, dependency manifests, CI evidence, LKG protection.

### Wave 1 — Core Platform
Lingo ID, Universal Legacy Wallet, XP, Rewards, shared runtime contracts, responsive shell, API health/runtime/manifest/status surfaces.

### Wave 2 — Experience Products
That’s My Lingo, Loyalty Lane, Kotton’s Code, LingoCampus, Lingo Legacy HQ, Sonic Boom, commerce and media surfaces.

### Wave 3 — Universe
World registry, character/entity worlds, portals, world-specific themes, scene definitions, asset manifests, animation and audio hooks, sealed/exclusive realms.

### Wave 4 — Studio
Asset pipeline, generator contracts, campaign/promo generation, component library, motion system, accessibility, localization-ready content contracts.

### Wave 5 — Data + Intelligence
Dynamic configuration, event telemetry, progression, personalization, analytics, operational dashboards, error reporting and audit evidence.

### Wave 6 — Hardening
Dependency audit, static validation, runtime probes, API contract checks, Cloudflare binding validation, Firebase validation where present, Flutter analyze/test where present, performance and accessibility checks.

### Wave 7 — Release Candidate
Immutable release manifest, evidence bundle, deployment candidate, smoke tests, live probes, rollback/LKG verification.

### Wave 8 — Production Promotion
Only after an actual GitHub runner executes the complete gate and produces verifiable evidence: repair → validation → Cloudflare/Firebase deployment → live probes → certification → activation.

### Wave 9 — Post-Activation Operations
Monitoring, error budgets, incident response, release notes, asset/version registry, scheduled maintenance, controlled rollback.

## 4. Sprint structure

Every wave is executed as:

DISCOVER → SPECIFY → BUILD → INTEGRATE → TEST → EVIDENCE → REVIEW → PROMOTE

No phase may be represented as complete solely because files exist. Completion requires executable evidence appropriate to the phase.

## 5. Production quality bar

- Dynamic data/configuration rather than hard-coded production state.
- Responsive web and Flutter-ready architecture.
- Typed API contracts.
- Secure secret handling.
- Accessible interaction and reduced-motion behavior.
- Lazy-loaded noncritical media.
- Image optimization and explicit alt text.
- World-specific visual identity.
- Optional, user-controlled audio.
- Animation with performance limits and reduced-motion fallback.
- Deterministic build artifacts.
- Health checks and live probes.
- Auditable deployment evidence.
- LKG-preserving rollback path.

## 6. Master folder contract

```text
.github/workflows/          CI/CD and evidence gates
apps/                       application surfaces
packages/                   shared Flutter/core packages
config/                     non-secret runtime configuration
config/universe/            world and creative contracts
src/                        web/edge application source
functions/                  backend functions when present
firebase/                   Firebase rules/indexes/functions when present
assets/                     approved production media
assets/worlds/              world-specific media
assets/characters/          character/entity media
assets/audio/               approved audio hooks/assets
assets/animation/           motion definitions
scripts/                    deterministic validation/repair/probe tools
docs/                       blueprints, runbooks, architecture
release/                    release manifests and evidence
```

Directories are targets, not proof that an implementation exists. No fabricated service credentials, Firebase project IDs, Cloudflare IDs, or binary assets are created by automation.

## 7. Dynamic-site contract

The site must expose data-driven navigation, world cards, feature modules, runtime status, configuration, asset manifests, and content modules. UI components consume versioned contracts instead of duplicating world metadata in markup.

## 8. Generator contract

Generators produce or register: worlds, images, visual scenes, animation presets, sound hooks, scene compositions, and promotional assets. Generated output must pass metadata, accessibility, provenance, and size/performance checks before promotion.

## 9. Gate policy

RUNNER_GATE requires a real GitHub runner, executable job, and complete execution evidence. A failed or absent runner blocks repair/deploy/activation. DEPLOYMENT_MUTEX remains locked and LKG remains untouched until the authoritative gate passes.

## 10. Activation definition

ACTIVATED means the production deployment completed from the verified candidate, live probes passed, certification evidence exists, and the release is explicitly promoted. Anything before that is BUILDING, STAGED, CANDIDATE, or BLOCKED—not live activation.
