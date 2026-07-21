export const worldPages = {
  games: { title: 'Games', icon: '🎮', kicker: 'Play Portal', copy: 'The destination for launch games, arcade experiments, Kotton\'s Code expansions, multiplayer roadmaps, and smart TV gaming.' },
  apparel: { title: 'Apparel', icon: '👕', kicker: 'Shop Portal', copy: 'Industrial noir collections, character drops, seasonal capsules, and limited Architect Gold releases.' },
  books: { title: 'Books', icon: '📚', kicker: 'Story Portal', copy: 'Lore books, education-first releases, character stories, and the written record of the Legacy universe.' },
  media: { title: 'Media', icon: '🎬', kicker: 'Broadcast Portal', copy: 'Trailers, videos, animation, music, behind-the-scenes media, and future streaming experiences.' },
  rewards: { title: 'Rewards', icon: '🏆', kicker: 'Progress Portal', copy: 'Achievements, points, event rewards, purchase paths, loyalty badges, and community milestones.' },
  'ai-lab': { title: 'AI Lab', icon: '🤖', kicker: 'Intelligence Portal', copy: 'Ask Lingo, recommendations, guided support, learning systems, story explanations, and voice-ready architecture.' },
  'lingo-id': { title: 'Lingo ID', icon: '👤', kicker: 'Identity Portal', copy: 'The user profile layer for saved preferences, sound settings, progress, rewards, access, and future personalization.' },
  about: { title: 'About', icon: '🏰', kicker: 'Legacy Archive', copy: 'The mission, values, operating system, and long-term blueprint behind The Lingo Legacy ecosystem.' },
  events: { title: 'Events', icon: '📡', kicker: 'Timeline Portal', copy: 'Launch moments, apparel drops, game releases, media releases, seasonal activations, and community events.' },
} as const;

export type WorldKey = keyof typeof worldPages;
