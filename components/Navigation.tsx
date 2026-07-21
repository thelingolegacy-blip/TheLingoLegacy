import Link from 'next/link';

const links = [
  ['Home', '/'], ['HQ', '/hq'], ['Play', '/play'], ['Shop', '/shop'], ['Market', '/market'], ['Infinity', '/infinity'], ['Profile', '/profile'], ['Media', '/media-network'], ['Ask Lingo', '/ask-lingo'], ['Admin', '/admin'],
];

const mobile = [
  ['HQ', '/hq'], ['Play', '/play'], ['Shop', '/shop'], ['Market', '/market'], ['Ask', '/ask-lingo'], ['Profile', '/profile'],
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
