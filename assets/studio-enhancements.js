(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const routes = [
    ['/', 'Home'],
    ['/thats-my-lingo/', 'Lingo'],
    ['/app/', 'Play'],
    ['/spades-is-my-lingo/', 'Spades'],
    ['/kottons-code/', 'Kotton'],
    ['/loyalty-lane-apparel/', 'Apparel'],
    ['/loyalty-lane-cycles/', 'District']
  ];
  const path = window.location.pathname.endsWith('/') ? window.location.pathname : `${window.location.pathname}/`;

  function ensureMainId() {
    const main = document.querySelector('main') || document.body;
    if (!main.id) main.id = 'main-content';
  }

  function mountChrome() {
    ensureMainId();
    const skip = document.createElement('a');
    skip.className = 'studio-skip';
    skip.href = '#main-content';
    skip.textContent = 'Skip to main content';
    document.body.prepend(skip);

    const progress = document.createElement('div');
    progress.className = 'studio-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.append(progress);

    const marquee = document.createElement('section');
    marquee.className = 'studio-marquee';
    marquee.setAttribute('aria-label', 'Studio production highlights');
    const items = ['Studio polish', 'Playable culture games', 'Sound on demand', 'Motion-safe animations', 'Brand worlds', 'Launch-ready Vercel site'];
    marquee.innerHTML = `<div class="studio-marquee__track">${[...items, ...items].map(item => `<span>${item}</span>`).join('')}</div>`;
    const header = document.querySelector('header, nav.nav');
    if (header && header.parentNode) header.parentNode.insertBefore(marquee, header.nextSibling);
    else document.body.prepend(marquee);

    const dock = document.createElement('nav');
    dock.className = 'studio-dock';
    dock.setAttribute('aria-label', 'Studio quick navigation');
    dock.innerHTML = `${routes.map(([href, label]) => `<a href="${href}"${href === path ? ' aria-current="page"' : ''}>${label}</a>`).join('')}<button type="button" data-sound="off" aria-pressed="false" aria-label="Toggle studio sound">Sound</button>`;
    document.body.append(dock);

    const toast = document.createElement('div');
    toast.className = 'studio-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.append(toast);
  }

  function showToast(message) {
    const toast = document.querySelector('.studio-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function mountSound() {
    let enabled = false;
    let ctx;
    const button = document.querySelector('.studio-dock button[data-sound]');
    const play = (freq = 520, duration = 0.12, type = 'triangle', gain = 0.035) => {
      if (!enabled) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      ctx ||= new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      vol.gain.value = gain;
      osc.connect(vol);
      vol.connect(ctx.destination);
      osc.start();
      vol.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.stop(ctx.currentTime + duration);
    };

    window.LingoStudioSound = {
      tap: () => play(560),
      success: () => { play(660, .13); setTimeout(() => play(880, .16), 70); },
      sweep: () => [420, 520, 680].forEach((freq, index) => setTimeout(() => play(freq, .13), index * 55))
    };

    button?.addEventListener('click', () => {
      enabled = !enabled;
      button.dataset.sound = enabled ? 'on' : 'off';
      button.setAttribute('aria-pressed', String(enabled));
      if (enabled) window.LingoStudioSound.sweep();
      showToast(enabled ? 'Studio sound is on. Effects only play after your clicks.' : 'Studio sound is off.');
    });

    document.addEventListener('click', event => {
      const target = event.target.closest('a, button, [role="button"]');
      if (!target || target.closest('#answers')) return;
      window.LingoStudioSound.tap();
    }, true);
  }

  function mountMotion() {
    const updateScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? window.scrollY / max : 0;
      document.documentElement.style.setProperty('--studio-scroll', pct.toFixed(4));
    };
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    if (!reducedMotion) {
      document.addEventListener('pointermove', event => {
        document.documentElement.style.setProperty('--studio-x', `${(event.clientX / window.innerWidth) * 100}%`);
        document.documentElement.style.setProperty('--studio-y', `${(event.clientY / window.innerHeight) * 100}%`);
      }, { passive: true });
    }

    const revealTargets = document.querySelectorAll('main section, article, .panel, .card, .tile, .promo-card, .asset-card');
    revealTargets.forEach((el, index) => {
      el.classList.add('studio-reveal');
      if (index < 8) el.style.transitionDelay = `${Math.min(index * 35, 220)}ms`;
      if (el.matches('.panel, .card, .tile, .promo-card, .asset-card, article')) el.classList.add('studio-glow-card');
    });

    if ('IntersectionObserver' in window && !reducedMotion) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      revealTargets.forEach(el => io.observe(el));
    } else {
      revealTargets.forEach(el => el.classList.add('is-visible'));
    }
  }

  function upgradeForms() {
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', () => showToast('Submitting your Lingo Legacy request.'));
    });
    document.querySelectorAll('a[href^="mailto:"], a[href*="twitter.com"], a[href*="facebook.com"]').forEach(link => {
      link.addEventListener('click', () => showToast('Opening share action.'));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    mountChrome();
    mountSound();
    mountMotion();
    upgradeForms();
  });
})();
