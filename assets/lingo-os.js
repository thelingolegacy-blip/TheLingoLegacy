(() => {
  const doc = document;
  const body = doc.body;
  if (!body || doc.getElementById('hud-layer')) return;

  const isKidsExplorer = body.dataset.osSurface === 'kids-explorer';

  doc.documentElement.classList.add('theme-industrial-noir');
  body.classList.add('lingo-os-active', 'theme-industrial-noir', 'season-winter', 'mode-quest');
  if (isKidsExplorer) {
    body.classList.add('kids-explorer-surface');
  } else {
    body.classList.add('auto-cinematic-mode', 'overlay-dominant', 'scene-suppressed');
  }

  const pageTitle = (doc.title || 'The Lingo Legacy').replace(/\s*[—|-].*$/, '').trim() || 'The Lingo Legacy';
  const currentPath = location.pathname.replace(/\/$/, '') || '/';

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
  cinematic.innerHTML = '<div class="os-cinematic-frame"><small>Auto Cinematic Mode</small><strong>Industrial Noir OS Surface</strong><p>Overlay dominance, scene suppression, z-index governance, motion language, lighting, and studio asset framing are running as one production surface.</p></div>';

  const navItems = [
    ['/', 'OS', 'Home'],
    ['/#os-modules', 'SYS', 'Core OS screens'],
    ['/app/', 'XP', 'Daily app'],
    ['/thats-my-lingo/', 'PLAY', 'Game floor'],
    ['/studio-production/', 'STU', 'Studio production'],
    ['/universe/', 'MAP', 'Universe map']
  ];

  const status = currentPath === '/app' ? 'XP Engine' : currentPath.includes('studio-production') ? 'Studio Ops' : currentPath.includes('thats-my-lingo') ? 'Game Floor' : 'World Online';
  const online = currentPath.includes('admin') ? 'Admin' : currentPath.includes('app') ? 'Quest' : 'Noir';

  hud.innerHTML = `
    <div class="os-command-bar" role="navigation" aria-label="OS command bar">
      <a class="os-brand" href="/">
        <img src="/assets/thats-my-lingo-mark.svg" alt="">
        <span><small>The Lingo Legacy OS</small><strong>${escapeHtml(pageTitle)}</strong></span>
      </a>
      <div class="os-status" aria-label="System status">
        <span class="os-chip" data-os-chip="system"><span>System</span><b>${status}</b></span>
        <span class="os-chip" data-os-chip="mode"><span>Mode</span><b>${online}</b></span>
        <span class="os-chip" data-os-chip="wallet"><span>Wallet</span><b>Keys armed</b></span>
      </div>
      <div class="os-actions">
        <button class="os-action" type="button" data-os-toggle-fx>Performance</button>
        <button class="os-action" type="button" data-os-toggle-overlay>Overlay</button>
        <button class="os-action" type="button" data-os-event="xp">XP +25</button>
        <a class="os-action" href="/admin-command-center/">Command</a>
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
      <a class="os-fab" href="/landing/">Create</a>
      <a class="os-fab" href="/studio-production/">Upgrade</a>
    </div>
  `;

  body.prepend(world);
  body.append(cinematic, fx, hud);

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

  if (!isKidsExplorer) autoCinematicLoop();
  pulseXp();
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
