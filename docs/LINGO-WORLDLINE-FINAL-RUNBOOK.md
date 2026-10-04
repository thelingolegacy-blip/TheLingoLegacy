# LINGO Worldline + LINGOslots Final Build / Release Runbook

## Operating rule

**No verified evidence -> no gate pass -> no authorization -> no promotion -> no activation.**

Specification, implementation, evidence, verification, acceptance, certification, promotion, and activation are separate states.

## 1. Build

1. Freeze the approved branch/ref.
2. Verify dependency lockfiles and runtime versions.
3. Validate every JSON contract and registry reference.
4. Build shared Nexus runtime.
5. Build Worldline title bundles.
6. Build LINGOslots bundles.
7. Package platform outputs for iOS, Android, LG webOS TV, and Web.
8. Generate immutable build manifest and checksums.

## 2. Content / asset production

1. Validate character, environment, animation, audio, cinematic, UI, icon, logo, and store assets.
2. Require provenance for every production asset.
3. Reject unlicensed or unverifiable assets.
4. Generate optimized platform variants.
5. Validate fallback assets.
6. Freeze the release asset catalog.

## 3. QA

Run functional, movement, narrative, economy, slots math, multiplayer, platform, accessibility, performance, and security suites.

For slots, execute the required seeded replay and million-trial simulation package before certification.

## 4. Evidence

For every gate, capture:

- exact artifact
- SHA-256
- timestamp
- environment
- scope
- result
- related test output
- verifier

Evidence must be immutable after acceptance.

## 5. G02 prerequisite

Do not infer runner execution from queued status.

G02 requires the actual matching runner, assignment, populated runner ID/name, instantiated steps, executed sentinel, retrievable logs, and independent verification.

Until that predicate is true, downstream production transitions remain blocked.

## 6. Release candidate

Only after applicable QA and verification pass:

- freeze RC
- generate release manifest
- generate store metadata
- package rollback/LKG
- perform final diff review
- obtain release authorization

## 7. Promotion

Promotion occurs only after the relevant gate is independently verified and authorized.

## 8. Activation

Activation requires:

- certified release candidate
- verified deployment evidence
- verified live validation
- authorization
- rollback readiness

## 9. Post-activation

Capture live health, telemetry, functional smoke tests, error rates, save integrity, transaction integrity, and platform availability.

## 10. Rollback

If a blocking condition appears:

1. Stop promotion.
2. Preserve evidence.
3. Protect LKG.
4. Roll back only with verified rollback evidence.
5. Re-open the affected gate.
6. Do not silently mutate the production state.

## Terminal invariant

**Each transition earns its own state independently.**
