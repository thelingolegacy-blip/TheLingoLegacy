# Loyalty Lane Cycles — Flutter client

This is the mobile client foundation for iOS and Android. It currently implements the Cumberland County regional hub directory using the same Cloudflare Worker read endpoint as the web surface.

## Run locally

From this directory, run `flutter pub get` and `flutter run`. To point at a non-production API, pass `--dart-define=LLC_API_BASE_URL=https://your-staging-host`.

## Current boundary

The public directory client is read-only. Authentication, booking, machine control, cycle telemetry, bike energy, Lingo Coins, reward redemption, notifications, and operator administration are not yet implemented. The production endpoint is not active until its PR is accepted and the Cloudflare release is separately approved.
