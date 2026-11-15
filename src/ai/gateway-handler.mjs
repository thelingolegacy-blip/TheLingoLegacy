import { validateGatewayRequest } from './gateway-request-validation.mjs';

const MAX_BODY_BYTES = 16 * 1024;
const ROUTES = new Map([
  ['/api/ai/v1/chat', { kind: 'chat', capability: 'ai:chat' }],
  ['/api/ai/v1/compare', { kind: 'compare', capability: 'ai:compare' }],
  ['/api/ai/v1/agents/plan', { kind: 'agents', capability: 'ai:agents:plan' }],
  ['/api/ai/v1/developer/analyze', { kind: 'developer', capability: 'ai:developer:analyze' }]
]);
const REQUIRED_DEPENDENCIES = [
  'authenticate', 'authorize', 'moderateInput', 'reserveBudget',
  'dispatch', 'moderateOutput', 'settleBudget'
];

/**
 * Build a fail-closed HTTP handler around injected, independently reviewed
 * identity, policy, moderation, budget, and provider-dispatch services.
 *
 * This factory is source-only. It does not create those services, bind secrets,
 * configure an identity issuer, or expose a route in any production runtime.
 */
export function createAiGatewayHandler(dependencies = {}) {
  const configured = REQUIRED_DEPENDENCIES.every((name) =>
    typeof dependencies[name] === 'function'
  );

  return async function handleAiGatewayRequest(request) {
    const requestId = crypto.randomUUID();
    if (!configured) return respond(500, requestId, 'AI_GATEWAY_CONFIGURATION_INVALID');

    let url;
    try {
      url = new URL(request.url);
    } catch {
      return respond(400, requestId, 'AI_REQUEST_INVALID');
    }

    if (url.pathname === '/api/ai/v1/agents/run') {
      return respond(503, requestId, 'AI_AGENT_EXECUTION_DISABLED');
    }

    const route = ROUTES.get(url.pathname);
    if (!route) return respond(404, requestId, 'AI_ROUTE_NOT_FOUND');
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({
        ok: false, request_id: requestId, error: { code: 'METHOD_NOT_ALLOWED' }
      }), { status: 405, headers: { 'content-type': 'application/json', allow: 'POST' } });
    }

    let authentication;
    try {
      authentication = await dependencies.authenticate(request, route.capability);
    } catch {
      return respond(503, requestId, 'AI_AUTHORIZATION_UNAVAILABLE');
    }
    if (authentication?.ok !== true || !authentication.principal) {
      return respond(authentication?.status || 401, requestId,
        authentication?.code || 'AUTHENTICATION_REQUIRED');
    }

    const parsed = await readBoundedJson(request);
    if (!parsed.ok) return respond(parsed.status, requestId, parsed.code);

    const validation = validateGatewayRequest(route.kind, parsed.value);
    if (!validation.ok) return respond(validation.status, requestId, validation.code);
    if (route.kind === 'chat' && !validation.value.provider) {
      return respond(400, requestId, 'AI_CHAT_PROVIDER_REQUIRED');
    }

    const providerIds = route.kind === 'chat'
      ? [validation.value.provider]
      : route.kind === 'compare' ? validation.value.providers : [];

    let authorization;
    try {
      authorization = await dependencies.authorize({
        principal: authentication.principal,
        capability: route.capability,
        providerIds
      });
    } catch {
      return respond(503, requestId, 'AI_AUTHORIZATION_UNAVAILABLE');
    }
    if (authorization?.ok !== true) return respond(403, requestId, 'AUTHORIZATION_DENIED');

    let inputDecision;
    try {
      inputDecision = await dependencies.moderateInput({
        principal: authentication.principal,
        capability: route.capability,
        input: validation.value
      });
    } catch {
      return respond(503, requestId, 'AI_POLICY_SERVICE_UNAVAILABLE');
    }
    if (inputDecision?.ok !== true) return respond(403, requestId, 'AI_INPUT_POLICY_BLOCKED');

    let budget;
    try {
      budget = await dependencies.reserveBudget({
        principal: authentication.principal,
        capability: route.capability,
        providerIds,
        input: validation.value
      });
    } catch {
      return respond(503, requestId, 'AI_BUDGET_SERVICE_UNAVAILABLE');
    }
    if (budget?.ok !== true) {
      return respond(429, requestId, 'AI_BUDGET_EXCEEDED');
    }
    if (!Object.hasOwn(budget, 'reservation')
      || budget.reservation === undefined || budget.reservation === null) {
      return respond(503, requestId, 'AI_BUDGET_RESERVATION_INVALID');
    }

    let execution;
    try {
      execution = await dependencies.dispatch({
        principal: authentication.principal,
        capability: route.capability,
        providerIds,
        input: validation.value,
        reservation: budget.reservation,
        requestId
      });
    } catch {
      return await settleAndRespond(dependencies, budget.reservation, 'failed', null,
        requestId, 'AI_EXECUTION_FAILED');
    }
    if (execution?.ok !== true) {
      return await settleAndRespond(dependencies, budget.reservation, 'failed', execution,
        requestId, 'AI_EXECUTION_FAILED');
    }

    let outputDecision;
    try {
      outputDecision = await dependencies.moderateOutput({
        principal: authentication.principal,
        capability: route.capability,
        output: execution.data
      });
    } catch {
      return await settleAndRespond(dependencies, budget.reservation, 'blocked', execution,
        requestId, 'AI_POLICY_SERVICE_UNAVAILABLE');
    }
    if (outputDecision?.ok !== true) {
      return await settleAndRespond(dependencies, budget.reservation, 'blocked', execution,
        requestId, 'AI_OUTPUT_POLICY_BLOCKED');
    }

    let settlement;
    try {
      settlement = await dependencies.settleBudget({
        reservation: budget.reservation,
        outcome: 'succeeded',
        execution: execution.usage ?? null
      });
    } catch {
      return respond(503, requestId, 'AI_BUDGET_RECONCILIATION_UNAVAILABLE');
    }
    if (settlement?.ok !== true) {
      return respond(503, requestId, 'AI_BUDGET_RECONCILIATION_UNAVAILABLE');
    }

    return new Response(JSON.stringify({
      ok: true,
      request_id: requestId,
      capability: route.capability,
      data: execution.data
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
}

async function settleAndRespond(dependencies, reservation, outcome, execution, requestId, code) {
  try {
    const settlement = await dependencies.settleBudget({
      reservation, outcome, execution: execution?.usage ?? null
    });
    if (settlement?.ok !== true) {
      return respond(503, requestId, 'AI_BUDGET_RECONCILIATION_UNAVAILABLE');
    }
  } catch {
    return respond(503, requestId, 'AI_BUDGET_RECONCILIATION_UNAVAILABLE');
  }
  const status = code === 'AI_EXECUTION_FAILED' ? 502
    : code === 'AI_POLICY_SERVICE_UNAVAILABLE' ? 503 : 403;
  return respond(status, requestId, code);
}

async function readBoundedJson(request) {
  const contentType = request.headers.get('content-type') || '';
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    return { ok: false, status: 415, code: 'AI_CONTENT_TYPE_UNSUPPORTED' };
  }

  const declaredLength = request.headers.get('content-length');
  if (declaredLength !== null) {
    const length = Number(declaredLength);
    if (!Number.isSafeInteger(length) || length < 0) {
      return { ok: false, status: 400, code: 'AI_CONTENT_LENGTH_INVALID' };
    }
    if (length > MAX_BODY_BYTES) {
      try { await request.body?.cancel(); } catch {}
      return { ok: false, status: 413, code: 'AI_REQUEST_TOO_LARGE' };
    }
  }

  if (!request.body?.getReader) {
    return { ok: false, status: 400, code: 'AI_REQUEST_BODY_INVALID' };
  }

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        try { await reader.cancel(); } catch {}
        return { ok: false, status: 413, code: 'AI_REQUEST_TOO_LARGE' };
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, status: 400, code: 'AI_REQUEST_BODY_INVALID' };
  } finally {
    try { reader.releaseLock(); } catch {}
  }
}

function respond(status, requestId, code) {
  return new Response(JSON.stringify({
    ok: false,
    request_id: requestId,
    error: { code }
  }), { status, headers: { 'content-type': 'application/json' } });
}
