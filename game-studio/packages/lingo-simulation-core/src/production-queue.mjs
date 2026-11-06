/** FIFO production queue with all-or-nothing resource deduction at enqueue time. */
export class ProductionQueue {
  constructor(resources = {}) { this.resources = { ...resources }; this.items = []; this.completed = []; this.#nextId = 1; }
  #nextId;
  enqueue({ productId, cost = {}, duration }) {
    if (!productId || !Number.isFinite(duration) || duration <= 0) throw new TypeError("productId and positive duration are required");
    for (const [resource, amount] of Object.entries(cost)) {
      if (!Number.isFinite(amount) || amount < 0) throw new TypeError(`Invalid cost for ${resource}`);
      if ((this.resources[resource] ?? 0) < amount) return { ok: false, reason: "insufficient-resources", resource };
    }
    for (const [resource, amount] of Object.entries(cost)) this.resources[resource] = (this.resources[resource] ?? 0) - amount;
    const item = { id: `production-${this.#nextId++}`, productId, remaining: duration, duration };
    this.items.push(item); return { ok: true, item: { ...item } };
  }
  advance(deltaSeconds, speedMultiplier = 1) {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0 || !Number.isFinite(speedMultiplier) || speedMultiplier < 0) throw new RangeError("deltaSeconds and speedMultiplier must be non-negative finite numbers");
    const active = this.items[0]; if (!active || speedMultiplier === 0) return null;
    active.remaining = Math.max(0, active.remaining - deltaSeconds * speedMultiplier);
    if (active.remaining > 1e-9) return { active: { ...active }, completed: [] };
    this.items.shift(); const result = { ...active, remaining: 0 }; this.completed.push(result);
    return { active: this.items[0] ? { ...this.items[0] } : null, completed: [result] };
  }
  snapshot() { return { resources: { ...this.resources }, items: this.items.map(x => ({ ...x })), completed: this.completed.map(x => ({ ...x })) }; }
}
