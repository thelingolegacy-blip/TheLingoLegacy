// Firebase initialization for Cloudflare Worker
// Add to worker.js after imports

async function initializeFirebase(env) {
  const firebaseConfig = {
    apiKey: env.FIREBASE_API_KEY || '',
    authDomain: 'lingo-legacy-production.firebaseapp.com',
    databaseURL: 'https://lingo-legacy-production-default-rtdb.firebaseio.com',
    projectId: 'lingo-legacy-production',
    storageBucket: 'lingo-legacy-production.appspot.com',
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: env.FIREBASE_APP_ID || '',
  };

  return firebaseConfig;
}

// Firebase API Gateway for Cloudflare Worker
async function firebaseAPI(request, env, path) {
  const firebaseConfig = await initializeFirebase(env);

  // Realtime Database endpoints
  if (path.startsWith('/api/firebase/db/')) {
    const dbPath = path.replace('/api/firebase/db/', '');
    const method = request.method;

    const firebaseDbUrl = `${firebaseConfig.databaseURL}/${dbPath}.json`;

    try {
      const response = await fetch(firebaseDbUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.FIREBASE_ID_TOKEN || ''}`,
        },
        body: request.method !== 'GET' ? await request.text() : undefined,
      });

      return response;
    } catch (error) {
      return json({ ok: false, error: `Firebase API error: ${error.message}` }, 500, request, env);
    }
  }

  // Firebase Authentication endpoints
  if (path.startsWith('/api/firebase/auth/')) {
    const authPath = path.replace('/api/firebase/auth/', '');
    const body = await parseJson(request);

    const firebaseAuthUrl = `https://identitytoolkit.googleapis.com/v1/${authPath}?key=${firebaseConfig.apiKey}`;

    try {
      const response = await fetch(firebaseAuthUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      return response;
    } catch (error) {
      return json({ ok: false, error: `Firebase Auth error: ${error.message}` }, 500, request, env);
    }
  }

  return json({ ok: false, error: 'Unknown Firebase endpoint' }, 404, request, env);
}

// Export for use in worker.js
export { initializeFirebase, firebaseAPI };
