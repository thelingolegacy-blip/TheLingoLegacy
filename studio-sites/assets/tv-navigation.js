(() => {
  "use strict";

  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])'
  ].join(",");

  const editableSelector = "input,textarea,select,[contenteditable='true']";

  function visibleFocusableElements() {
    return Array.from(document.querySelectorAll(focusableSelector)).filter((element) => {
      if (element.hidden || element.getAttribute("aria-hidden") === "true") return false;
      if (element.closest("[hidden],[inert],[aria-hidden='true']")) return false;
      return element.getClientRects().length > 0;
    });
  }

  function centerOf(element) {
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function nextInDirection(current, key, candidates) {
    const origin = centerOf(current);
    const vectors = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 }
    };
    const vector = vectors[key];
    if (!vector) return null;

    let best = null;
    let bestScore = Infinity;
    for (const candidate of candidates) {
      if (candidate === current) continue;
      const point = centerOf(candidate);
      const dx = point.x - origin.x;
      const dy = point.y - origin.y;
      const primary = dx * vector.x + dy * vector.y;
      if (primary <= 1) continue;
      const cross = Math.abs(dx * vector.y - dy * vector.x);
      const score = primary + cross * 2.25;
      if (score < bestScore) {
        best = candidate;
        bestScore = score;
      }
    }
    return best;
  }

  document.addEventListener("keydown", (event) => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

    const active = document.activeElement;
    if (active && active.matches(editableSelector)) return;

    const candidates = visibleFocusableElements();
    if (!candidates.length) return;

    const current = candidates.includes(active) ? active : null;
    const next = current
      ? nextInDirection(current, event.key, candidates)
      : candidates[0];

    if (!next) return;
    event.preventDefault();
    next.focus({ preventScroll: false });
  });
})();
