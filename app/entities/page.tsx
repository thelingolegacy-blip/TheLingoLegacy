import RegistryPage from '@/components/RegistryPage';
import { entityModel } from '@/lib/site-os';

export default function Page() {
  return (
    <RegistryPage
      kicker="Data Layer"
      title="Entity Model"
      summary="The full OS schema scaffold for users, XP, quests, products, media, stories, rewards, and inventory."
      items={entityModel}
    />
  );
}
