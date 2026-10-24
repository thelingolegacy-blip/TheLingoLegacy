# G02 Linux Host Preflight Runbook

## Purpose

Collect read-only host telemetry before attempting self-hosted runner registration or service changes. The script is `host-inspection-linux.sh`; run it on the actual `lingo-legacy-g02` host from a reviewed checkout of this branch.

## Run

```bash
bash studio-vnext/host-inspection-linux.sh
```

The script reports hostname, UTC time, kernel, root filesystem capacity/inodes, memory/swap, runner-related process names without command-line arguments, runner service inventory, and DNS resolution for GitHub endpoints. It does not register a runner, start or stop services, change network/DNS settings, or make authenticated requests.

## Handling output

- Review output locally before sharing it.
- Redact internal hostnames, usernames, addresses, or other sensitive infrastructure details if they are not needed for diagnosis.
- Never include a registration token, PAT, private key, environment dump, or full process command lines.
- An empty process/service result is not proof that a runner is absent; inspect the installed runner directory and service configuration separately under the host administrator's change-control process.
- DNS resolution only demonstrates name resolution, not successful HTTPS connectivity or GitHub Actions polling.

## Acceptance boundary

This preflight is not runner registration evidence. G02 remains blocked until a controlled workflow yields a real assigned job, populated runner identity, executed sentinel, retrievable logs, and a checksum-verified evidence artifact, followed by independent review. Do not infer a numeric runner ID from a proposed name or a locally generated tracking identifier.

## Change control

No production deployment, merge, DNS/network mutation, secret change, or release-gate promotion is authorized by this runbook. Use a dedicated, least-privileged runner for trusted diagnostics; do not run untrusted pull-request code on a production-capable host.
