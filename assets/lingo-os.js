(() => {
  const doc = document;
  const body = doc.body;
  if (!body || doc.getElementById('hud-layer')) return;

  const isKidsExplorer = body.dataset.osSurface === 'kids-explorer';
  const productionConfig = Object.freeze({
    startup: {
      onboarding: false,
      tutorialPopups: false,
      firstRunAnimations: false,
      debugBanners: false,
      placeholderTips: false,
      demoContent: false
    },
    featureFlags: {
      adminCommandCenter: false,
      studioUpgradeShortcut: false,
      xpDebugEvents: false,
      proModeToggle: false,
      cinematicOverlay: false,
      audioTestPads: true,
      soundFxToggle: true,
      interactionSpotlight: true,
      studioAssets: true,
      trustCore: true
    },
    assets: [
      { href: '/assets/thats-my-lingo-mark.svg', as: 'image' },
      { href: '/assets/lingo-os.css', as: 'style' },
      { href: '/assets/studio-grade.css', as: 'style' }
    ]
  });
  const featureFlags = productionConfig.featureFlags;
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

  doc.documentElement.classList.add('theme-industrial-noir');
  body.classList.add('lingo-os-active', 'theme-industrial-noir', 'season-winter', 'mode-quest', 'production-shell-ready');
  if (isKidsExplorer) {
    body.classList.add('kids-explorer-surface');
  } else if (featureFlags.cinematicOverlay) {
    body.classList.add('auto-cinematic-mode', 'overlay-dominant', 'scene-suppressed');
  }

  const pageTitle = (doc.title || 'The Lingo Legacy').replace(/\s*[—|-].*$/, '').trim() || 'The Lingo Legacy';
  const currentPath = location.pathname.replace(/\/$/, '') || '/';
  const sessionState = loadSessionState();
  let audioContext = null;
  let soundEnabled = sessionState.soundFx === true;
  const lastStudioPath = sessionState.lastStudioPath || '/studio-production/';
  const isStudioPath = /studio|casino|cartoon|streetwear|universe|kottons-code|tapstich|thats-my-lingo/.test(currentPath);
  if (isStudioPath) saveSessionState({ lastStudioPath: `${location.pathname}${location.hash || ''}` });
  preloadCoreSurfaces();
  applyProductionStartup();
  applyFeatureFlags();
  setupResilienceHooks();

  const world = doc.createElement('div');
  world.id = 'world-layer';
  world.setAttribute('aria-hidden', 'true');

  const fx = doc.createElement('div');
  fx.id = 'fx-layer';
  fx.setAttribute('aria-hidden', 'true');
  fx.innerHTML = '<span class="os-orb os-orb--gold"></span><span class="os-orb os-orb--cyan"></span><span class="os-orb os-orb--violet"></span>';

  const hud = doc.createElement('div');
  hud.id = 'hud-layer';
  hud.setAttribute('aria-label', 'The Lingo Legacy OS HUD');

  const cinematic = doc.createElement('div');
  cinematic.id = 'cinematic-overlay';
  cinematic.setAttribute('aria-hidden', 'true');
  cinematic.dataset.featureFlag = 'cinematicOverlay';
  cinematic.innerHTML = '<div class="os-cinematic-frame"><small>Production Shell</small><strong>Studio surface ready</strong><p>Navigation, feature flags, session restoration, asset preloading, and recovery hooks are online.</p></div>';

  const navItems = [
    ['/', 'OS', 'Home'],
    ['/#os-modules', 'HQ', 'Home layers'],
    ['/app/', 'XP', 'Daily app'],
    ['/thats-my-lingo/', 'PLAY', 'Game floor'],
    ['/loading/', 'LOAD', 'Loading gateway'],
    ['/studio-assets/', 'ART', 'Studio assets'],
    ['/tapstich/', 'TAP', 'Tapstich'],
    ['/studio-production/', 'STU', 'Studio production'],
    ['/studio-world-os/', 'WORLDS', 'Silent worlds'],
    ['/universe/', 'MAP', 'Universe map']
  ];

  const status = currentPath === '/app' ? 'XP Engine' : currentPath.includes('loading') ? 'Loading Gate' : currentPath.includes('studio-assets') ? 'Asset Studio' : currentPath.includes('studio-production') ? 'Studio Ops' : currentPath.includes('thats-my-lingo') ? 'Game Floor' : 'World Online';
  const online = currentPath.includes('admin') ? 'Admin' : currentPath.includes('app') ? 'Quest' : 'Noir';

  hud.innerHTML = `
    <div class="os-command-bar" role="navigation" aria-label="OS world bar">
      <a class="os-brand" href="/">
        <img src="/assets/thats-my-lingo-mark.svg" alt="">
        <span><small>The Lingo Legacy OS</small><strong>${escapeHtml(pageTitle)}</strong></span>
      </a>
      <div class="os-status" aria-label="System status">
        <span class="os-chip" data-os-chip="system"><span>System</span><b>${status}</b></span>
        <span class="os-chip" data-os-chip="mode"><span>Mode</span><b>${online}</b></span>
        <span class="os-chip" data-os-chip="wallet"><span>Wallet</span><b>Unverified</b></span>
      </div>
      <div class="os-actions">
        <button class="os-action" type="button" data-os-toggle-fx>Performance</button>
        <button class="os-action" type="button" data-os-toggle-sound data-feature-flag="soundFxToggle" aria-pressed="false">Sound FX</button>
        <button class="os-action" type="button" data-os-toggle-overlay data-feature-flag="cinematicOverlay">Overlay</button>
        <button class="os-action" type="button" data-os-pro-mode data-feature-flag="proModeToggle">Pro mode</button>
        <button class="os-action" type="button" data-os-command>Worlds</button>
        <button class="os-action" type="button" data-os-event="xp" data-feature-flag="xpDebugEvents">XP +25</button>
        <a class="os-action" href="/admin-command-center/" data-feature-flag="adminCommandCenter">HQ</a>
        <a class="os-action os-action--primary" href="/app/">Launch</a>
      </div>
    </div>
    <nav class="os-side-rail" aria-label="OS navigation rail">
      ${navItems.map(([href, label, title]) => `<a class="os-nav-link" href="${href}" title="${title}" aria-label="${title}">${label}</a>`).join('')}
    </nav>
    <div class="os-toast-dock" aria-live="polite" data-os-toasts>
      <div class="os-toast"><small>System layer</small><strong>${escapeHtml(status)} synced to HUD + FX.</strong></div>
    </div>
    <div class="os-sound-rail" data-os-sound-rail data-feature-flag="soundFxToggle" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
    <div class="os-fab-stack" aria-label="Quick actions">
      <a class="os-fab" href="${lastStudioPath}">Resume</a>
      <a class="os-fab" href="/studio-production/">Studio</a>
      <a class="os-fab" href="/trust-compliance/" data-feature-flag="trustCore">Trust</a>
      <a class="os-fab" href="/studio-production/" data-feature-flag="studioUpgradeShortcut">Upgrade</a>
    </div>
    <section class="os-command-palette" data-os-palette hidden aria-label="Lingo Legacy world switcher">
      <div class="os-command-panel" role="dialog" aria-modal="true" aria-labelledby="os-command-title">
        <div class="os-command-head"><span id="os-command-title">World switcher</span><button type="button" data-os-command-close aria-label="Close world switcher">Close</button></div>
        <input data-os-command-input type="search" autocomplete="off" placeholder="Find worlds, studios, assets, and modes..." aria-label="Search worlds" />
        <div class="os-command-results" data-os-command-results></div>
      </div>
    </section>
  `;

  body.prepend(world);
  body.append(cinematic, fx, hud);
  applyFeatureFlags(hud);
  applyFeatureFlags(cinematic);
  setSoundEnabled(soundEnabled, false);
  fetchPlatformStatus();

  hud.querySelector('[data-os-toggle-fx]')?.addEventListener('click', () => {
    body.classList.toggle('fx-disabled');
    body.classList.toggle('motion-disabled', body.classList.contains('fx-disabled'));
    const disabled = body.classList.contains('fx-disabled');
    doc.querySelector('[data-os-toggle-fx]').textContent = disabled ? 'FX Off' : 'Performance';
    toast('Performance mode', disabled ? 'FX and motion layers disabled.' : 'FX and motion layers online.');
  });

  hud.querySelector('[data-os-toggle-sound]')?.addEventListener('click', () => {
    setSoundEnabled(!soundEnabled, true);
  });

  hud.querySelector('[data-os-toggle-overlay]')?.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleSceneSuppression();
  });

  hud.querySelector('[data-os-pro-mode]')?.addEventListener('click', () => {
    body.classList.toggle('pro-mode');
    const enabled = body.classList.contains('pro-mode');
    doc.querySelector('[data-os-pro-mode]').textContent = enabled ? 'Pro on' : 'Pro mode';
    toast('Pro mode', enabled ? 'Power-user shortcuts and dense HUD are active.' : 'Guided HUD restored.');
  });

  setupCommandPalette();
  setupMotionLayer();

  if (!isKidsExplorer && featureFlags.cinematicOverlay && !prefersReducedMotion) autoCinematicLoop();
  if (!prefersReducedMotion) pulseXp();
  doc.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('a, button') : null;
    if (!target) return;

    if (target.hasAttribute('data-os-toggle-overlay')) {
      toggleSceneSuppression();
      return;
    }

    const systemEvent = target.getAttribute('data-os-event');
    if (systemEvent === 'wallet') {
      walletGlow(event.clientX, event.clientY);
    } else if (systemEvent === 'xp') {
      pulseXp(event.clientX, event.clientY);
      setChip('system', 'XP +25');
      toast('XP Engine', 'Quest progress sent to HUD + FX.');
    } else if (!body.classList.contains('fx-disabled')) {
      pulseXp(event.clientX, event.clientY);
      spotlight(event.clientX, event.clientY);
    }

    if (target.matches('a, button, [role="button"]')) {
      playTone(target.classList.contains('primary') || target.classList.contains('os-action--primary') ? 'reward' : 'click');
    }
  });

  function setSoundEnabled(enabled, announce) {
    soundEnabled = Boolean(enabled);
    body.classList.toggle('sound-fx-enabled', soundEnabled);
    const toggle = doc.querySelector('[data-os-toggle-sound]');
    if (toggle) {
      toggle.textContent = soundEnabled ? 'Sound on' : 'Sound FX';
      toggle.setAttribute('aria-pressed', soundEnabled ? 'true' : 'false');
    }
    saveSessionState({ soundFx: soundEnabled });
    if (announce) {
      playTone(soundEnabled ? 'open' : 'close', { force: soundEnabled });
      toast('Sound FX', soundEnabled ? 'User-triggered audio cues enabled.' : 'Audio cues muted.');
    }
  }

  function playTone(type = 'click', options = {}) {
    if (!soundEnabled && !options.force) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      audioContext ||= new AudioContext();
      if (audioContext.state === 'suspended') audioContext.resume();
      const sequences = {
        click: [330, 440],
        open: [392, 523.25, 659.25],
        close: [220, 196],
        reward: [523.25, 659.25, 783.99, 1046.5]
      };
      const wave = type === 'click' ? 'square' : 'triangle';
      const motif = sequences[type] || sequences.click;
      motif.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const start = audioContext.currentTime + index * 0.055;
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(type === 'reward' ? 0.045 : 0.026, start + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
        osc.connect(gain).connect(audioContext.destination);
        osc.start(start);
        osc.stop(start + 0.2);
      });
      animateSoundRail(type);
    } catch {
      setSoundEnabled(false, false);
    }
  }

  function animateSoundRail(type = 'click') {
    const rail = doc.querySelector('[data-os-sound-rail]');
    if (!rail) return;
    rail.dataset.sound = type;
    rail.classList.remove('is-playing');
    requestAnimationFrame(() => rail.classList.add('is-playing'));
    window.setTimeout(() => rail.classList.remove('is-playing'), 520);
  }

  function spotlight(x, y) {
    if (!featureFlags.interactionSpotlight || body.classList.contains('fx-disabled')) return;
    const light = doc.createElement('i');
    light.className = 'os-interaction-spotlight';
    light.style.left = `${x}px`;
    light.style.top = `${y}px`;
    fx.append(light);
    window.setTimeout(() => light.remove(), 760);
  }

  function setupMotionLayer() {
    body.classList.add('motion-layer-ready');
    if (prefersReducedMotion) {
      body.classList.add('motion-disabled');
      return;
    }

    const motionTargets = [
      ...doc.querySelectorAll('main :is(section, article, .card, .tile, .hq-panel, .hq-portal, .stage, .machine, .index-board, .visual, .rail, .world, .bonus, .foundation-card, .lobby-panel)')
    ];
    motionTargets.forEach((node, index) => {
      node.classList.add('motion-in');
      node.style.setProperty('--motion-order', String(index % 6));
    });

    if (!('IntersectionObserver' in window)) {
      motionTargets.forEach((node) => node.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
      motionTargets.forEach((node) => observer.observe(node));
    }

    const depthTargets = [...doc.querySelectorAll('main :is(.stage, .machine, .visual-scene, .constellation, .expansion-stage)')];
    let pointerFrame = 0;
    doc.addEventListener('pointermove', (event) => {
      if (body.classList.contains('motion-disabled') || body.classList.contains('fx-disabled')) return;
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        const x = ((event.clientX / window.innerWidth) - 0.5) * 10;
        const y = ((event.clientY / window.innerHeight) - 0.5) * 8;
        depthTargets.forEach((node) => {
          const rect = node.getBoundingClientRect();
          const active = event.clientX >= rect.left - 80 && event.clientX <= rect.right + 80 && event.clientY >= rect.top - 80 && event.clientY <= rect.bottom + 80;
          node.classList.toggle('motion-depth-active', active);
          if (active) {
            node.style.setProperty('--motion-pointer-x', x.toFixed(2));
            node.style.setProperty('--motion-pointer-y', y.toFixed(2));
          }
        });
      });
    }, { passive: true });

    doc.addEventListener('click', (event) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!link || body.classList.contains('motion-disabled') || body.classList.contains('fx-disabled')) return;
      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      const flash = doc.createElement('i');
      flash.className = 'route-motion-flash';
      flash.style.setProperty('--route-x', `${event.clientX}px`);
      flash.style.setProperty('--route-y', `${event.clientY}px`);
      body.append(flash);
      window.setTimeout(() => flash.remove(), 560);
    });
  }

  function setupCommandPalette() {
    const palette = hud.querySelector('[data-os-palette]');
    const input = hud.querySelector('[data-os-command-input]');
    const results = hud.querySelector('[data-os-command-results]');
    const commands = [
      ...navItems.map(([href, label, title]) => ({ label: title, detail: label, href })),
      { label: 'Resume last active studio', detail: 'Startup', href: lastStudioPath },
      { label: 'Open Silent Worlds', detail: 'World constellation', href: '/studio-world-os/' },
      { label: 'Open Asset Browser', detail: 'Assets', href: '/studio-assets/' },
      { label: 'Open Casino Studio', detail: 'Casino', href: '/casino-upgrade/' },
      { label: 'Open Cartoon Studio', detail: 'Cartoon', href: '/kottons-code/' },
      { label: 'Open Streetwear Studio', detail: 'Streetwear', href: '/tapstich/' }
    ];
    const render = () => {
      if (!results || !input) return;
      const query = input.value.trim().toLowerCase();
      const visible = commands.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query)).slice(0, 9);
      results.innerHTML = visible.map((item) => `<a href="${item.href}"><small>${escapeHtml(item.detail)}</small><strong>${escapeHtml(item.label)}</strong></a>`).join('');
    };
    const open = () => {
      if (!palette) return;
      palette.hidden = false;
      playTone('open');
      render();
      requestAnimationFrame(() => input?.focus());
    };
    const close = () => {
      if (palette) palette.hidden = true;
      playTone('close');
    };
    hud.querySelector('[data-os-command]')?.addEventListener('click', open);
    hud.querySelector('[data-os-command-close]')?.addEventListener('click', close);
    input?.addEventListener('input', render);
    doc.addEventListener('keydown', (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        open();
      } else if (event.key === 'Escape') {
        close();
      }
    });
  }

  function preloadCoreSurfaces() {
    const seen = new Set([...doc.querySelectorAll('link[href]')].map((link) => link.getAttribute('href')));
    for (const asset of productionConfig.assets) {
      if (seen.has(asset.href)) continue;
      const link = doc.createElement('link');
      link.rel = asset.as === 'script' ? 'prefetch' : 'preload';
      link.href = asset.href;
      link.as = asset.as;
      doc.head.append(link);
    }
  }

  async function fetchPlatformStatus() {
    try {
      const response = await fetch('/api/v1/platform/status', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        credentials: 'same-origin'
      });
      if (!response.ok) throw new Error(`status-${response.status}`);
      const payload = await response.json();
      if (payload?.ok !== true || payload?.dynamic !== true) throw new Error('invalid-status-contract');
      const integrations = payload.integrations || {};
      const runtime = integrations.cloudflare_runtime || 'unverified';
      const wallet = integrations.universal_wallet || 'unverified';
      setChip('system', runtime === 'active' ? 'Cloudflare Online' : titleCase(runtime));
      setChip('wallet', titleCase(wallet));
      body.dataset.platformStatus = 'ready';
      body.dataset.platformRuntime = runtime;
      body.dataset.universalWalletStatus = wallet;
      toast('Platform status', `Runtime ${titleCase(runtime)} · Wallet ${titleCase(wallet)}.`);
    } catch {
      body.dataset.platformStatus = 'unavailable';
      setChip('system', 'Status unavailable');
      setChip('wallet', 'Unverified');
    }
  }

  function titleCase(value) {
    return String(value || 'unverified').replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function applyProductionStartup() {
    if (!productionConfig.startup.firstRunAnimations || prefersReducedMotion) body.classList.add('startup-animations-disabled');
    if (!productionConfig.startup.debugBanners) body.classList.add('debug-banners-disabled');
    if (!productionConfig.startup.placeholderTips) body.classList.add('placeholder-tips-disabled');
    if (!productionConfig.startup.demoContent) body.classList.add('demo-content-disabled');
    doc.documentElement.dataset.theme = sessionState.theme || 'industrial-noir';
    if (sessionState.lastPath && sessionState.lastPath !== `${location.pathname}${location.hash || ''}`) {
      body.dataset.restoredFrom = sessionState.lastPath;
    }
    saveSessionState({ lastPath: `${location.pathname}${location.hash || ''}`, theme: doc.documentElement.dataset.theme });
  }

  function applyFeatureFlags(root = doc) {
    const flagged = root.matches?.('[data-feature-flag]') ? [root, ...root.querySelectorAll('[data-feature-flag]')] : [...root.querySelectorAll('[data-feature-flag]')];
    flagged.forEach((node) => {
      const flag = node.getAttribute('data-feature-flag');
      const enabled = flag ? featureFlags[flag] === true : true;
      node.toggleAttribute('hidden', !enabled);
      node.setAttribute('aria-hidden', enabled ? 'false' : 'true');
    });
  }

  function setupResilienceHooks() {
    window.addEventListener('online', () => {
      body.classList.remove('offline-aware');
      toast('Network restored', 'Background sync may resume.');
      fetchPlatformStatus();
    });
    window.addEventListener('offline', () => {
      body.classList.add('offline-aware');
      toast('Offline mode', 'Cached pages and local state remain available.');
    });
    if (!navigator.onLine) body.classList.add('offline-aware');
    window.addEventListener('error', (event) => {
      saveSessionState({ lastClientError: event.message || 'unknown client error' });
      toast('Recovery mode', 'A client error was captured locally.');
    });
    window.addEventListener('unhandledrejection', () => {
      saveSessionState({ lastClientError: 'unhandled promise rejection' });
      toast('Recovery mode', 'A background task recovered safely.');
    });
    doc.addEventListener('visibilitychange', () => {
      if (doc.visibilityState === 'hidden') saveSessionState({ lastPath: `${location.pathname}${location.hash || ''}` });
    });
  }

  function loadSessionState() {
    try {
      return JSON.parse(localStorage.getItem('lingo:production-session') || '{}') || {};
    } catch {
      return {};
    }
  }

  function saveSessionState(patch) {
    try {
      localStorage.setItem('lingo:production-session', JSON.stringify({ ...loadSessionState(), ...patch, updatedAt: new Date().toISOString() }));
    } catch {
      // Storage can be unavailable in private browsing; the shell stays functional without persistence.
    }
  }

  function pulseXp(x = window.innerWidth - 150, y = 118) {
    if (body.classList.contains('fx-disabled')) return;
    for (let i = 0; i < 8; i += 1) {
      const dot = doc.createElement('i');
      dot.className = 'os-xp-pulse';
      dot.style.left = `${x + (Math.random() * 56 - 28)}px`;
      dot.style.top = `${y + (Math.random() * 24 - 12)}px`;
      dot.style.animationDelay = `${i * 38}ms`;
      fx.append(dot);
      window.setTimeout(() => dot.remove(), 1200);
    }
  }

  function walletGlow(x = window.innerWidth - 150, y = 118) {
    setChip('wallet', 'New key');
    const wallet = doc.querySelector('[data-os-chip="wallet"]');
    wallet?.classList.remove('os-wallet-flash');
    requestAnimationFrame(() => wallet?.classList.add('os-wallet-flash'));
    keyBurst(x, y);
    toast('Wallet event', 'New Key Unlocked overlay armed.');
  }

  function keyBurst(x, y) {
    if (body.classList.contains('fx-disabled')) return;
    const burst = doc.createElement('i');
    burst.className = 'os-key-burst';
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;
    fx.append(burst);
    window.setTimeout(() => burst.remove(), 1000);
  }

  function setChip(name, value) {
    const chip = doc.querySelector(`[data-os-chip="${name}"] b`);
    if (chip) chip.textContent = value;
  }

  function toggleSceneSuppression() {
    body.classList.toggle('scene-suppressed');
    const suppressed = body.classList.contains('scene-suppressed');
    setChip('mode', suppressed ? 'Overlay only' : online);
    toast('Overlay dominance', suppressed ? 'Scene suppression active.' : 'Background content restored.');
  }

  function autoCinematicLoop() {
    const tick = () => {
      if (!body.classList.contains('auto-cinematic-mode')) return;
      const x = 34 + Math.random() * 42;
      const y = 18 + Math.random() * 28;
      doc.documentElement.style.setProperty('--os-scene-light-x', `${x}%`);
      doc.documentElement.style.setProperty('--os-scene-light-y', `${y}%`);
      sceneSpark();
    };
    tick();
    window.setInterval(tick, 4200);
  }

  function sceneSpark() {
    if (body.classList.contains('fx-disabled')) return;
    const spark = doc.createElement('i');
    spark.className = 'os-scene-spark';
    spark.style.left = `${12 + Math.random() * 76}%`;
    spark.style.top = `${8 + Math.random() * 28}%`;
    fx.append(spark);
    window.setTimeout(() => spark.remove(), 2200);
  }

  function toast(label, message) {
    const dock = doc.querySelector('[data-os-toasts]');
    if (!dock) return;
    const item = doc.createElement('div');
    item.className = 'os-toast';
    item.innerHTML = `<small>${escapeHtml(label)}</small><strong>${escapeHtml(message)}</strong>`;
    dock.prepend(item);
    while (dock.children.length > 3) dock.lastElementChild.remove();
    window.setTimeout(() => item.remove(), 4600);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>\"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[char]));
  }
})();
