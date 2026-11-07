import test from 'node:test';
import assert from 'node:assert/strict';
import { compareAiProviders, invokeAiProvider } from './provider-adapters.mjs';

const configuredEnv = {
  LLG_AI_ENABLED: 'true',
  LLG_AI_PROVIDER_OPENAI_ENABLED: 'true',
  LLG_AI_PROVIDER_CLAUDE_ENABLED: 'true',
  LLG_AI_PROVIDER_GEMINI_ENABLED: 'true',
  LLG_AI_PROVIDER_GROK_ENABLED: 'true',
  OPENAI_API_KEY: 'test-openai-key',
  OPENAI_MODEL: 'test-openai-model',
  ANTHROPIC_API_KEY: 'test-claude-key',
  ANTHROPIC_MODEL: 'test-claude-model',
  GEMINI_API_KEY: 'test-gemini-key',
  GEMINI_MODEL: 'test-gemini-model',
  XAI_API_KEY: 'test-grok-key',
  XAI_MODEL: 'test-grok-model'
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

const cases = [
  ['openai', 'https://api.openai.com/v1/responses',
    { output_text: 'OpenAI answer' }, 'OpenAI answer'],
  ['claude', 'https://api.anthropic.com/v1/messages',
    { content: [{ type: 'text', text: 'Claude answer' }] }, 'Claude answer'],
  ['gemini', 'https://generativelanguage.googleapis.com/v1beta/interactions',
    { steps: [{ type: 'model_output', content: [{ type: 'text', text: 'Gemini answer' }] }] }, 'Gemini answer'],
  ['grok', 'https://api.x.ai/v1/responses',
    { output_text: 'Grok answer' }, 'Grok answer']
];

for (const [providerId, expectedUrl, payload, expectedAnswer] of cases) {
  test(`${providerId} adapter sends only to its fixed endpoint and normalizes the answer`, async () => {
    let calledUrl;
    let calledOptions;
    const result = await invokeAiProvider(providerId, 'Test prompt', configuredEnv, {
      fetchImpl: async (url, options) => {
        calledUrl = url;
        calledOptions = options;
        return jsonResponse(payload);
      }
    });

    assert.equal(calledUrl, expectedUrl);
    assert.equal(calledOptions.method, 'POST');
    assert.equal(JSON.parse(calledOptions.body).model, configuredEnv[
      providerId === 'openai' ? 'OPENAI_MODEL'
        : providerId === 'claude' ? 'ANTHROPIC_MODEL'
          : providerId === 'gemini' ? 'GEMINI_MODEL' : 'XAI_MODEL'
    ]);
    if (['openai', 'gemini', 'grok'].includes(providerId)) assert.equal(JSON.parse(calledOptions.body).store, false);
    assert.equal(result.ok, true);
    assert.equal(result.provider, providerId);
    assert.equal(result.answer, expectedAnswer);
    assert.equal(typeof result.request_id, 'string');
  });
}

test('provider invocation is disabled by default and does not call fetch', async () => {
  let called = false;
  const result = await invokeAiProvider('openai', 'Test prompt', {}, {
    fetchImpl: async () => { called = true; return jsonResponse({ output_text: 'unexpected' }); }
  });
  assert.equal(result.code, 'AI_PROVIDER_DISABLED');
  assert.equal(called, false);
});

test('provider key and model are required only after explicit enablement', async () => {
  const result = await invokeAiProvider('claude', 'Test prompt', {
    LLG_AI_ENABLED: 'true',
    LLG_AI_PROVIDER_CLAUDE_ENABLED: 'true'
  });
  assert.equal(result.code, 'AI_PROVIDER_NOT_CONFIGURED');
});

test('unsupported providers and invalid prompts fail before network access', async () => {
  assert.equal((await invokeAiProvider('unknown', 'hello', configuredEnv)).status, 400);
  assert.equal((await invokeAiProvider('openai', ' ', configuredEnv)).code, 'AI_REQUEST_INVALID');
  assert.equal((await invokeAiProvider('openai', 'x'.repeat(2001), configuredEnv)).status, 400);
});

test('provider errors are normalized without exposing upstream response content', async () => {
  const result = await invokeAiProvider('openai', 'Test prompt', configuredEnv, {
    fetchImpl: async () => jsonResponse({ error: { message: 'private upstream detail' } }, 401)
  });
  assert.deepEqual(result, { ok: false, status: 502, code: 'AI_PROVIDER_UPSTREAM_ERROR' });
});

test('comparison sends one identical prompt to each explicitly selected provider', async () => {
  const received = [];
  const result = await compareAiProviders(['openai', 'claude'], 'Compare this', configuredEnv, {
    fetchImpl: async (url, options) => {
      received.push({ url, body: JSON.parse(options.body) });
      return url.includes('anthropic')
        ? jsonResponse({ content: [{ type: 'text', text: 'Claude' }] })
        : jsonResponse({ output_text: 'OpenAI' });
    }
  });

  assert.equal(result.ok, true);
  assert.equal(result.results.length, 2);
  assert.equal(received.length, 2);
  assert.equal(received[0].body.input[0].content[0].text, 'Compare this');
  assert.equal(received[1].body.messages[0].content, 'Compare this');
});

test('comparison rejects duplicate or oversized provider selections', async () => {
  const duplicate = await compareAiProviders(['openai', 'openai'], 'hello', configuredEnv);
  const tooMany = await compareAiProviders(['openai', 'claude', 'gemini', 'grok', 'openai'], 'hello', configuredEnv);
  assert.equal(duplicate.code, 'AI_COMPARISON_SELECTION_INVALID');
  assert.equal(tooMany.code, 'AI_COMPARISON_SELECTION_INVALID');
});
