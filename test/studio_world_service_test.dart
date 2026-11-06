import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import '../lib/services/studio_world_service.dart';

void main() {
  test('parses studio worlds and keeps unverified destinations disabled', () async {
    final client = MockClient((request) async {
      expect(request.url.path, '/api/v1/studios/worlds');
      return http.Response(
        jsonEncode({
          'ok': true,
          'count': 2,
          'worlds': [
            {
              'id': 'lingoslots',
              'entity': 'LINGOslots',
              'studio': 'LINGOslots Studio',
              'surfaceState': 'local-demo',
              'route': '/studio-sites/lingoslots/',
              'visualIdentity': {'palette': ['#08090D', '#E9C46A', '#8A5CFF']}
            },
            {
              'id': 'kottons-code',
              'entity': 'Kotton’s Code',
              'studio': 'Kotton’s Code Story Studio',
              'surfaceState': 'planned',
              'route': '/studio-sites/kottons-code/',
              'visualIdentity': {'palette': ['#171026', '#9871FF', '#E6BD58']}
            },
          ],
        }),
        200,
        headers: {'content-type': 'application/json'},
      );
    });
    final service = StudioWorldService(client: client);
    final worlds = await service.fetchWorlds();
    expect(worlds, hasLength(2));
    expect(worlds.first.entity, 'LINGOslots');
    expect(worlds.first.canEnter, isTrue);
    expect(worlds.last.canEnter, isFalse);
    service.close();
  });

  test('fails closed when the edge registry is unavailable', () async {
    final client = MockClient((_) async => http.Response('unavailable', 503));
    final service = StudioWorldService(client: client);
    await expectLater(service.fetchWorlds(), throwsA(isA<StateError>()));
    service.close();
  });
}
