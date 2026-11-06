import { createBoard, GLYPHS, resolveChain, validatePath } from "./game-engine.mjs";

const $ = (id) => document.getElementById(id);
const boardEl = $("board");
const scoreEl = $("score");
const bestEl = $("best");
const timerEl = $("timer");
const chainEl = $("chain");
const statusEl = $("status");
const modeButton = $("mode");
const pauseButton = $("pause");
const soundButton = $("sound");
const motionButton = $("motion");
const submitButton = $("detonate");
const clearButton = $("clear");
const ROWS = 7;
const COLS = 7;
let board = createBoard(ROWS, COLS);
let path = [];
let score = 0;
let best = Number(readStore("lingo-eruptions-best", "0")) || 0;
let timed = false;
let seconds = 90;
let paused = false;
let soundOn = false;
let reducedMotion = false;
let pointerSelecting = false;
let clock = null;
let audioContext = null;

function readStore(key, fallback) {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function writeStore(key, value) {
  try { localStorage.setItem(key, String(value)); } catch { /* private browsing may block storage */ }
}
function announce(message) { statusEl.textContent = message; }
function updateHud() {
  scoreEl.textContent = score.toLocaleString();
  bestEl.textContent = best.toLocaleString();
  timerEl.textContent = timed ? `${seconds}s` : "∞";
  timerEl.classList.toggle("urgent", timed && seconds <= 15);
  chainEl.textContent = path.length ? `${path.length} selected` : "Build a chain";
  submitButton.disabled = path.length < 3 || paused;
}
function renderBoard() {
  boardEl.replaceChildren();
  board.forEach((row, r) => row.forEach((symbol, c) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.dataset.r = String(r);
    tile.dataset.c = String(c);
    tile.dataset.symbol = symbol;
    tile.textContent = GLYPHS[symbol] ?? "•";
    tile.setAttribute("aria-label", `${symbol.toLowerCase()} at row ${r + 1}, column ${c + 1}`);
    tile.setAttribute("aria-pressed", String(path.some((p) => p.r === r && p.c === c)));
    if (path.some((p) => p.r === r && p.c === c)) tile.classList.add("selected");
    boardEl.append(tile);
  }));
  updateHud();
}
function tileFromPoint(x, y) {
  const element = document.elementFromPoint(x, y);
  const tile = element?.closest?.(".tile");
  return tile && boardEl.contains(tile) ? tile : null;
}
function addPoint(r, c) {
  const point = { r, c };
  const last = path[path.length - 1];
  if (!last) { path = [point]; renderBoard(); return; }
  if (path.some((p) => p.r === r && p.c === c)) return;
  if (Math.abs(last.r - r) + Math.abs(last.c - c) !== 1) return;
  if (board[r][c] !== board[path[0].r][path[0].c]) return;
  path = [...path, point];
  renderBoard();
}
function clearPath() { path = []; renderBoard(); announce("Selection cleared. Trace three or more matching neighboring glyphs."); }
function playTone(freq = 440, duration = 0.08, type = "sine") {
  if (!soundOn) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    audioContext ??= new Audio();
    if (audioContext.state === "suspended") audioContext.resume();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    osc.connect(gain); gain.connect(audioContext.destination);
    osc.start(); osc.stop(audioContext.currentTime + duration + 0.02);
  } catch { announce("Audio is unavailable on this device."); }
}
function submitChain() {
  if (paused || !validatePath(board, path)) {
    announce("Choose a connected chain of at least three matching glyphs.");
    playTone(160, 0.1, "triangle");
    return;
  }
  const result = resolveChain(board, path);
  if (!result.ok) return;
  board = result.board;
  score += result.score;
  best = Math.max(best, score);
  writeStore("lingo-eruptions-best", best);
  const chainLength = path.length;
  path = [];
  renderBoard();
  playTone(result.cascades ? 720 : 520, 0.16, "sine");
  const cascadeText = result.cascades ? ` + ${result.cascades} cascade${result.cascades > 1 ? "s" : ""}!` : "";
  announce(`Lion chain! ${chainLength} glyphs cleared for ${result.score.toLocaleString()} points.${cascadeText}`);
  boardEl.classList.remove("erupt");
  if (!reducedMotion) {
    void boardEl.offsetWidth;
    boardEl.classList.add("erupt");
  }
}
function stopClock() { if (clock) window.clearInterval(clock); clock = null; }
function startClock() {
  stopClock();
  if (!timed || paused) return;
  clock = window.setInterval(() => {
    seconds = Math.max(0, seconds - 1);
    updateHud();
    if (seconds === 0) {
      stopClock(); paused = true; pauseButton.textContent = "Resume";
      announce(`Time! Final score: ${score.toLocaleString()}. Start a new run to play again.`);
    }
  }, 1000);
}
function resetGame() {
  board = createBoard(ROWS, COLS);
  path = []; score = 0; seconds = 90; paused = false;
  pauseButton.textContent = "Pause";
  renderBoard(); startClock();
  announce("New run ready. Trace three or more connected matching glyphs.");
}
function handleKeyboardTap(tile) {
  if (!tile || paused) return;
  addPoint(Number(tile.dataset.r), Number(tile.dataset.c));
}
boardEl.addEventListener("pointerdown", (event) => {
  const tile = event.target.closest(".tile");
  if (!tile || paused) return;
  pointerSelecting = true;
  path = [{ r: Number(tile.dataset.r), c: Number(tile.dataset.c) }];
  boardEl.setPointerCapture?.(event.pointerId);
  renderBoard();
});
boardEl.addEventListener("pointermove", (event) => {
  if (!pointerSelecting) return;
  const tile = tileFromPoint(event.clientX, event.clientY);
  if (tile) addPoint(Number(tile.dataset.r), Number(tile.dataset.c));
});
boardEl.addEventListener("pointerup", () => {
  if (!pointerSelecting) return;
  pointerSelecting = false;
  if (path.length >= 3) submitChain();
  else announce("Keep tracing matching neighbors, or select three glyphs and detonate.");
});
boardEl.addEventListener("pointercancel", () => { pointerSelecting = false; });
boardEl.addEventListener("click", (event) => {
  if (event.detail !== 0) return;
  handleKeyboardTap(event.target.closest(".tile"));
});
submitButton.addEventListener("click", submitChain);
clearButton.addEventListener("click", clearPath);
$("restart").addEventListener("click", resetGame);
modeButton.addEventListener("click", () => {
  timed = !timed; modeButton.textContent = timed ? "Timed · 90s" : "Relaxed";
  seconds = 90; startClock(); updateHud();
  announce(timed ? "Timed mode: clear chains before the clock reaches zero." : "Relaxed mode: play at your own pace.");
});
pauseButton.addEventListener("click", () => {
  paused = !paused;
  pauseButton.textContent = paused ? "Resume" : "Pause";
  if (paused) stopClock(); else startClock();
  updateHud(); announce(paused ? "Game paused." : "Game resumed.");
});
soundButton.addEventListener("click", () => {
  soundOn = !soundOn; soundButton.textContent = soundOn ? "Sound On" : "Sound Off";
  if (soundOn) playTone(660, 0.1);
});
motionButton.addEventListener("click", () => {
  reducedMotion = !reducedMotion;
  document.documentElement.classList.toggle("reduced-motion", reducedMotion);
  motionButton.textContent = reducedMotion ? "Motion Reduced" : "Motion Effects";
});
$("help").addEventListener("click", () => $("helpDialog").showModal());
$("closeHelp").addEventListener("click", () => $("helpDialog").close());
renderBoard(); updateHud();
announce("Welcome, Lion. Trace three or more connected matching glyphs to start a chain.");
