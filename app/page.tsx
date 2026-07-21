import Link from 'next/link';
import UniverseMap from '@/components/UniverseMap';
import Timeline from '@/components/Timeline';
import { coreLayers, siteSections, waves } from '@/lib/site-os';

const worlds = siteSections.map((section) => ({
  title: section.label,
  href: `/${section.slug}`,
  copy: section.summary,
}));

export default function Home() {
  return (
    <>
      <section className="boot-sequence" aria-label="HQ opening scene">
        <div className="emblem">LL</div>
        <div className="boot-copy">
          <span>Metal particles active</span>
          <span>Cyan energy grid online</span>
          <span>HQ interface powered</span>
        </div>
      </section>

      <section className="hero shell">
        <div className="hero-copy-block">
          <p className="eyebrow"><span className="pulse" /> Phase 1A Core Build</p>
          <h1>The Lingo Legacy <span>HQ</span></h1>
          <p className="hero-copy">The master command shell connecting games, apparel, books, media, AI, rewards, events, and Lingo ID into one digital ecosystem foundation.</p>
          <div className="cta-row">
            <Link className="btn primary" href="#universe">Enter the Legacy</Link>
            <Link className="btn secondary" href="/launch">Launch Operations</Link>
            <Link className="btn secondary" href="/lingo-id">Activate Lingo ID</Link>
          </div>
        </div>
        <div className="hq-core" aria-hidden="true">
          <div className="core-ring" />
          <div className="core-node">HQ</div>
          <div className="energy-line line-a" />
          <div className="energy-line line-b" />
          <div className="energy-line line-c" />
        </div>
      </section>

      <section id="universe" className="section shell">
        <div className="section-heading">
          <p className="eyebrow">Interactive Centerpiece</p>
          <h2>HQ Universe Map</h2>
        </div>
        <UniverseMap />
      </section>

      <section className="section shell">
        <div className="section-heading">
          <p className="eyebrow">Featured Worlds</p>
          <h2>Entity World Connections</h2>
        </div>
        <div className="world-grid">
          {worlds.map((world) => (
            <Link className="world-card" href={world.href} key={world.title}>
              <span className="world-icon" aria-hidden="true">{world.title.slice(0, 2)}</span>
              <h3>{world.title}</h3>
              <p>{world.copy}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section shell split-panel">
        <div>
          <p className="eyebrow">Rewards / Lingo ID</p>
          <h2>One identity for every world.</h2>
          <p>Lingo ID is the profile layer for achievements, loyalty, saved sound preferences, story progress, event access, and future community status.</p>
        </div>
        <Link className="btn primary" href="/rewards">View Rewards System</Link>
      </section>

      <section className="section shell split-panel align-start">
        <div>
          <p className="eyebrow">Launch Operating System</p>
          <h2>Countdowns, promos, ads, forms, legal, and growth loops.</h2>
          <p>Phase 7 through Phase 13 adds entity launch countdowns, promotion packages, advertising rules, surveys, legal infrastructure, email notifications, and an Admin HQ command center.</p>
        </div>
        <div className="route-map">
          <Link href="/launch">Launch Ops</Link>
          <Link href="/marketing">Marketing</Link>
          <Link href="/press">Press Kit</Link>
          <Link href="/business-operations">Business Ops</Link>
          <Link href="/development-spec">Build Spec</Link>
          <Link href="/phase-infinity">Phase Infinity</Link>
          <Link href="/production-spec-package">Production Spec</Link>
          <Link href="/database-system">Database</Link>
          <Link href="/master-data">Master Data</Link>
          <Link href="/asset-production">Asset Map</Link>
          <Link href="/user-experience">UX System</Link>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading">
          <p className="eyebrow">Full OS Architecture</p>
          <h2>Global Infrastructure Layers</h2>
        </div>
        <div className="pill-row architecture-grid">
          {coreLayers.map((layer) => <span key={layer}>{layer}</span>)}
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading">
          <p className="eyebrow">Execution Pipeline</p>
          <h2>Waves and Sprints</h2>
        </div>
        <div className="ops-grid">
          {waves.map(([wave, title, copy]) => (
            <article className="system-card" key={wave}>
              <p className="eyebrow">{wave}</p>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <Timeline />
    </>
  );
}
