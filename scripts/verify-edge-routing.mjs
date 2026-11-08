#!/usr/bin/env node
/**
 * Fail-closed edge routing verifier.
 *
 * Default mode is offline/static and never sends network requests.
 * Pass --live to issue read-only synthetic GET requests to the canonical
 * production host. No cookies, authorization headers, request bodies, or
 * customer traffic are forwarded or mirrored.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(root, 'wrangler.jsonc');
const workerPath = path.join(root, 'worker.js');
const configText = fs.readFileSync(configPath, 'utf8');
// wrangler.jsonc is maintained as strict JSON today. Fail rather than silently
// stripping comments or accepting ambiguous config during a production review.
const config = JSON.parse(configText);
const worker = fs.readFileSync(workerPath, 'utf8');
const failures = [];
const pass = (label) => console.log(`PASS ${label}`);
const fail = (label) => failures.push(label);

if (config.name === 'thelingolegacy') pass('Wrangler deployment target matches the canonical apex/www Worker');
else fail(`Wrangler name must be "thelingolegacy"; found ${JSON.stringify(config.name)}`);

const expected = ['thelingolegacy.com/*', 'www.thelingolegacy.com/*'];
const actual = (config.routes || []).map((route) => route.pattern);
if (JSON.stringify(actual) === JSON.stringify(expected)) pass('Only canonical apex and www routes are declared by this flagship config');
else fail(`Expected route patterns ${JSON.stringify(expected)}; found ${JSON.stringify(actual)}`);

if ((config.routes || []).every((route) => route.zone_name === 'thelingolegacy.com')) pass('Both routes are scoped to thelingolegacy.com zone');
else fail('Every route must be scoped to thelingolegacy.com zone');

if (config.vars?.CANONICAL_DOMAIN === 'thelingolegacy.com' && config.vars?.PUBLIC_SITE_URL === 'https://thelingolegacy.com') pass('Canonical origin variables agree');
else fail('CANONICAL_DOMAIN and PUBLIC_SITE_URL must agree on the apex hostname');

for (const [label, pattern] of [
  ['www canonical redirect handler', /url\.hostname\s*===\s*`www\.\$\{String\(env\.CANONICAL_DOMAIN/],
  ['health endpoint handler', /url\.pathname\s*===\s*'\/healthz'/],
  ['runtime endpoint handler', /url\.pathname\s*===\s*'\/api\/v1\/runtime'/],
  ['gate endpoint handler', /url\.pathname\s*===\s*'\/api\/v1\/platform\/gates'/],
  ['fail-closed release gate marker', /G02_RUNNER:\s*'FAIL \/ UNVERIFIED'/],
]) {
  if (pattern.test(worker)) pass(label);
  else fail(`Missing expected Worker contract: ${label}`);
}

if (process.argv.includes('--live')) {
  const origin = (process.env.LINGO_CANONICAL_ORIGIN || 'https://thelingolegacy.com').replace(/\/$/, '');
  const base = new URL(origin);
  if (base.protocol !== 'https:' || base.hostname !== 'thelingolegacy.com') {
    fail('Live probes require HTTPS origin https://thelingolegacy.com (or an explicitly equivalent canonical URL)');
  } else {
    const get = async (url, redirect = 'manual') => {
      const response = await fetch(url, {
        method: 'GET',
        redirect,
        headers: { 'accept': 'application/json, text/html;q=0.9, */*;q=0.8', 'user-agent': 'LINGO-Edge-ReadOnly-Probe/1.0' },
        signal: AbortSignal.timeout(10000),
      });
      return response;
    };
    for (const [label, url, expectedStatus] of [
      ['apex homepage', `${origin}/`, 200],
      ['health endpoint', `${origin}/healthz`, 200],
      ['runtime endpoint', `${origin}/api/v1/runtime`, 200],
      ['release gates endpoint', `${origin}/api/v1/platform/gates`, 200],
    ]) {
      try {
        const response = await get(url);
        if (response.status === expectedStatus) pass(`live ${label}: HTTP ${response.status}`);
        else fail(`live ${label}: expected HTTP ${expectedStatus}, got ${response.status}`);
        if (label === 'health endpoint' && response.status === 200 && (await response.text()).trim() !== 'ok') fail('live health endpoint body is not "ok"');
        if (label === 'runtime endpoint' && response.status === 200) {
          const body = await response.json();
          if (body.dynamic === true && body.runtime === 'cloudflare-worker') pass('live runtime manifest reports dynamic Cloudflare Worker');
          else fail('live runtime manifest does not satisfy dynamic Worker contract');
        }
        if (label === 'release gates endpoint' && response.status === 200) {
          const body = await response.json();
          if (body.fail_closed === true && body.mutation_freeze === true && body.lkg === 'PROTECTED') pass('live release gates confirm fail-closed hold and LKG protection');
          else fail('live release gates do not confirm expected protected hold');
        }
      } catch (error) {
        fail(`live ${label}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    try {
      const response = await get('https://www.thelingolegacy.com/','manual');
      const location = response.headers.get('location');
      if ([301, 308].includes(response.status) && location) {
        const target = new URL(location, 'https://www.thelingolegacy.com/');
        if (target.hostname === 'thelingolegacy.com' && target.protocol === 'https:') pass(`live www redirect: HTTP ${response.status} to canonical apex`);
        else fail(`live www redirect points to unexpected destination: ${location}`);
      } else {
        fail(`live www redirect: expected HTTP 301/308 with Location, got HTTP ${response.status}`);
      }
    } catch (error) {
      fail(`live www redirect: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.error(`EDGE_ROUTING_VERIFICATION=FAIL failures=${failures.length}`);
  process.exitCode = 1;
} else {
  console.log('EDGE_ROUTING_VERIFICATION=PASS');
}
