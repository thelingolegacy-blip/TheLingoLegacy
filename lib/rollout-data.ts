export const releaseFlow = ['Tease', 'Reveal', 'Countdown', 'Early Access', 'Launch Day', 'Community Event', 'Update Cycle'];

export const marketingSystems = [
  { title: 'Campaigns', items: ['Launch plans', 'Promo calendars', 'Audience segments', 'Creator pushes'] },
  { title: 'Promotions', items: ['Homepage features', 'Countdown cards', 'Announcement pages', 'Reward events'] },
  { title: 'Ads', items: ['Website placements', 'Reward-based game ads', 'Partner features', 'Family-safe rules'] },
  { title: 'Social Content', items: ['TikTok', 'YouTube Shorts', 'Instagram', 'Facebook', 'X', 'LinkedIn'] },
  { title: 'Email', items: ['Welcome series', 'Launch reminders', 'Drop alerts', 'Reward unlocks'] },
  { title: 'Community Growth', items: ['Challenges', 'Creator applications', 'Beta invites', 'Referral loops'] },
];

export const entityCampaigns = [
  { entity: "That's My Lingo", theme: 'Game Promotion System', assets: ['Gameplay trailers', 'Character reveals', 'Feature announcements', 'Daily rewards campaigns', 'Beta invitations'], campaigns: ['Level Up Week', 'Double XP Event', 'New Machine Drop', 'Community Challenge'] },
  { entity: "Kotton's Code", theme: 'Enter The Code', assets: ['Character introductions', 'Story previews', 'Animated shorts', 'Reading challenges', 'Parent/community updates'], campaigns: ['Discover', 'Read', 'Play', 'Collect', 'Unlock'] },
  { entity: 'Loyalty Lane', theme: 'Apparel Marketing Engine', assets: ['Product photography', '3D previews', 'Fashion videos', 'Customer content'], campaigns: ['Collection Created', 'Lookbook Release', 'Countdown', 'Drop Day', 'Customer Showcase', 'Archive'] },
  { entity: 'Legacy Books', theme: 'New Story Unlocked', assets: ['Cover reveals', 'First-page previews', 'Character artwork', 'Author announcements', 'Audiobook previews'], campaigns: ['Preview', 'Release', 'Reader Rewards', 'Community Discussion'] },
  { entity: 'Lingo Legacy Media', theme: 'Studio Release Flow', assets: ['Posters', 'Trailers', 'Teasers', 'Clips', 'Behind-the-scenes'], campaigns: ['Announce', 'Teaser', 'Trailer', 'Premiere', 'Aftershow'] },
];

export const contentVault = [
  ['VIDEOS', ['trailers', 'shorts', 'tutorials']],
  ['IMAGES', ['posters', 'banners', 'social cards']],
  ['AUDIO', ['music', 'voice', 'podcasts']],
  ['CAMPAIGNS', ['launches', 'events', 'promotions']],
] as const;

export const emailSeries = ['Welcome to The Lingo Legacy', 'Explore the Worlds', 'Create Your Lingo ID', 'Unlock Rewards', 'Upcoming Releases'];

export const pushExamples = ['Your daily reward is ready.', 'A new Loyalty Lane drop is arriving.', 'A new chapter has unlocked.', 'A new trailer is live.'];

export const businessModules = [
  { title: 'Users', items: ['Accounts', 'Profiles', 'Permissions', 'Privacy controls'] },
  { title: 'Games', items: ['Game registry', 'Leaderboards', 'Metrics', 'Reward rules'] },
  { title: 'Commerce', items: ['Products', 'Sizes', 'Inventory', 'Orders', 'Drops'] },
  { title: 'Books', items: ['Catalog', 'Chapters', 'Audiobooks', 'Reading progress'] },
  { title: 'Media', items: ['Videos', 'Trailers', 'Posters', 'Premieres'] },
  { title: 'Campaigns', items: ['Launch calendars', 'Promo assets', 'Email', 'Social'] },
  { title: 'Analytics', items: ['Visitors', 'Signups', 'Sessions', 'Orders', 'Watch time'] },
  { title: 'Assets', items: ['Upload', 'Review', 'Approve', 'Schedule', 'Archive'] },
  { title: 'Legal', items: ['Policies', 'Consent', 'Data requests', 'DMCA'] },
  { title: 'Support', items: ['Account help', 'Orders', 'Rewards', 'Games', 'Technical support'] },
];

export const cloudArchitecture = ['Cloudflare DNS/CDN/security', 'Vercel Website', 'Firebase Backend', 'Storage + Database', 'Game / Commerce / Media Systems'];

export const futureExpansion = ['Mobile apps', 'Smart TV gaming', 'Multiplayer systems', 'Creator marketplace', 'Digital collectibles', 'Community hubs', 'International expansion'];

export const developmentSpec = {
  pages: ['/', '/games', '/apparel', '/books', '/media', '/rewards', '/lingo-id', '/ai-lab', '/events', '/maps', '/community', '/launch', '/marketing', '/press', '/admin', '/business-operations', '/help', '/production-scale', '/future-expansion'],
  components: ['Navigation', 'Footer', 'UniverseMap', 'CountdownCard', 'MarketingCommandCenter', 'ContentVault', 'BusinessOpsPanel', 'SupportHub', 'ArchitectureFlow', 'AIHelper', 'AudioController'],
  collections: ['users', 'profiles', 'campaigns', 'launches', 'assets', 'products', 'orders', 'games', 'leaderboards', 'books', 'media', 'surveys', 'supportTickets', 'legalRequests'],
  apis: ['/api/waitlist', '/api/notifications', '/api/surveys', '/api/support', '/api/assets', '/api/campaigns', '/api/rewards', '/api/profile'],
  deployment: ['GitHub PR', 'Vercel preview', 'Build validation', 'Production promotion', 'Domain alias', 'Analytics review'],
  firebase: ['Authentication', 'Firestore collections', 'Storage buckets', 'Security rules', 'Cloud functions optional'],
  checklist: ['Brand assets loaded', 'Legal pages reviewed', 'Countdowns configured', 'Forms connected', 'Analytics enabled', 'Email provider connected', 'Firebase rules reviewed', 'Production domain verified'],
};
