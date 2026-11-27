# LINGO Legacy Enterprise Platform Blueprint
**Canonical architecture and cross-platform design specification**  
**Revision:** 2026-11-24  
**Status:** Proposed target architecture; implementation and runtime acceptance are tracked separately  
**Parent:** THE LINGO LEGACY — One Legacy. Many Worlds.  
**Canonical Core:** `thelingolegacy-blip/TheLingoLegacy`  
**Connected Web:** `thelingolegacy-blip/TheLingoLegacy-Web`

## 1. Purpose and authority

This blueprint defines one enterprise target for the LINGO portfolio across web, iOS, Android, tablets, connected television, APIs, edge services, identity, data, AI, commerce, games, media, and operations.

It is a canonical design contract, not a declaration that every product is built or released. Existing working assets and production behavior remain protected. Core owns shared contracts and governance; each product owns its experience and domain logic; each runtime has a named deployment and environment boundary.

**Decision rule:** launch what is safe; complete what is unfinished; improve what is touched; protect what already works.

## 2. Canonical platform map

```text
THE LINGO LEGACY (portfolio governance, identity, design, release authority)
|
+-- LINGO CORE
|   +-- Identity, profiles, sessions, tenant and entitlement contracts
|   +-- SAAAE authorization, approvals, audit and policy decision services
|   +-- API gateway, service registry, event contracts and observability
|   +-- Universal Legacy Wallet interfaces (demo and real-value domains isolated)
|
+-- EXPERIENCE CHANNELS
|   +-- Web: Next.js / React / TypeScript on Cloudflare Workers via OpenNext
|   +-- iOS / Android / Tablet: Flutter clients, platform-secure storage
|   +-- Connected TV: remote-first, ten-foot UI, LG webOS target
|   +-- Responsive PWA surfaces where a native install is not required
|
+-- PORTFOLIO DOMAINS
|   +-- LINGOflagship: account, profile, wallet shell, community, gateway
|   +-- LINGOlane: apparel, designs/promotions, laundry-cycle services
|   +-- LINGOslots: That’s My Lingo and related virtual-credit game experiences
|   +-- LINGOarcade: casual and narrative games
|   +-- LINGOlibrary: books, reading, learning and Kotton’s Code
|   +-- LINGOmedia: Rise of Zavione and media production
|   +-- LINGOworld: askLINGO, communications, travel, campus, support, Wi-Fi
|   +-- LegacyXclub and approved future ventures
|
+-- PLATFORM SERVICES
    +-- Cloudflare Workers / D1 / R2 / KV / Durable Objects as justified
    +-- Firebase only for verified existing identity/data integrations
    +-- GitHub source, review, CI, provenance and release records
    +-- Monitoring, backup/restore, support, privacy and incident response
```

### Authority boundaries

- **Core repository:** canonical contracts, shared security rules, service interfaces, architecture records, release gates.
- **Web repository:** web presentation, routes, server-rendered experience and Web-specific runtime.
- **Flutter/mobile source:** iOS, Android and tablet client behavior; preserve Android minSdk 21 unless compatibility evidence supports a change.
- **Product domains:** own product-specific business rules, content, assets and acceptance tests; they do not independently redefine identity, authorization, wallet or audit contracts.
- **Cloudflare:** primary edge/runtime platform. Do not introduce a competing production host or AppDeploy path.
- **GitHub:** source of truth for code, pull requests, checks, release notes and evidence.
- **Firebase:** retain only where a specific, verified product integration requires it; production and staging identities must never be inferred from names or defaults.

## 3. Environment and trust model

| Environment | Purpose | Allowed data | Release rule |
|---|---|---|---|
| Local | Developer iteration | Synthetic/local fixtures | No production credentials |
| Preview | Branch review | Synthetic or approved redacted fixtures | Isolated, expiring, no production routes |
| Staging | Integration and acceptance | Synthetic/test accounts | Separate project, DB, keys and identities |
| Production | Customer-facing service | Approved production data | Explicit release authorization and rollback |

Every resource must have a registry entry containing owner, repository, environment, provider/resource ID, data classification, bindings, network exposure, monitoring, backup/restore method, dependencies, and evidence link. Unknown values remain **UNVERIFIED**, never guessed.

## 4. Shared service contracts

### Identity and access
- Use stable subject and tenant identifiers; do not use email as the authorization key.
- Validate issuer, audience, signature, expiry, not-before, key rotation and token revocation at trusted server boundaries.
- Enforce tenant, product, resource and operation grants server-side.
- Default deny. A hidden or disabled UI control is not an authorization check.
- Separate human requester, independent human reviewer and workload executor identities.
- Require approval records bound to an immutable action digest, scope, expiry and idempotency key.
- Persist decision and mutation audit events atomically; fail closed if required audit persistence fails.

### API and events
- Publish versioned OpenAPI contracts and generated client compatibility rules.
- Use idempotency keys for retriable mutations.
- Define event owner, schema version, producer, consumer, delivery semantics, retention and replay policy.
- Use bounded retries, backoff, dead-letter handling and explicit replay authorization.
- Expose liveness and readiness separately; readiness must verify required dependencies.
- Keep internal administrative APIs off public routes.

### Wallet and value
- Maintain separate ledgers and authorization domains for demo credits, loyalty value and any future real-value activity.
- Current That's My Lingo Studio Mode remains preview-only virtual-credit gameplay: no wagering, cash-out, prize redemption or conversion to monetary value.
- No payment, cashout or real-value rewards are enabled by this blueprint.
- Ledger mutations require server authority, immutable transaction identifiers, idempotency and reconciliation.

## 5. Cross-platform experience and design system

### Visual direction
Use the approved Industrial Noir / Crimson Shadow language as the portfolio foundation, with controlled gold accents for premium surfaces. A restrained alternate Command Tower Noir direction may be used for enterprise administration. Avoid decorative stars in product names and avoid Duolingo comparisons.

### Design tokens
```css
:root {
  color-scheme: dark;
  --ll-bg: #050507;
  --ll-surface: #0A0A0C;
  --ll-surface-raised: #151519;
  --ll-text: #F5F5F7;
  --ll-muted: #A7A7B0;
  --ll-border: #303038;
  --ll-crimson: #C41E3A;
  --ll-gold: #D4AF37;
  --ll-gold-bright: #F7C84B;
  --ll-purple: #4B2E83;
  --ll-focus: #F7C84B;
  --ll-radius-sm: 8px;
  --ll-radius-md: 14px;
  --ll-radius-lg: 22px;
  --ll-space-1: 4px;
  --ll-space-2: 8px;
  --ll-space-3: 12px;
  --ll-space-4: 16px;
  --ll-space-6: 24px;
  --ll-space-8: 32px;
  --ll-motion-fast: 120ms;
  --ll-motion-standard: 220ms;
}
```

### Component standards
- Establish tokens for color, typography, spacing, elevation, borders, motion, icon sizing and responsive breakpoints.
- Use accessible contrast, visible focus, semantic headings, keyboard navigation, reduced-motion support and screen-reader labels.
- Use glassmorphism selectively; never sacrifice text contrast or input clarity.
- Standardize navigation, cards, buttons, forms, dialogs, toasts, empty/error/loading states, account controls and permission-denied states.
- Every interactive control must have a defined action, loading state, success state, error state and disabled state.
- Motion and sound are opt-in enhancements; core tasks must remain usable with motion and sound disabled.
- Keep product identity distinct within the shared system through approved logo, imagery, accent and content rules.

### Channel-specific behavior
- **Web:** responsive from small mobile through ultrawide desktop; SSR/API boundaries explicit; no static export assumption.
- **iOS/Android/tablet:** native navigation conventions, secure token storage, lifecycle-aware sessions, offline-safe read behavior and accessible touch targets.
- **Connected TV / LG webOS:** ten-foot layout, large typography, focus rings, directional remote navigation, predictable back behavior, short interaction paths and no hover-only affordances.
- **Admin/control tower:** dense but legible tables, audit timelines, clear environment badges, explicit destructive-action confirmation and separation of read-only from mutation controls.

## 6. Product registry and acceptance ownership

| Portfolio | Canonical responsibility | Minimum acceptance |
|---|---|---|
| LINGOflagship | Entry, account, profile, community, wallet shell | Identity isolation, navigation, profile privacy, session lifecycle |
| LINGOlane | Apparel, promotions, laundry-cycle service discovery | Catalog accuracy, service-area validation, checkout boundaries, accessibility |
| LINGOslots | Virtual-credit game experiences | Deterministic math contract tests, server-authoritative state before any competitive/live mode, demo-only value boundary |
| LINGOarcade | Casual/narrative games | Save-state integrity, content rights, gameplay QA, device performance |
| LINGOlibrary | Books, reading and learning | Content rights, reading accessibility, progress privacy |
| LINGOmedia | Media and production | Rights/consent, publishing workflow, asset provenance |
| LINGOworld | askLINGO and global communication/services | Provider isolation, identity scope, privacy, abuse controls, service-specific acceptance |
| LegacyXclub | Membership/community experiences | Eligibility, privacy, billing boundary, moderation and audit |

A product is not accepted because its folder, route, mockup, database or Worker exists. It requires an identified owner, a supported user journey, a passing test set, security review, data handling review, monitoring and rollback.

## 7. Runtime and provider blueprint

### Cloudflare
- Keep the existing apex/www production route owner and last-known-good deployment unchanged until a candidate has provenance, compatibility, binding, route, smoke, rollback and independent acceptance evidence.
- Keep preview Workers and staging Workers isolated from production routes.
- Use D1 migrations only after schema diff, backup/restore proof, dry-run, constraint tests, rollback plan and staging approval.
- Use R2 for object assets where needed; use KV only for non-authoritative cache/configuration; use Durable Objects only where coordination/state semantics require them.
- Keep secrets in provider secret stores; never commit them to source, docs, logs or artifacts.

### GitHub
- Require protected branches, independent reviews, CODEOWNERS, least-privilege workflow permissions and immutable provenance.
- CI acceptance requires an instantiated provider job, runner identity, executed steps, retrievable logs and a downloadable commit-correlated artifact with checksum.
- A workflow run with zero jobs is an admission failure, not a test result.
- G02 remains quarantined until its own independent image-build and runner acceptance passes.

### Firebase
- Maintain distinct production and staging project identities, configuration, auth clients and service credentials.
- Validate project existence, allowed domains, API enablement and runtime bindings before any deployment.
- Never copy production customer data into staging; use synthetic fixtures.

## 8. Mobile, TV and browser release matrix

| Target | Required validation |
|---|---|
| Chrome / Edge / Firefox / Safari | Current supported versions, routing, auth, accessibility, performance |
| iOS | Supported device/simulator matrix, secure storage, deep links, lifecycle and signing |
| Android | minSdk 21 compatibility, current API levels, secure storage, back navigation, signing |
| Tablet | Responsive layout, orientation, split-screen and touch/keyboard |
| LG webOS TV | Remote focus graph, back/exit behavior, resolution, memory/performance and store policy |
| PWA | Install/update/offline behavior and cache invalidation |

Do not claim platform support until a real build and target-specific test evidence exist.

## 9. Security, privacy and resilience controls

- Threat-model public APIs, admin operations, identity, wallet, games, uploads, AI prompts and provider webhooks.
- Classify personal data and document purpose, lawful basis/consent where applicable, retention, deletion, access and export.
- Minimize collection; redact tokens and personal data from logs; define access review and audit retention.
- Run SAST, dependency/SCA, secret scanning, license review, SBOM and artifact provenance checks.
- Define SLOs, error budgets, alerts, incident owners, escalation and customer communications.
- Encrypt backups; perform restore drills and document recovery point/time objectives.
- Test load, soak, dependency failure, retry storms, queue backlogs and partial migration rollback.
- Record accepted residual risks with named owner and expiry/review date.

## 10. Delivery sequence and parallel workstreams

These workstreams may proceed in parallel where dependencies permit. A downstream gate cannot be marked complete until its upstream evidence exists.

1. **Governance and inventory:** canonical registry, ownership, dependencies, access and protected baseline.
2. **CI admission:** resolve account/repository policy or provider-side admission issue; prove jobs, steps, logs and artifacts independently in Core and Web.
3. **Core contracts:** identity, SAAAE, APIs, events, wallet boundaries, observability and versioning.
4. **Cloudflare staging:** verify resource identity, bindings, migrations, worker health and rollback in isolated staging.
5. **Web experience:** complete responsive routes, API integration, browser/accessibility QA and preview provenance.
6. **Mobile and TV:** integrate versioned contracts; execute platform build, device and remote-control tests.
7. **Portfolio integration:** migrate product surfaces in low-risk cohorts with per-product acceptance.
8. **Security/privacy:** threat model, data classification, retention, supply-chain evidence and independent review.
9. **Operations:** monitoring, backup/restore, DR, support, capacity and cost guardrails.
10. **Release certification:** exact commit/configuration, approvals, tests, live probes, rollback and post-release monitoring.

## 11. Current verified blockers carried forward

The following are known from the 2026-11-24 live inventory and must not be silently treated as resolved:

- GitHub Actions in Core and Web has repeated pre-job `startup_failure`; latest inspected Core runs had zero jobs and zero artifacts.
- Core reconstruction PR #664 is draft/unmerged.
- Web PR #50 has a recorded successful branch preview build and 4/4 tests, but browser/device QA and public route ownership remain unverified.
- The game-engine staging Worker is absent from the live Worker inventory.
- The game-engine staging D1 database lacks the six SAAAE tables; the migration in PR #658 has not been applied.
- The askLINGO staging D1 database has the six SAAAE table definitions, but runtime enforcement is not certified.
- The SAAAE privileged Access application has zero policies; independent requester/reviewer identities and a separate workload identity are not established.
- The sole returned Cloudflare account member has account-level 2FA disabled.
- The active production Core Worker deployment is v137; uploaded v378 is not evidence of production readiness and has not been promoted.
- Production schema privacy/retention review is required before migration or new integration.
- The production release hold remains in force until the controlling owner record is updated with verified evidence and release gates are accepted.

## 12. Definition of done

A work item may be marked **VERIFIED COMPLETE** only when its record includes:
1. canonical repository and exact commit SHA;
2. environment and provider resource identifiers;
3. executed workflow/job/test identifiers and timestamps;
4. retrievable logs and artifacts, with integrity/checksum where applicable;
5. functional, security, privacy and compatibility results;
6. independent reviewer/owner acceptance;
7. monitoring, backup/restore and rollback evidence;
8. explicit release authorization for any protected production action.

Use only these status labels: **VERIFIED**, **PRESENT**, **UNVERIFIED**, **BLOCKED**, **FAIL**, **NOT APPLICABLE**. Do not use “complete,” “mastered,” “deployed,” “registered” or “released” as a status unless the corresponding evidence exists.

---
This blueprint is the canonical target specification for reconciliation. It does not itself create accounts, register devices, purchase domains, provision identities, change provider settings, deploy code, migrate data or release production.
