# LINGO Legacy — Platform Distribution Readiness
**Assessment date:** 2026-11-14  
**Source of truth:** `thelingolegacy-blip/TheLingoLegacy`  
**Release posture:** PROTECTED HOLD — this document does not authorize production deployment, store submission, or public release.

## Executive status

No Apple, Google Play, smart-TV, or console distribution channel is currently evidenced as submission-ready. Existing repository scaffolding is not equivalent to a signed build, registered publisher account, platform certification, or store approval.

This workstream is deliberately separated from production. All account enrollment, legal agreements, identity verification, fees, tax/payout information, platform SDK access, signing certificates, and final submission actions must be completed by the account owner or an explicitly authorized team member inside the relevant first-party portal. Never place passwords, private keys, certificates, provisioning profiles, keystore files, or service-account JSON in Git.

## Repository evidence inspected

| Area | Observed state | Consequence |
|---|---|---|
| Flutter manifest | `pubspec.yaml` exists; app ID/name are `lingo_legacy` / `com.thelingolegacy.app` appears in Android Gradle | Package identity needs product/store mapping and uniqueness review before registration. |
| Android release signing | `android/app/build.gradle` configures release signing with `signingConfigs.debug` | **Blocking:** release must use an owner-controlled upload key/secure signing configuration; debug signing must never ship. |
| Android SDK target | Current file declares compile SDK 34 and target SDK 34 | Recheck current Google Play target API policy before creating a release bundle. |
| iOS project | `ios/Runner.xcodeproj/project.pbxproj.stub` is a stub; `ios/Runner/GeneratedPluginRegistrant.m.stub` is a stub | **Blocking:** generate and validate a real Xcode iOS project, bundle ID, entitlements, signing, icons, launch assets, and archive. |
| Firebase | `firebase.json` has Hosting `public: "."`; `.firebaserc` points default to `lingo-legacy-production` | **Blocking:** validate project ownership, app registrations, rules, secrets, backups, and a safe build output boundary before deployment. Do not blindly change Hosting output without confirming the actual build output. |
| CI | `.github/workflows/flutter-firebase-integrity.yml` has a hosted `ubuntu-latest` workflow_dispatch and checks for `lib/firebase_options.dart` | Workflow execution evidence is still required; do not substitute G02 or mark tests passed without a real run. |
| TV and console artifacts | No dedicated `tizen`, `webos`, `roku`, `tvos`, PlayStation, Xbox, or Nintendo platform package/build target was found in the inspected repository root. | Separate platform-specific apps, toolchains, manifests, packages, device QA, and publisher onboarding are required. |

## Distribution matrix

| Platform | Required delivery path | Current state | Exit evidence |
|---|---|---|---|
| Apple iOS | Flutter iOS target → Xcode archive → App Store Connect/TestFlight | BLOCKED — Xcode project is stub-only; Apple developer membership/team/signing not verified | Real Xcode archive, signed IPA, App Store Connect app record, TestFlight processing, device QA, privacy/age metadata, review result |
| Apple tvOS | Dedicated tvOS target and TV-remote-first UX → App Store Connect | NOT BUILT / NOT VERIFIED | tvOS target, remote/focus QA, signed archive, store metadata, review approval |
| Google Play Android | Flutter Android release → signed AAB → Play Console testing tracks | BLOCKED — debug signing configured; developer account and AAB not verified | Owner-controlled upload key, signed AAB, Play App Signing, internal/closed test results, policy declarations, production eligibility |
| Android TV / Google TV | Android TV form factor and leanback/remote UX → Play Console TV opt-in | BLOCKED — no TV-specific manifest/UX/device evidence | TV-compatible AAB, TV banner/screenshots, remote navigation QA, Play TV opt-in and review approval |
| Amazon Fire TV | Fire OS-compatible Android build → Amazon Appstore | NOT BUILT / NOT VERIFIED | Fire TV compatibility/device QA, Amazon developer account, package/listing, submission approval |
| Samsung Tizen TV | Tizen web app/package → Samsung Apps TV Seller Office | NOT BUILT / NOT VERIFIED | Tizen package and manifest, Seller Office account/partnership as applicable, pre-test, certification approval |
| LG webOS TV | webOS web app/package → LG Seller Lounge | NOT BUILT / NOT VERIFIED | IPK/package, UX scenario, completed self-checklist, device/simulator QA, LG QA approval |
| Roku | Roku/BrightScript channel → Roku Developer Dashboard | NOT BUILT / NOT VERIFIED | Roku channel package, multi-device QA, static + behavior certification, publisher certification |
| PlayStation | Native/approved engine build → PlayStation Partners | NOT ENROLLED / NOT VERIFIED | Developer application approval, NDA/SDK access, platform-specific implementation, certification |
| Xbox | Approved engine build → ID@Xbox / Partner Center | NOT ENROLLED / NOT VERIFIED | Creator registration and concept approval, agreements/SDK access, platform QA/certification |
| Nintendo Switch | Native/approved engine build → Nintendo Developer Portal | NOT ENROLLED / NOT VERIFIED | Developer registration, separate Switch access approval, SDK access, publishing agreement, age rating, platform review |

## Shared release architecture

All clients must use the same governed service contracts, but must not assume identical presentation or binaries:

- **Identity:** LINGO ID with provider-neutral authentication, secure session lifecycle, account recovery, consent, and device linking.
- **Content:** versioned catalog/API, entitlement checks, localization, age/content classification, and region availability.
- **Progress:** server-authoritative synchronization with conflict resolution, offline queueing, idempotency, and audit history.
- **TV interaction:** ten-foot UI, readable typography, focus graph, remote/back handling, controller support where relevant, and accessible focus states.
- **Games:** platform-specific input adapters; deterministic game rules; server-authoritative progression/economy; no cash-out or redeemable virtual currency unless separately reviewed and approved.
- **Privacy and safety:** platform privacy disclosures, data minimization, retention/deletion, parental controls where applicable, moderation/reporting, and age-appropriate content.
- **Observability:** privacy-conscious crash/error telemetry, build/version identification, health checks, and release rollback plans.

## Store and certification prerequisites

Before any submission, the release owner must approve:
1. Product/app identity map: exact public title, publisher/seller, bundle/package ID, SKU, and target platforms.
2. Ownership: platform developer account is owned by The Lingo Legacy's authorized publisher, not a contractor.
3. Legal and privacy: privacy policy, terms, data safety/privacy labels, account deletion flows where required, rights/licensing, and regional compliance.
4. Content: age ratings, game/content descriptors, virtual currency disclosures, ads/tracking declarations, and any sweepstakes review.
5. Creative: icons, store screenshots per form factor, TV banners/posters, descriptions, support URLs, and release notes.
6. Build: reproducible release build, secure signing, SBOM/dependency/license review, vulnerability scan, and artifact checksum.
7. QA: physical device matrix, accessibility, remote/controller behavior, login, offline/reconnect, purchases if applicable, data deletion, crash/performance, and regression.
8. Submission: first-party portal upload, review responses, approval evidence, staged rollout plan, monitoring, and rollback.

## Account enrollment notes

- Apple Developer Program enrollment is an owner action. Apple states individual/sole-proprietor enrollment lists the individual's legal name as seller; organization enrollment requires a legal entity, D‑U‑N‑S number, organization-domain email, public functional website, and authority to bind the organization. Apple currently lists a US$99 annual membership fee.
- Google Play Console registration requires an eligible Google Account, acceptance of the Developer Distribution Agreement, and currently lists a US$25 one-time registration fee. Personal accounts created after 2023-11-13 have additional testing requirements before production access.
- TV and console platforms have separate publisher/developer portals, account ownership rules, technical packages, and certification. A Google Play account does not enroll a publisher in Samsung, LG, Roku, Amazon, PlayStation, Xbox, or Nintendo programs.

Fees and requirements must be rechecked in the relevant portal at enrollment/submission time.

## Current blockers and next actions

### P0 — release foundation
- Restore real hosted GitHub Actions execution and evidence.
- Restore branch/release governance and verify it with an authorized admin.
- Preserve G02 inactive and production HOLD.
- Resolve Firebase project/app identity, security rules, hosting output boundary, backups, and environment separation.

### P1 — mobile
- Generate real iOS project files and validate the Flutter iOS build on macOS.
- Replace Android debug release signing with a secure, externally supplied upload-key configuration; fail closed when required signing inputs are absent.
- Recheck Android target API policy and run Flutter analyze/tests plus signed Android/iOS release builds.
- Complete store account enrollment, app identity mapping, listings, privacy declarations, and test tracks.

### P2 — television
- Build a shared TV content experience and remote-navigation design system.
- Implement and test separate platform deliverables for Android/Google TV, Fire TV, Samsung Tizen, LG webOS, Roku, and Apple tvOS.
- Create per-platform packaging, store assets, device test matrices, certification checklists, and submissions.

### P3 — consoles
- Prepare publisher pitches and technical concept briefs for PlayStation, ID@Xbox, and Nintendo.
- Obtain platform program approvals and SDK access before implementation against proprietary SDKs.
- Port selected games only after platform acceptance, input/UX adaptation, performance, age rating, and certification plans are funded and approved.

## Release rule

No app or channel is considered connected, launch-ready, or complete until its first-party account, app identity, signed artifact, automated and device test evidence, submission record, and approval status are independently verified. A repository scaffold, preview, or design is not a store integration.

**Current overall status: NOT READY FOR STORE SUBMISSION. PROTECTED HOLD REMAINS IN FORCE.**
