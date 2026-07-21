import Link from 'next/link';

const commandLinks = [
  ['Launch Ops', '/launch'], ['Master Data', '/master-data'], ['Assets', '/asset-production'], ['UX System', '/user-experience'], ['Admin', '/admin'], ['Legal', '/legal'],
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
