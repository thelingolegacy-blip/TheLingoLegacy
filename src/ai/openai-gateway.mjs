const DEFAULT_MODEL = 'gpt-6-astra';
const MAX_INPUT_CHARS = 4000;

/**
 * LINGO AI API boundary.
 *
 * Paid inference is disabled unless BOTH explicit environment gates are set.
 * Keep LINGO_AI_PAID_API_ENABLED unset/false while the zero-spend policy applies.
 * OPENAI_API_KEY must be stored as a server-side Worker secret, never in source,
 * browser code, mobile bundles, game clients, or public vars.
 */
export async function handleLingoAIRequest(request, env, fetchImpl = fetch) {
  const url = new URL(request.url);

  if (url.pathname === '/api/v1/ai/status') {
    if (request.method !== 'GET') {
      return json({ ok: false, error: 'Method not allowed.' }, 405);
    }
    const enabled = env.LINGO_AI_PAID_API_ENABLED === 'true'
      && Boolean(env.OPENAI_API_KEY);
    return json({
      ok: true,
      service: 'lingoai',
      provider: 'openai',
      mode: enabled ? 'API_ENABLED' : 'ZERO_SPEND_DISABLED',
      paid_inference_enabled: enabled,
      model: env.LINGO_OPENAI_MODEL || DEFAULT_MODEL,
      key_configured: Boolean(env.OPENAI_API_KEY),
      note: enabled
        ? 'Paid API requests are enabled by explicit server configuration.'
        : 'No OpenAI API requests can be made while paid inference is disabled.'
    });
  }

  if (url.pathname !== '/api/v1/ai/responses') {
    return json({ ok: false, error: 'AI route not found.' }, 404);
  }
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed.' }, 405);
  }

  // Zero-spend guard executes before parsing input or contacting OpenAI.
  if (env.LINGO_AI_PAID_API_ENABLED !== 'true') {
    return json({
      ok: false,
      code: 'PAID_INFERENCE_DISABLED',
      error: 'LINGO AI paid inference is disabled by the zero-spend policy.'
    }, 423);
  }
  if (!env.OPENAI_API_KEY) {
    return json({ ok: false, code: 'OPENAI_KEY_MISSING', error: 'Server-side OpenAI credential is not configured.' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Request body must be valid JSON.' }, 400);
  }
  const input = typeof body?.input === 'string' ? body.input.trim() : '';
  if (!input || input.length > MAX_INPUT_CHARS) {
    return json({ ok: false, error: `input must contain 1–${MAX_INPUT_CHARS} characters.` }, 400);
  }

  const model = env.LINGO_OPENAI_MODEL || DEFAULT_MODEL;
  const upstream = await fetchImpl('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ model, input })
  });

  const payload = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    // Do not forward upstream headers, credentials, or unfiltered provider internals.
    return json({
      ok: false,
      code: 'OPENAI_UPSTREAM_ERROR',
      status: upstream.status,
      error: 'OpenAI could not complete the request.'
    }, 502);
  }

  const outputText = typeof payload.output_text === 'string' ? payload.output_text : '';
  return json({ ok: true, model, output_text: outputText });
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}
