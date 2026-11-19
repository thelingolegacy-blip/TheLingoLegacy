#!/usr/bin/env bash
set -euo pipefail

# This branch serves the curated static website preview. The shared Pages
# project uses build/web as its output directory; never publish the repo root.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
bash "$ROOT/scripts/build-website-preview.sh"
