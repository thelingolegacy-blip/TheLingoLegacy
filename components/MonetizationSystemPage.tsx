import Link from 'next/link';
import type { MonetizationSystem } from '@/lib/monetization';
import { activationChecklist, monetizationAudit } from '@/lib/monetization';

function PillList({ items }: { items: readonly string[] }) {
  return <div className="pill-row completion-grid">{items.map((item) => <span key={item}>{item}</span>)}</div>;
}

export default function MonetizationSystemPage({ system }: { system: MonetizationSystem }) {
  return (
    <section className="page-shell shell monetization-shell">
      <p className="eyebrow">Monetization Deep System</p>
      <div className="section-command-hero">
        <div>
          <h1>{system.title}</h1>
          <p className="hero-copy">{system.summary}</p>
          <div className="cta-row">
            <Link className="btn primary" href="/monetization">Back to Monetization</Link>
            <Link className="btn secondary" href="/ask-lingo#build-mode">Build with Ask Lingo</Link>
          </div>
        </div>
        <aside className="system-card command-card monetization-command-card">
          <p className="eyebrow">Inactive Safety Gate</p>
          <h2>{system.safety}</h2>
          <p>This page defines architecture and review requirements only.</p>
        </aside>
      </div>

      <section className="section compact-section">
        <div className="ops-grid">
          <article className="system-card"><h2>Types</h2><PillList items={system.types} /></article>
          <article className="system-card"><h2>Signals</h2><PillList items={system.signals} /></article>
          <article className="system-card"><h2>Ask Lingo Actions</h2><PillList items={system.actions} /></article>
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading"><p className="eyebrow">Audit</p><h2>Launch requirements</h2></div>
        <div className="ops-grid expanded-grid">
          {monetizationAudit.map(([title, copy]) => <article className="system-card" key={title}><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section className="section compact-section split-panel align-start">
        <div>
          <p className="eyebrow">Activation Checklist</p>
          <h2>Required before live deployment</h2>
          <PillList items={activationChecklist} />
        </div>
        <div>
          <p className="eyebrow">Current State</p>
          <h2>Scaffold only</h2>
          <p>No user data, payments, ads, surveys, location, or alerts are active from this scaffold.</p>
        </div>
      </section>
    </section>
  );
}
