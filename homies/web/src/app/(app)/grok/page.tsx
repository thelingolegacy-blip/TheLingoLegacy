"use client";

import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GrokPage() {
  const [draft, setDraft] = useState("");
  return <section className="mx-auto max-w-3xl"><p className="text-sm font-semibold text-rose-300">YOUR AI WINGMAN</p><h1 className="mt-2 text-3xl font-black">Grok</h1><p className="mt-3 text-sm leading-6 text-zinc-400">Icebreakers, profile prompts, and conversation ideas—without judgment.</p><div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-crimson/20 text-rose-200"><Sparkles/></span><div><p className="font-semibold">Grok preview</p><p className="text-xs text-zinc-500">AI service not connected</p></div></div><div className="mt-6 rounded-xl bg-black/20 p-4 text-sm leading-6 text-zinc-300">Try starting with something specific and kind: “What’s a small thing that always makes your day better?”</div><form className="mt-5 flex gap-2" onSubmit={e => { e.preventDefault(); setDraft(""); }}><input value={draft} onChange={e=>setDraft(e.target.value)} maxLength={500} aria-label="Message Grok" placeholder="Ask for a conversation starter…" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-rose-300/60"/><Button type="submit" disabled={!draft.trim()} aria-label="Send message"><Send size={17}/></Button></form><p className="mt-3 text-xs text-zinc-600">This preview does not transmit your message or call an AI provider.</p></div></section>;
}
