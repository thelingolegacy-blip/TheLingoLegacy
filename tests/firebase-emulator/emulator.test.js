const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc } = require('firebase/firestore');
const { ref, uploadBytes, getBytes } = require('firebase/storage');
const { initializeApp, deleteApp } = require('firebase/app');
const { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signOut } = require('firebase/auth');

const projectId = 'demo-lingo-legacy-emulator';
const root = __dirname;
let testEnv;
let authApp;
let auth;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: { rules: fs.readFileSync(path.join(root, 'firestore.rules'), 'utf8') },
    storage: { rules: fs.readFileSync(path.join(root, 'storage.rules'), 'utf8') }
  });

  authApp = initializeApp({ projectId, apiKey: 'fake-api-key' }, 'lingo-emulator-auth-test');
  auth = getAuth(authApp);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
});

after(async () => {
  if (auth) await signOut(auth).catch(() => {});
  if (authApp) await deleteApp(authApp).catch(() => {});
  if (testEnv) await testEnv.cleanup();
});

test('Auth emulator creates a test-only account', async () => {
  const credential = await createUserWithEmailAndPassword(
    auth,
    'emulator-user@example.invalid',
    'EmulatorOnly-Password-123!'
  );
  assert.ok(credential.user.uid);
  assert.equal(credential.user.email, 'emulator-user@example.invalid');
});

test('Firestore allows a user to write their own profile', async () => {
  const db = testEnv.authenticatedContext('user-a').firestore();
  await assertSucceeds(setDoc(doc(db, 'users/user-a/profile/main'), { displayName: 'Test User' }));
});

test('Firestore denies cross-user profile reads and writes', async () => {
  const userA = testEnv.authenticatedContext('user-a').firestore();
  const userB = testEnv.authenticatedContext('user-b').firestore();
  await assertSucceeds(setDoc(doc(userA, 'users/user-a/profile/main'), { displayName: 'Private' }));
  await assertFails(getDoc(doc(userB, 'users/user-a/profile/main')));
  await assertFails(setDoc(doc(userB, 'users/user-a/profile/main'), { displayName: 'Overwrite' }));
});

test('Firestore denies client wallet mutations, including to the owner', async () => {
  const db = testEnv.authenticatedContext('user-a').firestore();
  await assertFails(setDoc(doc(db, 'wallets/user-a'), { loyaltyBucks: 999999 }));
});

test('Storage allows an owner to upload an image avatar', async () => {
  const storage = testEnv.authenticatedContext('user-a').storage();
  const image = new Uint8Array([137, 80, 78, 71]);
  await assertSucceeds(uploadBytes(ref(storage, 'users/user-a/avatar.png'), image, { contentType: 'image/png' }));
});

test('Storage denies cross-user private document access', async () => {
  const owner = testEnv.authenticatedContext('user-a').storage();
  const other = testEnv.authenticatedContext('user-b').storage();
  await assertSucceeds(uploadBytes(ref(owner, 'documents/user-a/sample.pdf'), new Uint8Array([37, 80, 68, 70]), { contentType: 'application/pdf' }));
  await assertFails(getBytes(ref(other, 'documents/user-a/sample.pdf')));
});

test('Storage rejects invalid avatar content types', async () => {
  const storage = testEnv.authenticatedContext('user-a').storage();
  await assertFails(uploadBytes(ref(storage, 'users/user-a/avatar.png'), new Uint8Array([1, 2, 3]), { contentType: 'text/plain' }));
});

test('Storage denies client writes to public product media', async () => {
  const storage = testEnv.authenticatedContext('user-a').storage();
  await assertFails(uploadBytes(ref(storage, 'products/product-1/image.png'), new Uint8Array([1, 2, 3]), { contentType: 'image/png' }));
});
