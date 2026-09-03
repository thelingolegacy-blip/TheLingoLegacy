# Lingo Legacy External Integration Operating System v1.0

## Purpose

This document defines the canonical operating model for external creative, product, analytics, research, deployment, and engineering services connected to The Lingo Legacy.

## Control planes

| Plane | Primary responsibility | Default authority |
|---|---|---|
| Engineering | Source, CI, tests, release evidence | GitHub |
| Deployment | App build/deploy surfaces and version history | AppDeploy |
| Product | UX requirements, journeys, prioritization | Product Design |
| Design | Editable visual systems and prototypes | Figma / Canva |
| Creative | Image, PDF, video, and asset production | Adobe |
| Game | Browser-game architecture, runtime, assets, QA | Game Studio |
| Analytics | Product telemetry, funnels, reliability, release KPIs | Data Analytics |
| Research | Evidence synthesis and source-backed discovery | Deep Research |
| Clinical research | Trial discovery and research references only | ClinicalTrials.gov |

## Non-negotiable boundaries

1. GitHub is the implementation source of truth.
2. Production promotion remains fail-closed behind genuine GitHub Actions runner evidence.
3. No integration may manufacture deployment credentials, API keys, clinical findings, analytics results, runner evidence, or release certification.
4. Creative/design tools may produce assets and specifications but do not independently certify production.
5. ClinicalTrials.gov is a research-data source; it is not a clinical decision engine, diagnosis system, or medical authorization layer.
6. Analytics recommendations are advisory until validated against authoritative runtime data.
7. AppDeploy versions are not considered production-certified merely because they are deployed; certification requires the canonical release gate.
8. Game assets and gameplay changes must remain separated from safety, identity, payment, and authorization controls.
9. Secrets remain outside source control and are injected only through authorized deployment environments.
10. LKG remains preserved whenever any release gate fails.

## Standard lifecycle

DISCOVER → DESIGN → SPECIFY → IMPLEMENT → TEST → BUILD → DEPLOY CANDIDATE → LIVE PROBE → CERTIFY → ACTIVATE

Every transition requires evidence from the responsible control plane. A failed transition stops downstream promotion.

## Integration handoff contracts

### AppDeploy

- Receives approved build artifacts and deployment specifications.
- Maintains versioned app surfaces and deployment history.
- Must not be treated as proof that GitHub production gates passed.

### GitHub

- Owns repository truth, workflow definitions, commits, release evidence, and production gates.
- `ubuntu-latest` is the canonical hosted-runner target unless explicitly changed by the release authority.

### Figma / Canva

- Own design systems, prototypes, campaign layouts, and editable creative planning.
- Approved design output must be mapped to a repository asset or implementation contract before production use.

### Adobe

- Owns high-fidelity raster/vector/PDF/creative production workflows.
- Exported assets require repository registration and validation before shipping.

### Game Studio

- Owns game-engine architecture, browser-game implementation, gameplay assets, playtesting, and runtime QA.
- Game economy must respect The Lingo Legacy entertainment-only/no-cash-out contract where applicable.

### Data Analytics

- Defines event taxonomy, funnel metrics, reliability metrics, and experiment measurement.
- Analytics cannot silently alter user balances, rewards, identity, permissions, or production configuration.

### Deep Research

- Produces evidence-backed research briefs, source maps, and decision inputs.
- Research outputs must distinguish verified facts, assumptions, recommendations, and unresolved questions.

### ClinicalTrials.gov

- Used for locating and referencing registered clinical studies when relevant to approved research/product work.
- Study records must be treated as research information and not as individualized medical advice.

## Canonical registry

The machine-readable registry is stored at `config/integrations/external-services.json`.

## Release gate

The authoritative release condition remains:

REAL RUNNER + EXECUTABLE JOB + COMPLETE EXECUTION EVIDENCE → RUNNER_GATE = PASS → REPAIR → VALIDATION → DEPLOYMENT → LIVE PROBES → CERTIFICATION → ACTIVATION

If runner allocation fails or executable steps are absent, all downstream production actions remain locked and LKG is preserved.
