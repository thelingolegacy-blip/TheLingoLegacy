const items = ['Takedown request intake', 'Counter notice intake', 'Rights owner contact', 'Content review queue'];

export default function Page() {
  return (
    <section className="page-shell shell">
      <p className="eyebrow">Legal Foundation</p>
      <h1>DMCA Policy</h1>
      <p className="hero-copy">Operational scaffold for dmca policy. Final policy language should be reviewed by counsel before public launch.</p>
      <div className="ops-grid">{items.map((item) => <article className="system-card" key={item}><h3>{item}</h3><p>Connected to admin review, account preferences, support routing, and launch readiness checks.</p></article>)}</div>
    </section>
  );
}
