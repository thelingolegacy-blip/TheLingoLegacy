# DOUGHBOY'S OASIS — Vertical Slice QA & Finalization Ledger

**Record date:** 2026-10-13  
**Branch:** `studio/doughboys-oasis-full-game-2026-10-13`  
**Scope:** Amity Heights browser vertical slice; not the full console/PC, mobile-native, or VR product.  
**Release posture:** Fail-closed. Production activation remains disabled.

## Current implementation

The standalone `doughboys-oasis-vertical-slice.html` is linked from the Studio Portal and registered in `config/game-registry.json` as `local-prototype`.

Implemented in the browser prototype:
- Top-down Amity Heights map, keyboard movement, touch movement controls, click/tap-to-move grid pathfinding, and basic building collision.
- Four named NPCs with dialogue and daypart routines; routine movement constrained to walkable space, with the CPU-rival toggle pausing rival movement only.
- Money Mile delivery mission with three solution paths: negotiate, route planning, and contract inspection.
- Crew name, motto, and emblem creation.
- Player and CPU rival influence values, territory contest outcomes, and non-exclusive territory semantics.
- Demo currency, reputation, inventory, mission state, world clock, local save/load, save migration, checkpoints, and return-to-checkpoint action.
- Radio station selection, volume setting, and optional synthesized interface cues.
- Reduced-motion stylesheet behavior, focus styling, keyboard controls, responsive layout, and no GPS access.

## Evidence ledger

| Gate | Status | Evidence / next action |
|---|---|---|
| Source and branch authority | PASS | Work isolated on the feature branch and tracked by PR #294. |
| Portal and registry routing | PASS — static check | Portal tile, game registry route, and studio configuration target the vertical-slice HTML file. |
| HTML and required gameplay hooks | PASS — static check | Required IDs, six GREED domain labels, three mission solutions, local storage, collision/pathfinding hooks, and checkpoint controls are present. |
| Embedded JavaScript syntax | PASS — syntax parse | Inline gameplay script and static validator script parsed without syntax errors in the available validation context. |
| Location privacy | PASS — source check | Prototype does not call browser geolocation APIs; location discovery is not implemented in this slice. |
| Runtime gameplay QA | BLOCKED / NOT YET VERIFIED | Must open in a real browser and execute the manual test matrix below. Static parsing is not runtime proof. |
| Automated GitHub Actions | BLOCKED | Recent jobs report `runner_id: 0`, empty `runner_name`, and `steps: []`; jobs fail before step initialization. Resolve G02 runner dispatch before treating CI as valid evidence. |
| Preview/public reachability | BLOCKED / NOT VERIFIED | The latest Vercel status check is failing with an account/deployment-blocked status, and no deployment is listed for this feature branch. Verify the preview URL only after the account/deployment block is resolved and a qualified build succeeds. |
| Console/PC production client | NOT IMPLEMENTED | Requires an engine decision, real-time 3D client, animation/assets, save/state integration, and platform QA. |
| Native mobile client | NOT IMPLEMENTED | Current mobile support is responsive browser layout and touch controls only. |
| Immersive VR client | NOT IMPLEMENTED | Requires VR-capable client, comfort options, spatial interactions, and device QA. |
| Online identity, crews, and cross-platform sync | NOT IMPLEMENTED | Current saves and crews are browser-local; no remote accounts, server-authoritative state, or multiplayer exists. |
| Production certification and activation | BLOCKED | Security, privacy, accessibility, asset-rights, device, performance, public reachability, independent QA, and human approval are outstanding. |

## Manual browser acceptance matrix

Run each case on the exact branch preview and record browser/version, device, date/time, result, and any console/network errors.

1. **Load:** Page renders at desktop and mobile widths without uncaught exceptions.
2. **Keyboard movement:** WASD and arrow keys move the player; movement stops at map boundaries and building collision zones.
3. **Touch controls:** Each directional control moves the player; releasing the pointer stops movement.
4. **Click/tap navigation:** Selecting open ground follows a walkable route around building footprints; selecting blocked space does not cause an infinite movement loop.
5. **NPC schedules:** Let the world clock advance across morning/day/evening segments; NPC activity labels and positions follow their scheduled routines. Turning CPU off pauses the rival without freezing the neighborhood.
6. **NPC interaction:** Move near Ms. Bell and press E / Interact. Dialogue appears and the mission changes from Not started to In progress.
7. **Mission gating:** Mission solution buttons are disabled until the player starts the mission with Ms. Bell.
8. **Mission outcome:** Each of negotiate, route, and audit completes once; grants its documented demo reward/item; repeated clicks cannot duplicate rewards.
9. **Crew creation:** Generate an identity, edit fields, establish the crew, and confirm values persist after reload.
10. **Territory contest:** Contest requires a crew; player/rival influence remains between 0 and 100; essential routes remain open.
11. **CPU toggle:** CPU rival movement pauses when disabled and resumes when enabled.
12. **Radio:** Switch stations, mute/unmute, adjust volume, and enable/disable synthesized cues without uncaught errors.
13. **Save/reload:** Currency, reputation, items, mission completion, crew, influence, clock, and checkpoint persist in the same browser profile.
14. **Legacy save migration:** A stored save without the rival-influence field receives a safe default; invalid saved position/checkpoint coordinates recover safely.
15. **Checkpoint:** Set a checkpoint, move away, return, and verify inventory and completed progress remain intact.
16. **Accessibility:** Keyboard focus is visible; controls are labelled; reduced-motion preference removes transitions/animation; layout remains usable at narrow widths.
17. **Privacy:** No geolocation permission prompt, location request, analytics beacon, or external account write occurs.
18. **Reset:** Confirmed local reset clears only this prototype's local save and reloads a clean initial state.

## Finalization criteria

This browser vertical slice can be marked **runtime-accepted** only after all manual cases pass and reproducible evidence is attached to the PR. It can be marked **CI-accepted** only after a real runner is assigned, steps execute, logs/artifacts are retrievable, and the relevant validation workflows pass.

The full DOUGHBOY'S OASIS product cannot be marked **finalized/production-ready** until the production client(s), backend authority, all planned content, platform builds, asset rights, security/privacy/accessibility/performance checks, and release approvals are implemented and independently verified. Do not bypass failed gates, promote this branch to production, or describe planned platform features as shipped.
