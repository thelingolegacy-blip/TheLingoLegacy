export type SiteSection = {
  slug: string;
  label: string;
  kicker: string;
  title: string;
  summary: string;
  guidedLinks: string[];
  modules: string[];
  entities: string[];
  interactions: string[];
  assets: string[];
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
    interactions: ['Open mission detail', 'Filter active announcements', 'Check system status', 'Route to next wave'],
    assets: ['Command cards', 'Status indicators', 'Mission badges', 'Event banners'],
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
    interactions: ['Start quest', 'Claim achievement', 'Preview XP reward', 'Open game world'],
    assets: ['Quest icons', 'Achievement medals', 'XP meter', 'Game tiles'],
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
    interactions: ['View product', 'Build bundle', 'Add to cart placeholder', 'Open checkout readiness'],
    assets: ['Product cards', 'Collection artwork', 'Drop banners', 'Bundle badges'],
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
    interactions: ['Inspect listing', 'Open creator profile', 'Preview trade flow', 'Flag moderation state'],
    assets: ['Digital good covers', 'Creator badges', 'Trade chips', 'Trust labels'],
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
    interactions: ['Open lore entry', 'Filter canon state', 'Browse world asset', 'Route story to media'],
    assets: ['Lore art', 'Codex cards', 'World maps', 'Canon seals'],
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
    interactions: ['Open profile card', 'Inspect inventory item', 'Review reward state', 'Edit settings placeholder'],
    assets: ['Avatar frame', 'Badge set', 'Inventory slots', 'Reward tokens'],
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
    interactions: ['Open series', 'Play trailer placeholder', 'Browse sound pack', 'Subscribe to release'],
    assets: ['Series posters', 'Trailer thumbnails', 'Sound waveform cards', 'Release badges'],
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
    entities: ['AskLingoSession', 'AskLingoIntent', 'AskLingoRecommendation', 'AskLingoBuildRequest', 'AskLingoBuildOutput', 'AskLingoBuildHistory', 'Route'],
    interactions: ['Select intent', 'Preview voice prompt', 'Follow recommendation', 'Jump across modules'],
    assets: ['Assistant orb', 'Prompt chips', 'Route lines', 'Recommendation cards'],
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

export const assetRegistry = [
  ['UI Kit', 'Buttons, cards, shells, command panels, forms, modal placeholders'],
  ['Iconography', 'Section sigils, entity icons, action chips, status indicators'],
  ['Animations', 'Boot sequence, hover lift, pulse states, route-line motion'],
  ['Sound Pack', 'Interface cues, trailer stingers, unlock sounds, ambient loops'],
  ['Branding', 'LL sigil, color system, typography scale, noir metal treatment'],
  ['Lore Art', 'World maps, codex covers, character silhouettes, canon seals'],
  ['Game Assets', 'Quest badges, XP meters, achievement medals, playable world tiles'],
] as const;

export const entityModel = [
  ['User', 'Identity, profile state, permissions, settings, subscriptions'],
  ['XP', 'Progress totals, earning rules, spend rules, reward thresholds'],
  ['Quest', 'Objectives, status, rewards, eligibility, linked worlds'],
  ['Product', 'Merch, digital goods, bundles, collections, checkout metadata'],
  ['Media', 'Series, trailers, sounds, releases, playlists, metadata'],
  ['Story', 'Lore entries, canon tags, chapters, worldbuilding assets'],
  ['Reward', 'Badges, inventory unlocks, XP-linked benefits, claims'],
  ['Inventory', 'Owned goods, saved media, unlocked assets, trade-ready items'],
] as const;

export const interactionModels = [
  ['Guided Link', 'Every module exposes direct jump points into its deeper subsystem.'],
  ['Command Card', 'Each page has a current sprint panel showing build readiness and next execution target.'],
  ['Entity Rail', 'Core entities are shown as implementation slots before persistence is connected.'],
  ['Asset Slot', 'Asset needs are visible per subsystem without fabricating final creative files.'],
  ['Ask Lingo Route', 'Assistant routing is scaffolded as cross-module navigation and intent placeholders.'],
] as const;

export function getSection(slug: string) {
  return siteSections.find((section) => section.slug === slug);
}
