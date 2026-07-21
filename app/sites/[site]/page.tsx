import { notFound } from 'next/navigation';
import SubdomainSitePage from '@/components/SubdomainSitePage';
import { getSubdomainSite, subdomainSites } from '@/lib/subdomains';

export function generateStaticParams() {
  return subdomainSites.map((site) => ({ site: site.slug }));
}

export default async function Page({ params }: { params: Promise<{ site: string }> }) {
  const { site: slug } = await params;
  const site = getSubdomainSite(slug);

  if (!site) notFound();

  return <SubdomainSitePage site={site} />;
}
