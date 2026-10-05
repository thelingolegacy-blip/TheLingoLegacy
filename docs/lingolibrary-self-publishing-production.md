# LINGOlibrary Self-Publishing — Production Master Control

## Identity
- Canonical product: **LINGOlibrary**
- Route: `/library/`
- Manifest: `/library/manifest.webmanifest`
- Primary icon: `/assets/brand/lingolibrary/icon.svg`
- Maskable icon: `/assets/brand/lingolibrary/icon-maskable.svg`
- Promise: **WRITE • PUBLISH • LISTEN • OWN • BUILD**

## Production lifecycle

```
CREATE
→ INGEST
→ EDIT
→ DESIGN
→ AUDIO
→ EDITION
→ RIGHTS
→ AUTHOR ACCEPTANCE
→ PUBLISH
→ DISTRIBUTE
→ SELL
→ ROYALTY
→ ANALYZE
→ MEDIA / WORLD EXPANSION
```

## Program hierarchy

```
PROGRAM
→ PHASE
→ WAVE
→ EPIC
→ WORKSTREAM
→ SPRINT
→ WORK PACKAGE
→ TASK
→ DESIGN
→ ARCHITECTURE
→ BUILD
→ INTEGRATION
→ ASSURANCE
→ RELEASE CANDIDATE
→ RELEASE ACCEPTANCE
→ DEPLOYMENT AUTHORIZATION
→ DEPLOYMENT
→ LIVE VALIDATION
→ LAUNCH AUTHORIZATION
→ LAUNCH
→ OPERATIONS
→ OBSERVABILITY
→ SUPPORT
→ GROWTH
→ SCALE
→ REVALIDATION
→ CHANGE CONTROL
→ RECERTIFICATION
→ RETIREMENT
→ ARCHIVE
```

## Self-publishing waves

| Wave | Purpose | State |
|---|---|---|
| SP-W0 | Foundation | DEFINED |
| SP-W1 | Manuscript | DEFINED |
| SP-W2 | Editorial | DEFINED |
| SP-W3 | Design | DEFINED |
| SP-W4 | Audio | DEFINED |
| SP-W5 | Publishing | DEFINED |
| SP-W6 | Distribution | DEFINED |
| SP-W7 | Rights / Commerce | DEFINED |
| SP-W8 | Community / Discovery | DEFINED |
| SP-W9 | Media Expansion | DEFINED |
| SP-W10 | Live Validation | BLOCKED_PENDING_RUNTIME_EVIDENCE |
| SP-W11 | Controlled Activation | BLOCKED_PENDING_GATES |

## Build packages

`BUILD-SP-001` through `BUILD-SP-018) are defined in `config/publishing/lingolibrary-master.json`.

## Governance

A generated or configured publishing artifact does not become authoritative merely because it exists.

```
SPECIFICATION
↓
DEFINED BURDEN
↓
LIVE EVIDENCE
↓
VERIFICATION
↓
ESTABLISHMENT
↓
ACCEPTANCE
↓
AUTHORIZATION
↓
EXECUTION
↓
RESULT VERIFICATION
↓
PROMOTION
↓
CURRENT-STATE VALIDATION
```

## Current blocker

G02 runner dispatch remains **FAIL / UNVERIFIED**. Therefore downstream CI, certification, release, deployment, live validation, synchronization, activation, and acceptance remain blocked under the fail-closed production policy.

No production promotion is implied by this document.
