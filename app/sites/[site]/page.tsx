import { notFound } from 'next/navigation';
import PartnershipHome from '@/components/PartnershipHome';
import SubdomainSitePage from '@/components/SubdomainSitePage';
import { getSubdomainSite, subdomainSites } from '@/lib/subdomains';

export function generateStaticParams() {
  return subdomainSites.map((site) => ({ site: site.slug }));
}

export default async function Page({ params }: { params: Promise<{ site: string }> }) {
  const { site: slug } = await params;
  const site = getSubdomainSite(slug);

  if (!site) notFound();

  if (site.slug === 'partners') return <PartnershipHome />;

  return <SubdomainSitePage site={site} />;
}
