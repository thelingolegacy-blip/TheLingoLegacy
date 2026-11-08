const UINT32_RANGE = 0x1_0000_0000;
export const PAYLINES = Object.freeze([Object.freeze([1,1,1,1,1]),Object.freeze([0,0,0,0,0]),Object.freeze([2,2,2,2,2]),Object.freeze([0,1,2,1,0]),Object.freeze([2,1,0,1,2])]);
export const DEFAULT_SYMBOLS = Object.freeze(['LEGACY_LION','ELECTRIC_GOLD','CRIMSON_CROWN','OBSIDIAN_BAR','SEVEN','WILD']);
export const DEFAULT_VOLATILITY_TABLES = Object.freeze({
 low:Object.freeze({LEGACY_LION:18,ELECTRIC_GOLD:18,CRIMSON_CROWN:18,OBSIDIAN_BAR:18,SEVEN:18,WILD:10}),
 medium:Object.freeze({LEGACY_LION:24,ELECTRIC_GOLD:22,CRIMSON_CROWN:18,OBSIDIAN_BAR:16,SEVEN:12,WILD:8}),
 high:Object.freeze({LEGACY_LION:30,ELECTRIC_GOLD:24,CRIMSON_CROWN:18,OBSIDIAN_BAR:12,SEVEN:10,WILD:6}),
});
export const DEFAULT_PAYTABLE = Object.freeze({
 LEGACY_LION:Object.freeze({3:5,4:15,5:50}),ELECTRIC_GOLD:Object.freeze({3:4,4:12,5:35}),CRIMSON_CROWN:Object.freeze({3:3,4:10,5:25}),OBSIDIAN_BAR:Object.freeze({3:2,4:8,5:20}),SEVEN:Object.freeze({3:2,4:8,5:20}),WILD:Object.freeze({3:8,4:25,5:80}),
});
export function secureRandomInt(maxExclusive,readUint32=readCryptoUint32){
 if(!Number.isSafeInteger(maxExclusive)||maxExclusive<1||maxExclusive>UINT32_RANGE)throw new RangeError('maxExclusive must be an integer from 1 through 2^32');if(maxExclusive===1)return 0;
 const limit=Math.floor(UINT32_RANGE/maxExclusive)*maxExclusive;for(let i=0;i<128;i++){const n=readUint32();if(!Number.isInteger(n)||n<0||n>=UINT32_RANGE)throw new TypeError('random source must return an unsigned 32-bit integer');if(n<limit)return n%maxExclusive;}throw new Error('SECURE_RANDOM_SOURCE_STALLED');
}
function readCryptoUint32(){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0];}
function validateSymbols(symbols){if(!Array.isArray(symbols)||symbols.length<1||symbols.length>256||symbols.some(s=>typeof s!=='string'||!s||s.length>64))throw new TypeError('symbols must be a non-empty array of symbol identifiers');if(new Set(symbols).size!==symbols.length)throw new TypeError('symbols must be unique');}
function weightedSymbol(weights,readUint32){const entries=Object.entries(weights);if(!entries.length)throw new TypeError('volatility weights must not be empty');let total=0;for(const [symbol,w] of entries){if(!symbol||!Number.isSafeInteger(w)||w<1)throw new TypeError('volatility weights must be positive integers');total+=w;if(!Number.isSafeInteger(total)||total>UINT32_RANGE)throw new RangeError('volatility weight total is invalid');}let cursor=secureRandomInt(total,readUint32);for(const [symbol,w] of entries){if(cursor<w)return symbol;cursor-=w;}throw new Error('WEIGHTED_SYMBOL_SELECTION_FAILED');}
function validatePaytable(paytable,symbols){if(!paytable||typeof paytable!=='object'||Array.isArray(paytable))throw new TypeError('paytable must map symbols to integer multipliers');for(const s of symbols){const row=paytable[s];if(!row||typeof row!=='object')throw new TypeError(`missing paytable for ${s}`);for(const n of [3,4,5])if(!Number.isSafeInteger(row[n])||row[n]<0)throw new TypeError(`invalid integer multiplier for ${s} match length ${n}`);}}
function evaluateLine(matrix,line,paytable){const values=line.map((r,c)=>matrix[r][c]);const candidates=values[0]==='WILD'?[...new Set(values.filter(s=>s!=='WILD')),'WILD']:[values[0]];let best=null;for(const symbol of candidates){let count=0;for(let c=0;c<5;c++){if(values[c]!==symbol&&values[c]!=='WILD')break;count++;}if(count<3)continue;const multiplier=paytable[symbol]?.[count]??0;if(!best||multiplier>best.multiplier)best={symbol,matchLength:count,multiplier};}return best;}
export function evaluateFiveReelSpin({symbols=DEFAULT_SYMBOLS,volatility='medium',volatilityTables=DEFAULT_VOLATILITY_TABLES,paytable=DEFAULT_PAYTABLE,wagerUnits,readUint32=readCryptoUint32}){
 validateSymbols(symbols);if(!Number.isSafeInteger(wagerUnits)||wagerUnits<1)throw new RangeError('wagerUnits must be a positive safe integer');
 const weights=typeof volatility==='string'?volatilityTables?.[volatility]:volatility;if(!weights||typeof weights!=='object'||Array.isArray(weights))throw new TypeError('unknown volatility table');
 if(Object.keys(weights).some(s=>!symbols.includes(s)))throw new TypeError('volatility table contains an unknown symbol');
 for(const s of symbols)if(!Object.hasOwn(weights,s))throw new TypeError(`missing volatility weight for ${s}`);
 validatePaytable(paytable,symbols);const matrix=Array.from({length:3},()=>Array.from({length:5},()=>weightedSymbol(weights,readUint32)));const wins=[];let totalMultiplier=0;
 for(let i=0;i<PAYLINES.length;i++){const match=evaluateLine(matrix,PAYLINES[i],paytable);if(!match)continue;const linePayout=wagerUnits*match.multiplier;if(!Number.isSafeInteger(linePayout))throw new RangeError('line payout exceeds safe integer range');totalMultiplier+=match.multiplier;if(!Number.isSafeInteger(totalMultiplier))throw new RangeError('total payout multiplier exceeds safe integer range');wins.push({payline:i+1,symbol:match.symbol,matchLength:match.matchLength,multiplier:match.multiplier,payoutUnits:linePayout});}
 const payoutUnits=wagerUnits*totalMultiplier;if(!Number.isSafeInteger(payoutUnits))throw new RangeError('total payout exceeds safe integer range');
 return Object.freeze({matrix:Object.freeze(matrix.map(r=>Object.freeze(r))),wagerUnits,payoutUnits,netDeltaUnits:payoutUnits-wagerUnits,isWin:wins.length>0,wins:Object.freeze(wins),volatility:typeof volatility==='string'?volatility:'custom',paylinesEvaluated:PAYLINES.length});
}
export function validateIdempotencyKey(value){return typeof value==='string'&&/^[A-Za-z0-9._:-]{16,128}$/.test(value);}
