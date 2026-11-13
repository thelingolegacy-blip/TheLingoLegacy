# LINGO Legacy Portfolio Repository & Change Inventory

**Snapshot date:** 2026-11-13  
**Scope:** Repositories visible to the connected GitHub identity under `thelingolegacy-blip`, plus all open pull requests and branch pages for the canonical `thelingolegacy-blip/TheLingoLegacy` repository.  
**Purpose:** Establish a measured consolidation baseline. This is an inventory, not authorization to delete, rename, archive, merge or rewrite anything.

## Executive inventory

| Measure | Observed value |
|---|---:|
| Owner repositories visible | 38 |
| Public repositories | 32 |
| Private repositories | 6 |
| Repositories with zero GitHub-reported size | 14 |
| Repositories with content | 24 |
| Open pull requests in canonical repository | 201 |
| Draft open pull requests | 150 |
| Non-draft open pull requests | 51 |
| Open pull requests targeting `main` | 178 |
| Canonical repository branches | 539 |
| Branches reported with legacy `protected=true` | 0 |
| Branches reported with legacy `protected=false` | 539 |

**Important interpretation:** GitHub’s repository `size` is reported in KB; zero size is a useful empty-repository signal, not a deletion instruction. The branch listing reports the legacy `protected` flag. It does not independently establish whether repository or organization rulesets apply. Do not infer that all branches are unprotected until rulesets are separately inspected.

## Repository inventory

| Repository | Visibility | Default branch | GitHub size | Snapshot classification |
|---|---|---|---:|---|
| `-the-lingo-legacy-hub` | public | `main` | 4 KB | Content present |
| `-the-lingo-legacy-master` | public | `main` | 5 KB | Content present |
| `Private repository 03` | private | redacted | redacted | Content present (details redacted) |
| `Backend` | public | `main` | 0 KB | Empty at snapshot |
| `Private repository 02` | private | redacted | redacted | Content present (details redacted) |
| `codemagic-docs` | public | `master` | 25754 KB | Content present |
| `Devontray` | public | `main` | 0 KB | Empty at snapshot |
| `Private repository 04` | private | redacted | redacted | Content present (details redacted) |
| `Games` | public | `main` | 0 KB | Empty at snapshot |
| `Github` | public | `main` | 0 KB | Empty at snapshot |
| `kottens-code-engine` | public | `main` | 34 KB | Content present |
| `Kotton-code-engine` | public | `main` | 25 KB | Content present |
| `lingo_admin_console` | public | `main` | 1 KB | Content present |
| `lingo_assets` | public | `main` | 100 KB | Content present |
| `lingo_backend` | public | `main` | 0 KB | Empty at snapshot |
| `lingo_documentation` | public | `main` | 0 KB | Empty at snapshot |
| `LINGO_LEGACY_HQ` | public | `main` | 561 KB | Content present |
| `lingo_website` | public | `main` | 0 KB | Empty at snapshot |
| `lingo-legacy-` | public | `main` | 0 KB | Empty at snapshot |
| `LingoLegacy-` | public | `main` | 0 KB | Empty at snapshot |
| `LingoLegacy-MasterBlueprint` | public | `main` | 62 KB | Content present |
| `Lingolegends` | public | `main` | 1 KB | Content present |
| `Loyaltylaneapparel` | public | `main` | 36 KB | Content present |
| `Private repository 06` | private | redacted | redacted | Content present (details redacted) |
| `Private repository 01` | private | redacted | redacted | Content present (details redacted) |
| `Spades_is_my-lingo` | public | `main` | 0 KB | Empty at snapshot |
| `Spades-is-my_Lingo` | public | `main` | 181 KB | Content present |
| `thats_my_lingo_app` | public | `main` | 0 KB | Empty at snapshot |
| `THATS-MY-LINGO` | public | `main` | 201 KB | Content present |
| `TheLingoLegacy` | public | `main` | 6370 KB | Content present |
| `thelingolegacy-blip-REPO-` | public | `main` | 28 KB | Content present |
| `thelingolegacy-hub` | public | `main-/-root⁠` | 95 KB | Content present |
| `thelingolegacy-hub-` | public | `main` | 0 KB | Empty at snapshot |
| `Private repository 05` | private | redacted | redacted | Content present (details redacted) |
| `Theriseofzavione` | public | `main` | 59 KB | Content present |
| `Tricia-escape-` | public | `main` | 0 KB | Empty at snapshot |
| `Tv-os` | public | `main` | 0 KB | Empty at snapshot |
| `ZavioneLingo` | public | `main` | 2 KB | Content present |

## Empty-repository candidates

The following 14 repositories reported size zero on this snapshot:

- `Backend`
- `Devontray`
- `Games`
- `Github`
- `lingo_backend`
- `lingo_documentation`
- `lingo_website`
- `lingo-legacy-`
- `LingoLegacy-`
- `Spades_is_my-lingo`
- `thats_my_lingo_app`
- `thelingolegacy-hub-`
- `Tricia-escape-`
- `Tv-os`

These are **review candidates only**. Before any disposition, inspect references, open pull requests, integrations, external links, package registries, release assets, secrets metadata and ownership. No repository was deleted, archived, renamed or transferred as part of this inventory.

## Canonical repository branch inventory

The branch endpoint was paginated through six pages (100 + 100 + 100 + 100 + 100 + 39 = 539 branches). Pages seven and later returned zero. The branch set contains both `main` and `production-deploy`, along with many historical recovery, staging, feature, and agent-generated branches.

- Branches with the legacy protection flag set: 0.
- Branches without the legacy protection flag set: 539.
- No branch was deleted or force-updated.
- Branch rulesets and environment protection remain a separate verification task.

## Open pull-request inventory

The open-pull-request endpoint was paginated through three pages (100 + 100 + 1 = 201 open PRs).

| Base branch | Open PR count |
|---|---:|
| `main` | 178 |
| `vercel-agent/cinematic-premium-ui` | 4 |
| `studio/enterprise-environment-vnext-2026-10-24` | 3 |
| `feat/premium-studio-worlds-5x5-engine-2026-10-30` | 2 |
| `agent/lingo-integration-receiver` | 2 |
| `vercel-agent/lingo-legacy-hq` | 2 |
| `ops/center-source-resource-registry-2026-11-12` | 1 |
| `staging/server-authoritative-game-foundation-2026-11-07` | 1 |
| `feat/lingo-assistant-universal-chat-stack-2026-10-30` | 1 |
| `studio/avalon-lingo-integration-2026-10-25` | 1 |
| `infra/g02-evidence-architecture-2026-10-10` | 1 |
| `infra/linux-host-rebuild-2026-10-10` | 1 |
| `ops/estate-recovery-control-plane-2026-10-10` | 1 |
| `vercel-agent/mobile-asset-loader` | 1 |
| `vercel-agent/tml-asset-upload-launch` | 1 |
| `vercel-agent/add-credit-card-payments` | 1 |

The largest concentration is `main` (178 PRs). The remaining PRs target 15 non-main base branches, creating stacked dependencies that need explicit sequencing.

### Most recently updated open PRs

| PR | Title | State | Base |
|---|---|---|---|
| [#555](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/555) | fix(game): restore Money Mile racing UI and unify Oasis game floor | Draft | `main` |
| [#556](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/556) | feat(ops): add read-only EMS operations centers console | Draft | `ops/center-source-resource-registry-2026-11-12` |
| [#553](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/553) | feat(ops): establish source-backed resource registry and center integration map | Draft | `main` |
| [#554](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/554) | feat(analytics): add isolated Firebase Functions v2 BigQuery event pipeline | Draft | `main` |
| [#551](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/551) | docs(ems): establish Main Hub, Resource Center and Release Center | Draft | `main` |
| [#549](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/549) | Wave 00.2–00.3 — EZCA registry, route audit and P0 remediation | Ready for review | `main` |
| [#545](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/545) | fix(firebase): restrict Hosting to compiled Flutter web output | Draft | `main` |
| [#510](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/510) | docs: establish enterprise completion, architecture, operations and launch program | Draft | `main` |
| [#548](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/548) | fix(web): reconcile flagship navigation and prepare live-site preview | Draft | `main` |
| [#511](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/511) | Establish LINGO master registry and dependency graph baseline | Draft | `main` |
| [#547](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/547) | Draft: add fail-closed staging isolation audit | Draft | `main` |
| [#514](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/514) | [DRAFT] Define LLG Dispatch Control Plane and worker lifecycle | Draft | `main` |
| [#544](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/544) | Establish free-first premium creative asset foundation | Draft | `main` |
| [#542](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/542) | [DRAFT] fix(firebase): restrict Hosting to Flutter web build output | Draft | `main` |
| [#541](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/541) | Security: disable unscoped Firebase Hosting publication | Draft | `main` |

## Consolidation risks observed

1. **Excessive parallel branches:** 539 branches make it difficult to distinguish current work from abandoned experiments and old recovery attempts.
2. **Large draft backlog:** 150 of 201 open PRs are drafts. Draft status does not establish that work is active or complete.
3. **Stacked base-branch dependencies:** 15 non-main base branches mean some PRs cannot be evaluated in isolation.
4. **Potential repository overlap:** the inventory includes similarly named Hub, master, backend, website, game and Kotton’s Code repositories. Name similarity is not proof of duplication.
5. **Public/private boundary:** 32 repositories are public and 6 are private. Sensitive source, signing material, tokens and customer data require a separate permissions and content audit; visibility alone is not a security assessment.
6. **CI evidence:** recent canonical PR runs repeatedly ended in `startup_failure` before job creation. A missing job is not a passing test and does not establish source failure or G02 runner health.

## Recommended reconciliation order

1. Preserve `TheLingoLegacy/main` as canonical source; keep production HOLD and last-known-good protections intact.
2. Inspect rulesets, environments, required checks and repository permissions before changing branch policy.
3. Group open PRs by subsystem and dependency; identify the authoritative implementation for each capability.
4. Compare commits and file-level overlap before closing or superseding PRs.
5. Merge only reviewed, independently verified changes with green CI and evidence bound to the exact commit.
6. Archive or delete empty/duplicate repositories only after dependency, domain, integration and external-reference checks.
7. Retain an auditable mapping from retired branches/repositories to their replacement or archive record.

## Current workstream additions

- PR #555: Doughboy’s Oasis first-game repair and unified game floor.
- PR #556: read-only EMS Main Hub / Resource Center / Release Center console, stacked on PR #553.
- PR #553: canonical resource registry and control-plane contracts.
- Issue #550: enterprise repository, environment, security and source-integrity consolidation.
- Issue #552: EMS control-plane implementation.

## Scope and evidence limits

This snapshot covers all 38 repositories returned by the connected owner-scoped repository listing, with private repository identifiers redacted from this public record and all 539 branches plus 201 open PRs returned by the paginated canonical-repository endpoints. It does not inspect every file in every repository, every closed PR, all releases, every ruleset, every connected app, all secrets metadata or live provider health. Those remain explicit follow-up work rather than inferred completion.

## Mobile, website and builder readiness

The Flutter and website surfaces have substantial source foundations, but the current main branch is not a release-ready mobile app or safe Firebase Hosting configuration.

### Current source facts (canonical `main` snapshot)

- `pubspec.yaml` defines a Flutter application with Firebase Core, Auth, Realtime Database, Storage and Analytics packages, plus Provider and shared preferences.
- `lib/main.dart` initializes Firebase on startup.
- `lib/firebase_options.dart` still contains `YOUR_*` placeholders for Web, Android, iOS and macOS app configuration. The project ID is a source reference, not proof that platform apps or credentials are correctly provisioned.
- `firebase.json` currently sets Hosting `public: "."`, which can expose repository-root files if a Firebase Hosting deployment is invoked.
- `android/app/build.gradle` currently signs release builds with the debug signing configuration.
- The iOS tree contains project stubs; native iOS build readiness is not established by the existence of the directory.
- `.github/workflows/flutter-firebase-integrity.yml` defines dependency, analyze, widget-test, web-build and Android debug-build steps, but Actions startup failures prevent current exact-head CI evidence.
- The current Flutter UI is a navigation-only universe preview with eight destinations; it is not yet an authenticated identity, wallet, commerce, or game runtime.

### Existing change proposals — do not duplicate or merge blindly

| PR | Scope | Inventory disposition |
|---|---|---|
| #535 | Preview-safe Flutter startup, asset-directory fixes, widget test and native bootstrap workflow | Retain for review; it removes unconditional Firebase initialization while placeholder app credentials remain |
| #541 | Disable Firebase Hosting publication; preserve Cloudflare as canonical web edge | Preferred Hosting boundary to review because it removes the unsafe Hosting target entirely |
| #533 | Earlier Firebase Hosting disablement proposal | Overlaps #541; compare exact commits before superseding |
| #539 | Change Firebase Hosting public directory to `build/web` | Conflicts with the no-Firebase-Hosting direction; do not combine with #541 without an explicit architecture decision |
| #545 | Duplicate `build/web` Hosting scope correction | Overlaps #539 and conflicts with #541; reconcile, do not stack blindly |
| #532 | Android release signing policy | Retain for review; release signing must remain unsigned unless protected keystore inputs are present |
| #554 | Isolated Firebase Functions v2 / BigQuery analytics foundation | Source-only and not wired to production; no dataset, IAM or deployment is created |
| #515 | Supabase-primary backend architecture proposal | Architecture decision remains unresolved against the Firebase-first identity/data baseline; no migration is authorized |
| #500 | LLG Tech Corps AI provider gateway and command-center foundation | Source-only prototype; provider execution is disabled and no live provider credentials are configured |

### Selected architecture guardrails

- GitHub remains the source of truth.
- Cloudflare remains the public website edge and routing layer.
- Flutter remains the cross-platform mobile application target.
- Firebase may provide explicitly approved identity and application services; Firebase Hosting must not publish repository-root content.
- A backend migration proposal is not a production migration. Reconcile Firebase and Supabase responsibilities before creating competing identity, wallet or data systems.
- AI provider adapters remain disabled until server-side secrets, identity, tenant authorization, budgets, moderation and release evidence are configured.

### Remaining prerequisites

1. Resolve real Firebase platform app registration and project ownership through the authorized project owner; never replace `YOUR_*` placeholders with guessed values.
2. Verify Firebase Auth, App Check, database and storage security rules before any user-data activation.
3. Complete the native Android/iOS project scaffolding and device build matrix; do not treat stub files as native readiness.
4. Keep Android release artifacts unsigned until the protected keystore path and credentials are provisioned through a secure CI environment.
5. Restore GitHub Actions job startup and run Flutter dependency resolution, analysis, tests, web build and Android debug build on the exact reviewed commit.
6. Review the overlapping Firebase Hosting PRs as one architecture decision; do not merge both the disable-Hosting and build/web approaches.
7. Keep analytics and AI provider execution disabled until their independent privacy, security and operational gates pass.

No Firebase project setting, app registration, secret, signing key, database, Cloudflare route or deployment was changed during this inventory.
