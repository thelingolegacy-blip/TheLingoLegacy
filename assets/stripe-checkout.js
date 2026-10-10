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

  async function verifyCheckoutReturn(sessionId) {
    const status = document.querySelector('[data-stripe-status]');
    if (!status) return;
    if (!sessionId) {
      status.textContent = 'Stripe returned without a session ID. Payment cannot be verified; do not fulfill an order.';
      status.dataset.state = 'pending';
      return;
    }
    status.textContent = 'Verifying payment status with Stripe...';
    status.dataset.state = 'pending';
    try {
      const response = await fetch(`/api/checkout-status?session_id=${encodeURIComponent(sessionId)}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        credentials: 'same-origin',
      });
      const result = await response.json();
      if (!response.ok || !result.ok || result.verified !== true) {
        throw new Error(result.error || 'Payment status could not be verified.');
      }
      if (result.paid === true) {
        const labels = { xp: 'XP Pack', key: 'Mystery Key Pack', avalon: 'Avalon House Badge Set' };
        status.textContent = `Stripe confirms payment for ${labels[result.tier] || 'this order'}. Fulfillment still requires the matching order record.`;
        status.dataset.state = 'success';
      } else {
        status.textContent = `Stripe session status: ${result.status || 'pending'}. No paid order is confirmed; do not fulfill.`;
        status.dataset.state = 'pending';
      }
    } catch {
      status.textContent = 'Payment status could not be verified. Do not fulfill until Stripe confirms a matching paid session.';
      status.dataset.state = 'pending';
    }
  }

  if (checkout === 'success') {
    void verifyCheckoutReturn(params.get('session_id'));
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
      button.textContent = 'Checking checkout...';
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
