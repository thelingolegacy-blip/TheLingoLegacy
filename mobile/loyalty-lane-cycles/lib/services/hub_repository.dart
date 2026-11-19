import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/hub.dart';

class HubRepository {
  HubRepository({
    http.Client? client,
    this.baseUrl = const String.fromEnvironment(
      'LLC_API_BASE_URL',
      defaultValue: 'https://thelingolegacy.com',
    ),
  }) : _client = client ?? http.Client();

  final http.Client _client;
  final String baseUrl;

  Future<HubDirectory> fetchDirectory() async {
    final uri = Uri.parse('$baseUrl/api/v1/loyalty-lane-cycles/hubs');
    final response = await _client.get(uri, headers: const {'Accept': 'application/json'});
    if (response.statusCode != 200) {
      throw Exception('Hub directory unavailable (${response.statusCode}).');
    }
    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic> || decoded['ok'] != true) {
      throw const FormatException('Hub directory response is invalid.');
    }
    return HubDirectory.fromJson(decoded);
  }

  void dispose() => _client.close();
}
