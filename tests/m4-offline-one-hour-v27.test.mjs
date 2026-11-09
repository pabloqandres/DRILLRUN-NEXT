import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculateOfflineProduction} from '../dist/mission4/offline-progress.mjs';
const T=Date.UTC(2026,10,9,20);
const tool=(id,type,life,model)=>({id,type,model,status:'installed',lifeRemaining:life,lifeTotal:life,metersUsed:0});
function state(bitLife=350){return {
 cash:1000,nextId:10,ledger:[],spentMaterials:[],savedAt:T,
 toolInventory:[tool('bit','bit',bitLife,'dth-button-8'),tool('hammer','hammer',2800,'puma-dth-8')],
 mission4:{phase:'complete',productionMode:'single-dth-v2',productionCycles:1,totalAutomatedIncome:0,zones:[1,2,3].map(n=>({
 id:'BH-0'+n,position:{x:20+n,z:n},status:n===1?'producing':'idle',lastCycleAt:n===1?T:null,cycleCount:0,totalIncome:0})),
 productionDrill:{id:'rig_dth_production',assignedZone:'BH-01',installedHammer:'hammer',installedBit:'bit',state:'producing'},drillTruck:{state:'parked',maintenancePhase:null}}};
}
test('15 minutes away pays exactly once and wears 30 m',()=>{
 const s=state();const r=calculateOfflineProduction(s,T+900000);
 assert.equal(r.incomeCycles,1);assert.equal(r.totalIncome,1500);
 assert.equal(s.toolInventory[0].lifeRemaining,320);assert.equal(s.toolInventory[1].lifeRemaining,2770);
 assert.equal(s.ledger.length,1);
});
test('under 15 minutes yields no income',()=>{
 const s=state();assert.equal(calculateOfflineProduction(s,T+600000).incomeCycles,0);assert.equal(s.cash,1000);
});
test('two hours away capped at one hour of actual cycles including relocations',()=>{
 const a=state(),b=state();
 const one=calculateOfflineProduction(a,T+3600000);
 const two=calculateOfflineProduction(b,T+7200000);
 assert.equal(two.incomeCycles,one.incomeCycles);
 assert.equal(two.totalIncome,one.totalIncome);
 assert(two.incomeCycles<=4);
 assert.equal(b.toolInventory[0].lifeRemaining,a.toolInventory[0].lifeRemaining);
});
test('out of spares stops at bit exhaustion and does not mint income',()=>{
 const s=state(30),r=calculateOfflineProduction(s,T+3600000);
 assert.equal(r.incomeCycles,1);
 assert.equal(s.mission4.serviceRequested,true);
 assert.equal(s.cash,2500);
 assert.equal(s.spentMaterials.length,1);
 assert.equal(s.spentMaterials[0].recyclingStatus,'awaiting-pickup');
});
