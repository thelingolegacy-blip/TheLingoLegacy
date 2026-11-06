/** Deterministic status-effect clock. Call advance() from the owning simulation tick. */
export class StatusEffectManager {
  #instances = new Map();
  #nextId = 1;
  apply(targetId, definition, casterId = "world") {
    if (!targetId || !definition?.id) throw new TypeError("targetId and effect id are required");
    const duration = definition.duration ?? 0, tickInterval = definition.tickInterval ?? 0;
    if (!Number.isFinite(duration) || duration < 0 || !Number.isFinite(tickInterval) || tickInterval < 0) throw new RangeError("duration and tickInterval must be non-negative finite numbers");
    const policy = definition.stackPolicy ?? "independent";
    const same = [...this.#instances.values()].filter(x => x.targetId === targetId && x.effectId === definition.id && (definition.stackPerCaster === false || x.casterId === casterId));
    if (policy === "refresh" && same.length) {
      same[0].remaining = duration; same[0].untilTick = tickInterval;
      return { action: "refreshed", instanceId: same[0].instanceId };
    }
    if (policy === "stack" && same.length >= (definition.maxStacks ?? 1)) return { action: "stack-limit", instanceId: same[0].instanceId };
    const instanceId = `effect-${this.#nextId++}`;
    this.#instances.set(instanceId, { instanceId, targetId, casterId, effectId: definition.id, remaining: duration, tickInterval, untilTick: tickInterval, tickPayload: definition.tickPayload ?? null, stacks: policy === "stack" ? same.length + 1 : 1 });
    return { action: "applied", instanceId };
  }
  remove(instanceId) { return this.#instances.delete(instanceId); }
  advance(deltaSeconds) {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) throw new RangeError("deltaSeconds must be non-negative");
    const events = [];
    for (const effect of this.#instances.values()) {
      const elapsed = Math.min(deltaSeconds, effect.remaining);
      if (effect.tickInterval > 0 && effect.tickPayload !== null) {
        effect.untilTick -= elapsed;
        while (effect.untilTick <= 1e-9 && effect.remaining > 0) { events.push({ type: "tick", ...publicEffect(effect), payload: effect.tickPayload }); effect.untilTick += effect.tickInterval; }
      }
      effect.remaining = Math.max(0, effect.remaining - deltaSeconds);
      if (effect.remaining <= 1e-9) events.push({ type: "expired", ...publicEffect(effect) });
    }
    for (const [id, effect] of this.#instances) if (effect.remaining <= 1e-9) this.#instances.delete(id);
    return events;
  }
  list(targetId = null) { return [...this.#instances.values()].filter(x => targetId === null || x.targetId === targetId).map(publicEffect); }
}
function publicEffect(effect) {
  const { instanceId, targetId, casterId, effectId, remaining, tickInterval, stacks } = effect;
  return { instanceId, targetId, casterId, effectId, remaining, tickInterval, stacks };
}
