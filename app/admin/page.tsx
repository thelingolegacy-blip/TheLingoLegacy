const adminModules = ['Launch Calendar', 'Countdown Manager', 'Promo Generator', 'User Analytics', 'Survey Results', 'Orders', 'Game Metrics', 'Content Uploads', 'Legal Updates', 'Asset Manager'];

export default function AdminPage() {
  return (
    <section className="page-shell shell">
      <p className="eyebrow">Internal Dashboard Blueprint</p>
      <h1>Lingo Legacy Admin HQ</h1>
      <p className="hero-copy">Command center scaffold for launches, content, assets, legal updates, analytics, orders, surveys, and publishing workflows.</p>
      <div className="ops-grid">{adminModules.map((module) => <article className="system-card" key={module}><h3>{module}</h3><p>Review, approve, schedule, publish, archive, and track results.</p></article>)}</div>
    </section>
  );
}
