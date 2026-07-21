import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSubdomainPage, pageToSlug, subdomainSites } from '@/lib/subdomains';

export function generateStaticParams() {
  return subdomainSites.flatMap((site) => [site.home, ...site.pages].map((page) => ({
    site: site.slug,
    page: pageToSlug(page),
  })));
}

export default async function Page({ params }: { params: Promise<{ site: string; page: string }> }) {
  const { site: siteSlug, page: pageSlug } = await params;
  const match = getSubdomainPage(siteSlug, pageSlug);

  if (!match) notFound();

  const { site, page } = match;

  return (
    <section className="page-shell shell subdomain-shell">
      <p className="eyebrow">{site.host}</p>
      <div className="section-command-hero">
        <div>
          <h1>{page}</h1>
          <p className="hero-copy">A first-class {site.label} website page scaffold for {site.host}, connected to Ask Lingo routing and the shared Lingo Legacy OS.</p>
          <div className="cta-row">
            <Link className="btn primary" href={`/sites/${site.slug}`}>Back to {site.label}</Link>
            <Link className="btn secondary" href="/ask-lingo">Ask Lingo</Link>
          </div>
        </div>
        <aside className="system-card command-card">
          <p className="eyebrow">{site.accent}</p>
          <h2>{site.title}</h2>
          <p>{site.askPrompt}</p>
        </aside>
      </div>
      <div className="ops-grid">
        <article className="system-card"><h2>Purpose</h2><p>{site.role}</p></article>
        <article className="system-card"><h2>Content Blocks</h2><p>Hero, overview, feature grid, action rail, Ask Lingo prompt, and next-step cards are reserved for this page.</p></article>
        <article className="system-card"><h2>Future Integration</h2><p>This page can later connect to live data, user XP, inventory, media, products, quests, or lore entries.</p></article>
      </div>
    </section>
  );
}
