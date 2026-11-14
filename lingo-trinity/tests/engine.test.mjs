import test from "node:test";
import assert from "node:assert/strict";
import {SYMBOLS,secureRandomInt,createGrid,evaluateGrid} from "../js/engine.js";
const seq=values=>{let index=0;return()=>values[index++]??0;};
const blank=()=>Array.from({length:3},()=>["K","Q","J","10","CHIP"]);

test("grid is three rows by five reels",()=>{const grid=createGrid(()=>0);assert.equal(grid.length,3);assert.ok(grid.every(row=>row.length===5));});
test("unbiased integer sampling rejects tail values",()=>assert.equal(secureRandomInt(10,seq([0xffffffff,7])),7));
test("weighted symbol selection returns a configured symbol",()=>assert.ok(createGrid(()=>0).flat().every(id=>SYMBOLS.some(symbol=>symbol.id===id))));
test("three, four and five matching symbols pay left to right",()=>{for(const count of [3,4,5]){const row=Array.from({length:5},(_,i)=>i<count?"A":"K");const grid=[row,...blank().slice(1)];assert.equal(evaluateGrid(grid,10).payout,10*SYMBOLS[0].pays[count]);}});
test("all three horizontal paylines are evaluated and summed",()=>{const grid=[["A","A","A","K","Q"],["K","K","K","Q","J"],["Q","Q","Q","J","10"]];assert.equal(evaluateGrid(grid,10).payout,120);assert.equal(evaluateGrid(grid,10).wins.length,3);});
test("WILD substitutes for a pay symbol",()=>{const grid=[["A","WILD","A","WILD","A"],...blank().slice(1)];assert.equal(evaluateGrid(grid,2).payout,36);});
test("three SCATTER symbols award the demo bonus",()=>{const grid=[["SCATTER","A","K","Q","J"],["10","SCATTER","CHIP","DICE","K"],["Q","J","SCATTER","10","A"]];assert.equal(evaluateGrid(grid,5).payout,40);});
test("MULT doubles a winning spin",()=>{const grid=[["A","A","A","K","Q"],["K","Q","J","10","CHIP"],["Q","J","10","CHIP","MULT"]];assert.equal(evaluateGrid(grid,10).payout,60);});
test("MULT does not award credits without a line win",()=>{const grid=[["A","K","Q","J","10"],["K","Q","J","10","CHIP"],["Q","J","10","CHIP","MULT"]];assert.equal(evaluateGrid(grid,10).payout,0);});
test("invalid grids, bets and payout overflow fail closed",()=>{assert.throws(()=>evaluateGrid([],10),TypeError);assert.throws(()=>evaluateGrid(blank(),0),RangeError);assert.throws(()=>evaluateGrid([["A"]],10),TypeError);const grid=Array.from({length:3},()=>Array(5).fill("A"));assert.throws(()=>evaluateGrid(grid,Number.MAX_SAFE_INTEGER),RangeError);});
