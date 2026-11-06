import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:lingo_legacy/services/lingo_ai_client.dart';

void main() {
  test('sends Firebase bearer token and maps disabled response', () async {
    late http.Request captured;
    final client = LingoAiClient(
      baseUrl: 'https://thelingolegacy.com',
      getIdToken: () async => 'firebase-id-token-placeholder',
      httpClient: MockClient((request) async {
        captured = request;
        return http.Response(
          jsonEncode({'ok': false, 'code': 'ASKLINGO_DISABLED', 'message': 'No AI request was sent.'}),
          423,
          headers: {'content-type': 'application/json'},
        );
      }),
    );
    expect(
      () => client.query(message: 'hello', surface: 'ios'),
      throwsA(isA<LingoAiException>().having((e) => e.code, 'code', 'ASKLINGO_DISABLED')),
    );
    await Future<void>.delayed(Duration.zero);
    expect(captured.headers['authorization'], 'Bearer firebase-id-token-placeholder');
    expect(captured.url.path, '/api/v1/ask-lingo/query');
    expect(jsonDecode(captured.body), {'message': 'hello', 'surface': 'ios', 'locale': 'en-US'});
  });

  test('rejects missing identity before network request', () async {
    var requested = false;
    final client = LingoAiClient(
      baseUrl: 'https://thelingolegacy.com',
      getIdToken: () async => null,
      httpClient: MockClient((request) async { requested = true; return http.Response('{}', 200); }),
    );
    await expectLater(
      client.query(message: 'hello'),
      throwsA(isA<LingoAiException>().having((e) => e.code, 'code', 'AUTHENTICATION_REQUIRED')),
    );
    expect(requested, isFalse);
  });

  test('rejects invalid message locally', () async {
    final client = LingoAiClient(
      baseUrl: 'https://thelingolegacy.com',
      getIdToken: () async => 'firebase-id-token-placeholder',
      httpClient: MockClient((request) async => http.Response('{}', 200)),
    );
    await expectLater(
      client.query(message: ' '),
      throwsA(isA<LingoAiException>().having((e) => e.code, 'code', 'INVALID_REQUEST')),
    );
  });
}
