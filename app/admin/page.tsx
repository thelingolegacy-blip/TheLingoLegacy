import { Card, CommandTile, Section } from '@/components';

const commands = [
  ['system.status', 'Check OS readiness and connected service configuration.'],
  ['xp.sync', 'Queue progression sync across OS modules.'],
  ['asset.refresh', 'Refresh global asset universe metadata.'],
  ['wallet.audit', 'Queue wallet event audit pass.']
] as const;

export default function Admin() {
  return (
    <Section title="Admin Command Center">
      <Card>
        <p>Protected command execution surface. Real commands require a signed session and configured admin key.</p>
      </Card>
      <div className="ll-grid">
        {commands.map(([name, description]) => (
          <CommandTile key={name} name={name} description={description} />
        ))}
      </div>
    </Section>
  );
}
