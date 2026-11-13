import test from "node:test";
import assert from "node:assert/strict";
import { applyGravity, createBoard, findLineMatches, isAdjacent, resolveChain, scoreChain, validatePath } from "../game-engine.mjs";

test("board dimensions are validated and generated", () => {
  const board = createBoard(7, 7, () => 0.1);
  assert.equal(board.length, 7);
  assert.equal(board.every((row) => row.length === 7), true);
  assert.throws(() => createBoard(3, 7), RangeError);
});

test("path must be connected, unique, in-bounds, and same-symbol", () => {
  const board = [
    ["EMBER", "EMBER", "EMBER", "GEM"],
    ["FLAME", "GEM", "CROWN", "RUNE"],
    ["LAVA", "FLAME", "GEM", "CROWN"],
    ["RUNE", "LAVA", "FLAME", "GEM"]
  ];
  assert.equal(validatePath(board, [{r:0,c:0},{r:0,c:1},{r:0,c:2}]), true);
  assert.equal(validatePath(board, [{r:0,c:0},{r:1,c:1},{r:0,c:2}]), false);
  assert.equal(validatePath(board, [{r:0,c:0},{r:0,c:1},{r:0,c:1}]), false);
  assert.equal(validatePath(board, [{r:0,c:0},{r:0,c:1}]), false);
});

test("adjacency is orthogonal, not diagonal", () => {
  assert.equal(isAdjacent({r:1,c:1},{r:1,c:2}), true);
  assert.equal(isAdjacent({r:1,c:1},{r:2,c:2}), false);
});

test("score formula is deterministic", () => {
  assert.equal(scoreChain(3), 300);
  assert.equal(scoreChain(5), 600);
  assert.equal(scoreChain(5, 2), 1000);
  assert.equal(scoreChain(2), 0);
});

test("gravity preserves board dimensions and fills empty cells", () => {
  const board = [["EMBER","FLAME"],[null,"GEM"],["CROWN",null]];
  const next = applyGravity(board, () => 0);
  assert.deepEqual(next.map((row) => row.length), [2,2,2]);
  assert.equal(next.flat().every(Boolean), true);
  assert.equal(board[1][0], null, "input board is not mutated");
});

test("line matching finds horizontal and vertical runs", () => {
  const board = [
    ["EMBER","EMBER","EMBER","GEM"],
    ["FLAME","GEM","CROWN","GEM"],
    ["LAVA","FLAME","GEM","GEM"],
    ["RUNE","LAVA","FLAME","GEM"]
  ];
  const keys = new Set(findLineMatches(board).map(({r,c}) => `${r}:${c}`));
  assert.equal(keys.has("0:0") && keys.has("0:2"), true);
  assert.equal(keys.has("1:3") && keys.has("3:3"), true);
});

test("valid chain resolves and invalid chain fails closed", () => {
  const board = [
    ["EMBER","EMBER","EMBER","GEM"],
    ["FLAME","GEM","CROWN","RUNE"],
    ["LAVA","FLAME","GEM","CROWN"],
    ["RUNE","LAVA","FLAME","GEM"]
  ];
  const good = resolveChain(board, [{r:0,c:0},{r:0,c:1},{r:0,c:2}], () => 0.5, 2);
  assert.equal(good.ok, true);
  assert.equal(good.score >= 300, true);
  assert.equal(good.board.length, 4);
  const bad = resolveChain(board, [{r:0,c:0},{r:1,c:1},{r:0,c:2}]);
  assert.equal(bad.ok, false);
  assert.equal(bad.score, 0);
});
