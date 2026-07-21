import Link from 'next/link';
import type { SiteSection } from '@/lib/site-os';

export default function SectionScaffold({ section }: { section: SiteSection }) {
  return (
    <section className="page-shell shell module-shell">
      <p className="eyebrow">{section.kicker}</p>
      <div className="section-command-hero">
        <div>
          <h1>{section.title}</h1>
          <p className="hero-copy">{section.summary}</p>
          <div className="cta-row">
            <Link className="btn primary" href="/">Return to HQ</Link>
            <Link className="btn secondary" href="/ask-lingo">Ask Lingo Route</Link>
          </div>
        </div>
        <aside className="system-card command-card" aria-label="Current sprint">
          <p className="eyebrow">Active Sprint</p>
          <h2>{section.sprint}</h2>
          <p>Scaffolded for content, assets, data connections, and interaction buildout.</p>
        </aside>
      </div>

      <div className="ops-grid">
        <article className="system-card">
          <h2>Guided Links</h2>
          <div className="pill-row">{section.guidedLinks.map((item) => <span key={item}>{item}</span>)}</div>
        </article>
        <article className="system-card">
          <h2>Modules</h2>
          <div className="module-list">{section.modules.map((item) => <span key={item}>{item}</span>)}</div>
        </article>
        <article className="system-card">
          <h2>Entities</h2>
          <div className="pill-row completion-grid">{section.entities.map((item) => <span key={item}>{item}</span>)}</div>
        </article>
      </div>
    </section>
  );
}
