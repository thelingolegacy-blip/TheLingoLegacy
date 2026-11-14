# LINGO Master Production System Integration v1

**Date:** 2026-11-14  
**Status:** PROPOSAL / REVIEW REQUIRED / NON-PRODUCTION  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Branch:** `feat/master-production-system-integration-2026-11-14`  
**Production disposition:** PROTECTED HOLD  
**Release authority:** Existing Enterprise Completion Control Tower and release gates remain authoritative.

## 1. Purpose

Connect the portfolio entity catalog, game production, creative assets, pipelines, schedules, evidence, infrastructure and release controls into one traceable operating model. This document adds integration rules and reusable working templates. It does not establish a competing product registry, command center, identity authority, data authority or release authority.

## 2. Existing authority map — reconcile, do not duplicate

| Concern | Existing authority / record | Integration rule |
|---|---|---|
| Portfolio inventory and dependency graph | PR #511 | Use its canonical inventory and dependency identifiers after review/acceptance; do not create a second entity master. |
| Enterprise execution and acceptance | Issue #517 | Route work packages, owners, evidence and acceptance through the existing control tower. |
| Main Hub / Resource Center / Release Center | Issue #552 | Treat as the enterprise management surface; do not create parallel control centers. |
| Sovereign creation, rights and provenance | Issue #580 / LSCOI proposal in PR #569 | Asset and invention records must link to rights/provenance evidence. |
| Cross-stack recovery and release blockers | Issues #480 and #575 | Recovery restrictions supersede ordinary production scheduling. |
| Existing master control matrix | `config/lingo-master-control-matrix.json` | Existing page/surface and release-control source; extend only through reviewed schema changes. |
| Canonical source and runtime | GitHub `main`; Cloudflare Worker `thelingolegacyv-5` | GitHub is source of truth; Cloudflare is intended production edge. |

The referenced PRs and proposals remain subject to their own review and acceptance status. A reference to a draft is not approval of its contents.

## 3. Canonical data model

Use stable identifiers and explicit relationships. The templates in `templates/master-production/` are working ledgers, not competing master databases.

### 3.1 Entity and product references
- `EntityID` is a foreign key to the accepted portfolio registry.
- Until PR #511 is reconciled and accepted, IDs supplied in planning documents (for example `LL-HQ`, `LL-TML`, `LL-KOTTONS`) are provisional aliases only.
- Never silently rename, merge, delete or infer ownership of an entity.
- Keep product, division, capability, route, repository, runtime and provider records as distinct entity types connected by typed relationships.

### 3.2 Shared record envelope
Every operational record should carry, where applicable:
- `record_id`: globally unique immutable record identifier.
- `entity_id`: canonical portfolio entity foreign key.
- `workstream_id`: functional workstream from the existing execution router.
- `environment`: local, development, staging or production.
- `status`: controlled vocabulary, not free-form success claims.
- `owner_role`: accountable role; do not imply a named human is assigned.
- `source_ref`: repository path, issue, PR, provider record or approved file reference.
- `source_commit`: exact commit when code or build output is involved.
- `evidence_ref`: inspectable log, artifact, screenshot, test result or approval record.
- `created_at`, `updated_at`: ISO-8601 timestamps with timezone.
- `risk_level`, `next_safe_action`, `acceptance_gate`: decision support fields.

### 3.3 Controlled statuses
Use the existing control-tower vocabulary wherever it applies: `NOT STARTED`, `IN PROGRESS`, `BLOCKED`, `PASS — EVIDENCE LINKED`, `ACCEPTED`. A preview/deployment label is not acceptance. Documentation-only work cannot be marked runtime PASS.

## 4. Production workbooks and ledgers

The CSV templates are import-ready for Sheets, Excel or Airtable. They intentionally use foreign keys rather than duplicating the entity catalog.

| Template | Purpose | Primary key / links |
|---|---|---|
| `game-build-ledger.csv` | Per-game build, mechanics, audio, content, demo boundary and acceptance | GameBuildID, EntityID |
| `asset-request-queue.csv` | Visual, audio, animation, phrase, VO and source-asset requests | AssetRequestID, EntityID |
| `asset-provenance-ledger.csv` | Source master, variants, rights, hashes, approval and usage scope | AssetID, EntityID |
| `pipeline-register.csv` | Stage, dependencies, evidence and safe transitions | PipelineID, EntityID |
| `timesheet.csv` | Planned/actual effort and blockers | TaskID, EntityID |
| `timeline-milestones.csv` | Milestones and dependency-aware target windows | MilestoneID, EntityID |
| `evidence-ledger.csv` | Run/commit/job/artifact correlation and acceptance | EvidenceID, EntityID |

No template row is evidence by itself. Populate values from verified source records and keep unknown fields blank or explicitly `UNVERIFIED`.

## 5. Standard production pipeline

1. **Intake:** identify entity, user outcome, owner role, scope, environment and acceptance predicates.
2. **Specification:** record functional behavior, non-functional constraints, dependencies, data classification and demo/real-value boundary.
3. **Design and rights:** create approved design/asset requests; record provenance, licenses, consent and usage restrictions.
4. **Build:** implement on an isolated branch; pin toolchains and dependencies; avoid secrets in source.
5. **Validation:** run reproducible static, unit, integration, build, security, accessibility and content checks where applicable.
6. **Evidence:** capture exact commit, command, environment, timestamps, job/run IDs, logs, artifact digest and test results.
7. **Independent verification:** review the actual artifact and user journey; challenge gaps and negative cases.
8. **Acceptance:** accountable product owner and required specialist reviewers record acceptance.
9. **Promotion decision:** use existing release authority; a separate explicit production authorization is required.
10. **Post-release verification:** correlate deployed version to source commit and artifact; run live probes and verify rollback readiness.

A failed or unavailable gate routes to the existing blocker/recovery register. It must not be bypassed by changing a status label.

## 6. Game and asset production contract

Each game build records:
- game entity and build ID, version, target platform and build type;
- mechanics and deterministic test cases;
- character/animation, UI, visual, audio, music and voice-over dependencies;
- accessibility, performance, localization and content-rights checks;
- persistence, progression, anti-cheat and abuse cases where relevant;
- demo-only and real-value boundary flags;
- artifact checksum, test evidence, reviewer and acceptance decision.

Asset source masters must be kept separate from optimized runtime variants. Each asset needs a unique ID, source path, SHA-256, creator/contributor, ownership/rights basis, license, permitted territories/channels, consent where applicable, alt text/transcript, variant lineage and approval state. Possession or AI generation alone does not establish ownership or usage rights.

## 7. Value and safety boundaries

- That’s My Lingo and related casino-style demos remain virtual-credit only; credits are non-redeemable.
- No real-money wagering, cashout, prize eligibility or sweepstakes activation is included in this production package.
- Payment-provider test mode is distinct from live merchant activation.
- Wallet previews must not be described as a production ledger or cash-equivalent balance.
- Identity, entitlements, rewards and ledger writes must be server-authoritative and independently security-reviewed.
- Live payment, financial, legal or regulated functionality requires its own scoped approval and qualified review.

## 8. Stack Engine review findings — do not deploy the supplied draft unchanged

The proposed Stack Engine sample is an architecture sketch, not a verified drop-in implementation. Before code integration, reconcile it against the canonical `worker.js`, `wrangler.jsonc`, existing API contracts and active route inventory.

Specific issues to resolve:
1. The sample calls `env.ASSETS.fetch()` for an internal manifest API. A static asset binding is not an internal Worker service router; use a direct internal function or a separately authenticated service binding with an explicit contract.
2. The sample's `routeRequest()` dispatches `/api/v1/*` before static routing, but `/healthz` is not under that prefix. Its `healthz()` handler is therefore unreachable in the shown control flow.
3. `getStatus()` returns a hardcoded `operational` state. Status must derive from verified dependency and runtime checks and must distinguish degraded, blocked and unknown.
4. `getRuntime()` exposes binding names. Even without values, this should be an explicit, minimized diagnostic contract, not an unrestricted production endpoint.
5. `getModules()` reports hardcoded registrations. Module discovery must reflect actual registration and validation state.
6. The sample's `isRealValuePath()` is a short prefix list. A real-value deny/allow policy must cover route aliases, methods, API paths, webhooks, background jobs and server-side actions.
7. The proposed `wrangler.jsonc` uses root directory `.` for assets. Public asset inclusion/exclusion must be verified; do not publish repository source, docs, secrets, build metadata or control-plane files.
8. Security headers must be merged with existing response policy and tested against current CSP, caching and content-type behavior.

Do not replace the existing Worker or change its deployment identity as part of this documentation integration.

## 9. Release and change-control boundaries

This branch is documentation/template-only. It does not authorize:
- merge to `main`;
- GitHub Actions policy or branch-protection mutation;
- G02 runner registration, reset or activation;
- workflow dispatch or a claim that CI executed;
- Cloudflare Worker, DNS, route, binding or production deployment changes;
- Firebase/Supabase schema, rules, secrets or project mutation;
- Stripe live mode, Shopify publishing, payments, cashout or billing changes;
- public content publication or last-known-good replacement.

All work remains free-tier-first and must not incur new spend without separate approval.

## 10. Acceptance checklist for this package

- [ ] Reconcile field names and entity identifiers against PR #511 and existing enterprise schemas.
- [ ] Reconcile execution and release authority against issues #517 and #552.
- [ ] Reconcile asset rights/provenance against issue #580 / LSCOI.
- [ ] Validate CSV headers, foreign-key rules and controlled status vocabulary.
- [ ] Add automated schema/CSV validation only after the canonical schema owner approves the contract.
- [ ] Obtain independent architecture, security, privacy, product and operations review as applicable.
- [ ] Confirm all proposed code changes separately against the canonical Worker and current route/runtime contract.
- [ ] Keep G02 FAIL / UNVERIFIED and production HOLD until existing acceptance requirements are met.

## 11. Definition of done

The master production system is operational only when its canonical registry is accepted, ledgers have validated relationships, workflows have actual accountable owners, evidence is retrievable and correlated, independent reviews are recorded, and each product's acceptance gates are satisfied. This document and its CSV templates are a foundation for that work, not proof of operational completion.
