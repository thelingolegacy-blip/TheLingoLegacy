# LINGO Developer Tooling Setup

This package prepares developer tooling without changing production, deploying applications, or changing the host's default login shell.

## Included tools

- **Steadybit CLI** — installed from the current npm package using the documented `steadybit` package. Authenticating or running experiments is deliberately not part of bootstrap.
- **Bybit KaaS CLI** — installed through the upstream installer. The server is not started during bootstrap.
- **Xonsh** — pinned to `0.24.2` in an isolated Python virtual environment. The system Python and login shell are not replaced.
- **aflare-action** — used by the manual GitHub Actions validation workflow. The action is pinned to commit `97438a7002235aa3e9bf280ff8004bd281262cf5`, corresponding to release `v0.12.0`.

## Host setup (Linux or macOS)

Prerequisites: `curl`, `npm`, and `python3`. The current upstream KaaS installer supports Linux amd64/arm64 and macOS arm64; Intel macOS is not supported by the current KaaS CLI binary.

Review the script and upstream installers before running:

```bash
sed -n '1,240p' ops/tooling/bootstrap-dev-tools.sh
bash ops/tooling/bootstrap-dev-tools.sh
source "$HOME/.config/lingo-tooling/env.sh"
```

The script uses user-scoped paths and does not use `sudo`, edit shell startup files, change the default shell, start KaaS, or configure production credentials. The environment helper only adjusts PATH for the current shell when sourced.

### Start KaaS when ready

KaaS requires an OpenAI-compatible API key. Set it interactively in your shell or through your approved secret manager; do not commit it or paste it into workflow YAML.

```bash
export LLM_API_KEY='(set this securely in your own shell)'
export LLM_BASE_URL='https://api.openai.com/v1'
export LLM_MODEL='gpt-4o-mini'
kaas serve
```

The service defaults to port 8080. Once it starts, verify from the same host with:

```bash
curl --fail http://localhost:8080/healthz
```

Do not expose the service publicly or enable remote MCP until authentication and network boundaries are explicitly configured. KaaS is not started by either bootstrap path.

## Repository CI

Workflow: [`.github/workflows/tooling-validation.yml`](../../.github/workflows/tooling-validation.yml)

- Trigger: manual `workflow_dispatch` only.
- Permissions: `contents: read`.
- Checks Steadybit CLI help, Xonsh execution, KaaS CLI help, and aflare CLI help.
- Does not require API keys, run experiments, start the KaaS server, execute an aflare workflow, or deploy anything.
- It is a tool-installation smoke test, not a G02 runner acceptance test.

Run it manually from the GitHub Actions page on this branch after reviewing the changes. A successful run proves the GitHub-hosted job could execute these checks; it does not install tools on the separate G02 host.

## Host access boundary

The repository workflow cannot install software on a separate host. Run the bootstrap script on the intended Linux/macOS host through an approved terminal/SSH session. Do not paste API keys, runner registration tokens, or other secrets into the repository or chat.

## Safety and repeatability notes

- Xonsh is pinned to `0.24.2`.
- aflare-action is pinned by commit SHA, with the release version set to `v0.12.0`.
- Steadybit and KaaS follow their current upstream installation paths; review and re-pin those sources for a locked-down production toolchain.
- No production deployment, merge, activation, runner registration, runner deletion, or secret operation is part of this setup.
