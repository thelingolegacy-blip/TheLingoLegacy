import type { LingoEntity } from '../lingo-entity';

export const brandEntities: LingoEntity[] = [
  {
    id: 'the-lingo-legacy',
    name: 'The Lingo Legacy™',
    category: 'Parent Company',
    description: 'Central entertainment ecosystem powering games, books, apps, clothing, media, loyalty, commerce, publishing, and community.',
    website: 'https://thelingolegacy.com',
    logo: '/logos/the-lingo-legacy.png',
    launchStatus: 'Production',
    tags: ['universal-login', 'wallet', 'xp', 'rewards', 'commerce']
  },
  {
    id: 'loyalty-lane-apparel',
    name: 'Loyalty Lane Apparel™',
    category: 'Apparel Brand',
    description: 'Streetwear brand covering Tap Stitch, Industrial Noir, Founders Collection, Legacy Gold, Shadow Collection, kids, athletic, premium, and accessories.',
    launchStatus: 'Development',
    tags: ['streetwear', 'apparel', 'commerce']
  },
  {
    id: 'obsidian-closet',
    name: 'Obsidian Closet™',
    category: 'Apparel Brand',
    description: 'Luxury fashion label focused on modern, minimalist designer collections.',
    launchStatus: 'Planning',
    tags: ['luxury', 'fashion']
  }
];
