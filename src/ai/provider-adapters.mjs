const MAX_MESSAGE_CHARS = 2000;
const DEFAULT_TIMEOUT_MS = 20000;
const MAX_TIMEOUT_MS = 60000;
const MAX_RESPONSE_BYTES = 1024 * 1024;

const PROVIDERS = Object.freeze({
  openai: {
    keyEnv: 'OPENAI_API_KEY',
    modelEnv: 'OPENAI_MODEL',
    allowedModelsEnv: 'OPENAI_ALLOWED_MODELS',
    enabledEnv: 'LLG_AI_PROVIDER_OPENAI_ENABLED',
    endpoint: 'https://api.openai.com/v1/responses',
    headers: (key) => ({ authorization: `Bearer ${key}` }),
    body: (model, message) => ({
      model,
      input: [{ role: 'user', content: [{ type: 'input_text', text: message }] }],
      max_output_tokens: 1024,
      store: false
    }),
    answer: (payload) => {
      if (typeof payload?.output_text === 'string') return payload.output_text;
      const output = Array.isArray(payload?.output) ? payload.output : [];
      return output
        .flatMap((item) => Array.isArray(item?.content) ? item.content : [])
        .filter((item) => item?.type === 'output_text' && typeof item.text === 'string')
        .map((item) => item.text)
        .join('\n');
    }
  },
  claude: {
    keyEnv: 'ANTHROPIC_API_KEY',
    modelEnv: 'ANTHROPIC_MODEL',
    allowedModelsEnv: 'ANTHROPIC_ALLOWED_MODELS',
    enabledEnv: 'LLG_AI_PROVIDER_CLAUDE_ENABLED',
    endpoint: 'https://api.anthropic.com/v1/messages',
    headers: (key) => ({ authorization: `Bearer ${key}`, 'anthropic-version': '2023-06-01' }),
    body: (model, message) => ({
      model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: message }]
    }),
    answer: (payload) => (Array.isArray(payload?.content) ? payload.content : [])
      .filter((item) => item?.type === 'text' && typeof item.text === 'string')
      .map((item) => item.text)
      .join('\n')
  },
  gemini: {
    keyEnv: 'GEMINI_API_KEY',
    modelEnv: 'GEMINI_MODEL',
    allowedModelsEnv: 'GEMINI_ALLOWED_MODELS',
    enabledEnv: 'LLG_AI_PROVIDER_GEMINI_ENABLED',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/interactions',
    headers: (key) => ({ 'x-goog-api-key': key }),
    body: (model, message) => ({
      model,
      input: message,
      store: false
    }),
    answer: (payload) => {
      if (typeof payload?.output_text === 'string') return payload.output_text;
      const steps = Array.isArray(payload?.steps) ? payload.steps : [];
      return steps
        .filter((step) => step?.type === 'model_output')
        .flatMap((step) => Array.isArray(step?.content) ? step.content : [])
        .filter((item) => item?.type === 'text' && typeof item.text === 'string')
        .map((item) => item.text)
        .join('\n');
    }
  },
  grok: {
    keyEnv: 'XAI_API_KEY',
    modelEnv: 'XAI_MODEL',
    allowedModelsEnv: 'XAI_ALLOWED_MODELS',
    enabledEnv: 'LLG_AI_PROVIDER_GROK_ENABLED',
    endpoint: 'https://api.x.ai/v1/responses',
    headers: (key) => ({ authorization: `Bearer ${key}` }),
    body: (model, message) => ({
      model,
      input: message,
      max_output_tokens: 1024,
      store: false
    }),
    answer: (payload) => {
      if (typeof payload?.output_text === 'string') return payload.output_text;
      const output = Array.isArray(payload?.output) ? payload.output : [];
      return output
        .flatMap((item) => Array.isArray(item?.content) ? item.content : [])
        .filter((item) => item?.type === 'output_text' && typeof item.text === 'string')
        .map((item) => item.text)
        .join('\n');
    }
  }
});

/**
 * Invoke exactly one explicitly selected provider.
 *
 * Provider credentials are read only from server-side environment bindings.
 * This function does not log or persist prompts, perform automatic fallback,
 * or forward one provider's output to another provider.
 */
export async function invokeAiProvider(providerId, message, env = {}, options = {}) {
  const provider = PROVIDERS[providerId];
  if (!provider) return failure('AI_PROVIDER_UNSUPPORTED', 400);

  if (typeof message !== 'string' || !message.trim() || message.trim().length > MAX_MESSAGE_CHARS) {
    return failure('AI_REQUEST_INVALID', 400);
  }

  if (env.LLG_AI_ENABLED !== 'true' || env[provider.enabledEnv] !== 'true') {
    return failure('AI_PROVIDER_DISABLED', 503);
  }

  const apiKey = env[provider.keyEnv];
  const model = env[provider.modelEnv];
  const allowedModels = typeof env[provider.allowedModelsEnv] === 'string'
    ? env[provider.allowedModelsEnv].split(',').map((value) => value.trim()).filter(Boolean)
    : [];
  if (typeof apiKey !== 'string' || !apiKey.trim()
    || typeof model !== 'string' || !/^[A-Za-z0-9._:-]{1,128}$/.test(model)
    || allowedModels.length === 0) {
    return failure('AI_PROVIDER_NOT_CONFIGURED', 503);
  }
  if (!allowedModels.includes(model)) return failure('AI_MODEL_NOT_ALLOWED', 403);

  const fetchImpl = options.fetchImpl || fetch;
  const timeoutMs = clampTimeout(options.timeoutMs);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const endpoint = typeof provider.endpoint === 'function'
      ? provider.endpoint(model)
      : provider.endpoint;
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...provider.headers(apiKey)
      },
      body: JSON.stringify(provider.body(model, message.trim())),
      signal: controller.signal
    });

    if (!response?.ok) return failure('AI_PROVIDER_UPSTREAM_ERROR', 502);

    const parsed = await readJsonBounded(response, MAX_RESPONSE_BYTES);
    if (parsed.tooLarge) return failure('AI_PROVIDER_RESPONSE_TOO_LARGE', 502);
    if (!parsed.ok) return failure('AI_PROVIDER_INVALID_RESPONSE', 502);

    const answer = provider.answer(parsed.payload).trim();
    if (!answer) return failure('AI_PROVIDER_EMPTY_RESPONSE', 502);

    return {
      ok: true,
      status: 200,
      provider: providerId,
      model,
      answer,
      request_id: crypto.randomUUID(),
      upstream_request_id: readUpstreamRequestId(response.headers)
    };
  } catch {
    return failure(controller.signal.aborted ? 'AI_PROVIDER_TIMEOUT' : 'AI_PROVIDER_UNAVAILABLE',
      controller.signal.aborted ? 504 : 502);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Compare responses from 2–4 providers explicitly selected by the caller.
 * Each provider receives the same user message independently. Outputs are
 * returned to the caller but are never forwarded to another provider.
 */
export async function compareAiProviders(providerIds, message, env = {}, options = {}) {
  if (!Array.isArray(providerIds) || providerIds.length < 2 || providerIds.length > 4
    || new Set(providerIds).size !== providerIds.length
    || providerIds.some((id) => !Object.hasOwn(PROVIDERS, id))) {
    return { ok: false, status: 400, code: 'AI_COMPARISON_SELECTION_INVALID', results: [] };
  }

  const results = await Promise.all(providerIds.map((providerId) =>
    invokeAiProvider(providerId, message, env, options)
  ));
  return {
    ok: results.every((result) => result.ok),
    status: results.every((result) => result.ok) ? 200 : 207,
    results
  };
}

async function readJsonBounded(response, maxBytes) {
  const declaredLength = Number(response.headers?.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    try { await response.body?.cancel(); } catch {}
    return { ok: false, tooLarge: true };
  }

  if (!response.body?.getReader) {
    try {
      const text = await response.text();
      if (new TextEncoder().encode(text).byteLength > maxBytes) return { ok: false, tooLarge: true };
      return { ok: true, payload: JSON.parse(text) };
    } catch {
      return { ok: false, tooLarge: false };
    }
  }

  const reader = response.body.getReader();
  const chunks = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        try { await reader.cancel(); } catch {}
        return { ok: false, tooLarge: true };
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return { ok: true, payload: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    try { await reader.cancel(); } catch {}
    return { ok: false, tooLarge: false };
  } finally {
    try { reader.releaseLock(); } catch {}
  }
}

function readUpstreamRequestId(headers) {
  for (const name of ['x-request-id', 'request-id', 'anthropic-request-id', 'x-goog-request-id']) {
    const value = headers?.get(name);
    if (typeof value === 'string' && /^[A-Za-z0-9._:-]{1,128}$/.test(value)) return value;
  }
  return null;
}

function clampTimeout(value) {
  const requested = Number.isFinite(value) ? value : DEFAULT_TIMEOUT_MS;
  return Math.min(Math.max(Math.floor(requested), 1000), MAX_TIMEOUT_MS);
}

function failure(code, status) {
  return { ok: false, status, code };
}
