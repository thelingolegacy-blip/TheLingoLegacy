(() => {
  const doc = document;
  const win = window;
  const reduceMotion = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const path = win.location.pathname.replace(/\/+$/, '/') || '/';

  const worlds = [
    { match: /^\/$/, key: 'home', label: 'Main Casino Universe', title: 'The full Lingo casino studio is live', copy: 'A premium front door for games, sweepstakes-style entertainment, studio worlds, rewards, commerce, safety, and launch conversion.', cta: '/', alt: '/universe/' },
    { match: /casino|thats-my-lingo|sweepstakes|live-casino-studio/, key: 'casino', label: 'Casino Sweepstakes Floor', title: 'Entertainment-only casino game floor', copy: 'Virtual credits, game-show energy, reels, reward moments, compliance copy, and high-end visual pressure stay inside this casino world.', cta: '/casino/', alt: '/trust-compliance/' },
    { match: /auto-racing/, key: 'racing', label: 'Racing World', title: 'Neon racing universe', copy: 'Track cards, speed rails, vehicle drops, sponsor-ready frames, and arcade motion stay isolated to the racing route.', cta: '/auto-racing-universe/', alt: '/visual-showcase/' },
    { match: /rap-arena|spades-is-my-lingo|social-play/, key: 'rap-arena', label: 'Social Battle World', title: 'Rap, spades, and social play arena', copy: 'Battle cards, multiplayer framing, community loops, leaderboards, and stage-light visuals get a dedicated competitive identity.', cta: '/multiplayer-rap-arena/', alt: '/social-play/' },
    { match: /lingo-ai|integration-os|payload-matrix|master-interface|admin-command-center|economy-command-center/, key: 'ai', label: 'Command AI World', title: 'Operator command center', copy: 'AI, payloads, monitoring, master interfaces, and admin routes use a blue-green command aesthetic with production guardrails.', cta: '/lingo-ai/', alt: '/master-interface/' },
    { match: /loyalty|drop|tapstich|kottons-code|outer-crown|full-entity|apparel/, key: 'commerce', label: 'Commerce World', title: 'Founder drop and brand commerce lane', copy: 'Drops, apparel, founder packs, subscriptions, and brand expansions receive premium storefront framing without unsafe payment promises.', cta: '/drop/', alt: '/loyalty-lane-cycles/' },
    { match: /trust|monetization-safety|casino-config|casino-upgrade/, key: 'trust', label: 'Trust and Monetization World', title: 'Compliance-first monetization system', copy: 'Sweepstakes, payments, bonuses, subscriptions, and launch claims stay behind safety, approval, refund, and responsible-play guardrails.', cta: '/trust-compliance/', alt: '/monetization-safety/' },
    { match: /studio|visual|assets|universe|landing/, key: 'studio', label: 'Studio Production World', title: 'Premium studio production system', copy: 'Creative layouts, frames, visuals, motion, route hubs, and launch pages share a premium studio shell with per-world styling.', cta: '/studio-production/', alt: '/visual-showcase/' },
    { match: /loading/, key: 'loading', label: 'LoadingPage World', title: 'Star-gate loading universe', copy: 'Loading surfaces use an orbital identity for trailer moments, reveals, transitions, and launch staging.', cta: '/loading/', alt: '/universe/' },
  ];

  const world = worlds.find((item) => item.match.test(path)) || worlds[0];
  doc.documentElement.classList.add('studio-universe-os');

  function ready(fn) {
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  function setWorld() {
    doc.body.dataset.studioWorld = world.key;
    doc.body.dataset.studioWorldLabel = world.label;
  }

  function addAtmosphere() {
    if (doc.querySelector('.su-atmosphere')) return;
    const layer = doc.createElement('div');
    layer.className = 'su-atmosphere';
    layer.setAttribute('aria-hidden', 'true');
    doc.body.prepend(layer);
  }

  function toast(message) {
    let el = doc.querySelector('.su-toast');
    if (!el) {
      el = doc.createElement('div');
      el.className = 'su-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      doc.body.append(el);
    }
    el.textContent = message;
    el.classList.add('show');
    win.clearTimeout(el._suTimer);
    el._suTimer = win.setTimeout(() => el.classList.remove('show'), 1800);
  }

  let soundOn = false;
  function tone(kind = 'tap') {
    if (!soundOn) return;
    const AudioContext = win.AudioContext || win.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const motif = kind === 'reward' ? [392, 523.25, 659.25, 987.77] : kind === 'open' ? [329.63, 493.88, 659.25] : [261.63, 392];
    motif.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = index % 2 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + index * .052;
      gain.gain.setValueAtTime(.001, start);
      gain.gain.exponentialRampToValueAtTime(kind === 'reward' ? .058 : .03, start + .016);
      gain.gain.exponentialRampToValueAtTime(.001, start + .18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + .2);
    });
    win.setTimeout(() => ctx.close(), 650);
  }

  function ripple(event) {
    if (reduceMotion || !event.clientX) return;
    const el = doc.createElement('i');
    el.className = 'su-ripple';
    el.style.left = `${event.clientX}px`;
    el.style.top = `${event.clientY}px`;
    doc.body.append(el);
    win.setTimeout(() => el.remove(), 720);
  }

  function createRibbon() {
    if (doc.querySelector('[data-studio-world-ribbon]')) return;
    const ribbon = doc.createElement('section');
    ribbon.className = 'su-world-ribbon';
    ribbon.setAttribute('data-studio-world-ribbon', '');
    ribbon.innerHTML = `
      <div class="su-world-ribbon__inner">
        <div>
          <span class="su-kicker">${world.label}</span>
          <h2>${world.title}</h2>
          <p>${world.copy}</p>
          <div class="su-badges" aria-label="Production safeguards">
            <span>Individual world theme</span><span>No style bleed</span><span>Entertainment-only rewards</span><span>Opt-in sound</span>
          </div>
        </div>
        <div class="su-world-ribbon__actions">
          <a class="su-action" href="${world.cta}">Open This World</a>
          <a class="su-action su-action--ghost" href="${world.alt}">Related Surface</a>
          <button class="su-sound-toggle" type="button" data-su-sound>Sound Off</button>
        </div>
      </div>`;

    const main = doc.querySelector('main');
    const hero = doc.querySelector('.hero, .sg-hero');
    if (hero?.parentNode) hero.insertAdjacentElement('afterend', ribbon);
    else if (main?.firstElementChild) main.firstElementChild.insertAdjacentElement('afterend', ribbon);
    else (main || doc.body).append(ribbon);
  }

  function createWorldBuild() {
    if (doc.querySelector('[data-studio-world-build]')) return;
    const section = doc.createElement('section');
    section.className = 'su-section';
    section.setAttribute('data-studio-world-build', '');
    section.innerHTML = `
      <div class="su-section__head">
        <div>
          <span class="su-kicker">Final production command</span>
          <h2>Individual world build</h2>
        </div>
        <p>Each page gets its own visual direction, CTA stack, monetization lane, and motion identity while sharing one safe production foundation.</p>
      </div>
      <div class="su-stage">
        <div class="su-stage__rings" aria-hidden="true"></div>
        <div class="su-stage__copy">
          <span class="su-pill">${world.label}</span>
          <h2>${world.title}</h2>
          <p>${world.copy}</p>
          <div class="su-actions"><a class="su-action" href="${world.cta}">Enter World</a><a class="su-action su-action--ghost" href="/universe/">Universe Map</a></div>
        </div>
      </div>
      <div class="su-world-grid">
        <article class="su-world-card"><span class="su-pill">UX / UI</span><h3>Premium frame system</h3><p>Rounded glass panels, gold rims, neon accents, hover states, route-specific color tokens, and focus-safe controls make every surface feel finished.</p></article>
        <article class="su-world-card"><span class="su-pill">Motion / Sound</span><h3>Cinematic feedback</h3><p>Ambient world lighting, orbital rings, click ripples, reward tones, and reduced-motion fallbacks keep the experience premium without autoplay.</p></article>
        <article class="su-world-card"><span class="su-pill">Visuals</span><h3>World-specific identity</h3><p>Casino, racing, rap arena, AI command, commerce, trust, and studio routes receive isolated palettes and production storytelling.</p></article>
      </div>`;

    const footer = doc.querySelector('footer');
    if (footer?.parentNode) footer.parentNode.insertBefore(section, footer);
    else doc.body.append(section);
  }

  function createMoneySystem() {
    if (doc.querySelector('[data-studio-money-system]')) return;
    const section = doc.createElement('section');
    section.className = 'su-section';
    section.setAttribute('data-studio-money-system', '');
    section.innerHTML = `
      <div class="su-section__head">
        <div><span class="su-kicker">Casino sweepstakes monetizing</span><h2>Premium monetization floor</h2></div>
        <p>Built for conversion presentation now, with payment and sweepstakes claims kept behind approval, terms, and responsible-play controls.</p>
      </div>
      <div class="su-money-grid">
        <article class="su-money-card"><span class="su-pill">Founder offers</span><h3>Drop, membership, and VIP lanes</h3><p>Route high-intent visitors into founder packs, premium access, loyalty loops, and merch-style drops.</p><a class="su-action" href="/drop/">Open Drop</a></article>
        <article class="su-money-card"><span class="su-pill">Sweepstakes-safe</span><h3>Virtual entertainment framing</h3><p>Casino visuals use virtual rewards and no cash-value language until legal, payments, taxes, geofence, and rules are approved.</p><a class="su-action su-action--ghost" href="/trust-compliance/">Open Trust Core</a></article>
        <article class="su-money-card"><span class="su-pill">Launch channels</span><h3>Ads, surveys, TV, app stores</h3><p>Use the app, visual showcase, social play, and landing list as the manual promotion runway before scaling paid traffic.</p><a class="su-action" href="/landing/">Open Launch List</a></article>
      </div>
      <p class="su-sweepstakes-note">Entertainment-only notice: this site does not award cash prizes, does not process wagers, and does not enable real-money gambling from this static production layer.</p>`;
    const footer = doc.querySelector('footer');
    if (footer?.parentNode) footer.parentNode.insertBefore(section, footer);
    else doc.body.append(section);
  }

  function bind() {
    doc.querySelector('[data-su-sound]')?.addEventListener('click', (event) => {
      soundOn = !soundOn;
      event.currentTarget.textContent = soundOn ? 'Sound On' : 'Sound Off';
      toast(soundOn ? 'Premium studio sound enabled' : 'Premium studio sound disabled');
      tone('reward');
    });

    doc.addEventListener('click', (event) => {
      const target = event.target.closest('a, button, [role="button"]');
      if (!target) return;
      ripple(event);
      const label = (target.textContent || '').toLowerCase();
      tone(label.includes('drop') || label.includes('reward') || label.includes('vip') ? 'reward' : label.includes('open') || label.includes('enter') ? 'open' : 'tap');
    });
  }

  ready(() => {
    setWorld();
    addAtmosphere();
    createRibbon();
    createWorldBuild();
    createMoneySystem();
    bind();
  });
})();
