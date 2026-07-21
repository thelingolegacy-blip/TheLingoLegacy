import Link from 'next/link';

const nodes = [
  { label: 'AI Lab', href: '/ai-lab', className: 'north' },
  { label: 'Books', href: '/books', className: 'west' },
  { label: 'Games', href: '/games', className: 'east' },
  { label: 'Media', href: '/media', className: 'south-west' },
  { label: 'Rewards', href: '/rewards', className: 'south' },
  { label: 'Apparel', href: '/apparel', className: 'south-east' },
];

export default function UniverseMap() {
  return (
    <div className="universe-map" aria-label="Interactive universe map">
      <div className="map-lines" />
      <Link className="map-node center" href="/">Lingo HQ</Link>
      {nodes.map((node) => <Link className={`map-node ${node.className}`} href={node.href} key={node.href}>{node.label}</Link>)}
    </div>
  );
}
