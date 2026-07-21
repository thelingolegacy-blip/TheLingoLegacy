const timeline: Array<[string, string[]]> = [
  ['2026', ['Website Launch', 'Game Releases', "Kotton's Code Expansion", 'Apparel Drops', 'Media Releases']],
  ['2027+', ['Multiplayer Worlds', 'Smart TV Gaming', 'Community Expansion', 'Global Rollout']],
];

export default function Timeline() {
  return (
    <section className="section shell timeline-section">
      <p className="eyebrow">Legacy Timeline</p>
      <h2>Launch path and expansion roadmap</h2>
      <div className="timeline">
        {timeline.map(([year, items]) => (
          <div className="timeline-year" key={year}>
            <span>{year}</span>
            <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  );
}
