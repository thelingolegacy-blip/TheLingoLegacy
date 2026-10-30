# LINGO multi-surface release matrix

| Surface | Delivery format | Current implementation | Release dependency |
|---|---|---|---|
| Desktop / mobile web | Responsive web + PWA | Studio portal, independent worlds, askLINGO dock | Browser/device QA, domain deployment, acceptance |
| Android phone / tablet | Flutter APK/AAB | Flutter hub and studio registry client | Firebase runtime config, Android signing, Play Console review |
| iPhone / iPad | Flutter iOS | Shared Flutter app and registry client | macOS build/signing, Apple certificates, App Store Connect review |
| LG webOS TV / ThinQ ecosystem | webOS TV web app package | Packaging scaffold | LG webOS SDK, remote/focus QA, device testing, store account/review |
| Samsung Tizen TV | Tizen WGT | Packaging scaffold | Tizen SDK, Samsung certificate profile, TV QA, store review |

## Release discipline
A single source of truth is shared across platforms, but each target has its own build, signing, capability, accessibility, privacy, and store-acceptance gates. Do not reuse mobile payment assumptions on TV surfaces. Store submission and public availability are separate states.

No Apple, Google, LG, or Samsung credentials, signing keys, certificates, developer accounts, or store approvals are created by source changes. Supply those through the official developer portals and protected CI secrets only.
