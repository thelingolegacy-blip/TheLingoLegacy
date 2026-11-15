import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb;

/// Firebase client configuration is injected at build time with --dart-define.
/// No project credentials or environment-specific identifiers are committed here.
class DefaultFirebaseOptions {
  static const _projectId = String.fromEnvironment('FIREBASE_PROJECT_ID');
  static const _messagingSenderId =
      String.fromEnvironment('FIREBASE_MESSAGING_SENDER_ID');
  static const _authDomain = String.fromEnvironment('FIREBASE_AUTH_DOMAIN');
  static const _databaseUrl = String.fromEnvironment('FIREBASE_DATABASE_URL');
  static const _storageBucket = String.fromEnvironment('FIREBASE_STORAGE_BUCKET');

  static const _webApiKey = String.fromEnvironment('FIREBASE_WEB_API_KEY');
  static const _webAppId = String.fromEnvironment('FIREBASE_WEB_APP_ID');
  static const _androidApiKey =
      String.fromEnvironment('FIREBASE_ANDROID_API_KEY');
  static const _androidAppId =
      String.fromEnvironment('FIREBASE_ANDROID_APP_ID');
  static const _iosApiKey = String.fromEnvironment('FIREBASE_IOS_API_KEY');
  static const _iosAppId = String.fromEnvironment('FIREBASE_IOS_APP_ID');
  static const _macosApiKey =
      String.fromEnvironment('FIREBASE_MACOS_API_KEY');
  static const _macosAppId =
      String.fromEnvironment('FIREBASE_MACOS_APP_ID');
  static const _iosBundleId =
      String.fromEnvironment('FIREBASE_IOS_BUNDLE_ID');
  static const _macosBundleId =
      String.fromEnvironment('FIREBASE_MACOS_BUNDLE_ID');

  static bool get isConfigured {
    if (kIsWeb) {
      return hasRequiredValues(
        apiKey: _webApiKey,
        appId: _webAppId,
        messagingSenderId: _messagingSenderId,
        projectId: _projectId,
      );
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return hasRequiredValues(
          apiKey: _androidApiKey,
          appId: _androidAppId,
          messagingSenderId: _messagingSenderId,
          projectId: _projectId,
        );
      case TargetPlatform.iOS:
        return hasRequiredValues(
          apiKey: _iosApiKey,
          appId: _iosAppId,
          messagingSenderId: _messagingSenderId,
          projectId: _projectId,
          bundleId: _iosBundleId,
        );
      case TargetPlatform.macOS:
        return hasRequiredValues(
          apiKey: _macosApiKey,
          appId: _macosAppId,
          messagingSenderId: _messagingSenderId,
          projectId: _projectId,
          bundleId: _macosBundleId,
        );
      case TargetPlatform.windows:
      case TargetPlatform.linux:
      default:
        return false;
    }
  }

  /// Pure validation helper so placeholder and incomplete configurations can
  /// be regression-tested without contacting Firebase.
  static bool hasRequiredValues({
    required String apiKey,
    required String appId,
    required String messagingSenderId,
    required String projectId,
    String? bundleId,
  }) {
    final values = [apiKey, appId, messagingSenderId, projectId, if (bundleId != null) bundleId];
    return values.every((value) {
      final normalized = value.trim();
      return normalized.isNotEmpty &&
          !normalized.startsWith('YOUR_') &&
          !normalized.contains('<') &&
          !normalized.contains('>');
    });
  }

  static FirebaseOptions get currentPlatform {
    if (!isConfigured) {
      throw UnsupportedError(
        'Firebase client configuration is not supplied for this platform.',
      );
    }
    if (kIsWeb) {
      return FirebaseOptions(
        apiKey: _webApiKey,
        appId: _webAppId,
        messagingSenderId: _messagingSenderId,
        projectId: _projectId,
        authDomain: _authDomain,
        databaseURL: _databaseUrl,
        storageBucket: _storageBucket,
      );
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return FirebaseOptions(
          apiKey: _androidApiKey,
          appId: _androidAppId,
          messagingSenderId: _messagingSenderId,
          projectId: _projectId,
          databaseURL: _databaseUrl,
          storageBucket: _storageBucket,
        );
      case TargetPlatform.iOS:
        return FirebaseOptions(
          apiKey: _iosApiKey,
          appId: _iosAppId,
          messagingSenderId: _messagingSenderId,
          projectId: _projectId,
          databaseURL: _databaseUrl,
          storageBucket: _storageBucket,
          iosBundleId: _iosBundleId,
        );
      case TargetPlatform.macOS:
        return FirebaseOptions(
          apiKey: _macosApiKey,
          appId: _macosAppId,
          messagingSenderId: _messagingSenderId,
          projectId: _projectId,
          databaseURL: _databaseUrl,
          storageBucket: _storageBucket,
          macOsBundleId: _macosBundleId,
        );
      case TargetPlatform.windows:
      case TargetPlatform.linux:
      default:
        throw UnsupportedError(
          'Firebase client configuration is not defined for this platform.',
        );
    }
  }
}
