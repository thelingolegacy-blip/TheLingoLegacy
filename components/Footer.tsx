import Link from 'next/link';

const commandLinks = [
  ['Launch Ops', '/launch'], ['Marketing', '/marketing'], ['Phase Infinity', '/phase-infinity'], ['Production Spec', '/production-spec-package'], ['Database', '/database-system'], ['Security', '/security-trust'], ['AI Ecosystem', '/ai-ecosystem'], ['Game Platform', '/game-platform'], ['Commerce', '/commerce-system'], ['Media Network', '/media-network'], ['Analytics', '/analytics-command'], ['Automation', '/automation-engine'], ['Admin', '/admin'], ['Legal', '/legal'],
];

const legalLinks = [
  ['Privacy Policy', '/privacy-policy'], ['Terms', '/terms'], ['Cookie Policy', '/cookies'], ['Community Guidelines', '/community-guidelines'], ['Refund Policy', '/refunds'], ['Accessibility', '/accessibility'], ['DMCA', '/dmca'], ['Contact', '/contact'],
];

export default function Footer() {
  return (
    <footer className="footer shell">
      <div>
        <p className="eyebrow">Footer Command Center</p>
        <h2>The Lingo Legacy HQ</h2>
        <p>Built as the operating shell for every world, release, profile, reward, policy, asset, and event.</p>
      </div>
      <div className="footer-columns">
        <div className="footer-links">{commandLinks.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</div>
        <div className="footer-links legal-links">{legalLinks.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</div>
      </div>
    </footer>
  );
}
