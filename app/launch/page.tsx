import CountdownCard from '@/components/CountdownCard';
import FeedbackForms from '@/components/FeedbackForms';
import LaunchOpsOverview from '@/components/LaunchOpsOverview';
import LegalGrid from '@/components/LegalGrid';
import { launchEntities } from '@/lib/master-data';

export default function LaunchPage() {
  return (
    <>
      <section className="page-shell shell">
        <p className="eyebrow">Lingo Legacy Launch Operations System</p>
        <h1>Countdowns, promos, ads, feedback, legal, and user growth.</h1>
        <p className="hero-copy">Every entity receives a launch date, countdown timer, notification path, social promotion package, launch event, and post-launch rewards cycle.</p>
      </section>
      <section className="section shell">
        <p className="eyebrow">Entity Launch Countdown System</p>
        <h2>Every world gets a launch page.</h2>
        <div className="countdown-wall">{launchEntities.map((entity) => <CountdownCard key={entity.title} {...entity} />)}</div>
      </section>
      <LaunchOpsOverview />
      <FeedbackForms />
      <section className="section shell"><p className="eyebrow">Legal Foundation</p><h2>Business portal pages</h2><LegalGrid /></section>
    </>
  );
}
