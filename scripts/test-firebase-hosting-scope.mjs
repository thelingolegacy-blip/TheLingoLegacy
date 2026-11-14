import assert from 'node:assert/strict';
import { validateFirebaseHostingScope } from './verify-firebase-hosting-scope.mjs';

assert.equal(validateFirebaseHostingScope({}), true);
assert.equal(validateFirebaseHostingScope({ firestore: { rules: 'firestore.rules' } }), true);
assert.throws(
  () => validateFirebaseHostingScope({ hosting: { public: '.' } }),
  /must remain unconfigured/
);
assert.throws(
  () => validateFirebaseHostingScope({ hosting: { public: 'build/web' } }),
  /must remain unconfigured/
);
assert.throws(
  () => validateFirebaseHostingScope(null),
  /must contain a JSON object/
);

console.log('FIREBASE_HOSTING_SCOPE_TESTS=5/5 PASS');
