import { verifyFirebaseIdToken } from '../../src/auth/firebase-id-token.mjs';
import { playAndSettleD1Spin, claimDailyDemoReward } from '../../src/server/d1-slot-service.mjs';
import { validateIdempotencyKey, PAYLINES } from '../../src/server/slot-engine.mjs';
const RULE_VERSION='staging-5x3-demo-v3',MAX_WAGER_UNITS=5000,VOLATILITY_LEVELS=new Set(['low','medium','high']);
function corsHeaders(request,env){const origin=request.headers.get('Origin');const allowed=String(env.STAGING_ALLOWED_ORIGINS||'').split(',').map(v=>v.trim()).filter(Boolean);if(!origin||!allowed.includes(origin))return{};return{'access-control-allow-origin':origin,'access-control-allow-methods':'GET, POST, OPTIONS','access-control-allow-headers':'Authorization, Content-Type, Idempotency-Key','access-control-max-age':'600','vary':'Origin'};}
function json(body,status=200,request,env){return new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...corsHeaders(request,env)}});}
export function bearerTokenFromRequest(request){const h=request.headers.get('authorization')||'';const m=/^Bearer\s+([^\s]+)$/i.exec(h);return m?.[1]||null;}
export async function consumeApiRateLimit(db,firebaseUid,nowMs=Date.now()){if(typeof firebaseUid!=='string'||!firebaseUid||!Number.isFinite(nowMs))throw new TypeError('rate-limit identity or clock is invalid');const windowEpoch=Math.floor(nowMs/60000);const row=await db.prepare(`INSERT INTO lingo_api_rate_limits(firebase_uid,window_epoch,request_count) VALUES(?,?,1) ON CONFLICT(firebase_uid) DO UPDATE SET window_epoch=excluded.window_epoch,request_count=CASE WHEN lingo_api_rate_limits.window_epoch=excluded.window_epoch THEN lingo_api_rate_limits.request_count+1 ELSE 1 END,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') RETURNING request_count`).bind(firebaseUid,windowEpoch).first();if(!Number.isSafeInteger(row?.request_count)||row.request_count<1)throw new Error('RATE_LIMIT_STATE_UNAVAILABLE');return row.request_count<=60;}

async function uidFromRequest(request,env){
 if(env.ENVIRONMENT!=='staging'||!env.FIREBASE_PROJECT_ID||env.FIREBASE_PROJECT_ID==='lingo-legacy-production')return null;
 const token=bearerTokenFromRequest(request);if(!token)return null;const verified=await verifyFirebaseIdToken(token,env.FIREBASE_PROJECT_ID);return verified.ok?verified.uid:null;
}
const WELCOME_DEMO_COIN_GRANT_UNITS=5000,WELCOME_GRANT_RULE_VERSION='welcome-demo-coin-v1';
async function ensureAccount(db,uid){const grantSessionId='welcome-grant:'+uid;await db.batch([
 db.prepare('INSERT OR IGNORE INTO lingo_game_accounts(firebase_uid) VALUES (?)').bind(uid),
 db.prepare('INSERT OR IGNORE INTO lingo_game_wallets(firebase_uid) VALUES (?)').bind(uid),
 db.prepare('INSERT OR IGNORE INTO lingo_game_progression(firebase_uid) VALUES (?)').bind(uid),
 db.prepare("INSERT OR IGNORE INTO lingo_game_sessions(session_id,firebase_uid,game_id,idempotency_key,rule_version,reels_json,wager_units,payout_units,status) VALUES(?,?,'system-demo-coin-grant','welcome-demo-coin-grant-v1',?,?,?,?,'pending')").bind(grantSessionId,uid,WELCOME_GRANT_RULE_VERSION,JSON.stringify({kind:'welcome_demo_coin_grant',grantUnits:WELCOME_DEMO_COIN_GRANT_UNITS,redeemable:false}),WELCOME_DEMO_COIN_GRANT_UNITS,WELCOME_DEMO_COIN_GRANT_UNITS),
 db.prepare("INSERT OR IGNORE INTO lingo_wallet_ledger(event_id,session_id,firebase_uid,event_type,delta_units) VALUES(?,?,?,'admin_adjustment',?)").bind(grantSessionId,grantSessionId,uid,WELCOME_DEMO_COIN_GRANT_UNITS),
 db.prepare("UPDATE lingo_game_sessions SET status='settled',balance_after_units=(SELECT credits_units FROM lingo_game_wallets WHERE firebase_uid=?) WHERE session_id=? AND firebase_uid=? AND status='pending'").bind(uid,grantSessionId,uid)
]);}
export default {async fetch(request,env){
 const url=new URL(request.url);const respond=(body,status=200)=>json(body,status,request,env);if(request.method==='OPTIONS'){const headers=corsHeaders(request,env);return new Response(null,{status:headers['access-control-allow-origin']?204:403,headers});}
 if(url.pathname==='/healthz'&&request.method==='GET'){try{const check=await env.DB.prepare('SELECT 1 AS ok').first();const tables=await env.DB.prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table'").first();return respond({status:check?.ok===1?'ok':'degraded',environment:env.ENVIRONMENT,database:'connected',tableCount:tables?.count??0,rulesVersion:RULE_VERSION});}catch{return respond({status:'degraded',environment:env.ENVIRONMENT,database:'unavailable'},503);}}
 if(!['/api/v1/accounts/bootstrap','/api/v1/wallet/balance','/api/v1/slots/spin','/api/v1/rewards/daily'].includes(url.pathname))return respond({error:'NOT_FOUND'},404);
 const uid=await uidFromRequest(request,env);if(!uid)return respond({error:'UNAUTHORIZED'},401);
 try{
  if(!await consumeApiRateLimit(env.DB,uid))return respond({error:'RATE_LIMITED',limit:60,windowSeconds:60,retryAfterSeconds:60-(Math.floor(Date.now()/1000)%60)},429);
  if(url.pathname==='/api/v1/accounts/bootstrap'){if(request.method!=='POST')return respond({error:'METHOD_NOT_ALLOWED'},405);await ensureAccount(env.DB,uid);const wallet=await env.DB.prepare('SELECT credits_units,xp_units FROM lingo_game_wallets WHERE firebase_uid=?').bind(uid).first();return respond({status:'account_ready',wallet,currency:'DEMO_COIN',redeemable:false,demoCoinGrantPolicy:{initialGrantUnits:WELCOME_DEMO_COIN_GRANT_UNITS,oncePerAccount:true}});}
  if(url.pathname==='/api/v1/rewards/daily'){if(request.method!=='POST')return respond({error:'METHOD_NOT_ALLOWED'},405);await ensureAccount(env.DB,uid);const claimDate=new Date().toISOString().slice(0,10);const reward=await claimDailyDemoReward(env.DB,{firebaseUid:uid,claimDate});return respond({status:reward.replayed?'already_claimed':'claimed',claimDate,rewardUnits:reward.rewardUnits,xpAwardUnits:reward.xpAwardUnits,newBalanceUnits:reward.newBalanceUnits,xpUnits:reward.xpUnits,replayed:reward.replayed,currency:'DEMO_COIN',redeemable:false,tokenRewardAvailable:false});}
  if(url.pathname==='/api/v1/wallet/balance'){if(request.method!=='GET')return respond({error:'METHOD_NOT_ALLOWED'},405);const wallet=await env.DB.prepare('SELECT credits_units,xp_units FROM lingo_game_wallets WHERE firebase_uid=?').bind(uid).first();if(!wallet)return respond({error:'ACCOUNT_NOT_INITIALIZED'},404);return respond({creditsUnits:wallet.credits_units,xpUnits:wallet.xp_units,currency:'DEMO_COIN',redeemable:false});}
  if(request.method!=='POST')return respond({error:'METHOD_NOT_ALLOWED'},405);
  await ensureAccount(env.DB,uid);
  let body;try{body=await request.json();}catch{return respond({error:'INVALID_JSON'},400);}
  const wagerUnits=body?.wagerUnits,volatility=body?.volatility??'medium',idempotencyKey=request.headers.get('Idempotency-Key')||body?.idempotencyKey;
  if(!Number.isSafeInteger(wagerUnits)||wagerUnits<1||wagerUnits>MAX_WAGER_UNITS)return respond({error:'INVALID_WAGER',maxTotalWagerUnits:MAX_WAGER_UNITS},400);
  if(wagerUnits%PAYLINES.length!==0)return respond({error:'WAGER_MUST_COVER_ALL_PAYLINES',lineCount:PAYLINES.length},400);
  if(!VOLATILITY_LEVELS.has(volatility))return respond({error:'INVALID_VOLATILITY'},400);
  if(!validateIdempotencyKey(idempotencyKey))return respond({error:'INVALID_IDEMPOTENCY_KEY'},400);
  const result=await playAndSettleD1Spin(env.DB,{firebaseUid:uid,gameId:'thats-my-lingo',idempotencyKey,ruleVersion:RULE_VERSION,volatility,wagerUnits});
  return respond({sessionId:result.session_id,matrix:result.matrix??JSON.parse(result.reels_json),rows:3,columns:5,wins:result.wins??[],paylinesEvaluated:5,wagerUnits:result.wager_units,lineWagerUnits:result.wager_units/5,payoutUnits:result.payout_units,newBalanceUnits:result.balance_after_units,xpUnits:result.xpUnits,xpAwardUnits:result.xpAwardUnits??0,replayed:result.replayed,currency:'DEMO_COIN',redeemable:false,volatility:result.volatility??volatility,rulesVersion:result.rule_version});
 }catch(error){const m=String(error?.message||error);if(m.includes('INSUFFICIENT_FUNDS'))return respond({error:'INSUFFICIENT_FUNDS'},409);if(m.includes('IDEMPOTENCY_KEY_REUSED'))return respond({error:'IDEMPOTENCY_CONFLICT'},409);if(m.includes('IDEMPOTENT_SESSION_NOT_SETTLED'))return respond({error:'SETTLEMENT_PENDING'},409);return respond({error:'INTERNAL_ERROR'},500);}
}};
