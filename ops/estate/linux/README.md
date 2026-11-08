# Linux G02 Host Rebuild Kit

Target: dedicated Ubuntu Server 24.04 LTS x86_64 VM for GitHub Actions runner `lingo-legacy-g02`.

## Important execution boundary
These files are a rebuild kit. They do not create a VM or run on a remote host by themselves. A compute-provider account/VM must be selected and authorized. Do not use Vercel for this recovery; it is excluded by the existing project decision. Cloudflare Workers are not Linux runner hosts.

## Host profile
- Ubuntu Server 24.04 LTS, x86_64, dedicated VM.
- SSH key authentication; disable password SSH using the provider image's supported configuration after confirming key access.
- Non-root operator with sudo for host administration.
- Runner process runs as dedicated `actions-runner` user.
- Outbound HTTPS (TCP 443) to GitHub and required package/release endpoints.
- No inbound internet listener is required for GitHub Actions polling.
- Do not attach production secrets or production service-account keys.
- No Docker socket access for untrusted workflows.
- Do not run untrusted fork pull-request code on this self-hosted runner.
- Snapshot the clean OS before installing the runner.

## Rebuild sequence
1. Provision a new Ubuntu 24.04 LTS x86_64 VM with SSH-key access and enough disk/RAM for builds. Record provider, instance ID, region, image ID, and creation time.
2. Copy `ops/estate/linux/cloud-init.yaml` into the provider's user-data field. It installs only baseline packages and creates directories; it does not register a runner.
3. Connect by SSH and verify OS, architecture, disk, memory, time sync, and outbound HTTPS.
4. Clone the repository using an authorized method and check out the reviewed commit. Do not use a floating branch for the host bootstrap in the final evidence record.
5. Run `sudo bash ops/estate/linux/rebuild-linux-host.sh --prepare`.
6. Generate a short-lived repository runner registration token in the authorized GitHub repository Settings → Actions → Runners flow. Do not paste it into chat, shell history, cloud-init, user-data, or repository files.
7. In the same protected shell session, export `RUNNER_TOKEN` and run `sudo --preserve-env=RUNNER_TOKEN bash ops/estate/linux/rebuild-linux-host.sh --register-runner`. If sudo policy will not preserve the variable, securely transfer it via a root-only environment file in `/run`, mode 0600, and delete it immediately after use. Never persist it in cloud-init or disk snapshots.
8. Verify service state and daemon logs. Confirm GitHub Settings → Actions → Runners shows the exact name and labels:
   `lingo-legacy-g02`; `self-hosted,linux,x64,lingo-g02`.
9. Only after host identity, daemon, labels, and Actions policy are independently verified, authorize one G02 sentinel run.
10. G02 passes only after a real job assignment with runner ID > 0, runner name populated, steps instantiated, sentinel exit code 0, retrievable logs/artifact, checksum, and independent run/commit correlation.

## Recovery and rollback
- Prefer a new VM over destructive in-place OS reinstallation.
- Keep the old host and its evidence intact until the new host is verified.
- Never remove the old runner registration or delete its disk before recording the inventory and approval.
- A green service state is not G02 PASS.
- Do not merge PRs, deploy, activate features, or change production routing as part of host rebuild.
