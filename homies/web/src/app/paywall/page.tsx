import { LockKeyhole, ShieldCheck } from "lucide-react";

export default function Page() {
  return <section><p className="text-sm font-semibold text-rose-300">MEMBERSHIP</p><h1 className="mt-2 text-3xl font-black">Homies Plus</h1><div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6"><LockKeyhole className="text-rose-300" size={24}/><h2 className="mt-4 text-lg font-bold">Preview only</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Checkout is disabled until Stripe webhooks, subscription entitlements, and app-store billing validation are implemented and verified.</p><div className="mt-5 flex items-center gap-2 text-xs text-zinc-500"><ShieldCheck size={15}/> No live service is connected</div></div></section>;
}
