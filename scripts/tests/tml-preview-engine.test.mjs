import assert from 'node:assert/strict';
import test from 'node:test';
import {PAYLINES,calculateLineStakeAllocation,generateGrid,evaluateSpin} from '../../thats-my-lingo/tml-preview-engine.mjs';
const symbols=[
 {id:'A',weight:15,pays:{3:3,4:8,5:18}},
 {id:'K',weight:14,pays:{3:4,4:10,5:24}},
 {id:'Q',weight:13,pays:{3:5,4:12,5:30}},
 {id:'J',weight:12,pays:{3:6,4:16,5:42}},
 {id:'10',weight:11,pays:{3:7,4:18,5:50}},
 {id:'CHIP',weight:8,pays:{3:8,4:22,5:60}},
 {id:'DICE',weight:6,pays:{3:10,4:30,5:80}},
 {id:'WILD',weight:5,wild:true},
 {id:'SCATTER',weight:4,scatter:true},
 {id:'MULT',weight:3,multiplier:2}
];
const allA=()=>Array.from({length:3},()=>Array(5).fill('A'));
test('defines twenty unique paylines within a 5x3 matrix',()=>{assert.equal(PAYLINES.length,20);assert.equal(new Set(PAYLINES.map(line=>line.join(','))).size,20);for(const line of PAYLINES){assert.equal(line.length,5);assert.ok(line.every(row=>row>=0&&row<3));}});
test('allocates total spin stake using active payline count',()=>{assert.deepEqual(calculateLineStakeAllocation(400,20),{wagerUnits:400,activePaylines:20,lineStakeUnits:20,remainderUnits:0});assert.equal(calculateLineStakeAllocation(100,5).lineStakeUnits,20);});
test('rejects non-zero remainder explicitly without rounding',()=>{assert.throws(()=>calculateLineStakeAllocation(401,20),/remainderUnits=1/);});
test('evaluates active paylines and sums integer line payouts',()=>{const r=evaluateSpin({grid:allA(),symbols,wagerUnits:400,activePaylines:20});assert.equal(r.lineStakeUnits,20);assert.equal(r.wins.length,20);assert.equal(r.basePayoutUnits,20*20*18);assert.equal(r.payoutUnits,r.basePayoutUnits);assert.ok(r.winningCells.length>0);});
test('variable active paylines evaluate only the selected first N lines',()=>{const r=evaluateSpin({grid:allA(),symbols,wagerUnits:100,activePaylines:5});assert.equal(r.activePaylines,5);assert.equal(r.wins.length,5);assert.equal(r.lineStakeUnits,20);});
test('applies feature multiplier once after line payout aggregation',()=>{const base=evaluateSpin({grid:allA(),symbols,wagerUnits:400,activePaylines:20});const boosted=evaluateSpin({grid:allA(),symbols,wagerUnits:400,activePaylines:20,featureMultiplier:2});assert.equal(boosted.basePayoutUnits,base.payoutUnits);assert.equal(boosted.payoutUnits,base.payoutUnits*2);});
test('scatter detection is recorded but no unapproved scatter award is paid',()=>{const grid=allA();grid[0][0]='SCATTER';grid[1][1]='SCATTER';grid[2][2]='SCATTER';const r=evaluateSpin({grid,symbols,wagerUnits:400,activePaylines:20});assert.equal(r.scatterCount,3);assert.equal(r.scatterAwardUnits,0);assert.equal(r.scatterRulesPending,true);});
test('generates a 3x5 weighted grid with deterministic random input',()=>{const grid=generateGrid({symbols,random:()=>0});assert.equal(grid.length,3);assert.ok(grid.every(row=>row.length===5));assert.ok(grid.flat().every(value=>value==='A'));});
test('rejects invalid active lines, wagers, feature multipliers and random samples',()=>{assert.throws(()=>calculateLineStakeAllocation(100,0),RangeError);assert.throws(()=>calculateLineStakeAllocation(100,21),RangeError);assert.throws(()=>evaluateSpin({grid:allA(),symbols,wagerUnits:100,activePaylines:5,featureMultiplier:1.5}),RangeError);assert.throws(()=>generateGrid({symbols,random:()=>1}),RangeError);});
