const EXACT_RESTRICTED_PATHS = new Set([
  '/integration-configurations',
  '/integration-ids-register',
  '/integration-links-register',
  '/dashboard-integration-links',
  '/exact-dashboard-links',
  '/auth0-details',
  '/auth0-implementation',
  '/admin-command-center',
  '/economy-command-center',
]);

const RESTRICTED_PREFIXES = [
  '/ops',
  '/config/ops',
  '/docs/ops',
  '/docs/superpowers',
];

/**
 * Fail closed on ambiguous path encodings, then match exact paths and
 * segment-boundary prefixes. Accepts a request URL or a raw pathname.
 */
export function isRestrictedPublicPath(input) {
  if (typeof input !== 'string' || !input) return true;

  try {
    let rawPath = input;
    const scheme = input.indexOf('://');
    if (scheme > 0) {
      const authorityStart = scheme + 3;
      const slash = input.indexOf('/', authorityStart);
      rawPath = slash === -1 ? '/' : input.slice(slash);
    }
    rawPath = rawPath.split(/[?#]/, 1)[0] || '/';

    if (!rawPath.startsWith('/')) return true;
    if (/%(?![0-9a-f]{2})/i.test(rawPath)) return true;
    if (/%2f|%5c/i.test(rawPath) || rawPath.includes('\\')) return true;

    const decoded = decodeURIComponent(rawPath);
    if (decoded.includes('\\') || /[\u0000-\u001f\u007f]/.test(decoded)) return true;
    // A second encoded layer is ambiguous; never decode it again.
    if (/%[0-9a-f]{2}/i.test(decoded)) return true;

    const segments = decoded.split('/');
    if (segments.some((segment) => segment === '.' || segment === '..')) return true;

    const normalized = `/${segments.filter(Boolean).join('/')}`.toLowerCase();
    if (EXACT_RESTRICTED_PATHS.has(normalized)) return true;

    return RESTRICTED_PREFIXES.some((prefix) =>
      normalized === prefix || normalized.startsWith(`${prefix}/`)
    );
  } catch {
    return true;
  }
}
