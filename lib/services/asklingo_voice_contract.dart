import 'dart:convert';
import 'package:http/http.dart' as http;

class AskLingoVoiceContract {
  AskLingoVoiceContract({this.baseUrl = 'https://thelingolegacy.com'});

  final String baseUrl;

  Future<Map<String, dynamic>> requestResponse({
    required String text,
    String mode = 'chat',
    Map<String, dynamic> context = const {},
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/asklingo/respond'),
      headers: const {'content-type': 'application/json'},
      body: jsonEncode({
        'text': text,
        'mode': mode,
        'context': context,
      }),
    );
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw StateError(body['error']?.toString() ?? 'askLINGO request failed');
    }
    return body;
  }

  Future<Map<String, dynamic>> createRealtimeToken({
    String mode = 'chat',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/asklingo/realtime-token'),
      headers: const {'content-type': 'application/json'},
      body: jsonEncode({'mode': mode}),
    );
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw StateError(body['error']?.toString() ?? 'Realtime token request failed');
    }
    return body;
  }
}
