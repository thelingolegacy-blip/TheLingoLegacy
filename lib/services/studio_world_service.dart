import 'dart:convert';

import 'package:http/http.dart' as http;

/// Public, read-only representation of one independently branded LINGO world.
class StudioWorld {
  const StudioWorld({
    required this.id,
    required this.entity,
    required this.studio,
    required this.surfaceState,
    required this.route,
    required this.palette,
  });

  final String id;
  final String entity;
  final String studio;
  final String surfaceState;
  final String route;
  final List<String> palette;

  bool get canEnter =>
      (surfaceState == 'preview-present' ||
          surfaceState == 'local-demo' ||
          surfaceState == 'local-prototype') &&
      route.startsWith('/studio-sites/');

  factory StudioWorld.fromJson(Map<String, dynamic> json) {
    final visual = json['visualIdentity'];
    final colors = visual is Map<String, dynamic> ? visual['palette'] : null;
    return StudioWorld(
      id: _requiredString(json, 'id'),
      entity: _requiredString(json, 'entity'),
      studio: _requiredString(json, 'studio'),
      surfaceState: _requiredString(json, 'surfaceState'),
      route: _requiredString(json, 'route'),
      palette: colors is List
          ? colors.whereType<String>().toList(growable: false)
          : const <String>[],
    );
  }

  static String _requiredString(Map<String, dynamic> json, String key) {
    final value = json[key];
    if (value is! String || value.isEmpty) {
      throw FormatException('Studio world is missing $key.');
    }
    return value;
  }
}

/// Reads the public Cloudflare edge registry. No account data or credentials
/// are sent; unavailable registry state is surfaced to the preview UI.
class StudioWorldService {
  StudioWorldService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;
  static const String _baseUrl = String.fromEnvironment(
    'LINGO_API_BASE_URL',
    defaultValue: 'https://thelingolegacy.com',
  );

  Future<List<StudioWorld>> fetchWorlds() async {
    final uri = Uri.parse('$_baseUrl/api/v1/studios/worlds');
    final response = await _client
        .get(uri, headers: const {'accept': 'application/json'})
        .timeout(const Duration(seconds: 8));
    if (response.statusCode != 200) {
      throw StateError('Studio registry returned HTTP ${response.statusCode}.');
    }
    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic> ||
        decoded['ok'] != true ||
        decoded['worlds'] is! List) {
      throw const FormatException('Studio registry response is invalid.');
    }
    return (decoded['worlds'] as List)
        .whereType<Map<String, dynamic>>()
        .map(StudioWorld.fromJson)
        .toList(growable: false);
  }

  void close() => _client.close();
}
