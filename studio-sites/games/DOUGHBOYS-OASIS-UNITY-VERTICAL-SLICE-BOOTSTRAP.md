# Unity Bootstrap — DOUGHBOY'S OASIS: Amity Heights — The First Promise

**Target:** Unity production client. **State:** implementation contract only; no Unity project, editor version, native build, or device test is claimed by this document.

## First vertical slice
- One original 60–90 second dawn cinematic; do not reveal Doughboy's past.
- One compact, fictionalized Amity Heights block and one home lot.
- Three interactable NPCs, one small job, one build action, one family-care choice.
- One original LINGO Deck interaction with visible costs and effects.
- One mystery clue plus conflicting testimony; end with evidence unresolved.
- Legacy Campaign and Sandbox profile choice; campaign begins Kid, sandbox can choose stage.

## Unity project setup gate
1. Select and record a supported Unity LTS editor version and target platform before creating project files.
2. Create a clean project with version control and pinned package manifest/lockfile.
3. Add scenes: Boot, AmityHeights_Block, HomeLot, FamilyHub, Cinematic_Opening.
4. Add systems as isolated services: SaveProfileService, LifeStageService, DailySimulationService, BuildGridService, FamilyCareService, DeckResolutionService, ClueLedgerService, DialogueEventService, AccessibilitySettings, TelemetryOptIn.
5. Keep content data versioned and validated. Do not embed canon or balance rules only in UI event handlers.
6. Start with graybox geometry and original/licensed temporary audio/art. Record rights and asset provenance before promotion.
7. Add tests for profile isolation, age milestones, build occupancy/cost, care recovery, card effects, clue prerequisites and reveal gating.
8. Measure frame time, memory, loading, input and accessibility on the declared target device.

## First build acceptance
- Reproducible project setup and a build for one declared platform.
- Complete vertical-slice playthrough with deterministic save/reload and no critical runtime errors.
- Automated test evidence and human review attached to the branch.
- CI runner, security, privacy, asset rights, runtime QA and release gates pass before promotion.

## Gate boundary
Unity is the chosen target, not an already-configured or verified deliverable. The existing HTML prototypes are design/system references. No production deployment or certification is authorized by this document.
