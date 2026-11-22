# G02 InterServer Host Plan — Persistent Runner

**State:** PLAN PREPARED — HOST NOT PURCHASED — RUNNER NOT REGISTERED  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Control issues:** #242 (host/runner), #517 (enterprise completion)  
**Candidate:** InterServer Ubuntu KVM VPS, 3 slices, published $9/month

## 1. Purchase gate

The provider currently advertises the 3-slice Ubuntu VPS at $9/month with 2 CPU cores, 6 GB RAM, 120 GB SSD and 6 TB monthly transfer. Cloud VPS is billed monthly and can be cancelled from the account. The provider states there is no trial or money-back guarantee.

Do not order until the provider checkout confirms all of the following:

- Recurring monthly service price is $9.00 USD.
- All taxes and mandatory recurring fees keep the total at or below the approved $10.00/month ceiling.
- Billing is monthly, with no annual or multi-month commitment.
- The selected image is Ubuntu 24.04 LTS (or a currently supported Ubuntu LTS if 24.04 is not offered).
- The provisioned guest is Linux x86_64/AMD64.
- The selected 3-slice KVM allocation matches the advertised 2 cores / 6 GB RAM / 120 GB SSD.
- No paid control panel, backup, license, or add-on is preselected.

The $9 public price is not proof of the final checkout total. No purchase has been made or authorized by this plan. If any condition fails, stop and return to the owner.

## 2. Architecture decision

This plan targets one **persistent, repository-scoped GitHub Actions runner** on the approved VPS. It does not use Cloudflare Workers as a compute host.

The existing `ops/github-runner/bootstrap.sh` and its container package are documented as an **ephemeral Docker runner**. Do not run that bootstrap for this persistent design. Reconcile the existing ephemeral package and any active recovery branches before adopting either implementation. Do not run both designs or register a second runner.

The runner is not a general-purpose server, web host, game host, or production deployment agent. Start with one concurrent job. Keep production credentials, Cloudflare deployment secrets, payment credentials, and unrelated project secrets off this machine.

## 3. Required host inventory before registration

After the VPS exists, record redacted output for:

```bash
hostnamectl
uname -m
uname -r
lscpu
free -h
df -h /
lsblk
systemctl --version
curl --version
```

Required checks:

- `uname -m` reports `x86_64`.
- Ubuntu release is supported and fully patched.
- At least 4 GB usable memory is visible; target allocation is 6 GB.
- Root filesystem has adequate free disk; target allocation is 120 GB SSD.
- Correct system time and NTP synchronization.
- Outbound HTTPS to GitHub Actions endpoints works.
- SSH access uses key authentication; password SSH and root SSH login are disabled after verifying a separate sudo-capable administrator.
- Host firewall permits SSH only from the owner's trusted source where feasible; outbound HTTPS/DNS/NTP remain available.
- No existing runner with the target name is present in the repository inventory.

Do not expose host credentials, private keys, registration tokens, PATs, runner credential files, or unredacted environment output in issues, logs, or chat.

## 4. GitHub inventory and duplicate protection

Repository Settings → Actions → Runners:

https://github.com/thelingolegacy-blip/TheLingoLegacy/settings/actions/runners

Inspect the inventory and Actions policies before registering. If `lingo-legacy-g02` already exists, stop. Correlate its numeric runner ID, status, labels, and last-seen time; repair the existing host or remove only the exact verified stale registration. Never delete by name alone.

The intended registration is repository-scoped to `thelingolegacy-blip/TheLingoLegacy`, with:

- Name: `lingo-legacy-g02`
- Required labels: `self-hosted`, `linux`, `x64`, `lingo-g02`
- Work concurrency: 1
- Workflow scope: the approved G02 sentinel only until a separate security review expands it.

The repository is public. Do not allow untrusted fork pull requests, arbitrary pull-request code, or unreviewed workflows to execute on this persistent host. Keep the sentinel manual-dispatch-only unless its trigger and permissions are separately reviewed.

## 5. Persistent runner installation procedure

This is an owner/operator procedure to execute only after the host has been purchased, verified, secured, and the duplicate check passes.

1. Create a dedicated unprivileged Linux account named `lingo-runner`; keep a separate administrator account for host maintenance.
2. Obtain the current official Linux x64 GitHub Actions runner package from the GitHub runner releases page. Verify the published SHA-256 checksum before extraction.
3. Install it in a dedicated directory owned by `lingo-runner`, for example `/opt/actions-runner`.
4. An authorized repository administrator obtains a short-lived repository registration token locally from GitHub. Do not paste it into chat, an issue, a command-line argument, or a committed file.
5. Configure the runner interactively or through a protected local shell using the repository URL, exact name, and custom label `lingo-g02`. GitHub automatically supplies the standard `self-hosted`, `linux`, and `x64` labels when detected.
6. Install and start the service using the runner package's `svc.sh` helper, running the service as `lingo-runner`.
7. Discover and record the actual service unit generated by GitHub. The generated unit commonly includes both owner/repository and runner name; do not assume it is literally `actions.runner.lingo-legacy-g02.service`. If a stable alias is required, add it only after inspecting the generated unit and validating restart behavior.
8. Enable service startup at boot and verify service health, runner online status, labels, and GitHub last-seen timestamp.

Do not place a registration token in systemd unit files, shell history, source control, logs, or persistent environment files. The registration token is short-lived and is not the runner's ongoing credential. Protect the runner's local credential material with filesystem permissions and host access controls.

## 6. G02 execution acceptance

Run the existing manual workflow `.github/workflows/g02-sentinel.yml` only after host readiness and runner online status are independently verified.

G02 remains **FAIL / UNVERIFIED** until evidence proves all of these:

- Runner ID is a positive integer.
- Runner name is exactly `lingo-legacy-g02`.
- Runner labels include `self-hosted`, `linux`, `x64`, and `lingo-g02`.
- The job is assigned to that runner, not merely queued.
- The job has instantiated steps and all required steps complete successfully.
- The sentinel validates Linux/X64 and exact runner identity.
- The uploaded artifact `g02-sentinel-evidence-<run_id>` is retrievable.
- Logs, run ID, job ID, attempt, and full commit SHA correlate.
- Evidence is independently reviewed and attached to #242 and #517.

A green workflow definition, online badge, queued run, or documentation change alone is not runtime acceptance.

## 7. Resource policy and operations

- Start with `max-parallel: 1` / one runner job at a time.
- Monitor CPU, memory, disk, network, and job duration for the first 10 successful runs.
- Do not add Docker or privileged container access unless an approved workflow demonstrably requires it. If Docker is needed, isolate workloads and never expose the host Docker socket to untrusted code.
- Enable unattended security updates and a tested reboot/runner-reconnect procedure.
- Keep an owner-controlled backup of configuration and runbooks; do not back up or export live runner credentials.
- Add a monthly cost check and alert the owner before any plan, tax, or add-on change exceeds $10/month.
- No auto-scaling, extra runners, paid monitoring, snapshots, or add-ons without separate approval.

## 8. Current status and blockers

| Predicate | State |
|---|---|
| Candidate selected | PASS — owner selected InterServer 3-slice |
| Published base price | PASS — provider lists $9/month |
| Final checkout total including tax | BLOCKED — owner checkout evidence required |
| Purchase/payment | NOT STARTED |
| VPS created | NOT STARTED |
| Ubuntu x86_64 verified | NOT STARTED |
| SSH/admin access | NOT STARTED |
| Existing runner inventory rechecked | BLOCKED — must inspect immediately before registration |
| Persistent runner installed | NOT STARTED |
| Runner ID/name/labels verified | NOT STARTED |
| Sentinel execution/logs/artifact | NOT STARTED |
| G02 acceptance | FAIL / UNVERIFIED |
| Production release | HOLD — unchanged |

## 9. Completion boundary

This plan prepares the configuration and owner-side installation path. It does not create an InterServer account, accept provider terms, make a payment, provision a VPS, access a host, mint a registration token, register a runner, start a service, dispatch a workflow, merge code, or deploy production. Those actions require the real provider account/host and their respective owner-side confirmations.
