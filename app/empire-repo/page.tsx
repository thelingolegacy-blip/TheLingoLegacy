import Link from 'next/link';

const deploymentProjects = [
  ['lingo-web', 'apps/web', 'Universal Lingo App'],
  ['lingo-admin', 'apps/admin', 'Admin command console'],
  ['lingo-creator', 'apps/creator', 'Creator portal'],
  ['lingo-publisher', 'apps/publisher', 'Publisher portal'],
  ['lingo-mobile', 'apps/html5-mobile', 'HTML5 / PWA shell'],
  ['lingo-webos', 'apps/lg-webos', 'LG webOS TV shell'],
  ['lingo-thinq', 'apps/lg-thinq', 'LG ThinQ integration shell'],
  ['ask-lingo-api', 'services/ask-lingo', 'Ask Lingo / Lingo.ai intelligence'],
  ['lingo-commerce-api', 'services/commerce', 'Commerce, orders, subscriptions'],
  ['lingo-media-api', 'services/media', 'Studios and records services'],
  ['lingo-community-api', 'services/community', 'Avalon and Loyalty Lane services'],
  ['lingo-games-api', 'services/games', 'Shared games service layer'],
];

const sharedSystems = [
  'Universal Login',
  'Universal Wallet',
  'Universal XP',
  'Universal Rewards',
  'Universal Inventory',
  'Universal Commerce',
  'Universal Notifications',
  'Ask Lingo / Lingo.ai',
];

const estate = [
  ['Games', "That's My Lingo, Kotton's Code, Legacy Zombies, Spades Is My Lingo, Lingo City, UhOh Lingo University, Crazy Weasel, Bulldog Legacy Bridge"],
  ['Books', "Kotton's Code Series and Say It Again speech recovery curriculum"],
  ['Apparel', 'Loyalty Lane Apparel, Tap Stitch, Industrial Noir, Legacy Gold, Obsidian Closet'],
  ['Community', 'Loyalty Lane Cycles and Iconic House of Avalon'],
  ['Media + Music', 'Lingo Studios and Lingo Legacy Records'],
  ['Commerce + Digital Products', 'Products, subscriptions, drops, ebooks, templates, printables, courses, icons, fonts, animation'],
];

export default function EmpireRepoPage() {
  return (
    <div className="page-shell shell">
      <section className="section-command-hero">
        <div>
          <p className="eyebrow"><span className="pulse" /> Empire Repo Activation</p>
          <h1>Vercel Empire Repository</h1>
          <p className="hero-copy">
            Lingo Legacy Entertainment LLC is now mapped as a multi-app, multi-service, multi-platform Vercel monorepo with one identity layer, one rewards economy, and one brand operating system.
          </p>
          <div className="cta-row">
            <Link className="btn primary" href="/ask-lingo">Open Ask Lingo</Link>
            <Link className="btn secondary" href="/production-spec-package">Production Spec</Link>
            <Link className="btn secondary" href="/subdomains">Website Network</Link>
          </div>
        </div>
        <article className="system-card command-card">
          <p className="eyebrow">Deployment Rule</p>
          <h2>One repo. Many Vercel projects.</h2>
          <p>
            Each deployable app or service uses its own Vercel Project with a Root Directory. Shared packages stay in `packages/*`; assets and docs stay as source-of-truth libraries.
          </p>
        </article>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Universal Systems</p>
          <h2>One account powers every world.</h2>
        </div>
        <div className="pill-row completion-grid">
          {sharedSystems.map((system) => <span key={system}>{system}</span>)}
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Vercel Project Matrix</p>
          <h2>Deployable roots</h2>
        </div>
        <div className="ops-grid expanded-grid">
          {deploymentProjects.map(([project, root, role]) => (
            <article className="system-card" key={project}>
              <p className="eyebrow">{root}</p>
              <h3>{project}</h3>
              <p>{role}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">IP Portfolio</p>
          <h2>Empire estate map</h2>
        </div>
        <div className="ops-grid expanded-grid">
          {estate.map(([title, copy]) => (
            <article className="system-card" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split-panel align-start">
        <div>
          <p className="eyebrow">Current Deploy Target</p>
          <h2>HQ stays live while the empire expands.</h2>
          <p>
            The root Next.js HQ app remains the production surface. The new `apps/*` and `services/*` roots are ready to become separate Vercel Projects when each product line needs its own deployment lifecycle.
          </p>
        </div>
        <Link className="btn primary" href="/development-spec">Review Build Spec</Link>
      </section>
    </div>
  );
}
