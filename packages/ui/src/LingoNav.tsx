const links = ['Games', 'Books', 'Apparel', 'Media', 'Community', 'Rewards'];

export function LingoNav() {
  return (
    <nav className="flex items-center justify-between border-b border-white/10 px-6 py-4 text-white">
      <span className="text-sm font-semibold uppercase tracking-[0.3em]">Lingo Legacy</span>
      <div className="hidden gap-4 text-sm text-zinc-300 md:flex">
        {links.map((link) => (
          <span key={link}>{link}</span>
        ))}
      </div>
    </nav>
  );
}
