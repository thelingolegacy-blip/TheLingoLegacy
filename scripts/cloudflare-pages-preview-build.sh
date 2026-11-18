#!/usr/bin/env bash
set -euo pipefail
set -x
ROOT_DIR="$(pwd)"
trap 'status=$?; echo "LINGO_BUILD_EXIT=$status"; exit "$status"' EXIT

echo "LINGO_STAGE=build_start"
git init -q /tmp/flutter
git -C /tmp/flutter remote add origin https://github.com/flutter/flutter.git
git -C /tmp/flutter fetch --depth 1 origin refs/tags/3.50.0:refs/tags/3.50.0
git -C /tmp/flutter checkout --detach 3.50.0
export PATH="/tmp/flutter/bin:$PATH"
flutter --version

echo "LINGO_STAGE=flutter_scaffold"
flutter create . --platforms web --no-pub
node --test scripts/test-verify-flutter-android-readiness.mjs
node scripts/verify-flutter-android-readiness.mjs

echo "LINGO_STAGE=firebase_contract"
if node scripts/verify-flutter-firebase.mjs; then
  echo "LINGO_FIREBASE_INTEGRATION=CONFIGURED"
else
  echo "LINGO_FIREBASE_INTEGRATION=BLOCKED_PREVIEW_ONLY"
fi

echo "LINGO_STAGE=firebase_publication_boundary"
node --test scripts/test-verify-flutter-firebase.mjs
node --test scripts/test-build-firebase-public.mjs
node scripts/build-firebase-public.mjs

echo "LINGO_STAGE=root_flutter_checks"
flutter pub get --enforce-lockfile
flutter pub deps --style=compact | tee /tmp/lingo-firebase-deps.txt | grep -E "firebase|flutterfire|^js "
flutter analyze lib test
flutter test

echo "LINGO_STAGE=oasis_flutter_checks"
cd "$ROOT_DIR/studio-sites/games/oasis-platform/flutter"
flutter pub get
flutter analyze
flutter test
echo "OASIS_PUBSPEC_LOCK_BASE64=$(base64 -w0 pubspec.lock)"
cd "$ROOT_DIR"

echo "LINGO_STAGE=flutter_web_build"
flutter build web --release --target=lib/main.dart

echo "PUBSPEC_YAML_BASE64=$(base64 -w0 pubspec.yaml)"
echo "PUBSPEC_LOCK_BASE64=$(base64 -w0 pubspec.lock)"
echo "LINGO_FIREBASE_HOSTING=QUARANTINED"
echo "LINGO_STAGE=preview_build_complete"
