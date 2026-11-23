import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_test/flutter_test.dart';
import '../lib/firebase/firebase_configuration.dart';

void main() {
  const stagingOptions = FirebaseOptions(
    apiKey: 'test-api-key',
    appId: '1:123456789:web:abcdef',
    messagingSenderId: '123456789',
    projectId: 'lingo-legacy-staging',
  );

  test('placeholder Firebase options do not enable backend initialization', () {
    const options = FirebaseOptions(
      apiKey: 'YOUR_WEB_API_KEY',
      appId: 'YOUR_WEB_APP_ID',
      messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
      projectId: 'YOUR_FIREBASE_PROJECT_ID',
    );

    expect(hasUsableFirebaseOptions(options), isFalse);
  });

  test('staging options are accepted for the default staging target', () {
    expect(hasUsableFirebaseOptions(stagingOptions), isTrue);
  });

  test('production project is rejected by the default staging target', () {
    const productionOptions = FirebaseOptions(
      apiKey: 'test-api-key',
      appId: '1:123456789:web:production',
      messagingSenderId: '123456789',
      projectId: 'lingo-legacy-production',
    );

    expect(hasUsableFirebaseOptions(productionOptions), isFalse);
  });

  test('production requires an explicit production build target', () {
    const productionOptions = FirebaseOptions(
      apiKey: 'test-api-key',
      appId: '1:123456789:web:production',
      messagingSenderId: '123456789',
      projectId: 'lingo-legacy-production',
    );

    expect(
      hasUsableFirebaseOptions(
        productionOptions,
        expectedProjectId: 'lingo-legacy-production',
      ),
      isTrue,
    );
  });

  test('complete options for the wrong environment are rejected', () {
    expect(
      hasUsableFirebaseOptions(
        stagingOptions,
        expectedProjectId: 'loyalty-lane-os',
      ),
      isFalse,
    );
  });
}
