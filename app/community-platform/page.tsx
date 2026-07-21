const items = ['Profiles', 'Groups', 'Events', 'Challenges', 'Leaderboards', 'Guidelines', 'Reporting', 'Moderation tools', 'Privacy controls'];

export default function Page() {
  return <section className="page-shell shell"><p className="eyebrow">Phase Infrastructure</p><h1>Community Platform</h1><p className="hero-copy">Production-ready scaffold for community platform.</p><div className="ops-grid">{items.map((item) => <article className="system-card" key={item}><h3>{item}</h3><p>Connected to HQ, Lingo ID, rewards, admin operations, analytics, and launch workflows.</p></article>)}</div></section>;
}
