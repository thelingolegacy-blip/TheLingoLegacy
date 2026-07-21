export type AskLingoIntentCategory = 'navigation' | 'play' | 'commerce' | 'lore' | 'media' | 'profile' | 'help';

export type AskLingoIntent = {
  category: AskLingoIntentCategory;
  label: string;
  prompt: string;
  targetModule: string;
  targetRoute: string;
  primaryAction: string;
  response: string;
};

export const askLingoSurfaces = [
  ['Global Dock', 'Persistent Ask Lingo access from the navigation shell and floating assistant orb.'],
  ['Overlay Panel', 'Slide-over assistant panel for text prompts, quick chips, results, and route actions.'],
  ['Voice Orb', 'Voice-ready activation surface for hold-to-speak and future wake phrase support.'],
  ['Inline Prompts', 'Contextual Ask Lingo prompts embedded into HQ, Play, Shop, Market, Infinity, Profile, and Media.'],
] as const;

export const askLingoLocalPrompts = [
  ['HQ', 'What is happening today?', '/hq'],
  ['Play', 'What should I play next?', '/play'],
  ['Shop', 'What should I get?', '/shop'],
  ['Market', 'What is trending?', '/market'],
  ['Infinity', 'Show me lore about Avalon.', '/infinity'],
  ['Profile', 'Optimize my XP and rewards.', '/profile'],
  ['Media Network', 'What should I watch or listen to?', '/media-network'],
] as const;

export const askLingoIntents: AskLingoIntent[] = [
  {
    category: 'navigation',
    label: 'Open a module',
    prompt: 'Take me to the right place.',
    targetModule: 'HQ Router',
    targetRoute: '/hq',
    primaryAction: 'Open HQ',
    response: 'I can route you to the right module, page, quest, product, story, reward, or media surface.',
  },
  {
    category: 'play',
    label: 'Find a game',
    prompt: 'What should I play?',
    targetModule: 'Play',
    targetRoute: '/play',
    primaryAction: 'Open Game Hub',
    response: 'Start in Play. I will surface game worlds, quests, difficulty paths, achievements, and XP actions here.',
  },
  {
    category: 'commerce',
    label: 'Browse starter items',
    prompt: 'I want something from the shop.',
    targetModule: 'Shop + Market',
    targetRoute: '/shop',
    primaryAction: 'Open Shop',
    response: 'I can guide users toward products, bundles, collections, digital goods, and XP-aligned starter kits.',
  },
  {
    category: 'lore',
    label: 'Explore lore',
    prompt: 'Tell me about Avalon.',
    targetModule: 'Infinity',
    targetRoute: '/infinity',
    primaryAction: 'Open Lore Codex',
    response: 'Infinity is the lore and worldbuilding layer. I can route lore questions to stories, codex entries, and world assets.',
  },
  {
    category: 'media',
    label: 'Show trailers',
    prompt: 'Play something for me.',
    targetModule: 'Media Network',
    targetRoute: '/media-network',
    primaryAction: 'Open Media Network',
    response: 'I can recommend series, trailers, sounds, releases, and playlists once the media catalog is connected.',
  },
  {
    category: 'profile',
    label: 'Review my XP',
    prompt: 'How do I level up?',
    targetModule: 'Profile',
    targetRoute: '/profile',
    primaryAction: 'Open Profile',
    response: 'Profile will hold XP, badges, inventory, rewards, settings, and progress signals for deeper personalization.',
  },
  {
    category: 'help',
    label: 'I am lost',
    prompt: 'What is Lingo Legacy?',
    targetModule: 'Ask Lingo',
    targetRoute: '/ask-lingo',
    primaryAction: 'Start Guided Tour',
    response: 'Lingo Legacy is a connected OS of HQ, Play, Shop, Market, Infinity, Profile, Media, and Ask Lingo routing.',
  },
];

export const askLingoSmartSuggestions = [
  'You have a new quest slot ready to scaffold.',
  'You are one reward action away from a profile milestone placeholder.',
  'You have not visited Infinity yet. Start with a guided lore tour.',
] as const;

export const askLingoGuidanceSteps = [
  'Open the target module from Ask Lingo.',
  'Choose the suggested page, quest, product, story, reward, or media route.',
  'Review the action card and confirm the next step.',
  'Use Do it for me to auto-navigate when the real flow is connected.',
] as const;

export const askLingoDataEntities = [
  ['AskLingoSession', 'id, user_id, started_at, context_module, last_intent_type'],
  ['AskLingoIntent', 'id, session_id, raw_input, input_type, intent_category, target_module, target_entity_type, target_entity_id'],
  ['AskLingoRecommendation', 'id, intent_id, entity_type, entity_id, rank, reason'],
] as const;

export const askLingoRoadmap = [
  ['1', 'Core UI, overlay, dock button'],
  ['2', 'Intent detection and routing to modules'],
  ['3', 'Rules-based recommendations from XP, inventory, and recent activity'],
  ['4', 'Voice capture and playback'],
  ['5', 'Guided flows with Do it for me navigation'],
  ['6', 'Long-term personalization from history and preferences'],
] as const;
