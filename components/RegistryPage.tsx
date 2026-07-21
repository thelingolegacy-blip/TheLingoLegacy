import Link from 'next/link';

export default function RegistryPage({
  kicker,
  title,
  summary,
  items,
}: {
  kicker: string;
  title: string;
  summary: string;
  items: readonly (readonly [string, string])[];
}) {
  return (
    <section className="page-shell shell module-shell">
      <p className="eyebrow">{kicker}</p>
      <div className="section-command-hero">
        <div>
          <h1>{title}</h1>
          <p className="hero-copy">{summary}</p>
          <div className="cta-row">
            <Link className="btn primary" href="/">Return to HQ</Link>
            <Link className="btn secondary" href="/ask-lingo">Ask Lingo Route</Link>
          </div>
        </div>
        <aside className="system-card command-card">
          <p className="eyebrow">Registry State</p>
          <h2>Scaffolded</h2>
          <p>These are implementation slots and build contracts. They do not claim final creative assets, live data, or production services exist yet.</p>
        </aside>
      </div>
      <div className="ops-grid">
        {items.map(([name, description]) => (
          <article className="system-card" key={name}>
            <h2>{name}</h2>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
