import 'package:flutter_test/flutter_test.dart';
import 'package:lingo_legacy/firebase_options.dart';

void main() {
  group('Firebase client configuration validation', () {
    test('rejects missing or placeholder values', () {
      expect(
        DefaultFirebaseOptions.hasRequiredValues(
          apiKey: 'YOUR_WEB_API_KEY',
          appId: 'app-id',
          messagingSenderId: 'sender-id',
          projectId: 'project-id',
        ),
        isFalse,
      );
      expect(
        DefaultFirebaseOptions.hasRequiredValues(
          apiKey: '',
          appId: 'app-id',
          messagingSenderId: 'sender-id',
          projectId: 'project-id',
        ),
        isFalse,
      );
    });

    test('accepts complete non-placeholder client configuration', () {
      expect(
        DefaultFirebaseOptions.hasRequiredValues(
          apiKey: 'test-api-key',
          appId: '1:123456789:web:abcdef',
          messagingSenderId: '123456789',
          projectId: 'lingo-legacy-test',
        ),
        isTrue,
      );
    });
  });
}
