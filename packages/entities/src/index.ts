export type { LingoEntity } from './lingo-entity';
export type { LingoEntityCategory } from './categories';
export type { LaunchStatus } from './launch-status';
export { gameEntities } from './entities/games';
export { bookEntities } from './entities/books';
export { brandEntities } from './entities/brands';
export { communityEntities } from './entities/community';
export { mediaEntities } from './entities/media';

import { bookEntities } from './entities/books';
import { brandEntities } from './entities/brands';
import { communityEntities } from './entities/community';
import { gameEntities } from './entities/games';
import { mediaEntities } from './entities/media';

export const lingoEntities = [
  ...brandEntities,
  ...gameEntities,
  ...bookEntities,
  ...communityEntities,
  ...mediaEntities
];
