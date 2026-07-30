(() => {
  const root = document.querySelector('main') || document.body;
  if (!root || document.querySelector('.studio-production-assets')) return;

  const surface = document.createElement('section');
  surface.className = 'studio-production-assets';
  surface.id = 'studio-production-assets';
  surface.innerHTML = `
    <div class="studio-production-assets__head">
      <div>
        <span class="studio-production-assets__eyebrow">Studio build production layer</span>
        <h2>Assets, motion, sound, CSS, and monetization lanes</h2>
        <p class="studio-production-assets__lead">A shared production layer now highlights the visual asset stack, user-triggered sound motifs, motion-safe UI feedback, and monetization-ready routes without enabling wagering or auto-playing audio.</p>
      </div>
      <div class="studio-production-assets__meter" aria-label="Studio production status"><span>Release status</span><b>Ready pass</b></div>
    </div>
    <div class="studio-production-assets__grid">
      <article class="studio-production-assets__card"><span class="studio-production-assets__tag">Assets</span><h3>Studio asset rails</h3><p>Hero plates, brand marks, reward symbols, product tiles, and story-world art can plug into one visible production system.</p></article>
      <article class="studio-production-assets__card"><span class="studio-production-assets__tag">UI/UX</span><h3>Conversion-first flow</h3><p>Primary actions stay above the fold while secondary studio, rules, and request paths remain easy to reach.</p></article>
      <article class="studio-production-assets__card"><span class="studio-production-assets__tag">Animation + sound</span><h3>Opt-in feedback</h3><p>Motion uses CSS-safe glow, lift, and burst patterns; sound starts only after a user taps the audio control.</p></article>
      <article class="studio-production-assets__card"><span class="studio-production-assets__tag">Monetizing</span><h3>Safe revenue lanes</h3><p>Merch drops, sponsor moments, cosmetic bundles, and lead capture stay separate from odds, entries, or gameplay payouts.</p></article>
    </div>
    <div class="studio-production-assets__actions">
      <button class="studio-production-assets__button studio-production-assets__button--primary" type="button" data-spa-sound="chime">Test studio chime</button>
      <button class="studio-production-assets__button" type="button" data-spa-burst>Trigger asset burst</button>
      <a class="studio-production-assets__button" href="mailto:hello@thelingolegacy.com?subject=Studio%20production%20asset%20request">Request asset package</a>
    </div>
  `;

  const footer = document.querySelector('footer');
  if (footer && footer.parentElement) footer.parentElement.insertBefore(surface, footer);
  else root.append(surface);

  const toast = document.createElement('div');
  toast.className = 'studio-production-assets__toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.append(toast);

  function show(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(show.t);
    show.t = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function track(name, data = {}) {
    try { if (typeof window.va === 'function') window.va('event', { name, data }); } catch {}
  }

  function burst(label = 'Studio asset burst') {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      show(`${label}: reduced motion is active.`);
      return;
    }
    for (let i = 0; i < 18; i += 1) {
      const dot = document.createElement('i');
      dot.className = 'spa-particle';
      dot.style.left = `${42 + Math.random() * 16}%`;
      dot.style.top = `${48 + Math.random() * 10}%`;
      dot.style.color = i % 2 ? 'var(--spa-cyan)' : 'var(--spa-gold)';
      document.body.append(dot);
      requestAnimationFrame(() => {
        dot.style.transform = `translate(${Math.random() * 240 - 120}px, ${Math.random() * -160 - 20}px) scale(.2)`;
        dot.style.opacity = '0';
      });
      setTimeout(() => dot.remove(), 950);
    }
    show(label);
    track('studio_asset_burst');
  }

  function playMotif() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return show('Audio API unavailable in this browser.');
    const ctx = new AudioContext();
    [392, 523.25, 659.25, 783.99].forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = index % 2 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + index * .08;
      gain.gain.setValueAtTime(.001, start);
      gain.gain.exponentialRampToValueAtTime(.045, start + .018);
      gain.gain.exponentialRampToValueAtTime(.001, start + .26);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + .3);
    });
    setTimeout(() => ctx.close(), 1000);
    show('Studio chime tested.');
    track('studio_chime_tested');
  }

  surface.querySelector('[data-spa-sound]')?.addEventListener('click', playMotif);
  surface.querySelector('[data-spa-burst]')?.addEventListener('click', () => burst());
})();
