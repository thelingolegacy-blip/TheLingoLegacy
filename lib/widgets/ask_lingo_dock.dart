import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

const _askCrimson = Color(0xFFEF334B);
const _askSmoke = Color(0xFF25272D);

/// Universal L-shaped askLINGO launcher and conversational panel.
class AskLingoDock extends StatelessWidget {
  const AskLingoDock({super.key});

  @override
  Widget build(BuildContext context) => Semantics(
        label: 'Open askLINGO assistant',
        button: true,
        child: GestureDetector(
          onTap: () => showModalBottomSheet<void>(
            context: context,
            isScrollControlled: true,
            useSafeArea: true,
            backgroundColor: Colors.transparent,
            builder: (_) => const AskLingoPanel(),
          ),
          child: Container(
            width: 58,
            height: 58,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: _askCrimson, width: 1.4),
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [_askSmoke, Color(0xFF0C0D10)],
              ),
              boxShadow: const [
                BoxShadow(color: Color(0x55EF334B), blurRadius: 22, spreadRadius: 1),
                BoxShadow(color: Colors.black54, blurRadius: 14, offset: Offset(0, 7)),
              ],
            ),
            child: CustomPaint(
              painter: _LMarkPainter(),
              child: const Center(
                child: Padding(
                  padding: EdgeInsets.only(top: 46),
                  child: Text('ASK', style: TextStyle(fontSize: 7, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
                ),
              ),
            ),
          ),
        ),
      );
}

class _LMarkPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.square
      ..style = PaintingStyle.stroke;
    final path = Path()
      ..moveTo(size.width * .36, size.height * .17)
      ..lineTo(size.width * .36, size.height * .68)
      ..lineTo(size.width * .72, size.height * .68);
    canvas.drawPath(path, paint);
    final accent = Paint()
      ..color = _askCrimson
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.square
      ..style = PaintingStyle.stroke;
    canvas.drawPath(path, accent);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class AskLingoPanel extends StatefulWidget {
  const AskLingoPanel({super.key});

  @override
  State<AskLingoPanel> createState() => _AskLingoPanelState();
}

class _AskLingoPanelState extends State<AskLingoPanel> {
  static const _endpoint = String.fromEnvironment(
    'LINGO_API_BASE_URL',
    defaultValue: 'https://thelingolegacy.com',
  );

  final _input = TextEditingController();
  final _scroll = ScrollController();
  final _client = http.Client();
  final List<_AskMessage> _messages = [
    const _AskMessage(
      'I’m askLINGO. I can guide you through the LINGO studios, products, and platform status. What are you looking for?',
      false,
    ),
  ];
  bool _busy = false;
  String _status = '';

  @override
  void dispose() {
    _input.dispose();
    _scroll.dispose();
    _client.close();
    super.dispose();
  }

  Future<void> _send() async {
    final message = _input.text.trim();
    if (message.isEmpty || _busy) return;
    setState(() {
      _messages.add(_AskMessage(message, true));
      _input.clear();
      _busy = true;
      _status = 'askLINGO is thinking…';
    });
    _jumpToLatest();
    try {
      final response = await _client
          .post(
            Uri.parse('$_endpoint/api/v1/asklingo/chat'),
            headers: const {'content-type': 'application/json', 'accept': 'application/json'},
            body: jsonEncode({'message': message}),
          )
          .timeout(const Duration(seconds: 15));
      final decoded = jsonDecode(response.body);
      if (response.statusCode != 200 || decoded is! Map<String, dynamic> || decoded['ok'] != true) {
        final error = decoded is Map<String, dynamic> ? decoded['error'] : null;
        throw StateError(error is String ? error : 'Assistant service is unavailable.');
      }
      final reply = decoded['reply'];
      if (reply is! String || reply.isEmpty) throw const FormatException('Assistant response was empty.');
      if (!mounted) return;
      setState(() {
        _messages.add(_AskMessage(reply, false));
        _status = decoded['mode'] == 'ai-enabled' ? 'AI assistant' : 'Guided assistant';
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _messages.add(_AskMessage('I could not reach the assistant service. Please try again shortly.', false));
        _status = 'Connection unavailable';
      });
    } finally {
      if (mounted) {
        setState(() => _busy = false);
        _jumpToLatest();
      }
    }
  }

  void _jumpToLatest() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(
          _scroll.position.maxScrollExtent,
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;
    return AnimatedPadding(
      duration: const Duration(milliseconds: 180),
      padding: EdgeInsets.only(bottom: bottomInset),
      child: Container(
        height: MediaQuery.sizeOf(context).height * .78,
        decoration: const BoxDecoration(
          color: Color(0xFF15171C),
          borderRadius: BorderRadius.vertical(top: Radius.circular(26)),
          border: Border(top: BorderSide(color: _askCrimson, width: 1.3)),
        ),
        child: Column(children: [
          Container(
            padding: const EdgeInsets.fromLTRB(18, 16, 12, 14),
            decoration: const BoxDecoration(
              gradient: LinearGradient(colors: [Color(0xFF631B29), _askSmoke]),
              borderRadius: BorderRadius.vertical(top: Radius.circular(26)),
            ),
            child: Row(children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  border: Border.all(color: _askCrimson),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Center(child: Text('L', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900))),
              ),
              const SizedBox(width: 12),
              const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('askLINGO', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.1)),
                SizedBox(height: 3),
                Text('THE LINGO LEGACY · UNIVERSAL GUIDE', style: TextStyle(fontSize: 9, color: Color(0xFFD4D4D8), letterSpacing: .8)),
              ])),
              IconButton(
                tooltip: 'Close assistant',
                onPressed: () => Navigator.of(context).pop(),
                icon: const Icon(Icons.close),
              ),
            ]),
          ),
          Expanded(
            child: ListView.builder(
              controller: _scroll,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return Align(
                  alignment: message.isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    constraints: BoxConstraints(maxWidth: MediaQuery.sizeOf(context).width * .82),
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(13),
                    decoration: BoxDecoration(
                      color: message.isUser ? const Color(0xFF54202A) : const Color(0xFF292C32),
                      borderRadius: BorderRadius.circular(15),
                      border: Border.all(color: message.isUser ? _askCrimson.withValues(alpha: .6) : Colors.white12),
                    ),
                    child: Text(message.text, style: const TextStyle(height: 1.45, fontSize: 13)),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 6, 12, 4),
            child: Text(_status, style: const TextStyle(color: Color(0xFFB6B8BF), fontSize: 10)),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 4, 12, 8),
            child: Row(children: [
              Expanded(
                child: TextField(
                  controller: _input,
                  minLines: 1,
                  maxLines: 4,
                  maxLength: 1200,
                  decoration: InputDecoration(
                    counterText: '',
                    hintText: 'Ask about any LINGO world…',
                    filled: true,
                    fillColor: const Color(0xFF22252B),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFF50535B))),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFF50535B))),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: _askCrimson, width: 1.5)),
                  ),
                  onSubmitted: (_) => _send(),
                ),
              ),
              const SizedBox(width: 8),
              IconButton.filled(
                onPressed: _busy ? null : _send,
                style: IconButton.styleFrom(backgroundColor: const Color(0xFF8D2032), foregroundColor: Colors.white),
                icon: _busy
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.arrow_upward),
                tooltip: 'Send message',
              ),
            ]),
          ),
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Text(
              'Do not share passwords, payment details, private account data, or API keys. Replies do not confirm account actions or production activation.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF92959D), fontSize: 9, height: 1.4),
            ),
          ),
        ]),
      ),
    );
  }
}

class _AskMessage {
  const _AskMessage(this.text, this.isUser);
  final String text;
  final bool isUser;
}
