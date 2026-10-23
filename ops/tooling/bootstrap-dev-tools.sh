#!/usr/bin/env bash
set -euo pipefail

# User-scoped tooling bootstrap for The Lingo Legacy.
# Does not use sudo, alter the login shell, start KaaS, touch production,
# or write credentials to disk. Review upstream installers before execution.

if [[ "$(uname -s)" != "Linux" && "$(uname -s)" != "Darwin" ]]; then
  echo "Unsupported host OS: $(uname -s). Use Linux or macOS." >&2
  exit 2
fi

for command_name in curl npm python3; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing prerequisite: $command_name. Install it first, then rerun." >&2
    exit 2
  fi
done

local_bin="$HOME/.local/bin"
tooling_home="$HOME/.local/share/lingo-tooling"
config_home="$HOME/.config/lingo-tooling"
mkdir -p "$local_bin" "$tooling_home" "$config_home"

echo "[1/4] Installing current Steadybit CLI to a user-scoped npm prefix..."
npm install --global --prefix "$HOME/.local" steadybit

echo "[2/4] Installing Xonsh 0.24.2 into an isolated virtual environment..."
python3 -m venv "$tooling_home/xonsh-venv"
"$tooling_home/xonsh-venv/bin/python" -m pip install --disable-pip-version-check --upgrade pip
"$tooling_home/xonsh-venv/bin/python" -m pip install --disable-pip-version-check "xonsh==0.24.2"
ln -sfn "$tooling_home/xonsh-venv/bin/xonsh" "$local_bin/xonsh"

echo "[3/4] Downloading and running the official Bybit KaaS CLI installer..."
installer="$(mktemp)"
trap 'rm -f "$installer"' EXIT
curl --fail --silent --show-error --location \
  https://raw.githubusercontent.com/bybit-exchange/kaas/main/install.sh \
  --output "$installer"
sh "$installer"

echo "[4/4] Writing a non-secret environment helper..."
cat > "$config_home/env.sh" <<'ENV'
# Source this file from the current shell to expose user-scoped tools.
export PATH="$HOME/.local/bin:$HOME/.kaas:$PATH"
ENV

export PATH="$local_bin:$HOME/.kaas:$PATH"

command -v steadybit >/dev/null
steadybit --help
"$tooling_home/xonsh-venv/bin/xonsh" --version
"$tooling_home/xonsh-venv/bin/xonsh" --no-rc -c 'print("XONSH_SMOKE=PASS")'

if command -v kaas >/dev/null 2>&1; then
  kaas --help
else
  echo "KaaS installer returned, but 'kaas' was not found. Review its output and PATH." >&2
  exit 1
fi

echo
echo "Tool installation and smoke checks passed."
echo "Current shell: source \"$config_home/env.sh\""
echo "KaaS was NOT started. To run it, set LLM_API_KEY in your shell, then run: kaas serve"
echo "Xonsh is available as: xonsh"
echo "Your default/login shell was not changed."
