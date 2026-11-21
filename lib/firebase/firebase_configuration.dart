import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;

/// True only when the platform Firebase configuration contains real app values.
/// Placeholder values keep the mobile experience in offline preview mode.
bool hasUsableFirebaseOptions(FirebaseOptions options) {
  bool configured(String value) =>
      value.isNotEmpty && !value.startsWith('YOUR_');

  return configured(options.apiKey) &&
      configured(options.appId) &&
      configured(options.messagingSenderId) &&
      configured(options.projectId);
}
