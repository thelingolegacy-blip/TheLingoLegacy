import { Card, Section } from '@/components';

export default function LegacyRoute({ params }: { params: { legacy: string[] } }) {
  const route = `/${params.legacy.join('/')}`;

  return (
    <Section title="Legacy route migration">
      <Card>
        <p>{route} is reserved for migration into the Next.js OS layer.</p>
        <p>Keep this page until the matching static HTML experience is rebuilt as an App Router route.</p>
      </Card>
    </Section>
  );
}
