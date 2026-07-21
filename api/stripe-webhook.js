const Stripe = require('stripe');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const alertWebhookUrl = process.env.PAYMENT_ALERT_WEBHOOK_URL;

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function sendPaymentAlert(event) {
  if (!alertWebhookUrl) return;

  const payload = {
    text: `Payment event received: ${event.type}`,
    eventType: event.type,
    eventId: event.id,
    livemode: event.livemode
  };

  await fetch(alertWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripeSecretKey || !webhookSecret) {
    return res.status(500).json({ error: 'Stripe webhook is not configured.' });
  }

  const stripe = new Stripe(stripeSecretKey);
  const signature = req.headers['stripe-signature'];

  try {
    const rawBody = await readRawBody(req);
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
      await sendPaymentAlert(event);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook failed:', error.message);
    return res.status(400).json({ error: 'Invalid webhook payload.' });
  }
};
