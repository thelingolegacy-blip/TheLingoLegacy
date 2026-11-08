import { evaluateFiveReelSpin, validateIdempotencyKey, PAYLINES } from './slot-engine.mjs';
export function lineWagerFromTotalSpinWager(totalWagerUnits){if(!Number.isSafeInteger(totalWagerUnits)||totalWagerUnits<1||totalWagerUnits%PAYLINES.length!==0)throw new RangeError('total wager must be a positive integer multiple of the five paylines');return totalWagerUnits/PAYLINES.length;}
const safeId=(v,f)=>{if(typeof v!=='string'||v.length<1||v.length>128)throw new TypeError(`${f} is invalid`);return v;};
const SESSION_SELECT=`SELECT session_id,game_id,rule_version,reels_json,wager_units,payout_units,status,balance_after_units FROM lingo_game_sessions WHERE firebase_uid=? AND idempotency_key=?`;
function restoreOutcome(row){let stored;try{stored=JSON.parse(row.reels_json);}catch{stored=null;}if(Array.isArray(stored))return{matrix:stored,wins:[],volatility:'legacy',xpAwardUnits:0,replayed:true};return{matrix:stored?.matrix??[],wins:stored?.wins??[],volatility:stored?.volatility??'legacy',xpAwardUnits:stored?.xpAwardUnits??0,replayed:true};}
function assertSameRequest(row,gameId,ruleVersion,wagerUnits,volatility){
 const outcome=restoreOutcome(row);
 if(row.game_id!==gameId||row.rule_version!==ruleVersion||row.wager_units!==wagerUnits
   ||(volatility!==undefined&&outcome.volatility!==volatility))throw new Error('IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST');
 if(row.status!=='settled'||!Number.isSafeInteger(row.balance_after_units))throw new Error('IDEMPOTENT_SESSION_NOT_SETTLED');
 return {...row,...outcome};
}
export async function playAndSettleD1Spin(db,{firebaseUid,gameId,idempotencyKey,ruleVersion,symbols,volatility,wagerUnits}){
 safeId(firebaseUid,'firebaseUid');safeId(gameId,'gameId');safeId(ruleVersion,'ruleVersion');const lineWagerUnits=lineWagerFromTotalSpinWager(wagerUnits);if(!validateIdempotencyKey(idempotencyKey))throw new TypeError('idempotencyKey is invalid');
 const prior=await db.prepare(SESSION_SELECT).bind(firebaseUid,idempotencyKey).first();if(prior){const replay=assertSameRequest(prior,gameId,ruleVersion,wagerUnits,volatility);const wallet=await db.prepare('SELECT credits_units,xp_units FROM lingo_game_wallets WHERE firebase_uid=?').bind(firebaseUid).first();if(!wallet)throw new Error('SPIN_WALLET_NOT_VERIFIED');return {...replay,xpUnits:wallet.xp_units,xpAwardUnits:0};}
 const outcome=evaluateFiveReelSpin({symbols,volatility,wagerUnits:lineWagerUnits});const xpAwardUnits=25+(outcome.payoutUnits>0?75:0);const sessionId=crypto.randomUUID();
 const insert=db.prepare(`INSERT INTO lingo_game_sessions(session_id,firebase_uid,game_id,idempotency_key,rule_version,reels_json,wager_units,payout_units,status) VALUES(?,?,?,?,?,?,?,?,'pending')`).bind(sessionId,firebaseUid,gameId,idempotencyKey,ruleVersion,JSON.stringify({ matrix: outcome.matrix, wins: outcome.wins, volatility: outcome.volatility, xpAwardUnits }),wagerUnits,outcome.payoutUnits);
 const debit=db.prepare(`INSERT INTO lingo_wallet_ledger(event_id,session_id,firebase_uid,event_type,delta_units) VALUES(?,?,?,'slot_wager_debit',?)`).bind(`${sessionId}:debit`,sessionId,firebaseUid,-wagerUnits);
 const statements=[insert,debit];if(outcome.payoutUnits>0)statements.push(db.prepare(`INSERT INTO lingo_wallet_ledger(event_id,session_id,firebase_uid,event_type,delta_units) VALUES(?,?,?,'slot_payout_credit',?)`).bind(`${sessionId}:payout`,sessionId,firebaseUid,outcome.payoutUnits));
 statements.push(db.prepare(`UPDATE lingo_game_sessions SET status='settled',balance_after_units=(SELECT credits_units FROM lingo_game_wallets WHERE firebase_uid=?) WHERE session_id=? AND firebase_uid=? AND status='pending'`).bind(firebaseUid,sessionId,firebaseUid));
 statements.push(db.prepare(`UPDATE lingo_game_wallets SET xp_units=xp_units+?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE firebase_uid=?`).bind(xpAwardUnits,firebaseUid));
 statements.push(db.prepare(`UPDATE lingo_game_progression SET xp_units=xp_units+?,level=CAST((xp_units+?)/250 AS INTEGER)+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE firebase_uid=?`).bind(xpAwardUnits,xpAwardUnits,firebaseUid));
 try{await db.batch(statements);}catch(error){const existing=await db.prepare(SESSION_SELECT).bind(firebaseUid,idempotencyKey).first();if(existing){const replay=assertSameRequest(existing,gameId,ruleVersion,wagerUnits,volatility);const wallet=await db.prepare('SELECT credits_units,xp_units FROM lingo_game_wallets WHERE firebase_uid=?').bind(firebaseUid).first();if(!wallet)throw new Error('SPIN_WALLET_NOT_VERIFIED');return {...replay,xpUnits:wallet.xp_units,xpAwardUnits:0};}throw error;}
 const result=await db.prepare(`SELECT session_id,game_id,rule_version,reels_json,wager_units,payout_units,status,balance_after_units FROM lingo_game_sessions WHERE session_id=? AND firebase_uid=?`).bind(sessionId,firebaseUid).first();
 if(!result||result.status!=='settled'||!Number.isSafeInteger(result.balance_after_units))throw new Error('SPIN_SETTLEMENT_NOT_VERIFIED');
 const wallet=await db.prepare('SELECT credits_units,xp_units FROM lingo_game_wallets WHERE firebase_uid=?').bind(firebaseUid).first();if(!wallet)throw new Error('SPIN_WALLET_NOT_VERIFIED');
 return {...result,matrix:outcome.matrix,wins:outcome.wins,volatility:outcome.volatility,xpUnits:wallet.xp_units,xpAwardUnits,replayed:false};
}

export async function claimDailyDemoReward(db,{firebaseUid,claimDate,ruleVersion='daily-demo-reward-v1'}){
 safeId(firebaseUid,'firebaseUid');
 if(typeof claimDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(claimDate))throw new TypeError('claimDate must be a UTC calendar date');
 const idempotencyKey='daily-demo-reward-'+claimDate,gameId='system-daily-reward',wagerUnits=1,rewardUnits=500,xpAwardUnits=150;
 const prior=await db.prepare(SESSION_SELECT).bind(firebaseUid,idempotencyKey).first();
 let result,replayed=Boolean(prior);
 if(prior){result=assertSameRequest(prior,gameId,ruleVersion,wagerUnits);}
 else{
  const sessionId=crypto.randomUUID();
  const statements=[
   db.prepare("INSERT INTO lingo_game_sessions(session_id,firebase_uid,game_id,idempotency_key,rule_version,reels_json,wager_units,payout_units,status) VALUES(?,?,?,?,?,?,?,?,'pending')").bind(sessionId,firebaseUid,gameId,idempotencyKey,ruleVersion,JSON.stringify({kind:'daily_demo_reward',claimDate,rewardUnits,xpAwardUnits,redeemable:false}),wagerUnits,rewardUnits),
   db.prepare("INSERT INTO lingo_wallet_ledger(event_id,session_id,firebase_uid,event_type,delta_units) VALUES(?,?,?,'admin_adjustment',?)").bind(sessionId+':daily-reward',sessionId,firebaseUid,rewardUnits),
   db.prepare("UPDATE lingo_game_sessions SET status='settled',balance_after_units=(SELECT credits_units FROM lingo_game_wallets WHERE firebase_uid=?) WHERE session_id=? AND firebase_uid=? AND status='pending'").bind(firebaseUid,sessionId,firebaseUid),
   db.prepare("UPDATE lingo_game_wallets SET xp_units=xp_units+?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE firebase_uid=?").bind(xpAwardUnits,firebaseUid),
   db.prepare("UPDATE lingo_game_progression SET xp_units=xp_units+?,level=CAST((xp_units+?)/250 AS INTEGER)+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE firebase_uid=?").bind(xpAwardUnits,xpAwardUnits,firebaseUid)
  ];
  try{await db.batch(statements);}catch(error){const existing=await db.prepare(SESSION_SELECT).bind(firebaseUid,idempotencyKey).first();if(existing){result=assertSameRequest(existing,gameId,ruleVersion,wagerUnits);replayed=true;}else throw error;}
  if(!result){result=await db.prepare(SESSION_SELECT).bind(firebaseUid,idempotencyKey).first();if(!result||result.status!=='settled'||!Number.isSafeInteger(result.balance_after_units))throw new Error('DAILY_REWARD_SETTLEMENT_NOT_VERIFIED');}
 }
 const wallet=await db.prepare('SELECT credits_units,xp_units FROM lingo_game_wallets WHERE firebase_uid=?').bind(firebaseUid).first();
 if(!wallet||!Number.isSafeInteger(wallet.credits_units)||!Number.isSafeInteger(wallet.xp_units))throw new Error('DAILY_REWARD_WALLET_NOT_VERIFIED');
 return {session_id:result.session_id,claimDate,rewardUnits:replayed?0:rewardUnits,xpAwardUnits:replayed?0:xpAwardUnits,newBalanceUnits:wallet.credits_units,xpUnits:wallet.xp_units,replayed};
}
