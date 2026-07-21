export type AskLingoIntentCategory = 'navigation' | 'play' | 'commerce' | 'lore' | 'media' | 'profile' | 'help' | 'build';

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
  ['HQ', 'What is happening today?', '/sites/hq'],
  ['Play', 'What should I play next?', '/sites/play'],
  ['Shop', 'What should I get?', '/sites/shop'],
  ['Market', 'What is trending?', '/sites/market'],
  ['Infinity', 'Show me lore about Avalon.', '/sites/infinity'],
  ['Profile', 'Optimize my XP and rewards.', '/sites/profile'],
  ['Media Network', 'What should I watch or listen to?', '/sites/media'],
  ['Lingo.ai', 'Build, guide, navigate, or explain the OS.', '/sites/lingo'],
  ['Partners', 'Build a partner page, quest, guide, story, collection, or onboarding flow.', '/sites/partners'],
] as const;

export const askLingoIntents: AskLingoIntent[] = [
  {
    category: 'navigation',
    label: 'Open a module',
    prompt: 'Take me to the right place.',
    targetModule: 'HQ Router',
    targetRoute: '/sites/hq',
    primaryAction: 'Open HQ',
    response: 'I can route you to the right module, page, quest, product, story, reward, or media surface.',
  },
  {
    category: 'play',
    label: 'Find a game',
    prompt: 'What should I play?',
    targetModule: 'Play',
    targetRoute: '/sites/play',
    primaryAction: 'Open Game Hub',
    response: 'Start in Play. I will surface game worlds, quests, difficulty paths, achievements, and XP actions here.',
  },
  {
    category: 'commerce',
    label: 'Browse starter items',
    prompt: 'I want something from the shop.',
    targetModule: 'Shop + Market',
    targetRoute: '/sites/shop',
    primaryAction: 'Open Shop',
    response: 'I can guide users toward products, bundles, collections, digital goods, and XP-aligned starter kits.',
  },
  {
    category: 'lore',
    label: 'Explore lore',
    prompt: 'Tell me about Avalon.',
    targetModule: 'Infinity',
    targetRoute: '/sites/infinity',
    primaryAction: 'Open Lore Codex',
    response: 'Infinity is the lore and worldbuilding layer. I can route lore questions to stories, codex entries, and world assets.',
  },
  {
    category: 'media',
    label: 'Show trailers',
    prompt: 'Play something for me.',
    targetModule: 'Media Network',
    targetRoute: '/sites/media',
    primaryAction: 'Open Media Network',
    response: 'I can recommend series, trailers, sounds, releases, and playlists once the media catalog is connected.',
  },
  {
    category: 'profile',
    label: 'Review my XP',
    prompt: 'How do I level up?',
    targetModule: 'Profile',
    targetRoute: '/sites/profile',
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
  {
    category: 'build',
    label: 'Build a section',
    prompt: 'Build a partner page for Mazzoni Center.',
    targetModule: 'Build Mode',
    targetRoute: '/ask-lingo#build-mode',
    primaryAction: 'Open Build Mode',
    response: 'Build Mode returns a preview scaffold, filled copy, action buttons, and safe Accept, Tweak, or Expand placeholders before any live content is changed.',
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
  ['AskLingoBuildRequest', 'id, user_id, prompt, target_module, target_route, output_type, status'],
  ['AskLingoBuildOutput', 'id, request_id, layout_type, sections, copy_blocks, action_map, preview_state'],
  ['AskLingoBuildHistory', 'id, request_id, user_id, action_taken, version, created_at'],
] as const;

export const askLingoRoadmap = [
  ['1', 'Core UI, overlay, dock button'],
  ['2', 'Intent detection and routing to modules'],
  ['3', 'Rules-based recommendations from XP, inventory, and recent activity'],
  ['4', 'Voice capture and playback'],
  ['5', 'Guided flows with Do it for me navigation'],
  ['6', 'Build Mode preview, tweak, expand, and accept workflow'],
  ['7', 'Long-term personalization from history and preferences'],
] as const;

export const askLingoBuildActions = ['Accept preview', 'Tweak copy', 'Expand sections', 'Save to build history'] as const;

export const askLingoBuildOutputs = [
  {
    title: 'Media Network Home',
    targetRoute: '/sites/media',
    prompt: 'Generate a cinematic Media Network home page with series, trailers, sound, and releases.',
    layout: 'Hero + featured rails + release calendar + sound wall + Ask Lingo prompts',
    sections: [
      ['Signal Hero', 'A cinematic opening block that positions Media Network as the watch, listen, and release hub.'],
      ['Series Rail', 'Featured series cards with status labels, short blurbs, and Open Series actions.'],
      ['Trailer Room', 'Trailer preview cards with Play Trailer placeholders that do not start real media yet.'],
      ['Sound Archive', 'Playlist and sound pack cards connected to future audio metadata.'],
      ['Release Calendar', 'Upcoming drops, premieres, and notification prompts.'],
    ],
  },
  {
    title: 'Quest Guide',
    targetRoute: '/sites/play',
    prompt: 'Create a step-by-step quest guide for new players.',
    layout: 'Guide intro + objectives + XP rewards + Do it for me route actions',
    sections: [
      ['Guide Intro', 'Explain the quest path and expected completion time.'],
      ['Objectives', 'List daily, weekly, and epic objective slots.'],
      ['Rewards', 'Show XP, badge, and inventory unlock placeholders.'],
    ],
  },
  {
    title: 'Partnership Homepage',
    targetRoute: '/sites/partners',
    prompt: 'Generate the Partnership homepage with categories, benefits, programs, featured lanes, and OS integration.',
    layout: 'Hero + categories + featured partners + benefits + programs + OS integrations + CTA',
    sections: [
      ['Alliance Hero', 'Position partnerships as a living subsystem across the full Lingo Legacy OS.'],
      ['Partner Categories', 'Cultural, commerce, technology, and community partnership lanes.'],
      ['Benefits Grid', 'XP rewards, stipends, co-branded campaigns, media placement, and summit invitations.'],
      ['Program Rail', 'Creator Program, Cultural Residency, Film Festival, and Avalon International Summit.'],
      ['Ask Lingo Partner Build', 'Generate partner pages, quests, stories, collections, media pages, and onboarding flows.'],
    ],
  },
] as const;
