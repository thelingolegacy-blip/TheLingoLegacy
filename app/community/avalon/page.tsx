const avalon = ['Mission', 'Programs', 'Volunteer forms', 'Donation information', 'Events', 'Community impact', 'Partner opportunities'];

export default function AvalonPage() {
  return <section className="page-shell shell"><p className="eyebrow">Phase 16 Nonprofit / Avalon Integration</p><h1>Iconic House of Avalon</h1><p className="hero-copy">Community impact section for mission, programs, volunteers, donations, events, and partnerships.</p><div className="ops-grid">{avalon.map((item) => <article className="system-card" key={item}><h3>{item}</h3><p>Ready for content, forms, campaign connections, and impact reporting.</p></article>)}</div></section>;
}
