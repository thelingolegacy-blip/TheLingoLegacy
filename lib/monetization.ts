export const monetizationPillars = [
  ['Subscriptions', 'Starter, Pro, Infinity, Media, Creator, and Partner passes with XP multipliers, unlocks, and monthly reward drops.'],
  ['Ads', 'Inline, interstitial, reward, partner, media, shop, and market ads with contextual placement rules.'],
  ['Surveys', 'Reward-linked partner, cultural, product, media, lore, and play surveys.'],
  ['Banners', 'Dynamic hero, partner, shop, market, media, Infinity, and Play banner slots.'],
  ['Beacons', 'Behavioral triggers for XP milestones, inventory changes, quests, media views, purchases, trades, and partner interactions.'],
  ['Geo-Alerts', 'Location-aware partner events, cultural events, shop promotions, market drops, media releases, lore events, and play quests.'],
  ['Strategic Promotions', 'Seasonal, partner, media, shop, market, Infinity, and Play promotions.'],
] as const;

export const subscriptionTypes = [
  ['Starter Pass', 'XP boosts and basic perks.'],
  ['Pro Pass', 'Advanced perks and media unlocks.'],
  ['Infinity Pass', 'Lore unlocks and codex access.'],
  ['Media Pass', 'Series, trailers, and soundscape access.'],
  ['Creator Pass', 'Marketplace tools and creator workflow access.'],
  ['Partner Pass', 'Cultural and commerce partner perks.'],
] as const;

export const subscriptionFeatures = [
  'XP multipliers',
  'Exclusive quests',
  'Exclusive collections',
  'Exclusive media',
  'Exclusive lore',
  'Exclusive partner perks',
  'Wallet bonus slots',
  'Monthly reward drops',
] as const;

export const adTypes = ['Inline ads', 'Interstitial ads', 'Reward ads', 'Partner ads', 'Media ads', 'Shop ads', 'Market ads'] as const;
export const adTargetingSignals = ['XP-based targeting', 'Inventory-based targeting', 'Location-based targeting', 'Partner-based targeting', 'Behavior-based targeting'] as const;

export const surveyTypes = ['Partner surveys', 'Cultural surveys', 'Product surveys', 'Media surveys', 'Lore surveys', 'Play surveys'] as const;
export const surveyRewards = ['XP', 'Items', 'Keys', 'Media unlocks', 'Partner perks'] as const;

export const bannerTypes = ['Hero banners', 'Partner banners', 'Shop banners', 'Market banners', 'Media banners', 'Infinity banners', 'Play banners'] as const;

export const beaconTriggers = [
  'XP milestones',
  'Inventory changes',
  'Quest completions',
  'Media views',
  'Shop purchases',
  'Market trades',
  'Partner interactions',
] as const;

export const beaconActivations = ['Promotions', 'Rewards', 'Ads', 'Surveys', 'Guides', 'Build Mode suggestions'] as const;

export const geoAlertTypes = ['Partner events', 'Cultural events', 'Shop promotions', 'Market promotions', 'Media drops', 'Infinity lore events', 'Play quests'] as const;

export const promotionTypes = ['Seasonal promotions', 'Partner promotions', 'Media promotions', 'Shop promotions', 'Market promotions', 'Infinity promotions', 'Play promotions'] as const;

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

export const askLingoMonetizationActions = [
  'Recommend subscriptions',
  'Explain perks and rewards',
  'Build subscription pages',
  'Build ad campaigns',
  'Generate surveys',
  'Place banners strategically',
  'Explain beacon logic',
  'Prepare geo-alerts',
  'Generate strategic promotions',
] as const;

export const monetizationBuildExamples = [
  'Build a Starter Pass subscription page.',
  'Create a partner reward survey for youth empowerment.',
  'Generate a banner for a Media Pass trailer drop.',
  'Create a beacon for quest completion rewards.',
  'Build a geo-alert for a partner cultural event.',
  'Generate a strategic promotion for Infinity lore access.',
] as const;
