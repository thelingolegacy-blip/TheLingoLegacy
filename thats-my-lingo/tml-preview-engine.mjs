export const PAYLINES = Object.freeze([
  Object.freeze([1,1,1,1,1]), Object.freeze([0,0,0,0,0]), Object.freeze([2,2,2,2,2]),
  Object.freeze([0,1,2,1,0]), Object.freeze([2,1,0,1,2]), Object.freeze([0,0,1,2,2]),
  Object.freeze([2,2,1,0,0]), Object.freeze([1,0,0,0,1]), Object.freeze([1,2,2,2,1]),
  Object.freeze([0,1,1,1,0]), Object.freeze([2,1,1,1,2]), Object.freeze([1,0,1,2,1]),
  Object.freeze([1,2,1,0,1]), Object.freeze([0,0,1,1,2]), Object.freeze([2,2,1,1,0]),
  Object.freeze([0,1,0,1,0]), Object.freeze([2,1,2,1,2]), Object.freeze([1,0,1,0,1]),
  Object.freeze([1,2,1,2,1]), Object.freeze([0,1,2,2,1])
]);

export function calculateLineStakeAllocation(wagerUnits, activePaylines = 20) {
  if (!Number.isSafeInteger(wagerUnits) || wagerUnits <= 0) throw new RangeError('wagerUnits must be a positive safe integer');
  if (!Number.isSafeInteger(activePaylines) || activePaylines !== PAYLINES.length) throw new RangeError('activePaylines must equal 20 for the approved Option 2 contract');
  const lineStakeUnits = Math.floor(wagerUnits / activePaylines);
  const remainderUnits = wagerUnits % activePaylines;
  if (remainderUnits !== 0) throw new RangeError('wagerUnits must divide evenly across active paylines; remainderUnits=' + remainderUnits);
  if (!Number.isSafeInteger(lineStakeUnits) || lineStakeUnits <= 0) throw new RangeError('lineStakeUnits must be a positive safe integer');
  return Object.freeze({ wagerUnits, activePaylines, lineStakeUnits, remainderUnits });
}

export function generateGrid({ symbols, rows = 3, reels = 5, random = Math.random } = {}) {
  if (!Array.isArray(symbols) || symbols.length === 0) throw new TypeError('symbols are required');
  if (!Number.isSafeInteger(rows) || rows !== 3 || !Number.isSafeInteger(reels) || reels !== 5) throw new RangeError('preview grid must be 3 rows by 5 reels');
  if (typeof random !== 'function') throw new TypeError('random must be a function');
  const totalWeight = symbols.reduce((sum, symbol) => {
    if (!Number.isSafeInteger(symbol.weight) || symbol.weight <= 0) throw new TypeError('symbol weights must be positive safe integers');
    return sum + symbol.weight;
  }, 0);
  if (!Number.isSafeInteger(totalWeight) || totalWeight <= 0) throw new RangeError('total symbol weight is invalid');
  const draw = () => {
    const sample = random();
    if (typeof sample !== 'number' || sample < 0 || sample >= 1) throw new RangeError('random sample must be in [0, 1)');
    let roll = sample * totalWeight;
    for (const symbol of symbols) {
      roll -= symbol.weight;
      if (roll < 0) return symbol.id;
    }
    return symbols[0].id;
  };
  return Array.from({ length: rows }, () => Array.from({ length: reels }, draw));
}

function resolveLine(grid, line, symbols, lineStakeUnits, paylineNumber) {
  const values = line.map((row, col) => grid[row][col]);
  if (values.every(value => value === 'WILD')) return null;
  const candidates = symbols.filter(symbol => !symbol.wild && !symbol.scatter && !symbol.multiplier);
  let best = null;
  for (const candidate of candidates) {
    let count = 0;
    for (const value of values) {
      if (value === candidate.id || value === 'WILD') count++;
      else break;
    }
    if (count < 3) continue;
    const multiplier = candidate.pays?.[count] ?? 0;
    if (!Number.isSafeInteger(multiplier) || multiplier < 0) throw new TypeError('paytable multipliers must be non-negative safe integers');
    if (multiplier > 0 && (!best || count > best.matchLength || (count === best.matchLength && multiplier > best.multiplier))) {
      best = { symbol: candidate.id, matchLength: count, multiplier };
    }
  }
  if (!best) return null;
  const payoutUnits = lineStakeUnits * best.multiplier;
  if (!Number.isSafeInteger(payoutUnits)) throw new RangeError('line payout overflow');
  return {
    payline: paylineNumber,
    ...best,
    payoutUnits,
    cells: line.slice(0, best.matchLength).map((row, col) => row + '-' + col)
  };
}

/** Preview-only Option 2 math. This module is not an authoritative RNG or wallet. */
export function evaluateSpin({ grid, symbols, wagerUnits, activePaylines = 20, featureMultiplier = 1 } = {}) {
  const allocation = calculateLineStakeAllocation(wagerUnits, activePaylines);
  if (!Array.isArray(grid) || grid.length !== 3 || grid.some(row => !Array.isArray(row) || row.length !== 5)) throw new TypeError('grid must be a 3x5 matrix');
  if (!Array.isArray(symbols) || symbols.length === 0) throw new TypeError('symbols are required');
  if (!Number.isSafeInteger(featureMultiplier) || featureMultiplier < 1) throw new RangeError('featureMultiplier must be a positive safe integer');
  const wins = [];
  for (let i = 0; i < allocation.activePaylines; i++) {
    const win = resolveLine(grid, PAYLINES[i], symbols, allocation.lineStakeUnits, i + 1);
    if (win) wins.push(win);
  }
  const basePayoutUnits = wins.reduce((sum, win) => {
    const next = sum + win.payoutUnits;
    if (!Number.isSafeInteger(next)) throw new RangeError('aggregate payout overflow');
    return next;
  }, 0);
  const payoutUnits = basePayoutUnits * featureMultiplier;
  if (!Number.isSafeInteger(payoutUnits)) throw new RangeError('feature-adjusted payout overflow');
  const flat = grid.flat();
  const scatterCount = flat.filter(symbol => symbol === 'SCATTER').length;
  const multiplierRulesPending = flat.includes('MULT');
  const hasMultiplier = false;
  return {
    ...allocation,
    wins,
    winningCells: wins.flatMap(win => win.cells),
    basePayoutUnits,
    featureMultiplier,
    payoutUnits,
    scatterCount,
    scatterAwardUnits: 0,
    scatterRulesPending: scatterCount >= 3,
    multiplierRulesPending,
    hasMultiplier
  };
}
