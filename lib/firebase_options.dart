import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb;

/// Runtime configuration is injected at build time with --dart-define.
/// Firebase web/mobile API keys identify the client app; authorization must
/// still be enforced by Firebase Rules and backend authorization.
class DefaultFirebaseOptions {
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
        throw UnsupportedError(
          'Firebase options for this desktop target have not been configured.',
        );
      default:
        throw UnsupportedError('Firebase options are not supported for this platform.');
    }
  }

  static const String projectId = String.fromEnvironment(
    'FIREBASE_PROJECT_ID',
    defaultValue: 'lingo-legacy-production',
  );
  static const String senderId = String.fromEnvironment(
    'FIREBASE_MESSAGING_SENDER_ID',
    defaultValue: 'YOUR_MESSAGING_SENDER_ID',
  );
  static const String databaseUrl = String.fromEnvironment(
    'FIREBASE_DATABASE_URL',
    defaultValue: 'https://lingo-legacy-production-default-rtdb.firebaseio.com',
  );
  static const String storageBucket = String.fromEnvironment(
    'FIREBASE_STORAGE_BUCKET',
    defaultValue: 'lingo-legacy-production.appspot.com',
  );

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: String.fromEnvironment('FIREBASE_WEB_API_KEY', defaultValue: 'YOUR_WEB_API_KEY'),
    appId: String.fromEnvironment('FIREBASE_WEB_APP_ID', defaultValue: 'YOUR_WEB_APP_ID'),
    messagingSenderId: senderId,
    projectId: projectId,
    authDomain: String.fromEnvironment(
      'FIREBASE_AUTH_DOMAIN',
      defaultValue: 'lingo-legacy-production.firebaseapp.com',
    ),
    databaseURL: databaseUrl,
    storageBucket: storageBucket,
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: String.fromEnvironment('FIREBASE_ANDROID_API_KEY', defaultValue: 'YOUR_ANDROID_API_KEY'),
    appId: String.fromEnvironment('FIREBASE_ANDROID_APP_ID', defaultValue: 'YOUR_ANDROID_APP_ID'),
    messagingSenderId: senderId,
    projectId: projectId,
    databaseURL: databaseUrl,
    storageBucket: storageBucket,
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: String.fromEnvironment('FIREBASE_IOS_API_KEY', defaultValue: 'YOUR_IOS_API_KEY'),
    appId: String.fromEnvironment('FIREBASE_IOS_APP_ID', defaultValue: 'YOUR_IOS_APP_ID'),
    messagingSenderId: senderId,
    projectId: projectId,
    databaseURL: databaseUrl,
    storageBucket: storageBucket,
    iosBundleId: 'com.thelingolegacy.app',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: String.fromEnvironment('FIREBASE_MACOS_API_KEY', defaultValue: 'YOUR_MACOS_API_KEY'),
    appId: String.fromEnvironment('FIREBASE_MACOS_APP_ID', defaultValue: 'YOUR_MACOS_APP_ID'),
    messagingSenderId: senderId,
    projectId: projectId,
    databaseURL: databaseUrl,
    storageBucket: storageBucket,
    macOsBundleId: 'com.thelingolegacy.app',
  );
}
