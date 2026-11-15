import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../llg-tech-corps/index.html', import.meta.url), 'utf8');

test('command center exposes the four LLG AI workspaces', () => {
  for (const mode of ['chat', 'compare', 'agents', 'developer']) {
    assert.match(html, new RegExp(`data-tab="${mode}"`));
    assert.match(html, new RegExp(`data-panel="${mode}"`));
  }
});

test('prototype clearly discloses that providers are not connected', () => {
  assert.match(html, /PROTOTYPE · PROVIDERS OFF/);
  assert.match(html, /Not connected to live AI/);
  assert.match(html, /No prompt is sent/);
});

test('provider execution controls remain disabled', () => {
  assert.match(html, /Send to provider — unavailable<\/button>/);
  assert.match(html, /Run comparison — unavailable<\/button>/);
  assert.match(html, /disabled/);
});

test('prototype has no outbound provider calls or live endpoint URLs', () => {
  assert.doesNotMatch(html, /\bfetch\s*\(/);
  assert.doesNotMatch(html, /https:\/\/(?:api\.openai\.com|api\.anthropic\.com|generativelanguage\.googleapis\.com|api\.x\.ai)/i);
  assert.doesNotMatch(html, /XMLHttpRequest|WebSocket|EventSource/);
});

test('prototype does not persist prompts or user data in browser storage', () => {
  assert.doesNotMatch(html, /localStorage|sessionStorage|indexedDB|document\.cookie/);
});

test('local previews render user-provided values as text, not HTML', () => {
  assert.match(html, /pre\.textContent\s*=\s*JSON\.stringify/);
  assert.doesNotMatch(html, /\.innerHTML\s*=/);
});

test('prototype contains no provider credentials or secret-like literals', () => {
  assert.doesNotMatch(html, /sk-[A-Za-z0-9]{16,}|AIza[0-9A-Za-z_-]{20,}|xai-[A-Za-z0-9_-]{16,}/);
});
