const surveys = [
  ['Games', 'How did you enjoy gameplay?', ['Gameplay balance', 'New features', 'Leaderboard experience']],
  ['Apparel', 'Which collection interests you?', ['Streetwear', 'Luxury', 'Limited Drops', 'Custom Designs']],
  ['Books', 'Favorite character?', ['Kotton', 'Azora', 'Zay Zay', 'Other']],
];

const forms = ['Account Signup', 'Beta Tester Signup', 'Newsletter Signup', 'Creator Application', 'Partner Application', 'General Contact'];

export default function FeedbackForms() {
  return (
    <section className="section shell">
      <p className="eyebrow">User Feedback System</p>
      <h2>Surveys and community forms</h2>
      <div className="ops-grid">
        {surveys.map(([area, question, options]) => (
          <article className="system-card" key={area as string}>
            <h3>{area as string}</h3>
            <p>{question as string}</p>
            <div className="option-list">{(options as string[]).map((option) => <span key={option}>{option}</span>)}</div>
          </article>
        ))}
      </div>
      <div className="pill-row">{forms.map((form) => <span key={form}>{form}</span>)}</div>
    </section>
  );
}
