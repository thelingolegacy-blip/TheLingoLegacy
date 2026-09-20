# Lingo Legacy — GitHub + AppDeploy Master Build System Upgrade
Date: 2026-09-20

## 1. Control-plane ownership

| Plane | Authority | Function |
|---|---|---|
| Source | GitHub | Repository state, branches, commits, PRs |
| CI | GitHub Actions | Runner execution, tests, build verification, evidence |
| Deployment candidate | AppDeploy | Versioned application snapshots, QA surface, deployment readiness |
| Production runtime | Cloudflare Worker/Pages | Canonical production edge/runtime |
| Auth/data | Firebase | Ecosystem identity/data services where assigned |
| Commerce | Shopify/Stripe contracts | Commerce and payment surfaces; credentials remain outside source |
| Design | Figma/Canva | Design systems and editable creative |
| Creative | Adobe | Raster/vector/PDF/creative production |
| Game | Game Studio / engines | Gameplay runtime, assets, playtesting |
| Analytics | Data plane | Telemetry, funnels, reliability and release KPIs |

AppDeploy deployment readiness is never production certification. GitHub runner execution is a prerequisite for production-gate progression.

## 2. Repository portfolio observed

Primary engineering/source repositories currently visible include:
- thelingolegacy-blip/TheLingoLegacy — canonical production/evidence repository
- thelingolegacy-blip/LingoLegacy-MasterBlueprint — blueprint/studio control repository
- thelingolegacy-blip/kottens-code-engine
- thelingolegacy-blip/Kotton-code-engine
- thelingolegacy-blip/Loyaltylaneapparel
- thelingolegacy-blip/Theriseofzavione
- thelingolegacy-blip/nextjs-lingolegacy
- thelingolegacy-blip/thelingolegacy-hub
- additional repositories for project variants/templates and supporting systems

This is an inventory of visible repositories, not a declaration that every repository is production-authoritative.

## 3. Canonical production architecture

GitHub source
→ GitHub Actions CI/gates
→ release evidence
→ Cloudflare Worker/Pages
→ dynamic runtime and APIs
→ Cloudflare assets
→ thelingolegacy.com

AppDeploy sits beside this flow as a build/deployment candidate and QA environment. It does not replace the canonical production authority.

## 4. Build engines and runtime classes

### Web/static
- HTML/CSS/JavaScript static surfaces
- Jekyll-compatible workflow exists in the canonical repository
- repository scripts include static validation, smoke tests, runtime probes and Cloudflare verification

### React/Vite/Next.js family
- Next.js project repository exists
- Vite-oriented repositories/templates exist
- AppDeploy supports React/Vite and Next.js static application types

### Flutter/mobile
The canonical repository contains a Flutter project contract using:
- Flutter SDK 3.x
- Firebase Core
- Firebase Authentication
- Firebase Realtime Database
- Firebase Storage
- Firebase Analytics
- Provider
- HTTP
- intl
- shared_preferences
- connectivity_plus
- flutter_test
- integration_test
- flutter_lints

### Game/runtime
Known ecosystem game systems include That’s My Lingo, Kotton’s Code and other game/world surfaces. Game build/runtime work must remain separated from identity, payment, authorization and production certification controls.

### Edge/runtime
Cloudflare Worker is the production runtime authority. The repository documents worker.js and wrangler.jsonc as the runtime/configuration entrypoints.

### Backend/data
Designated backend services include Firebase capabilities and Cloudflare data services where provisioned. Persistent economy mutations must be server-authoritative.

## 5. Required build contract

Every build candidate must be traceable to:
1. repository
2. branch/ref
3. commit SHA
4. workflow/run
5. job
6. executed step
7. build/test output
8. artifact
9. deployment candidate
10. live verification
11. release acceptance

No synthetic or reconstructed evidence is acceptable.

## 6. Evidence contract

### Runner evidence
Required:
- runner.id > 0
- non-empty runner name
- runner.os and runner.arch
- executed step
- real step logs
- successful runner sentinel

### CI evidence
Required:
- run ID
- job ID
- commit SHA
- workflow identity
- step execution
- conclusion
- logs
- artifact linkage when required

### Artifact evidence
Required:
- artifact ID/name
- originating run and job correlation
- retained downloadable artifact
- content consistent with the claimed build

### DNS/live evidence
Required:
- authoritative DNS observations
- domain scope
- timestamp
- correlation with expected Cloudflare/Worker configuration
- HTTPS response evidence
- route/header/runtime probe evidence where applicable

### AppDeploy evidence
Required:
- app_id
- version
- deployment status
- QA snapshot/error state
- source/build identity
- clear designation as candidate/preview/verification surface unless independently certified

## 7. Current GitHub runner incident

Observed run:
- 35513008844 — Lingo Legacy CI Runtime Probe
- jobs 106151320105 (ubuntu-24.04) and 106151320707 (ubuntu-22.04)
- both completed with failure
- steps are null
- run artifacts are empty
- job-log retrieval returns BlobNotFound

Interpretation:
The observable failure boundary is before workflow-step execution. This does not by itself identify the underlying GitHub account/org control-plane cause.

## 8. AppDeploy inventory observed

Current deployed AppDeploy applications include:
- lingo-legacy-verification-bridge-wwagn2
- the-lingo-legacy-hq-vhjt6i
- hello-the-lingo-legacy-ois1rj
- lingo-ai-sonic-boom-2030-7plgl2
- crazy-weasels-0j3ujc
- lingo-traveltm-uyd57n
- kotton-s-code-cartoon-studio-509py3
- lingo-legacy-master-project-plan-rkh6r6
- that-s-my-lingo-casino-studio-2xntye

Observed AppDeploy status at inspection: these surfaced as deployment-ready, with no reported frontend/backend errors on the queried status objects. The media monitor application also reported a successful latest scheduled run.

These observations demonstrate AppDeploy readiness/health for those snapshots only; they do not certify GitHub CI or production.

## 9. Canonical handoff

GitHub → AppDeploy:
- approved source/build specification
- immutable commit identity
- build metadata
- required assets
- version label
- QA scope

AppDeploy → GitHub release gate:
- app_id
- version
- deployment result
- QA result
- frontend/backend error result
- screenshot/trace references where available

Cloudflare production promotion remains gated separately.

## 10. Fail-closed operating law

SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → AUTHORIZATION → PROMOTION → POST-PROMOTION

Failure at any stage blocks downstream promotion and preserves LKG.

## 11. Upgrade target

The combined GitHub + AppDeploy operating system should provide:
- unified build inventory
- immutable build identity
- cross-platform engine registry
- artifact lineage
- AppDeploy candidate registry
- CI/evidence correlation
- live DNS/runtime evidence correlation
- rollback identity
- post-promotion verification
- cost-aware deployment controls
- security and secret separation
- explicit production/non-production environment boundaries

## 12. Safety boundary

This upgrade is documentation/control-plane architecture only. It does not authorize production deployment, DNS mutation, Cloudflare changes, Firebase writes, payment activation, or LKG modification.
