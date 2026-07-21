import Link from 'next/link';
import {
  featuredPartnerLanes,
  partnerBuildExamples,
  partnershipBenefits,
  partnershipCategories,
  partnershipIntegrations,
  partnershipPrograms,
} from '@/lib/partnership';

export default function PartnershipHome() {
  return (
    <section className="page-shell shell partnership-shell">
      <p className="eyebrow">partners.thelingolegacy.com</p>
      <div className="section-command-hero">
        <div>
          <h1>Partnership System</h1>
          <p className="hero-copy">A living partnership network for cultural organizations, commerce collaborators, technology platforms, creators, youth programs, and community impact across the full Lingo Legacy OS.</p>
          <div className="cta-row">
            <Link className="btn primary" href="/sites/partners/become-a-partner">Become a Partner</Link>
            <Link className="btn secondary" href="/ask-lingo#build-mode">Build with Ask Lingo</Link>
          </div>
        </div>
        <aside className="system-card command-card partner-command-card">
          <p className="eyebrow">Partnership Brain</p>
          <h2>Partner pages, quests, stories, collections, and onboarding flows.</h2>
          <p>Ask Lingo routes partnership content across HQ, Play, Shop, Market, Infinity, Media, Profile, and Lingo.ai.</p>
        </aside>
      </div>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Partner Categories</p>
          <h2>Four alliance lanes</h2>
        </div>
        <div className="ops-grid">
          {partnershipCategories.map(([title, copy]) => (
            <article className="system-card" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Featured Partner Lanes</p>
          <h2>Cultural impact network</h2>
        </div>
        <div className="subdomain-mini-grid">
          {featuredPartnerLanes.map(([name, copy]) => (
            <article className="system-card subdomain-card" key={name}>
              <p className="eyebrow">Partner Lane</p>
              <h3>{name}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section compact-section split-panel align-start">
        <div>
          <p className="eyebrow">Benefits</p>
          <h2>Partner value stack</h2>
          <div className="pill-row completion-grid">{partnershipBenefits.map((benefit) => <span key={benefit}>{benefit}</span>)}</div>
        </div>
        <div>
          <p className="eyebrow">Call to Action</p>
          <h2>Apply, collaborate, or build a partner flow.</h2>
          <p>Partners can enter through applications, co-branded drops, creator programs, cultural residencies, media features, or youth empowerment initiatives.</p>
          <Link className="btn primary compact" href="/sites/partners/become-a-partner">Start Partner Intake</Link>
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">Programs</p>
          <h2>Partnership programming</h2>
        </div>
        <div className="ops-grid">
          {partnershipPrograms.map(([title, copy]) => (
            <article className="system-card" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <p className="eyebrow">OS Integration</p>
          <h2>Embedded everywhere</h2>
        </div>
        <div className="ops-grid expanded-grid">
          {partnershipIntegrations.map(([module, copy]) => (
            <article className="system-card" key={module}>
              <p className="eyebrow">{module}</p>
              <h3>Partnership Surface</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section compact-section split-panel align-start">
        <div>
          <p className="eyebrow">Partnership Build Mode</p>
          <h2>Ask Lingo can generate partner assets.</h2>
          <p>Partner pages, sections, guides, stories, quests, collections, media pages, and onboarding flows are scaffolded as safe preview outputs before anything becomes live.</p>
        </div>
        <div className="module-list">
          {partnerBuildExamples.map((example) => <span key={example}>{example}</span>)}
        </div>
      </section>
    </section>
  );
}
