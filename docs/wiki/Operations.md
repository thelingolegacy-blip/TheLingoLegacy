# Operations and Recovery

## G02 runner

1. Inspect the G02 host provisioning and recovery runbook.
2. Inspect the two-sided readiness protocol.
3. Collect host diagnostics and GitHub runner inventory.
4. Repair only the layer identified by evidence.
5. Require positive runner ID, exact runner name, executed sentinel, retrievable logs/artifact, and independent acceptance.

## Production release

- Build and verify an immutable candidate.
- Correlate candidate, commit, checksums, CI evidence and runtime probes.
- Verify rollback readiness.
- Require explicit authorization for promotion.
- Verify the live version and critical routes after promotion.

## Incident record template

- Incident ID and UTC start:
- Impact and affected environment:
- Last known good commit/version:
- Current commit/version:
- Observed symptoms and exact evidence links:
- Mitigation:
- Verification:
- Rollback performed / not performed:
- Follow-up owner and due date:

## Security

Never put tokens, kubeconfig, private keys, runner credentials, or full environment dumps in issues or artifacts.
