# G02 Working Runner Recovery — Operator Runbook

**Disposition at authoring:** BLOCKED. This document is an operator procedure, not evidence that the runner has been registered or repaired.

Repository: `thelingolegacy-blip/TheLingoLegacy`  
Expected runner: `lingo-legacy-g02`  
Expected labels: `self-hosted,linux,x64,lingo-g02`  
Expected host directory from the existing diagnostic script: `/opt/actions-runner`

## Safety boundaries

- Do not paste runner registration tokens, PATs, Gemini API keys, SSH keys, or environment dumps into ChatGPT, GitHub issues, AI Studio prompts, or incident packets.
- Do not remove or replace an existing runner registration until its identity and service state are inspected.
- Do not dispatch more diagnostic workflows while the existing four probes remain queued and unassigned; first restore/pinpoint the runner host.
- Do not change branch protection, Actions policy, production routes, Worker source, deployment state, LKG, or release gates as a workaround.
- Run commands only on the authorized runner host. Commands below are read-only until the clearly marked service-repair step.
- Run the existing repository diagnostic script if it is present and its contents have been reviewed: `bash ops/g02/diagnose-runner.sh`. It checks host/service state but is not by itself G02 PASS.

## 1. Read-only host inventory

Run on the Linux x86_64 host as an administrator or an account with permission to inspect systemd:

```bash
set -u
RUNNER_NAME="lingo-legacy-g02"
RUNNER_DIR="/opt/actions-runner"

printf '\n== host ==\n'
hostname
uname -a
printf '\n== runner directory ==\n'
ls -ld "$RUNNER_DIR" 2>&1 || true
printf '\n== registration file presence (never print its contents) ==\n'
test -s "$RUNNER_DIR/.runner" && echo "runner config present" || echo "runner config absent"
test -x "$RUNNER_DIR/run.sh" && echo "run.sh present" || echo "run.sh absent"
test -x "$RUNNER_DIR/svc.sh" && echo "svc.sh present" || echo "svc.sh absent"
printf '\n== runner service inventory ==\n'
systemctl list-units --type=service --all 'actions.runner.*' --no-pager 2>&1 || true
systemctl list-unit-files 'actions.runner.*.service' --no-pager 2>&1 || true
printf '\n== matching processes ==\n'
pgrep -af 'Runner.Listener|runsvc.sh|actions-runner' || true
printf '\n== recent diagnostic filenames only ==\n'
find "$RUNNER_DIR/_diag" -maxdepth 1 -type f -printf '%f\n' 2>/dev/null | sort | tail -20 || true
```

Do not cat `.runner`, `.credentials`, `.credentials_rsaparams`, service environment files, or full process environments; they may contain sensitive registration material.

## 2. Inspect service and runner logs

List the actual service unit from the inventory above. Do not guess its full name. Then set the exact unit and inspect it:

```bash
UNIT='paste-the-exact-actions.runner-....service-unit-here'
systemctl is-enabled "$UNIT" || true
systemctl is-active "$UNIT" || true
systemctl --no-pager --full status "$UNIT" --lines=60 || true
journalctl -u "$UNIT" --since '2 hours ago' --no-pager | tail -200
```

Inspect only relevant runner log excerpts from `/opt/actions-runner/_diag`. Redact tokens, credentials, signed URLs, private repository metadata not needed for diagnosis, and user data before sharing. The important signals are connection success, polling/listening, authentication or authorization errors, proxy/TLS failures, and whether the runner is waiting for jobs.

## 3. Repair an existing registration (only after diagnosis)

If the runner is already registered and the service unit is valid but inactive, the narrow repair may be to enable/start that exact service:

```bash
sudo systemctl enable --now "$UNIT"
systemctl is-active "$UNIT"
journalctl -u "$UNIT" --since '10 minutes ago' --no-pager | tail -100
```

If it is active but demonstrably stuck, capture the current logs first. Restart only the identified runner service, not the host or unrelated services:

```bash
sudo systemctl restart "$UNIT"
systemctl is-active "$UNIT"
journalctl -u "$UNIT" --since '10 minutes ago' --no-pager | tail -100
```

Do not restart blindly if logs show a policy, permission, expired registration, TLS/proxy, or network issue. Diagnose that specific error first. A service marked active is not sufficient: the listener must actually connect and poll.

## 4. If registration is absent or invalid

A repository administrator must generate a fresh, short-lived runner registration token in the repository's **Settings → Actions → Runners → New self-hosted runner** flow. Never place the token in this runbook or send it to an AI assistant.

Use GitHub's currently displayed setup instructions for the host's operating system/architecture. If using the already prepared `/opt/actions-runner` installation, first inspect its files, owner, version, and existing registration. Do not run `config.sh remove`, use `--replace`, or overwrite a registration as a first-line fix.

If a new registration is truly required, execute the setup interactively on the authorized host with the fresh token held only in the terminal/session; name it `lingo-legacy-g02` and apply the custom label `lingo-g02` (GitHub adds standard `self-hosted`, OS, and architecture labels). Then install/configure the service following GitHub's current official instructions and verify the actual service unit and logs. The token must not be saved in shell history, shared transcripts, or files committed to Git.

## 5. Verify assignment from GitHub — do not infer it

The four existing probes were observed queued with `runner_id: 0`, empty `runner_name`, and no steps. After host repair, re-query the existing sentinel run first:

- Sentinel: https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38919915689
- Assignment probe: https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38919915688
- Qualified evidence probe: https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38919915698
- Runner smoke: https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38919915753

A working runner must produce fresh GitHub evidence showing:
1. Matching labels and a populated runner identity.
2. A job assigned with `runner_id > 0` and `runner_name = lingo-legacy-g02`.
3. Steps instantiated and sentinel steps executed.
4. Retrievable job logs.
5. A retrievable artifact tied to the exact run attempt and source SHA.
6. Independent SHA-256 computed from downloaded artifact bytes, plus an independently retrievable verification record bound to the artifact reference.

If the jobs remain queued with runner ID 0, the runner is not yet proven to be working. Investigate Actions permissions, runner group access, repository assignment, labels, network connectivity, and provider-side dispatch diagnostics; do not change unrelated production infrastructure.

## 6. Evidence to return

Share only a sanitized report containing:
- UTC capture time, host OS/architecture, runner service unit name and active/enabled state.
- Redacted log excerpts proving connection and polling (or the exact failure).
- GitHub run/job URLs and JSON fields for runner ID/name, status, steps, logs, and artifacts.
- Artifact ID/name, source SHA, run ID/attempt, computed SHA-256, verifier identity/time, and verification record URL/reference.
- Explicit limitations and any fields still UNKNOWN.

Never include tokens, passwords, private keys, cookies, signed artifact download URLs, or the contents of runner credential files.

## Acceptance decision

Until all required live evidence is collected and independently verified:

`G02 = BLOCKED` · `ROOT_CAUSE = UNCONFIRMED` · `PRODUCTION = LOCKED` · `LKG = PROTECTED`

Host/service recovery alone does not authorize production deployment or activation.
