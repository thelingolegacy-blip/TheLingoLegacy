import Link from 'next/link';
import { askLingoBuildOutputs, askLingoLocalPrompts } from '@/lib/ask-lingo';

const mediaBuild = askLingoBuildOutputs[0];

const featuredSeries = [
  ['Legacy Signal', 'Flagship animated lore series scaffold with season, trailer, and playlist slots.'],
  ['Avalon Files', 'Mystery-lore archive scaffold for codex episodes and story explainers.'],
  ['HQ Broadcast', 'Short-form announcements, missions, and community update stream.'],
];

const trailerCards = [
  ['Origin Trailer', 'Introduce the HQ, Infinity, Play, and Profile layers.'],
  ['Quest Drop', 'Preview Play missions and XP reward progression.'],
  ['Market Signal', 'Tease creator goods, bundles, and digital drops.'],
];

export default function MediaNetworkBuildExample() {
  return (
    <section className="page-shell shell media-build-shell">
      <p className="eyebrow">Ask Lingo Build Output</p>
      <div className="section-command-hero">
        <div>
          <h1>{mediaBuild.title}</h1>
          <p className="hero-copy">{mediaBuild.prompt}</p>
          <div className="cta-row">
            <Link className="btn primary" href="/ask-lingo#build-mode">Open Build Mode</Link>
            <Link className="btn secondary" href="/media">Legacy Media Page</Link>
          </div>
        </div>
        <aside className="system-card command-card">
          <p className="eyebrow">Generated Layout</p>
          <h2>{mediaBuild.layout}</h2>
          <p>This is a safe preview scaffold. It does not play real media, subscribe users, or write content history yet.</p>
        </aside>
      </div>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Signal Hero</p>
          <h2>Watch, listen, and follow every Legacy release.</h2>
          <p className="hero-copy">Media Network connects series, trailers, sounds, playlists, and release moments into one guided destination that Ask Lingo can route through.</p>
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading"><p className="eyebrow">Series Rail</p><h2>Featured Series</h2></div>
        <div className="ops-grid">
          {featuredSeries.map(([title, copy]) => (
            <article className="system-card" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
              <Link className="btn secondary compact" href="/ask-lingo">Ask for episodes</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading"><p className="eyebrow">Trailer Room</p><h2>Preview Cards</h2></div>
        <div className="ops-grid">
          {trailerCards.map(([title, copy]) => (
            <article className="system-card result-card" key={title}>
              <p className="eyebrow">Trailer Placeholder</p>
              <h3>{title}</h3>
              <p>{copy}</p>
              <button className="btn secondary compact" type="button">Play preview later</button>
            </article>
          ))}
        </div>
      </section>

      <section className="section compact-section split-panel align-start">
        <div>
          <p className="eyebrow">Sound Archive</p>
          <h2>Sound packs and playlists</h2>
          <div className="module-list">
            <span>Ambient HQ loops</span>
            <span>Quest unlock cues</span>
            <span>Infinity lore stingers</span>
            <span>Trailer impact pack</span>
          </div>
        </div>
        <div>
          <p className="eyebrow">Ask Lingo Prompt</p>
          <h2>{askLingoLocalPrompts[6][1]}</h2>
          <Link className="btn primary compact" href="/ask-lingo">Ask for a recommendation</Link>
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading"><p className="eyebrow">Release Calendar</p><h2>Generated release slots</h2></div>
        <div className="route-map compact">
          <span>Series premiere slot</span>
          <span>Trailer drop slot</span>
          <span>Sound pack slot</span>
          <span>Community broadcast slot</span>
        </div>
      </section>
    </section>
  );
}
