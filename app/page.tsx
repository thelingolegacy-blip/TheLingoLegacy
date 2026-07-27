import { Button, Card, CommandTile, Section, XPBurst } from '@/components';

const modules = [
  ['Identity', 'Session continuity, profiles, and request validation.'],
  ['Wallet', 'Wallet event intake and audit-ready callbacks.'],
  ['XP Engine', 'Progression streams, sync hooks, and reward events.'],
  ['Admin Command Center', 'Command execution, telemetry, and guarded operations.'],
  ['Global Assets', 'Asset universe routing backed by configured object storage.'],
  ['Avalon Archive', 'Cultural interface for lineage, honor names, and artifacts.']
] as const;

export default function Home() {
  return (
    <div className="ll-shell">
      <section className="ll-hero">
        <p className="ll-eyebrow">Live app layer</p>
        <h1>Lingo Legacy OS</h1>
        <p>
          Industrial Noir command center for identity, wallet operations, XP progression, admin controls,
          global assets, and Avalon cultural systems.
        </p>
        <Button>Enter OS</Button>
      </section>

      <Section title="Operational modules">
        <div className="ll-grid">
          {modules.map(([name, description]) => (
            <CommandTile key={name} name={name} description={description} />
          ))}
        </div>
      </Section>

      <Card>
        <h2>Runtime signal</h2>
        <p>The OS shell is ready for backend credentials, API wiring, analytics instrumentation, and production cutover.</p>
        <XPBurst amount={250} />
      </Card>
    </div>
  );
}
