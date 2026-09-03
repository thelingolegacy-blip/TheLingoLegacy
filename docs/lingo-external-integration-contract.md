# Lingo Legacy External Integration Contract v1.0

## Purpose

Define the canonical boundary for external creative, deployment, analytics, design, game-production, and research services used by The Lingo Legacy.

## Integration roles

| Service | Role | Source of truth | Production mutation allowed by this contract |
|---|---|---|---|
| AppDeploy | App build/deploy surface and runtime QA | AppDeploy app/version state | Only after production gates pass |
| GitHub | Repository, CI/CD, release evidence | Canonical repository + Actions evidence | Repository changes permitted; production deploy remains gated |
| Canva | Brand/design production | Canva designs and brand assets | Design changes only in authorized designs |
| Figma | Product/UI design system and code/design mapping | Figma files/components/variables | Design changes only in authorized files |
| Adobe | Creative Cloud/Express/Firefly asset production | Adobe assets/designs | Creative asset changes only when explicitly requested |
| Data Analytics | Product telemetry, operational metrics, QA evidence | Versioned analytics contracts | Read/analysis by default; no invented metrics |
| Game Studio | Game design, assets, builds, playtest workflows | Canonical game specifications + repository | Build/design work must remain inside game safety and release gates |
| Deep Research | Research synthesis and evidence gathering | Cited research outputs | Research does not authorize production mutation |
| ClinicalTrials.gov | External clinical-trial research source | Public registry records | Read-only research/data reference; never treated as medical authority |

## Governance

1. GitHub is the implementation source of truth for TheLingoLegacy repository code.
2. Production deployment remains fail-closed behind the Runner Release Gate.
3. No service authorization is interpreted as permission to bypass platform, safety, legal, privacy, or release controls.
4. Secrets, access tokens, credentials, and private keys never enter source control, URLs, design files, prompts, or generated artifacts.
5. External research is evidence input, not implementation truth. Claims must remain attributable to their source.
6. ClinicalTrials.gov data is treated as registry/research data. It must not be represented as individualized medical advice or clinical validation.
7. Analytics values must be measured or explicitly labeled as estimates/specifications; synthetic production metrics are prohibited.
8. Design systems may inform implementation, but repository implementation must be verified against actual source files before release.
9. AppDeploy versions and QA results are deployment evidence; a deployed preview is not automatically production certification.
10. Vercel remains retired from the canonical production architecture unless the production authority contract is deliberately changed.

## Production state machine

```text
EXTERNAL TOOL WORK
      ↓
REPOSITORY / DESIGN / RESEARCH ARTIFACT
      ↓
VALIDATION
      ↓
REAL GITHUB RUNNER + EXECUTABLE JOB + LOG EVIDENCE
      ↓
RUNNER_GATE = PASS
      ↓
DEPLOYMENT VALIDATION
      ↓
CLOUDFLARE / FIREBASE DEPLOY
      ↓
LIVE PROBES + CERTIFICATION
      ↓
ACTIVATION
```

If runner allocation or execution evidence fails, all downstream production mutation remains blocked and the last-known-good state is preserved.

## App surface mapping

The integration layer is designed to support the Lingo Legacy ecosystem including the flagship game/casino surface, Kotton's Code, Lingo Travel, Ask Lingo, apparel/commerce, studio production, and future game worlds without making an unverified claim that any individual external connector is already wired into every app.

## Required evidence for activation

- Repository commit SHA
- Validation output
- Real runner ID/name
- Executed job and executable step
- Step logs
- Deployment result
- Live probe results
- Certification artifact
- Rollback/LKG reference
