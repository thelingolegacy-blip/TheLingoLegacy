'use client';

import { useState } from 'react';

export default function AIHelper() {
  const [open, setOpen] = useState(false);
  return (
    <aside className={`ai-helper ${open ? 'open' : ''}`} aria-label="Ask Lingo assistant">
      <button onClick={() => setOpen(!open)} className="ai-orb">Ask Lingo</button>
      {open && <div className="ai-panel"><h3>Ask Lingo</h3><p>Navigation, games, products, stories, rewards, and voice-ready guidance will connect here.</p></div>}
    </aside>
  );
}
