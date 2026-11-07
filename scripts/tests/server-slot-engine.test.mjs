import assert from 'node:assert/strict';
import test from 'node:test';
import { secureRandomInt, evaluateThreeReelSpin, validateIdempotencyKey } from '../../src/server/slot-engine.mjs';

test('secureRandomInt rejects the biased tail before modulo reduction', () => {
  const values = [0xffff_ffff, 7];
  const result = secureRandomInt(10, () => values.shift());
  assert.equal(result, 7);
  assert.equal(values.length, 0);
});

test('secureRandomInt returns values in the requested range', () => {
  let value = 123456;
  for (let i = 0; i < 100; i += 1) {
    const result = secureRandomInt(7, () => (value++ >>> 0));
    assert.ok(result >= 0 && result < 7);
  }
});

test('secureRandomInt rejects invalid bounds and invalid random sources', () => {
  assert.throws(() => secureRandomInt(0), RangeError);
  assert.throws(() => secureRandomInt(3, () => -1), TypeError);
  assert.throws(() => secureRandomInt(3, () => 0x1_0000_0000), TypeError);
});

test('three-reel evaluation produces integer payout units and a net delta', () => {
  const draws = [0, 0, 0];
  const result = evaluateThreeReelSpin({
    symbols: ['LION', 'CROWN'],
    paytable: { LION: 12, CROWN: 4 },
    wagerUnits: 25,
    readUint32: () => draws.shift(),
  });
  assert.deepEqual(result.reels, ['LION', 'LION', 'LION']);
  assert.equal(result.payoutUnits, 300);
  assert.equal(result.netDeltaUnits, 275);
  assert.equal(result.isWin, true);
});

test('three-reel evaluation rejects floating point wager or multiplier', () => {
  assert.throws(() => evaluateThreeReelSpin({ symbols: ['A'], paytable: { A: 2 }, wagerUnits: 1.5 }), RangeError);
  assert.throws(() => evaluateThreeReelSpin({ symbols: ['A'], paytable: { A: 1.5 }, wagerUnits: 10 }), TypeError);
});

test('idempotency keys are bounded and constrained', () => {
  assert.equal(validateIdempotencyKey('spin-2026-11-07-00000001'), true);
  assert.equal(validateIdempotencyKey('short'), false);
  assert.equal(validateIdempotencyKey('contains spaces 123456'), false);
});
