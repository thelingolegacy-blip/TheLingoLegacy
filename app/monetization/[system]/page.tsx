import { notFound } from 'next/navigation';
import MonetizationSystemPage from '@/components/MonetizationSystemPage';
import { getMonetizationSystem, monetizationSystems } from '@/lib/monetization';

export function generateStaticParams() {
  return monetizationSystems.map((system) => ({ system: system.slug }));
}

export default async function Page({ params }: { params: Promise<{ system: string }> }) {
  const { system: slug } = await params;
  const system = getMonetizationSystem(slug);

  if (!system) notFound();

  return <MonetizationSystemPage system={system} />;
}
