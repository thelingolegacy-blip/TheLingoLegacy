import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;

/// The default target is staging. Production builds must opt in explicitly
/// with --dart-define=FIREBASE_PROJECT_ID=lingo-legacy-production.
const expectedFirebaseProjectId = String.fromEnvironment(
  'FIREBASE_PROJECT_ID',
  defaultValue: 'lingo-legacy-staging',
);

/// True only when options are complete and match the selected environment.
/// A mismatched project remains in offline preview instead of connecting.
bool hasUsableFirebaseOptions(
  FirebaseOptions options, {
  String expectedProjectId = expectedFirebaseProjectId,
}) {
  bool configured(String value) =>
      value.isNotEmpty && !value.startsWith('YOUR_');

  return configured(options.apiKey) &&
      configured(options.appId) &&
      configured(options.messagingSenderId) &&
      configured(options.projectId) &&
      options.projectId == expectedProjectId;
}
