(function () {
  // No-billing launch mode: never create checkout sessions or contact a payment provider.
  const buttons = document.querySelectorAll('[data-stripe-tier]');
  buttons.forEach((button) => {
    button.disabled = true;
    button.setAttribute('aria-disabled', 'true');
    button.textContent = 'Payments paused';
  });
  const status = document.querySelector('[data-stripe-status]');
  if (status) {
    status.textContent = 'Payments, subscriptions, purchases, and paid credits are disabled during the free launch phase. Browse-only mode is active.';
    status.dataset.state = 'info';
  }
})();