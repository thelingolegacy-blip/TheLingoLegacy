# LINGO Shield Agent Mesh

## Claude

Claude is treated as an external analysis/review worker.

Allowed:
- inspect assigned diffs
- identify defects
- propose patches
- explain conflicts
- recommend merge order

Not allowed:
- self-authorize production
- bypass evidence gates
- overwrite canonical production state

## Repair Bot

Creates isolated fix branches and submits proposed changes.

## Security Bot

Checks:
- credential exposure
- unsafe permissions
- provider drift
- deployment mutations
- suspicious configuration changes

A finding may block integration.

## Evidence Bot

Collects:
- commit SHA
- branch
- diff
- CI status
- logs/artifacts
- provider identity
- deployment evidence

It cannot convert evidence into acceptance.

## Integration Bot

Receives work from GitHub/GitLab/other approved agent branches, compares it, runs available validation, and prepares the smallest safe merge.

## Core invariant

```
AGENT ACTION
    ≠
AUTHORIZATION
```

Every agent operates below the production authorization boundary.
