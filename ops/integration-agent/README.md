# LINGO Integration Receiver

The Integration Receiver is the controlled intake lane for work arriving from parallel development surfaces.

## Intake

Accepted source branch families:

- `vercel-agent/*`
- `fix/*`
- `agent/*`
- `feature/*`
- `studio/*`

The receiver evaluates the incoming branch, identifies changed files, checks for obvious authority drift, and prepares a merge recommendation.

## Merge protocol

```
INCOMING BRANCH
      ↓
SOURCE IDENTIFICATION
      ↓
DIFF / PROVENANCE
      ↓
STATIC VALIDATION
      ↓
GOVERNANCE CHECK
      ↓
SECURITY CHECK
      ↓
MERGE RECOMMENDATION
      ↓
HUMAN / AUTHORIZED MERGE
      ↓
POST-MERGE VERIFICATION
```

The receiver does **not** grant production authorization. It does **not** bypass G02, certification, deployment, or acceptance gates.

## Cross-side handoff

A parallel agent can push to its own branch and open a PR against the selected integration branch. The receiver then becomes the intake point. This keeps unrelated agent work out of `main` until it has been reviewed and verified.

## Fail-closed behavior

Missing checks, unresolved conflicts, suspicious production mutations, Firebase credential placeholders, or authority-chain mismatches produce a blocked recommendation.
