import { assetArchitecture } from '@/lib/master-data';

const productionRules = ['Create asset', 'Quality check', 'Add metadata', 'Upload storage', 'Connect database', 'Publish', 'Promote', 'Track results'];
const requirements = ['Image requirements', 'Animation list', 'Sound library', 'Video requirements', 'AI prompts', 'Upload workflow', 'Vercel deployment structure'];

export default function AssetProductionPage() {
  return (
    <section className="page-shell shell">
      <p className="eyebrow">Phase 2 Asset Production Map</p>
      <h1>Complete production library</h1>
      <p className="hero-copy">Every website section, game, product, book, and media release gets storage locations, metadata, upload workflow, and release requirements.</p>
      <div className="asset-tree">{assetArchitecture.map(([folder, children]) => <article key={folder}><h3>{folder}</h3>{children.map((child) => <span key={child}>{child}</span>)}</article>)}</div>
      <div className="split-panel align-start"><div><h2>Upload Pipeline</h2><div className="route-map">{productionRules.map((rule) => <span key={rule}>{rule}</span>)}</div></div><div><h2>Completion Target</h2><div className="route-map">{requirements.map((item) => <span key={item}>{item}</span>)}</div></div></div>
    </section>
  );
}
