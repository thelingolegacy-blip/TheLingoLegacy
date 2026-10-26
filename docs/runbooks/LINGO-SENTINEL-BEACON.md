# LINGO Sentinel + Beacon — Proposed Recovery Watch

**Status:** Draft tooling only. Not installed on the runner host; no schedule, webhook, alert route, or runtime has been configured.

## Roles

- **Sentinel** (`lingo-sentinel.py`) captures a read-only host snapshot: listener-process visibility, runner-root presence, disk usage, and the protected release-gate state.
- **Beacon** (`lingo-beacon.py`) forwards a small allowlisted heartbeat to an explicitly configured HTTPS receiver. A 2xx response means only that the receiver accepted the heartbeat.

## Safety invariants

- G02 remains **BLOCKED**; production remains **HOLD**; fail-closed remains **ACTIVE**; last-known-good remains **PROTECTED**.
- Both tools always report `release_authorization: false`.
- Neither tool starts, stops, installs, registers, or relabels a runner; changes DNS; deploys; or modifies release gates.
- Never put tokens, passwords, private keys, cookies, raw environment dumps, or full logs into beacon payloads.
- A running `Runner.Listener` process is not proof that GitHub assigned a job. G02 still requires independently verifiable runner ID/name, job assignment, instantiated steps, sentinel execution, retrievable logs, and artifact correlation to the exact run/job/SHA.

## Manual rehearsal

Run Sentinel only on an authorized Linux runner host after reviewing the script. It writes a JSON report to standard output and returns exit code 0 if a listener process was detected, or 2 if the process probe did not confirm one. Neither result passes G02. Protect and sanitize reports before retaining them because they include a hostname and host resource metadata.

Beacon reads a Sentinel JSON report from standard input. Set `LINGO_BEACON_URL` only after an owner approves an HTTPS receiver and its data-handling policy. The sample hostname in the earlier draft was a placeholder, not a real service. Do not put credentials in a URL. The current Beacon implementation has no credential mechanism; use only an approved, secured receiver and do not send sensitive data.

## Independent monitoring design

For a true dead-runner signal, the Beacon must be scheduled outside the runner being monitored, such as from a separately administered external monitor. If the runner itself runs both tools, a dead host cannot emit its own failure heartbeat. Configure and independently test a missed-heartbeat alert before relying on it.

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
