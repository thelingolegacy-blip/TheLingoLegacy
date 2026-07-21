export type SubdomainSite = {
  slug: string;
  host: string;
  label: string;
  title: string;
  role: string;
  home: string;
  pages: string[];
  askPrompt: string;
  accent: string;
};

export const subdomainSites: SubdomainSite[] = [
  {
    slug: 'hq',
    host: 'hq.thelingolegacy.com',
    label: 'HQ',
    title: 'Command & Culture HQ',
    role: 'Mission, season, announcement, campaign, status, and ecosystem command center.',
    home: 'HQ Overview',
    pages: ['Announcements', 'Missions & Campaigns', 'System Status', 'About Lingo Legacy'],
    askPrompt: 'Ask Lingo: What is happening today?',
    accent: 'Command',
  },
  {
    slug: 'play',
    host: 'play.thelingolegacy.com',
    label: 'Play',
    title: 'Games, Quests, XP',
    role: 'Games, quests, achievements, XP progression, guides, and player journey surface.',
    home: 'Play Home',
    pages: ['Game Hub', 'Quests', 'Achievements', 'XP Engine', 'Guides'],
    askPrompt: 'Ask Lingo: What should I play next?',
    accent: 'Progression',
  },
  {
    slug: 'shop',
    host: 'shop.thelingolegacy.com',
    label: 'Shop',
    title: 'Commerce Storefront',
    role: 'Collections, products, bundles, checkout readiness, gifting, and XP-linked commerce.',
    home: 'Shop Home',
    pages: ['Collections', 'Products', 'Bundles', 'Checkout', 'Gift & Support'],
    askPrompt: 'Ask Lingo: What should I get?',
    accent: 'Commerce',
  },
  {
    slug: 'market',
    host: 'market.thelingolegacy.com',
    label: 'Market',
    title: 'Digital Goods & Creators',
    role: 'Creator marketplace, digital goods, trading, listings, rules, and curation logic.',
    home: 'Market Home',
    pages: ['Digital Goods', 'Creator Marketplace', 'Trading', 'Listings & Rules'],
    askPrompt: 'Ask Lingo: What is trending?',
    accent: 'Creator',
  },
  {
    slug: 'infinity',
    host: 'infinity.thelingolegacy.com',
    label: 'Infinity',
    title: 'Lore, Codex, Worldbuilding',
    role: 'Lore universe, codex entries, stories, world assets, reading paths, and curated lore lab.',
    home: 'Infinity Home',
    pages: ['Lore Codex', 'Stories', 'Worldbuilding Assets', 'Reading Paths', 'Creator Lore Lab'],
    askPrompt: 'Ask Lingo: Show me lore about Avalon.',
    accent: 'Lore',
  },
  {
    slug: 'profile',
    host: 'profile.thelingolegacy.com',
    label: 'Profile',
    title: 'Identity, Inventory, Rewards',
    role: 'Avatar, XP, inventory, rewards, settings, linked accounts, and personal journey timeline.',
    home: 'Profile Home',
    pages: ['XP & Progression', 'Inventory', 'Rewards', 'Settings', 'Journeys'],
    askPrompt: 'Ask Lingo: Optimize my XP and rewards.',
    accent: 'Identity',
  },
  {
    slug: 'media',
    host: 'media.thelingolegacy.com',
    label: 'Media',
    title: 'Series, Trailers, Audio/Visual',
    role: 'Series, episodes, trailers, soundscapes, playlists, and behind-the-scenes content.',
    home: 'Media Home',
    pages: ['Series', 'Trailers', 'Sound', 'Playlists', 'Behind the Scenes'],
    askPrompt: 'Ask Lingo: What should I watch or listen to?',
    accent: 'Signal',
  },
  {
    slug: 'lingo',
    host: 'lingo.thelingolegacy.com',
    label: 'Lingo.ai',
    title: 'Ask Lingo / Lingo.ai Hub',
    role: 'Ask Lingo console, guide mode, build mode, navigation mode, dev docs, and experiments.',
    home: 'Ask Lingo Home',
    pages: ['Guide Mode', 'Build Mode', 'Navigation Mode', 'Dev & Ops', 'Changelog & Experiments'],
    askPrompt: 'Ask Lingo: Build, guide, navigate, or explain the OS.',
    accent: 'Intelligence',
  },
  {
    slug: 'partners',
    host: 'partners.thelingolegacy.com',
    label: 'Partners',
    title: 'Partnership System',
    role: 'Partner programs, cultural alliances, commerce collaborations, technology integrations, community impact, and Ask Lingo partner build flows.',
    home: 'Partner Home',
    pages: ['Partner Network', 'Partner Programs', 'Partner Tools', 'Become a Partner', 'Partner Stories', 'Partner Media', 'Partner Support'],
    askPrompt: 'Ask Lingo: Build a partner page, quest, guide, story, collection, or onboarding flow.',
    accent: 'Alliance',
  },
];

export function pageToSlug(page: string) {
  return page.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function getSubdomainSite(slug: string) {
  return subdomainSites.find((site) => site.slug === slug);
}

export function getSubdomainPage(siteSlug: string, pageSlug: string) {
  const site = getSubdomainSite(siteSlug);
  if (!site) return null;

  const pages = [site.home, ...site.pages];
  const page = pages.find((candidate) => pageToSlug(candidate) === pageSlug);
  return page ? { site, page } : null;
}
