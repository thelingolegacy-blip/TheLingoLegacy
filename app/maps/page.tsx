import type { CSSProperties } from 'react';

const mapZones = ['HQ locations', 'Partner locations', 'Community locations', 'Future Avalon zones', 'Event venues', 'Drop locations'];

export default function MapsPage() {
  return <section className="page-shell shell"><p className="eyebrow">Map System</p><h1>Legacy locations and future zones.</h1><p className="hero-copy">Map scaffolding for physical, community, partner, event, and future in-universe locations.</p><div className="universe-map compact-map">{mapZones.map((zone, index) => <span className="map-node static-node" key={zone} style={{ '--i': index } as CSSProperties}>{zone}</span>)}</div></section>;
}
