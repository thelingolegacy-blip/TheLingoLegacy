# LINGO Nexus Game Engine

Shared runtime infrastructure for LINGOslots and LINGOarcade.

## Five engines
1. Core Runtime — lifecycle, input, session state, persistence contracts.
2. LINGOslots Engine — 5x3 reels, weighted symbols, paylines, wild/scatter/multiplier states, bonus hooks.
3. LINGOarcade Engine — arcade rounds, score/state machines, event modes, multiplayer hooks.
4. LINGO World Engine — environments, backgrounds, camera/parallax, world entry/exit.
5. LINGO Experience Engine — controls, motion timelines, audio, reduced-motion and mute states.

## Nexus Store
Central discovery/catalog layer for every LINGO game. It supports virtual/demo items only; it does not authorize cash wagering or cash-out.

## Visual fallback
approved asset -> Google provider when configured -> procedural scene -> gradient fallback.

Google credentials remain server-side and are never shipped to clients.

## Governance
Implementation does not equal certification. Production promotion remains subject to the existing evidence and gate system.
