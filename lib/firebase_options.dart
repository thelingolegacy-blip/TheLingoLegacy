import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  /// True only when the configuration for the active platform is complete.
  ///
  /// Unsupported platforms continue to fail closed through [currentPlatform].
  static bool get isConfigured => isConfiguredFor(currentPlatform);

  /// Validates one platform independently; an unconfigured platform must not
  /// disable Firebase for a different platform that has valid options.
  static bool isConfiguredFor(FirebaseOptions options) {
    final apiKey = options.apiKey.trim();
    final appId = options.appId.trim();
    final senderId = options.messagingSenderId.trim();
    final projectId = options.projectId.trim();
    return apiKey.isNotEmpty &&
        appId.isNotEmpty &&
        senderId.isNotEmpty &&
        projectId.isNotEmpty &&
        projectId != 'lingo-staging-not-configured' &&
        projectId != 'lingo-legacy-production' &&
        !apiKey.startsWith('YOUR_') &&
        !appId.startsWith('YOUR_') &&
        !senderId.startsWith('YOUR_') &&
        !projectId.startsWith('YOUR_');
  }

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
        throw UnsupportedError('DefaultFirebaseOptions have not been configured for windows - you can reconfigure this by running the FlutterFire CLI again.');
      case TargetPlatform.linux:
        throw UnsupportedError('DefaultFirebaseOptions have not been configured for linux - you can reconfigure this by running the FlutterFire CLI again.');
      default:
        throw UnsupportedError('DefaultFirebaseOptions are not supported for this platform.');
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'YOUR_WEB_API_KEY',
    appId: 'YOUR_WEB_APP_ID',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    projectId: 'lingo-staging-not-configured',
    authDomain: 'lingo-staging-not-configured.firebaseapp.com',
    databaseURL: 'https://lingo-staging-not-configured-default-rtdb.firebaseio.com',
    storageBucket: 'lingo-staging-not-configured.appspot.com',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'YOUR_ANDROID_API_KEY',
    appId: 'YOUR_ANDROID_APP_ID',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    projectId: 'lingo-staging-not-configured',
    databaseURL: 'https://lingo-staging-not-configured-default-rtdb.firebaseio.com',
    storageBucket: 'lingo-staging-not-configured.appspot.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'YOUR_IOS_API_KEY',
    appId: 'YOUR_IOS_APP_ID',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    projectId: 'lingo-staging-not-configured',
    databaseURL: 'https://lingo-staging-not-configured-default-rtdb.firebaseio.com',
    storageBucket: 'lingo-staging-not-configured.appspot.com',
    iosBundleId: 'com.thelingolegacy.app',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'YOUR_MACOS_API_KEY',
    appId: 'YOUR_MACOS_APP_ID',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    projectId: 'lingo-staging-not-configured',
    databaseURL: 'https://lingo-staging-not-configured-default-rtdb.firebaseio.com',
    storageBucket: 'lingo-staging-not-configured.appspot.com',
  );
}