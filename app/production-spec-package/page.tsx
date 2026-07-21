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


const eosDivisions = [
  ['Executive Office', 'Corporate strategy, budget approval, product approval, partnerships, investor relations, and brand governance.'],
  ['Product Management Office', 'Roadmaps for games, books, mobile apps, websites, apparel, media, and community initiatives with requirements, release plans, feature priority, and documentation.'],
  ['Engineering', 'Mobile, web, backend, cloud, security, QA, DevOps, AI, and data teams operating authentication, profiles, wallet, rewards, analytics, payments, notifications, and cloud storage.'],
  ['Creative Studio', 'Illustration, character design, motion graphics, video, animation, UI/UX, sound, music, and copywriting for books, game art, marketing, apparel, trailers, and social content.'],
  ['Publishing', 'Manuscript intake, editing, illustration, layout, proofing, ISBN, digital publishing, print publishing, and audiobook production.'],
  ['Commerce', 'Direct-to-consumer store, wholesale, digital marketplace, memberships, gift cards, limited releases, inventory, shipping, returns, promotions, and customer accounts.'],
  ['Marketing', 'Daily social posts, short-form video, long-form video, email newsletters, blog articles, launches, campaigns, reach, engagement, conversion, acquisition, and retention.'],
  ['Customer Experience', 'Help Center, live chat, email support, community forums, bug reports, feature requests, fast response, clear documentation, and continuous improvement.'],
  ['Community Programs', 'Reading clubs, youth education, technology workshops, volunteer events, scholarships, and community partnerships.'],
  ['Legal & Governance', 'IP management, trademark monitoring, copyright registration, licensing, contracts, privacy compliance, terms, and accessibility policies.'],
];

const sharedDataModel = [
  'Identity',
  'Profile',
  'Friends',
  'Rewards',
  'Wallet',
  'Purchases',
  'Game progress',
  'Book library',
  'Digital assets',
  'Notifications',
  'Support history',
  'Membership status',
];

const unifiedReleaseCalendar = [
  'Discovery',
  'Planning',
  'Design',
  'Development',
  'Internal testing',
  'External beta',
  'Release candidate',
  'Production launch',
  'Post-launch support',
  'Continuous updates',
];

const aiPlatforms = [
  ['Lingo.ai', 'Core AI platform and intelligence layer for business automation, content generation, coding assistance, creative brainstorming, learning support, customer support, analytics insights, and workflow automation.'],
  ['Ask Lingo', 'User-facing conversational assistant that answers natural-language requests across XP, orders, books, vocabulary, apparel design, game levels, rewards, shopping, learning, gaming, creator tools, business, and support.'],
];

const lingoAiModules = [
  'Lingo Chat',
  'Lingo Create',
  'Lingo Code',
  'Lingo Learn',
  'Lingo Business',
  'Lingo Studio',
  'Lingo Vision',
  'Lingo Voice',
];

const askLingoRoles = [
  'Consumer Assistant',
  'Shopping Assistant',
  'Learning Assistant',
  'Gaming Assistant',
  'Creator Assistant',
  'Business Assistant',
  'Support Assistant',
];


const languageEngineModules = [
  'Spell Check',
  'Grammar Check',
  'Type Check',
  'Punctuation Check',
  'Capitalization Check',
  'Sentence Structure Analysis',
  'Paragraph Analysis',
  'Readability Score',
  'Vocabulary Suggestions',
  'Tone Detection',
  'Style Analysis',
  'Clarity Improvements',
  'Consistency Checker',
  'Plagiarism Integration',
  'Citation Assistant',
  'Translation',
  'Multilingual Support',
];

const writingCommands = [
  'Check my spelling',
  'Fix my grammar',
  'Rewrite professionally',
  'Make this friendlier',
  'Simplify this paragraph',
  'Summarize this document',
  'Expand these notes',
  'Translate to Spanish',
  'Check my resume',
  'Improve my essay',
  'Draft an email',
  'Proofread my manuscript',
];

const writingModes = [
  'Academic',
  'Business',
  'Casual',
  'Professional',
  'Legal',
  'Medical review-assisted',
  'Technical',
  'Marketing',
  'Social Media',
  'Children’s Reading',
  'Speech Therapy',
  'Accessibility-focused writing',
];

const languageApiEndpoints = [
  'POST /api/v1/spellcheck',
  'POST /api/v1/grammar',
  'POST /api/v1/proofread',
  'POST /api/v1/rewrite',
  'POST /api/v1/summarize',
  'POST /api/v1/translate',
  'POST /api/v1/paraphrase',
  'POST /api/v1/detect-language',
  'POST /api/v1/tone',
  'POST /api/v1/readability',
  'POST /api/v1/keywords',
  'POST /api/v1/outline',
  'POST /api/v1/citations',
];

const writingQualityPipeline = [
  'Detect language',
  'Spell check',
  'Grammar analysis',
  'Punctuation review',
  'Capitalization review',
  'Style analysis',
  'Tone analysis',
  'Readability scoring',
  'Clarity suggestions',
  'Optional rewrite',
  'Final proofreading',
];

const lingoScoreCategories = [
  'Accuracy',
  'Grammar',
  'Spelling',
  'Readability',
  'Clarity',
  'Tone',
  'Structure',
  'Vocabulary',
  'Consistency',
];

const languageFeatureGroups = [
  ['Accessibility Tools', 'Dyslexia-friendly formatting, read-aloud support, speech-to-text, text-to-speech, adjustable font sizes, high contrast, and simplified reading mode.'],
  ['Education Features', 'Essay review, homework feedback, vocabulary builder, flashcards, writing prompts, reading comprehension questions, and progress tracking.'],
  ['Business Features', 'Email drafting, proposal writing, meeting summaries, report generation, contract review assistance, knowledge base search, and customer support response drafting.'],
  ['Creator Features', 'Story outlining, character profiles, dialogue suggestions, script formatting, blog drafting, book editing, SEO optimization, and social captions.'],
  ['Enterprise Administration', 'Team workspaces, shared dictionaries, custom terminology, brand voice guidelines, approval workflows, analytics dashboards, usage reports, and API access controls.'],
];


const enterpriseExpansionDomains = [
  ['Identity & Access Platform', 'Lingo ID, SSO, MFA, passkeys/WebAuthn, device and session management, parent or guardian accounts, RBAC, organizations, workspaces, audit logs, recovery, and consent.'],
  ['Security Operations Center', 'Monitoring, intrusion detection, threat intelligence, vulnerability scanning, secrets management, encryption, key rotation, DDoS, bot protection, abuse detection, fraud monitoring, and compliance reporting.'],
  ['Payments & Commerce', 'Multiple payment providers, digital wallets, gift cards, coupons, promotions, subscriptions, installment payments where supported, tax, currency, refunds, chargebacks, and invoicing.'],
  ['Enterprise AI Platform', 'Ask Lingo, Lingo.ai, agents, workflow builder, prompt library, knowledge base, document Q&A, image understanding, speech, TTS, translation, summarization, code, writing, safety, and human review.'],
  ['Search Platform', 'Indexes for users, games, books, products, articles, videos, support, and docs with filters, suggestions, voice, semantic search, saved searches, and trending searches.'],
  ['Communication Platform', 'Email, push, SMS, in-app messages, live chat, community announcements, and newsletters.'],
  ['Social Platform', 'Profiles, friends, following, groups, clubs, communities, messaging, voice chat, media sharing, activity feeds, reactions, comments, moderation, and reporting.'],
  ['Creator Economy', 'Asset uploads, portfolio pages, revenue dashboard, royalties, licensing, publishing workflows, analytics, collaboration, and content scheduling.'],
  ['Learning Platform', 'Reading programs, speech recovery, interactive lessons, quizzes, flashcards, certificates, teacher and parent dashboards, and classroom management.'],
  ['Streaming Platform', 'Movies, TV episodes, livestreams, podcasts, audiobooks, music, shorts, educational videos, playlists, continue watching, downloads, captions, and multiple audio tracks.'],
  ['Developer Ecosystem', 'REST APIs, SDKs, webhooks, API keys, CLI tools, documentation, sample projects, sandbox, status dashboard, and changelog.'],
  ['Business Intelligence', 'Revenue, user growth, retention, sales, inventory, marketing, support, product health, and executive KPI dashboards.'],
  ['Automation Platform', 'Marketing automation, onboarding, order processing, publishing pipelines, inventory alerts, support routing, scheduled jobs, and backup automation.'],
  ['Content Management System', 'Websites, blogs, documentation, product pages, landing pages, news, press releases, campaigns, and localization.'],
  ['Localization Platform', 'Multiple languages, regional formats, currency, time zones, translation memory, and cultural adaptation.'],
  ['Digital Asset Management', 'Logos, artwork, videos, audio, fonts, templates, source files, brand guidelines, version history, metadata, search, permissions, and licensing records.'],
  ['Infrastructure', 'Local development, testing, staging, production, disaster recovery, CI/CD, monitoring, logging, CDN, caching, autoscaling, backup, and restore.'],
  ['Quality Engineering', 'Unit, integration, end-to-end, performance, security, accessibility, localization, compatibility, and beta testing programs.'],
  ['Compliance', 'Privacy, terms, cookie consent, accessibility, copyright, trademark, data retention, and incident response policies.'],
  ['Enterprise APIs', 'Authentication, users, organizations, wallet, rewards, XP, commerce, inventory, books, games, media, AI, notifications, analytics, search, support, and licensing.'],
  ['Product Lifecycle Management', 'Concept, research, design, prototype, development, testing, release candidate, launch, operations, maintenance, and end-of-life.'],
  ['Sustainability & Governance', 'Accessibility reviews, security reviews, privacy impact assessments, risk, vendor management, continuity, and disaster recovery planning.'],
  ['Future Innovation', 'AR/VR, smart TV apps, connected devices, robotics or kiosks, AI-assisted game creation, education research partnerships, and open APIs.'],
];

const productionReadinessArtifacts = [
  'Data models',
  'API specifications',
  'UI/UX designs',
  'Security architecture',
  'Testing plans',
  'Phased delivery schedules',
  'Product-specific roadmaps',
  'Operational runbooks',
];


const domainBlueprintGroups = [
  ['Corporate', 'thelingolegacy.com, lingo.ai'],
  ['AI', 'asklingo.ai, api.lingo.ai, docs.lingo.ai, developers.lingo.ai, studio.lingo.ai, status.lingo.ai, auth.lingo.ai, console.lingo.ai'],
  ['Games', 'thatsmylingo.com, kottonscode.com, legacyzombies.com, spadesismylingo.com, lingocity.com, crazyweasel.com, bulldoglegacybridge.com'],
  ['Publishing', 'lingopublishing.com, kottonscodebooks.com, sayitagainbooks.com'],
  ['Commerce', 'shop.thelingolegacy.com, apparel.thelingolegacy.com, store.thelingolegacy.com, marketplace.thelingolegacy.com'],
  ['Loyalty Lane', 'loyaltylane.com, loyaltylaneapparel.com, loyaltylanecycles.com'],
  ['Foundation', 'avalonfoundation.org, houseofavalon.org'],
  ['Developer Platform', 'developer.thelingolegacy.com, api.thelingolegacy.com, docs.thelingolegacy.com, status.thelingolegacy.com, sdk.thelingolegacy.com'],
  ['Admin', 'admin.thelingolegacy.com, dashboard.thelingolegacy.com, analytics.thelingolegacy.com'],
  ['Media', 'media.thelingolegacy.com, press.thelingolegacy.com, podcast.thelingolegacy.com, music.thelingolegacy.com, studios.thelingolegacy.com'],
  ['Careers', 'careers.thelingolegacy.com, jobs.thelingolegacy.com'],
  ['Support', 'help.thelingolegacy.com, support.thelingolegacy.com, community.thelingolegacy.com, feedback.thelingolegacy.com'],
];

const businessEmailGroups = [
  ['Executive', 'ceo, office, executive, founders @thelingolegacy.com'],
  ['Customer', 'support, help, contact, hello @thelingolegacy.com'],
  ['Business', 'partnerships, licensing, legal, finance, accounting @thelingolegacy.com'],
  ['Marketing', 'marketing, media, press, social @thelingolegacy.com'],
  ['Technology', 'developers, api, security, bugs, status @thelingolegacy.com'],
  ['Publishing', 'books, authors, editor @thelingolegacy.com'],
  ['Games', 'games, beta, esports @thelingolegacy.com'],
  ['Commerce', 'shop, orders, returns @thelingolegacy.com'],
  ['Foundation', 'donate, volunteers, grants @avalonfoundation.org'],
];

const hostingArchitecture = [
  ['Frontend', 'Vercel for Next.js sites, static marketing sites, documentation, and landing pages.'],
  ['Backend', 'Google Cloud Run or Firebase App Hosting, Firebase Authentication, Cloud Functions, Firestore, and Cloud Storage.'],
  ['Media', 'Cloud Storage, CDN, image optimization, and video streaming platform.'],
  ['Databases', 'Firestore for application data, PostgreSQL if relational workloads need it, and BigQuery for analytics.'],
];

const dnsStructure = [
  '@ main website',
  'www main website',
  'app web app',
  'api API gateway',
  'auth authentication',
  'admin dashboard',
  'docs documentation',
  'developer portal',
  'status status page',
  'shop store',
  'support help center',
  'community community',
  'blog blog',
  'careers careers',
  'media media hub',
  'podcast podcasts',
  'cdn static assets',
  'assets brand assets',
];

const brandAccounts = ['YouTube', 'TikTok', 'Instagram', 'Facebook', 'LinkedIn', 'X', 'GitHub', 'Discord'];

const operationsServices = [
  'Help desk',
  'Incident tracking',
  'Monitoring',
  'Backups',
  'Analytics',
  'CRM',
  'Email marketing',
  'Internal knowledge base',
  'Password manager',
  'Source code repositories',
];

const domainRolloutOrder = [
  'Core: thelingolegacy.com, lingo.ai, shared authentication, email, and DNS',
  'Platform: app, api, admin, docs, and developer subdomains',
  'Products: game, book, apparel, and community sites as each reaches public launch',
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

      <section className="section-command-hero">
        <div>
          <p className="eyebrow">Phase 4 Enterprise Operating System</p>
          <h2>One coordinated platform for every product, service, and team.</h2>
          <p className="hero-copy">Mission: build interconnected entertainment, education, commerce, and community products under one unified ecosystem. Vision: every user has one account, one profile, one wallet, and one loyalty experience across all Lingo Legacy products.</p>
        </div>
        <article className="system-card command-card">
          <p className="eyebrow">EOS Rule</p>
          <h2>Repeatable growth framework.</h2>
          <p>New products can be added without breaking consistency because teams share operating rules, platform services, release calendars, data models, and AI interfaces.</p>
        </article>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">EOS Division Structure</p>
          <h2>Coordinated operating teams</h2>
        </div>
        <div className="ops-grid expanded-grid">
          {eosDivisions.map(([title, copy]) => (
            <article className="system-card" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split-panel align-start">
        <div>
          <p className="eyebrow">Shared Data Model</p>
          <h2>Every account connects the full ecosystem.</h2>
          <p>Identity, commerce, learning, gaming, support, and membership records follow the user across every Lingo Legacy product.</p>
        </div>
        <div className="route-map">{sharedDataModel.map((field) => <span key={field}>{field}</span>)}</div>
      </section>

      <section className="section split-panel align-start">
        <div>
          <p className="eyebrow">Unified Release Calendar</p>
          <h2>One lifecycle for every launch.</h2>
          <p>EOS standardizes discovery through continuous updates so product, engineering, creative, marketing, support, and operations stay aligned.</p>
        </div>
        <div className="route-map architecture-flow">{unifiedReleaseCalendar.map((step) => <span key={step}>{step}</span>)}</div>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">AI Experience Architecture</p>
          <h2>Lingo.ai powers Ask Lingo.</h2>
        </div>
        <div className="ops-grid expanded-grid">
          {aiPlatforms.map(([title, copy]) => (
            <article className="system-card" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split-panel align-start">
        <div>
          <p className="eyebrow">Lingo.ai Modules</p>
          <h2>Underlying intelligence layer.</h2>
          <div className="route-map">{lingoAiModules.map((module) => <span key={module}>{module}</span>)}</div>
        </div>
        <div>
          <p className="eyebrow">Ask Lingo Roles</p>
          <h2>Conversational interface.</h2>
          <div className="route-map">{askLingoRoles.map((role) => <span key={role}>{role}</span>)}</div>
        </div>
      </section>

      <section className="section split-panel align-start">
        <div>
          <p className="eyebrow">AI Workflow Example</p>
          <h2>Ask Lingo receives. Lingo.ai generates.</h2>
          <p>A user asks to create a new Kotton's Code character. Ask Lingo receives the request, Lingo.ai generates the artwork prompt, story outline, and structured character data, then Ask Lingo returns the result in a friendly conversational format.</p>
        </div>
        <div className="route-map architecture-flow"><span>User request</span><span>Ask Lingo interface</span><span>Lingo.ai engine</span><span>Structured output</span><span>Friendly response</span></div>
      </section>

      <section className="section-command-hero">
        <div>
          <p className="eyebrow">Lingo.ai Language Intelligence Suite</p>
          <h2>Writing quality, productivity, and multilingual support.</h2>
          <p className="hero-copy">The Language Intelligence Suite extends Lingo.ai into spell check, grammar, proofreading, rewriting, translation, education support, business writing, creator tools, and enterprise writing governance.</p>
        </div>
        <article className="system-card command-card">
          <p className="eyebrow">Production Note</p>
          <h2>Specialized services allowed.</h2>
          <p>Plagiarism detection, high-quality translation, grammar accuracy, and domain review can use appropriately licensed third-party services or specialized models when production quality requires it.</p>
        </article>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Core Writing Engine</p>
          <h2>Language-quality modules</h2>
        </div>
        <div className="pill-row architecture-grid">{languageEngineModules.map((module) => <span key={module}>{module}</span>)}</div>
      </section>

      <section className="section split-panel align-start">
        <div>
          <p className="eyebrow">Ask Lingo Writing Assistant</p>
          <h2>Natural commands for writing help.</h2>
          <div className="route-map">{writingCommands.map((command) => <span key={command}>{command}</span>)}</div>
        </div>
        <div>
          <p className="eyebrow">Writing Modes</p>
          <h2>Context-aware output.</h2>
          <div className="route-map">{writingModes.map((mode) => <span key={mode}>{mode}</span>)}</div>
        </div>
      </section>

      <section className="section split-panel align-start">
        <div>
          <p className="eyebrow">Developer APIs</p>
          <h2>Endpoint organization for language tools.</h2>
          <p>Each writing capability can ship as a stable API surface for websites, mobile apps, creator tools, education portals, and enterprise integrations.</p>
        </div>
        <div className="route-map">{languageApiEndpoints.map((endpoint) => <span key={endpoint}>{endpoint}</span>)}</div>
      </section>

      <section className="section split-panel align-start">
        <div>
          <p className="eyebrow">Writing Quality Pipeline</p>
          <h2>From raw text to polished output.</h2>
          <p>User text flows through detection, correction, analysis, scoring, suggestions, optional rewriting, and final proofreading.</p>
        </div>
        <div className="route-map architecture-flow">{writingQualityPipeline.map((step) => <span key={step}>{step}</span>)}</div>
      </section>

      <section className="section split-panel align-start">
        <div>
          <p className="eyebrow">Lingo Score</p>
          <h2>Proprietary writing quality score.</h2>
          <p>Outputs include Overall Score, strengths, suggested improvements, estimated reading level, and estimated reading time.</p>
        </div>
        <div className="route-map">{lingoScoreCategories.map((category) => <span key={category}>{category}</span>)}</div>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Language Suite Product Lines</p>
          <h2>Accessibility, education, business, creator, and enterprise tools.</h2>
        </div>
        <div className="ops-grid expanded-grid">
          {languageFeatureGroups.map(([title, copy]) => (
            <article className="system-card" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-command-hero">
        <div>
          <p className="eyebrow">Enterprise Expansion vNext</p>
          <h2>Major platform domains for a full-scale software and media organization.</h2>
          <p className="hero-copy">These additions round out the ecosystem blueprint beyond product concepts into identity, security, commerce, AI, search, communication, social, creator, learning, streaming, developer, intelligence, automation, content, localization, asset, infrastructure, quality, compliance, API, lifecycle, governance, and innovation systems.</p>
        </div>
        <article className="system-card command-card">
          <p className="eyebrow">vNext Rule</p>
          <h2>Capabilities first, artifacts next.</h2>
          <p>This layer defines the missing production domains. The next pass converts each domain into data models, API specs, UI/UX designs, security architecture, tests, and phased delivery plans.</p>
        </article>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Expansion Domains</p>
          <h2>Twenty-three systems to complete the enterprise map.</h2>
        </div>
        <div className="ops-grid expanded-grid">
          {enterpriseExpansionDomains.map(([title, copy]) => (
            <article className="system-card" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split-panel align-start">
        <div>
          <p className="eyebrow">Production Readiness</p>
          <h2>Convert high-level capabilities into implementation artifacts.</h2>
          <p>The documentation now spans the major domains expected in a large software, media, education, commerce, and community organization.</p>
        </div>
        <div className="route-map">{productionReadinessArtifacts.map((artifact) => <span key={artifact}>{artifact}</span>)}</div>
      </section>

      <section className="section-command-hero">
        <div>
          <p className="eyebrow">Domain and Communications Blueprint</p>
          <h2>Recommended names, email routes, DNS, hosting, and rollout order.</h2>
          <p className="hero-copy">This layer defines the public web presence and communications structure for the ecosystem. Domain names are recommended targets, not confirmed registrations or availability results.</p>
        </div>
        <article className="system-card command-card">
          <p className="eyebrow">Rollout Rule</p>
          <h2>Core first. Products as they launch.</h2>
          <p>Start with the main brand, AI brand, shared authentication, email, and DNS, then add platform subdomains and individual product sites as each becomes public-ready.</p>
        </article>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Domain Blueprint</p>
          <h2>Corporate, AI, product, platform, and support domains.</h2>
        </div>
        <div className="ops-grid expanded-grid">
          {domainBlueprintGroups.map(([title, copy]) => (
            <article className="system-card" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Business Email Structure</p>
          <h2>Role-based inboxes for operations.</h2>
        </div>
        <div className="ops-grid expanded-grid">
          {businessEmailGroups.map(([title, copy]) => (
            <article className="system-card" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Hosting Architecture</p>
          <h2>Frontend, backend, media, and database placement.</h2>
        </div>
        <div className="ops-grid expanded-grid">
          {hostingArchitecture.map(([title, copy]) => (
            <article className="system-card" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split-panel align-start">
        <div>
          <p className="eyebrow">DNS Structure</p>
          <h2>Standard hostnames for the platform.</h2>
          <div className="route-map">{dnsStructure.map((record) => <span key={record}>{record}</span>)}</div>
        </div>
        <div>
          <p className="eyebrow">Brand Accounts</p>
          <h2>Consistent organization-owned handles.</h2>
          <div className="route-map">{brandAccounts.map((account) => <span key={account}>{account}</span>)}</div>
        </div>
      </section>

      <section className="section split-panel align-start">
        <div>
          <p className="eyebrow">Operations Stack</p>
          <h2>Core internal services.</h2>
          <div className="route-map">{operationsServices.map((service) => <span key={service}>{service}</span>)}</div>
        </div>
        <div>
          <p className="eyebrow">Recommended Rollout Order</p>
          <h2>Stable foundation before full network.</h2>
          <div className="route-map architecture-flow">{domainRolloutOrder.map((step) => <span key={step}>{step}</span>)}</div>
        </div>
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
