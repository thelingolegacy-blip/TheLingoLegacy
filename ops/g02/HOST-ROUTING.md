# G02 Host Routing Contract

## Purpose
Provide the minimum host-side path required for the self-hosted GitHub Actions runner to poll GitHub and receive work reliably.

## Required path

```text
HOST
  ↓
DNS resolution
  ↓
Outbound TCP/443 + TLS
  ↓
GitHub Actions runner service
  ↓
GitHub polling
  ↓
Job assignment
  ↓
Runner execution
  ↓
Sentinel + logs
```

## Required host capabilities
- Working DNS for GitHub endpoints.
- Working outbound HTTPS/TLS.
- Correct system time or NTP synchronization.
- Installed Actions Runner with repository registration.
- Correct runner name and labels.
- Enabled/running runner service.
- Runner logs showing connection/listening behavior.
- Host telemetry sufficient to correlate service state with GitHub job assignment.

## Not required
- Inbound port forwarding to the runner.
- Reverse proxy for GitHub Actions.
- TLS interception or MITM.
- Traffic interception layer.
- Custom routing proxy.
- Public exposure of the runner host.
- DNS modification solely to make the runner poll GitHub.

## Governance boundary
Host readiness is not G02 acceptance.

```text
HOST PREFLIGHT PASS
      ≠
G02 PASS

G02 PASS requires:
runner identity + job assignment + instantiated steps + sentinel execution + logs + retrievability + independent verification
```

## Failure handling
If DNS, outbound HTTPS, time synchronization, registration, or service health fails, repair the host and rerun preflight.
If host preflight passes but the GitHub job remains queued, investigate runner registration, repository access, runner groups/policy, and GitHub-side dispatch.
Do not weaken labels, bypass protected branches, or declare G02 from queue state.
