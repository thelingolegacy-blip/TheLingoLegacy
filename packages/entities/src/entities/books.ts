import type { LingoEntity } from '../lingo-entity';

export const bookEntities: LingoEntity[] = [
  {
    id: 'kottons-code-series',
    name: "Kotton's Code Series",
    category: 'Book Series',
    description: 'Children’s book series spanning first words, colors, counting, friendship, school, mystery pets, Loyalty Lane adventures, and Master Code.',
    launchStatus: 'Development',
    tags: ['paperback', 'hardcover', 'kindle', 'audiobook', 'interactive-app']
  },
  {
    id: 'say-it-again',
    name: 'Say It Again™',
    category: 'Book Series',
    description: 'Speech recovery curriculum for stroke recovery, speech therapy, reading improvement, and language practice.',
    launchStatus: 'Planning',
    tags: ['speech-therapy', '365-day-program', 'caregiver-guide']
  }
];
