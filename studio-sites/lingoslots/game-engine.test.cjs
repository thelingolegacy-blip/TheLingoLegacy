'use strict';
const assert = require('node:assert/strict');
const engine = require('./game-engine.js');
assert.equal(engine.paylinesFor(3).length, 20);
assert.equal(engine.paylinesFor(5).length, 25);
for (const rows of [3, 5]) {
  for (const line of engine.paylinesFor(rows)) {
    assert.equal(line.length, 5);
    assert.ok(line.every(row => Number.isInteger(row) && row >= 0 && row < rows));
  }
  const grid = engine.spin(rows, () => 0);
  assert.equal(grid.length, rows);
  assert.ok(grid.every(row => row.length === 5 && row.every(symbol => symbol === engine.SYMBOLS[0])));
  const result = engine.evaluate(grid, rows, 2);
  assert.equal(result.paylines, rows === 3 ? 20 : 25);
  assert.equal(result.totalBet, (rows === 3 ? 20 : 25) * 2);
  assert.equal(result.wins.length, rows === 3 ? 20 : 25);
  assert.ok(result.wins.every(win => win.count === 5 && win.payout === 16));
}
const mixed = Array.from({ length: 3 }, () => ['💎','👑','🎤','💜','🪙']);
assert.equal(engine.evaluate(mixed, 3, 1).totalWin, 0);
assert.throws(() => engine.paylinesFor(4), RangeError);
assert.throws(() => engine.evaluate([[1,2,3,4,5]], 3, 1), TypeError);
assert.throws(() => engine.evaluate(engine.spin(3, () => 0), 3, 0), RangeError);
console.log('LINGOSLOTS_ENGINE_TESTS=PASS');
console.log('LAYOUTS=5x3:20 paylines; 5x5:25 paylines');
