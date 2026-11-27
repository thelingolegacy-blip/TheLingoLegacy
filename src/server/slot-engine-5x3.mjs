import { secureRandomInt } from './slot-engine.mjs';

export const SLOT_5X3_PAYLINES = Object.freeze([
  Object.freeze([1,1,1,1,1]), Object.freeze([0,0,0,0,0]), Object.freeze([2,2,2,2,2]),
  Object.freeze([0,1,2,1,0]), Object.freeze([2,1,0,1,2]), Object.freeze([0,0,1,2,2]),
  Object.freeze([2,2,1,0,0]), Object.freeze([1,0,0,0,1]), Object.freeze([1,2,2,2,1]),
  Object.freeze([0,1,1,1,0]), Object.freeze([2,1,1,1,2]), Object.freeze([1,0,1,2,1]),
  Object.freeze([1,2,1,0,1]), Object.freeze([0,0,1,1,2]), Object.freeze([2,2,1,1,0]),
  Object.freeze([0,1,0,1,0]), Object.freeze([2,1,2,1,2]), Object.freeze([1,0,1,0,1]),
  Object.freeze([1,2,1,2,1]), Object.freeze([0,1,2,2,1]),
]);

const WILD = 'WILD';

function validateWeightedSymbols(weightedSymbols) {
  if (!Array.isArray(weightedSymbols) || weightedSymbols.length < 1 || weightedSymbols.length > 256) {
    throw new TypeError('weightedSymbols must contain 1 to 256 entries');
  }
  const seen = new Set();
  let totalWeight = 0;
  for (const entry of weightedSymbols) {
    if (!entry || typeof entry.symbol !== 'string' || !/^[A-Z0-9_]{1,48}$/.test(entry.symbol)
      || !Number.isSafeInteger(entry.weight) || entry.weight < 1 || seen.has(entry.symbol)) {
      throw new TypeError('each weighted symbol needs a unique identifier and positive integer weight');
    }
    seen.add(entry.symbol);
    totalWeight += entry.weight;
    if (!Number.isSafeInteger(totalWeight) || totalWeight > 0xffff_ffff) {
      throw new RangeError('combined symbol weight exceeds the secure random range');
    }
  }
  return totalWeight;
}

/** Server-owned weighted RNG: five reels, three visible rows per reel. */
export function generateGrid5x3({ weightedSymbols, readUint32 }) {
  const totalWeight = validateWeightedSymbols(weightedSymbols);
  const draw = () => {
    let target = secureRandomInt(totalWeight, readUint32);
    for (const entry of weightedSymbols) {
      if (target < entry.weight) return entry.symbol;
      target -= entry.weight;
    }
    throw new Error('WEIGHTED_SYMBOL_SELECTION_FAILED');
  };
  return Array.from({ length: 5 }, () => Array.from({ length: 3 }, draw));
}

function validateGrid(grid) {
  if (!Array.isArray(grid) || grid.length !== 5
    || grid.some((column) => !Array.isArray(column) || column.length !== 3
      || column.some((symbol) => typeof symbol !== 'string' || symbol.length === 0))) {
    throw new TypeError('grid must be five reel columns with three symbol positions each');
  }
}

function validatePaytable(paytable) {
  if (!paytable || typeof paytable !== 'object' || Array.isArray(paytable)) {
    throw new TypeError('paytable must map symbols to 3/4/5-match integer multipliers');
  }
  for (const [symbol, tiers] of Object.entries(paytable)) {
    if (!symbol || !tiers || typeof tiers !== 'object' || Array.isArray(tiers)) {
      throw new TypeError('invalid paytable entry');
    }
    for (const count of [3, 4, 5]) {
      if (tiers[count] !== undefined && (!Number.isSafeInteger(tiers[count]) || tiers[count] < 0)) {
        throw new TypeError('paytable multipliers must be non-negative safe integers');
      }
    }
  }
}

export function calculateLineStakeAllocation(wagerUnits, activePaylines = 20) {
  if (!Number.isSafeInteger(wagerUnits) || wagerUnits < 1) {
    throw new RangeError('wagerUnits must be a positive safe integer');
  }
  if (!Number.isSafeInteger(activePaylines) || activePaylines < 1 || activePaylines > SLOT_5X3_PAYLINES.length) {
    throw new RangeError('activePaylines must be an integer from 1 to 20');
  }
  const lineBetUnits = Math.floor(wagerUnits / activePaylines);
  const remainderUnits = wagerUnits % activePaylines;
  if (remainderUnits !== 0) {
    throw new RangeError(`wagerUnits must divide evenly across active paylines; remainderUnits=${remainderUnits}`);
  }
  if (!Number.isSafeInteger(lineBetUnits) || lineBetUnits < 1) {
    throw new RangeError('lineBetUnits must be a positive safe integer');
  }
  return Object.freeze({ wagerUnits, activePaylines, lineBetUnits, remainderUnits });
}

export function evaluateFivePaylines({ grid, lineBetUnits, paytable, paylines = SLOT_5X3_PAYLINES }) {
  validateGrid(grid);
  validatePaytable(paytable);
  if (!Number.isSafeInteger(lineBetUnits) || lineBetUnits < 1) {
    throw new RangeError('lineBetUnits must be a positive safe integer');
  }
  if (!Array.isArray(paylines) || paylines.length < 1 || paylines.length > SLOT_5X3_PAYLINES.length
    || paylines.some((line) => !Array.isArray(line) || line.length !== 5
      || line.some((row) => !Number.isInteger(row) || row < 0 || row > 2))) {
    throw new TypeError('one to twenty valid five-reel paylines are required');
  }

  const results = paylines.map((line, lineIndex) => {
    let best = { lineIndex, symbol: null, matchCount: 0, multiplier: 0, payoutUnits: 0 };
    const lineValues = line.map((row, reel) => grid[reel][row]);
    if (lineValues.every((value) => value === WILD)) return Object.freeze(best);
    for (const [symbol, tiers] of Object.entries(paytable)) {
      if (symbol === WILD) continue;
      let matchCount = 0;
      for (let reel = 0; reel < 5; reel += 1) {
        const actual = lineValues[reel];
        if (actual === symbol || actual === WILD) matchCount += 1;
        else break;
      }
      const multiplier = matchCount >= 3 ? (tiers[matchCount] ?? 0) : 0;
      const payoutUnits = lineBetUnits * multiplier;
      if (!Number.isSafeInteger(payoutUnits)) throw new RangeError('line payout exceeds safe integer range');
      if (payoutUnits > best.payoutUnits || (payoutUnits === best.payoutUnits && matchCount > best.matchCount)) {
        best = { lineIndex, symbol: payoutUnits > 0 ? symbol : null, matchCount, multiplier, payoutUnits };
      }
    }
    return Object.freeze(best);
  });

  const totalWagerUnits = lineBetUnits * paylines.length;
  const totalPayoutUnits = results.reduce((sum, result) => sum + result.payoutUnits, 0);
  if (!Number.isSafeInteger(totalWagerUnits) || !Number.isSafeInteger(totalPayoutUnits)) {
    throw new RangeError('spin totals exceed safe integer range');
  }
  return Object.freeze({
    paylines: results,
    lineBetUnits,
    totalWagerUnits,
    totalPayoutUnits,
    netDeltaUnits: totalPayoutUnits - totalWagerUnits,
  });
}

/** Complete server-side Option 2 spin: wagerUnits is the total stake across active paylines. */
export function evaluateSpin5x3({ weightedSymbols, paytable, wagerUnits, activePaylines = 20, readUint32 }) {
  const allocation = calculateLineStakeAllocation(wagerUnits, activePaylines);
  const grid = generateGrid5x3({ weightedSymbols, readUint32 });
  const evaluation = evaluateFivePaylines({
    grid,
    lineBetUnits: allocation.lineBetUnits,
    paytable,
    paylines: SLOT_5X3_PAYLINES.slice(0, activePaylines),
  });
  if (evaluation.totalWagerUnits !== wagerUnits) throw new Error('SPIN_STAKE_ALLOCATION_MISMATCH');
  return Object.freeze({ grid, ...allocation, ...evaluation });
}
