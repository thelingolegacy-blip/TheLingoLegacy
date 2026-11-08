import assert from 'node:assert/strict';
import test from 'node:test';
import { generateGrid5x3, evaluateFivePaylines, SLOT_5X3_PAYLINES } from '../../src/server/slot-engine-5x3.mjs';

const paytable = {
  LION: { 3: 2, 4: 5, 5: 10 },
  CROWN: { 3: 3, 4: 6, 5: 12 },
  WILD: { 3: 4, 4: 8, 5: 16 },
};
const blankGrid = () => Array.from({ length: 5 }, () => ['A', 'B', 'C']);

test('5x3 generator returns five columns with three visible symbols each', () => {
  const grid = generateGrid5x3({
    weightedSymbols: [{ symbol: 'LION', weight: 2 }, { symbol: 'CROWN', weight: 1 }],
    readUint32: () => 0,
  });
  assert.equal(grid.length, 5);
  assert.ok(grid.every((column) => column.length === 3 && column.every((s) => s === 'LION')));
});

test('weighted generator respects the configured cumulative symbol ranges', () => {
  const draws = [0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0];
  const grid = generateGrid5x3({
    weightedSymbols: [{ symbol: 'LION', weight: 2 }, { symbol: 'CROWN', weight: 1 }],
    readUint32: () => draws.shift(),
  });
  assert.deepEqual(grid.flat(), ['LION', 'CROWN', 'LION', 'CROWN', 'LION', 'CROWN', 'LION', 'CROWN', 'LION', 'CROWN', 'LION', 'CROWN', 'LION', 'CROWN', 'LION']);
});

test('generator rejects duplicate, invalid, and excessive symbol weights', () => {
  assert.throws(() => generateGrid5x3({ weightedSymbols: [], readUint32: () => 0 }), TypeError);
  assert.throws(() => generateGrid5x3({ weightedSymbols: [{ symbol: 'LION', weight: 1 }, { symbol: 'LION', weight: 2 }], readUint32: () => 0 }), TypeError);
  assert.throws(() => generateGrid5x3({ weightedSymbols: [{ symbol: 'LION', weight: 0x1_0000_0000 }], readUint32: () => 0 }), RangeError);
});

test('five canonical paylines are defined and isolated', () => {
  assert.equal(SLOT_5X3_PAYLINES.length, 5);
  assert.deepEqual(SLOT_5X3_PAYLINES, [
    [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [2, 2, 2, 2, 2], [0, 1, 2, 1, 0], [2, 1, 0, 1, 2],
  ]);
  for (let index = 0; index < SLOT_5X3_PAYLINES.length; index += 1) {
    const grid = blankGrid();
    const line = SLOT_5X3_PAYLINES[index];
    for (let reel = 0; reel < 5; reel += 1) grid[reel][line[reel]] = 'LION';
    const result = evaluateFivePaylines({ grid, lineBetUnits: 10, paytable });
    assert.equal(result.paylines[index].payoutUnits, 100);
    assert.equal(result.paylines.filter((entry) => entry.payoutUnits > 0).length, 1);
  }
});

test('WILD substitutes for a symbol on 3, 4, and 5 consecutive matches', () => {
  for (const matchCount of [3, 4, 5]) {
    const grid = blankGrid();
    for (let reel = 0; reel < matchCount; reel += 1) grid[reel][1] = reel === 1 ? 'WILD' : 'LION';
    const result = evaluateFivePaylines({
      grid, lineBetUnits: 10, paytable,
      paylines: [[1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [2, 2, 2, 2, 2], [0, 1, 2, 1, 0], [2, 1, 0, 1, 2]],
    });
    assert.equal(result.paylines[0].matchCount, matchCount);
    assert.equal(result.paylines[0].payoutUnits, 10 * paytable.LION[matchCount]);
  }
});

test('WILD can lead a line and substitute for the following symbol', () => {
  const grid = blankGrid();
  grid[0][1] = 'WILD';
  grid[1][1] = 'LION';
  grid[2][1] = 'LION';
  const result = evaluateFivePaylines({ grid, lineBetUnits: 5, paytable });
  assert.equal(result.paylines[0].matchCount, 3);
  assert.equal(result.paylines[0].payoutUnits, 10);
});

test('payout math uses line bet times match multiplier and five line wagers', () => {
  const grid = blankGrid();
  for (let reel = 0; reel < 5; reel += 1) grid[reel][1] = 'LION';
  const result = evaluateFivePaylines({ grid, lineBetUnits: 7, paytable });
  assert.equal(result.totalWagerUnits, 35);
  assert.equal(result.totalPayoutUnits, 70);
  assert.equal(result.netDeltaUnits, 35);
});

test('evaluation rejects malformed grids, paytables, and unsafe values', () => {
  assert.throws(() => evaluateFivePaylines({ grid: [], lineBetUnits: 1, paytable }), TypeError);
  assert.throws(() => evaluateFivePaylines({ grid: blankGrid(), lineBetUnits: 0, paytable }), RangeError);
  assert.throws(() => evaluateFivePaylines({ grid: blankGrid(), lineBetUnits: 1, paytable: { LION: { 3: 1.5 } } }), TypeError);
});
