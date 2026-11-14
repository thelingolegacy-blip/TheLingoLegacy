# Publisher enrollment and release setup

## Apple Developer / App Store Connect
Account owner must enroll the legal entity or individual, accept current agreements, complete identity/tax/banking steps, create the app record, confirm the unique bundle ID and app SKU, assign least-privilege App Store Connect roles, and create an API key with only the required app-management permissions. Store the private API key in a protected secret manager. Never commit certificates, profiles, API private keys, or passwords.

For iOS distribution, generate a real Xcode project, verify team ownership and bundle identifier, create the Apple Distribution certificate and App Store provisioning profile, configure signing in the protected `apple-signing` environment, archive on macOS, verify the IPA/archive, and retain the artifact digest and signing provenance. TestFlight submission and App Store review remain separate steps.

## Google Play Console
Account owner must create/verify the Play developer account, accept current agreements, complete identity/tax/payout details, create the app record, verify package name uniqueness, configure app access and testers, enable Play App Signing, and register the upload certificate. Store the upload keystore and passwords only in the protected `android-signing` GitHub Environment or a managed signing service.

The repository includes `.github/workflows/lingo-android-protected-signing.yml`. Before running it:
1. Create GitHub Environment `android-signing`.
2. Require at least one independent reviewer for that environment.
3. Add `ANDROID_UPLOAD_KEYSTORE_BASE64`, `ANDROID_UPLOAD_STORE_PASSWORD`, `ANDROID_UPLOAD_KEY_ALIAS`, and `ANDROID_UPLOAD_KEY_PASSWORD` as environment secrets.
4. Confirm the exact commit and run the workflow manually with `confirm_signing=true`.
5. Verify the signed AAB, SHA-256 digest and upload-certificate fingerprint.
6. Upload to an internal testing track manually or through a separately reviewed publisher workflow; record the Play Console submission ID and review result.

## Other game / TV publishers
Amazon, Samsung, LG, Roku, PlayStation, Xbox and Nintendo each require separate publisher enrollment, product rights, platform SDK access, technical certification, and package/signing rules. Do not reuse a mobile app ID or signing key across platform identities unless the publisher explicitly permits it.

## Required evidence
For every target platform record: publisher account ID, app listing ID, bundle/package/channel ID, SDK version, signed artifact digest, certificate fingerprint, SBOM, QA results, privacy/content declarations, screenshots, support/legal URLs, submission receipt, review outcome, internal acceptance and rollback plan.

No account, secret, signed artifact, submission receipt, publisher approval, or internal certification is represented as complete by this setup guide.
