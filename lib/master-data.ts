export const brandCore = {
  name: 'The Lingo Legacy',
  purpose: ['Digital entertainment ecosystem', 'Game universe', 'Publishing platform', 'Apparel and lifestyle brand', 'Media studio', 'Community network'],
  message: 'Loyalty. Legacy. Language.',
};

export const routes = [
  '/', '/games', '/apparel', '/books', '/media', '/rewards', '/lingo-id', '/ai-lab', '/events', '/maps', '/community', '/launch', '/asset-production', '/master-data', '/user-experience', '/admin',
];

export const launchEntities = [
  {
    title: "That's My Lingo",
    type: 'Game Launch',
    route: '/games',
    launchDate: '2026-08-15T18:00:00-04:00',
    milestones: ['Demo release', 'Beta testing', 'Full launch', 'Updates'],
    promos: ['Gameplay trailers', 'Character reveals', 'Daily challenges', 'Leaderboard announcements'],
  },
  {
    title: "Kotton's Code",
    type: 'Story Universe',
    route: '/books',
    launchDate: '2026-09-01T18:00:00-04:00',
    milestones: ['Book releases', 'Game chapters', 'Episodes', 'Merchandise drops'],
    promos: ['Character reveals', 'Story previews', 'Read-along events'],
  },
  {
    title: 'Loyalty Lane Apparel',
    type: 'Apparel Drop',
    route: '/apparel',
    launchDate: '2026-09-15T12:00:00-04:00',
    milestones: ['Collection drops', 'Limited editions', 'Seasonal releases'],
    promos: ['Lookbooks', 'Fashion videos', 'Product previews', 'Early access signup'],
  },
  {
    title: 'Legacy Books',
    type: 'Publishing Release',
    route: '/books',
    launchDate: '2026-10-01T12:00:00-04:00',
    milestones: ['New book releases', 'Audiobook releases', 'Special editions'],
    promos: ['First chapter previews', 'Author updates', 'Character artwork'],
  },
  {
    title: 'Lingo Legacy Media',
    type: 'Studio Premiere',
    route: '/media',
    launchDate: '2026-10-21T20:00:00-04:00',
    milestones: ['Trailer drops', 'Series launches', 'Behind-the-scenes releases'],
    promos: ['Teasers', 'Posters', 'Premiere events'],
  },
];

export const gameRegistry = [
  { name: "That's My Lingo", type: 'HTML5 Casino/Social Game', systems: ['Slot Engine', '5x3 reels', '20 paylines', 'Demo Coins', 'Loyalty Bucks', 'Lingo Tokens'] },
  { name: 'Spades Is My Lingo', type: 'Card Game', systems: ['Matches', 'Rankings', 'Player profiles', 'Rewards'] },
  { name: 'UhOh Lingo University', type: 'Educational/Social Game', systems: ['Challenges', 'Mini-games', 'XP progression'] },
  { name: 'Lingo City: Grand Legacy', type: 'Open-world social experience', systems: ['Characters', 'Economy', 'Businesses', 'Community'] },
  { name: 'Crazy Weasel', type: 'Arcade Experience', systems: ['Levels', 'Challenges', 'Collectibles'] },
  { name: "Tricia's Escape", type: 'Adventure Game', systems: ['Story missions', 'Progression'] },
  { name: 'Doughboy Oasis', type: 'Adventure/Social World', systems: ['Exploration', 'Rewards'] },
  { name: 'Legacy Zombies: Jersey Shore Tide Aftermath', type: 'Survival Game', systems: ['Missions', 'Waves', 'Upgrades'] },
  { name: 'Bulldogs Loyalty Bridge', type: 'Community Adventure', systems: ['Team challenges', 'Loyalty mechanics'] },
];

export const assetArchitecture = [
  ['CORE_SYSTEM', ['branding', 'logos', 'fonts', 'colors', 'UI_components', 'navigation', 'backgrounds', 'animations', 'audio']],
  ['GAMES_ENGINE', ['thats_my_lingo', 'spades_is_my_lingo', 'uhoh_lingo_university', 'lingo_city', 'crazy_weasel', 'tricias_escape', 'doughboy_oasis', 'legacy_zombies', 'bulldogs_loyalty_bridge']],
  ['APPAREL_ENGINE', ['loyalty_lane', 'tap_stitch', 'obsidian_closet', 'product_images', '3d_models', 'campaigns']],
  ['BOOKS_ENGINE', ['kottons_code', 'covers', 'illustrations', 'audio_books', 'reading_interface']],
  ['MEDIA_ENGINE', ['trailers', 'youtube', 'tiktok', 'animations', 'music', 'behind_the_scenes']],
  ['AI_ENGINE', ['assistant', 'prompts', 'characters', 'knowledge_base']],
  ['MARKETING_ENGINE', ['ads', 'promos', 'countdowns', 'email', 'social']],
] as const;

export const legalPages = [
  { href: '/privacy-policy', title: 'Privacy Policy', copy: 'Data collection, marketing opt-ins, preferences, export requests, and account deletion workflow.' },
  { href: '/terms', title: 'Terms of Service', copy: 'Website, account, games, media, rewards, and commerce usage terms.' },
  { href: '/cookies', title: 'Cookie Policy', copy: 'Cookie consent, analytics preferences, and marketing controls.' },
  { href: '/community-guidelines', title: 'Community Guidelines', copy: 'Family-safe behavior, moderation rules, and creator conduct.' },
  { href: '/refunds', title: 'Refund Policy', copy: 'Digital rewards, apparel, events, and order support routing.' },
  { href: '/accessibility', title: 'Accessibility Statement', copy: 'Accessible navigation, content standards, and feedback channel.' },
  { href: '/dmca', title: 'DMCA Policy', copy: 'Copyright takedown and counter-notice intake workflow.' },
  { href: '/contact', title: 'Contact', copy: 'General support, creator applications, partner inquiries, and privacy requests.' },
  { href: '/shipping', title: 'Shipping Policy', copy: 'Apparel shipping status, carriers, processing windows, and tracking.' },
  { href: '/returns', title: 'Returns Policy', copy: 'Return eligibility, exchange windows, product condition, and support intake.' },
  { href: '/order-policy', title: 'Order Policy', copy: 'Product terms, preorders, limited drops, and order tracking.' },
];
