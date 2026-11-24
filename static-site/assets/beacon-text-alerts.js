(function () {
  const forms = document.querySelectorAll('[data-beacon-alert-form]');
  if (!forms.length) return;

  function setStatus(form, message, isError) {
    const status = form.querySelector('[data-beacon-alert-status]');
    if (!status) return;
    status.textContent = message;
    status.dataset.state = isError ? 'error' : 'success';
  }

  forms.forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submit = form.querySelector('button[type="submit"]');
      const data = new FormData(form);
      const payload = {
        phone: data.get('phone'),
        zone: data.get('zone'),
        source: data.get('source'),
        consent: data.get('consent') === 'on',
      };

      if (submit) submit.disabled = true;
      setStatus(form, 'Starting beacon text alerts...', false);

      try {
        const response = await fetch('/api/beacon-text-alerts', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.error || 'Unable to start alerts.');
        setStatus(form, result.message || 'Beacon text alerts started.', false);
      } catch (error) {
        setStatus(form, error.message || 'Unable to start alerts.', true);
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  });
})();
