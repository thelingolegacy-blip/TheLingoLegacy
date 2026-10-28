import { UserRound, ShieldCheck } from "lucide-react";

export default function Page() {
  return <section><p className="text-sm font-semibold text-rose-300">YOUR SPACE</p><h1 className="mt-2 text-3xl font-black">Your profile</h1><div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6"><UserRound className="text-rose-300" size={24}/><h2 className="mt-4 text-lg font-bold">Preview only</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Profile editing and photo uploads are not connected. This page does not store or submit personal information.</p><div className="mt-5 flex items-center gap-2 text-xs text-zinc-500"><ShieldCheck size={15}/> No live service is connected</div></div></section>;
}
