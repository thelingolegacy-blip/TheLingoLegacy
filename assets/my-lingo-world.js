(() => {
  const win = window;
  const doc = document;
  const reduceMotion = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let audioContext;

  const soundMap = {
    tap: { label: 'Gold tap', notes: [329.63, 493.88], type: 'triangle', gain: 0.028 },
    rise: { label: 'Studio rise', notes: [220, 329.63, 440, 659.25], type: 'sine', gain: 0.035 },
    jackpot: { label: 'Jackpot spark', notes: [392, 523.25, 659.25, 783.99, 1046.5], type: 'triangle', gain: 0.045 },
    outro: { label: 'Soft outro', notes: [659.25, 493.88, 329.63], type: 'sine', gain: 0.024 }
  };

  function getAudioContext() {
    const AudioContext = win.AudioContext || win.webkitAudioContext;
    if (!AudioContext) return null;
    if (!audioContext) audioContext = new AudioContext();
    if (audioContext.state === 'suspended') audioContext.resume();
    return audioContext;
  }

  function toast(message) {
    let el = doc.querySelector('[data-sound-toast]');
    if (!el) {
      el = doc.createElement('div');
      el.className = 'sound-toast';
      el.dataset.soundToast = 'true';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      doc.body.append(el);
    }
    el.textContent = message;
    el.classList.add('show');
    win.clearTimeout(el._timer);
    el._timer = win.setTimeout(() => el.classList.remove('show'), 1500);
  }

  function sparks(x = win.innerWidth / 2, y = win.innerHeight / 2) {
    if (reduceMotion) return;
    for (let index = 0; index < 18; index += 1) {
      const spark = doc.createElement('i');
      spark.className = 'spark';
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.color = index % 3 === 0 ? '#55ecff' : index % 3 === 1 ? '#ffd76a' : '#ff3fd8';
      spark.style.background = 'currentColor';
      doc.body.append(spark);
      requestAnimationFrame(() => {
        spark.style.transform = `translate(${Math.random() * 260 - 130}px, ${Math.random() * -190 - 18}px) scale(.12)`;
        spark.style.opacity = '0';
      });
      win.setTimeout(() => spark.remove(), 900);
    }
  }

  function playSound(kind, event) {
    const sound = soundMap[kind] || soundMap.tap;
    const ctx = getAudioContext();
    if (ctx) {
      sound.notes.forEach((frequency, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + index * 0.055;
        osc.type = sound.type;
        osc.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(sound.gain, start + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.24);
      });
    }
    toast(`${sound.label} sound triggered`);
    sparks(event?.clientX, event?.clientY);
  }

  doc.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-sound]');
    if (!trigger) return;
    playSound(trigger.dataset.sound, event);
  });

  doc.addEventListener('pointermove', (event) => {
    if (reduceMotion) return;
    doc.documentElement.style.setProperty('--cursor-x', `${event.clientX}px`);
    doc.documentElement.style.setProperty('--cursor-y', `${event.clientY}px`);
  }, { passive: true });
})();
