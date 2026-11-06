import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

/// Safe first-party askLINGO client. The caller supplies a Firebase ID-token
/// provider; OpenAI credentials and the private Worker token never belong here.
class LingoAiClient {
  LingoAiClient({
    required String baseUrl,
    required Future<String?> Function() getIdToken,
    http.Client? httpClient,
    this.timeout = const Duration(seconds: 15),
  })  : _getIdToken = getIdToken,
        _httpClient = httpClient ?? http.Client(),
        _ownsClient = httpClient == null,
        _endpoint = _buildEndpoint(baseUrl);

  final Future<String?> Function() _getIdToken;
  final http.Client _httpClient;
  final bool _ownsClient;
  final Uri _endpoint;
  final Duration timeout;

  Future<Map<String, dynamic>> query({
    required String message,
    String surface = 'ios',
    String locale = 'en-US',
  }) async {
    final normalized = message.trim();
    const surfaces = {'web', 'ios', 'android', 'desktop', 'tv', 'unity', 'unreal'};
    final localePattern = RegExp(r'^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})?$');
    if (normalized.isEmpty || normalized.length > 2000 ||
        !surfaces.contains(surface) || !localePattern.hasMatch(locale)) {
      throw const LingoAiException(400, 'INVALID_REQUEST', 'The askLINGO request is invalid.');
    }

    final token = await _getIdToken();
    if (token == null || token.length < 20) {
      throw const LingoAiException(401, 'AUTHENTICATION_REQUIRED', 'A signed-in Firebase user is required.');
    }

    late final http.Response response;
    try {
      response = await _httpClient
          .post(
            _endpoint,
            headers: {
              'authorization': 'Bearer $token',
              'content-type': 'application/json',
              'accept': 'application/json',
            },
            body: jsonEncode({'message': normalized, 'surface': surface, 'locale': locale}),
          )
          .timeout(timeout);
    } on TimeoutException {
      throw const LingoAiException(0, 'TIMEOUT', 'LINGO AI request timed out.');
    } catch (_) {
      throw const LingoAiException(0, 'NETWORK_UNAVAILABLE', 'LINGO AI service could not be reached.');
    }

    dynamic decoded;
    try {
      decoded = jsonDecode(response.body);
    } catch (_) {
      throw LingoAiException(response.statusCode, 'INVALID_RESPONSE', 'LINGO AI returned an invalid response.');
    }
    if (decoded is! Map<String, dynamic>) {
      throw LingoAiException(response.statusCode, 'INVALID_RESPONSE', 'LINGO AI returned an invalid response.');
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw LingoAiException(
        response.statusCode,
        decoded['code'] is String ? decoded['code'] as String : 'REQUEST_FAILED',
        decoded['message'] is String ? decoded['message'] as String : 'LINGO AI is unavailable.',
      );
    }
    return decoded;
  }

  void close() {
    if (_ownsClient) _httpClient.close();
  }

  static Uri _buildEndpoint(String baseUrl) {
    final uri = Uri.tryParse(baseUrl);
    if (uri == null || !uri.hasAuthority ||
        !(uri.scheme == 'https' || (uri.scheme == 'http' && (uri.host == 'localhost' || uri.host == '127.0.0.1')))) {
      throw ArgumentError('LINGO AI baseUrl must be an HTTPS URL.');
    }
    return uri.replace(path: '/api/v1/ask-lingo/query', query: null, fragment: null);
  }
}

class LingoAiException implements Exception {
  const LingoAiException(this.status, this.code, this.message);

  final int status;
  final String code;
  final String message;

  @override
  String toString() => 'LingoAiException($status, $code): $message';
}
