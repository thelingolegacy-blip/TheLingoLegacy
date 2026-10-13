# LINGOarcade + LINGOslots studio-site foundation

This isolated branch contains two responsive web surfaces and a shared motion/audio layer.

## Included
- `lingoarcade/index.html`: world discovery and studio pipeline surface.
- `lingoslots/index.html`: playable five-reel local demo, virtual coins only.
- `shared/studio.css`: shared industrial-noir responsive visual system, animation, reduced-motion support.
- `shared/studio.js`: opt-in procedural Web Audio UI feedback, no external audio dependency.

## Media pipeline contract
1. Register each asset with `asset_id`, `kind`, `path`, `version`, `sha256`, `license`, `owner`, `alt_or_transcript`, `variants`, and `status`.
2. Keep source masters separate from web exports; prefer WebP/AVIF for raster art, SVG for approved vector assets, WOFF2 for licensed fonts, and compressed WebM/MP4 only where motion video is required.
3. Audio entries record format, sample rate, loudness target, duration, rights/territory, transcript or cue description, and fallback behavior. Browser sound is opt-in.
4. CI validates missing files, manifest schema, duplicate IDs, broken internal links, oversized assets, license metadata, and reduced-motion/accessibility checks.
5. Publish immutable versioned assets; never overwrite a referenced production asset in place.

## Release governance
This is a proposal branch, not a production activation. Merge, CI certification, Cloudflare route integration, domain publication, and live verification remain separate gates. Do not point production routes at this branch until runner dispatch, required checks, security review, accessibility, functional smoke tests, asset provenance, and independent public reachability all pass.

## Safety
LINGOslots is entertainment-only. Demo coins are local and valueless. No deposits, cash-out, paid spins, cash prizes, or rewards tied to game outcomes are implemented by this static demo.
