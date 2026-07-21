(function () {
  const ENTITIES = {
    hq: {
      name: 'The Lingo Legacy HQ',
      personality: 'Executive • Premium • Cinematic • Industrial Noir',
      palette: ['#f7c948', '#62f7ff', '#1f2937'],
      welcome: 'CEO systems online. Welcome to the Lingo Legacy command center.',
      cta: ['Open ecosystem map', '/ecosystem/'],
      notification: ['HQ Status Dashboard', 'Ecosystem map, launch phases, and executive CTAs are ready.']
    },
    thatsMyLingo: {
      name: 'That’s My Lingo™',
      personality: 'Vegas meets Mobile Gaming',
      palette: ['#ffd700', '#ff3df2', '#19d3ff'],
      welcome: 'Spin the culture wheel. Your daily bonus is ready.',
      cta: ['Play the flagship world', '/thats-my-lingo/'],
      notification: ['Achievement Unlocked', 'Daily Bonus, Mega Win, Lucky Spin, and XP moments are queued.']
    },
    kottonsCode: {
      name: 'Kotton’s Code™',
      personality: 'Magical Learning Adventure',
      palette: ['#8ee7ff', '#ffdb70', '#9cffb7'],
      welcome: 'Storybook portal open. Collect stars as you learn.',
      cta: ['Enter Kotton’s Code', '/kottons-code-games/'],
      notification: ['Sticker Reward', 'Read Along, character voice, and hidden collectible prompts are ready.']
    },
    apparel: {
      name: 'Loyalty Lane Apparel',
      personality: 'Luxury Streetwear',
      palette: ['#f6c65b', '#ffffff', '#111827'],
      welcome: 'Editorial mode active. Build the outfit, own the lane.',
      cta: ['View apparel world', '/apparel/'],
      notification: ['Limited Edition Drop', 'Outfit builder, virtual closet, and size assistant concepts are staged.']
    },
    cycles: {
      name: 'Loyalty Lane Cycles',
      personality: 'Modern Community Hub',
      palette: ['#5dff9f', '#62f7ff', '#f7c948'],
      welcome: 'Neighborhood hub active. Rewards and pickup flows are ready.',
      cta: ['Open Loyalty Lane', '/loyalty-lane/'],
      notification: ['Community Milestone', 'Rewards, QR scanner, pickup scheduling, and washer availability modules are mapped.']
    },
    shadowNoire: {
      name: 'Shadow Noire',
      personality: 'Neo Noir Detective',
      palette: ['#9ca3af', '#60a5fa', '#111827'],
      welcome: 'Case file opened. Follow the clues through the rain.',
      cta: ['Review clues', '/ecosystem/'],
      notification: ['Evidence Added', 'Evidence board, hidden clues, and crime map concepts are staged.']
    },
    legacyZombies: {
      name: 'Legacy Zombies',
      personality: 'Apocalyptic Survival',
      palette: ['#a3e635', '#ef4444', '#334155'],
      welcome: 'Safe zone signal found. Survival timer has started.',
      cta: ['Enter survival world', '/legacy-zombies/'],
      notification: ['Safe Zone Alert', 'Infection tracker, countdown, and radio-static alerts are mapped.']
    },
    obsidianCloset: {
      name: 'Obsidian Closet',
      personality: 'Luxury Interior Design',
      palette: ['#d8b4fe', '#f8fafc', '#111827'],
      welcome: 'Luxury room visualizer ready. Reveal the before and after.',
      cta: ['Open design concept', '/ecosystem/'],
      notification: ['Gallery Updated', 'Room visualizer, before/after slider, and luxury gallery concepts are staged.']
    }
  };

  const route = location.pathname.toLowerCase();
  const entityKey = route.includes('thats-my-lingo') || route.includes('thatsmylingo') ? 'thatsMyLingo'
    : route.includes('kotton') ? 'kottonsCode'
    : route.includes('apparel') ? 'apparel'
    : route.includes('loyalty-lane') || route.includes('loyaltylane') ? 'cycles'
    : route.includes('shadow') ? 'shadowNoire'
    : route.includes('legacy-zombies') ? 'legacyZombies'
    : route.includes('obsidian') ? 'obsidianCloset'
    : 'hq';
  const entity = ENTITIES[entityKey];
  const tmlMediaAssets = { images: [], audio: [], video: [] };
  let uploadedSoundtrack;

  document.documentElement.style.setProperty('--entity-primary', entity.palette[0]);
  document.documentElement.style.setProperty('--entity-secondary', entity.palette[1]);
  document.documentElement.style.setProperty('--entity-accent', entity.palette[2]);
  document.body.dataset.entityExperience = entityKey;

  const loader = document.createElement('div');
  loader.className = 'entity-loader';
  loader.innerHTML = `<div class="entity-loader-card"><div class="entity-loader-ring"></div><div class="entity-loader-title">${entity.name}</div><div class="entity-loader-subtitle">Loading ${entity.personality}</div></div>`;
  document.body.prepend(loader);
  window.setTimeout(() => loader.classList.add('is-done'), 650);

  const progress = document.createElement('div');
  progress.className = 'entity-scroll-progress';
  document.body.appendChild(progress);
  const updateProgress = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progress.style.width = `${Math.min(100, (scrollY / max) * 100)}%`;
  };
  addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  const welcome = document.createElement('aside');
  welcome.className = 'entity-welcome';
  welcome.innerHTML = `<strong>${entity.name}</strong><small>${entity.welcome}</small>`;
  document.body.appendChild(welcome);
  setTimeout(() => welcome.classList.add('is-visible'), 850);
  setTimeout(() => welcome.classList.remove('is-visible'), 5600);

  const toastStack = document.createElement('div');
  toastStack.className = 'entity-toast-stack';
  document.body.appendChild(toastStack);
  const toastQueue = [];
  function notify(title, message, actionText, actionHref) {
    toastQueue.push({ title, message, actionText, actionHref });
    if (toastStack.children.length < 2) showNextToast();
  }
  function showNextToast() {
    if (!toastQueue.length || toastStack.children.length >= 2) return;
    const item = toastQueue.shift();
    const toast = document.createElement('div');
    toast.className = 'entity-toast';
    toast.innerHTML = `<strong>${item.title}</strong><span>${item.message}</span>${item.actionText ? `<br><a class="entity-notification-action" href="${item.actionHref}">${item.actionText}</a>` : ''}`;
    toastStack.appendChild(toast);
    setTimeout(() => { toast.remove(); showNextToast(); }, 6200);
  }

  const menu = document.createElement('nav');
  menu.className = 'entity-action-menu';
  menu.setAttribute('aria-label', 'Entity action menu');
  menu.innerHTML = `<button class="entity-action-toggle" type="button" aria-expanded="false">Actions</button><div class="entity-action-list"><a class="entity-action-button" href="${entity.cta[1]}">${entity.cta[0]}</a><a class="entity-action-button" href="/payments/">Support</a><a class="entity-action-button" href="/waitlist/">Waitlist</a><button class="entity-action-button" type="button" data-entity-music>Music: off</button><button class="entity-action-button" type="button" data-entity-notify>Notify</button><button class="entity-action-button" type="button" data-entity-a11y>Access</button><button class="entity-action-button" type="button" data-entity-theme>Theme</button></div>`;
  document.body.appendChild(menu);
  const toggle = menu.querySelector('.entity-action-toggle');
  toggle.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  menu.querySelector('[data-entity-notify]').addEventListener('click', () => notify(entity.notification[0], entity.notification[1], entity.cta[0], entity.cta[1]));
  menu.querySelector('[data-entity-theme]').addEventListener('click', () => document.body.classList.toggle('entity-theme-light'));

  const musicButton = menu.querySelector('[data-entity-music]');
  let entityMusicTimer;
  let entityMusicContext;
  let entityMusicGain;
  let entityMusicConnected = false;
  let entityMusicStep = 0;
  let entityMusicVolume = .045;
  const entityNotes = entityKey === 'thatsMyLingo' ? [261.63, 329.63, 392, 523.25] : entityKey === 'kottonsCode' ? [392, 440, 523.25, 659.25] : [130.81, 164.81, 196, 246.94, 293.66, 246.94, 196, 164.81];

  function startEntityMusic() {
    const legacyToggle = document.querySelector('.legacy-sound-toggle, .sound');
    if (tmlMediaAssets.audio.length) {
      uploadedSoundtrack = uploadedSoundtrack || new Audio(tmlMediaAssets.audio[0].url);
      uploadedSoundtrack.loop = true;
      uploadedSoundtrack.volume = Math.max(0.01, entityMusicVolume);
      uploadedSoundtrack.play().then(() => {
        musicButton.textContent = 'Music: on';
      }).catch(() => {
        musicButton.textContent = 'Tap music again';
      });
      return;
    }
    if (legacyToggle && legacyToggle.getAttribute('aria-pressed') !== 'true') {
      legacyToggle.click();
      musicButton.textContent = 'Music: on';
      return;
    }
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) {
      musicButton.textContent = 'Music unavailable';
      return;
    }
    entityMusicContext = entityMusicContext || new AudioCtor();
    if (entityMusicContext.state === 'suspended') entityMusicContext.resume();
    entityMusicGain = entityMusicGain || entityMusicContext.createGain();
    entityMusicGain.gain.value = entityMusicVolume;
    if (!entityMusicConnected) {
      entityMusicGain.connect(entityMusicContext.destination);
      window.__entityMusicGain = entityMusicGain;
      entityMusicConnected = true;
    }
    if (entityMusicTimer) return;
    entityMusicTimer = setInterval(() => {
      const now = entityMusicContext.currentTime;
      const osc = entityMusicContext.createOscillator();
      const gain = entityMusicContext.createGain();
      osc.type = entityKey === 'shadowNoire' ? 'sawtooth' : 'triangle';
      osc.frequency.value = entityNotes[entityMusicStep++ % entityNotes.length];
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(.18, now + .03);
      gain.gain.exponentialRampToValueAtTime(.001, now + .7);
      osc.connect(gain).connect(entityMusicGain);
      osc.start(now);
      osc.stop(now + .72);
    }, entityKey === 'thatsMyLingo' ? 330 : 430);
    musicButton.textContent = 'Music: on';
  }

  function stopEntityMusic() {
    if (uploadedSoundtrack) uploadedSoundtrack.pause();
    const legacyToggle = document.querySelector('.legacy-sound-toggle, .sound');
    if (legacyToggle && legacyToggle.getAttribute('aria-pressed') === 'true') legacyToggle.click();
    clearInterval(entityMusicTimer);
    entityMusicTimer = null;
    musicButton.textContent = 'Music: off';
  }

  musicButton.addEventListener('click', () => {
    const legacyToggle = document.querySelector('.legacy-sound-toggle, .sound');
    const legacyOn = legacyToggle && legacyToggle.getAttribute('aria-pressed') === 'true';
    const uploadedOn = uploadedSoundtrack && !uploadedSoundtrack.paused;
    if (entityMusicTimer || legacyOn || uploadedOn) stopEntityMusic(); else startEntityMusic();
  });

  const panel = document.createElement('section');
  panel.className = 'entity-accessibility-panel';
  panel.setAttribute('aria-label', 'Accessibility controls');
  panel.innerHTML = `<strong>Accessibility</strong><button type="button" data-large>Large text</button><button type="button" data-contrast>High contrast</button><button type="button" data-motion>Reduce motion</button><label>Music volume<input type="range" min="0" max="100" value="45" data-music-volume></label><label>Effects volume<input type="range" min="0" max="100" value="60" data-effects-volume></label>`;
  document.body.appendChild(panel);
  menu.querySelector('[data-entity-a11y]').addEventListener('click', () => panel.classList.toggle('is-open'));
  panel.querySelector('[data-large]').addEventListener('click', () => document.body.classList.toggle('entity-large-text'));
  panel.querySelector('[data-contrast]').addEventListener('click', () => document.body.classList.toggle('entity-high-contrast'));
  panel.querySelector('[data-motion]').addEventListener('click', () => document.body.classList.toggle('entity-reduce-motion'));

  let audioContext;
  let effectsVolume = .6;
  panel.querySelector('[data-effects-volume]').addEventListener('input', (event) => { effectsVolume = Number(event.target.value) / 100; });
  panel.querySelector('[data-music-volume]').addEventListener('input', (event) => {
    entityMusicVolume = Number(event.target.value) / 1000;
    const legacyGain = window.__legacyMusicGain;
    if (legacyGain) legacyGain.gain.value = entityMusicVolume;
    if (entityMusicGain) entityMusicGain.gain.value = entityMusicVolume;
    if (uploadedSoundtrack) uploadedSoundtrack.volume = Math.max(0.01, entityMusicVolume);
  });

  function blip(freq = 420) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor || effectsVolume <= 0) return;
    audioContext = audioContext || new AudioCtor();
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(effectsVolume * .045, now + .02);
    gain.gain.exponentialRampToValueAtTime(.001, now + .18);
    osc.connect(gain).connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + .2);
  }
  document.addEventListener('pointerover', (event) => { if (event.target.closest('a,button')) blip(520); }, { passive: true });
  document.addEventListener('click', (event) => { if (event.target.closest('a,button')) blip(720); }, { passive: true });

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function readableAssetName(asset) {
    return (asset.pathname || '')
      .split('/')
      .pop()
      .replace(/^\d+-/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\.[^.]+$/, '')
      .trim() || 'Lingo Legacy asset';
  }

  function renderUploadedAssets(assets) {
    const images = assets.filter((asset) => asset.kind === 'image').slice(0, 12);
    const videos = assets.filter((asset) => asset.kind === 'video').slice(0, 2);
    const audio = assets.filter((asset) => asset.kind === 'audio').slice(0, 4);

    tmlMediaAssets.images = images;
    tmlMediaAssets.video = videos;
    tmlMediaAssets.audio = audio;
    if (!images.length && !videos.length && !audio.length) return;

    const section = document.createElement('section');
    section.className = 'entity-asset-stage';
    section.innerHTML = `
      <div class="entity-asset-stage-head">
        <p>Phone-ready content files</p>
        <h2>${entity.name} assets are live</h2>
        <span>${images.length} images · ${videos.length} videos · ${audio.length} sounds</span>
      </div>
      ${images.length ? `<div class="entity-asset-grid">${images.map((asset, index) => { const label = escapeHtml(readableAssetName(asset)); const url = escapeHtml(asset.url); return `<figure class="entity-asset-card"><img src="${url}" alt="${label}" loading="lazy" decoding="async" ${index === 0 ? 'fetchpriority="high"' : ''}><figcaption>${label}</figcaption></figure>`; }).join('')}</div>` : ''}
      ${videos.length ? `<div class="entity-asset-video-row">${videos.map((asset) => `<video controls playsinline preload="metadata" src="${escapeHtml(asset.url)}"></video>`).join('')}</div>` : ''}
      ${audio.length ? `<div class="entity-asset-audio-row">${audio.map((asset) => `<audio controls preload="metadata" src="${escapeHtml(asset.url)}"></audio>`).join('')}</div>` : ''}
    `;

    const main = document.querySelector('main') || document.body;
    main.appendChild(section);
    if (audio.length) musicButton.textContent = 'Music: off';
  }

  function loadUploadedAssets() {
    fetch('/api/assets', { headers: { accept: 'application/json' } })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => renderUploadedAssets((payload && payload.assets) || []))
      .catch(() => {});
  }

  loadUploadedAssets();

  const cta = document.createElement('section');
  cta.className = 'entity-cta-panel';
  cta.innerHTML = `<div><h2>${entity.name}: next mission</h2><p>${entity.personality}. Dynamic CTAs, achievements, analytics hooks, and CMS-ready content blocks share this reusable layer.</p></div><a href="${entity.cta[1]}">${entity.cta[0]}</a>`;
  const main = document.querySelector('main') || document.body;
  main.appendChild(cta);

  const footer = document.createElement('div');
  footer.className = 'entity-footer-secret';
  footer.innerHTML = `Entity Experience System active. <button type="button">Unlock Easter egg</button>`;
  main.appendChild(footer);
  footer.querySelector('button').addEventListener('click', () => notify('Easter Egg Unlocked', `${entity.name} hidden portal discovered.`, entity.cta[0], entity.cta[1]));

  notify(entity.notification[0], entity.notification[1], entity.cta[0], entity.cta[1]);
}());
