const ENDPOINT_PATH = '/api/v1/ask-lingo/query';
const SURFACES = new Set(['web', 'ios', 'android', 'desktop', 'tv', 'unity', 'unreal']);

export class LingoAIError extends Error {
  constructor(message, { status = 0, code = 'LINGO_AI_ERROR' } = {}) {
    super(message);
    this.name = 'LingoAIError';
    this.status = status;
    this.code = code;
  }
}

/**
 * First-party askLINGO client. Supply a Firebase ID-token provider; never pass
 * an OpenAI key or the private Worker-to-Worker token into this client.
 */
export function createLingoAIClient({ baseUrl, getIdToken, fetchImpl = fetch, timeoutMs = 15000 }) {
  if (typeof getIdToken !== 'function') throw new TypeError('getIdToken must be a function.');
  const endpoint = new URL(ENDPOINT_PATH, validateBaseUrl(baseUrl));
  return Object.freeze({
    async query({ message, surface = 'web', locale = 'en-US' }) {
      if (typeof message !== 'string' || !message.trim() || message.trim().length > 2000) {
        throw new LingoAIError('Message must contain 1–2000 characters.', { code: 'INVALID_MESSAGE' });
      }
      if (!SURFACES.has(surface)) throw new LingoAIError('Unsupported LINGO client surface.', { code: 'INVALID_SURFACE' });
      if (typeof locale !== 'string' || !/^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})?$/.test(locale)) {
        throw new LingoAIError('Locale is invalid.', { code: 'INVALID_LOCALE' });
      }

      const token = await getIdToken();
      if (typeof token !== 'string' || token.length < 20) {
        throw new LingoAIError('A signed-in Firebase user is required.', { status: 401, code: 'AUTHENTICATION_REQUIRED' });
      }

      let response;
      try {
        response = await fetchImpl(endpoint, {
          method: 'POST',
          headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' },
          body: JSON.stringify({ message: message.trim(), surface, locale }),
          cache: 'no-store',
          credentials: 'omit',
          redirect: 'error',
          signal: AbortSignal.timeout(timeoutMs)
        });
      } catch {
        throw new LingoAIError('LINGO AI service could not be reached.', { code: 'NETWORK_UNAVAILABLE' });
      }

      let payload;
      try { payload = await response.json(); } catch {
        throw new LingoAIError('LINGO AI returned an invalid response.', { status: response.status, code: 'INVALID_RESPONSE' });
      }
      if (!response.ok) {
        throw new LingoAIError(payload?.message || 'LINGO AI is unavailable.', {
          status: response.status, code: payload?.code || 'REQUEST_FAILED'
        });
      }
      return payload;
    }
  });
}

function validateBaseUrl(value) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError('baseUrl is required.');
  const url = new URL(value);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) {
    throw new TypeError('LINGO AI baseUrl must use HTTPS.');
  }
  return url.origin;
}
