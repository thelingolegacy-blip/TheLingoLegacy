# LINGO Sentinel + Beacon — Proposed Recovery Watch

**Status:** Draft tooling only. Not installed on the runner host; no schedule, webhook, alert route, or runtime has been configured.

## Roles

- **Sentinel** (\`lingo-sentinel.py\`) captures a read-only host snapshot: listener-process visibility, runner-root presence, disk usage, and the protected release-gate state.
- **Beacon** (\`lingo-beacon.py\`) forwards a small allowlisted heartbeat to an explicitly configured HTTPS receiver. A 2xx response means only that the receiver accepted the heartbeat.

## Safety invariants

- G02 remains **BLOCKED**.
- Production remains **HOLD**.
- Fail-closed remains **ACTIVE**.
- Last-known-good remains **PROTECTED**.
- Both tools always report \`release_authorization: false\`.
- Neither tool starts, stops, installs, registers, or relabels a runner; changes DNS; deploys; or modifies release gates.
- Never put tokens, passwords, private keys, cookies, raw environment dumps, or full logs into beacon payloads.
- A running \`Runner.Listener\` process is not proof that GitHub assigned a job. G02 still requires independently verifiable runner ID/name, job assignment, instantiated steps, sentinel execution, retrievable logs, and artifact correlation to the exact run/job/SHA.

## Manual, read-only rehearsal

Run on an authorized Linux runner host only after reviewing the script:

\`\`\`sh
python3 ops/ai-sre/lingo-sentinel.py > sentinel-report.json
status=$?
cat sentinel-report.json
printf 'sentinel_exit=%s\\n' "$status"
\`\`\`

Exit code 0 means a listener process was detected; 2 means the basic process probe did not confirm one. Neither result passes G02. Protect and sanitize the report before retaining it because it includes a hostname and host resource metadata.

## Beacon delivery rehearsal

Only configure this after an owner approves the receiver and its data-handling policy. Do not put credentials in the URL. The endpoint must be HTTPS.

\`\`\`sh
python3 ops/ai-sre/lingo-sentinel.py | LINGO_BEACON_URL='https://approved-receiver.example/heartbeat' python3 ops/ai-sre/lingo-beacon.py
\`\`\`

The example hostname is a placeholder, not a real service. Do not execute the example unchanged. Prefer a receiver with authenticated ingress; add authentication only through an approved secret store and a reviewed change, never hardcode secrets in the repository. The current Beacon implementation intentionally has no credential mechanism.

## Independent monitoring design

For a true dead-runner signal, the Beacon must be scheduled outside the runner being monitored (for example, a separately administered external monitor). If the runner itself runs both tools, a dead host cannot emit its own failure heartbeat. Configure a missed-heartbeat alert and test it from an independent system before relying on it.

## Acceptance checklist

- [ ] Code review and static validation completed.
- [ ] Sentinel exercised on an authorized isolated host.
- [ ] Beacon endpoint approved and secured; payload retention reviewed.
- [ ] External scheduler/monitor provisioned separately and documented.
- [ ] Positive heartbeat and missed-heartbeat alert tested independently.
- [ ] GitHub run evidence correlated to run ID, job ID, SHA, runner identity, step logs, and artifact.
- [ ] G02 accepted only after every canonical predicate passes independently.
- [ ] Production authorization reviewed separately; never inferred from heartbeat success.

**Current status:** implementation committed to a draft feature branch; not deployed or scheduled. G02 remains BLOCKED and production remains on HOLD.
