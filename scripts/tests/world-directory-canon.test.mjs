import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const pagePath = new URL('../../worlds/index.html', import.meta.url);
const html = fs.readFileSync(fileURLToPath(pagePath), 'utf8');
const realmCards = [...html.matchAll(/<article class="realm-card"[\s\S]*?<h3>(.*?)<\/h3>[\s\S]*?<\/article>/g)];
const realmTitles = realmCards.map(match => match[1]);

test('directory exposes exactly the eight canonical public portfolios', () => {
  assert.deepEqual(realmTitles, [
    'LINGOlegacy',
    'LINGOlane',
    'LINGOslots',
    'LINGOarcade',
    'LINGOlibrary',
    'LINGOmedia',
    'LINGOworld',
    'LegacyXclub',
  ]);
  assert.doesNotMatch(realmTitles.join(' '), /[⭐★✦]/);
  assert.doesNotMatch(html, /LINGOarena|LINGOreads|Duolingo/);
  assert.match(html, /KottonsCode/);
  assert.doesNotMatch(html, /Kotton’s Code/);
});

test('internal services remain out of the public portfolio card list', () => {
  for (const name of ['LINGOstudio','LINGOcore','LINGOidentity','LINGOwallet','LINGOshield','LINGOcampus']) {
    assert.ok(!realmTitles.includes(name), name + ' must not be a peer public portfolio');
  }
  assert.match(html, /LINGOtravel · LINGOcampus/);
  assert.match(html, /LINGOshield · LINGOlounge · LINGOdonations/);
});

test('LINGOworld operations domains are separately presented', () => {
  const section = html.match(/<section class="section" id="world-operations">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(section, 'missing LINGOworld operations section');
  assert.equal((section.match(/<article class="architecture-card"/g) || []).length, 7);
  for (const name of ['Workforce Operations','HR & Payroll','Residential Property','Hotels & Hospitality','Roads & Transportation','Street & Road Lighting','Water & Wastewater']) {
    assert.match(section, new RegExp(name));
  }
  assert.match(section, /tenant and jurisdiction boundaries/);
  assert.match(section, /No live payroll, property, guest, road, lighting or utility records are exposed/);
});

test('world-engine and live-operations capabilities are listed as shared systems', () => {
  const section = html.match(/<section class="section" id="engines">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(section, 'missing shared engine section');
  assert.match(section, /World Builder & Simulation/);
  assert.match(section, /Game Live Operations/);
});

test('unsafe or unverified destination links remain disabled', () => {
  assert.doesNotMatch(html, /href="\/(?:studio-sites|thats-my-lingo|kottons-code|library|loyalty-lane-cycles|studio\/lingo-ai)[^"]*"/);
  assert.match(html, /Game routes pending public-surface verification/);
  assert.match(html, /Arcade destinations pending route and privacy QA/);
  assert.match(html, /Library destinations pending privacy review/);
  assert.match(html, /mailto:hello@thelingolegacy\.com/);
  assert.match(html, /Privacy · refresh pending/);
  assert.match(html, /Terms publication pending/);
});
