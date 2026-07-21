import Link from 'next/link';
import {
  activationChecklist,
  adTargetingSignals,
  adTypes,
  askLingoMonetizationActions,
  bannerTypes,
  beaconActivations,
  beaconTriggers,
  geoAlertTypes,
  monetizationAudit,
  monetizationBuildExamples,
  monetizationIntegrations,
  monetizationPillars,
  monetizationSystems,
  promotionTypes,
  subscriptionFeatures,
  subscriptionTypes,
  surveyRewards,
  surveyTypes,
} from '@/lib/monetization';

function PillList({ items }: { items: readonly string[] }) {
  return <div className="pill-row completion-grid">{items.map((item) => <span key={item}>{item}</span>)}</div>;
}

export default function MonetizationHub() {
  return (
    <section className="page-shell shell monetization-shell">
      <p className="eyebrow">Profit Infrastructure</p>
      <div className="section-command-hero">
        <div>
          <h1>Monetization Superlayer</h1>
          <p className="hero-copy">Subscriptions, ads, surveys, banners, beacons, geo-alerts, strategic promotions, partner promotions, XP-linked monetization, and reward-linked monetization unified under Ask Lingo.</p>
          <div className="cta-row">
            <Link className="btn primary" href="/ask-lingo#build-mode">Build Monetization Flow</Link>
            <Link className="btn secondary" href="/sites/partners">Partner Promotions</Link>
          </div>
        </div>
        <aside className="system-card command-card monetization-command-card">
          <p className="eyebrow">Safety State</p>
          <h2>Scaffolded, not live billing or tracking.</h2>
          <p>No payments, ad serving, geolocation, behavioral tracking, or promotion deployment is active yet. These are UI and data contracts.</p>
        </aside>
      </div>

      <section className="section compact-section">
        <div className="section-heading"><p className="eyebrow">Deep Systems</p><h2>Routeable monetization engines</h2></div>
        <div className="ops-grid expanded-grid">
          {monetizationSystems.map((system) => (
            <Link className="system-card" href={`/monetization/${system.slug}`} key={system.slug}>
              <p className="eyebrow">Inactive scaffold</p>
              <h3>{system.title}</h3>
              <p>{system.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading"><p className="eyebrow">Superlayer</p><h2>Core monetization pillars</h2></div>
        <div className="ops-grid expanded-grid">
          {monetizationPillars.map(([title, copy]) => (
            <article className="system-card" key={title}><h3>{title}</h3><p>{copy}</p></article>
          ))}
        </div>
      </section>

      <section className="section compact-section split-panel align-start">
        <div>
          <p className="eyebrow">Subscriptions</p>
          <h2>Global OS product</h2>
          <div className="ops-grid compact-grid">
            {subscriptionTypes.map((title) => <article className="system-card" key={title}><h3>{title}</h3><p>Pass scaffold with perks, eligibility, rewards, and future entitlement checks.</p></article>)}
          </div>
        </div>
        <div><p className="eyebrow">Features</p><PillList items={subscriptionFeatures} /></div>
      </section>

      <section className="section compact-section">
        <div className="section-heading"><p className="eyebrow">Ads + Surveys + Banners</p><h2>Contextual monetization surfaces</h2></div>
        <div className="ops-grid">
          <article className="system-card"><h3>Ads</h3><PillList items={adTypes} /><PillList items={adTargetingSignals} /></article>
          <article className="system-card"><h3>Surveys</h3><PillList items={surveyTypes} /><PillList items={surveyRewards} /></article>
          <article className="system-card"><h3>Banners</h3><PillList items={bannerTypes} /></article>
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading"><p className="eyebrow">Beacons + Geo-Alerts + Promotions</p><h2>Trigger and campaign layer</h2></div>
        <div className="ops-grid">
          <article className="system-card"><h3>Beacons</h3><PillList items={beaconTriggers} /><PillList items={beaconActivations} /></article>
          <article className="system-card"><h3>Geo-Alerts</h3><PillList items={geoAlertTypes} /></article>
          <article className="system-card"><h3>Strategic Promotions</h3><PillList items={promotionTypes} /></article>
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading"><p className="eyebrow">OS Integration</p><h2>Embedded across every module</h2></div>
        <div className="ops-grid expanded-grid">
          {monetizationIntegrations.map(([module, copy]) => <article className="system-card" key={module}><p className="eyebrow">{module}</p><h3>Monetization Surface</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading"><p className="eyebrow">Monetization Deep Audit</p><h2>Required before activation</h2></div>
        <div className="ops-grid expanded-grid">
          {monetizationAudit.map(([title, copy]) => <article className="system-card" key={title}><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section className="section compact-section split-panel align-start">
        <div>
          <p className="eyebrow">Ask Lingo Monetization Brain</p>
          <h2>Recommend, explain, build, trigger, optimize.</h2>
          <PillList items={askLingoMonetizationActions} />
        </div>
        <div>
          <p className="eyebrow">Activation Checklist</p>
          <PillList items={activationChecklist} />
          <p className="eyebrow compact">Build Mode Examples</p>
          <div className="module-list">{monetizationBuildExamples.map((example) => <span key={example}>{example}</span>)}</div>
        </div>
      </section>
    </section>
  );
}
