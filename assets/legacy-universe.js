(function () {
  const identities = [
    { label: 'Games universe', glyph: 'G', href: '/ecosystem/', universe: 'games' },
    { label: 'Music universe', glyph: 'M', href: '/music/', universe: 'music' },
    { label: 'Commerce universe', glyph: 'S', href: '/apparel/', universe: 'commerce' },
    { label: 'Community universe', glyph: 'C', href: '/support/', universe: 'community' }
  ];

  document.body.classList.add('legacy-universe-ready');

  const rail = document.createElement('nav');
  rail.className = 'legacy-cosmic-rail';
  rail.setAttribute('aria-label', 'Lingo Legacy identity universes');
  rail.innerHTML = identities.map((item) => `<a class="legacy-orb" href="${item.href}" data-legacy-target="${item.universe}" aria-label="${item.label}">${item.glyph}</a>`).join('');
  document.body.appendChild(rail);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'legacy-sound-toggle';
  toggle.setAttribute('aria-pressed', 'false');
  toggle.textContent = 'Music: off';
  document.body.appendChild(toggle);

  let audioContext;
  let masterGain;
  let masterConnected = false;
  let timer;
  let step = 0;
  const notes = [130.81, 164.81, 196, 246.94, 293.66, 246.94, 196, 164.81];

  function startMusic() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) {
      toggle.textContent = 'Music unavailable';
      toggle.setAttribute('aria-pressed', 'false');
      return;
    }
    audioContext = audioContext || new AudioCtor();
    if (audioContext.state === 'suspended') audioContext.resume();
    masterGain = masterGain || audioContext.createGain();
    masterGain.gain.value = 0.045;
    if (!masterConnected) {
      masterGain.connect(audioContext.destination);
      window.__legacyMusicGain = masterGain;
      masterConnected = true;
    }
    timer = window.setInterval(() => {
      const now = audioContext.currentTime;
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = step % 4 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = notes[step % notes.length];
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.72);
      osc.connect(gain).connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.76);
      step += 1;
    }, 420);
  }

  function stopMusic() {
    window.clearInterval(timer);
    timer = null;
  }

  toggle.addEventListener('click', () => {
    const enabled = toggle.getAttribute('aria-pressed') !== 'true';
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.textContent = enabled ? 'Music: on' : 'Music: off';
    if (enabled) startMusic(); else stopMusic();
  });

  rail.addEventListener('pointerover', (event) => {
    const target = event.target.closest('[data-legacy-target]');
    if (target) document.body.dataset.legacyUniverse = target.dataset.legacyTarget;
  });

  const revealTargets = [...document.querySelectorAll('main > *, section, article, .card, .panel, li')].slice(0, 160);
  revealTargets.forEach((node) => node.classList.add('legacy-reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        const text = entry.target.textContent.toLowerCase();
        if (text.includes('music') || text.includes('zavione')) document.body.dataset.legacyUniverse = 'music';
        else if (text.includes('game') || text.includes('kotton') || text.includes('spades')) document.body.dataset.legacyUniverse = 'games';
        else if (text.includes('apparel') || text.includes('shop') || text.includes('pay')) document.body.dataset.legacyUniverse = 'commerce';
        else if (text.includes('support') || text.includes('community') || text.includes('partner')) document.body.dataset.legacyUniverse = 'community';
      });
    }, { threshold: 0.18 });
    revealTargets.forEach((node) => io.observe(node));
  } else {
    revealTargets.forEach((node) => node.classList.add('is-visible'));
  }
}());
