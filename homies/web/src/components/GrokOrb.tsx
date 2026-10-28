import Link from "next/link";
import { Sparkles } from "lucide-react";

export function GrokOrb() {
  return <Link href="/grok" aria-label="Open Grok assistant" className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-rose-200/30 bg-crimson text-white shadow-crimson transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 lg:bottom-6">
    <Sparkles size={23} aria-hidden="true" />
  </Link>;
}
