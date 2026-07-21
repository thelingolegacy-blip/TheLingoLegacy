export const productionStack = {
  frontend: ['Next.js', 'TypeScript', 'Tailwind UI system', 'Framer Motion animations', 'Three.js/WebGL experiences'],
  hosting: ['Vercel', 'Cloudflare DNS/CDN/security'],
  backend: ['Firebase Authentication', 'Firestore', 'Cloud Functions', 'Storage', 'Analytics'],
  sourceControl: ['GitHub', 'CI/CD deployment pipeline'],
};

export const repositoryArchitecture = {
  apps: ['website/HQ', 'website/Games', 'website/Apparel', 'website/Books', 'website/Media', 'website/AI Lab', 'website/Community', 'admin-dashboard', 'game-launcher', 'mobile-app'],
  packages: ['lingo_core', 'lingo_auth', 'lingo_wallet', 'lingo_rewards', 'lingo_xp', 'lingo_games', 'lingo_commerce', 'lingo_notifications', 'lingo_design'],
};

export const databaseSchemas = [
  { collection: 'users', fields: ['userID', 'username', 'avatar', 'preferences', 'XP', 'level', 'rewards', 'createdDate'] },
  { collection: 'games', fields: ['title', 'category', 'assets', 'releaseDate', 'status', 'players'] },
  { collection: 'wallet', fields: ['userID', 'currency', 'transactions', 'rewards', 'history'] },
  { collection: 'products', fields: ['productID', 'name', 'collection', 'inventory', 'pricing', 'images'] },
  { collection: 'content', fields: ['books', 'videos', 'announcements', 'events', 'trailers'] },
];

export const phaseSystems = [
  { phase: 'Phase 10', title: 'Security & Trust System', route: '/security-trust', items: ['Firebase Authentication', 'Role permissions', 'Admin controls', 'Secure database rules', 'Fraud monitoring', 'User privacy controls'] },
  { phase: 'Phase 11', title: 'AI Ecosystem', route: '/ai-ecosystem', items: ['Website navigation', 'Game help', 'Story information', 'Product discovery', 'Community support'] },
  { phase: 'Phase 12', title: 'Game Platform Expansion', route: '/game-platform', items: ['Browser gameplay', 'Player accounts', 'Cloud saves', 'Leaderboards', 'Achievements', 'Rewards'] },
  { phase: 'Phase 13', title: 'Commerce System', route: '/commerce-system', items: ['Product pages', 'Collections', 'Drops', 'Inventory', 'Checkout', 'Rewards integration'] },
  { phase: 'Phase 14', title: 'Media Network', route: '/media-network', items: ['Series', 'Trailers', 'Shorts', 'Music', 'Podcasts', 'Behind-the-scenes'] },
  { phase: 'Phase 15', title: 'Community Platform', route: '/community-platform', items: ['Profiles', 'Groups', 'Events', 'Challenges', 'Leaderboards', 'Moderation tools'] },
  { phase: 'Phase 16', title: 'Iconic House of Avalon', route: '/community/avalon', items: ['Mission', 'Programs', 'Volunteer forms', 'Donation information', 'Events'] },
  { phase: 'Phase 17', title: 'Analytics Command Center', route: '/analytics-command', items: ['User signups', 'Retention', 'Game sessions', 'Commerce orders', 'Media watch time'] },
  { phase: 'Phase 18', title: 'Automation Engine', route: '/automation-engine', items: ['Create release', 'Generate countdown', 'Publish promo', 'Notify users', 'Track results'] },
  { phase: 'Phase 20', title: 'Global Expansion Ready', route: '/global-expansion', items: ['Multiple languages', 'Regional stores', 'International events', 'Global communities'] },
];

export const aiFunctions = [
  ['User Assistant', 'Where can I find the games?'],
  ['Story Assistant', "Tell me about Kotton's Code."],
  ['Shopping Assistant', 'Show me Loyalty Lane collections.'],
  ['Support Assistant', 'Help with my account.'],
] as const;

export const finalChecklist = ['Website foundation', 'Cloudflare + Vercel architecture', 'Entity identity systems', 'Animated backgrounds', 'Music system', 'Asset pipeline', 'Game ecosystem', 'Apparel ecosystem', 'Book ecosystem', 'Media ecosystem', 'AI assistant', 'Lingo ID', 'Wallet architecture', 'Rewards', 'Countdown launches', 'Promotions', 'Ads framework', 'Surveys/forms', 'Legal framework', 'Analytics', 'Admin HQ', 'Expansion roadmap'];

export const finalSystemMap = ['Lingo Legacy HQ', 'Games / Apparel / Books / Media / AI', 'Lingo ID', 'XP + Wallet + Rewards', 'Community + Events', 'Global Expansion'];
