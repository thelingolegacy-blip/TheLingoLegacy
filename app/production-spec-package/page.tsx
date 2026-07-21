const parentEntities = [
  'Lingo Legacy Platform',
  'Lingo Studios',
  'Lingo Publishing',
  'Lingo Games',
  'Lingo Commerce',
  'Lingo Media',
  'Lingo Records',
  'Loyalty Lane',
  'Obsidian Closet',
  "Kotton's Code",
  'Legacy Legends',
  'Avalon Foundation',
  'Developer Platform',
];

const sharedCore = [
  'Lingo ID single sign-on',
  'Universal User Profile',
  'Universal Wallet',
  'XP Engine',
  'Achievement System',
  'Loyalty Rewards',
  'Marketplace',
  'Notifications',
  'Cloud Save',
  'Analytics',
  'Admin Dashboard',
  'AI Assistant',
  'Security & Permissions',
];

const divisions = [
  ['Executive HQ', 'Vision, strategy, financial planning, partnerships, licensing, intellectual property, product approvals, launch scheduling, and KPI dashboards.'],
  ['Technology Division', 'Identity, MFA, session management, role-based permissions, device management, wallet, notifications, analytics, AI, and security systems.'],
  ['Gaming Division', "That's My Lingo, Kotton's Code, Legacy Zombies, Spades Is My Lingo, Crazy Weasel, live operations, cloud save, leaderboards, rewards, purchases, and achievements."],
  ['Publishing Division', 'Story outlines, manuscripts, editing, illustration, layout, ISBN, digital conversion, print proofs, distribution, marketing, EPUB, Kindle, PDF, audiobook, and interactive editions.'],
  ['Animation Division', 'Scripts, storyboards, voice recording, character animation, effects, music, editing, captions, localization, and distribution.'],
  ['Music Division', 'Albums, singles, character themes, cinematic scores, game soundtracks, podcasts, audiobooks, and royalty tracking.'],
  ['Apparel Division', 'Loyalty Lane, Industrial Noir, Founder Series, Kids, Seasonal, Premium, concept, design, mockup, sampling, manufacturing, photography, inventory, fulfillment, and support.'],
  ['Commerce Division', 'Apparel, books, games, collectibles, digital downloads, gift cards, memberships, coupons, bundles, wishlists, reviews, subscriptions, order tracking, returns, and alerts.'],
  ['Marketing Division', 'Social, email, SMS, influencer outreach, press releases, product launches, referrals, seasonal promotions, daily posts, weekly videos, monthly launches, and quarterly campaigns.'],
  ['Community Foundation', 'Reading initiatives, technology education, events, scholarships, volunteers, grants, partnerships, youth mentorship, and community laundry support.'],
  ['Licensing Division', 'Character licensing, merchandise agreements, publishing rights, game collaborations, brand partnerships, media distribution, and international rights.'],
  ['Legal & Compliance', 'Trademarks, copyrights, privacy policy, terms, cookie policy, licensing agreements, employment docs, vendor agreements, and accessibility reviews.'],
  ['Customer Success', 'Knowledge base, ticketing, live chat, forums, FAQ, refunds, bug reporting, and feature requests.'],
  ['Operations', 'Infrastructure, security, backups, incident response, release management, uptime, capacity planning, and disaster recovery.'],
];

const gameMatrix = [
  ["That's My Lingo", 'Core game, seasonal events, loyalty integration, leaderboards, daily rewards, live operations, in-game store, VIP tournaments, social clubs, creator tournaments, and cross-game rewards.'],
  ["Kotton's Code", 'Story Mode, Alphabet World, Numbers World, Color World, Shapes World, Music World, Reading Challenges, Parent Dashboard, Teacher Dashboard, Classroom Mode, books, plush, apparel, shorts, and audiobooks.'],
  ['Legacy Zombies', 'Campaign, multiplayer, survival, base building, crafting, vehicles, character progression, seasonal events, and cosmetic marketplace.'],
  ['Spades Is My Lingo', 'Ranked, casual, friends, clubs, spectator mode, replay system, tournaments, anti-cheat, and statistics.'],
  ['Crazy Weasel', 'Adventure, boss battles, time trials, hidden levels, character skins, and daily challenges.'],
];

const buildArtifacts = [
  'Database tables',
  'API endpoints',
  'UI screens',
  'Workflows',
  'Deployment pipelines',
  'Legal documents',
  'Master asset library',
  'Release checklists',
  'Accessibility reviews',
  'Security reviews',
  'Admin modules',
  'Analytics reports',
];

const websiteNetwork = [
  'thelingolegacy.com',
  'games.thelingolegacy.com',
  'books.thelingolegacy.com',
  'shop.thelingolegacy.com',
  'kottonscode.com',
  'thatsmylingo.com',
  'legacyzombies.com',
  'spadesismylingo.com',
  'loyaltylaneapparel.com',
  'obsidiancloset.com',
  'avalonfoundation.org',
  'developer.thelingolegacy.com',
  'publisher.thelingolegacy.com',
  'admin.thelingolegacy.com',
  'status.thelingolegacy.com',
  'support.thelingolegacy.com',
  'careers.thelingolegacy.com',
  'press.thelingolegacy.com',
];

const releasePipeline = [
  'Ideation',
  'Planning',
  'Design',
  'Development',
  'Internal QA',
  'Beta testing',
  'Security review',
  'Accessibility review',
  'Production release',
  'Ongoing maintenance and updates',
];

export default function ProductionSpecPackagePage() {
  return (
    <div className="page-shell shell">
      <section className="section-command-hero">
        <div>
          <p className="eyebrow">Merged Empire Blueprint</p>
          <h1>Master Production Blueprint</h1>
          <p className="hero-copy">
            Phase 2 Empire Architecture and Phase 3 Master Production Blueprint are merged into one operating model for Lingo Legacy Entertainment LLC: independent product lines powered by one shared platform.
          </p>
        </div>
        <article className="system-card command-card">
          <p className="eyebrow">Build Rule</p>
          <h2>Independent projects. Shared core.</h2>
          <p>Every game, book, apparel line, media property, and portal can ship on its own timeline while reusing Lingo ID, wallet, rewards, analytics, commerce, notifications, and admin operations.</p>
        </article>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Parent Organization</p>
          <h2>Lingo Legacy Entertainment LLC</h2>
        </div>
        <div className="pill-row completion-grid">{parentEntities.map((entity) => <span key={entity}>{entity}</span>)}</div>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Core Platform</p>
          <h2>Shared services for every entity.</h2>
        </div>
        <div className="pill-row architecture-grid">{sharedCore.map((service) => <span key={service}>{service}</span>)}</div>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Empire Structure</p>
          <h2>Operating divisions</h2>
        </div>
        <div className="ops-grid expanded-grid">
          {divisions.map(([title, copy]) => (
            <article className="system-card" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Game Production Matrix</p>
          <h2>Shared progression across every game.</h2>
        </div>
        <div className="ops-grid expanded-grid">
          {gameMatrix.map(([title, copy]) => (
            <article className="system-card" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split-panel align-start">
        <div>
          <p className="eyebrow">Production Artifacts</p>
          <h2>Build-ready specification package.</h2>
          <p>Phase 3 converts the empire model into engineering inventory for database, API, UI, workflow, deployment, compliance, and asset production.</p>
        </div>
        <div className="route-map">{buildArtifacts.map((artifact) => <span key={artifact}>{artifact}</span>)}</div>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Complete Website Network</p>
          <h2>Branded portals connected to the shared platform.</h2>
        </div>
        <div className="pill-row architecture-grid">{websiteNetwork.map((site) => <span key={site}>{site}</span>)}</div>
      </section>

      <section className="section split-panel align-start">
        <div>
          <p className="eyebrow">Release Pipeline</p>
          <h2>One production flow for every product.</h2>
          <p>Every release moves through the same lifecycle so games, books, apparel drops, media launches, and platform services stay consistent.</p>
        </div>
        <div className="route-map architecture-flow">{releasePipeline.map((step) => <span key={step}>{step}</span>)}</div>
      </section>
    </div>
  );
}
