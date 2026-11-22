const ENVIRONMENTS = new Set(["development", "test", "staging", "production"]);
const GATE_IDS = Object.freeze([
  "public_hq",
  "demo_gameplay",
  "registered_play",
  "wallet_mutation",
  "commerce_checkout",
  "ai_provider_calls",
  "community_interaction",
  "real_value_rewards",
]);

const ALWAYS_CLOSED_GATES = new Set(["real_value_rewards"]);
const ENV_BINDING_KEYS = Object.freeze([
  "ENVIRONMENT",
  "STACK_ENGINE_VERSION",
  "GATE_PUBLIC_HQ",
  "GATE_DEMO_GAMEPLAY",
  "GATE_REGISTERED_PLAY",
  "GATE_WALLET_MUTATION",
  "GATE_COMMERCE_CHECKOUT",
  "GATE_AI_PROVIDER_CALLS",
  "GATE_COMMUNITY_INTERACTION",
]);

function exactBoolean(value) {
  return value === true || value === "true";
}

function safeVersion(value) {
  return typeof value === "string" && /^[a-zA-Z0-9._-]{1,40}$/.test(value)
    ? value
    : "unversioned";
}

function safeEnvironment(value) {
  return typeof value === "string" && ENVIRONMENTS.has(value)
    ? value
    : null;
}

/**
 * Read only the explicitly supported, non-secret configuration keys.
 * No implicit production default is permitted.
 */
export function readStackConfig(env = {}) {
  const environment = safeEnvironment(env.ENVIRONMENT);
  const configValid = environment !== null;
  const gates = Object.fromEntries(
    GATE_IDS.map((id) => {
      const key = `GATE_${id.toUpperCase()}`;
      const enabled = !ALWAYS_CLOSED_GATES.has(id) && configValid && exactBoolean(env[key]);
      return [id, Object.freeze({
        enabled,
        configured: Object.hasOwn(env, key),
        reason: !configValid
          ? "ENVIRONMENT_INVALID_OR_MISSING"
          : ALWAYS_CLOSED_GATES.has(id)
            ? "POLICY_CLOSED"
            : enabled
              ? "EXPLICITLY_ENABLED"
              : "DISABLED_BY_DEFAULT",
      })];
    }),
  );

  return Object.freeze({
    valid: configValid,
    environment,
    version: safeVersion(env.STACK_ENGINE_VERSION),
    gates: Object.freeze(gates),
  });
}

/** Liveness is deliberately independent of storage, identity and network. */
export function liveness(version = "unversioned") {
  return Object.freeze({
    ok: true,
    status: "alive",
    version: safeVersion(version),
  });
}

/**
 * Evaluate readiness from caller-supplied dependency observations.
 * Each dependency entry is { required: boolean, status: "ok"|"unavailable"|"unconfigured" }.
 */
export function readiness({ config, dependencies = {}, requiredDependencies } = {}) {
  const configValid = config?.valid === true;
  const dependencyContractValid = Array.isArray(requiredDependencies);
  const requiredNames = dependencyContractValid ? requiredDependencies : [];
  const observed = new Map(Object.entries(dependencies));
  const checks = [...new Set([...Object.keys(dependencies), ...requiredNames])].map((name) => {
    const value = observed.get(name);
    const required = requiredNames.includes(name);
    const status = ["ok", "unavailable", "unconfigured"].includes(value?.status)
      ? value.status
      : "unavailable";
    return Object.freeze({
      name,
      required,
      status,
      ready: status === "ok" || (!required && status === "unconfigured"),
    });
  });
  const failed = checks.filter((check) => check.required && !check.ready);
  const ready = configValid && dependencyContractValid && failed.length === 0;

  return Object.freeze({
    ok: ready,
    status: ready ? "ready" : "not_ready",
    environment: config?.environment ?? null,
    checks: Object.freeze(checks),
    blockers: Object.freeze([
      ...(!configValid ? ["ENVIRONMENT_INVALID_OR_MISSING"] : []),
      ...(!dependencyContractValid ? ["DEPENDENCY_CONTRACT_MISSING"] : []),
      ...failed.map((check) => `DEPENDENCY_${check.name.toUpperCase()}_${check.status.toUpperCase()}`),
    ]),
  });
}

/**
 * Return a public, allowlisted manifest. Never serialize the env object.
 */
export function publicManifest(config) {
  return Object.freeze({
    schema_version: "1.0.0",
    engine: "LINGO Stack Engine",
    version: safeVersion(config?.version),
    environment: config?.environment ?? null,
    configuration_valid: config?.valid === true,
    gates: Object.freeze(Object.fromEntries(
      GATE_IDS.map((id) => [id, config?.gates?.[id]?.enabled === true]),
    )),
    policy: Object.freeze({
      real_value_rewards: "CLOSED",
      cashout: "CLOSED",
      payment_activation: "SEPARATE_APPROVAL_REQUIRED",
    }),
  });
}

/**
 * Pure gate transition validator. Persistence, authentication and audit storage
 * are adapter responsibilities and must be performed atomically by the caller.
 */
export function planGateTransition(current, command = {}) {
  const gateId = command.gate_id;
  if (!GATE_IDS.includes(gateId)) {
    return Object.freeze({ ok: false, code: "UNKNOWN_GATE" });
  }
  if (ALWAYS_CLOSED_GATES.has(gateId)) {
    return Object.freeze({ ok: false, code: "POLICY_CLOSED" });
  }
  if (command.authorized !== true || typeof command.actor !== "string" || !command.actor.trim()) {
    return Object.freeze({ ok: false, code: "ADMIN_AUTH_REQUIRED" });
  }
  if (typeof command.reason !== "string" || command.reason.trim().length < 8 || command.reason.length > 500) {
    return Object.freeze({ ok: false, code: "CHANGE_REASON_REQUIRED" });
  }
  if (!Number.isInteger(command.expected_version) || command.expected_version !== current?.version) {
    return Object.freeze({ ok: false, code: "VERSION_CONFLICT" });
  }
  if (typeof command.enabled !== "boolean") {
    return Object.freeze({ ok: false, code: "INVALID_GATE_VALUE" });
  }

  const next = Object.freeze({
    ...current,
    enabled: command.enabled,
    version: current.version + 1,
    updated_by: command.actor.trim(),
    reason: command.reason.trim(),
  });
  const audit = Object.freeze({
    event: "STACK_GATE_TRANSITION",
    gate_id: gateId,
    from_enabled: current.enabled === true,
    to_enabled: command.enabled,
    previous_version: current.version,
    next_version: next.version,
    actor: command.actor.trim(),
    reason: command.reason.trim(),
  });
  return Object.freeze({ ok: true, next, audit });
}

export function createStackEngine(env = {}) {
  const config = readStackConfig(env);
  return Object.freeze({
    config,
    liveness: () => liveness(config.version),
    readiness: ({ dependencies, requiredDependencies } = {}) => readiness({ config, dependencies, requiredDependencies }),
    manifest: () => publicManifest(config),
  });
}

export const STACK_GATE_IDS = GATE_IDS;
