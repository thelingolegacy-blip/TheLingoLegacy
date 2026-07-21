import { assetArchitecture, brandCore, gameRegistry, routes } from '@/lib/master-data';

export default function DataSystemPanels() {
  return (
    <section className="section shell">
      <p className="eyebrow">Master Data System v1.0</p>
      <h2>{brandCore.message}</h2>
      <div className="split-panel align-start">
        <div><h3>Core Platform</h3><p>{brandCore.purpose.join(' • ')}</p></div>
        <div className="route-map">{routes.map((route) => <span key={route}>{route}</span>)}</div>
      </div>
      <div className="ops-grid">
        {gameRegistry.map((game) => <article className="system-card" key={game.name}><h3>{game.name}</h3><p>{game.type}</p><div className="option-list">{game.systems.map((system) => <span key={system}>{system}</span>)}</div></article>)}
      </div>
      <div className="asset-tree">{assetArchitecture.map(([folder, children]) => <article key={folder}><h3>{folder}</h3>{children.map((child) => <span key={child}>{child}</span>)}</article>)}</div>
    </section>
  );
}
