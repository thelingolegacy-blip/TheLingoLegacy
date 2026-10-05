(() => {
  const MODES = '/ai/asklingo-modes.json';
  let modeConfig = null;
  let peer = null;
  let dataChannel = null;
  let localStream = null;
  let audio = null;

  async function loadModes() {
    if (!modeConfig) modeConfig = await fetch(MODES, { cache: 'no-store' }).then(r => r.json());
    return modeConfig;
  }

  function emit(name, detail = {}) {
    window.dispatchEvent(new CustomEvent('asklingo:' + name, { detail }));
  }

  async function startVoice(mode = 'chat') {
    const config = await loadModes();
    const selected = config.modes[mode] || config.modes.chat;
    if (!window.RTCPeerConnection || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('Realtime voice is not supported by this browser/runtime.');
    }

    const tokenResponse = await fetch(config.voice.tokenEndpoint, {
      method: 'POST',
      headers: {'content-type':'application/json'},
      body: JSON.stringify({ mode })
    });
    const token = await tokenResponse.json();
    if (!tokenResponse.ok || !token.client_secret) throw new Error(token.error || 'Voice session could not be created.');

    peer = new RTCPeerConnection();
    audio = document.createElement('audio');
    audio.autoplay = true;
    audio.setAttribute('aria-label', 'askLINGO voice response');
    audio.hidden = true;
    document.body.appendChild(audio);

    peer.ontrack = event => { audio.srcObject = event.streams[0]; };
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream.getTracks().forEach(track => peer.addTrack(track, localStream));

    dataChannel = peer.createDataChannel('oai-events');
    dataChannel.onopen = () => {
      // Mode policy is selected and signed by the server-issued session.
      // The client never sends authoritative instructions to the realtime session.
      emit('ready', { mode });
    };
    dataChannel.onmessage = event => {
      try { emit('event', JSON.parse(event.data)); } catch { emit('event', { raw: event.data }); }
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const sdp = await new Promise(resolve => {
      if (peer.iceGatheringState === 'complete') return resolve(peer.localDescription.sdp);
      const timer = setTimeout(() => resolve(peer.localDescription.sdp), 1500);
      peer.onicegatheringstatechange = () => {
        if (peer.iceGatheringState === 'complete') { clearTimeout(timer); resolve(peer.localDescription.sdp); }
      };
    });

    const answer = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token.client_secret,
        'Content-Type': 'application/sdp'
      },
      body: sdp
    });
    if (!answer.ok) throw new Error('Realtime voice connection failed.');
    await peer.setRemoteDescription({ type: 'answer', sdp: await answer.text() });
    emit('started', { mode });
  }

  async function stopVoice() {
    if (dataChannel) dataChannel.close();
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    if (peer) peer.close();
    if (audio) audio.remove();
    dataChannel = null; localStream = null; peer = null; audio = null;
    emit('stopped');
  }

  async function respond(text, mode = 'chat', context = {}) {
    const config = await loadModes();
    const response = await fetch(config.responseEndpoint, {
      method: 'POST',
      headers: {'content-type':'application/json'},
      body: JSON.stringify({ text, mode, context })
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'askLINGO response failed.');
    emit('response', body);
    return body;
  }

  window.askLINGO = Object.freeze({ loadModes, startVoice, stopVoice, respond });
})();
