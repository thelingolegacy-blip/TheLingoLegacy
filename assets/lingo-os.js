(() => {
  const doc = document;
  const body = doc.body;
  if (!body || doc.getElementById('hud-layer')) return;

  doc.documentElement.classList.add('theme-industrial-noir');
  body.classList.add('lingo-os-active', 'theme-industrial-noir', 'season-winter', 'mode-quest');

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

  const navItems = [
    ['/', 'OS', 'Home'],
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
        <span class="os-chip"><span>System</span><b>${status}</b></span>
        <span class="os-chip"><span>Mode</span><b>${online}</b></span>
        <span class="os-chip"><span>Wallet</span><b>Keys armed</b></span>
      </div>
      <div class="os-actions">
        <button class="os-action" type="button" data-os-toggle-fx>Performance</button>
        <a class="os-action" href="/admin-command-center/">Command</a>
        <a class="os-action os-action--primary" href="/app/">Launch</a>
      </div>
    </div>
    <nav class="os-side-rail" aria-label="OS navigation rail">
      ${navItems.map(([href, label, title]) => `<a class="os-nav-link" href="${href}" title="${title}" aria-label="${title}">${label}</a>`).join('')}
    </nav>
    <div class="os-toast-dock" aria-live="polite">
      <div class="os-toast"><small>System layer</small><strong>${escapeHtml(status)} synced to HUD + FX.</strong></div>
    </div>
    <div class="os-fab-stack" aria-label="Quick actions">
      <a class="os-fab" href="/landing/">Create</a>
      <a class="os-fab" href="/studio-production/">Upgrade</a>
    </div>
  `;

  body.prepend(world);
  body.append(fx, hud);

  hud.querySelector('[data-os-toggle-fx]')?.addEventListener('click', () => {
    body.classList.toggle('fx-disabled');
    const disabled = body.classList.contains('fx-disabled');
    doc.querySelector('[data-os-toggle-fx]').textContent = disabled ? 'FX Off' : 'Performance';
  });

  pulseXp();
  doc.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('a, button') : null;
    if (target && !body.classList.contains('fx-disabled')) pulseXp(event.clientX, event.clientY);
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

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
  }
})();
