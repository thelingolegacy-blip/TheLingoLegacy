import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../../thats-my-lingo/index.html', import.meta.url), 'utf8');
const visible = html
  .replace(/<script\\b[\\s\\S]*?<\\/script>/gi, ' ')
  .replace(/<style\\b[\\s\\S]*?<\\/style>/gi, ' ')
  .replace(/<!--[\\s\\S]*?-->/g, ' ')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\\s+/g, ' ');

test('That’s My Lingo public demo uses non-cash presentation', () => {
  assert.doesNotMatch(visible, /[$€£]/);
  assert.match(visible, /Demo Coins/i);
  assert.match(visible, /no cash value/i);
  assert.match(visible, /Total Spin Stake/i);
});

test('That’s My Lingo public demo contains no founder or checkout CTA copy', () => {
  assert.doesNotMatch(visible, /\\bfounder\\b/i);
  assert.doesNotMatch(visible, /\\bcheckout\\b/i);
  assert.doesNotMatch(html, /stripe\\.com|checkout\\.stripe\\.com/i);
});

test('That’s My Lingo has a return path to the flagship and world directory', () => {
  assert.match(html, /href="\\/"[^>]*>Legacy Home</);
  assert.match(html, /href="\\/worlds\\/"[^>]*>Worlds</);
});
