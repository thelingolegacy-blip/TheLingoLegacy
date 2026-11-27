const EPSILON = 1e-9;
export function validateProbabilityVector(values, tolerance = EPSILON) {
  if (!Array.isArray(values) || values.length < 1 || values.length > 10000) throw new Error("Probability vector must contain 1–10000 entries.");
  if (values.some(value => typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1)) throw new Error("Every probability must be finite and between 0 and 1.");
  const total = values.reduce((sum, value) => sum + value, 0);
  return { valid: Math.abs(total - 1) <= tolerance, total, tolerance, entries: values.length };
}
export function evaluateVirtualDistribution(outcomes) {
  if (!Array.isArray(outcomes) || outcomes.length < 1 || outcomes.length > 10000) throw new Error("Provide 1–10000 discrete outcomes.");
  const probabilities = outcomes.map(item => item?.probability);
  const check = validateProbabilityVector(probabilities);
  if (!check.valid) throw new Error("Outcome probabilities must sum to 1 within tolerance; received " + check.total + ".");
  if (outcomes.some(item => typeof item.value !== "number" || !Number.isFinite(item.value))) throw new Error("Every outcome value must be a finite number.");
  const expected = outcomes.reduce((sum, item) => sum + item.value * item.probability, 0);
  const variance = outcomes.reduce((sum, item) => sum + ((item.value - expected) ** 2) * item.probability, 0);
  return {
    model: "discrete-virtual-outcome-distribution",
    scope: "game-balance-simulation-only",
    outcomes: outcomes.length,
    probability_total: check.total,
    expected_virtual_value: expected,
    variance,
    standard_deviation: Math.sqrt(variance),
    minimum: Math.min(...outcomes.map(x => x.value)),
    maximum: Math.max(...outcomes.map(x => x.value)),
    monetary_wagering: false,
    cashout: false
  };
}
