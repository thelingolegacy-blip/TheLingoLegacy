const uxSystems = [
  ['Lingo ID', ['Email signup', 'Google sign-in ready', 'Guest mode', 'Profile setup']],
  ['Player Profiles', ['Avatar', 'Legacy Level', 'XP bar', 'Achievements', 'Activity history']],
  ['XP Engine', ['Games', 'Books', 'Apparel', 'Community', 'Referrals']],
  ['Universal Wallet', ['Lingo Tokens', 'Loyalty Bucks', 'Demo Coins', 'Rewards']],
  ['Notification Engine', ['Game updates', 'Book releases', 'Apparel drops', 'Reward available']],
  ['Analytics System', ['Visitors', 'Signups', 'Game sessions', 'Commerce views', 'Media watch time']],
];

export default function UXSystem() {
  return (
    <section className="section shell">
      <p className="eyebrow">Complete User Experience System</p>
      <h2>Visitors become members, players, readers, customers, and creators.</h2>
      <div className="ops-grid">{uxSystems.map(([title, items]) => <article className="system-card" key={title as string}><h3>{title as string}</h3><ul>{(items as string[]).map((item) => <li key={item}>{item}</li>)}</ul></article>)}</div>
    </section>
  );
}
