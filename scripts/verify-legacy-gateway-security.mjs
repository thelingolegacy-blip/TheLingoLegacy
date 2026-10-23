import fs from 'node:fs';

const source = fs.readFileSync('gateway-router.js', 'utf8');
const checks = [
  {
    id: 'jwt-validation-fails-closed',
    pass: source.includes("Token verification is not configured")
      && !source.includes('return { valid: true, token }'),
  },
  {
    id: 'login-does-not-issue-placeholder-token',
    pass: source.includes('Authentication provider is not configured.')
      && !source.includes("token: 'placeholder'"),
  },
  {
    id: 'verify-does-not-equate-token-presence-with-identity',
    pass: source.includes("verified: false, error: 'Identity verification is not configured.'")
      && !source.includes('verified: Boolean(token)'),
  },
  {
    id: 'cors-is-first-party-https-only',
    pass: !source.includes('https://*.thelingolegacy.com')
      && source.includes("parsedOrigin.protocol === 'https:' && firstParty")
      && source.includes("'Vary': 'Origin'"),
  },
];
const failures = checks.filter((check) => !check.pass).map((check) => check.id);
const result = {
  gate: 'legacy-gateway-security',
  status: failures.length ? 'FAIL' : 'PASS',
  checks,
  failures,
  note: 'Static guard only. It does not establish that gateway-router.js is deployed or that a real identity provider is configured.',
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
