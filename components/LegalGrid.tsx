import Link from 'next/link';
import { legalPages } from '@/lib/master-data';

export default function LegalGrid() {
  return <div className="legal-grid">{legalPages.map((page) => <Link className="system-card" href={page.href} key={page.href}><h3>{page.title}</h3><p>{page.copy}</p></Link>)}</div>;
}
