import SectionScaffold from '@/components/SectionScaffold';
import { getSection } from '@/lib/site-os';

const section = getSection('profile');

export default function Page() {
  if (!section) return null;
  return <SectionScaffold section={section} />;
}
