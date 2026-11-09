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
