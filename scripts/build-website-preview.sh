#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${PAGES_BUILD_OUTPUT_DIR:-$ROOT/build/web}"
if [[ "$OUT" != /* ]]; then OUT="$PWD/$OUT"; fi
cd "$ROOT"

rm -rf "$OUT"
mkdir -p "$OUT"

# Root-level files intentionally approved for the static website preview.
for file in index.html 404.html robots.txt sitemap.xml manifest.webmanifest favicon.ico apple-touch-icon.png apple-touch-icon-precomposed.png; do
  if [[ -f "$file" ]]; then
    mkdir -p "$OUT/$(dirname "$file")"
    cp "$file" "$OUT/$file"
  fi
done

# Public website routes only. Never publish repository root, docs, workflows,
# infrastructure, Firebase configuration, environment examples, or source code.
PUBLIC_DIRS=(
  assets worlds contact studio studio-sites
  loyalty-lane-apparel loyalty-lane-cycles lane thats-my-lingo
  library kottons-code media trust-compliance community-guidelines
  privacy terms studio-assets studio-production universe app
  live-casino-studio admin-command-center landing
)

for dir in "${PUBLIC_DIRS[@]}"; do
  [[ -d "$dir" ]] || continue
  while IFS= read -r -d '' file; do
    relative="${file#./}"
    mkdir -p "$OUT/$(dirname "$relative")"
    cp "$file" "$OUT/$relative"
  done < <(find "$dir" -type f \( \
    -iname '*.html' -o -iname '*.htm' \
    -o -iname '*.css' -o -iname '*.js' -o -iname '*.mjs' \
    -o -iname '*.svg' -o -iname '*.png' -o -iname '*.jpg' \
    -o -iname '*.jpeg' -o -iname '*.webp' -o -iname '*.gif' \
    -o -iname '*.ico' -o -iname '*.woff' -o -iname '*.woff2' \
    -o -iname '*.ttf' -o -iname '*.otf' \
    -o -iname '*.mp3' -o -iname '*.wav' -o -iname '*.ogg' \
    -o -iname '*.mp4' -o -iname '*.webm' \
    -o -iname '*.json' -o -iname '*.xml' -o -iname '*.webmanifest' \
  \) -print0)
done

required=(
  index.html worlds/index.html thats-my-lingo/index.html
  assets/flagship-home.css assets/flagship-home.js
  assets/lingo-legacy-crimson-mark.svg assets/thats-my-lingo-mark.svg
)
for file in "${required[@]}"; do
  [[ -s "$OUT/$file" ]] || { echo "Missing required preview asset: $file" >&2; exit 1; }
done

# Fail closed if internal repository material is ever copied into the artifact.
forbidden=(
  .github docs infra infrastructure ansible kubernetes ops recovery diagnostics
  .env.example .firebaserc firebase.json firebase.client.json
  wrangler.jsonc pubspec.yaml README.md AGENTS.md SYSTEM-ACTIVATION-AUTHORITY.md
)
for path in "${forbidden[@]}"; do
  [[ ! -e "$OUT/$path" ]] || { echo "Forbidden repository content in preview: $path" >&2; exit 1; }
done

file_count="$(find "$OUT" -type f | wc -l | tr -d ' ')"
echo "Website preview artifact ready: $file_count public files"
echo "Output: build/web"
