import SectionScaffold from '@/components/SectionScaffold';
import { getSection } from '@/lib/site-os';

const section = getSection('ask-lingo');

export default function Page() {
  if (!section) return null;
  return <SectionScaffold section={section} />;
}
