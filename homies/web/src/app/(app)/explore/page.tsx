import Link from "next/link";
import { Compass, ShieldCheck } from "lucide-react";

export default function ExplorePage() {
  return <section><p className="text-sm font-semibold text-rose-300">DISCOVERY</p><h1 className="mt-2 text-3xl font-black">Find your kind of people.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Explore is currently a UI preview. No real profiles, location data, or personal information are loaded.</p><div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6"><Compass className="text-rose-300" size={24}/><h2 className="mt-4 text-lg font-bold">Your discovery feed is being prepared</h2><p className="mt-2 text-sm leading-6 text-zinc-400">When the API is connected, profile visibility, preferences, blocks, and safety filters must be enforced by the server.</p><div className="mt-5 flex items-center gap-2 text-xs text-zinc-500"><ShieldCheck size={16}/> Privacy-first by default</div><Link href="/profile" className="mt-5 inline-block text-sm font-semibold text-rose-200 hover:text-white">Set up your preview profile →</Link></div></section>;
}
