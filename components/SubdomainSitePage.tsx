import Link from 'next/link';
import type { SubdomainSite } from '@/lib/subdomains';
import { pageToSlug, subdomainSites } from '@/lib/subdomains';

export default function SubdomainSitePage({ site }: { site: SubdomainSite }) {
  return (
    <section className="page-shell shell subdomain-shell">
      <p className="eyebrow">{site.host}</p>
      <div className="section-command-hero">
        <div>
          <h1>{site.title}</h1>
          <p className="hero-copy">{site.role}</p>
          <div className="cta-row">
            <Link className="btn primary" href="/subdomains">Open ecosystem map</Link>
            <Link className="btn secondary" href="/ask-lingo">Ask Lingo</Link>
          </div>
        </div>
        <aside className="system-card command-card">
          <p className="eyebrow">First-class website</p>
          <h2>{site.home}</h2>
          <p>{site.askPrompt}</p>
        </aside>
      </div>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Information Architecture</p>
          <h2>{site.label} pages</h2>
        </div>
        <div className="ops-grid">
          {[site.home, ...site.pages].map((page) => (
            <Link className="system-card" href={`/sites/${site.slug}/${pageToSlug(page)}`} key={page}>
              <p className="eyebrow">{site.accent}</p>
              <h3>{page}</h3>
              <p>Scaffolded as a subdomain-native page for {site.host}, connected back to Ask Lingo routing and the shared OS.</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section compact-section split-panel align-start">
        <div>
          <p className="eyebrow">Ask Lingo Brain</p>
          <h2>Context-aware routing</h2>
          <p>Ask Lingo can treat {site.host} as its own website surface while still routing users across every other Lingo Legacy subdomain.</p>
        </div>
        <div className="route-map">
          {subdomainSites.filter((target) => target.slug !== site.slug).map((target) => (
            <Link href={`/sites/${target.slug}`} key={target.slug}>{target.host}</Link>
          ))}
        </div>
      </section>
    </section>
  );
}
