import { businessModules, cloudArchitecture, contentVault, developmentSpec, emailSeries, entityCampaigns, futureExpansion, marketingSystems, pushExamples, releaseFlow } from '@/lib/rollout-data';

export function MarketingCommandCenter() {
  return (
    <section className="section shell">
      <p className="eyebrow">Phase 4 Marketing Command Center</p>
      <h2>Built to move every entity from built to discovered to retained.</h2>
      <div className="route-map flow-map">{releaseFlow.map((step) => <span key={step}>{step}</span>)}</div>
      <div className="ops-grid">{marketingSystems.map((system) => <article className="system-card" key={system.title}><h3>{system.title}</h3><div className="option-list">{system.items.map((item) => <span key={item}>{item}</span>)}</div></article>)}</div>
    </section>
  );
}

export function CampaignPanels() {
  return <section className="section shell"><p className="eyebrow">Entity Campaign Systems</p><h2>Games, stories, apparel, books, and media all get repeatable launch flows.</h2><div className="ops-grid">{entityCampaigns.map((campaign) => <article className="system-card" key={campaign.entity}><h3>{campaign.entity}</h3><p>{campaign.theme}</p><div className="mini-list"><b>Assets</b>{campaign.assets.map((asset) => <span key={asset}>{asset}</span>)}</div><div className="mini-list"><b>Campaigns</b>{campaign.campaigns.map((item) => <span key={item}>{item}</span>)}</div></article>)}</div></section>;
}

export function ContentVault() {
  return <section className="section shell"><p className="eyebrow">Content Vault</p><h2>Production-ready marketing library.</h2><div className="asset-tree">{contentVault.map(([folder, children]) => <article key={folder}><h3>{folder}</h3>{children.map((child) => <span key={child}>{child}</span>)}</article>)}</div></section>;
}

export function EmailAndPushSystems() {
  return <section className="section shell split-panel align-start"><div><p className="eyebrow">Email Automation</p><h2>Welcome series</h2><div className="route-map">{emailSeries.map((email, index) => <span key={email}>Email {index + 1}: {email}</span>)}</div></div><div><p className="eyebrow">Push Notifications</p><h2>User alerts</h2><div className="route-map">{pushExamples.map((push) => <span key={push}>{push}</span>)}</div></div></section>;
}

export function BusinessOpsPanel() {
  return <section className="section shell"><p className="eyebrow">Phase 5 Business Operations</p><h2>Lingo Legacy Command</h2><div className="ops-grid">{businessModules.map((module) => <article className="system-card" key={module.title}><h3>{module.title}</h3><ul>{module.items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}</div></section>;
}

export function SupportHub() {
  const topics = ['Account Help', 'Orders', 'Rewards', 'Games', 'Technical Support', 'Contact Team'];
  return <section className="section shell"><p className="eyebrow">Help Center</p><h2>Customer portal support routing.</h2><div className="ops-grid">{topics.map((topic) => <article className="system-card" key={topic}><h3>{topic}</h3><p>Routes requests into support tickets, admin triage, notification follow-up, and knowledge base updates.</p></article>)}</div></section>;
}

export function ArchitectureFlow() {
  return <section className="section shell"><p className="eyebrow">Phase 6 Production Scale</p><h2>Cloud architecture</h2><div className="route-map architecture-flow">{cloudArchitecture.map((layer) => <span key={layer}>{layer}</span>)}</div></section>;
}

export function FutureExpansionPanel() {
  return <section className="section shell"><p className="eyebrow">Phase 7 Future Expansion Ready</p><h2>Prepared for the next platform surfaces.</h2><div className="pill-row">{futureExpansion.map((item) => <span key={item}>{item}</span>)}</div></section>;
}

export function DevelopmentSpecPanel() {
  return <section className="section shell"><p className="eyebrow">Phase 8 Development Build Specification</p><h2>Blueprint converted into implementation targets.</h2><div className="ops-grid">{Object.entries(developmentSpec).map(([title, items]) => <article className="system-card" key={title}><h3>{title}</h3><div className="option-list">{items.map((item) => <span key={item}>{item}</span>)}</div></article>)}</div></section>;
}
