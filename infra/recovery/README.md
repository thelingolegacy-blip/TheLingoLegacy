# LINGO Recovery Infrastructure

## Read-only G02 control agent

Worker name: `lingo-g02-control-agent-2026-10-10`

Worker URL pattern: `https://lingo-g02-control-agent-2026-10-10.thelingolegacy.workers.dev`

Endpoints:
- `GET /healthz` — process health response.
- `GET /g02/status` — recorded release-gate state and last observed run/job IDs.
- `GET /g02/acceptance` — conjunctive G02 acceptance requirements.

The source is versioned at `infra/recovery/lingo-g02-control-agent.js`.

### Security boundary

- Read-only: only GET, HEAD, and OPTIONS are accepted; write methods return 405.
- No GitHub token, Cloudflare API token, secret binding, production route, production DNS change, or production data binding is configured.
- It is an edge Worker, **not** a persistent Linux host and **not** a GitHub Actions runner.
- It does not create runner registrations, poll GitHub, execute jobs, repair host services, create credentials, or grant release authorization.
- Its response is a snapshot of recorded evidence, not a live runner inventory. Update the source only when the evidence snapshot is intentionally refreshed.
- Production remains frozen and last-known-good remains protected.

### Verification from an authorized network

Run these checks from a machine that can reach the public Workers endpoint:

```bash
set -eu
BASE='https://lingo-g02-control-agent-2026-10-10.thelingolegacy.workers.dev'
curl --fail --silent --show-error "$BASE/healthz"
printf '\\n'
curl --fail --silent --show-error "$BASE/g02/status"
printf '\\n'
curl --fail --silent --show-error "$BASE/g02/acceptance"
printf '\\n'
code="$(curl --silent --output /tmp/lingo-g02-post-check.json --write-out '%{http_code}' -X POST "$BASE/g02/status")"
test "$code" = 405
rm -f /tmp/lingo-g02-post-check.json
echo "READ_ONLY_METHOD_GUARD=PASS"
```

A request denied by an intermediate network policy is not proof that the Worker is unhealthy; run the probe from an authorized network and retain the actual status/body.

## Actual host requirement

A persistent Linux x64 host is still required for the self-hosted runner. A Cloudflare Worker cannot substitute for that daemon. See `ops/g02/host-provisioning.md`.
