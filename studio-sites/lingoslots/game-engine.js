(function (root) {
  'use strict';
  const SYMBOLS = Object.freeze(['💎', '👑', '🎤', '💜', '🪙', '🔥', '🎲', '🦁']);
  const PAYLINES = Object.freeze({
    3: Object.freeze([
      [0,0,0,0,0],[1,1,1,1,1],[2,2,2,2,2],
      [0,1,2,1,0],[2,1,0,1,2],[0,0,1,2,2],[2,2,1,0,0],
      [0,1,1,1,0],[2,1,1,1,2],[1,0,0,0,1],[1,2,2,2,1],
      [0,1,0,1,0],[2,1,2,1,2],[1,0,1,0,1],[1,2,1,2,1],
      [0,0,0,1,2],[2,2,2,1,0],[0,1,2,2,1],[2,1,0,0,1],[1,0,1,2,1]
    ]),
    5: Object.freeze([
      [0,0,0,0,0],[1,1,1,1,1],[2,2,2,2,2],[3,3,3,3,3],[4,4,4,4,4],
      [0,1,2,3,4],[4,3,2,1,0],[0,0,1,2,2],[4,4,3,2,2],[1,0,1,2,3],
      [3,4,3,2,1],[0,1,1,1,0],[4,3,3,3,4],[1,2,3,2,1],[3,2,1,2,3],
      [0,1,0,1,0],[4,3,4,3,4],[1,1,2,3,3],[3,3,2,1,1],[2,1,0,1,2],
      [2,3,4,3,2],[0,2,2,2,0],[4,2,2,2,4],[1,2,2,2,1],[3,2,2,2,3]
    ])
  });
  const MULTIPLIERS = Object.freeze({ 3: 2, 4: 4, 5: 8 });
  function paylinesFor(rows) {
    if (!Object.prototype.hasOwnProperty.call(PAYLINES, rows)) throw new RangeError('Supported layouts are 5×3 and 5×5.');
    return PAYLINES[rows];
  }
  function spin(rows, random) {
    paylinesFor(rows);
    const rng = typeof random === 'function' ? random : Math.random;
    return Array.from({ length: rows }, () => Array.from({ length: 5 }, () => SYMBOLS[Math.floor(rng() * SYMBOLS.length)]));
  }
  function evaluate(grid, rows, betPerLine) {
    const paylines = paylinesFor(rows);
    if (!Array.isArray(grid) || grid.length !== rows || grid.some(row => !Array.isArray(row) || row.length !== 5)) throw new TypeError('Grid must be a rows×5 matrix.');
    if (!Number.isSafeInteger(betPerLine) || betPerLine < 1) throw new RangeError('Bet per line must be a positive integer.');
    const wins = [];
    paylines.forEach((line, lineIndex) => {
      const symbol = grid[line[0]][0];
      let count = 1;
      for (let column = 1; column < 5; column += 1) {
        if (grid[line[column]][column] !== symbol) break;
        count += 1;
      }
      if (count >= 3) {
        const multiplier = MULTIPLIERS[count];
        wins.push({ line: lineIndex + 1, symbol, count, multiplier, payout: betPerLine * multiplier });
      }
    });
    return { rows, reels: 5, paylines: paylines.length, betPerLine, totalBet: betPerLine * paylines.length, totalWin: wins.reduce((sum, win) => sum + win.payout, 0), wins };
  }
  const api = Object.freeze({ SYMBOLS, PAYLINES, paylinesFor, spin, evaluate });
  root.LingoSlotsEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
