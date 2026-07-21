const pressKit = ['Brand story', 'Logos', 'Screenshots', 'Trailers', 'Founder information', 'Contact form', 'Partner kit', 'Media requests'];

export default function PressPage() {
  return <section className="page-shell shell"><p className="eyebrow">Press + Partner Kit</p><h1>The Lingo Legacy press room.</h1><p className="hero-copy">A public-facing kit for brand coverage, partner outreach, creator collaborations, and launch announcements.</p><div className="ops-grid">{pressKit.map((item) => <article className="system-card" key={item}><h3>{item}</h3><p>Ready to connect to approved assets, metadata, contact routing, and campaign releases.</p></article>)}</div></section>;
}
