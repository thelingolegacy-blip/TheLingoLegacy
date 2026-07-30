(() => {
  const doc = document;
  const win = window;
  const reduceMotion = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let audioContext;

  doc.documentElement.classList.add('my-lingo-site');

  function ensureAtmosphere() {
    if (!doc.body || doc.querySelector('[data-mlw-route-bg]')) return;
    const bg = doc.createElement('div');
    bg.className = 'mlw-route-bg';
    bg.dataset.mlwRouteBg = 'true';
    bg.setAttribute('aria-hidden', 'true');
    bg.innerHTML = '<span class="mlw-route-beam"></span><span class="mlw-route-beam"></span><span class="mlw-route-beam"></span><span class="mlw-route-particles"></span><span class="mlw-route-floor"></span>';
    doc.body.prepend(bg);
  }

  function ensureRail() {
    if (!doc.body || doc.querySelector('[data-mlw-studio-rail]')) return;
    const rail = doc.createElement('div');
    rail.className = 'mlw-studio-rail';
    rail.dataset.mlwStudioRail = 'true';
    rail.innerHTML = '<a href="/">Lingo World</a><a href="/thats-my-lingo/">Play</a><button type="button" data-mlw-sound="jackpot">Sound</button>';
    doc.body.append(rail);
  }

  function toast(message) {
    let el = doc.querySelector('[data-mlw-toast]');
    if (!el) {
      el = doc.createElement('div');
      el.className = 'mlw-route-toast';
      el.dataset.mlwToast = 'true';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      doc.body.append(el);
    }
    el.textContent = message;
    el.classList.add('show');
    win.clearTimeout(el._timer);
    el._timer = win.setTimeout(() => el.classList.remove('show'), 1400);
  }

  function context() {
    const AudioContext = win.AudioContext || win.webkitAudioContext;
    if (!AudioContext) return null;
    audioContext ||= new AudioContext();
    if (audioContext.state === 'suspended') audioContext.resume();
    return audioContext;
  }

  function sparkle(x = win.innerWidth / 2, y = win.innerHeight / 2) {
    if (reduceMotion) return;
    for (let i = 0; i < 14; i += 1) {
      const dot = doc.createElement('i');
      dot.className = 'mlw-spark';
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      dot.style.color = i % 3 === 0 ? '#55ecff' : i % 3 === 1 ? '#ffd76a' : '#ff3fd8';
      doc.body.append(dot);
      requestAnimationFrame(() => {
        dot.style.transform = `translate(${Math.random() * 230 - 115}px, ${Math.random() * -170 - 14}px) scale(.14)`;
        dot.style.opacity = '0';
      });
      win.setTimeout(() => dot.remove(), 880);
    }
  }

  function play(event) {
    const ctx = context();
    const notes = [392, 523.25, 659.25, 987.77];
    if (ctx) {
      notes.forEach((frequency, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + index * 0.055;
        osc.type = index % 2 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.04, start + 0.016);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.22);
      });
    }
    toast('My Lingo World studio sound');
    sparkle(event?.clientX, event?.clientY);
  }

  doc.addEventListener('click', (event) => {
    if (event.target.closest('[data-mlw-sound]')) play(event);
  });

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', () => { ensureAtmosphere(); ensureRail(); });
  } else {
    ensureAtmosphere();
    ensureRail();
  }
})();
