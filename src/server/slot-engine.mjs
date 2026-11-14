import { randomBytes } from 'node:crypto';

export const DEFAULT_SYMBOLS = Object.freeze(['LEGACY_LION','OBSIDIAN_BAR','SEVEN','DIAMOND','WILD']);
export const PAYLINES = Object.freeze([
  Object.freeze([1,1,1,1,1]),
  Object.freeze([0,0,0,0,0]),
  Object.freeze([2,2,2,2,2]),
  Object.freeze([0,1,2,1,0]),
  Object.freeze([2,1,0,1,2])
]);
export const DEFAULT_PAYTABLE = Object.freeze({
  LEGACY_LION:Object.freeze({3:5,4:20,5:100}),
  OBSIDIAN_BAR:Object.freeze({3:3,4:10,5:50}),
  SEVEN:Object.freeze({3:2,4:8,5:30}),
  DIAMOND:Object.freeze({3:2,4:6,5:20}),
  WILD:Object.freeze({3:0,4:0,5:0})
});
export const DEFAULT_VOLATILITY_TABLES = Object.freeze({
  low:Object.freeze({LEGACY_LION:5,OBSIDIAN_BAR:15,SEVEN:25,DIAMOND:35,WILD:5}),
  medium:Object.freeze({LEGACY_LION:5,OBSIDIAN_BAR:15,SEVEN:25,DIAMOND:35,WILD:5}),
  high:Object.freeze({LEGACY_LION:5,OBSIDIAN_BAR:15,SEVEN:25,DIAMOND:35,WILD:5})
});
export function secureRandomInt(max, readUint32 = () => randomBytes(4).readUInt32BE(0)) {
  if (!Number.isSafeInteger(max) || max < 1 || max > 0x1_0000_0000) throw new RangeError('max must be an integer from 1 to 2^32');
  if (typeof readUint32 !== 'function') throw new TypeError('readUint32 must be a function');
  const range=0x1_0000_0000, limit=range-(range%max);
  for (;;) {
    const value=readUint32();
    if (!Number.isInteger(value) || value < 0 || value >= range) throw new TypeError('random source must return an unsigned 32-bit integer');
    if (value < limit) return value % max;
  }
}
export function validateIdempotencyKey(value) {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$/.test(value);
}
export function evaluateFiveReelSpin({wagerUnits,volatility='medium',paytable=DEFAULT_PAYTABLE,readUint32}={}) {
  if (!Number.isSafeInteger(wagerUnits) || wagerUnits <= 0) throw new RangeError('wagerUnits must be a positive safe integer');
  if (!Object.hasOwn(DEFAULT_VOLATILITY_TABLES,volatility)) throw new TypeError('unsupported volatility');
  const weights=DEFAULT_VOLATILITY_TABLES[volatility];
  for (const symbol of DEFAULT_SYMBOLS) {
    const row=paytable?.[symbol];
    if (!row || [3,4,5].some(n=>!Number.isSafeInteger(row[n])||row[n]<0)) throw new TypeError('invalid paytable');
  }
  const total=Object.values(weights).reduce((a,b)=>a+b,0);
  const draw=()=>{const n=readUint32?secureRandomInt(total,readUint32):secureRandomInt(total);let x=n;for(const s of DEFAULT_SYMBOLS){x-=weights[s];if(x<0)return s;}throw new Error('weight selection failed');};
  const matrix=Array.from({length:3},()=>Array.from({length:5},draw));
  const wins=[];
  for(let i=0;i<PAYLINES.length;i++){
    const line=PAYLINES[i], first=matrix[line[0]][0];
    let matchLength=0, target=first;
    for(let c=0;c<5;c++){
      const symbol=matrix[line[c]][c];
      if(symbol===target||symbol==='WILD'||target==='WILD'){if(target==='WILD'&&symbol!=='WILD')target=symbol;matchLength++;}
      else break;
    }
    if(matchLength>=3&&target!=='WILD'){
      const multiplier=paytable[target]?.[matchLength]??0;
      const payoutUnits=wagerUnits*multiplier;
      if(!Number.isSafeInteger(payoutUnits))throw new RangeError('payout overflow');
      if(payoutUnits>0)wins.push({payline:i+1,symbol:target,matchLength,payoutUnits});
    }
  }
  const payoutUnits=wins.reduce((sum,w)=>{const next=sum+w.payoutUnits;if(!Number.isSafeInteger(next))throw new RangeError('payout overflow');return next;},0);
  return {matrix,wins,payoutUnits,paylinesEvaluated:PAYLINES.length,wagerUnits,volatility};
}
