# Cloudflare Flutter/Firebase Preview

Cloudflare Pages project: `lingo-flutter-firebase-preview`
Project ID: `1e45178a-11f5-4b4b-86d9-2148075dc2f0`
Preview hostname: `lingo-flutter-firebase-preview.pages.dev`
Source repository: `thelingolegacy-blip/TheLingoLegacy`
Preview branch: `recovery/actions-startup-probe-2026-11-16`

## Safety configuration

- Production branch: `main`
- Production deployments: disabled
- Preview deployments: custom branch allowlist containing only the recovery branch above
- No custom production domain attached
- No Firebase secrets or credentials configured
- No production DNS, Worker routes or Firebase settings changed

## Build contract

- Root directory: repository root
- Build command: shallow-clone Flutter stable SDK, enable web, run `flutter pub get`, then `flutter build web --release`
- Expected output: `build/web`

## Known blockers

The current `lib/firebase_options.dart` contains placeholder API keys, app IDs and messaging sender IDs. A successful compile does not establish a valid Firebase runtime. Do not add invented credentials. Genuine Firebase app registrations and configuration must be verified by the authorized Firebase project owner.

The root `firebase.json` currently declares `public: "."`; this is not approved for Firebase Hosting publication. It must be corrected to a validated generated output directory before any Firebase Hosting deploy.

## Acceptance

A Cloudflare preview is only a build/deployment test. Record the Cloudflare deployment ID, commit SHA, build stages, logs and URL. Test app startup and Firebase connectivity separately. Do not promote this project to production or attach the live app domain.
