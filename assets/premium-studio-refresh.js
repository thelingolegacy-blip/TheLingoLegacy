(() => {
  const doc = document;
  const win = window;
  const reduceMotion = win.matchMedia('(prefers-reduced-motion: reduce)').matches;

  doc.documentElement.classList.add('premium-studio-refresh');

  function ensureAurora() {
    if (doc.querySelector('.premium-studio-aurora')) return;
    const aurora = doc.createElement('div');
    aurora.className = 'premium-studio-aurora';
    aurora.setAttribute('aria-hidden', 'true');
    aurora.innerHTML = '<i></i><i></i><i></i>';
    doc.body.prepend(aurora);
  }

  function toast(message) {
    let el = doc.querySelector('[data-premium-studio-toast]');
    if (!el) {
      el = doc.createElement('div');
      el.className = 'premium-studio-toast';
      el.setAttribute('data-premium-studio-toast', '');
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      doc.body.append(el);
    }
    el.textContent = message;
    el.classList.add('show');
    win.clearTimeout(el._premiumTimer);
    el._premiumTimer = win.setTimeout(() => el.classList.remove('show'), 1800);
  }

  function playTone(kind = 'tap') {
    const AudioContext = win.AudioContext || win.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const motifs = {
      tap: [261.63, 392.0],
      lift: [329.63, 493.88, 659.25],
      reward: [392.0, 523.25, 659.25, 987.77]
    };
    (motifs[kind] || motifs.tap).forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = index % 2 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + index * 0.055;
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(kind === 'reward' ? 0.055 : 0.032, start + 0.014);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.2);
    });
    win.setTimeout(() => ctx.close(), 700);
  }

  function ripple(x, y) {
    if (reduceMotion) return;
    const dot = doc.createElement('i');
    dot.className = 'premium-studio-ripple';
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    doc.body.append(dot);
    win.setTimeout(() => dot.remove(), 760);
  }

  function burst(label = 'Premium studio motion') {
    if (reduceMotion) {
      toast(`${label}: reduced motion active`);
      return;
    }
    for (let i = 0; i < 16; i += 1) {
      const spark = doc.createElement('i');
      spark.style.position = 'fixed';
      spark.style.left = `${42 + Math.random() * 16}%`;
      spark.style.top = `${36 + Math.random() * 18}%`;
      spark.style.zIndex = '9997';
      spark.style.width = '5px';
      spark.style.height = '5px';
      spark.style.borderRadius = '999px';
      spark.style.pointerEvents = 'none';
      spark.style.background = i % 3 === 0 ? '#62efff' : i % 3 === 1 ? '#ffd86b' : '#ff4fd8';
      spark.style.boxShadow = '0 0 18px currentColor';
      spark.style.transition = 'transform 860ms cubic-bezier(.2,.7,.2,1), opacity 860ms ease';
      doc.body.append(spark);
      requestAnimationFrame(() => {
        spark.style.transform = `translate(${Math.random() * 260 - 130}px, ${Math.random() * -170 - 16}px) scale(.12)`;
        spark.style.opacity = '0';
      });
      win.setTimeout(() => spark.remove(), 920);
    }
    toast(label);
  }

  function enhanceControls() {
    const controls = doc.querySelectorAll('a, button, [role="button"]');
    controls.forEach((control) => {
      if (control.dataset.premiumEnhanced) return;
      const premiumTarget = control.matches('.button, .btn-primary, .btn-ghost, .sg-button, .os-action, .links a, .navlinks a, .rail a, .index-list a, .card a, .panel a, .hq-portal a');
      if (!premiumTarget) return;
      control.dataset.premiumEnhanced = 'true';
      control.addEventListener('pointermove', (event) => {
        const rect = control.getBoundingClientRect();
        control.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        control.style.setProperty('--my', `${event.clientY - rect.top}px`);
      });
      control.addEventListener('click', (event) => {
        ripple(event.clientX, event.clientY);
        const text = (control.textContent || '').toLowerCase();
        const explicit = control.getAttribute('data-sg-sound');
        playTone(explicit === 'reward' || text.includes('reward') || text.includes('claim') ? 'reward' : text.includes('launch') || text.includes('open') ? 'lift' : 'tap');
      });
    });
  }

  function addStudioDock() {
    if (doc.querySelector('[data-premium-studio-dock]')) return;
    const main = doc.querySelector('main');
    const footer = doc.querySelector('footer');
    if (!main && !footer) return;
    const dock = doc.createElement('section');
    dock.className = 'wrap section premium-studio-dock';
    dock.setAttribute('data-premium-studio-dock', '');
    dock.innerHTML = `
      <div class="section-head">
        <h2>Premium interaction layer</h2>
        <p>Polished buttons, cinematic motion, opt-in sound, glow feedback, and rounded studio panels are active across this surface.</p>
      </div>
      <div class="grid cols-3">
        <article class="card"><span class="tag">UX</span><h3>Studio-grade controls</h3><p>Primary actions now share lift, shimmer, pressed feedback, and soft focus states instead of hard outline boxes.</p></article>
        <article class="card"><span class="tag">Motion</span><h3>Premium animation pass</h3><p>Ambient aurora, depth float, pointer ripples, and visual bursts keep the interface alive without blocking content.</p><button class="button" type="button" data-premium-burst>Test Motion Burst</button></article>
        <article class="card"><span class="tag">Sound</span><h3>Opt-in audio cues</h3><p>Buttons and feature triggers use browser-safe tones only after user interaction.</p><button class="button primary" type="button" data-premium-sound>Test Premium Sound</button></article>
      </div>`;
    if (footer) {
      footer.parentNode.insertBefore(dock, footer);
    } else {
      main.insertAdjacentElement('afterend', dock);
    }
    dock.querySelector('[data-premium-burst]')?.addEventListener('click', () => burst('Premium motion burst active'));
    dock.querySelector('[data-premium-sound]')?.addEventListener('click', () => { playTone('reward'); toast('Premium sound cue active'); });
  }

  function init() {
    ensureAurora();
    enhanceControls();
    addStudioDock();
    doc.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-sg-trigger]');
      if (trigger) burst(trigger.getAttribute('data-sg-trigger') || 'Studio burst');
    });
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();
