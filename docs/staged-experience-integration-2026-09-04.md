# Lingo Legacy — Staged Full-Stack + Creative Integration

## Scope

This staged package establishes the contract for the Lingo Legacy universe across GitHub, Cloudflare, Flutter, Firebase, frontend, backend, and creative production.

### Frontend
- Flutter is the mobile/super-app presentation layer.
- Existing web routes remain responsive HTML/CSS/JS surfaces.
- Shared Lingo OS styling, navigation, motion, accessibility, and world identity are preserved.

### Backend
- Firebase remains an optional service layer for identity, synchronization, progression, notifications, and application data where required.
- Cloudflare remains the production edge/runtime boundary for the existing web surface.
- Secrets and credentials remain outside source control.

### Creative system
- Each world receives its own visual language, image family, animation vocabulary, sound hooks, scene configuration, and generator inputs.
- Generators are deterministic contracts first; actual media can be supplied by approved creative tooling and then registered as assets.
- Audio is opt-in and reduced-motion behavior is respected.

## Current world registry

- That’s My Lingo — Vegas / entertainment
- Loyalty Lane — Industrial Noir streetwear
- Kotton’s Code — cartoon explorer
- Lingo Legacy HQ — cinematic command center
- Sonic Boom — futuristic command
- LingoCampus — future educational social network
- Outer Crown — sealed constellation/travel layer

## Gate policy

This package is **STAGED** only. It does not authorize production deployment, activation, mutex release, or modification of the last-known-good production state.

The current repository has full admin/push access through the connected GitHub integration, and a dedicated staging branch was created from `main`. Changes belong on that branch until the existing runner/deployment evidence gate passes.

## Blocker handling

Do not bypass a failed runner gate. Do not disable safety or production controls merely to force activation. Non-production friction may be reduced through configuration and code fixes, but the deployment gate remains fail-closed.

## Acceptance target

The eventual promotion target is:

GitHub → CI evidence → Cloudflare → frontend/backend integration → live probes → creative asset validation → certification → activation.
