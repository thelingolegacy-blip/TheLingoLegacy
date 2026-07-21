import Link from 'next/link';
import { aiFunctions, databaseSchemas, finalChecklist, finalSystemMap, phaseSystems, productionStack, repositoryArchitecture } from '@/lib/infinity-data';

export function ProductionStackPanel() {
  return <section className="section shell"><p className="eyebrow">Phase 8 Production Stack</p><h2>Frontend, hosting, backend, and source control.</h2><div className="ops-grid">{Object.entries(productionStack).map(([title, items]) => <article className="system-card" key={title}><h3>{title}</h3><div className="option-list">{items.map((item) => <span key={item}>{item}</span>)}</div></article>)}</div></section>;
}

export function RepositoryArchitecturePanel() {
  return <section className="section shell split-panel align-start"><div><p className="eyebrow">Repository Architecture</p><h2>Monorepo-ready structure.</h2><div className="route-map">{repositoryArchitecture.apps.map((app) => <span key={app}>apps/{app}</span>)}</div></div><div><p className="eyebrow">Shared Packages</p><h2>Reusable ecosystem modules.</h2><div className="route-map">{repositoryArchitecture.packages.map((pkg) => <span key={pkg}>packages/{pkg}</span>)}</div></div></section>;
}

export function DatabaseSchemaPanel() {
  return <section className="section shell"><p className="eyebrow">Phase 9 Database System</p><h2>Universal data collections.</h2><div className="ops-grid">{databaseSchemas.map((schema) => <article className="system-card" key={schema.collection}><h3>{schema.collection}</h3><div className="option-list">{schema.fields.map((field) => <span key={field}>{field}</span>)}</div></article>)}</div></section>;
}

export function PhaseInfinityIndex() {
  return <section className="section shell"><p className="eyebrow">Phase 10 through Phase Infinity</p><h2>Remaining infrastructure layers.</h2><div className="ops-grid">{phaseSystems.map((system) => <Link className="system-card" href={system.route} key={system.route}><p className="eyebrow">{system.phase}</p><h3>{system.title}</h3><div className="option-list">{system.items.map((item) => <span key={item}>{item}</span>)}</div></Link>)}</div></section>;
}

export function AiFunctionsPanel() {
  return <section className="section shell"><p className="eyebrow">Ask Lingo AI Functions</p><h2>Assistant modes for every user intent.</h2><div className="ops-grid">{aiFunctions.map(([mode, prompt]) => <article className="system-card" key={mode}><h3>{mode}</h3><p>“{prompt}”</p></article>)}</div></section>;
}

export function FinalUniversePanel() {
  return <section className="section shell"><p className="eyebrow">Phase Infinity</p><h2>The Lingo Legacy Universe</h2><div className="route-map architecture-flow">{finalSystemMap.map((layer) => <span key={layer}>{layer}</span>)}</div><div className="pill-row completion-grid">{finalChecklist.map((item) => <span key={item}>✓ {item}</span>)}</div></section>;
}
