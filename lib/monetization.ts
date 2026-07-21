export type MonetizationSystem = {
  slug: string;
  title: string;
  summary: string;
  types: readonly string[];
  signals: readonly string[];
  actions: readonly string[];
  safety: string;
};

export const monetizationPillars = [
  ['Subscriptions', 'Starter, Pro, Infinity, Media, Creator, and Partner passes with XP multipliers, unlocks, and monthly reward drops.'],
  ['Ads', 'Inline, interstitial, reward, partner, media, shop, and market ads with contextual placement rules.'],
  ['Surveys', 'Reward-linked partner, cultural, product, media, lore, and play surveys.'],
  ['Banners', 'Dynamic hero, partner, shop, market, media, Infinity, and Play banner slots.'],
  ['Beacons', 'Behavioral triggers for XP milestones, inventory changes, quests, media views, purchases, trades, and partner interactions.'],
  ['Geo-Alerts', 'Location-aware partner events, cultural events, shop promotions, market drops, media releases, lore events, and play quests.'],
  ['Strategic Promotions', 'Seasonal, partner, media, shop, market, Infinity, and Play promotions.'],
] as const;

export const subscriptionTypes = ['Starter Pass', 'Pro Pass', 'Infinity Pass', 'Media Pass', 'Creator Pass', 'Partner Pass'] as const;
export const subscriptionFeatures = ['XP multipliers', 'Exclusive quests', 'Exclusive collections', 'Exclusive media', 'Exclusive lore', 'Exclusive partner perks', 'Wallet bonus slots', 'Monthly reward drops'] as const;

export const adTypes = ['Inline ads', 'Interstitial ads', 'Reward ads', 'Partner ads', 'Media ads', 'Shop ads', 'Market ads'] as const;
export const adTargetingSignals = ['XP level', 'Inventory', 'Location placeholder', 'Behavior placeholder', 'Partner affiliations', 'Recent activity', 'Module context'] as const;

export const surveyTypes = ['Partner surveys', 'Cultural surveys', 'Product surveys', 'Media surveys', 'Lore surveys', 'Play surveys'] as const;
export const surveyRewards = ['XP', 'Items', 'Keys', 'Media unlocks', 'Partner perks'] as const;

export const bannerTypes = ['Hero banners', 'Partner banners', 'Shop banners', 'Market banners', 'Media banners', 'Infinity banners', 'Play banners'] as const;

export const beaconTriggers = ['XP milestones', 'Inventory changes', 'Quest completions', 'Media views', 'Shop purchases', 'Market trades', 'Partner interactions'] as const;
export const beaconActivations = ['Promotions', 'Rewards', 'Ads', 'Surveys', 'Guides', 'Build Mode suggestions'] as const;

export const geoAlertTypes = ['Partner events', 'Cultural events', 'Shop promotions', 'Market promotions', 'Media drops', 'Infinity lore events', 'Play quests'] as const;
export const promotionTypes = ['Seasonal promotions', 'Partner promotions', 'Media promotions', 'Shop promotions', 'Market promotions', 'Infinity promotions', 'Play promotions'] as const;

export const monetizationSystems: MonetizationSystem[] = [
  {
    slug: 'subscriptions',
    title: 'Subscription System',
    summary: 'Global OS passes with XP, media, lore, creator, partner, and reward-linked perks.',
    types: subscriptionTypes,
    signals: subscriptionFeatures,
    actions: ['Explain pass perks', 'Recommend pass tier', 'Build subscription page', 'Preview monthly reward drop'],
    safety: 'No checkout, payment processor, entitlements, or recurring billing is active.',
  },
  {
    slug: 'ads',
    title: 'Ads System',
    summary: 'Contextual ad surfaces for inline, interstitial, reward, partner, media, shop, and market placements.',
    types: adTypes,
    signals: adTargetingSignals,
    actions: ['Build ad campaign', 'Preview placement', 'Explain targeting logic', 'Route to partner offer'],
    safety: 'No ad network, tracking pixel, auction, behavioral profile, or live ad serving is active.',
  },
  {
    slug: 'surveys',
    title: 'Survey System',
    summary: 'Reward-linked surveys for partners, culture, products, media, lore, and play loops.',
    types: surveyTypes,
    signals: surveyRewards,
    actions: ['Generate survey', 'Explain reward', 'Route user to survey', 'Preview completion reward'],
    safety: 'No response collection, identity linkage, analytics export, or reward issuance is active.',
  },
  {
    slug: 'banners',
    title: 'Banner System',
    summary: 'Dynamic context-aware banner slots across every module and subdomain.',
    types: bannerTypes,
    signals: ['Module context', 'Campaign status', 'Partner lane', 'Season', 'XP milestone'],
    actions: ['Generate banner copy', 'Preview placement', 'Place banner strategically', 'Route banner CTA'],
    safety: 'No remote campaign manager or live placement engine is active.',
  },
  {
    slug: 'beacons',
    title: 'Beacon System',
    summary: 'Behavioral trigger contracts for rewards, promotions, ads, surveys, guides, and Build Mode suggestions.',
    types: beaconTriggers,
    signals: beaconActivations,
    actions: ['Create beacon rule', 'Explain beacon logic', 'Preview triggered reward', 'Route triggered guide'],
    safety: 'No behavioral event collection, tracking, or automated triggering is active.',
  },
  {
    slug: 'geo-alerts',
    title: 'Geo-Alert System',
    summary: 'Location-aware promotion placeholders for partner events, cultural events, drops, lore events, and quests.',
    types: geoAlertTypes,
    signals: ['Opt-in location placeholder', 'Event region', 'Partner venue', 'Campaign window', 'User preferences'],
    actions: ['Prepare geo-alert', 'Explain location logic', 'Preview event card', 'Route to partner event'],
    safety: 'No geolocation request, background location, push notification, or alert sending is active.',
  },
  {
    slug: 'promotions',
    title: 'Strategic Promotion System',
    summary: 'Timed and XP-aware campaign scaffolds for seasonal, partner, media, shop, market, Infinity, and Play promotions.',
    types: promotionTypes,
    signals: ['Season', 'XP tier', 'Module context', 'Partner lane', 'Inventory state', 'Campaign schedule'],
    actions: ['Generate promotion', 'Preview offer', 'Build campaign page', 'Explain optimization logic'],
    safety: 'No live campaign deployment, pricing change, entitlement, or automated optimization is active.',
  },
];

export const monetizationIntegrations = [
  ['HQ', 'Partner promotions, global events, seasonal drops, launch banners, and strategic campaign status.'],
  ['Play', 'XP boosts, quest rewards, achievement perks, rewarded surveys, and play promotions.'],
  ['Shop', 'Collections, bundles, drops, subscription offers, wallet bonuses, and contextual shop banners.'],
  ['Market', 'Digital goods, creator promotions, partner goods, market banners, and trade-triggered beacons.'],
  ['Infinity', 'Lore unlocks, codex passes, reading-path promotions, and cultural archive monetization slots.'],
  ['Media', 'Series passes, trailer drops, soundscape access, media ads, and watch-triggered beacons.'],
  ['Profile', 'XP multipliers, reward boosts, pass status, survey rewards, wallet bonuses, and inventory-linked offers.'],
  ['Partners', 'Partner passes, partner promotions, sponsored surveys, co-branded campaigns, and event geo-alerts.'],
  ['Ask Lingo', 'Recommend, explain, build, trigger, optimize, and route monetization surfaces safely.'],
] as const;

export const askLingoMonetizationActions = ['Recommend subscriptions', 'Explain perks and rewards', 'Build subscription pages', 'Build ad campaigns', 'Generate surveys', 'Place banners strategically', 'Explain beacon logic', 'Prepare geo-alerts', 'Generate strategic promotions'] as const;

export const monetizationBuildExamples = ['Build a Starter Pass subscription page.', 'Create a partner reward survey for youth empowerment.', 'Generate a banner for a Media Pass trailer drop.', 'Create a beacon for quest completion rewards.', 'Build a geo-alert for a partner cultural event.', 'Generate a strategic promotion for Infinity lore access.'] as const;

export const monetizationAudit = [
  ['Consent', 'Location, behavior, survey, and reward flows must require explicit opt-in before activation.'],
  ['Payments', 'Subscriptions need checkout, receipts, entitlement checks, cancellation, and billing support before launch.'],
  ['Ads', 'Ad campaigns need disclosure, targeting rules, partner approvals, and placement review before serving.'],
  ['Rewards', 'XP, keys, items, and media unlocks need fraud controls and claim history before issuance.'],
  ['Privacy', 'Behavioral and contextual monetization needs data minimization, retention rules, and user controls.'],
  ['Operations', 'Every campaign needs owner, start/end date, status, rollback, and audit trail before deployment.'],
] as const;

export const activationChecklist = ['Choose monetization owner', 'Define consent model', 'Select payment/ad/survey providers', 'Add entitlement storage', 'Add campaign approval workflow', 'Add analytics and audit logging', 'Run legal/privacy review', 'Launch behind feature flags'] as const;

export function getMonetizationSystem(slug: string) {
  return monetizationSystems.find((system) => system.slug === slug);
}
