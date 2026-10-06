# LINGO Self-Publishing Channel

## Purpose

Provide a unified, owner-controlled publishing channel for LINGO intellectual property across Books, Games, and Music.

This channel is a publication workflow and evidence boundary. It does not itself establish that any work has been submitted, approved, listed, or commercially published.

## State model

PUBLICATION-READY -> SUBMITTED -> APPROVED -> LISTED -> COMMERCIALLY PUBLISHED

Every transition requires:
1. State-specific evidence owned by the project/operator.
2. Independent verification of that evidence.
3. Explicit establishment of the resulting state.

No downstream state is inferred from an earlier state.

## Books

Source master -> publication package -> self-publishing submission -> platform review/approval -> listing -> commercial availability.

Artifacts can include manuscript, cover, interior PDF/EPUB, metadata, ISBN/imprint data where applicable, audiobook assets, and submission receipts.

## Games

Release candidate -> store/distribution package -> self-publishing submission -> platform review/approval -> store listing -> commercial availability.

Artifacts can include signed/build packages, store metadata, screenshots, ratings where applicable, privacy/support URLs, release notes, and submission receipts.

## Music

Master audio -> release package -> self-publishing/distribution submission -> platform review/approval -> storefront/catalog listing -> commercial availability.

Artifacts can include WAV masters, artwork, metadata, credits, ISRC/UPC identifiers where applicable, release date, and submission receipts.

## Evidence requirements

For every submission, retain:
- exact work/version identifier
- channel/platform
- submission timestamp
- submission/account reference
- submitted asset manifest
- submission receipt or equivalent platform evidence
- verification record
- state transition decision

Credentials and secrets must never be committed to source control.

## Fail-closed rule

Creation of a package, upload-ready artifact, or local publication record does not establish submission, approval, listing, or commercial publication.

PRODUCTION AUTHORITY = NONE unless separately established by the governing production evidence chain.
