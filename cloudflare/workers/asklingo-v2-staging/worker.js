let signingKeys = null;
let signingKeysExpiresAt = 0;
const MAX_BODY_BYTES = 4096;
const MAX_MESSAGE_CHARS = 2000;
const RATE_LIMIT_PER_MINUTE = 20;
const KEY_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
function response(body, status, requestId, origin) {
  const h = new Headers(headers); h.set('Content-Type','application/json; charset=utf-8');
  h.set('X-Request-ID', requestId);
  if (origin) { h.set('Access-Control-Allow-Origin', origin); h.set('Vary','Origin'); }
  return new Response(status===204 ? null : JSON.stringify(body), { status, headers:h });
}
function decodePart(value) {
  const normalized = value.replace(/-/g,'+').replace(/_/g,'/');
  return Uint8Array.from(atob(normalized.padEnd(Math.ceil(normalized.length/4)*4,'=')), c => c.charCodeAt(0));
}
function decodeJson(value) { return JSON.parse(new TextDecoder().decode(decodePart(value))); }
async function getSigningKeys() {
  if (signingKeys && Date.now() < signingKeysExpiresAt) return signingKeys;
  const result = await fetch(KEY_URL, { headers:{ Accept:'application/json' } });
  if (!result.ok) throw new Error('identity_key_service_unavailable');
  const body = await result.json();
  if (!Array.isArray(body.keys) || body.keys.length === 0) throw new Error('identity_keys_missing');
  const cache = result.headers.get('cache-control') || '';
  const maxAge = Number((cache.match(/max-age=(\d+)/i) || [])[1] || 300);
  signingKeys = body.keys; signingKeysExpiresAt = Date.now() + Math.max(60, Math.min(maxAge,3600))*1000;
  return signingKeys;
}
async function verifyFirebaseToken(token, projectId) {
  const parts = token.split('.'); if (parts.length !== 3) throw new Error('invalid_token');
  const header = decodeJson(parts[0]); const claims = decodeJson(parts[1]);
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw new Error('invalid_token');
  const now = Math.floor(Date.now()/1000);
  const issuer = 'https://securetoken.google.com/' + projectId;
  if (claims.iss !== issuer || claims.aud !== projectId || typeof claims.sub !== 'string' || claims.sub.length === 0 || claims.sub.length > 128) throw new Error('invalid_token');
  if (!Number.isFinite(claims.exp) || claims.exp <= now || !Number.isFinite(claims.iat) || claims.iat > now+60 || now-claims.iat > 3600) throw new Error('invalid_token');
  if (!Number.isFinite(claims.auth_time) || claims.auth_time > now+60) throw new Error('invalid_token');
  const jwk = (await getSigningKeys()).find(k => k.kid === header.kid && k.kty === 'RSA' && k.use === 'sig');
  if (!jwk) throw new Error('invalid_token');
  const key = await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decodePart(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));
  if (!valid) throw new Error('invalid_token');
  return { uid:claims.sub, issuer:issuer };
}
async function audit(db, event) {
  await db.prepare('INSERT INTO audit_events (event_id,tenant_id,actor_principal_id,actor_type,event_type,resource_type,resource_id,action_digest,decision,correlation_id,occurred_at,metadata_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(crypto.randomUUID(),event.tenantId || 'unresolved',event.principalId || null,'user',event.type,'assistant','query',null,event.decision,event.requestId,Math.floor(Date.now()/1000),JSON.stringify({reason:event.reason || 'none',surface:event.surface || 'unknown'})).run();
}
function configuredOrigins(env) { return new Set(String(env.ASKLINGO_ALLOWED_ORIGINS || '').split(',').map(x=>x.trim()).filter(Boolean)); }
export default {
  async fetch(request, env) {
    const requestId = crypto.randomUUID(); const url = new URL(request.url);
    const origin = request.headers.get('Origin'); const allowed = configuredOrigins(env);
    if (request.method === 'OPTIONS') {
      if (!origin || !allowed.has(origin)) return response({error:'origin_not_allowed',request_id:requestId},403,requestId);
      const r = response({},204,requestId,origin); r.headers.set('Access-Control-Allow-Methods','POST, OPTIONS'); r.headers.set('Access-Control-Allow-Headers','Authorization, Content-Type'); r.headers.set('Access-Control-Max-Age','600'); return r;
    }
    if (origin && !allowed.has(origin)) return response({error:'origin_not_allowed',request_id:requestId},403,requestId);
    if (url.pathname === '/_health' && request.method === 'GET') {
      const ready = Boolean(env.ASKLINGO_DB && env.FIREBASE_PROJECT_ID);
      return response({service:'askLINGO',environment:'staging',state:'authorization_preflight_only',identity_configured:Boolean(env.FIREBASE_PROJECT_ID),database_bound:Boolean(env.ASKLINGO_DB),inference:false,conversation_persistence:false,operational_actions:false,ready_for_query:false,request_id:requestId},ready?200:503,requestId,origin);
    }
    if (url.pathname !== '/api/v1/ask-lingo/query') return response({error:'not_found',request_id:requestId},404,requestId,origin);
    if (request.method !== 'POST') return response({error:'method_not_allowed',request_id:requestId},405,requestId,origin);
    const type = (request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (type !== 'application/json') return response({error:'unsupported_media_type',request_id:requestId},415,requestId,origin);
    const length = Number(request.headers.get('content-length') || 0);
    if (length > MAX_BODY_BYTES) return response({error:'payload_too_large',request_id:requestId},413,requestId,origin);
    let raw; try { raw=await request.text(); } catch { return response({error:'invalid_json',request_id:requestId},400,requestId,origin); }
    if (new TextEncoder().encode(raw).byteLength>MAX_BODY_BYTES) return response({error:'payload_too_large',request_id:requestId},413,requestId,origin);
    let body; try { body=JSON.parse(raw); } catch { return response({error:'invalid_json',request_id:requestId},400,requestId,origin); }
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(k=>!['message','surface','conversation_id','locale'].includes(k)) || typeof body.message !== 'string' || body.message.trim().length===0 || body.message.length>MAX_MESSAGE_CHARS || !['web','mobile','studio'].includes(body.surface || 'web') || (body.locale !== undefined && (typeof body.locale!=='string' || body.locale.length>35)) || (body.conversation_id !== undefined && body.conversation_id !== null))
      return response({error:'invalid_request',request_id:requestId},400,requestId,origin);
    if (!env.ASKLINGO_DB || !env.FIREBASE_PROJECT_ID) return response({error:'identity_or_database_not_configured',request_id:requestId},503,requestId,origin);
    const auth = request.headers.get('Authorization') || ''; const match=auth.match(/^Bearer\s+(.+)$/i);
    if (!match) return response({error:'unauthorized',request_id:requestId},401,requestId,origin);
    let identity; try { identity=await verifyFirebaseToken(match[1],String(env.FIREBASE_PROJECT_ID)); } catch (error) { const unavailable=['identity_key_service_unavailable','identity_keys_missing'].includes(error?.message); return response({error:unavailable?'identity_verification_unavailable':'unauthorized',request_id:requestId},unavailable?503:401,requestId,origin); }
    const db=env.ASKLINGO_DB; const now=Math.floor(Date.now()/1000);
    const principal=await db.prepare("SELECT principal_id,tenant_id FROM principals WHERE issuer=? AND subject=? AND status='active' LIMIT 1").bind(identity.issuer,identity.uid).first();
    if (!principal) { try { await audit(db,{requestId,type:'query.authorization_denied',decision:'deny',reason:'principal_missing',surface:body.surface}); } catch { return response({error:'audit_unavailable',request_id:requestId},503,requestId,origin); } return response({error:'forbidden',request_id:requestId},403,requestId,origin); }
    const grant=await db.prepare("SELECT grant_id FROM grants WHERE principal_id=? AND tenant_id=? AND product_id='asklingo' AND resource_type='assistant' AND resource_id='query' AND operation='query' AND environment='staging' AND status='active' AND not_before<=? AND expires_at>? AND revoked_at IS NULL LIMIT 1").bind(principal.principal_id,principal.tenant_id,now,now).first();
    if (!grant) { try { await audit(db,{requestId,principalId:principal.principal_id,tenantId:principal.tenant_id,type:'query.authorization_denied',decision:'deny',reason:'scoped_grant_missing',surface:body.surface}); } catch { return response({error:'audit_unavailable',request_id:requestId},503,requestId,origin); } return response({error:'forbidden',request_id:requestId},403,requestId,origin); }
    const windowStart=Math.floor(now/60)*60;
    const bucket=await db.prepare('INSERT INTO rate_limit_buckets (principal_id,route_key,window_start,request_count,updated_at) VALUES (?, ?, ?, 1, ?) ON CONFLICT(principal_id,route_key,window_start) DO UPDATE SET request_count=request_count+1,updated_at=excluded.updated_at RETURNING request_count').bind(principal.principal_id,'asklingo.query',windowStart,now).first();
    if (!bucket || bucket.request_count>RATE_LIMIT_PER_MINUTE) { try { await audit(db,{requestId,principalId:principal.principal_id,tenantId:principal.tenant_id,type:'query.rate_limited',decision:'deny',reason:'rate_limit',surface:body.surface}); } catch { return response({error:'audit_unavailable',request_id:requestId},503,requestId,origin); } return response({error:'rate_limited',request_id:requestId},429,requestId,origin); }
    try { await audit(db,{requestId,principalId:principal.principal_id,tenantId:principal.tenant_id,type:'query.blocked',decision:'deny',reason:'provider_and_privacy_gate_pending',surface:body.surface}); }
    catch { return response({error:'audit_unavailable',request_id:requestId},503,requestId,origin); }
    return response({error:'service_not_enabled',code:'PROVIDER_AND_PRIVACY_GATE_PENDING',request_id:requestId},503,requestId,origin);
  }
}