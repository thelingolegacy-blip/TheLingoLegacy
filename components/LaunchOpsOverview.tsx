const systems = [
  ['Promotion Engine', ['Homepage banner', 'Countdown card', 'Announcement page', 'Social content package', 'Trailer clips']],
  ['Advertising System', ['Website banners', 'Sponsored features', 'Reward ads', 'AdMob-ready app placements', 'Family-safe rules']],
  ['Notification Engine', ['Email', 'Push notifications', 'SMS optional', 'In-game notifications', 'Launch alerts']],
  ['Admin HQ Command Center', ['Launch calendar', 'Countdown manager', 'Promo generator', 'Survey results', 'Legal updates']],
];

export default function LaunchOpsOverview() {
  return (
    <section className="section shell">
      <p className="eyebrow">Launch Operating System</p>
      <h2>Release, promote, measure, repeat</h2>
      <div className="ops-grid">
        {systems.map(([title, items]) => (
          <article className="system-card" key={title as string}>
            <h3>{title as string}</h3>
            <ul>{(items as string[]).map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        ))}
      </div>
    </section>
  );
}
