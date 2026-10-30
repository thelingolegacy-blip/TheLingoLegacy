# Firebase runtime configuration contract

The Flutter source must not contain placeholder API keys or committed project credentials. The canonical Firebase project ID is `lingo-legacy-production`.

## CI input

Provide one GitHub Actions secret named `FIREBASE_OPTIONS_JSON`. Its value is a flat JSON object containing these keys:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_WEB_API_KEY`, `FIREBASE_WEB_APP_ID`
- `FIREBASE_ANDROID_API_KEY`, `FIREBASE_ANDROID_APP_ID`
- `FIREBASE_IOS_API_KEY`, `FIREBASE_IOS_APP_ID`, `FIREBASE_IOS_BUNDLE_ID`
- `FIREBASE_MACOS_API_KEY`, `FIREBASE_MACOS_APP_ID`, `FIREBASE_MACOS_BUNDLE_ID`

Optional web/storage fields:

- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_DATABASE_URL`
- `FIREBASE_STORAGE_BUCKET`

The verifier checks the project identity and required platform fields, then writes a temporary Dart-defines JSON file in the runner's temporary directory. The file is not committed or uploaded as a workflow artifact. The Flutter builds consume it with `--dart-define-from-file`.

## Local development

Use a private local JSON file with the same flat key contract and run Flutter with:

```sh
flutter run --dart-define-from-file=/absolute/path/to/firebase-dart-defines.json
```

Do not put the local file in the repository. Restrict Firebase API keys by application and API in the Firebase/Google Cloud console. These client configuration values are not substitutes for Firebase Security Rules, App Check, authentication, or server-side authorization.

## Failure behavior

If configuration is absent or incomplete, the app starts in an explicit preview-only state. Cloud identity, synchronization, wallet, and other server-backed operations must remain unavailable. A preview startup is not evidence that Firebase is connected.
