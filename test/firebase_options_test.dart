import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart'
    show debugDefaultTargetPlatformOverride, TargetPlatform;
import 'package:flutter_test/flutter_test.dart';
import 'package:lingo_legacy/firebase_options.dart';

FirebaseOptions options({
  String apiKey = 'valid-api-key',
  String appId = 'valid-app-id',
  String messagingSenderId = '123456789',
  String projectId = 'lingo-staging-test',
}) {
  return FirebaseOptions(
    apiKey: apiKey,
    appId: appId,
    messagingSenderId: messagingSenderId,
    projectId: projectId,
  );
}

void main() {
  group('DefaultFirebaseOptions.isConfiguredFor', () {
    test('accepts a complete configuration for one platform', () {
      expect(DefaultFirebaseOptions.isConfiguredFor(options()), isTrue);
    });

    test('rejects a missing API key', () {
      expect(DefaultFirebaseOptions.isConfiguredFor(options(apiKey: '')), isFalse);
    });

    test('rejects API key placeholders', () {
      expect(
        DefaultFirebaseOptions.isConfiguredFor(options(apiKey: 'YOUR_WEB_API_KEY')),
        isFalse,
      );
    });

    test('rejects app ID placeholders', () {
      expect(
        DefaultFirebaseOptions.isConfiguredFor(options(appId: 'YOUR_WEB_APP_ID')),
        isFalse,
      );
    });

    test('rejects messaging sender placeholders', () {
      expect(
        DefaultFirebaseOptions.isConfiguredFor(
          options(messagingSenderId: 'YOUR_MESSAGING_SENDER_ID'),
        ),
        isFalse,
      );
    });

    test('rejects an empty Firebase project ID', () {
      expect(DefaultFirebaseOptions.isConfiguredFor(options(projectId: '')), isFalse);
    });

    test('rejects the production Firebase project in mobile runtime configuration', () {
      expect(
        DefaultFirebaseOptions.isConfiguredFor(
          options(projectId: 'lingo-legacy-production'),
        ),
        isFalse,
      );
    });

    test('rejects the unconfigured staging project placeholder', () {
      expect(
        DefaultFirebaseOptions.isConfiguredFor(
          options(projectId: 'lingo-staging-not-configured'),
        ),
        isFalse,
      );
    });

    test('rejects a project ID placeholder', () {
      expect(
        DefaultFirebaseOptions.isConfiguredFor(options(projectId: 'YOUR_FIREBASE_PROJECT_ID')),
        isFalse,
      );
    });

    test('validates each platform independently', () {
      const configuredWeb = FirebaseOptions(
        apiKey: 'web-key',
        appId: 'web-app',
        messagingSenderId: '123',
        projectId: 'lingo-staging-test',
      );
      const unconfiguredAndroid = FirebaseOptions(
        apiKey: 'YOUR_ANDROID_API_KEY',
        appId: 'YOUR_ANDROID_APP_ID',
        messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
        projectId: 'lingo-staging-test',
      );

      expect(DefaultFirebaseOptions.isConfiguredFor(configuredWeb), isTrue);
      expect(DefaultFirebaseOptions.isConfiguredFor(unconfiguredAndroid), isFalse);
    });
  });

  test('unsupported desktop platforms fail closed', () {
    debugDefaultTargetPlatformOverride = TargetPlatform.linux;
    addTearDown(() => debugDefaultTargetPlatformOverride = null);

    expect(
      () => DefaultFirebaseOptions.isConfigured,
      throwsA(isA<UnsupportedError>()),
    );
  });
}
