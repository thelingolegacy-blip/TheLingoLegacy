import Link from 'next/link';

export default function NotFound() {
  return <section className="page-shell shell"><p className="eyebrow">Portal Offline</p><h1>404</h1><p>This world is not connected yet.</p><Link className="btn secondary" href="/">Return to HQ</Link></section>;
}
