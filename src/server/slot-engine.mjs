const UINT32_RANGE = 0x1_0000_0000;

/**
 * Draw an unbiased integer in [0, maxExclusive) using rejection sampling.
 * `readUint32` is injectable only for deterministic tests; production callers
 * should use the default Web Crypto source.
 */
export function secureRandomInt(maxExclusive, readUint32 = readCryptoUint32) {
  if (!Number.isSafeInteger(maxExclusive) || maxExclusive < 1 || maxExclusive > UINT32_RANGE) {
    throw new RangeError('maxExclusive must be an integer from 1 through 2^32');
  }
  if (maxExclusive === 1) return 0;
  const acceptanceLimit = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive;
  for (let attempts = 0; attempts < 128; attempts += 1) {
    const value = readUint32();
    if (!Number.isInteger(value) || value < 0 || value >= UINT32_RANGE) {
      throw new TypeError('random source must return an unsigned 32-bit integer');
    }
    if (value < acceptanceLimit) return value % maxExclusive;
  }
  throw new Error('SECURE_RANDOM_SOURCE_STALLED');
}

function readCryptoUint32() {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return value[0];
}

export function evaluateThreeReelSpin({ symbols, paytable, wagerUnits, readUint32 = readCryptoUint32 }) {
  if (!Array.isArray(symbols) || symbols.length < 1 || symbols.length > 256
    || symbols.some((symbol) => typeof symbol !== 'string' || symbol.length === 0)) {
    throw new TypeError('symbols must be a non-empty array of symbol identifiers');
  }
  if (!paytable || typeof paytable !== 'object' || Array.isArray(paytable)) {
    throw new TypeError('paytable must be a symbol-to-multiplier object');
  }
  if (!Number.isSafeInteger(wagerUnits) || wagerUnits < 1) {
    throw new RangeError('wagerUnits must be a positive safe integer');
  }

  const reels = Array.from({ length: 3 }, () => symbols[secureRandomInt(symbols.length, readUint32)]);
  const isWin = reels[0] === reels[1] && reels[1] === reels[2];
  const multiplier = isWin && Object.hasOwn(paytable, reels[0]) ? paytable[reels[0]] : 0;
  if (!Number.isSafeInteger(multiplier) || multiplier < 0) {
    throw new TypeError(`invalid integer payout multiplier for ${reels[0]}`);
  }
  const payoutUnits = wagerUnits * multiplier;
  if (!Number.isSafeInteger(payoutUnits)) throw new RangeError('payout exceeds safe integer range');
  return Object.freeze({ reels, wagerUnits, payoutUnits, netDeltaUnits: payoutUnits - wagerUnits, isWin });
}

export function validateIdempotencyKey(value) {
  return typeof value === 'string' && /^[A-Za-z0-9._:-]{16,128}$/.test(value);
}
