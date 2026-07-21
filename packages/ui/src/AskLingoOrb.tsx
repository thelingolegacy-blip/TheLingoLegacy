export type AskLingoOrbMode = 'guide' | 'support' | 'creator' | 'publisher' | 'commerce';

export interface AskLingoOrbProps {
  mode?: AskLingoOrbMode;
  userId?: string | null;
  entryContext: string;
}

export function AskLingoOrb({ mode = 'guide', userId, entryContext }: AskLingoOrbProps) {
  return (
    <section className="rounded-3xl border border-yellow-400/30 bg-zinc-950 p-6 shadow-2xl shadow-yellow-900/20">
      <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">Ask Lingo / Lingo.ai</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">Your empire guide is online.</h2>
      <p className="mt-2 text-sm text-zinc-300">
        Mode: {mode}. Context: {entryContext}. {userId ? `Session: ${userId}` : 'Guest session'}.
      </p>
    </section>
  );
}
