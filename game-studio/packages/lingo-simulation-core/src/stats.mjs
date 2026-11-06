/** Data-driven attribute aggregation. Percent modifiers are additive, then applied once. */
export class StatBlock {
  #base = new Map();
  #modifiers = new Map();
  constructor(baseStats = {}) { for (const [key, value] of Object.entries(baseStats)) this.setBase(key, value); }
  setBase(stat, value) {
    assertKey(stat); assertFinite(value, `base ${stat}`); this.#base.set(stat, value);
  }
  addModifier({ id, stat, flat = 0, percent = 0, source = "unknown" }) {
    assertKey(id); assertKey(stat); assertFinite(flat, "flat modifier"); assertFinite(percent, "percent modifier");
    if (!this.#base.has(stat)) throw new Error(`Unknown stat: ${stat}`);
    this.#modifiers.set(id, { id, stat, flat, percent, source });
  }
  removeModifier(id) { return this.#modifiers.delete(id); }
  get(stat) {
    if (!this.#base.has(stat)) throw new Error(`Unknown stat: ${stat}`);
    let flat = 0, percent = 0;
    for (const modifier of this.#modifiers.values()) if (modifier.stat === stat) { flat += modifier.flat; percent += modifier.percent; }
    return (this.#base.get(stat) + flat) * (1 + percent);
  }
  snapshot() { return Object.fromEntries([...this.#base.keys()].sort().map(stat => [stat, this.get(stat)])); }
}
function assertKey(value) { if (typeof value !== "string" || !value.trim()) throw new TypeError("Expected a non-empty string key"); }
function assertFinite(value, label) { if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite`); }
