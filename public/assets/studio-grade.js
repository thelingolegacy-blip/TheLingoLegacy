(() => {
  const doc = document;
  const toast = doc.querySelector('[data-sg-toast]');
  const pads = doc.querySelectorAll('[data-sg-sound]');
  const triggers = doc.querySelectorAll('[data-sg-trigger]');

  const sounds = {
    chime: [392, 523.25, 659.25, 783.99],
    click: [330, 440],
    reward: [523.25, 659.25, 783.99, 1046.5],
    sweep: [220, 330, 440, 550]
  };

  function show(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function playMotif(type = 'chime') {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      show('Audio API unavailable in this browser.');
      return;
    }
    const ctx = new AudioContext();
    const motif = sounds[type] || sounds.chime;
    motif.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type === 'click' ? 'square' : index % 2 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + index * (type === 'click' ? 0.045 : 0.09);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(type === 'click' ? 0.035 : 0.055, start + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.001, start + (type === 'click' ? 0.11 : 0.26));
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + (type === 'click' ? 0.13 : 0.3));
    });
    window.setTimeout(() => ctx.close(), 1000);
    show(`${type.charAt(0).toUpperCase() + type.slice(1)} sound tested.`);
  }

  function burst(label = 'Studio burst') {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      show(`${label}: reduced motion is active.`);
      return;
    }
    for (let i = 0; i < 18; i += 1) {
      const dot = doc.createElement('i');
      dot.style.position = 'fixed';
      dot.style.left = `${42 + Math.random() * 16}%`;
      dot.style.top = `${38 + Math.random() * 18}%`;
      dot.style.zIndex = '8500';
      dot.style.width = '4px';
      dot.style.height = '4px';
      dot.style.borderRadius = '999px';
      dot.style.pointerEvents = 'none';
      dot.style.background = i % 2 ? '#54e8ff' : '#f7ca4c';
      dot.style.boxShadow = '0 0 14px currentColor';
      dot.style.transition = 'transform 900ms ease, opacity 900ms ease';
      doc.body.append(dot);
      requestAnimationFrame(() => {
        dot.style.transform = `translate(${Math.random() * 220 - 110}px, ${Math.random() * -150 - 20}px) scale(0.15)`;
        dot.style.opacity = '0';
      });
      window.setTimeout(() => dot.remove(), 1000);
    }
    show(label);
  }

  pads.forEach((button) => {
    button.addEventListener('click', () => playMotif(button.getAttribute('data-sg-sound') || 'chime'));
  });

  triggers.forEach((button) => {
    button.addEventListener('click', () => {
      const event = button.getAttribute('data-sg-trigger') || 'Studio visual burst';
      burst(event);
      playMotif(event.toLowerCase().includes('reward') ? 'reward' : 'click');
    });
  });
})();
