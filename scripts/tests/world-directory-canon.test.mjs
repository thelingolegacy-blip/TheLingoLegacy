import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const pagePath = new URL('../../worlds/index.html', import.meta.url);
const html = fs.readFileSync(fileURLToPath(pagePath), 'utf8');
const realmCards = [...html.matchAll(/<article class="realm-card"[\s\S]*?<h3>(.*?)<\/h3>[\s\S]*?<\/article>/g)];
const realmTitles = realmCards.map(match => match[1]);
const forbiddenRoutes = /href="\/(?:studio|terms|studio-sites|thats-my-lingo|casino|kottons-code|library|loyalty-lane-cycles|studio\/lingo-ai)[^"]*"/;

test('wildcard homepage uses the canonical portfolio and route-safety rules', () => {
  const home = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const cards = [...home.matchAll(/<article class="realm-card"[\s\S]*?<h3>(.*?)<\/h3>[\s\S]*?<\/article>/g)].map(match => match[1]);
  assert.deepEqual(cards, ['LINGOlegacy','LINGOlane','LINGOslots','LINGOarcade','LINGOlibrary','LINGOmedia','LINGOworld','LegacyXclub']);
  assert.doesNotMatch(home, forbiddenRoutes);
  assert.match(home, /href="https:\/\/thelingolegacy\.com\/"/);
  assert.doesNotMatch(home, /href="\/"/);
  assert.match(home, /href="\/contact\/"/);
  assert.match(home, /mailto:hello@thelingolegacy\.com/);
  assert.match(home, /World Builder & Simulation/);
  assert.match(home, /Game Live Operations/);
  assert.match(home, /Workforce & HR\/payroll/);
  assert.match(home, /KottonsCode/);
  assert.match(home, /Apparel storefront: inventory\/privacy review pending/);
  assert.match(home, /Cycle route: not yet verified/);
  assert.match(home, /Privacy · owner review pending/);
  assert.match(home, /Terms availability unverified/);
  assert.match(home, /No live operational, payroll, guest, property or utility records are exposed/);
  assert.match(home, /flagship public-discovery candidate/);
  assert.doesNotMatch(home, /public discovery experience and selected previews are available/);
  assert.doesNotMatch(home, /LINGOarena|LINGOreads|Duolingo|Kotton’s Code/);
});

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
  assert.match(html, /href="https:\/\/thelingolegacy\.com\/"/);
  assert.doesNotMatch(html, /href="\/"/);
  assert.match(html, /href="\/contact\/"/);
  assert.match(html, /Preview · uncertified/);
  assert.doesNotMatch(html, /Live · uncertified/);
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
  assert.equal((section.match(/<article class="architecture-card"/g) || []).length, 8);
  assert.match(html, /organizers promoters managers residential property homes hotels hospitality roads transportation infrastructure street lighting water distribution flow wastewater drainage sewer flow/);
  for (const name of ['Workforce Operations','HR & Payroll','Residential Property','Hotels & Hospitality','Roads & Transportation','Street & Road Lighting','Water Distribution & Flow Monitoring','Wastewater, Drainage & Sewer Flow']) {
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

test('unverified and privacy-sensitive destinations remain gated while Contact stays available', () => {
  assert.doesNotMatch(html, forbiddenRoutes);
  assert.match(html, /href="\/contact\/"/);
  assert.match(html, /Game routes pending public-surface verification/);
  assert.match(html, /Arcade destinations pending route and privacy QA/);
  assert.match(html, /Library destinations pending privacy review/);
  assert.match(html, /Apparel storefront: inventory\/privacy review pending/);
  assert.match(html, /Cycle route: not yet verified/);
  assert.match(html, /Privacy · owner review pending/);
  assert.match(html, /Terms availability unverified/);
});
