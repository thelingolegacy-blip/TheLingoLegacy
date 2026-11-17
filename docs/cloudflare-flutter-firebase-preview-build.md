# Cloudflare Flutter/Firebase Preview Build

Status: isolated preview only; production deployments disabled.

Project: `lingo-flutter-firebase-preview`
Preview branch: `recovery/actions-startup-probe-2026-11-16`
Output directory: `build/web`

## First deployment result

The Cloudflare Pages builder successfully cloned this repository at commit
`1bad097fb14d76b22342e4198f378adea30bdd31`, installed the Flutter SDK, and
resolved the root Flutter application's dependencies. The build then failed
because the root Flutter project did not contain a configured `web/` platform:
`This project is not configured for the web.`

## Preview-only build correction

The Cloudflare Pages preview project's build command was updated to run:

```sh
flutter config --enable-web
flutter create . --platforms web
flutter pub get
flutter build web --release
```

The Flutter SDK is cloned into `/tmp/flutter` and added to PATH before these
commands. This generates the missing web platform scaffold in the ephemeral
Cloudflare build checkout; it does not commit generated platform files to the
source repository.

## Acceptance conditions

- A new preview deployment completes queued, initialize, clone, build, and deploy.
- The deployment identifies this exact repository, branch, and commit.
- The output directory contains the generated Flutter web application.
- The preview URL serves the application and its static assets successfully.
- Browser smoke checks pass.
- Firebase runtime behavior remains unverified until genuine Firebase app
  registrations/configuration are supplied and authentication/data flows pass.

No Firebase credentials are fabricated or stored in this document. The Pages
project has production deployments disabled and only the recovery branch
allowlisted. Do not attach a production domain, enable production deployments,
or change live Worker/DNS routes as part of this preview work.
