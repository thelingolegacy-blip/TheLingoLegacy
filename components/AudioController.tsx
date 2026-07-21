'use client';

import { useEffect, useState } from 'react';

export default function AudioController() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(localStorage.getItem('lingo-audio-enabled') === 'true');
  }, []);

  function toggleAudio() {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem('lingo-audio-enabled', String(next));
  }

  return <button className="audio-toggle" onClick={toggleAudio} aria-pressed={enabled}>Sound {enabled ? 'ON' : 'OFF'}</button>;
}
