const PROVIDERS = new Set(['openai', 'claude', 'gemini', 'grok']);
const DEVELOPER_LANGUAGES = new Set(['javascript', 'typescript', 'python', 'html', 'css', 'json']);
const IDENTIFIER_PATTERN = /^[a-z][a-z0-9_-]{0,63}$/;
const CONTROL_CHARACTERS = /[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]/;

/**
 * Validate untrusted JSON bodies before route handlers perform authorization-
 * gated work. This helper is intentionally not an HTTP parser or route.
 * Server policy must still derive tenant, roles, tools, budgets, and provider
 * permissions from the authenticated principal and trusted configuration.
 */
export function validateGatewayRequest(kind, body) {
  if (!isPlainRecord(body)) return invalid('AI_REQUEST_BODY_INVALID');

  switch (kind) {
    case 'chat': {
      if (!hasOnlyKeys(body, ['message', 'provider'])
        || !isText(body.message, 2000)
        || (body.provider !== undefined && !PROVIDERS.has(body.provider))) {
        return invalid('AI_CHAT_REQUEST_INVALID');
      }
      return valid({
        message: body.message.trim(),
        ...(body.provider === undefined ? {} : { provider: body.provider })
      });
    }

    case 'compare': {
      if (!hasOnlyKeys(body, ['message', 'providers'])
        || !isText(body.message, 2000)
        || !Array.isArray(body.providers)
        || body.providers.length < 2 || body.providers.length > 4
        || body.providers.some((provider) => !PROVIDERS.has(provider))
        || new Set(body.providers).size !== body.providers.length) {
        return invalid('AI_COMPARE_REQUEST_INVALID');
      }
      return valid({ message: body.message.trim(), providers: [...body.providers] });
    }

    case 'agents': {
      if (!hasOnlyKeys(body, ['agent_id', 'task'])
        || !isIdentifier(body.agent_id)
        || !isText(body.task, 4000)) {
        return invalid('AI_AGENT_REQUEST_INVALID');
      }
      return valid({ agent_id: body.agent_id, task: body.task.trim() });
    }

    case 'developer': {
      if (!hasOnlyKeys(body, ['language', 'task', 'code'])
        || !DEVELOPER_LANGUAGES.has(body.language)
        || !isText(body.task, 2000)
        || (body.code !== undefined && !isText(body.code, 12000, true))) {
        return invalid('AI_DEVELOPER_REQUEST_INVALID');
      }
      return valid({
        language: body.language,
        task: body.task.trim(),
        ...(body.code === undefined ? {} : { code: body.code })
      });
    }

    default:
      return invalid('AI_REQUEST_KIND_UNSUPPORTED');
  }
}

function isPlainRecord(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyKeys(value, allowed) {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function isText(value, maxLength, allowWhitespaceOnly = false) {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= maxLength
    && !CONTROL_CHARACTERS.test(value)
    && (allowWhitespaceOnly || Boolean(value.trim()));
}

function isIdentifier(value) {
  return typeof value === 'string' && IDENTIFIER_PATTERN.test(value);
}

function valid(value) {
  return { ok: true, status: 200, value: Object.freeze(value) };
}

function invalid(code) {
  return { ok: false, status: 400, code };
}
