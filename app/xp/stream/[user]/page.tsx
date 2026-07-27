import { Card, Section } from '@/components';

export default function XPStream({ params }: { params: { user: string } }) {
  return (
    <Section title="XP Stream">
      <Card>
        <p>Live progression stream for {params.user}.</p>
      </Card>
    </Section>
  );
}
