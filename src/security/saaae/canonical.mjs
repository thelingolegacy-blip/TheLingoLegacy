/**
 * Deterministic JSON canonicalization for approval and audit payload binding.
 * Rejects values JSON would silently omit or coerce.
 */
function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function canonicalizeJson(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("NON_FINITE_NUMBER");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map(item => canonicalizeJson(item)).join(",") + "]";
  }
  if (!isPlainObject(value)) throw new TypeError("UNSUPPORTED_CANONICAL_VALUE");
  const keys = Object.keys(value).sort();
  if (keys.some(key => ["__proto__", "prototype", "constructor"].includes(key))) {
    throw new TypeError("UNSAFE_OBJECT_KEY");
  }
  return "{" + keys.map(key => JSON.stringify(key) + ":" + canonicalizeJson(value[key])).join(",") + "}";
}

export async function sha256Hex(bytes, cryptoImpl = globalThis.crypto) {
  if (!cryptoImpl?.subtle || typeof cryptoImpl.subtle.digest !== "function") {
    throw new Error("CRYPTO_UNAVAILABLE");
  }
  const input = typeof bytes === "string" ? new TextEncoder().encode(bytes) : bytes;
  const digest = await cryptoImpl.subtle.digest("SHA-256", input);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function digestCanonicalJson(value, cryptoImpl = globalThis.crypto) {
  return sha256Hex(canonicalizeJson(value), cryptoImpl);
}
