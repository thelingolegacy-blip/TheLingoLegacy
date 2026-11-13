export const SYMBOLS = Object.freeze(["EMBER", "FLAME", "GEM", "CROWN", "RUNE", "LAVA"]);
export const GLYPHS = Object.freeze({ EMBER: "🔥", FLAME: "🟠", GEM: "💎", CROWN: "👑", RUNE: "🔮", LAVA: "🌋" });

const symbolAt = (random) => SYMBOLS[Math.min(SYMBOLS.length - 1, Math.floor(random() * SYMBOLS.length))];
const cloneBoard = (board) => board.map((row) => [...row]);
const keyOf = ({ r, c }) => `${r}:${c}`;

export function createBoard(rows = 7, cols = 7, random = Math.random) {
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 4 || cols < 4) {
    throw new RangeError("Board dimensions must be integers of at least 4.");
  }
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => symbolAt(random)));
}

export function isAdjacent(a, b) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
}

export function validatePath(board, path) {
  if (!Array.isArray(path) || path.length < 3) return false;
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  const seen = new Set();
  let symbol;
  for (let i = 0; i < path.length; i += 1) {
    const point = path[i];
    if (!Number.isInteger(point.r) || !Number.isInteger(point.c) || point.r < 0 || point.r >= rows || point.c < 0 || point.c >= cols) return false;
    const key = keyOf(point);
    if (seen.has(key)) return false;
    seen.add(key);
    const value = board[point.r][point.c];
    if (typeof value !== "string") return false;
    if (i === 0) symbol = value;
    if (value !== symbol) return false;
    if (i > 0 && !isAdjacent(path[i - 1], point)) return false;
  }
  return true;
}

export function scoreChain(length, combo = 0) {
  if (!Number.isInteger(length) || length < 3) return 0;
  return length * 100 + Math.max(0, length - 3) * 50 + Math.max(0, combo) * 200;
}

export function findLineMatches(board) {
  const matches = new Set();
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  const scan = (points) => {
    let start = 0;
    while (start < points.length) {
      const value = board[points[start].r][points[start].c];
      let end = start + 1;
      while (value && end < points.length && board[points[end].r][points[end].c] === value) end += 1;
      if (value && end - start >= 3) {
        for (let i = start; i < end; i += 1) matches.add(keyOf(points[i]));
      }
      start = end;
    }
  };
  for (let r = 0; r < rows; r += 1) scan(Array.from({ length: cols }, (_, c) => ({ r, c })));
  for (let c = 0; c < cols; c += 1) scan(Array.from({ length: rows }, (_, r) => ({ r, c })));
  return [...matches].map((key) => {
    const [r, c] = key.split(":").map(Number);
    return { r, c };
  });
}

export function applyGravity(board, random = Math.random) {
  const next = cloneBoard(board);
  const rows = next.length;
  const cols = next[0]?.length ?? 0;
  for (let c = 0; c < cols; c += 1) {
    const kept = [];
    for (let r = rows - 1; r >= 0; r -= 1) if (next[r][c]) kept.push(next[r][c]);
    for (let r = rows - 1, i = 0; r >= 0; r -= 1, i += 1) next[r][c] = kept[i] ?? symbolAt(random);
  }
  return next;
}

export function resolveChain(board, path, random = Math.random, maxCascades = 8) {
  if (!validatePath(board, path)) return { ok: false, board: cloneBoard(board), score: 0, cascades: 0, cleared: 0 };
  let next = cloneBoard(board);
  const initial = new Set(path.map(keyOf));
  for (const key of initial) {
    const [r, c] = key.split(":").map(Number);
    next[r][c] = null;
  }
  let cleared = initial.size;
  let score = scoreChain(initial.size, 0);
  next = applyGravity(next, random);
  let cascades = 0;
  while (cascades < maxCascades) {
    const line = findLineMatches(next);
    if (line.length < 3) break;
    for (const point of line) next[point.r][point.c] = null;
    cleared += line.length;
    cascades += 1;
    score += scoreChain(line.length, cascades);
    next = applyGravity(next, random);
  }
  return { ok: true, board: next, score, cascades, cleared };
}
