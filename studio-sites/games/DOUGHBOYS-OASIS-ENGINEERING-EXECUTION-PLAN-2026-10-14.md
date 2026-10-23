# DOUGHBOY'S OASIS — Engineering Execution Plan
Revision: 2026-10-14
Target branch: studio/doughboys-oasis-full-game-2026-10-13
Status: Design/implementation contract; not a claim that Unity production code or device builds exist.

## Creator-locked canon
- Life progression: both a persistent Kid → Teen → Adult campaign and independent stage-select sandbox saves.
- Newborn: Doughboy's child. The other parent's identity and circumstances remain unspecified until creator approval.
- Cards: Oasis Decks is the system; LINGO Decks is the branded collection/series. All cards and art must be original.
- Mystery: a secret from Doughboy's past could change everything. The secret itself stays unrevealed until creator approval.
- Engine: Unity is the production target. Existing HTML pages remain prototypes/reference implementations, not proof of a Unity build.
- Virtual currency only; no real-money wagering, cash-out, pay-to-win, coercion rewards, covert monitoring, or real-world resident/business claims.

## E1 — Two distinct life-progression paths
Legacy Campaign: one persistent profile; begins as Kid and advances through Teen to Adult at authored milestone gates. Age-ups preserve family ties, skills, selected possessions, trust/reputation and consequential story flags. Each transition is an authored scene with a recap and player-confirmed save checkpoint.

Sandbox: create a separate save and select Kid, Teen or Adult at creation. Sandbox exploration never overwrites campaign age, family, mystery flags or inventory.

Save model: profileId, mode (campaign or sandbox), stage, dayIndex, ageMilestones, economy, needs, homeBuild, familyState, deckCollection, clueLedger, storyFlags, eventLog and schemaVersion. Namespaces are separate by mode/profile. Migration is versioned, validated and recoverable; corrupt saves must not silently overwrite valid data.

Acceptance:
- Campaign Kid → Teen → Adult progression works in one save and records authored transition events.
- Sandbox can start at each stage with a distinct profile identifier.
- Reload, export/import and reset tests prove campaign/sandbox isolation.
- Age-ups require authored milestones and player confirmation, not merely elapsed days.
- The Life Lab visibly identifies active mode/save before destructive actions.

## E2 — Visual home construction system
Core loop: inspect lot → choose footprint → place foundation/room/fixture → validate footprint and funds → build → inspect condition/upkeep → repair or expand.

Use a deterministic grid lot with bounds, occupancy, entrances, paths, utilities and accessibility checks. Initial palette: foundation, room module, door, window, bed, kitchen, washroom, storage, workshop, storefront, yard/green space, lighting and community fixtures. The prototype target is 2D/isometric-style tile presentation; Unity uses modular 3D prefabs with snap points, placement ghost, rotation, collision/overlap preview, cost preview, undo/cancel and accessible labels.

Construction must visibly change the home silhouette and walkable layout, not just stats. Each object stores footprint, material tier, cost, upkeep, condition and function. Invalid placement cannot overlap occupied cells, block required egress, exceed lot limits or charge funds. Preview/cancel is free.

Acceptance:
- Place, rotate, cancel, undo, save and reload at least five distinct objects.
- Invalid placements explain the conflict without charging funds.
- Saved homes reconstruct deterministically from layout data.
- Condition, upkeep and neighborhood effects derive from simulation state.

## E3 — Doughboy's family and newborn-care gameplay
Canon boundary: the newborn is Doughboy's child. Do not infer or invent the other parent's identity, relationship, history or living circumstances.

Create an authored family hub with time-sensitive care tasks, safe-home preparation, support planning, work/care scheduling, rest and relationship dialogue. Gameplay concerns attention, resources, trust and asking for support—not punishing poverty or presenting childcare as a one-person test. Choices include preparing a calm safe space, arranging trusted support, adjusting work, learning available resources and taking rest. Missed tasks trigger proportionate story consequences and recovery options, never graphic harm. No medical diagnosis or detailed medical instructions; serious medical scenarios prompt consultation with qualified professionals/trusted caregivers.

Acceptance:
- Every care interaction has a choice, state change, feedback and story-log entry.
- Missed routines can be recovered through support or rescheduling.
- UI does not describe parentage as undecided; other-parent details remain unstated.
- Care gameplay passes content, accessibility and non-shaming review.

## E4 — Oasis Decks and LINGO Decks
Naming hierarchy: Oasis Decks is the decision-card rules system; LINGO Decks is the branded collection identity.

Original starter collections:
- Boss / Lead by Example: responsibility, fairness, delegation and accountability.
- Observer / Read the Room: observation, verification, contract literacy and uncertainty.
- Survival / Secure the Basics: budgeting, upkeep, rest, food access and contingency planning.
- Wildcard / Flip the Script: humor, creative alternatives and recovery after mistakes.
Future collections may map to the six GREED domains: Money, Power, Sex & Desire, Drugs & Escape, Rock & Roll, Intelligence. Handle consent, recovery and consequences responsibly.

Card data contract: cardId, collectionId, title, originalArtKey, triggerTags, eligibleStages, choiceText, costs, effects, risks, cooldown, storyConsequences, accessibilityDescription and contentRating. Cards are decision tools, not paid power. Effects are deterministic, explainable and testable; randomness may affect narrative flavor but not secretly alter costs/progression. Unlock through play; no real-money advantage. Broad crime-drama energy is allowed, but do not reuse protected characters, designs, dialogue or assets.

Acceptance:
- At least 16 original cards across four starter LINGO Deck collections.
- Every card has an authored effect, eligible stages, cost/risk preview and event log.
- Tests cover invalid stage, insufficient resources, duplicate action, cooldown and save/load.

## E5 — Doughboy's past: clue and revelation framework
The actual secret remains unwritten/unrevealed until creator approval. Implement authored clue chains, source reliability, conflicting accounts, memory triggers, witness reactions, player interpretation and consequence flags.

Clue record: clueId, chainId, sourceCharacter, prerequisites, trigger, evidenceText, reliabilityBand, contradictions, memoryTrigger, playerInterpretations, followUpUnlocks and revealGate. Separate observed fact, character claim, rumor and player inference in the UI. Red herrings remain uncertain until corroborated.

No revelation can trigger from random exploration alone. A reveal gate requires a designed minimum evidence set, relevant story flags and a creator-authored reveal asset/approval. Until then, terminal state is “evidence unresolved.” Story memory records in-game events only; never use microphone, screen, device location, contacts or real-world surveillance to infer clues.

Acceptance:
- One three-clue chain demonstrates prerequisites, conflicting testimony and a memory trigger without exposing the secret.
- Tests prove clue order is respected, rumors do not become facts, and no premature reveal occurs.
- Creator-facing content manifest keeps the final secret in an unfilled protected slot.

## E6 — Unity target and first cinematic vertical slice
Unity is the production target; existing web prototypes are references only. This plan does not claim Unity is configured or that a build exists.

First vertical slice: “Amity Heights — The First Promise”
1. Opening cinematic (60–90 seconds): dawn over fictionalized Amity Heights; industrial-noir camera language; original score/radio texture; establish Doughboy through action and observation, not exposition. Do not reveal his past.
2. Playable neighborhood (10–15 minutes): one compact block, one home lot, family hub, three interactable NPCs, one small job, one home repair/build action and one authored mystery clue.
3. Life systems: choose Campaign or Sandbox; campaign begins Kid; sandbox selects a stage. Age-up need not occur in this short slice, but milestone data is represented in the save schema.
4. Building: place one room module and two fixtures; preview, cancel, commit and save/reload.
5. Family: a non-graphic newborn-care scheduling choice and support conversation; no unapproved parent details.
6. Deck: play one Observer or Survival LINGO Deck card with visible cost/risk/effect.
7. Mystery: discover one clue, hear a conflicting account, log both as unverified claims, and end without revealing the secret.

Unity scene targets: Boot, AmityHeights_Block, HomeLot, FamilyHub, Cinematic_Opening. System targets: SaveProfileService, LifeStageService, DailySimulationService, BuildGridService, FamilyCareService, DeckResolutionService, ClueLedgerService, DialogueEventService, AccessibilitySettings and TelemetryOptIn.

Use versioned ScriptableObjects or validated JSON for content; do not bury narrative canon in UI handlers. Abstract keyboard/mouse, controller, touch and TV-remote input. Keep platform adapters separate from simulation rules. Use original/licensed cinematic assets and graybox placeholders until rights/performance budgets are verified.

Acceptance:
- Reproducible Unity project/build for one declared platform, with pinned editor/package versions.
- One complete vertical-slice playthrough, deterministic save/load and no critical console errors.
- Frame-time, memory, loading, input and accessibility targets measured on target hardware.
- Automated tests for save isolation, build placement, care choices, card effects and clue gating.
- CI runner, security, privacy, asset rights, runtime QA, certification and human approval gates pass before promotion. Until then, remain draft/unmerged and production disabled.

## Suggested execution sequence
1. E1 save/profile model and visible Campaign/Sandbox selection.
2. E2 grid-based visual building prototype.
3. E3 newborn-care state machine and support/recovery paths.
4. E4 original card data model and 16-card content set.
5. E5 clue ledger and gated, unrevealed mystery chain.
6. E6 Unity project bootstrap, graybox scene and cinematic/playable slice.
7. Run static checks, browser/device QA, automated tests and evidence review at each gate. Do not merge or deploy as a substitute for passing verification.

## Current implementation boundary
The current Life Lab is an interactive local HTML prototype. Its funds, family choices, story log and construction state are browser-local demo data. It does not establish production persistence, live AI, an operational backend, a configured Unity project, native builds or certification. The existing GitHub PR remains a draft and production remains fail-closed until independent gates pass.
