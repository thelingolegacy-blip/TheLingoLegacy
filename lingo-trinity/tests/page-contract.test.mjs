import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const html=await readFile(new URL("../index.html",import.meta.url),"utf8");
const hub=await readFile(new URL("../js/hub.js",import.meta.url),"utf8");

test("all JavaScript DOM targets exist in the Trinity page",()=>{
  const targets=[...hub.matchAll(/el\("([A-Za-z][A-Za-z0-9_-]*)"\)/g)].map(match=>match[1]);
  const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]));
  assert.ok(targets.length>0,"expected DOM targets");
  assert.deepEqual([...new Set(targets)].filter(id=>!ids.has(id)),[]);
});

test("hub is a standalone responsive static page with local modules",()=>{
  assert.match(html,/<meta name="viewport"/);
  assert.match(html,/<script type="module" src="\.\/js\/hub\.js"><\/script>/);
  assert.match(html,/<link rel="stylesheet" href="\.\/styles\.css">/);
  assert.match(html,/<main>/);
  assert.match(html,/<section id="play"/);
  assert.match(html,/<section id="worlds"/);
  assert.match(html,/<section id="apparel"/);
});

test("page does not load remote scripts, stylesheets, or images",()=>{
  const external=[...html.matchAll(/\b(?:src|href)="(https?:\/\/[^"]+)"/g)].map(match=>match[1]);
  assert.deepEqual(external,[]);
  assert.doesNotMatch(html,/<script\b(?![^>]*type="module")[^>]*>/i);
});

test("demo copy discloses non-redeemable credits and browse-only apparel",()=>{
  assert.match(html,/cannot be redeemed, cashed out, or wagered for real money/i);
  assert.match(html,/Pricing, inventory, orders, and fulfillment are not connected/i);
  assert.match(html,/No checkout or order submission/i);
});
