# LINGOvox-next Design Foundry

**Status:** Draft implementation / read-only registry preview  
**Route:** `/design-system-studio/`  
**Theme:** Industrial Noir — obsidian, graphite, metallic gold, royal purple, platinum  
**Canonical token source:** `config/design/design-tokens.json`  
**Shared CSS token layer:** `assets/lingo-design-tokens.css`

## Purpose

Design Foundry is the proposed centralized design-operations workspace for LINGOvox-next. It brings the existing design token, icon, and asset registries into one inspection and preview surface. It includes component previews, token editing, a generated audio-tone demonstration, a motion demonstration, responsive viewport simulation, a basic contrast calculator, and developer handoff exports.

The scoped theme is additive. It does not replace the existing Lingo Legacy global palette or declare the entire platform migrated to LINGOvox-next.

## Canonical sources

- `config/design/design-tokens.json` — canonical theme and token values, including `themes.lingovoxNext`.
- `config/icons/icon-registry.json` — declared icon records and paths.
- `config/assets/asset-registry.json` — asset metadata, owner labels, licensing state, and production-verification state.
- `assets/lingo-design-tokens.css` — CSS variables consumed by pages that import the shared token layer.

Registry status fields indicate the repository's recorded metadata. They do not independently prove that a remote asset loads, a license is valid, or a feature is production-ready.

## Current interaction contract

- Token changes in the browser are local draft changes only.
- The page may retain a draft in that browser's local storage until reset or cleared.
- Export actions produce proposal files for review; they do not commit to Git, open a pull request, approve a change, or deploy anything.
- The sound preview synthesizes a short tone through the Web Audio API after an explicit user action. It is not a licensed production sound asset.
- Motion and responsive previews are demonstrations; they are not proof of full-module behavior.
- The contrast calculator evaluates one foreground/background pair. It is not a complete WCAG or browser accessibility audit.
- The page is marked `noindex,nofollow`; this is not authentication or authorization.

## Security and governance boundaries

The current workspace does not write to canonical source files and does not perform a production mutation. Do not add GitHub write credentials or other secrets to client-side JavaScript. The canonical change process remains:

`SOURCE → EXECUTION → EVIDENCE → INDEPENDENT VERIFICATION → ACCEPTANCE → AUTHORIZATION → PROMOTION`

A future authoritative editor requires an authenticated server-side service or reviewed repository automation, role-based authorization, validated schemas, immutable revision records, audit logging, a pull-request-based approval path, and independent CI evidence. A browser-local draft is not a canonical revision.

## Initial acceptance checklist

- [ ] Confirm the route and its three canonical registry requests work in a real browser.
- [ ] Confirm missing/unavailable registries are shown as unavailable, not treated as empty.
- [ ] Validate all token edits, reset behavior, and exported JSON against the canonical schema.
- [ ] Confirm icon paths resolve and missing icons receive a visible fallback.
- [ ] Confirm asset metadata is displayed without implying unverified ownership or licensing.
- [ ] Test synthesized sound only after user interaction and test the stop control.
- [ ] Test motion with standard and reduced-motion preferences.
- [ ] Run keyboard-only, screen-reader, forced-colors, mobile, and desktop acceptance.
- [ ] Run repository validation and review the exact pull-request diff.
- [ ] Keep production release and activation blocked until their separate gates pass.

## Known limitations

This is a first-stage, read-only preview and proposal exporter. It is not yet a secured multi-user design operations backend, does not write canonical changes, and has not been browser-tested or deployed as part of this change.
