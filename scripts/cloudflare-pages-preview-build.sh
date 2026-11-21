#!/usr/bin/env bash
set -Eeuo pipefail

# Cloudflare Pages preview build for the Flutter offline-preview app.
# The build is isolated to this Pages project; it does not publish Firebase Hosting.

FLUTTER_ROOT="${FLUTTER_ROOT:-/tmp/flutter}"
if ! command -v flutter >/dev/null 2>&1; then
  if [[ ! -x "$FLUTTER_ROOT/bin/flutter" ]]; then
    if [[ -e "$FLUTTER_ROOT" ]]; then
      echo "Flutter root exists but has no executable: $FLUTTER_ROOT" >&2
      exit 1
    fi
    git clone --depth 1 --branch stable https://github.com/flutter/flutter.git "$FLUTTER_ROOT"
  fi
  export PATH="$FLUTTER_ROOT/bin:$PATH"
fi

flutter --version

# This repository intentionally stores only the application source. Generate
# the standard web shell in the ephemeral build workspace when it is absent.
if [[ ! -f web/index.html ]]; then
  flutter create --platforms=web .
fi

flutter pub get
flutter test
flutter build web --release

test -s build/web/index.html
printf 'LINGO_FLUTTER_WEB_PREVIEW_BUILD=PASS\n'
printf 'FIREBASE_BACKEND=NOT_CONFIGURED_OFFLINE_PREVIEW_ONLY\n'
