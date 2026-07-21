export type SiteSection = {
  slug: string;
  label: string;
  kicker: string;
  title: string;
  summary: string;
  guidedLinks: string[];
  modules: string[];
  entities: string[];
  sprint: string;
};

export const siteSections: SiteSection[] = [
  {
    slug: 'hq',
    label: 'HQ',
    kicker: 'Command Layer',
    title: 'HQ Command Center',
    summary: 'The operating center for announcements, global missions, system status, rollout waves, and cross-world routing.',
    guidedLinks: ['Command Center', 'Announcements', 'Global Missions', 'System Status'],
    modules: ['Mission control dashboard', 'Release signal wall', 'Global event queue', 'Operational status cards'],
    entities: ['Announcement', 'Mission', 'Event', 'Status'],
    sprint: 'Wave 1 foundation scaffold',
  },
  {
    slug: 'play',
    label: 'Play',
    kicker: 'Progression Layer',
    title: 'Play + XP Engine',
    summary: 'Game hub, quests, achievements, progression loops, rewards, and player activity foundations.',
    guidedLinks: ['Game Hub', 'Quests', 'Achievements', 'XP Engine'],
    modules: ['Playable world cards', 'Quest board', 'Achievement ledger', 'XP rules matrix'],
    entities: ['Game', 'Quest', 'Achievement', 'XP'],
    sprint: 'Wave 3 production buildout',
  },
  {
    slug: 'shop',
    label: 'Shop',
    kicker: 'Commerce Layer',
    title: 'Shop System',
    summary: 'Product, collection, bundle, checkout, drops, and XP-linked purchasing surfaces.',
    guidedLinks: ['Products', 'Collections', 'Bundles', 'Checkout'],
    modules: ['Featured drop shelf', 'Collection grid', 'Bundle builder', 'Checkout readiness panel'],
    entities: ['Product', 'Collection', 'Bundle', 'Order'],
    sprint: 'Wave 4 commerce scaffold',
  },
  {
    slug: 'market',
    label: 'Market',
    kicker: 'Creator Economy',
    title: 'Market Network',
    summary: 'Digital goods, creator marketplace, trading rails, inventory linking, and moderation readiness.',
    guidedLinks: ['Digital Goods', 'Creator Marketplace', 'Trading'],
    modules: ['Digital goods board', 'Creator storefront slots', 'Trade-ready inventory', 'Trust and safety checks'],
    entities: ['DigitalGood', 'Creator', 'Listing', 'Trade'],
    sprint: 'Wave 4 market scaffold',
  },
  {
    slug: 'infinity',
    label: 'Infinity',
    kicker: 'Lore Layer',
    title: 'Infinity Library',
    summary: 'Infinite library, lore codex, worldbuilding assets, story metadata, and canon organization.',
    guidedLinks: ['Infinite Library', 'Lore Codex', 'Worldbuilding Assets'],
    modules: ['Lore shelf', 'Codex index', 'World asset registry', 'Canon status pipeline'],
    entities: ['Story', 'LoreEntry', 'WorldAsset', 'CanonTag'],
    sprint: 'Wave 4 infinity scaffold',
  },
  {
    slug: 'profile',
    label: 'Profile',
    kicker: 'Identity Layer',
    title: 'Profile + Lingo ID',
    summary: 'Identity, inventory, rewards, settings, subscriptions, permissions, badges, and saved progress.',
    guidedLinks: ['Identity', 'Inventory', 'Rewards', 'Settings'],
    modules: ['Lingo ID card', 'Inventory vault', 'Reward status', 'Preference center'],
    entities: ['User', 'Inventory', 'Reward', 'Subscription'],
    sprint: 'Wave 1 identity scaffold',
  },
  {
    slug: 'media-network',
    label: 'Media',
    kicker: 'Media Layer',
    title: 'Media Network',
    summary: 'Series, trailers, sound, releases, playlists, and media object metadata foundations.',
    guidedLinks: ['Series', 'Trailers', 'Sound', 'Releases'],
    modules: ['Series rail', 'Trailer room', 'Sound archive', 'Release calendar'],
    entities: ['Media', 'Series', 'Trailer', 'Release'],
    sprint: 'Wave 2 content scaffold',
  },
  {
    slug: 'ask-lingo',
    label: 'Ask Lingo',
    kicker: 'Intelligence Layer',
    title: 'Ask Lingo Routing System',
    summary: 'Universal navigation, voice guidance, smart recommendations, search, and cross-module route suggestions.',
    guidedLinks: ['Universal Navigation', 'Voice Guidance', 'Smart Recommendations', 'Cross-Module Routing'],
    modules: ['Intent launcher', 'Voice-ready prompts', 'Recommendation paths', 'Module route map'],
    entities: ['Intent', 'Prompt', 'Recommendation', 'Route'],
    sprint: 'Wave 5 intelligence scaffold',
  },
];

export const coreLayers = [
  'Core OS Layer',
  'Content Engine',
  'Commerce Layer',
  'Play Layer',
  'Ask Lingo Intelligence Layer',
  'Profile Layer',
  'Media Network Layer',
  'HQ Layer',
];

export const waves = [
  ['Wave 1', 'Foundation', 'Global Shell, Navigation System, Identity + Profile'],
  ['Wave 2', 'Content', 'Media Network, Series + Trailers, Stories + Lore'],
  ['Wave 3', 'Play', 'Games, Quests, XP Engine'],
  ['Wave 4', 'Commerce', 'Shop, Market, Infinity'],
  ['Wave 5', 'Intelligence', 'Ask Lingo, Voice, Smart Routing'],
  ['Wave 6', 'Finalization', 'Assets, Animations, Sounds, Deployment'],
] as const;

export function getSection(slug: string) {
  return siteSections.find((section) => section.slug === slug);
}
