# G02 Canonical Runner Recovery Runbook

Status: RECOVERY PLAN — NOT ACCEPTANCE EVIDENCE  
Repository: `thelingolegacy-blip/TheLingoLegacy`  
Canonical runner name: `lingo-legacy-g02`

## Change-control boundary

This runbook preserves the original G02 contract. It does not register, rename, replace, or remove a runner; change runner labels or groups; alter permissions or secrets; modify workflow assignment targets; or authorize deployment/production promotion.

All host-side commands must be executed by an authorized operator on the actual Linux runner host. GitHub records alone do not prove host service health.

## Canonical assignment contract

The existing sentinel's required labels remain exactly:

- `self-hosted`
- `linux`
- `x64`
- `lingo-g02`

The canonical runner name remains `lingo-legacy-g02`. Do not remove the `lingo-g02` label or broaden `runs-on` to bypass dispatch failure.

## Host-side read-only diagnostics

Run on the actual runner host; redact sensitive data before sharing output:

```bash
sudo systemctl status actions.runner.lingo-legacy-g02.service --no-pager -l
sudo journalctl -u actions.runner.lingo-legacy-g02.service -n 100 --no-pager
systemctl list-units 'actions.runner*' --all --no-pager
```

If the service unit name differs, first identify the actual unit from `systemctl list-units`; do not assume the expected unit exists. Inspect the runner's own `_diag` logs in its installation directory. Never share registration tokens, credentials, environment secrets, or complete credential-bearing configuration files.

## GitHub-side checks

In the repository's Actions runner settings, independently verify:

1. The registered runner's exact name and ID.
2. Status and last-seen/connectivity information exposed by GitHub.
3. Exact labels, including all four canonical labels.
4. Repository scope and runner-group access, if visible to the connected account.
5. Whether a job requiring the canonical labels is assigned to this runner.

If any property is not exposed, record it as `UNVERIFIED`; do not infer it.

## G02 acceptance predicate (all required)

- P1: A real matching runner is available.
- P2: `runner_id > 0`.
- P3: `runner_name = lingo-legacy-g02`.
- P4: GitHub assigned the job.
- P5: Workflow steps are instantiated.
- P6: The canonical sentinel actually executes and succeeds.
- P7: Execution logs are generated.
- P8: Logs are retrievable.
- P9: Evidence is independently verified and correlated to the exact workflow run ID, job ID, commit SHA, and artifact.

A queued/cancelled job, an empty step list, runner ID 0, missing logs, or an uncorrelated artifact cannot pass G02. A successful static/configuration check is not runner-execution evidence.

## Evidence handling

Preserve original run/job/commit identifiers and timestamps. Record artifact names, artifact IDs, retrieval status, and checksums when available. Do not claim independent verification merely because the workflow itself says PASS; verify the corresponding GitHub job record, logs, and downloaded artifact.

## LINGOassister operating rules

- Observe before changing; prefer read-only diagnostics first.
- Keep the canonical runner identity and labels unchanged.
- Do not bypass branch protections, permission controls, or acceptance gates.
- Do not expose or log tokens/secrets.
- Do not trigger production deployment or promotion as part of G02 recovery.
- Mark unknown or contradictory evidence as blocked.
- Only report G02 PASS after all nine predicates have been independently verified.
- Keep downstream gates and production protected until their own requirements are satisfied.

## Current disposition

`G02=BLOCKED` until qualifying evidence proves all predicates above. This runbook is a proposed operational aid, not proof that the host is online, polling, authorized, or assigned.
