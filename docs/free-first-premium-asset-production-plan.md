# Free-First Premium Asset Production Plan

Status: staged foundation; no production media is approved or activated by this change.
Owner: The Lingo Legacy Studio.
Principle: original assets first, free/open tools first, verified rights always.

## Objectives
- Establish a consistent premium visual language across the web platform, mobile app, and game worlds.
- Produce original, editable source assets and optimized runtime variants.
- Keep asset provenance, license, version, integrity, accessibility, and approval state auditable.
- Avoid paid subscriptions, paid asset packs, and new external services unless separately justified and approved.
- Keep all new media staged until the existing G02 release gate and media authorization boundaries pass.

## Creative direction
- Core identity: Industrial Noir; obsidian/graphite surfaces, metallic gold highlights, controlled royal purple and cyan accents.
- Materials: smoked glass, brushed metal, fine grain, restrained edge lighting, cinematic depth.
- Typography: system-safe sans-serif stack; no font download dependency in the baseline.
- Motion: purposeful, short, skippable; respect prefers-reduced-motion and avoid flashing.
- Audio: muted by default, user initiated, original/procedural cues only; provide visual equivalents.
- Avoid imitating third-party game interfaces, logos, characters, or recognizable protected designs.

## Free-first toolchain
| Production need | Preferred tool/resource | Rights and operating rule |
|---|---|---|
| Vector marks, icons, UI graphics | SVG authored in-repo; Inkscape | Keep editable source; original work only |
| 2D illustration and paint | Krita | Save source files and export optimized runtime formats |
| 3D models, materials, lighting, animation | Blender | Original models or assets with documented license |
| 2D/3D game integration | Godot | MIT-licensed engine; review each imported asset separately |
| Audio editing | Audacity | Record or create original audio; retain project masters |
| Procedural UI sound | Original Web Audio synthesis / jsfxr | Record generation method and source; no third-party samples |
| HDRI, textures, models | Poly Haven | CC0; capture source URL and downloaded asset identity |
| Starter game assets | Kenney | CC0; capture pack/source and asset identity |
| PBR materials | ambientCG | Verify and record the applicable CC0 terms |
| Character motion reference | Mixamo (optional) | Check current Adobe terms before use; do not assume all use is unrestricted |

Tool availability, licenses, and terms can change. Verify at acquisition time and preserve a copy or URL of the license evidence. Free software does not eliminate hosting, bandwidth, build, storage, or device costs.

## Asset taxonomy
1. BRAND — primary mark, wordmark, sub-brand marks, typography and color references.
2. UI — navigation, buttons, controls, cards, HUD, badges, empty/loading/error states.
3. WORLDS — environment plates, props, maps, materials, lighting and particles.
4. CHARACTERS — turnarounds, expressions, outfits, rigs, animation clips and voice records.
5. GAMEPLAY — symbols, cards, boards, tiles, effects, score displays and tutorials.
6. MOTION — logo reveals, transitions, idle loops, reward reveals and scene animation.
7. AUDIO — UI cues, ambience, music, dialogue and accessibility descriptions.
8. COMMERCE — product photography, mockups, packaging and campaign media.
9. MARKETING — trailers, thumbnails, posters, social crops and campaign variants.
10. TECH — shaders, runtime components, manifests, scripts and pipeline configuration.

## Production stages
Concept → source creation → rights review → art direction review → accessibility review → export → optimization → hash and manifest → QA → approval → publication → runtime activation.

The last two transitions are gated by the existing media pipeline contract. This plan does not authorize either transition.

## Export standards
- Prefer SVG for marks and icons; raster exports should use WebP where supported, with PNG for transparency/fallback.
- Use responsive sizes and focal-point metadata; avoid shipping oversized source masters to clients.
- Use AVIF only when the target pipeline supports it and a fallback is present.
- Keep source masters outside runtime bundles where possible.
- Audio: short user-initiated effects; use a browser-supported compressed format with a tested fallback.
- Video: lazy-load, provide captions/transcripts, poster frames, and reduced-motion alternatives.
- Never autoplay audio; honor data-saving and reduced-motion preferences.

## Required manifest metadata
Every candidate asset must record: asset_id, version_id, source path or source URL, creator/owner, creation date, license name and evidence, rights_status, media_type, dimensions/duration, file size, SHA-256, alt text or audio description, intended surface, quality_status, brand_status, pipeline_status, and approval evidence.

## Quality gates
- Visual: legible at target sizes, correct safe area, no clipping, consistent light direction/materials, responsive crop checked.
- Technical: optimized size, correct MIME type, no broken references, stable versioned path, SHA-256 recorded.
- Accessibility: meaningful alt text, decorative empty alt, captions/transcripts, reduced-motion equivalent, contrast and focus checks.
- Rights: creator and license evidence captured; no unknown, scraped, or unverified assets.
- Runtime: no candidate is referenced until its state is PUBLISHED or ACTIVE in the approved manifest.
- Release: staging/PR, static validation, mobile and desktop review, G02 gate, then authorized release.

## Initial implementation delivered in this branch
- Original editable SVG monogram mark for review.
- Candidate source register template with no assets falsely marked approved.
- This production plan and acceptance checklist.

## Not completed by this change
No 3D characters, finished environments, animation exports, sound recordings, app integration, external account connection, deployment, or production publication is claimed. These require actual source creation, verification, QA, and the existing gated release process.
