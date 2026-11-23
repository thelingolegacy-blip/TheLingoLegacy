import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_test/flutter_test.dart';
import '../lib/firebase/firebase_configuration.dart';

void main() {
  test('placeholder Firebase options do not enable backend initialization', () {
    const options = FirebaseOptions(
      apiKey: 'YOUR_WEB_API_KEY',
      appId: 'YOUR_WEB_APP_ID',
      messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
      projectId: 'YOUR_FIREBASE_PROJECT_ID',
    );

    expect(hasUsableFirebaseOptions(options), isFalse);
  });

  test('complete Firebase options are recognized as configured', () {
    const options = FirebaseOptions(
      apiKey: 'test-api-key',
      appId: '1:123456789:web:abcdef',
      messagingSenderId: '123456789',
      projectId: 'lingo-legacy-staging',
    );

    expect(hasUsableFirebaseOptions(options), isTrue);
  });
}
