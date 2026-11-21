# LINGO Legacy — Platform, Surface and OS Installation Matrix

**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Canonical matrix:** `config/platform-surface-os-matrix.json`  
**Advancement:** Manual, project-scoped and independent of G02/Fallgate  
**Production:** Protected; no deployment or production mutation is authorized by this matrix.

## Executive finding

The repository contains a substantial web surface, a Flutter app shell, Cloudflare Worker configuration, and Firebase integration contracts. It does **not** contain a verified installation for every target operating system. The matrix distinguishes source presence from generated platform runners, configured credentials, successful builds, device installation, live service connectivity, and production certification.

The most important blockers found in the canonical `main` snapshot:

- Flutter web/mobile app entry point and Android Gradle app configuration exist.
- `lib/firebase_options.dart` contains placeholder API keys and app IDs. They must be populated from the actual Firebase project through FlutterFire; no identifiers are fabricated here.
- The Firebase options explicitly throw for Windows and Linux.
- The inspected tree did not contain iOS, macOS, Windows, or Linux Flutter runner project files.
- Smart-TV support is currently a responsive-web target, not a native TV app or device-certified experience.
- Unity is a planned game target; no canonical Unity project/build artifacts were verified.
- GitHub is source of truth. Cloudflare is the canonical edge target in the current master production context. Firebase is contract-only until configured and independently verified.
- The existing manual advancement system is separate from G02/Fallgate. This matrix does not change the protected production release gate.

## Surface coverage

| Surface family | Web | Android | iOS/iPadOS | Desktop | Smart TV | Current truth |
|---|---|---|---|---|---|---|
| Public HQ / world navigation | Source present | Flutter hub shell | Flutter target; runner missing | Flutter targets incomplete | Browser-only target | Web source does not certify all clients |
| LINGO ID / account | UI preview | UI shell | UI shell target | Not assessed | Not applicable | Authentication and account writes are not certified |
| Wallet / rewards | Display/contracts | Display shell | Display shell target | Not assessed | Not applicable | No cash-out; server-authoritative ledger required before live balances |
| LINGOslots / casino | Web previews | Game client target | Game client target | Unity target | Web preview only | Entertainment-only; no real-money wagering or cash-out |
| LINGOarcade | Web/game surfaces | Unity target | Unity target | Unity target | Web preview only | Individual game QA required |
| LINGOlibrary / Kotton's Code | Web/story surfaces | Flutter target | Flutter target | Not assessed | Browser content only | Child privacy and parent/educator review gates remain |
| LINGOlane / commerce | Web/catalog | Catalog shell | Catalog shell | Browser access | Browser access | Checkout/provider and fulfillment verification separate |
| LINGOmedia | Web/media | Flutter shell | Flutter shell | Browser access | Browser access | Media rights, playback and accessibility QA required |
| Studio OS / admin | Static control surfaces | Responsive browser | Responsive browser | Responsive browser | Not certified | Current Studio OS explicitly states static/no backend writes |
| Trust / support | Web | Responsive browser | Responsive browser | Responsive browser | Browser-only | Operational moderation and incident systems not yet certified |

## Operating-system installation matrix

### Web on Windows, macOS, Linux, ChromeOS, iOS/iPadOS and Android

1. Use the supported browser; no native package is required for the web surface.
2. Confirm the public route, TLS, canonical redirects, responsive layout, accessibility, and all critical navigation links.
3. Verify Cloudflare Worker route and asset behavior with non-mutating probes.
4. Record browser/OS/device, commit, timestamp, probe output and screenshots.
5. Do not treat a historical preview or successful static build as a production certification.

### Android

Prerequisites: Flutter stable SDK, Android SDK/platform tools, Java toolchain compatible with the Gradle wrapper, emulator or physical device, and FlutterFire CLI.

From a trusted local checkout:

```bash
flutter doctor -v
flutter pub get
flutterfire configure
flutter analyze
flutter test
flutter build apk --debug
flutter install
```

Before a release build: configure the real Firebase Android app, validate Firestore/Realtime Database rules and App Check, set up protected Android signing, test offline/error/retry behavior, and run a device smoke test. Do not store signing material or Firebase service-account keys in Git.

### iOS and iPadOS

Requires macOS, Xcode, iOS simulator/device, CocoaPods, Flutter stable, an actual Firebase iOS app, Apple bundle ID, signing certificate and provisioning profile.

The current repository snapshot is missing `ios/Runner`; generate the platform runner only after confirming the bundle ID and project owner settings. Then run FlutterFire configuration, `flutter pub get`, `flutter analyze`, `flutter test`, simulator build, and a signed device test. Do not claim iOS installation until the Xcode project, signing and device evidence exist.

### macOS

Requires macOS, Xcode and Flutter desktop support. The current snapshot is missing `macos/Runner`. Generate and review the runner, configure a real Firebase macOS app if Firebase remains necessary, then analyze, test, build and smoke-test on a real macOS host.

### Windows

Requires Windows, Visual Studio with Desktop development with C++, Flutter Windows desktop support, and an actual Windows Firebase app configuration if Firebase remains part of this client. The current snapshot is missing `windows/` and Firebase options explicitly reject Windows. This target is **not install-ready**.

### Linux

Requires a supported Linux distribution, Flutter Linux dependencies/toolchain, a generated Linux runner, and a deliberate backend strategy. The current snapshot is missing `linux/` and Firebase options explicitly reject Linux. This target is **not install-ready**.

### Smart TVs

Use the responsive web surfaces as the only current target. Validate 10-foot typography, focus order, remote-control navigation, overscan, media codecs, playback controls and performance on each named TV family. Native Android TV, Apple tvOS, Samsung Tizen and LG webOS applications are separate projects and are not implied by a working browser page.

### Unity game clients

Each game must have an explicit engine decision, canonical Unity project, package/version lock, asset licensing inventory, platform build modules, deterministic gameplay tests, accessibility/input QA, and signed build evidence. A game design document or web preview is not a Unity installation.

## Shared service activation

- **GitHub:** canonical source, review and evidence records. Manual project advancement does not depend on G02/Fallgate.
- **Cloudflare:** canonical public edge and Worker layer. Validate Worker name, entry point, bindings, route precedence, asset allowlist and rollback target before any deployment.
- **Firebase:** optional app backend. Do not activate writes until real app IDs, Auth, App Check, database rules, schema validation, audit logging, rate limits, backup/restore, consent and spend limits are verified.
- **Observability:** establish correlated commit/build/deployment IDs, sanitized logs, crash reporting, uptime and route probes. Do not log secrets or child personal data.
- **Commerce:** keep catalog display separate from checkout, payment capture, refunds, fulfillment and inventory. Test provider sandbox and webhook idempotency before production.
- **AI:** provider adapters must be server-side, key-protected, quota-limited and auditable. Never ship provider keys in browser/mobile binaries.

## Installation acceptance gates

A platform is marked operational only when all applicable gates have evidence:

1. Source and dependency lockfiles present.
2. Correct platform runner/project generated.
3. Required SDK/toolchain installed and version recorded.
4. Environment configuration supplied through secure provider/local secret storage.
5. Static analysis and unit tests pass.
6. Release build succeeds on the target OS.
7. Package installs on emulator/device/browser.
8. Login, navigation, primary workflows and offline/error recovery pass.
9. Security, privacy, accessibility and licensing checks pass.
10. Runtime telemetry and live probes confirm expected behavior.
11. Rollback/recovery path is rehearsed.
12. Owner reviews evidence and manually advances the project state.

## Local inventory commands

```bash
flutter doctor -v
flutter devices
flutter pub get
flutter analyze
flutter test
flutter build apk --debug
node scripts/validate-platform-surface-os.mjs
```

Run only the build commands for a platform whose SDK and host OS are available. iOS/macOS signing and Windows builds cannot be completed on a Linux-only runner.

## Truth and next work

The machine-readable matrix records current source evidence and blockers. It is intentionally conservative. This change does not install SDKs on the user's devices, create cloud credentials, configure signing certificates, deploy Workers, activate Firebase writes, or release apps. Those actions require access to the target machines/provider accounts and target-specific verification. The next execution wave should resolve Android Firebase configuration and device QA first, generate missing platform runners on their required host OSs, then validate web/TV and Unity clients independently.


## Enterprise division and product-surface coverage

The machine-readable matrix enumerates all nine canonical divisions and 36 product surfaces. This is a portfolio coverage map, not an assertion that every listed product has been built or installed on every target.

| Division | Catalogued product surfaces |
|---|---|
| LINGOlegacy_MASTER | Master Control / Governance OS |
| LINGOlegacy | Flagship identity/profile, Universal Legacy Wallet and Lingo Coins display, community |
| LINGOlane | Designs & Promotions, Loyalty Lane Apparel, Laundry-Cycle |
| LINGOslots | That’s My Lingo, Spades Is My Lingo, Uhno Lingo U-No, Lingo Lions Eruptions, Cashman Lingo Mania |
| LINGOarcade | Tricias Escape, Doughboys Oasis, Crazy Weasols, Silly in Philly, Jersey Shore: The Undead |
| LINGOlibrary | Kotton’s Code, The Block I Grew Up On, Say It Again, Dice Shift Hotel, Legacy Legends |
| LINGOmedia | Rise of Zavione — Part 1 and Part 2 |
| LINGOworld | LINGOai, askLINGO, LINGOboom, LINGOtravel, LINGOcampus, LINGOsupport, LINGOwifi, LINGOvoice, LINGOshield, LINGOlounge, LINGOdonations |
| LegacyXclub | LegacyXclub |

Every product record carries `catalogued_target_not_certified` until its actual source, platform build, runtime integration, tests and release evidence are independently recorded. Platform targets are declared per product in `config/platform-surface-os-matrix.json`.



## Connected Cloudflare inventory (read-only)

A read-only inventory of the connected Cloudflare account on 2026-11-09 verified the `thelingolegacy.com` zone as active and not paused. It returned the following routing snapshot:

- `thelingolegacy.com/*` and `www.thelingolegacy.com/*` route to `thelingolegacyv-5`.
- `thelingolegacy.com/` has a separate exact-root route to `lingo-flagship-root`.
- Additional named subdomain routes point to the flagship Worker, and an Atlas route points to `lingo-ecosystem-atlas`.
- `studio-preview.thelingolegacy.com` is attached to `lingo-studio-control-center-staging`; `resilience.thelingolegacy.com` is attached to `lingo-resilience-gateway`.

The deployment/version records show a critical distinction: `thelingolegacyv-5` has uploaded preview version 286 (alias `platform-surface-os-installation-2026-11-09`), but its current 100% deployment still references version 137. The separate `lingo-flagship-root` Worker has version 2 uploaded, while its current 100% deployment references version 1. Uploaded preview versions are not production releases.

Worker settings report observability enabled for `thelingolegacyv-5` with 10% head sampling and query-string redaction; traces are disabled. The root Worker settings response did not include observability configuration.

**No Cloudflare resources were changed.** Do not deploy version 286, change the exact-root route, rename Workers, edit DNS, or modify production settings as part of routine setup. First compare the canonical GitHub source, inspect the deployed code and route precedence, perform safe public probes, and obtain explicit release authorization.



## Firebase configuration audit (repository read)

The Flutter dependency manifest includes Firebase Core, Auth, Realtime Database, Storage and Analytics packages. However, `lib/firebase_options.dart` still contains `YOUR_*_API_KEY` and `YOUR_*_APP_ID` placeholders for web, Android, iOS and macOS. The Flutter app initializes Firebase before rendering, so the placeholder Android configuration is a runtime blocker, not merely a release-only concern. Windows and Linux explicitly throw unsupported-platform errors in the options selector.

The repository contains a `firebase.json` Hosting configuration, but the inspected snapshot did not contain `firestore.rules` or `firestore.indexes.json`. The Firebase project identity string in the source is not proof that the project is connected or that its security rules are deployed. No Firebase project resources or credentials were changed in this task.

Required next steps: confirm the actual Firebase project and registered app IDs, generate platform options through FlutterFire, design and review least-privilege database/storage rules, configure App Check, validate Auth and data access, and test backup/restore. Keep Firebase Hosting distinct from the currently observed Cloudflare public delivery path.


## Public homepage probe

The apex homepage `https://thelingolegacy.com/` was retrieved on 2026-11-09. It is reachable, but its own page labels the experience as a candidate rather than a production-status statement. The destination catalog returned “No matching destinations,” and the page states that destination routes must be verified before production activation. It also says account and wallet actions should remain disabled until secure services are verified. The `www` URL was not independently retrieved in this browser check. This is a public-page content probe, not a complete browser/device or route test.

## Route and AppDeploy catalog reconciliation

The canonical master-control matrix contains 25 website routes and 7 AppDeploy app identifiers. These have been copied into the machine-readable platform matrix with their original source status retained and certification explicitly set to unverified. The AppDeploy source matrix lists the seven apps as deployed but unverified; this task did not re-check those live app records because the connected AppDeploy account selection is ambiguous. Do not treat those source labels as current operational proof.


## Flutter platform-runner completeness

The inspected Android folder contains an app-level Gradle file and manifest, but the root `android/settings.gradle`, `android/build.gradle`, `android/gradle.properties`, and manifest-referenced `MainActivity.kt` were not found. The Flutter web runner files `web/index.html` and `web/manifest.json` were not found. The inspected iOS, macOS, Windows and Linux runner entry files were also absent. Therefore, the presence of `pubspec.yaml` and `lib/main.dart` does not make the Flutter client buildable on those targets.

The current Flutter home screen is an ecosystem navigation preview. Its account action explicitly reports that account and signup services are not connected in the preview. It should not be described as an operational identity, wallet, or game client. A valid Android build requires completing the entire Android runner structure and resolving the actual Firebase configuration first.


## Representative public-surface probes

Three representative public routes were retrieved:

- **Flagship homepage:** reachable, but the page self-identifies as a candidate experience, reports no matching destinations, and says account/wallet actions must wait for secure services. This is not launch acceptance.
- **That’s My Lingo:** reachable as an entertainment-only game demo. The page describes virtual-only balances and no cash-out or live wagering. It explicitly says Firebase backend services await real service keys and billing approval, and global multiplayer remains hidden until backend authentication, moderation, anti-cheat and privacy checks are ready.
- **Kotton’s Code:** reachable as a static Cloudflare experience with a mini-quest. The page says its social links remain platform searches until official channel URLs are verified. The page does not establish a connected account or published video channel.

These are content-level retrievals, not proof that every button, animation, audio asset, backend call, browser size, device or accessibility path works. The remaining 22 catalogued routes still require route-by-route probes and functional tests.

