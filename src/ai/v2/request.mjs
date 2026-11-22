import { resolveAskLingoMode } from './modes.mjs';

const ALLOWED_FIELDS = new Set(['message', 'mode', 'surface', 'locale', 'client_request_id']);
const ALLOWED_SURFACES = new Set(['web', 'ios', 'android', 'desktop', 'tv', 'unity', 'unreal']);
const MAX_MESSAGE_LENGTH = 12_000;

export function validateAskLingoQueryRequest(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)
    || Object.getPrototypeOf(input) !== Object.prototype) {
    return invalid('INVALID_REQUEST');
  }

  if (Object.keys(input).some((key) => !ALLOWED_FIELDS.has(key))) {
    return invalid('INVALID_REQUEST');
  }

  if (typeof input.message !== 'string') return invalid('INVALID_REQUEST');
  const message = input.message.trim();
  if (!message || message.length > MAX_MESSAGE_LENGTH) return invalid('INVALID_REQUEST');

  const mode = resolveAskLingoMode(input.mode);
  if (!mode) return invalid('INVALID_MODE');

  if (typeof input.surface !== 'string' || !ALLOWED_SURFACES.has(input.surface)) {
    return invalid('INVALID_REQUEST');
  }

  const locale = input.locale === undefined ? 'en-US' : input.locale;
  if (typeof locale !== 'string' || !/^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/.test(locale)) {
    return invalid('INVALID_REQUEST');
  }

  let clientRequestId;
  if (input.client_request_id !== undefined) {
    if (typeof input.client_request_id !== 'string'
      || input.client_request_id.length < 1
      || input.client_request_id.length > 128
      || !/^[A-Za-z0-9._:-]+$/.test(input.client_request_id)) {
      return invalid('INVALID_REQUEST');
    }
    clientRequestId = input.client_request_id;
  }

  return {
    ok: true,
    value: Object.freeze({
      message,
      mode: mode.id,
      surface: input.surface,
      locale,
      ...(clientRequestId ? { clientRequestId } : {})
    })
  };
}

function invalid(code) {
  return { ok: false, code };
}
