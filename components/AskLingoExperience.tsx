import Link from 'next/link';
import {
  askLingoDataEntities,
  askLingoGuidanceSteps,
  askLingoIntents,
  askLingoLocalPrompts,
  askLingoRoadmap,
  askLingoSmartSuggestions,
  askLingoSurfaces,
} from '@/lib/ask-lingo';

export default function AskLingoExperience() {
  const primaryIntent = askLingoIntents[1];

  return (
    <section className="page-shell shell ask-lingo-shell">
      <p className="eyebrow">Universal Guide + Router + Concierge</p>
      <div className="ask-hero">
        <div>
          <h1>Ask Lingo</h1>
          <p className="hero-copy">Your guide through Lingo Legacy. Ask Lingo understands intent, maps it to the right module, and returns action cards for navigation, quests, products, lore, media, rewards, and help.</p>
          <div className="ask-input-shell" aria-label="Ask Lingo input scaffold">
            <span>Ask anything...</span>
            <button type="button">Text</button>
            <button type="button">Mic Ready</button>
          </div>
        </div>
        <aside className="system-card voice-card">
          <p className="eyebrow">Voice Orb</p>
          <h2>Hold to speak</h2>
          <p>Voice capture, wake phrase support, playback, Next, Back, and Repeat controls are scaffolded as UI states. No microphone permission is requested until a real voice service is connected.</p>
        </aside>
      </div>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Home State</p>
          <h2>Quick chips</h2>
        </div>
        <div className="chip-grid">
          {askLingoIntents.map((intent) => (
            <Link className="intent-chip" href={intent.targetRoute} key={intent.category}>
              <span>{intent.targetModule}</span>
              <strong>{intent.label}</strong>
              <small>{intent.prompt}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Results State</p>
          <h2>Answer and action cards</h2>
        </div>
        <div className="ask-results-grid">
          <article className="system-card answer-card">
            <p className="eyebrow">Top Answer</p>
            <h2>{primaryIntent.response}</h2>
            <Link className="btn primary compact" href={primaryIntent.targetRoute}>{primaryIntent.primaryAction}</Link>
            <p className="context-line">Based on XP, inventory, recent activity, and current module once user data is connected.</p>
          </article>
          {askLingoIntents.slice(2, 6).map((intent) => (
            <Link className="system-card result-card" href={intent.targetRoute} key={intent.category}>
              <p className="eyebrow">{intent.category}</p>
              <h3>{intent.label}</h3>
              <p>{intent.response}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Guidance State</p>
          <h2>Step-by-step route support</h2>
        </div>
        <div className="guidance-list">
          {askLingoGuidanceSteps.map((step, index) => (
            <article className="system-card guidance-step" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Module Integration</p>
          <h2>Local prompts</h2>
        </div>
        <div className="ops-grid">
          {askLingoLocalPrompts.map(([module, prompt, route]) => (
            <Link className="system-card" href={route} key={module}>
              <p className="eyebrow">{module}</p>
              <h3>Ask Lingo</h3>
              <p>{prompt}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section compact-section split-panel align-start">
        <div>
          <p className="eyebrow">Smart Suggestions</p>
          <h2>Rules-ready recommendation slots</h2>
          <div className="module-list">{askLingoSmartSuggestions.map((suggestion) => <span key={suggestion}>{suggestion}</span>)}</div>
        </div>
        <div>
          <p className="eyebrow">Surfaces</p>
          <div className="module-list">{askLingoSurfaces.map(([surface, detail]) => <span key={surface}>{surface}: {detail}</span>)}</div>
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Entities + Roadmap</p>
          <h2>Ask Lingo data contract</h2>
        </div>
        <div className="ops-grid">
          {askLingoDataEntities.map(([entity, fields]) => (
            <article className="system-card" key={entity}>
              <h3>{entity}</h3>
              <p>{fields}</p>
            </article>
          ))}
        </div>
        <div className="route-map compact">
          {askLingoRoadmap.map(([step, label]) => <span key={step}>Phase {step}: {label}</span>)}
        </div>
      </section>
    </section>
  );
}
