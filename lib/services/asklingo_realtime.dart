import 'dart:convert';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:http/http.dart' as http;

import 'asklingo_voice_contract.dart';

class AskLingoRealtime {
  AskLingoRealtime({
    AskLingoVoiceContract? contract,
    this.onEvent,
  }) : contract = contract ?? AskLingoVoiceContract();

  final AskLingoVoiceContract contract;
  final void Function(Map<String, dynamic> event)? onEvent;

  RTCPeerConnection? _peer;
  RTCDataChannel? _events;
  MediaStream? _microphone;

  Future<void> start({String mode = 'chat'}) async {
    await stop();

    final token = await contract.createRealtimeToken(mode: mode);
    final clientSecret = token['client_secret']?.toString();
    if (clientSecret == null || clientSecret.isEmpty) {
      throw StateError('askLINGO realtime client secret was not returned.');
    }

    _peer = await createPeerConnection({
      'sdpSemantics': 'unified-plan',
      'iceServers': <Map<String, dynamic>>[],
    });

    _microphone = await navigator.mediaDevices.getUserMedia({
      'audio': {
        'echoCancellation': true,
        'noiseSuppression': true,
        'autoGainControl': true,
      },
      'video': false,
    });

    for (final track in _microphone!.getAudioTracks()) {
      await _peer!.addTrack(track, _microphone!);
    }

    _peer!.onIceConnectionState = (state) {
      onEvent?.call({'type': 'ice_state', 'state': state.toString()});
    };

    _events = await _peer!.createDataChannel(
      'oai-events',
      RTCDataChannelInit(),
    );

    _events!.onMessage = (message) {
      try {
        final event = jsonDecode(message.text);
        if (event is Map<String, dynamic>) onEvent?.call(event);
      } catch (_) {
        onEvent?.call({'type': 'raw', 'text': message.text});
      }
    };

    final offer = await _peer!.createOffer({
      'offerToReceiveAudio': 1,
      'offerToReceiveVideo': 0,
    });
    await _peer!.setLocalDescription(offer);

    final answer = await http.post(
      Uri.parse('https://api.openai.com/v1/realtime/calls'),
      headers: {
        'Authorization': 'Bearer $clientSecret',
        'Content-Type': 'application/sdp',
      },
      body: offer.sdp ?? '',
    );

    if (answer.statusCode < 200 || answer.statusCode >= 300) {
      throw StateError('Realtime connection failed: HTTP ${answer.statusCode}.');
    }

    await _peer!.setRemoteDescription(
      RTCSessionDescription(answer.body, 'answer'),
    );

    onEvent?.call({'type': 'session_started', 'mode': mode});
  }

  Future<void> stop() async {
    await _events?.close();
    await _peer?.close();
    await _microphone?.dispose();
    _events = null;
    _peer = null;
    _microphone = null;
    onEvent?.call({'type': 'session_stopped'});
  }
}
