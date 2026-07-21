const items = ['Multiple languages', 'Regional stores', 'International events', 'Global communities'];

export default function Page() {
  return <section className="page-shell shell"><p className="eyebrow">Phase Infrastructure</p><h1>Global Expansion Ready</h1><p className="hero-copy">Production-ready scaffold for global expansion ready.</p><div className="ops-grid">{items.map((item) => <article className="system-card" key={item}><h3>{item}</h3><p>Connected to HQ, Lingo ID, rewards, admin operations, analytics, and launch workflows.</p></article>)}</div></section>;
}
