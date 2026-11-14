# Android release signing setup

The Android release build no longer falls back to the debug signing configuration on this recovery branch.

Provide these values only through a protected GitHub Environment or managed signing service:
- `ANDROID_UPLOAD_KEYSTORE_PATH`
- `ANDROID_UPLOAD_STORE_PASSWORD`
- `ANDROID_UPLOAD_KEY_ALIAS`
- `ANDROID_UPLOAD_KEY_PASSWORD`

The keystore file must be mounted securely at runtime by the signing environment. Never commit the keystore or passwords. Debug builds remain available for CI only. Any release task fails closed when a required value or keystore file is missing.

Before use:
1. The publisher/account owner generates and securely backs up the upload key.
2. Enable Play App Signing in the Google Play Console and register the upload certificate.
3. Add the secrets to a protected signing environment with required reviewers.
4. Run a signed candidate build only after source validation and owner approval.
5. Verify the AAB signature and certificate fingerprint; bind the result to the artifact SHA-256 and release manifest.
6. Preserve key rotation and recovery procedures.
