(function () {
  const LAUNCH = {
    live: true,
    headline: 'Drop 1–5 Launch Beacon is live',
    startAt: '2026-07-22T00:00:00-04:00',
    midnightRule: 'After initial sales begin from the first five entities, add one new entity every night at midnight.',
    drops: [
      { id: 1, name: 'That’s My Lingo™', lane: 'Game + XP + Daily Bonus', href: '/thats-my-lingo/', revenue: 'game access, digital packs, sponsor slots, subscriptions' },
      { id: 2, name: 'Kotton’s Code™', lane: 'Learning Adventure + Books', href: '/kottons-code-games/', revenue: 'books, read-along packs, sticker rewards, parent subscriptions' },
      { id: 3, name: 'Loyalty Lane Apparel', lane: 'Luxury Streetwear Drop', href: '/apparel/', revenue: 'limited drops, bundles, VIP closet memberships' },
      { id: 4, name: 'Loyalty Lane Cycles', lane: 'Community Loyalty Hub', href: '/loyalty-lane/', revenue: 'memberships, pickup scheduling, local sponsorships' },
      { id: 5, name: 'Legacy Zombies', lane: 'Survival Game Event', href: '/legacy-zombies/', revenue: 'battle passes, merch, event bundles, premium alerts' }
    ],
    queue: ['Shadow Noire', 'Obsidian Closet', 'Spades Is My Lingo', 'Lingo City', 'Tricia’s Escape', 'Doughboy Oasis', 'Bulldog Legacy Bridge'],
    ads: [
      ['Live Beacon Alert', 'Promote launch readiness, countdown, and Drop 1–5 availability.'],
      ['Upgrade Banner', 'Push VIP subscriptions, bundles, early access, and launch support.'],
      ['Game Countdown', 'Drive urgency for That’s My Lingo and Legacy Zombies events.'],
      ['Midnight Entity Drop', 'Train visitors to return every night for the next reveal.']
    ]
  };

  function moneyCtaHref() {
    return document.querySelector('a[href="/payments/"]') ? '/payments/' : 'mailto:dlingo@thelingolegacy.com?subject=Launch%20support';
  }

  function targetDate() {
    const configured = new Date(LAUNCH.startAt);
    if (configured > new Date()) return configured;
    const next = new Date();
    next.setHours(24, 0, 0, 0);
    return next;
  }

  const beacon = document.createElement('aside');
  beacon.className = 'launch-beacon';
  beacon.innerHTML = `<i class="launch-beacon-dot" aria-hidden="true"></i><div><strong>LIVE:</strong> <span>${LAUNCH.headline}</span></div><a href="${moneyCtaHref()}">Activate sale</a>`;
  document.body.appendChild(beacon);

  const command = document.createElement('section');
  command.className = 'launch-command';
  command.innerHTML = `
    <p class="eyebrow">Launch command active</p>
    <h2>Drop 1–5 is staged for monetization.</h2>
    <p>Beacon alerts, ad banners, countdowns, games, upgrade prompts, subscriptions, and the midnight entity expansion queue are now visible on-site. External ad buying still needs real ad-account setup outside the codebase.</p>
    <div class="launch-status-row">
      <div class="launch-status"><strong>5</strong><span>initial entities</span></div>
      <div class="launch-status"><strong>1/night</strong><span>midnight expansion rule</span></div>
      <div class="launch-status"><strong>Active</strong><span>promo banner system</span></div>
      <div class="launch-status"><strong>Opt-in</strong><span>music + alerts</span></div>
    </div>
    <div class="launch-countdown" aria-label="Launch countdown"><div><strong data-dd>00</strong><span>days</span></div><div><strong data-hh>00</strong><span>hours</span></div><div><strong data-mm>00</strong><span>mins</span></div><div><strong data-ss>00</strong><span>secs</span></div></div>
    <div class="launch-drops">${LAUNCH.drops.map((drop) => `<article class="launch-drop" data-priority="${drop.id}"><small>Drop ${drop.id}</small><h3>${drop.name}</h3><p>${drop.lane}</p><p><strong>Monetize:</strong> ${drop.revenue}</p><a href="${drop.href}">Open entity</a></article>`).join('')}</div>
    <section class="launch-upgrade"><h3>Upgrade + subscription ladder</h3><p>Start with founder support and paid drops, then graduate buyers into recurring access as products prove demand.</p><div class="launch-tier-row"><div class="launch-tier"><strong>Starter</strong><br><span>Waitlist, launch alerts, free previews</span></div><div class="launch-tier"><strong>VIP</strong><br><span>Early drops, bonus content, private rewards</span></div><div class="launch-tier"><strong>Founder</strong><br><span>Premium support, bundles, sponsor visibility</span></div></div><a href="${moneyCtaHref()}">Start monetizing</a></section>
    <section class="launch-ad-grid">${LAUNCH.ads.map((ad) => `<article class="launch-ad"><h3>${ad[0]}</h3><p>${ad[1]}</p><a href="${moneyCtaHref()}">Use banner</a></article>`).join('')}</section>
    <section class="launch-midnight"><h3>Midnight entity queue</h3><p>${LAUNCH.midnightRule}</p><ol>${LAUNCH.queue.map((name, index) => `<li><strong>Night ${index + 1}:</strong> ${name}</li>`).join('')}</ol></section>
  `;
  const main = document.querySelector('main') || document.body;
  main.appendChild(command);

  function tick() {
    const diff = Math.max(0, targetDate() - new Date());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    command.querySelector('[data-dd]').textContent = String(days).padStart(2, '0');
    command.querySelector('[data-hh]').textContent = String(hours).padStart(2, '0');
    command.querySelector('[data-mm]').textContent = String(mins).padStart(2, '0');
    command.querySelector('[data-ss]').textContent = String(secs).padStart(2, '0');
  }
  tick();
  setInterval(tick, 1000);

  window.LingoLegacyLaunch = LAUNCH;
}());
