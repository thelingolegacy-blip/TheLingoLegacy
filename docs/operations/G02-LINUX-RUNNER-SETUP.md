# G02 Linux self-hosted runner setup

This runbook registers the dedicated Linux x64 runner used by the G02 qualification workflow.

## Safety first

- Use a machine you control and can keep patched, online, and connected to GitHub over outbound HTTPS (port 443).
- Self-hosted runners can execute repository workflow code. Do not use this runner for untrusted fork pull requests or unreviewed workflows. Keep jobs targeting `[self-hosted, linux, x64, lingo-g02]` restricted to trusted, reviewed workflows.
- Never commit, paste, or log the temporary registration token. Generate it in repository Settings immediately before configuring the runner; it expires after one hour.
- Qualification runs tests and a Wrangler dry-run only. It does not authorize production deployment.

## Register the runner

1. Open https://github.com/thelingolegacy-blip/TheLingoLegacy/settings/actions/runners
2. Choose **New self-hosted runner**, then **Linux**, then **x64**.
3. On the Linux host, follow GitHub's current displayed commands to download and extract the runner package. Use the exact current version and checksum/commands shown by GitHub; do not reuse stale download URLs.
4. From the extracted runner directory, run the GitHub-generated `config.sh` command with the fresh token, using these settings when prompted:
   - Repository URL: `https://github.com/thelingolegacy-blip/TheLingoLegacy`
   - Runner name: `lingo-legacy-g02`
   - Additional label: `lingo-g02`
   - Work folder: accept the default unless the host has a documented reason not to.
5. After configuration completes, install and start the service from that same directory:

```bash
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

## Verify

- Refresh the repository runner settings page. Confirm `lingo-legacy-g02` is **Online** and carries `self-hosted`, `linux`, `x64`, and `lingo-g02`.
- If it is not online, inspect service logs. The runner service name is recorded in the `.service` file in the runner directory:

```bash
cat .service
sudo systemctl --type=service | grep actions.runner
```

Use the exact service name returned above to inspect recent logs:

```bash
sudo journalctl -u 'EXACT_SERVICE_NAME_FROM_OUTPUT' --since '30 minutes ago' --no-pager
```

Do not disable TLS verification to work around network problems. Check outbound HTTPS access, DNS, system time, certificates, and any corporate proxy configuration instead.

## Qualification

The qualification workflow is in `.github/workflows/g02-self-hosted-runner-qualification.yml` on the recovery branch. The workflow must first be reviewed and made available from the default branch. Then run it with incident reference `G02-RUNNER-QUALIFICATION-01`.

A successful qualification requires a completed run, passing test/runtime-verifier/dry-run steps, and the uploaded evidence artifact. A runner that merely appears online is not qualified. Keep production deployment disabled until the required independent release and rollback evidence is reviewed.

## Related records

- Draft recovery PR: https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/369
- Actions startup incident evidence: https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/368
- Runner settings: https://github.com/thelingolegacy-blip/TheLingoLegacy/settings/actions/runners
- Qualification workflow: https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/workflows/g02-self-hosted-runner-qualification.yml
- GitHub runner setup documentation: https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/add-runners
