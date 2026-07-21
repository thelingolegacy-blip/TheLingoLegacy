import Link from 'next/link';

const links = [
  ['Home', '/'], ['Games', '/games'], ['Apparel', '/apparel'], ['Books', '/books'], ['Media', '/media'], ['Rewards', '/rewards'], ['AI Lab', '/ai-lab'], ['Launch', '/launch'], ['Marketing', '/marketing'], ['Press', '/press'], ['Lingo ID', '/lingo-id'], ['Community', '/community'], ['Admin', '/admin'],
];

const mobile = [
  ['HQ', '/'], ['Play', '/games'], ['Shop', '/apparel'], ['Launch', '/launch'], ['Market', '/marketing'], ['Profile', '/lingo-id'],
];

export default function Navigation() {
  return (
    <header className="topbar">
      <nav className="nav shell" aria-label="Global navigation">
        <Link className="brand" href="/"><span className="sigil">LL</span><span>The Lingo Legacy HQ</span></Link>
        <div className="navlinks">{links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</div>
      </nav>
      <nav className="mobile-command" aria-label="Mobile command menu">{mobile.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav>
    </header>
  );
}
