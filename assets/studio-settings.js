(() => {
  const defaults = {
    visuals: 'off',
    animations: 'off',
    sound: 'off',
    upgrades: 'off'
  };
  const storageKey = 'lingoStudioSettings';

  function readSettings() {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(storageKey) || '{}') };
    } catch {
      return { ...defaults };
    }
  }

  function writeSettings(settings) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(settings));
    } catch {
      return false;
    }
    return true;
  }

  function applySettings(settings = readSettings()) {
    const body = document.body;
    if (!body) return;
    body.classList.toggle('settings-visuals', settings.visuals === 'on');
    body.classList.toggle('settings-animations', settings.animations === 'on');
    body.classList.toggle('settings-sound', settings.sound === 'on');
    body.classList.toggle('settings-show-upgrades', settings.upgrades === 'on');
  }

  function bindSettingsPage() {
    const form = document.querySelector('[data-studio-settings-form]');
    if (!form) return;

    const status = document.querySelector('[data-settings-status]');
    const soundTest = document.querySelector('[data-test-sound]');
    const settings = readSettings();

    for (const [key, value] of Object.entries(settings)) {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) input.checked = value === 'on';
    }

    form.addEventListener('change', () => {
      const next = { ...defaults };
      for (const key of Object.keys(defaults)) {
        const input = form.querySelector(`[name="${key}"]`);
        next[key] = input && input.checked ? 'on' : 'off';
      }
      writeSettings(next);
      applySettings(next);
      if (status) status.textContent = 'Settings saved on this device.';
    });

    form.addEventListener('reset', () => {
      setTimeout(() => {
        writeSettings(defaults);
        applySettings(defaults);
        for (const key of Object.keys(defaults)) {
          const input = form.querySelector(`[name="${key}"]`);
          if (input) input.checked = false;
        }
        if (status) status.textContent = 'Settings reset to the clean public default.';
      });
    });

    if (soundTest) {
      soundTest.addEventListener('click', () => {
        const current = readSettings();
        if (current.sound !== 'on') {
          if (status) status.textContent = 'Turn on sound prompts first. No sound played.';
          return;
        }
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = 660;
          gain.gain.setValueAtTime(0.0001, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.32);
          osc.connect(gain).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
          if (status) status.textContent = 'Sound test played.';
        } catch {
          if (status) status.textContent = 'Sound test is unavailable in this browser.';
        }
      });
    }
  }

  window.LingoStudioSettings = { readSettings, writeSettings, applySettings };
  document.addEventListener('DOMContentLoaded', () => {
    applySettings();
    bindSettingsPage();
  });
})();
