import Link from 'next/link';
import { worldPages } from '../world-data';

const world = worldPages['games'];

export default function Page() {
  return (
    <section className="page-shell shell">
      <p className="eyebrow">{world.kicker}</p>
      <div className="portal-hero">
        <span className="portal-icon" aria-hidden="true">{world.icon}</span>
        <div>
          <h1>{world.title}</h1>
          <p>{world.copy}</p>
          <Link className="btn secondary" href="/">Return to HQ</Link>
        </div>
      </div>
      <div className="system-card">
        <h2>Phase 1B Ready</h2>
        <p>This entity world is connected to the HQ shell and ready for its production buildout: content systems, commerce, game modules, account features, media libraries, and launch campaigns.</p>
      </div>
    </section>
  );
}
