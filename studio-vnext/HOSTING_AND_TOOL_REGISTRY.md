# Hosting, Tool Registry & Job Management

## Tool registry record

Every tool entry should include `tool_id`, `version`, `owner`, `purpose`, input/output schemas, data classification, allowed agent roles, permission scope, network destinations, side-effect classification, timeout, retry rules, audit events, and deprecation date.

Tool classes:
- **Read-only:** inspect approved source, query status, validate schemas.
- **Sandbox write:** create artifacts or modify isolated branches.
- **External side effect:** publish content, send communications, modify accounts, spend money, change infrastructure.
- **Privileged operations:** secrets, production deployments, access policy, DNS, runner administration.

External-side-effect and privileged tools require explicit human approval, least-privilege scopes, and a complete audit trail. No agent may self-enable a tool or widen its own scope.

## Job template

```yaml
job:
  id: studio-contract-check
  owner: platform-engineering
  purpose: "Validate Studio VNext source contracts"
  environment: isolated-ci
  runner:
    class: ephemeral
    labels: [linux, x64]
    network_policy: allowlist
  permissions:
    contents: read
  inputs:
    commit_sha: required
  outputs:
    - contract-test-report
  timeout_minutes: 10
  retry:
    max_attempts: 1
    on: [transient_runner_failure]
  acceptance:
    require_exit_code: 0
    require_logs: true
    require_artifact_checksum: true
  production_access: false
```

This is an illustrative specification, not a currently installed scheduler configuration.

## Hosting options and boundaries

- **GitHub-hosted runners:** managed ephemeral execution where account/org policy and quota permit.
- **Self-hosted ephemeral runners:** isolated disposable compute; require a maintained runner service, restricted labels/groups, outbound network controls, rapid patching, and no persistent production credentials.
- **Container workers:** useful for reproducible jobs; pin image digests and constrain CPU, memory, disk, runtime, and network.
- **Agent service:** separate API/control service, durable queue, isolated workers, model gateway, tool proxy, policy engine, telemetry, and evidence store.
- **Preview hosting:** separate deployment project or generated preview URL with isolated secrets and data.
- **Production hosting:** separate environment, reviewed promotion and rollback. Not part of this branch's scope.

## Management dashboards and signals

Operator dashboard should show queue depth, oldest job, eligible runners, heartbeat freshness, active jobs, run/job links, last sentinel, artifact integrity, agent evaluation version, approval status, and gate status. Unknown or stale values must display UNKNOWN/STALE, not green.

Suggested signal severities:
- **INFO:** job queued, heartbeat, successful step.
- **WARN:** queue latency rising, retry, approaching budget, stale evidence.
- **ERROR:** job failure, missing sentinel, artifact checksum mismatch.
- **CRITICAL:** secret exposure, unauthorized tool call, production-target mismatch, unapproved privileged action.

## Operational runbooks

- **No jobs initialized:** preserve run ID; inspect Actions policy, runner availability, runner group access, labels, account restrictions, and service status. Avoid repeated blind retries.
- **Runner online but not assigned:** verify runner is actually polling, repository access, exact labels/groups, and that the job is eligible.
- **Missing artifact/logs:** fail the evidence gate; capture the API response and correlation IDs.
- **Agent failure:** stop automatic retries for non-idempotent work, preserve sanitized trace, classify cause, and add a regression case.
- **Security incident:** revoke scoped credentials, quarantine worker, preserve non-sensitive evidence, notify owner, and follow incident response policy.

## Current implementation boundary

The signal workflow and schemas are proposed repository artifacts. They are not evidence of a working runner, running agent host, scheduler, queue, model training pipeline, or live monitoring service. Validate them in isolated CI first. Production remains Protected HOLD.
