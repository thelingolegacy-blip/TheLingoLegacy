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
    ['/', 'HOME', 'Home'],
    ['/thats-my-lingo/', 'PLAY', 'Game floor'],
    ['/app/', 'APP', 'Daily app'],
    ['/studio-production/', 'STUDIO', 'Studio production'],
    ['/trust-compliance/', 'TRUST', 'Safety core'],
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
        <span class="os-chip" data-os-chip="wallet"><span>State</span><b>Ready</b></span>
      </div>
      <div class="os-actions">
        <button class="os-action" type="button" data-os-toggle-fx>Performance</button>
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
    <div class="os-fab-stack" aria-label="Quick actions">
      <a class="os-fab" href="${lastStudioPath}">Resume</a>
      <a class="os-fab" href="/app/">Launch</a>
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

  hud.querySelector('[data-os-toggle-fx]')?.addEventListener('click', () => {
    body.classList.toggle('fx-disabled');
    const disabled = body.classList.contains('fx-disabled');
    doc.querySelector('[data-os-toggle-fx]').textContent = disabled ? 'FX Off' : 'Performance';
    toast('Performance mode', disabled ? 'FX layer disabled.' : 'FX layer online.');
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

  if (!isKidsExplorer && featureFlags.cinematicOverlay && !prefersReducedMotion) autoCinematicLoop();
  if (!prefersReducedMotion && featureFlags.xpDebugEvents) pulseXp();
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
    }
  });

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
      render();
      requestAnimationFrame(() => input?.focus());
    };
    const close = () => {
      if (palette) palette.hidden = true;
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
    return String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
  }
})();
