import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show TargetPlatform, defaultTargetPlatform, kIsWeb;

/// Staging-only Firebase configuration.
///
/// Public Firebase app identifiers are injected at build time with --dart-define.
/// Never place production Firebase identifiers or credentials in this file.
class DefaultFirebaseOptions {
  static const String _projectId = 'lingo-legacy-staging';
  static const String _messagingSenderId = String.fromEnvironment(
    'LINGO_FIREBASE_MESSAGING_SENDER_ID',
  );
  static const String _webApiKey = String.fromEnvironment('LINGO_FIREBASE_WEB_API_KEY');
  static const String _webAppId = String.fromEnvironment('LINGO_FIREBASE_WEB_APP_ID');
  static const String _androidApiKey = String.fromEnvironment('LINGO_FIREBASE_ANDROID_API_KEY');
  static const String _androidAppId = String.fromEnvironment('LINGO_FIREBASE_ANDROID_APP_ID');
  static const String _iosApiKey = String.fromEnvironment('LINGO_FIREBASE_IOS_API_KEY');
  static const String _iosAppId = String.fromEnvironment('LINGO_FIREBASE_IOS_APP_ID');
  static const String _macosApiKey = String.fromEnvironment('LINGO_FIREBASE_MACOS_API_KEY');
  static const String _macosAppId = String.fromEnvironment('LINGO_FIREBASE_MACOS_APP_ID');

  static FirebaseOptions get currentPlatform {
    if (kIsWeb) return web;
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        throw UnsupportedError('Firebase is not configured for Windows.');
      case TargetPlatform.linux:
        throw UnsupportedError('Firebase is not configured for Linux.');
      default:
        throw UnsupportedError('Firebase is not configured for this platform.');
    }
  }

  static FirebaseOptions get web => _requireConfigured(
        FirebaseOptions(
          apiKey: _webApiKey,
          appId: _webAppId,
          messagingSenderId: _messagingSenderId,
          projectId: _projectId,
          authDomain: 'lingo-legacy-staging.firebaseapp.com',
        ),
        'web',
      );

  static FirebaseOptions get android => _requireConfigured(
        FirebaseOptions(
          apiKey: _androidApiKey,
          appId: _androidAppId,
          messagingSenderId: _messagingSenderId,
          projectId: _projectId,
        ),
        'android',
      );

  static FirebaseOptions get ios => _requireConfigured(
        FirebaseOptions(
          apiKey: _iosApiKey,
          appId: _iosAppId,
          messagingSenderId: _messagingSenderId,
          projectId: _projectId,
          iosBundleId: 'com.thelingolegacy.app',
        ),
        'ios',
      );

  static FirebaseOptions get macos => _requireConfigured(
        FirebaseOptions(
          apiKey: _macosApiKey,
          appId: _macosAppId,
          messagingSenderId: _messagingSenderId,
          projectId: _projectId,
        ),
        'macos',
      );

  static FirebaseOptions _requireConfigured(
    FirebaseOptions options,
    String platform,
  ) {
    if (options.apiKey.isEmpty ||
        options.appId.isEmpty ||
        options.messagingSenderId.isEmpty) {
      throw StateError(
        'Firebase $platform configuration is missing. Supply the '
        'LINGO_FIREBASE_${platform.toUpperCase()}_API_KEY, '
        'LINGO_FIREBASE_${platform.toUpperCase()}_APP_ID, and '
        'LINGO_FIREBASE_MESSAGING_SENDER_ID build-time defines for '
        'the lingo-legacy-staging project.',
      );
    }
    return options;
  }
}
