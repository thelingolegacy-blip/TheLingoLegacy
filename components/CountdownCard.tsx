'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type CountdownCardProps = {
  title: string;
  type: string;
  launchDate: string;
  route: string;
  milestones: string[];
  promos: string[];
};

function getParts(target: string) {
  const distance = Math.max(new Date(target).getTime() - Date.now(), 0);
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1000) % 60),
  };
}

export default function CountdownCard({ title, type, launchDate, route, milestones, promos }: CountdownCardProps) {
  const [parts, setParts] = useState(() => getParts(launchDate));
  const formatted = useMemo(() => new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(launchDate)), [launchDate]);

  useEffect(() => {
    const timer = window.setInterval(() => setParts(getParts(launchDate)), 1000);
    return () => window.clearInterval(timer);
  }, [launchDate]);

  return (
    <article className="countdown-card">
      <p className="eyebrow">Coming Soon</p>
      <h3>{title}</h3>
      <span className="launch-type">{type}</span>
      <p>Launch target: {formatted}</p>
      <div className="countdown-grid" aria-label={`${title} countdown`}>
        {Object.entries(parts).map(([label, value]) => <strong key={label}><span>{String(value).padStart(2, '0')}</span>{label}</strong>)}
      </div>
      <div className="mini-list"><b>Milestones</b>{milestones.map((item) => <span key={item}>{item}</span>)}</div>
      <div className="mini-list"><b>Promos</b>{promos.map((item) => <span key={item}>{item}</span>)}</div>
      <div className="cta-row compact"><Link className="btn primary" href="/contact">Join Waitlist</Link><Link className="btn secondary" href={route}>Watch Trailer</Link></div>
    </article>
  );
}
