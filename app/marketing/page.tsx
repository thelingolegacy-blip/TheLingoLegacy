import { CampaignPanels, ContentVault, EmailAndPushSystems, MarketingCommandCenter } from '@/components/RolloutPanels';

export default function MarketingPage() {
  return (
    <>
      <section className="page-shell shell">
        <p className="eyebrow">Lingo Legacy Marketing Command Center</p>
        <h1>Campaigns, launches, promotions, ads, social, email, and growth.</h1>
        <p className="hero-copy">Central control for moving every entity from built to discovered, followed, launched, and retained.</p>
      </section>
      <MarketingCommandCenter />
      <CampaignPanels />
      <ContentVault />
      <EmailAndPushSystems />
    </>
  );
}
