import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer shell">
      <div>
        <p className="eyebrow">Footer Command Center</p>
        <h2>The Lingo Legacy HQ</h2>
        <p>Built as the operating shell for every world, release, profile, reward, and event.</p>
      </div>
      <div className="footer-links">
        <Link href="/events">Events</Link>
        <Link href="/about">About</Link>
        <Link href="/ai-lab">Ask Lingo</Link>
        <Link href="/lingo-id">Lingo ID</Link>
      </div>
    </footer>
  );
}
