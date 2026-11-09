import {test} from 'node:test';
import assert from 'node:assert/strict';
import {tickProduction,dthReplacementAvailable} from '../dist/mission4/production.mjs';
import {completeMaintenance} from '../dist/mission4/maintenance.mjs';
import {calculateOfflineProduction} from '../dist/mission4/offline-progress.mjs';

const T=Date.UTC(2026,10,9,18);
const tool=(id,type,life,model,status='installed')=>({id,type,model,status,lifeRemaining:life,lifeTotal:life,metersUsed:0});
const state=()=>({
 cash:1000,nextId:10,ledger:[],spentMaterials:[],savedAt:T-9000000,
 toolInventory:[tool('h','hammer',90,'puma-dth-8'),tool('b','bit',30,'dth-button-8'),tool('b2','bit',350,'dth-button-8','new')],
 mission4:{
  phase:'complete',productionCycles:5,totalAutomatedIncome:100,
  zones:[1,2,3].map(n=>({id:'BH-0'+n,position:{x:15+n*4,z:n},status:'producing',lastCycleAt:T-1800000,cycleCount:1,totalIncome:100})),
  productionDrill:{id:'rig_dth_production',assignedZone:'BH-01',installedHammer:'h',installedBit:'b',state:'producing'},
  drillTruck:{state:'parked',maintenancePhase:null}
 }
});

test('completed M4 migrates safely; one DTH and no legacy catch-up payout',()=>{
 const s=state();
 assert.deepEqual(tickProduction(s,T),[]);
 assert.equal(s.cash,1000);
 assert.equal(s.mission4.productionMode,'single-dth-v2');
 assert.equal(s.mission4.zones.filter(z=>z.status==='producing').length,1);
 assert.deepEqual(tickProduction(s,T+899000),[]);
});
test('one real 15-minute cycle pays 1500 and consumes 30m once',()=>{
 const s=state();tickProduction(s,T);
 assert.deepEqual(tickProduction(s,T+900100),['incomeGenerated','dthServiceRequired']);
 assert.equal(s.cash,2500);
 assert.equal(s.toolInventory[0].lifeRemaining,60);
 assert.equal(s.toolInventory[1].lifeRemaining,0);
 assert.equal(s.toolInventory[1].status,'spent');
 assert.equal(s.spentMaterials[0].recyclingStatus,'awaiting-pickup');
 assert.equal(s.spentMaterials[0].recoveredAt,null);
 assert.deepEqual(tickProduction(s,T+900100),[]);
 assert.equal(s.ledger.length,1);
});
test('DrillTruck collects discard, installs stock and resumes without phantom incomes',()=>{
 const s=state();tickProduction(s,T);tickProduction(s,T+900100);
 const before=s.cash;
 assert.equal(calculateOfflineProduction(s,T+2000000).totalIncome,0);
 assert.equal(s.cash,before);
 s.mission4.drillTruck.maintenanceZone='BH-01';
 s.mission4.drillTruck.maintenancePhase='return';
 completeMaintenance(s,T+2001000);
 assert.equal(s.spentMaterials[0].recyclingStatus,'awaiting-yard');
 assert.equal(s.spentMaterials[0].recoveredAt,T+2001000);
 assert.equal(s.mission4.productionDrill.installedBit,'b2');
 assert.equal(s.mission4.zones[0].status,'producing');
 assert(tickProduction(s,T+2902000).includes('incomeGenerated'));
 assert.notEqual(s.mission4.productionDrill.assignedZone,'BH-01');
 assert.equal(s.mission4.productionDrill.state,'moving');
});
test('no spare bit => drilling paused, without generating money',()=>{
 const s=state();s.toolInventory.pop();
 tickProduction(s,T);tickProduction(s,T+900100);
 assert.equal(dthReplacementAvailable(s),false);
 assert.equal(s.mission4.serviceRequested,true);
 const cash=s.cash;
 tickProduction(s,T+3000000);
 assert.equal(s.cash,cash);
});
