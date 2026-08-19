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
      </div>
      <div class="premium-reward-hub" aria-label="First 1000 reward build-up framework">
        <div class="section-head">
          <h2>First 1000 reward build-up</h2>
          <p>High-premium static framework for a time-limited first-1000 campaign with virtual rewards, referral boosts, bonus play, free spins, wilds, and jackpot-style entertainment milestones.</p>
        </div>
        <div class="premium-reward-meter" aria-label="First 1000 progress preview"><span style="width: 38%"></span></div>
        <div class="premium-reward-grid">
          <article class="premium-reward-card"><span class="tag">First 1000</span><h3>Founding player rewards</h3><p>Reserve cosmetic badges, XP boosts, virtual coins, bonus play, and founder profile frames for the first 1000 signups.</p><a class="button primary" href="/landing/">Join Launch List</a></article>
          <article class="premium-reward-card"><span class="tag">Referrals</span><h3>Share and stack bonuses</h3><p>Referral links can unlock virtual bonus play, loyalty points, cosmetic wild cards, and social leaderboard status after backend approval.</p><button class="button" type="button" data-premium-referral>Generate Referral Copy</button></article>
          <article class="premium-reward-card"><span class="tag">Timed Quest</span><h3>Complete before the timer</h3><p>Use a visible countdown for “join, share, follow, play, invite” tasks. This static layer does not verify social accounts yet.</p><button class="button" type="button" data-premium-timer>Preview Time Limit</button></article>
        </div>
        <div class="premium-jackpot-grid">
          <article><b>Mini</b><span>Free spins + virtual badge</span></article>
          <article><b>Minor</b><span>Bonus play + wild token</span></article>
          <article><b>Major</b><span>Referral multiplier + VIP frame</span></article>
          <article><b>Mega</b><span>Founder pack access lane</span></article>
          <article><b>Grand</b><span>Top-tier virtual reward reveal</span></article>
        </div>
        <p class="premium-legal-note">Entertainment-only promotional framework. Rewards, spins, wilds, jackpot labels, XP, badges, bonus play, and virtual coins have no cash value and cannot be redeemed for money.</p>
      </div>
      <div class="premium-beacon-hub" aria-label="Local beacon alert text and maps framework">
        <div class="section-head">
          <h2>Beacon alert texts and local maps</h2>
          <p>Permission-based local promotion copy for Philadelphia and Cumberland County near laundry hubs, bookstores, and streetwear stores. No automatic SMS, location collection, or geofencing is activated in this static build.</p>
        </div>
        <div class="premium-beacon-grid">
          <article class="premium-beacon-card"><span class="tag">Laundry hub</span><h3>Near a wash spot</h3><p data-beacon-copy>Beacon: You’re near a laundry hub. Take a quick Lingo break, claim virtual bonus play, and send a referral before the timer ends.</p><a class="button primary" href="https://www.google.com/maps/search/laundry+near+Philadelphia+PA" target="_blank" rel="noopener">Philly Map</a><a class="button" href="https://www.google.com/maps/search/laundry+near+Cumberland+County+NJ" target="_blank" rel="noopener">Cumberland Map</a></article>
          <article class="premium-beacon-card"><span class="tag">Bookstore</span><h3>Near a book stop</h3><p data-beacon-copy>Beacon: You’re near a bookstore. Open the Lingo Legacy story world, join the first-1000 rewards list, and share your referral.</p><a class="button primary" href="https://www.google.com/maps/search/bookstore+near+Philadelphia+PA" target="_blank" rel="noopener">Philly Map</a><a class="button" href="https://www.google.com/maps/search/bookstore+near+Cumberland+County+NJ" target="_blank" rel="noopener">Cumberland Map</a></article>
          <article class="premium-beacon-card"><span class="tag">Streetwear</span><h3>Near a style shop</h3><p data-beacon-copy>Beacon: You’re near a streetwear store. Tap into Loyalty Lane, preview drops, and unlock virtual wild-card energy.</p><a class="button primary" href="https://www.google.com/maps/search/streetwear+store+near+Philadelphia+PA" target="_blank" rel="noopener">Philly Map</a><a class="button" href="https://www.google.com/maps/search/streetwear+store+near+Cumberland+County+NJ" target="_blank" rel="noopener">Cumberland Map</a></article>
        </div>
        <div class="premium-ai-static-grid">
          <article><span class="tag">AI copy</span><h3>Static prompt bank</h3><p>Generate social captions, SMS drafts, poster text, 30-second ad reads, and referral copy from approved brand-safe templates.</p><button class="button" type="button" data-premium-ai-copy>Generate AI Prompt</button></article>
          <article><span class="tag">Assets</span><h3>Studio assets + sound</h3><p>Use premium lights, burst animations, opt-in audio, store badges, map CTAs, and static banner cards across every entity.</p><button class="button" type="button" data-premium-burst>Trigger Studio Asset Burst</button></article>
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
    dock.querySelector('[data-premium-referral]')?.addEventListener('click', () => toast('Referral copy: Invite 3 friends, unlock virtual bonus play, and climb the founder board.'));
    dock.querySelector('[data-premium-timer]')?.addEventListener('click', () => toast('Timed quest preview: complete join, share, follow, and play steps before the countdown ends.'));
    dock.querySelector('[data-premium-ai-copy]')?.addEventListener('click', () => toast('AI prompt: Write a 30-second Philly/Cumberland Lingo Legacy promo with rewards, referrals, and no-cash-value copy.'));
  }

  function init() {
    ensureAurora();
    addStudioDock();
    enhanceControls();
    doc.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-sg-trigger]');
      if (trigger) burst(trigger.getAttribute('data-sg-trigger') || 'Studio burst');
    });
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();
