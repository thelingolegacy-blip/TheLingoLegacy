import type { LingoEntityCategory } from './categories';
import type { LaunchStatus } from './launch-status';

export interface LingoEntity {
  id: string;
  name: string;
  category: LingoEntityCategory;
  description: string;
  website?: string;
  logo?: string;
  socials?: {
    facebook?: string;
    instagram?: string;
    x?: string;
    youtube?: string;
    tiktok?: string;
    linkedin?: string;
    discord?: string;
  };
  launchStatus: LaunchStatus;
  tags?: string[];
}
