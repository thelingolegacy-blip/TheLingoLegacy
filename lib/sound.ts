export type SoundType = 'identity-login' | 'wallet-event' | 'xp-gain' | 'admin-command' | 'asset-load';

export function playSound(type: SoundType) {
  if (typeof window === 'undefined') return;

  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = 0.4;
  void audio.play().catch(() => {
    // Browsers can block audio until the user interacts with the page.
  });
}
