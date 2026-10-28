import Link from "next/link";
import { Compass, MessageCircle, UsersRound, UserRound, MapPin, Sparkles } from "lucide-react";

const links = [
  { href: "/explore", label: "Explore", Icon: Compass },
  { href: "/map", label: "Map", Icon: MapPin },
  { href: "/chat", label: "Messages", Icon: MessageCircle },
  { href: "/circles", label: "Circles", Icon: UsersRound },
  { href: "/profile", label: "My profile", Icon: UserRound },
  { href: "/grok", label: "Ask Grok", Icon: Sparkles }
];

export function Sidebar() {
  return <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-charcoal px-5 py-7 lg:block">
    <Link href="/" className="text-2xl font-black tracking-tight">homies<span className="text-crimson">.</span></Link>
    <p className="mb-8 mt-2 text-xs text-zinc-500">Find your people.</p>
    <nav aria-label="Main navigation" className="space-y-1">
      {links.map(({ href, label, Icon }) => <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"><Icon size={18} aria-hidden="true" />{label}</Link>)}
    </nav>
    <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm font-semibold">Good connections start with respect.</p>
      <p className="mt-2 text-xs leading-5 text-zinc-400">Consent, privacy, and safety come first.</p>
    </div>
  </aside>;
}
