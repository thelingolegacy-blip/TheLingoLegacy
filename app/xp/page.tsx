import { Card, Section, XPBurst } from '@/components';

export default function XP() {
  return (
    <Section title="XP Engine">
      <Card>
        <p>Progression events, mission rewards, and OS sync pulses will appear in this runtime panel.</p>
        <XPBurst amount={100} />
      </Card>
    </Section>
  );
}
