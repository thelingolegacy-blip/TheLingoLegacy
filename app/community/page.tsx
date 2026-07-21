const community = ['Account signup', 'Creator application', 'Partner application', 'Beta tester signup', 'Newsletter interests', 'Community challenges', 'Local events'];

export default function CommunityPage() {
  return <section className="page-shell shell"><p className="eyebrow">Community Network</p><h1>Members, creators, partners, and events.</h1><p className="hero-copy">The community layer connects Lingo ID, launch events, feedback loops, creator collaborations, and partner opportunities.</p><div className="ops-grid">{community.map((item) => <article className="system-card" key={item}><h3>{item}</h3><p>Connected to notification, rewards, analytics, and admin review workflows.</p></article>)}</div></section>;
}
