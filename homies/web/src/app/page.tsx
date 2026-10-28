import Link from "next/link";
import { ArrowRight, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

const features = [
  { Icon: HeartHandshake, title: "Real connection", body: "Meet people with intention, shared interests, and room to be yourself." },
  { Icon: ShieldCheck, title: "Safety by design", body: "Clear boundaries, privacy controls, and reporting are core product requirements." },
  { Icon: Sparkles, title: "A little help from Grok", body: "Get conversation starters and profile-writing ideas when you want them." }
];

export default function HomePage() {
  return <main className="min-h-screen overflow-hidden bg-hero-glow">
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6"><Link href="/" className="text-2xl font-black tracking-tight">homies<span className="text-crimson">.</span></Link><Link href="/explore" className="text-sm text-zinc-300 hover:text-white">Open preview <ArrowRight className="ml-1 inline" size={15} /></Link></header>
    <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 md:grid-cols-[1.15fr_.85fr] md:items-center md:pb-28 md:pt-24">
      <div><p className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-300/5 px-3 py-1.5 text-xs font-semibold text-rose-200"><span className="h-1.5 w-1.5 rounded-full bg-rose-300" /> Made for meaningful connection</p><h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">Find your people.<span className="text-rose-300"> Be all of you.</span></h1><p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">A thoughtful social and personals experience for LGBTQ+ men, built around connection, consent, and community.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/explore"><Button>Explore Homies <ArrowRight size={17} /></Button></Link><Link href="/circles"><Button variant="secondary">Discover community</Button></Link></div><p className="mt-4 text-xs text-zinc-600">Preview experience — sign-in and live services are not connected yet.</p></div>
      <div className="relative"><div className="absolute inset-8 rounded-full bg-crimson/20 blur-3xl" /><div className="relative rounded-[2rem] border border-white/10 bg-charcoal-panel/90 p-6 shadow-2xl sm:p-8"><div className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="text-xs uppercase tracking-[.25em] text-zinc-500">Your next chapter</p><p className="mt-1 text-xl font-bold">Connection looks good on you.</p></div><Sparkles className="text-rose-300" /></div><div className="mt-6 space-y-3">{["People who share your interests", "Communities that feel like home", "Conversations at your own pace"].map((item, i) => <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-crimson/15 text-sm font-bold text-rose-200">0{i+1}</span><span className="text-sm text-zinc-200">{item}</span></div>)}</div><div className="mt-6 rounded-2xl bg-gradient-to-br from-crimson/25 to-transparent p-5"><p className="text-sm font-semibold">Your identity. Your boundaries. Your pace.</p><p className="mt-2 text-sm leading-6 text-zinc-400">You decide what you share and when.</p></div></div></div>
    </section>
    <section className="mx-auto grid max-w-7xl gap-4 px-6 pb-20 md:grid-cols-3">{features.map(({Icon,title,body}) => <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"><Icon className="text-rose-300" size={22} /><h2 className="mt-5 text-lg font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p></article>)}</section>
    <footer className="border-t border-white/10 px-6 py-6 text-center text-xs text-zinc-600">Homies · Preview build · Safety and privacy are product fundamentals.</footer>
  </main>;
}
