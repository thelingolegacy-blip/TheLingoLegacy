# DOUGHBOY'S OASIS — Cross-Platform, Modes, Partner and API Contract

**Status:** design/implementation scaffold on the isolated feature branch. Not a production launch authorization.

## Product promise
“The grind. The hustle. The plan. The scheme. The upcome—the makings of a true Oasis master. GREED IS just the beginning. Wait until…”

GREED remains six story domains: Money, Power, Sex & Desire, Drugs & Escape, Rock & Roll, and Intelligence. Greed is a narrative pressure system, not a promise of real-world financial rewards.

## Modes
- **Solo Story:** canonical narrative path; player decisions produce typed story-memory events and influence relationships, rivals, reputation and future options.
- **Race Mode:** solo time trials first, then validated asynchronous ghost/rival times when server authority exists. No wagering, cash-out or pay-to-win advantage.
- **Free Roam:** exploration and district discovery; 856 atlas destinations remain fictionalized and the schematic atlas is not navigation.

## First-partner gate
1. New save begins without a partner.
2. Player completes/starts Round 1 in any mode.
3. After Round 1, the optional “Establish First Partner” flow becomes available.
4. Player chooses a non-reserved name/callsign and partnership archetype (trusted, strategist, wheel partner, wildcard).
5. The event `first_partner_established` records the player choice and Round 1 provenance. Partner identity is not silently assigned.
6. Staying solo remains valid. Future trust/loyalty should emerge from player choices and authored events.
7. Reject “Doughboy” as a custom player/partner name where the reserved protagonist identity applies. Confirm the exact scope of the reserved name in future character creator UX rather than silently changing canon.

The current hub stores prototype state in browser localStorage only. This is not account sync, secure storage or authoritative multiplayer state.

## Input abstraction
Normalize physical input to actions rather than binding gameplay to a device:
- `move_x`, `move_y`, `interact`, `confirm`, `back`, `pause`, `accelerate`, `brake`, `steer_x`.
- Browser: WASD/arrows, pointer/touch.
- Mobile: virtual joystick with pointer capture/cancel handling, safe-area-aware layout, optional haptics only after consent.
- Gamepad: left stick/D-pad, A/cross confirm, B/circle back, menu/start pause. Apply deadzone, debounce and disconnect fallback before competitive acceptance.
- LG webOS TV: remote D-pad and OK/Back, deterministic focus order, visible focus ring, no hover dependency, 10-foot readable type. TV browser gamepad APIs vary; remote key events must be tested on target devices.
- Accessibility: remappable controls, keyboard-only completion, screen-reader labels, reduced motion, scalable text and non-color-only states.

The HTML hub is a functional local input/mode/partner-flow prototype, not a full race simulation or native controller certification. Its gamepad sample is intentionally minimal and needs repeat/deadzone/disconnect acceptance work before shipping.

## Platform delivery targets
| Platform | Intended package | Required acceptance |
|---|---|---|
| Apple iOS/iPadOS | Flutter/native shell or approved web wrapper | current SDK build, privacy manifests, permissions, safe areas, accessibility, App Store review |
| Google Play | Android App Bundle | target API policy, adaptive icon assets, signing, permissions/data-safety disclosures, Play review |
| LG webOS | TV web app package | remote navigation, focus order, key mapping, memory/performance, device certification |
| Web | responsive browser app | keyboard/touch/pointer, offline behavior, accessibility and cross-browser checks |

Platform icon placeholders in the hub are illustrative glyphs, not official store artwork. Store listing icons, launch screens, screenshots, privacy policy, age/content ratings, developer signing credentials and submission approvals remain separate deliverables.

## API and token boundaries
- Client receives a short-lived user access token from the chosen identity provider; backend validates signature, issuer, audience, expiry and required claims on every protected request.
- Refresh tokens stay in OS secure storage (Keychain/Keystore) in native apps; do not place long-lived tokens in localStorage. The local web prototype has no real tokens or remote identity.
- Service account credentials, signing keys, Cloudflare secrets, Firebase Admin credentials and API private keys must never be embedded in client bundles, TV packages, HTML, repositories or telemetry.
- Server-authoritative writes: partner creation, wallet/ledger, inventory purchases, ranked race submissions, unlocks and competitive progression.
- Use request idempotency keys for purchase/partner/match operations; schema validation, rate limits, audit events and replay protection on protected endpoints.
- Story events should be typed, minimized and player-visible. No covert microphone, screen or real-world location collection. Optional location permission must be explicit and revocable.
- Race validation should check track/version, start/end timing, checkpoint order, impossible movement/speed, duplicate submissions and replay/idempotency. Local client times must not be trusted for ranked leaderboards.

## Proposed API surface
- `GET /v1/oasis/catalog`
- `GET /v1/oasis/regions`
- `POST /v1/oasis/sessions` — authenticated session bootstrap
- `POST /v1/oasis/rounds/start`
- `POST /v1/oasis/rounds/{roundId}/complete`
- `POST /v1/oasis/partners` — requires completed Round 1, explicit player action and idempotency key
- `GET /v1/oasis/partners/me`
- `POST /v1/oasis/races/results` — server-validated, ranked result only
- `GET /v1/oasis/races/leaderboard` — only after anti-cheat and server authority are verified

Every private route fails closed when authentication, configuration or trusted backend connectivity is absent. The list is a contract, not a claim that these routes are deployed.

## Acceptance gates
1. Unit tests for mode transitions, round-one gate, reserved-name validation and idempotency.
2. Input tests: simultaneous pointer release/cancel, keyboard blur, gamepad deadzone/disconnect and focus navigation.
3. Browser runtime smoke test on desktop and mobile Safari/Chrome.
4. Real device builds and control tests on iOS/iPadOS, Android and LG webOS target hardware.
5. Auth/token abuse tests, privacy review, race anti-cheat, accessibility and performance checks.
6. Independent CI evidence and human review before promotion. Keep production fail-closed while G02 runner dispatch and deployment gates remain blocked.
