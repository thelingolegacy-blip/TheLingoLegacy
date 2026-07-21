'use client';

import Link from 'next/link';
import { useState } from 'react';
import { askLingoIntents, askLingoSmartSuggestions } from '@/lib/ask-lingo';

export default function AIHelper() {
  const [open, setOpen] = useState(false);
  const featured = askLingoIntents.slice(0, 4);

  return (
    <aside className={`ai-helper ${open ? 'open' : ''}`} aria-label="Ask Lingo assistant">
      <button onClick={() => setOpen(!open)} className="ai-orb" aria-expanded={open}>Ask Lingo</button>
      {open && (
        <div className="ai-panel">
          <p className="eyebrow">Universal Guide</p>
          <h3>Ask Lingo</h3>
          <p>Route to games, products, stories, rewards, media, and help.</p>
          <div className="ai-mini-input">Ask anything...</div>
          <div className="ai-chip-stack">
            {featured.map((intent) => <Link href={intent.targetRoute} key={intent.category}>{intent.label}</Link>)}
          </div>
          <p className="ai-suggestion">{askLingoSmartSuggestions[0]}</p>
          <Link className="btn secondary compact" href="/ask-lingo">Open full assistant</Link>
        </div>
      )}
    </aside>
  );
}
