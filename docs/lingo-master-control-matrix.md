# Lingo Legacy Master Control Matrix

## Authority State

| Control | State |
|---|---|
| GitHub runner gate | **FAIL** |
| Production deployment | **BLOCKED** |
| Activation | **BLOCKED** |
| Last Known Good | **PRESERVED** |

The matrix is a control-plane inventory, not proof of production certification. A surface marked implemented or deployed-unverified must not be treated as live-certified.

## Purpose

`config/lingo-master-control-matrix.json` is the canonical machine-readable registry connecting known Lingo Legacy routes and deployed AppDeploy surfaces to implementation truth, release controls, and external integration planes.

## Control Planes

- **GitHub** — implementation truth, CI, release evidence.
- **AppDeploy** — build/deploy/QA surface; deployment does not equal certification.
- **Canva** — brand design.
- **Figma** — product design system.
- **Adobe** — creative assets.
- **Game Studio** — game design, assets, builds, and playtests.
- **Data Analytics** — measured telemetry and operational analysis.
- **Deep Research** — evidence and research.
- **ClinicalTrials.gov** — public registry research only; not a clinical-certification authority.

## Required Release Sequence

`DISCOVER → DESIGN → SPECIFY → IMPLEMENT → TEST → BUILD → DEPLOY CANDIDATE → LIVE PROBE → CERTIFY → ACTIVATE`

Production mutation remains locked until a genuine GitHub-hosted `ubuntu-latest` runner provides an executable job, an executing step, and complete logs/evidence. No synthetic evidence, bypass, forced deployment, or weakening of the gate is permitted.

## Current AppDeploy Inventory

The registry records the seven known deployed AppDeploy surfaces and deliberately marks certification as **unverified**. This prevents an AppDeploy deployment from being mistaken for canonical production certification.

## Next Implementation Gate

Once GitHub produces genuine runner execution evidence, the next executable work is to validate the matrix against the repository routes, AppDeploy IDs, workflows, and release artifacts. Validation failures must fail closed and preserve LKG.
