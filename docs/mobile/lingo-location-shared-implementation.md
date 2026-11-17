# LINGO Location — shared Flutter implementation

**Branch:** `feature/lingo-location-shared`  
**Draft PR:** [#487](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/487)  
**Base commit:** `3923a08b77c8cc93ec5447e9623045318c825234`  
**Current implementation commit:** `7a84539be8731687ac01ccde0cb99c19d6ba9abc`  
**Release posture:** staging-only candidate; production unchanged.

## Architecture

- Flutter Android and iOS clients.
- HERE SDK Explore for native map rendering and foreground location, subject to SDK package/license acquisition.
- Firebase Authentication for user identity.
- Cloud Firestore for private saved markers.
- Shared Flutter domain models and service interfaces.
- GitHub remains the source of truth.
- No background location tracking, public live-location feed, or continuous location history in release one.

## Source changes in this branch

- Updated the Dart SDK lower bound to 3.12.2 to align with the HERE Flutter SDK documented minimum.
- Updated the FlutterFire dependency family and added Cloud Firestore:
  - `firebase_core ^5.1.0`
  - `firebase_auth ^7.0.1`
  - `cloud_firestore ^7.1.0`
  - `firebase_database ^13.0.1`
  - `firebase_storage ^14.0.1`
  - `firebase_analytics ^13.0.1`
- Added `LocationPoint` with coordinate and accuracy validation.
- Added `SavedLocationMarker` with coordinate, name, category, and private-visibility validation.
- Added a foreground location provider interface. The HERE adapter is not yet implemented because the licensed HERE SDK package is not present in the repository.
- Added `MarkerRepository` using the authenticated user's path `users/{uid}/saved_locations/{markerId}`.
- Added model validation tests.
- Made the mobile shell skip Firebase initialization when the checked-in Firebase options are still placeholders, and show an explicit backend-not-connected status instead of implying a successful connection.
- Added a separate `firebase.staging.json` and staging-only Firestore rules candidate. The root `.firebaserc` remains pointed at the existing production project and has not been changed.
- Changed Flutter startup so the preview shell can still render when Firebase placeholders are present; it clearly reports that backend services are not connected instead of treating placeholder configuration as a successful backend connection.

## Firestore security model

The candidate staging rules:
- Require authentication.
- Permit users to access only their own saved-location subcollection.
- Validate coordinate bounds, marker name/category lengths, and private visibility.
- Require server timestamps for create/update.
- Deny all other collections by default.

The rules are not deployed and have not passed Firestore Emulator Suite tests. No Firebase staging project has been provisioned.

## Required external prerequisites

1. Acquire the HERE SDK Flutter package under the appropriate HERE account/license and add it as a reviewed local plugin dependency. The HERE package is not a pub.dev dependency.
2. Create or identify a dedicated non-production Firebase project and verify its project ID.
3. Generate staging-only FlutterFire options; do not replace the production default alias.
4. Run Firestore Emulator Suite tests against the candidate rules.
5. Complete Android Gradle/native project files and iOS Xcode/Podfile/Info.plist files.
6. Add HERE LocationEngine initialization, privacy notice acknowledgement, permission handling, map lifecycle, and current-location display.
7. Build Android and iOS, then perform device-level permission, lifecycle, network, and marker-sync tests.

## CI and verification status

The existing Flutter Firebase workflow was triggered by branch pushes. The latest run for this branch is a GitHub Actions startup failure:
- Run: `42271063069`
- Head SHA: `7a84539be8731687ac01ccde0cb99c19d6ba9abc`
- Conclusion: `startup_failure`
- Jobs returned: none

Earlier branch runs have the same startup failure. No Flutter dependency resolution, analyzer, tests, web build, or Android build can be claimed as executed. This is a CI startup/runner-assignment blocker, not a test result.

The container available for this session has Node.js but no Flutter, Dart, or Firebase CLI, and its GitHub network clone attempt failed because DNS resolution was unavailable. Therefore no local Flutter build or emulator test was run.

## Acceptance gates

| Gate | Status |
|---|---|
| Dependency versions researched | PASS — source references recorded |
| Firestore model/repository source added | PREPARED — compile/test unverified |
| Staging rules candidate | PREPARED — emulator tests not run |
| Firebase staging project | BLOCKED — not provisioned |
| HERE SDK package | BLOCKED — not acquired |
| Android native project | BLOCKED — incomplete Gradle project |
| iOS native project | BLOCKED — project files are stubs |
| HERE map screen and SDK adapter | NOT IMPLEMENTED |
| Android/iOS builds | NOT RUN |
| Independent staging acceptance | NOT RUN |
| Production promotion | BLOCKED |

## Safety

No Firebase production resources, production Worker routes, DNS, production secrets, payments, user data, or production deployments were changed. The HERE credentials must not be committed to Git; mobile-embedded SDK credentials must be treated as extractable and restricted/monitored accordingly.
