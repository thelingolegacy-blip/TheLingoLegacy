# LINGOlegacy Creative Experience Upgrade

## Scope
An additive shared UI layer for the flagship website and ecosystem: Loyalty Lane World, LINGOslots, LINGOarena, LINGOlibrary, LINGOmedia, and LINGOworld.

## Shared runtime files
- `assets/studio-ui-runtime.css`: design tokens, responsive world-card layout, focus states, and reduced-motion behavior.
- `assets/studio-ui-runtime.js`: opt-in world-card renderer for elements marked `data-lingo-worlds`, plus accessible transient announcements.

The Worker currently injects these asset URLs into HTML responses. This branch supplies the missing files without rewriting the Worker, index page, or Wrangler configuration.

## Integration
Add `<section data-lingo-worlds aria-label="Explore LINGOlegacy worlds"></section>` to a page where the world directory should appear. The shared script populates that container. Existing navigation and pages are otherwise untouched.

## Asset production conventions
- Logos and interface symbols: SVG, with text alternatives where meaningful.
- Raster promotional art: optimized WebP/AVIF with sensible dimensions and fallbacks.
- Audio: short original OGG/MP3 effects, user-controlled, never autoplaying on page load.
- Motion: CSS/Lottie where suitable; respect `prefers-reduced-motion`.
- All generated assets require source, license/provenance, dimensions, format, checksum, and intended destination recorded in the asset registry.

## Account and reward safety
This UI layer does not create accounts, issue rewards, change wallet balances, or imply that any provider integration is active. Those actions require separately verified Firebase/Cloudflare bindings, server-authoritative checks, authorization, idempotency, audit logs, and tests.

## Release gate
This branch is isolated from `main`. Do not merge or deploy while G02 runner evidence is missing. Acceptance requires real runner assignment, executed steps, retrievable logs/artifacts, passing automated checks, and independent verification. Production mutation freeze and last-known-good protection remain in force.
