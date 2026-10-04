# LINGO Studio Shared Asset System

Canonical shared asset lane for the centralized studio runtime.

## Asset families

- visuals/ — logos, hero art, backgrounds, cards, world art
- audio/ — UI cues, navigation, ambience, game sound
- animation/ — motion presets, transitions, loaders
- video/ — trailers, cinematics, story media
- icons/ — interface and product icons
- fonts/ — approved typography assets
- manifests/ — asset metadata and integrity records

## Rules

Critical assets are loaded first. Noncritical media is lazy-loaded.
Audio is mute-first. Motion respects reduced-motion preferences.
Every production asset must have source, version, owner, type and integrity metadata.

This lane is a source artifact. It does not by itself establish production deployment or live availability.
