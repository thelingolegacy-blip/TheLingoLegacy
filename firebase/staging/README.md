# Firebase staging candidate

This directory contains **staging-only candidate rules** for the LINGO Location release.

## Safety boundary

- The repository's default `.firebaserc` still names the production project. Do not run a Firebase deploy command without an explicit, verified staging project ID.
- This config is separate from the root `firebase.json`; it does not change the default Hosting deployment.
- No Firebase project has been provisioned or connected by this change.
- These rules are not deployed and have not yet passed Emulator Suite tests.
- The first location release stores only user-owned saved pins. Public sharing, live-location feeds, background tracking, and location history are excluded.

## Intended data path

`users/{uid}/saved_locations/{markerId}`

Only the authenticated owner may read, create, update, or delete saved pins. The rules validate coordinate ranges, name/category lengths, private visibility, and server timestamps. All other collections are denied by default.

## Required next steps

1. Create or identify a dedicated non-production Firebase project and verify its project ID in the Firebase Console.
2. Use the explicit staging project ID for FlutterFire configuration; do not change the repository's default production project selection.
3. Run Firestore Emulator Suite rule tests for unauthenticated access, cross-user reads/writes, valid marker creation/update/delete, invalid coordinates, invalid field types, and timestamp tampering.
4. Record the emulator version, test command, results, and commit SHA.
5. Only after independent acceptance, deploy these rules to the staging project using the separate `firebase.staging.json` config.
6. Keep production rules and project configuration untouched until a separately authorized production release.

Example emulator command after a staging project ID is verified:

```bash
firebase --config firebase.staging.json --project <VERIFIED_STAGING_PROJECT_ID> emulators:start --only auth,firestore
```

Do not replace the placeholder with the production project ID.
