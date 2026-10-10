(function () {
  const buttons = document.querySelectorAll('[data-stripe-tier]');
  if (!buttons.length) return;

  function statusTarget(button) {
    return document.querySelector(button.dataset.statusTarget || '[data-stripe-status]');
  }

  function setStatus(button, message, state) {
    const status = statusTarget(button);
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state || 'info';
  }

  function customerEmail() {
    const field = document.querySelector('[data-checkout-email], input[type="email"]');
    return field ? field.value.trim() : '';
  }

  const params = new URLSearchParams(window.location.search);
  const checkout = params.get('checkout');
  if (checkout === 'success') {
    const status = document.querySelector('[data-stripe-status]');
    if (status) {
      status.textContent = 'Stripe returned to this page, but payment status has not been verified by this site. Do not fulfill an order until the matching payment is confirmed in Stripe.';
      status.dataset.state = 'pending';
    }
  }
  if (checkout === 'cancelled') {
    const status = document.querySelector('[data-stripe-status]');
    if (status) {
      status.textContent = 'Checkout was cancelled; no paid order is confirmed. You can send an email request instead.';
      status.dataset.state = 'error';
    }
  }

  buttons.forEach((button) => {
    button.addEventListener('click', async () => {
      const original = button.textContent;
      button.disabled = true;
      button.textContent = 'Opening Stripe...';
      setStatus(button, 'Checking whether secure checkout is configured...', 'info');

      try {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({tier: button.dataset.stripeTier, email: customerEmail()}),
        });
        const result = await response.json();
        if (!response.ok || !result.ok || !result.url) throw new Error(result.error || 'Stripe checkout is unavailable.');
        window.location.assign(result.url);
      } catch (error) {
        setStatus(button, `${error.message} Use the email request as a backup.`, 'error');
        button.disabled = false;
        button.textContent = original;
      }
    });
  });
})();
