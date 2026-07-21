import Link from 'next/link';
import { subdomainSites } from '@/lib/subdomains';

export default function SubdomainMap() {
  return (
    <section className="page-shell shell subdomain-shell">
      <p className="eyebrow">Global Subdomain Map</p>
      <div className="section-heading">
        <h1>Lingo Legacy Ecosystem Websites</h1>
        <p className="hero-copy">Each subdomain is scaffolded as a first-class website with its own information architecture, while Ask Lingo remains the shared routing brain.</p>
      </div>
      <div className="subdomain-grid">
        {subdomainSites.map((site) => (
          <Link className="system-card subdomain-card" href={`/sites/${site.slug}`} key={site.slug}>
            <p className="eyebrow">{site.accent}</p>
            <h2>{site.host}</h2>
            <h3>{site.title}</h3>
            <p>{site.role}</p>
            <div className="pill-row compact">
              {[site.home, ...site.pages.slice(0, 3)].map((page) => <span key={page}>{page}</span>)}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
