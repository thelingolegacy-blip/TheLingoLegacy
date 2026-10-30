import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb;

/// Firebase client options are injected at build/run time. No project API keys
/// or placeholder values are committed to this repository.
class DefaultFirebaseOptions {
  static String _required(String name, String value) {
    final normalized = value.trim();
    if (normalized.isEmpty || normalized.startsWith('YOUR_')) {
      throw StateError('Missing Firebase compile-time configuration: $name');
    }
    return normalized;
  }

  static String? _optional(String value) {
    final normalized = value.trim();
    return normalized.isEmpty ? null : normalized;
  }

  static String get _projectId {
    final value = _required(
      'FIREBASE_PROJECT_ID',
      const String.fromEnvironment('FIREBASE_PROJECT_ID'),
    );
    if (value != 'lingo-legacy-production') {
      throw StateError('Firebase project ID does not match the canonical project.');
    }
    return value;
  }

  static String get _messagingSenderId => _required(
        'FIREBASE_MESSAGING_SENDER_ID',
        const String.fromEnvironment('FIREBASE_MESSAGING_SENDER_ID'),
      );

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
      case TargetPlatform.linux:
      case TargetPlatform.fuchsia:
        throw UnsupportedError('Firebase is not configured for this platform.');
    }
  }

  static FirebaseOptions get web => FirebaseOptions(
        apiKey: _required('FIREBASE_WEB_API_KEY', const String.fromEnvironment('FIREBASE_WEB_API_KEY')),
        appId: _required('FIREBASE_WEB_APP_ID', const String.fromEnvironment('FIREBASE_WEB_APP_ID')),
        messagingSenderId: _messagingSenderId,
        projectId: _projectId,
        authDomain: _optional(const String.fromEnvironment('FIREBASE_AUTH_DOMAIN')),
        databaseURL: _optional(const String.fromEnvironment('FIREBASE_DATABASE_URL')),
        storageBucket: _optional(const String.fromEnvironment('FIREBASE_STORAGE_BUCKET')),
      );

  static FirebaseOptions get android => FirebaseOptions(
        apiKey: _required('FIREBASE_ANDROID_API_KEY', const String.fromEnvironment('FIREBASE_ANDROID_API_KEY')),
        appId: _required('FIREBASE_ANDROID_APP_ID', const String.fromEnvironment('FIREBASE_ANDROID_APP_ID')),
        messagingSenderId: _messagingSenderId,
        projectId: _projectId,
        databaseURL: _optional(const String.fromEnvironment('FIREBASE_DATABASE_URL')),
        storageBucket: _optional(const String.fromEnvironment('FIREBASE_STORAGE_BUCKET')),
      );

  static FirebaseOptions get ios => FirebaseOptions(
        apiKey: _required('FIREBASE_IOS_API_KEY', const String.fromEnvironment('FIREBASE_IOS_API_KEY')),
        appId: _required('FIREBASE_IOS_APP_ID', const String.fromEnvironment('FIREBASE_IOS_APP_ID')),
        messagingSenderId: _messagingSenderId,
        projectId: _projectId,
        databaseURL: _optional(const String.fromEnvironment('FIREBASE_DATABASE_URL')),
        storageBucket: _optional(const String.fromEnvironment('FIREBASE_STORAGE_BUCKET')),
        iosBundleId: _required('FIREBASE_IOS_BUNDLE_ID', const String.fromEnvironment('FIREBASE_IOS_BUNDLE_ID')),
      );

  static FirebaseOptions get macos => FirebaseOptions(
        apiKey: _required('FIREBASE_MACOS_API_KEY', const String.fromEnvironment('FIREBASE_MACOS_API_KEY')),
        appId: _required('FIREBASE_MACOS_APP_ID', const String.fromEnvironment('FIREBASE_MACOS_APP_ID')),
        messagingSenderId: _messagingSenderId,
        projectId: _projectId,
        databaseURL: _optional(const String.fromEnvironment('FIREBASE_DATABASE_URL')),
        storageBucket: _optional(const String.fromEnvironment('FIREBASE_STORAGE_BUCKET')),
        macOsBundleId: _required('FIREBASE_MACOS_BUNDLE_ID', const String.fromEnvironment('FIREBASE_MACOS_BUNDLE_ID')),
      );
}
