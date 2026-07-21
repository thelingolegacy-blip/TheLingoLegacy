import RegistryPage from '@/components/RegistryPage';
import { assetRegistry } from '@/lib/site-os';

export default function Page() {
  return (
    <RegistryPage
      kicker="Asset Layer"
      title="Asset Registry"
      summary="The complete asset slot map for UI, iconography, animations, sound, branding, lore art, and game assets."
      items={assetRegistry}
    />
  );
}
