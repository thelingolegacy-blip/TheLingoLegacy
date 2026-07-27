import { Card, Section } from '@/components';

export default function AdminCommands() {
  return (
    <Section title="Command Console">
      <Card>
        <p>Use `/api/admin/execute` with an approved command to trigger OS operations from trusted clients.</p>
      </Card>
    </Section>
  );
}
