import test from "node:test";
import assert from "node:assert/strict";
import { StatBlock, StatusEffectManager, ProgressionTree, ProductionQueue } from "../src/index.mjs";

test("stats aggregate flat and percentage modifiers deterministically", () => {
  const stats = new StatBlock({ health: 100, attack: 20 });
  stats.addModifier({ id: "gear", stat: "health", flat: 10 });
  stats.addModifier({ id: "aura", stat: "health", percent: 0.2 });
  assert.equal(stats.get("health"), 132);
  assert.equal(stats.removeModifier("gear"), true);
  assert.equal(stats.get("health"), 120);
});

test("status effects refresh and expire on simulation time", () => {
  const effects = new StatusEffectManager();
  const definition = { id: "regen", duration: 3, tickInterval: 1, tickPayload: { heal: 5 }, stackPolicy: "refresh" };
  const first = effects.apply("hero", definition, "medic");
  effects.advance(1); effects.apply("hero", definition, "medic");
  assert.equal(effects.list("hero")[0].instanceId, first.instanceId);
  assert.equal(effects.advance(3).filter(event => event.type === "expired").length, 1);
  assert.equal(effects.list("hero").length, 0);
});

test("progression enforces prerequisites and point costs", () => {
  const tree = new ProgressionTree([{ id: "root", cost: 1 }, { id: "dash", cost: 2, prerequisites: ["root"], effects: [{ stat: "moveSpeed", percent: 0.1 }] }]);
  assert.equal(tree.unlock("dash", 5).reason, "prerequisites-locked");
  assert.equal(tree.unlock("root", 1).remainingPoints, 0);
  assert.equal(tree.unlock("dash", 1).reason, "insufficient-points");
  assert.equal(tree.unlock("dash", 2).ok, true);
});

test("production enqueue is atomic and queue resolves FIFO", () => {
  const queue = new ProductionQueue({ gold: 10, wood: 2 });
  assert.equal(queue.enqueue({ productId: "tower", cost: { gold: 11, wood: 1 }, duration: 2 }).ok, false);
  assert.deepEqual(queue.resources, { gold: 10, wood: 2 });
  queue.enqueue({ productId: "worker", cost: { gold: 5 }, duration: 1 });
  queue.enqueue({ productId: "tower", cost: { gold: 5, wood: 2 }, duration: 2 });
  assert.equal(queue.advance(1).completed[0].productId, "worker");
  assert.equal(queue.advance(2).completed[0].productId, "tower");
});

test("progression graph rejects cycles", () => {
  assert.throws(() => new ProgressionTree([{ id: "a", prerequisites: ["b"] }, { id: "b", prerequisites: ["a"] }]), /cycle/i);
});
