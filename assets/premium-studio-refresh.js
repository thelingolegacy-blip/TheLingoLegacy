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
        doc.documentElement.style.setProperty('--premium-cursor-x', `${event.clientX}px`);
        doc.documentElement.style.setProperty('--premium-cursor-y', `${event.clientY}px`);
      });
      control.addEventListener('click', (event) => {
        ripple(event.clientX, event.clientY);
        const text = (control.textContent || '').toLowerCase();
        const explicit = control.getAttribute('data-sg-sound');
        playTone(explicit === 'reward' || text.includes('reward') || text.includes('claim') ? 'reward' : text.includes('launch') || text.includes('open') ? 'lift' : 'tap');
      });
    });
  }

  function enhanceStudioReadyMotion() {
    doc.body.classList.add('premium-studio-ready');

    if (!doc.querySelector('.premium-scanline')) {
      const scanline = doc.createElement('div');
      scanline.className = 'premium-scanline';
      scanline.setAttribute('aria-hidden', 'true');
      doc.body.prepend(scanline);
    }

    if (!reduceMotion) {
      doc.addEventListener('pointermove', (event) => {
        doc.documentElement.style.setProperty('--premium-cursor-x', `${event.clientX}px`);
        doc.documentElement.style.setProperty('--premium-cursor-y', `${event.clientY}px`);
      }, { passive: true });
    }

    const tiltTargets = doc.querySelectorAll('.card, .panel, .hq-portal, .hq-command-card, .index-list a, .rail a, .premium-promo-card, .premium-platform-card, .premium-ad-card, .premium-money-card, .sg-card, .sg-panel');
    tiltTargets.forEach((target) => {
      if (target.dataset.premiumTilt) return;
      target.dataset.premiumTilt = 'true';
      target.addEventListener('pointermove', (event) => {
        if (reduceMotion) return;
        const rect = target.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) - 0.5;
        const y = ((event.clientY - rect.top) / rect.height) - 0.5;
        target.style.setProperty('--tilt-x', `${x * 3.5}deg`);
        target.style.setProperty('--tilt-y', `${y * -3.5}deg`);
      });
      target.addEventListener('pointerleave', () => {
        target.style.setProperty('--tilt-x', '0deg');
        target.style.setProperty('--tilt-y', '0deg');
      });
    });

    const revealTargets = Array.from(doc.querySelectorAll('.section, .card, .panel, .premium-promo-card, .premium-platform-card, .premium-ad-card, .premium-money-card, .sg-card, .sg-panel'));
    if (!('IntersectionObserver' in win) || reduceMotion) {
      revealTargets.forEach((target) => target.classList.add('premium-inview-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('premium-inview-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealTargets.forEach((target, index) => {
      if (target.dataset.premiumReveal) return;
      target.dataset.premiumReveal = 'true';
      target.classList.add('premium-inview-target');
      target.style.transitionDelay = `${Math.min(index % 6, 5) * 45}ms`;
      observer.observe(target);
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
      <div class="premium-ready-strip"><a class="button primary" href="/studio-shell/">Open Studio Ready Shell</a><span>Static UI shell, route board, launch status, motion readiness, and safety handoff are ready.</span></div>
      <div class="grid cols-3">
        <article class="card"><span class="tag">UX</span><h3>Studio-grade controls</h3><p>Primary actions now share lift, shimmer, pressed feedback, and soft focus states instead of hard outline boxes.</p></article>
        <article class="card"><span class="tag">Motion</span><h3>Premium animation pass</h3><p>Ambient aurora, depth float, pointer ripples, and visual bursts keep the interface alive without blocking content.</p><button class="button" type="button" data-premium-burst>Test Motion Burst</button></article>
        <article class="card"><span class="tag">Sound</span><h3>Opt-in audio cues</h3><p>Buttons and feature triggers use browser-safe tones only after user interaction.</p><button class="button primary" type="button" data-premium-sound>Test Premium Sound</button></article>
      </div>
      <div class="premium-promo-runway" aria-label="All-day promotion schedule">
        <div class="section-head">
          <h2>All-day promotion runway</h2>
          <p>Rotate the site message across different time blocks and platforms without auto-posting or creating paid traffic spikes from code.</p>
        </div>
        <div class="premium-promo-grid">
          <article class="premium-promo-card"><span class="tag">6 AM - 10 AM</span><h3>Morning launch push</h3><p>Lead with homepage, app, launch list, and studio story clips for early traffic.</p><div><a class="button primary" href="/">Homepage</a><a class="button" href="/app/">Daily App</a></div></article>
          <article class="premium-promo-card"><span class="tag">10 AM - 2 PM</span><h3>Midday game-floor lane</h3><p>Push That’s My Lingo, casino mini-game, visuals, and entertainment-only reward framing.</p><div><a class="button primary" href="/thats-my-lingo/">Game Floor</a><a class="button" href="/casino/">Casino</a></div></article>
          <article class="premium-promo-card"><span class="tag">2 PM - 6 PM</span><h3>Studio platform sweep</h3><p>Route visitors through live studio, visual showcase, racing universe, and rap arena surfaces.</p><div><a class="button primary" href="/live-casino-studio/">Live Studio</a><a class="button" href="/visual-showcase/">Visuals</a></div></article>
          <article class="premium-promo-card"><span class="tag">6 PM - 10 PM</span><h3>Prime-time conversion</h3><p>Feature founder drop, Stripe checkout route, social play, and premium brand pages.</p><div><a class="button primary" href="/drop/#stripe-checkout">Founder Drop</a><a class="button" href="/social-play/">Social Play</a></div></article>
          <article class="premium-promo-card"><span class="tag">10 PM - 2 AM</span><h3>Late-night loyalty loop</h3><p>Promote rewards language, Loyalty Lane, universe map, and replayable visual systems.</p><div><a class="button primary" href="/loyalty-lane-cycles/">Loyalty Lane</a><a class="button" href="/universe/">Universe</a></div></article>
          <article class="premium-promo-card"><span class="tag">Always on</span><h3>Budget-safe posting queue</h3><p>Use this as the manual schedule for TikTok, Instagram, Facebook, YouTube, X, Threads, email, SMS, and link-in-bio. Keep spend caps on before boosting.</p><div><a class="button primary" href="/landing/">Launch List</a><a class="button" href="/trust-compliance/">Trust Core</a></div></article>
        </div>
      </div>
      <div class="premium-blowout-hub" aria-label="Extreme cross-platform promotion and monetization hub">
        <div class="section-head">
          <h2>Extreme blowout promotion hub</h2>
          <p>One static command center for all live apps, games, web properties, TV surfaces, store listings, banners, surveys, 30-second ad scripts, and payment-ready conversion lanes.</p>
        </div>
        <div class="premium-platform-grid">
          <article class="premium-platform-card"><span class="tag">Mobile stores</span><h3>Google Play + Apple App Store</h3><p>Promote app install, daily game, casino entertainment, launch list, reviews, screenshots, and short-form trailers.</p><a class="button primary" href="/app/">Promote App</a></article>
          <article class="premium-platform-card"><span class="tag">TV apps</span><h3>LG, smart TV, streaming portals</h3><p>Use 30-second trailer copy, QR-code landing CTAs, visual showcase clips, and family-safe entertainment positioning.</p><a class="button" href="/visual-showcase/">Open TV Visuals</a></article>
          <article class="premium-platform-card"><span class="tag">Web + PWA</span><h3>Web apps and portable apps</h3><p>Push homepage, installable web app behavior, browser games, portable shortcut links, and all route hubs.</p><a class="button primary" href="/">Open Web Hub</a></article>
          <article class="premium-platform-card"><span class="tag">Games</span><h3>Casino, racing, rap arena</h3><p>Rotate gameplay banners for That’s My Lingo, casino mini-game, auto racing universe, and multiplayer rap arena.</p><a class="button" href="/auto-racing-universe/">Promote Games</a></article>
        </div>
        <div class="premium-ad-grid">
          <article class="premium-ad-card"><span class="tag">Banner pack</span><h3>All-day banner ads</h3><p>Hero banner: “Play The Lingo Legacy today.” Store banner: “Install, play, earn virtual rewards.” Trust banner: “Entertainment-only. No cash value.”</p><button class="button" type="button" data-premium-burst>Preview Banner Burst</button></article>
          <article class="premium-ad-card"><span class="tag">30-second ad</span><h3>Video script 01</h3><p>0-5s: logo gate. 5-12s: game floor. 12-20s: racing, rap, rewards. 20-27s: app and TV QR. 27-30s: “Play now at The Lingo Legacy.”</p><button class="button" type="button" data-premium-sound>Preview Ad Sound</button></article>
          <article class="premium-ad-card"><span class="tag">Surveys</span><h3>Feedback funnels</h3><p>Collect interest in mobile app, TV app, paid subscription, merch drop, game modes, and platform preference before scaling spend.</p><button class="button" type="button" data-premium-survey>Generate Survey Prompt</button></article>
        </div>
        <div class="premium-money-grid">
          <article class="premium-money-card"><span class="tag">Stripe</span><h3>Founder packs and subscriptions</h3><p>Route paid offers through the existing checkout lane after products, pricing, fulfillment, taxes, and subscription terms are approved.</p><a class="button primary" href="/drop/#stripe-checkout">Open Stripe Lane</a></article>
          <article class="premium-money-card"><span class="tag">Square</span><h3>Square-ready checkout lane</h3><p>Reserve a second payment lane for Square invoices, subscriptions, point-of-sale offers, or backup checkout once account details are supplied.</p><button class="button" type="button" data-premium-square>Stage Square Lane</button></article>
          <article class="premium-money-card"><span class="tag">Guardrails</span><h3>Monetize without overrun</h3><p>Start with organic and manual posts, then enable paid boosts only after Vercel spend caps, ad budgets, refund policy, and support flow are ready.</p><a class="button" href="/trust-compliance/">Open Guardrails</a></article>
        </div>
      </div>`;
    if (footer) {
      footer.parentNode.insertBefore(dock, footer);
    } else {
      main.insertAdjacentElement('afterend', dock);
    }
    dock.querySelectorAll('[data-premium-burst]').forEach((button) => button.addEventListener('click', () => burst('Premium motion burst active')));
    dock.querySelectorAll('[data-premium-sound]').forEach((button) => button.addEventListener('click', () => { playTone('reward'); toast('Premium sound cue active'); }));
    dock.querySelector('[data-premium-survey]')?.addEventListener('click', () => toast('Survey prompt: Which platform should launch first: mobile, TV, web, or games?'));
    dock.querySelector('[data-premium-square]')?.addEventListener('click', () => toast('Square lane staged. Add approved Square checkout details before taking payments.'));
  }

  function init() {
    ensureAurora();
    addStudioDock();
    enhanceControls();
    enhanceStudioReadyMotion();
    doc.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-sg-trigger]');
      if (trigger) burst(trigger.getAttribute('data-sg-trigger') || 'Studio burst');
    });
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();
