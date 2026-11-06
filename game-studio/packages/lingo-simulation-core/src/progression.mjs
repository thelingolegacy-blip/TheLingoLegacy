/** Directed acyclic progression graph with explicit prerequisite and point checks. */
export class ProgressionTree {
  constructor(nodes) { this.nodes = new Map(nodes.map(node => [node.id, structuredClone(node)])); this.unlocked = new Set(); this.#validate(); }
  #validate() {
    for (const node of this.nodes.values()) {
      if (!node.id || !Number.isInteger(node.cost ?? 0) || (node.cost ?? 0) < 0) throw new Error(`Invalid node: ${node.id}`);
      for (const prerequisite of node.prerequisites ?? []) if (!this.nodes.has(prerequisite)) throw new Error(`Missing prerequisite ${prerequisite} for ${node.id}`);
    }
    const visiting = new Set(), visited = new Set();
    const visit = id => {
      if (visiting.has(id)) throw new Error(`Progression cycle detected at ${id}`);
      if (visited.has(id)) return;
      visiting.add(id); for (const prerequisite of this.nodes.get(id).prerequisites ?? []) visit(prerequisite);
      visiting.delete(id); visited.add(id);
    };
    for (const id of this.nodes.keys()) visit(id);
  }
  unlock(nodeId, availablePoints) {
    const node = this.nodes.get(nodeId);
    if (!node) return { ok: false, reason: "unknown-node" };
    if (this.unlocked.has(nodeId)) return { ok: false, reason: "already-unlocked" };
    if (!(node.prerequisites ?? []).every(id => this.unlocked.has(id))) return { ok: false, reason: "prerequisites-locked" };
    const cost = node.cost ?? 0;
    if (!Number.isFinite(availablePoints) || availablePoints < cost) return { ok: false, reason: "insufficient-points" };
    this.unlocked.add(nodeId);
    return { ok: true, remainingPoints: availablePoints - cost, effects: structuredClone(node.effects ?? []) };
  }
  snapshot() { return [...this.unlocked].sort(); }
}
