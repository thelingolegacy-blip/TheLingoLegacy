const PHONE_RE = /^\+[1-9]\d{7,14}$/;
const ZONES = new Set([
  'full-entity-simulcast',
  'outer-crown-all',
  'nyc-crown-zone',
  'delaware-crown-zone',
  'new-jersey-crown-zone',
]);
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT = 5;
const rateBuckets = new Map();

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function normalizePhone(value = '') {
  return String(value).replace(/[\s().-]/g, '').trim();
}

function normalizeSource(value = '') {
  return String(value || 'beacon-alert-form').replace(/[^a-z0-9 _.-]/gi, '').slice(0, 80) || 'beacon-alert-form';
}

function clientKey(req, phone) {
  const forwardedFor = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = forwardedFor || req.socket?.remoteAddress || 'unknown';
  return `${ip}:${phone}`;
}

function isRateLimited(key) {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.startedAt > RATE_WINDOW_MS) {
    rateBuckets.set(key, {startedAt: now, count: 1});
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT;
}

async function parseBody(req) {
  if (typeof req.body === 'object' && req.body !== null) return req.body;
  if (typeof req.body === 'string' && req.body.trim()) return JSON.parse(req.body);

  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

function alertMessage(zone, source) {
  const zoneLabel = zone
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  return `Lingo Legacy Beacon Alerts active for ${zoneLabel}. Source: ${source || 'web'}. Reply STOP to opt out.`;
}

async function sendViaWebhook(payload) {
  const url = process.env.BEACON_ALERTS_WEBHOOK_URL;
  if (!url) return {configured: false};

  const headers = {'Content-Type': 'application/json'};
  if (process.env.BEACON_ALERTS_WEBHOOK_SECRET) {
    headers.Authorization = `Bearer ${process.env.BEACON_ALERTS_WEBHOOK_SECRET}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Webhook returned ${response.status}`);
  }

  return {configured: true, provider: 'webhook'};
}

async function sendViaTwilio(payload) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return {configured: false};

  const body = new URLSearchParams({
    To: payload.phone,
    From: from,
    Body: payload.message,
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Twilio returned ${response.status}`);
  }

  return {configured: true, provider: 'twilio'};
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, {ok: false, error: 'Method not allowed'});
  }

  try {
    const body = await parseBody(req);
    const phone = normalizePhone(body.phone);
    const zone = String(body.zone || '').trim();
    const source = normalizeSource(body.source);
    const consent = body.consent === true || body.consent === 'true' || body.consent === 'on';

    if (!PHONE_RE.test(phone)) {
      return json(res, 400, {ok: false, error: 'Enter a phone number in E.164 format, for example +15551234567.'});
    }
    if (!ZONES.has(zone)) {
      return json(res, 400, {ok: false, error: 'Unknown beacon alert zone.'});
    }
    if (!consent) {
      return json(res, 400, {ok: false, error: 'Consent is required before starting text alerts.'});
    }
    if (isRateLimited(clientKey(req, phone))) {
      return json(res, 429, {ok: false, error: 'Too many beacon alert requests. Try again later.'});
    }

    const payload = {
      phone,
      zone,
      source,
      message: alertMessage(zone, source),
      consent: true,
      createdAt: new Date().toISOString(),
    };

    const webhookResult = await sendViaWebhook(payload);
    const twilioResult = webhookResult.configured ? webhookResult : await sendViaTwilio(payload);

    if (!twilioResult.configured) {
      return json(res, 202, {
        ok: true,
        staged: true,
        message: 'Beacon text alert validated. Configure BEACON_ALERTS_WEBHOOK_URL or Twilio env vars to send live SMS.',
      });
    }

    return json(res, 200, {ok: true, provider: twilioResult.provider, message: 'Beacon text alerts started.'});
  } catch (error) {
    return json(res, 500, {ok: false, error: 'Beacon text alerts could not be started right now.'});
  }
};
