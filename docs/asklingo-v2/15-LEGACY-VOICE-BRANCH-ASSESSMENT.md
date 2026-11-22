# askLINGO v2.0 — Legacy Voice/Books Branch Assessment

## Source identity

- Branch: `feat/asklingo-voice-books-modes-2026-10-05`
- Observed branch head: `893f2d3974d302a672b848078c8c060916b5d6bd`
- Comparison against current `main`: 53 commits ahead and 732 behind; histories have diverged.
- Disposition: PRESERVE / DO NOT MERGE AS A WHOLE.

## Assets recovered

| Asset | Finding | Disposition |
|---|---|---|
| `docs/asklingo-voice-books-runtime.md` | Defines realtime voice, research/respond routes, Flutter WebRTC, and seven-book audio pipeline | Preserve as historical design input |
| `ai/asklingo-modes.json` | Defines 13 modes and educational professional-domain boundaries | Reconciled into v2 canonical mode registry |
| `ai/asklingo-runtime.js` | Browser WebRTC and response client | Preserve; do not transplant before security redesign |
| `lib/services/asklingo_realtime.dart` | Flutter WebRTC client | Preserve; do not transplant before session/auth review |
| `lib/services/asklingo_voice_contract.dart` | Flutter HTTP endpoint contract | Preserve as a draft contract |
| `assets/studio/manifests/asklingo-voice.json` | Voice capability and book-interaction manifest | Preserve; provider/model fields are unverified |
| `assets/studio/manifests/books-audio.json` | Seven canonical titles and audio delivery pipeline; every title has narration `pending` | Preserve; no audio completion inferred |
| `scripts/validate-asklingo-assets.mjs` | Static asset/mode/route presence checks | Preserve as historical validation input, not live-runtime proof |

## Security findings in the historical runtime proposal

The branch's Worker adds `POST /api/asklingo/realtime-token` and `POST /api/asklingo/respond`. The inspected handler code:

- checks HTTP method and presence of `OPENAI_API_KEY`;
- parses the request and selects a mode;
- calls the provider directly from the Worker;
- returns a realtime client secret to the client;
- forwards text and serialized context to the provider.

The inspected handlers do not show server-side user authentication, tenant/product/resource authorization, grant lookup, SAAAE policy evaluation, approval checks, durable audit, or a shared rate-limit gate. Unknown mode values silently fall back to chat. The branch also sets `ask_lingo: true` in its site-context feature flags.

The client-secret pattern can be valid only behind a strongly authenticated and rate-limited session broker. In the inspected proposal, the missing server-side controls make the route unsafe to transplant into the current production Worker. A presence check for a provider secret is not authorization.

The branch references provider-specific model identifiers `gpt-realtime-2.1` and `gpt-6-luna`; neither is treated as verified or approved by this assessment. No provider activation or spend authorization is implied.

## Books and voice evidence

The audio manifest lists seven titles, but all seven narration statuses are `pending`. A manifest is not a narration file, a checksum, an accepted chapter, or a live player. No book-audio production status is advanced by this branch inspection.

The WebRTC source is implementation material, not proof of a functioning deployed voice service. No live provider request or mobile device test was performed.

## Reconciliation decision

1. Preserve the complete branch and its commit history as historical source.
2. Reuse the 13-mode vocabulary and professional-mode constraints in `11-MODE-REGISTRY.md`.
3. Reuse the WebRTC/session-broker direction in `12-VOICE-AND-MULTIMODAL.md`, with server-side governance and privacy controls added.
4. Do not copy the old Worker routes, provider model IDs, client code, or `ask_lingo: true` flag into `main`.
5. Rebuild voice only after staging identity, server-side SAAAE, cost controls, approval/audit boundaries, and provider review are established.
6. Keep book narration as pending until source manuscripts, generated audio bytes, QC, checksums, rights, and author acceptance are independently evidenced.

## Current-state boundary

The current `main` service contract and facade remain authoritative: askLINGO is not production-enabled, `ask_lingo` remains false, and the facade returns `ASKLINGO_DISABLED`. This branch assessment does not change runtime state or production authorization.
