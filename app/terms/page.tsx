const items = ['Website use', 'Lingo ID accounts', 'Game user agreements', 'Rewards rules', 'Virtual currency terms'];

export default function Page() {
  return (
    <section className="page-shell shell">
      <p className="eyebrow">Legal Foundation</p>
      <h1>Terms of Service</h1>
      <p className="hero-copy">Operational scaffold for terms of service. Final policy language should be reviewed by counsel before public launch.</p>
      <div className="ops-grid">{items.map((item) => <article className="system-card" key={item}><h3>{item}</h3><p>Connected to admin review, account preferences, support routing, and launch readiness checks.</p></article>)}</div>
    </section>
  );
}
