(() => {
  const doc = document;
  const body = doc.body;
  if (!body) return;
  body.classList.add('studio-grade-mode');

  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch {} }
  };

  let toast = doc.querySelector('[data-sg-toast]');
  if (!toast) {
    toast = doc.createElement('div');
    toast.className = 'sg-toast';
    toast.dataset.sgToast = '';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    body.append(toast);
  }

  if (!doc.querySelector('.sg-backdrop')) {
    const backdrop = doc.createElement('div');
    backdrop.className = 'sg-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.innerHTML = '<div class="sg-stars"></div>';
    body.prepend(backdrop);
  }

  const sounds = {
    chime: [392, 523.25, 659.25, 783.99],
    click: [330, 440],
    reward: [523.25, 659.25, 783.99, 1046.5],
    sweep: [220, 330, 440, 550]
  };
  let soundEnabled = storage.get('sgSound') === 'on';

  function show(message) {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(show.timer);
    show.timer = window.setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function playMotif(type = 'chime', force = false) {
    if (!soundEnabled && !force) {
      show('Studio sound is muted. Turn it on from the dock.');
      return;
    }
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
  }

  function burst(label = 'Studio visual burst') {
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
      body.append(dot);
      requestAnimationFrame(() => {
        dot.style.transform = `translate(${Math.random() * 220 - 110}px, ${Math.random() * -150 - 20}px) scale(0.15)`;
        dot.style.opacity = '0';
      });
      window.setTimeout(() => dot.remove(), 1000);
    }
    show(label);
  }

  function addRipple(control, event) {
    const rect = control.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = doc.createElement('span');
    ripple.className = 'sg-ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    control.append(ripple);
    window.setTimeout(() => ripple.remove(), 650);
  }

  function bindStudioControls(root = doc) {
    root.querySelectorAll('[data-sg-sound]').forEach((button) => {
      if (button.dataset.sgBound) return;
      button.dataset.sgBound = 'true';
      button.addEventListener('click', () => {
        const type = button.getAttribute('data-sg-sound') || 'chime';
        playMotif(type);
        if (soundEnabled) show(`${type.charAt(0).toUpperCase() + type.slice(1)} sound tested.`);
      });
    });

    root.querySelectorAll('[data-sg-trigger]').forEach((button) => {
      if (button.dataset.sgBound) return;
      button.dataset.sgBound = 'true';
      button.addEventListener('click', () => {
        const event = button.getAttribute('data-sg-trigger') || 'Studio visual burst';
        burst(event);
        playMotif(event.toLowerCase().includes('reward') ? 'reward' : 'click');
      });
    });

    root.querySelectorAll('.button, .sg-button, .actions a, .actions button, .sg-studio-dock button, .sg-studio-dock a').forEach((control) => {
      if (control.dataset.sgRippleBound) return;
      control.dataset.sgRippleBound = 'true';
      control.addEventListener('pointerdown', (event) => addRipple(control, event));
    });
  }

  function injectMonetizationRail() {
    if (doc.querySelector('.sg-monetize-rail')) return;
    const main = doc.querySelector('main');
    if (!main) return;
    const rail = doc.createElement('section');
    rail.className = 'sg-monetize-rail';
    rail.setAttribute('aria-label', 'Monetization-ready studio layer');
    rail.innerHTML = `
      <div class="sg-monetize-head">
        <div><span class="sg-tag">Monetization-ready</span><h2>Commerce, rewards, sponsors, and creator access are staged.</h2></div>
        <p>These are launch-ready conversion surfaces only: no hidden payment backend, no secret tokens, and no cash-value reward promise are added by this static layer.</p>
      </div>
      <div class="sg-monetize-grid">
        <div class="sg-monetize-card"><b>Commerce drops</b><span>Product, apparel, digital-download, and campaign-drop paths can route into checkout when a real provider is attached.</span></div>
        <div class="sg-monetize-card"><b>Reward economy</b><span>XP, badges, coins, and Loyalty Bucks stay entertainment-only until formal redemption rules exist.</span></div>
        <div class="sg-monetize-card"><b>Sponsor inventory</b><span>Landing placements, game rooms, newsletters, and creator lanes are framed for partner packages.</span></div>
        <div class="sg-monetize-card"><b>Creator access</b><span>Studio requests, asset packs, command-center workflows, and launch list capture convert interest now.</span></div>
      </div>
      <div class="sg-monetize-actions"><a class="sg-button sg-button--primary" href="/landing/">Join launch list</a><a class="sg-button" href="/loyalty-lane-cycles/">View commerce lane</a><a class="sg-button" href="mailto:hello@thelingolegacy.com?subject=Lingo%20Legacy%20Monetization%20Access">Request monetization access</a></div>`;
    const footer = doc.querySelector('footer');
    if (footer && footer.parentElement === main) main.insertBefore(rail, footer);
    else main.append(rail);
    bindStudioControls(rail);
  }

  function injectStudioDock() {
    if (doc.querySelector('.sg-studio-dock')) return;
    const dock = doc.createElement('div');
    dock.className = 'sg-studio-dock';
    dock.setAttribute('aria-label', 'Studio quick controls');
    dock.innerHTML = '<a href="/">Home</a><a href="/studio-assets/">Assets</a><a href="/landing/">Monetize</a><button type="button" data-sg-trigger="Studio visual burst">Burst</button><button type="button" data-sg-sound="click" data-sg-sound-toggle>Sound off</button>';
    body.append(dock);
    const soundButton = dock.querySelector('[data-sg-sound-toggle]');
    const sync = () => { soundButton.textContent = soundEnabled ? 'Sound on' : 'Sound off'; soundButton.setAttribute('aria-pressed', String(soundEnabled)); };
    soundButton.addEventListener('click', (event) => {
      event.stopImmediatePropagation();
      soundEnabled = !soundEnabled;
      storage.set('sgSound', soundEnabled ? 'on' : 'off');
      sync();
      if (soundEnabled) playMotif('chime', true);
      show(soundEnabled ? 'Studio sound enabled.' : 'Studio sound muted.');
    });
    sync();
    bindStudioControls(dock);
  }

  bindStudioControls();
  injectMonetizationRail();
  injectStudioDock();
})();
