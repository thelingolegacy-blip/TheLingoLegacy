import Link from 'next/link';
import UniverseMap from '@/components/UniverseMap';
import Timeline from '@/components/Timeline';

const worlds = [
  { title: 'Games', icon: '🎮', href: '/games', copy: 'Playable worlds, arcade drops, and future multiplayer portals.' },
  { title: 'Apparel', icon: '👕', href: '/apparel', copy: 'Industrial noir merch, limited drops, and character-linked gear.' },
  { title: 'Books', icon: '📚', href: '/books', copy: 'Stories, lore archives, educational releases, and expansion books.' },
  { title: 'Media', icon: '🎬', href: '/media', copy: 'Video, music, trailers, animation, and smart TV-ready experiences.' },
  { title: 'AI Lab', icon: '🤖', href: '/ai-lab', copy: 'Ask Lingo, guided discovery, learning tools, and voice-ready systems.' },
  { title: 'Rewards', icon: '🏆', href: '/rewards', copy: 'Lingo ID, achievements, loyalty paths, and community progression.' },
];

export default function Home() {
  return (
    <>
      <section className="boot-sequence" aria-label="HQ opening scene">
        <div className="emblem">LL</div>
        <div className="boot-copy">
          <span>Metal particles active</span>
          <span>Cyan energy grid online</span>
          <span>HQ interface powered</span>
        </div>
      </section>

      <section className="hero shell">
        <div className="hero-copy-block">
          <p className="eyebrow"><span className="pulse" /> Phase 1A Core Build</p>
          <h1>The Lingo Legacy <span>HQ</span></h1>
          <p className="hero-copy">The master command shell connecting games, apparel, books, media, AI, rewards, events, and Lingo ID into one digital ecosystem foundation.</p>
          <div className="cta-row">
            <Link className="btn primary" href="#universe">Enter the Legacy</Link>
            <Link className="btn secondary" href="/lingo-id">Activate Lingo ID</Link>
          </div>
        </div>
        <div className="hq-core" aria-hidden="true">
          <div className="core-ring" />
          <div className="core-node">HQ</div>
          <div className="energy-line line-a" />
          <div className="energy-line line-b" />
          <div className="energy-line line-c" />
        </div>
      </section>

      <section id="universe" className="section shell">
        <div className="section-heading">
          <p className="eyebrow">Interactive Centerpiece</p>
          <h2>HQ Universe Map</h2>
        </div>
        <UniverseMap />
      </section>

      <section className="section shell">
        <div className="section-heading">
          <p className="eyebrow">Featured Worlds</p>
          <h2>Entity World Connections</h2>
        </div>
        <div className="world-grid">
          {worlds.map((world) => (
            <Link className="world-card" href={world.href} key={world.title}>
              <span className="world-icon" aria-hidden="true">{world.icon}</span>
              <h3>{world.title}</h3>
              <p>{world.copy}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section shell split-panel">
        <div>
          <p className="eyebrow">Rewards / Lingo ID</p>
          <h2>One identity for every world.</h2>
          <p>Lingo ID is the profile layer for achievements, loyalty, saved sound preferences, story progress, event access, and future community status.</p>
        </div>
        <Link className="btn primary" href="/rewards">View Rewards System</Link>
      </section>

      <Timeline />
    </>
  );
}
