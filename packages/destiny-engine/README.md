# LINGO Destiny Engine — deterministic world core

Status: experimental shared-engine foundation, version 0.1.0. Not a production game runtime.

## Included
- Seeded, deterministic 2D world generation with bounded dimensions.
- Versioned world definitions and a JSON Schema contract.
- Stable non-cryptographic world fingerprint for reproducibility checks.
- Pure fixed-tick simulation state transitions.
- Idempotent command IDs and immutable event output.
- Node's built-in test runner; no third-party runtime dependencies.

## Contract
The same world ID, world version, seed, dimensions and generator version produce the same world definition and fingerprint. World generation is for fictional game spaces only. It does not ingest real-world GIS, utility telemetry, property records or personal data.

Simulation commands are validated by the core and produce a new state plus events. The package does not persist state, authenticate players, connect to networks, grant permissions, manage wallets, award currency, or run multiplayer sessions. A trusted server must own persistence, authorization, anti-cheat and authoritative state before any multiplayer or economy integration.

## Determinism and security boundaries
- The seeded PRNG is for reproducible content generation, not cryptography, gambling outcomes, security tokens or competitive reward selection.
- worldHash is a compact FNV-1a fingerprint for regression/replay comparison, not a cryptographic integrity signature. Release pipelines must compute SHA-256 over versioned assets/manifests.
- Command idempotency is in-memory session behavior. Production services must persist command/event IDs transactionally.
- The simulation is intentionally small and bounded: map dimensions 4–128, at most 256 points of interest, at most 64 actors and 4,096 commands per in-memory session.
- No external asset, character, soundtrack or licensed-IP dependency is included.

## Run tests
From this directory, run: node --test

The repository-level workflow also runs the public-asset exclusion validator. The packages directory is excluded from Cloudflare static asset publication so engine source, tests and package metadata cannot be served as public website files.

## Next integrations — not included here
1. Versioned content packs and asset-rights manifest.
2. Unity adapter for 3D scenes/physics.
3. Web adapter for browser previews and lightweight 2D.
4. Flutter companion/mobile presentation adapter.
5. Server-authoritative persistence, multiplayer sessions, replay storage and anti-cheat.
6. Separate product integration contracts for LINGOarcade, LINGOslots and future worlds.
