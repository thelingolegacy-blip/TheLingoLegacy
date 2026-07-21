import Link from 'next/link';
import type { SiteSection } from '@/lib/site-os';

function Panel({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="system-card">
      <h2>{title}</h2>
      <div className="module-list">{items.map((item) => <span key={item}>{item}</span>)}</div>
    </article>
  );
}

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
          <p>Scaffolded for content, assets, data connections, and interaction buildout. Live auth, payments, media playback, and persistence are intentionally not mocked.</p>
        </aside>
      </div>

      <div className="ops-grid expanded-grid">
        <Panel title="Guided Links" items={section.guidedLinks} />
        <Panel title="Modules" items={section.modules} />
        <Panel title="Interactions" items={section.interactions} />
        <Panel title="Asset Slots" items={section.assets} />
        <article className="system-card wide-card">
          <h2>Entities</h2>
          <div className="pill-row completion-grid">{section.entities.map((item) => <span key={item}>{item}</span>)}</div>
        </article>
      </div>
    </section>
  );
}
