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
# Generate only the web platform scaffold in a temporary project. Running
# "flutter create ." here rewrites the repository pubspec and invalidates the
# committed lockfile before --enforce-lockfile can verify it.
rm -rf /tmp/lingo_legacy_web_scaffold
flutter create /tmp/lingo_legacy_web_scaffold --project-name lingo_legacy --platforms web --no-pub
mkdir -p web
cp -a /tmp/lingo_legacy_web_scaffold/web/. web/

# Generate the missing Gradle wrapper from the exact pinned Flutter SDK.
# Export it as chunked base64 evidence so it can be committed without binary corruption.
echo "LINGO_STAGE=android_wrapper_generation"
rm -rf /tmp/lingo_legacy_android_scaffold
flutter create /tmp/lingo_legacy_android_scaffold --project-name lingo_legacy --org com.thelingolegacy --platforms android --no-pub
for spec in "gradlew:gradlew" "gradlew.bat:gradlew.bat" "gradle-wrapper.jar:gradle/wrapper/gradle-wrapper.jar"; do
  label="${spec%%:*}"
  source_path="/tmp/lingo_legacy_android_scaffold/android/${spec#*:}"
  test -s "$source_path"
  echo "ANDROID_WRAPPER_FILE=${label}"
  base64 -w0 "$source_path" | fold -w 3000 | awk -v label="$label" '{ printf "ANDROID_WRAPPER_CHUNK=%s:%03d:%s\n", label, NR-1, $0 }'
done
node --test scripts/test-cloudflare-pages-preview-build.mjs
node --test scripts/test-verify-flutter-android-readiness.mjs
echo "LINGO_STAGE=android_readiness"
if node scripts/verify-flutter-android-readiness.mjs; then
  echo "LINGO_ANDROID_READINESS=PASS"
else
  echo "::warning::LINGO_ANDROID_READINESS=BLOCKED_PREVIEW_ONLY — Android Gradle wrapper or API-21 compatibility evidence is incomplete. Web preview continues; no Android package is produced."
  echo "LINGO_ANDROID_READINESS=BLOCKED_PREVIEW_ONLY"
fi

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
flutter pub get --enforce-lockfile
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
