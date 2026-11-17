# Wave 2 Flutter startup and identity recovery — issue #537

**Disposition:** Blueprint / implementation hand-off. No human engineer assignment or test execution is implied by this document.

## Repository facts to reconcile first

- Flutter SDK constraint in `pubspec.yaml`: Dart `>=3.0.0 <4.0.0`.
- Existing declared dependencies include Firebase Core 2.x, Firebase Auth 4.x, Shared Preferences 2.x, and Connectivity Plus 5.x.
- `lib/main.dart` currently initializes Firebase before `runApp`.
- `lib/firebase_options.dart` exists. Treat its values as configuration requiring validation; do not invent or replace project identifiers or API configuration.
- At the time this package was prepared, no root `pubspec.lock`, `lib/auth/auth_service.dart`, or `lib/core/bootstrap.dart` was found on the default branch. Re-check before implementation.

## Startup state model

```dart
enum StartupPhase {
  cold,
  initializingFirebase,
  initializingAppCheck,
  restoringSession,
  refreshingIdentity,
  checkingApiAuthorization,
  ready,
  degradedOffline,
  reauthenticationRequired,
  blocked,
}
```

## Required transition behavior

| Stage | Success | Failure |
|---|---|---|
| Firebase initialization | Firebase SDK initialized exactly once | Block protected application startup |
| App Check | Valid attestation token available | Bounded transient retry; protected API calls remain blocked |
| Session restoration | Firebase Auth resolves signed-in or signed-out state | Require reauthentication if session cannot be restored |
| Identity refresh | Firebase SDK supplies a valid refreshed ID token | Reauthenticate; never fabricate tokens |
| API authorization | Protected API accepts the request | Block the protected operation; preserve diagnostic reason |
| Network unavailable | Offline state is detected | Enter degraded-offline mode; no privileged mutation |

## Persistence and security boundaries

- Firebase Auth remains the sole owner of credentials and session restoration.
- Persist only non-sensitive UI preferences and recovery metadata.
- Never place raw ID tokens, refresh tokens, passwords, or private keys in ordinary preferences.
- Logout clears app-owned session metadata and calls Firebase Auth sign-out.
- Keep token expiry, account/session revocation, App Check failure, and API authorization rejection as distinct error classes.
- Retry transient network failures only, with bounded exponential backoff and jitter.
- Do not retry permanent authentication or authorization failures indefinitely.

## Minimum acceptance tests

1. Cold start with no existing session.
2. Valid restored Firebase Auth session.
3. Expired ID token with successful SDK-managed refresh.
4. Revoked or invalid session.
5. App Check unavailable.
6. Offline startup followed by network recovery.
7. Protected API authorization rejection.
8. Repeated startup calls without duplicate Firebase initialization.
9. Logout followed by relaunch.
10. Timeout and retry exhaustion.

## Completion evidence required

- Actual repository diff and dependency compatibility review.
- Formatter and analyzer output.
- Unit/widget tests with named results.
- No secrets or real user credentials in fixtures.
- Human reviewer and verified issue assignee recorded separately.
- No merge or release authorization is implied.
