import { secureRandomInt, PAYLINES as SLOT_5X3_PAYLINES } from './slot-engine.mjs';

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

/**
 * Returns five reel columns, each containing three visible symbols.
 * Weighted entries and the random source are server-owned inputs.
 */
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

export function evaluatePaylines5x3({ grid, lineBetUnits, paytable, activePaylines = SLOT_5X3_PAYLINES.length }) {
  validateGrid(grid);
  validatePaytable(paytable);
  if (!Number.isSafeInteger(lineBetUnits) || lineBetUnits < 1) {
    throw new RangeError('lineBetUnits must be a positive safe integer');
  }
  if (!Number.isSafeInteger(activePaylines) || activePaylines < 1 || activePaylines > SLOT_5X3_PAYLINES.length) {
    throw new RangeError('activePaylines must be an integer from 1 through 20');
  }

  const results = SLOT_5X3_PAYLINES.slice(0, activePaylines).map((line, lineIndex) => {
    let best = { lineIndex, symbol: null, matchCount: 0, multiplier: 0, payoutUnits: 0 };
    for (const [symbol, tiers] of Object.entries(paytable)) {
      let matchCount = 0;
      for (let reel = 0; reel < 5; reel += 1) {
        const actual = grid[reel][line[reel]];
        if (actual === symbol || (symbol !== WILD && actual === WILD)) matchCount += 1;
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

  const totalWagerUnits = lineBetUnits * activePaylines;
  const totalPayoutUnits = results.reduce((sum, result) => sum + result.payoutUnits, 0);
  if (!Number.isSafeInteger(totalWagerUnits) || !Number.isSafeInteger(totalPayoutUnits)) {
    throw new RangeError('spin totals exceed safe integer range');
  }
  return Object.freeze({
    paylines: results,
    lineWagerUnits: lineBetUnits,
    activePaylines,
    totalWagerUnits,
    totalPayoutUnits,
    netDeltaUnits: totalPayoutUnits - totalWagerUnits,
  });
}
