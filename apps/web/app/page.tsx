import { AskLingoOrb } from '@lingo/ui/AskLingoOrb';
import { LingoNav } from '@lingo/ui/LingoNav';
import { useLingoSession } from '@lingo/auth';
import { lingoEntities } from '@lingo/entities';

export default function Home() {
  const session = useLingoSession();
  const featured = lingoEntities.slice(0, 6);

  return (
    <main className="min-h-screen bg-black text-white">
      <LingoNav />
      <section className="px-6 py-10">
        <p className="text-xs uppercase tracking-[0.4em] text-yellow-300">Loyalty. Legacy. Language.</p>
        <h1 className="mt-4 text-4xl font-bold">The Lingo Legacy™</h1>
        <p className="mt-2 max-w-2xl text-zinc-400">
          One universal account, wallet, XP system, rewards ecosystem, commerce layer, and Ask Lingo intelligence hub.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {featured.map((entity) => (
            <article key={entity.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{entity.category}</p>
              <h2 className="mt-2 text-lg font-semibold">{entity.name}</h2>
              <p className="mt-2 text-sm text-zinc-400">{entity.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-10">
          <AskLingoOrb mode="guide" userId={session?.userId ?? null} entryContext="universal-home" />
        </div>
      </section>
    </main>
  );
}
