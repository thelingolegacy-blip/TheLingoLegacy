import RegistryPage from '@/components/RegistryPage';
import { interactionModels } from '@/lib/site-os';

export default function Page() {
  return (
    <RegistryPage
      kicker="Interaction Layer"
      title="Interaction Models"
      summary="The cross-site interaction contract for guided links, command cards, entity rails, asset slots, and Ask Lingo routes."
      items={interactionModels}
    />
  );
}
