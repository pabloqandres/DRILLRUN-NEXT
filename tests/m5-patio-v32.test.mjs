import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PATIO_L1,PATIO_FUTURE,PATIO_PHASES,patioUnlocked,patioCanStart,startPatio,patioProgress,finishPatio,patioCapacity} from '../dist/mission5/patio-state.mjs';
import {WORKSHOP_LEVELS,canUpgradeWorkshop,workshopCapacity} from '../dist/mission3/inventory.mjs';
import {initTruckRouteState,startTruckRoute,updateTruckRoute} from '../dist/mission4/truck-routes.mjs';
import * as T from '../dist/vendor/three.module.js';
const T0=Date.UTC(2026,10,10,8);
const save=()=>({cash:60000,bank:0,nextId:100,ledger:[],mission4:{phase:'complete',productionCycles:6},mission5:null});

test('M5 L1 stays locked before M4, unlocks when M4 is completed',()=>{
 const s=save();s.mission4.phase='active';
 assert.equal(patioUnlocked(s),false);assert.equal(patioCanStart(s),'needsM4');
 s.mission4.phase='complete';assert.equal(patioCanStart(s),null);
 assert.equal(PATIO_L1.width,54);assert.equal(PATIO_L1.depth,44);
 assert.deepEqual(PATIO_L1.gate,{x:-24,z:-14});
 assert.equal(PATIO_FUTURE.length,2);assert(PATIO_FUTURE.every(p=>p.locked));
});
test('L1 costs exactly 45000 once and lasts 20 minutes of real time',()=>{
 const s=save(),m4=JSON.stringify(s.mission4);
 startPatio(s,T0);
 assert.equal(s.cash,15000);assert.equal(s.ledger.length,1);
 assert.equal(s.ledger[0].amount,-45000);
 assert.equal(s.mission5.endsAt,T0+1200000);
 assert.equal(s.mission5.status,'building');
 assert.equal(patioProgress(s,T0+600000).progress,0.5);
 assert.equal(finishPatio(s,T0+1199000),false);
 assert.throws(()=>startPatio(s,T0+1200000),/constructionPending/);
 assert.equal(s.cash,15000);assert.equal(s.ledger.length,1);
 assert.equal(JSON.stringify(s.mission4),m4);
 assert.equal(finishPatio(s,T0+1200000),true);
 assert.equal(s.mission5.status,'operational');
 assert(s.mission5.modulePack.every(m=>m.status==='installed'));
 assert.equal(s.mission5.hsecApproved,true);
 assert.deepEqual(patioCapacity(s),{covered:6,drill:3,heavy:4,gate:true});
 assert.equal(finishPatio(s,T0+2400000),false);
 assert.equal(s.ledger.length,1);
});
test('Construction completes offline and future levels remain inaccessible',()=>{
 const s=save();startPatio(s,T0);
 assert.equal(patioProgress(s,T0+1400000).progress,1);
 assert.equal(finishPatio(s,T0+1400000),true);
 assert.equal(patioCanStart(s),'alreadyBuilt');
 assert(PATIO_FUTURE.every(p=>p.locked));
 assert.deepEqual(PATIO_PHASES.map(p=>p.id),['blueprint','grading','mounting','commissioning']);
});
test('Workshop is capped at L2 and no L3 purchase is possible',()=>{
 const s={workshop:{level:2,status:'built'},cash:100000};
 assert.equal(WORKSHOP_LEVELS.length,2);
 assert.equal(WORKSHOP_LEVELS[1].level,2);
 assert.equal(workshopCapacity(s),14);
 assert.equal(canUpgradeWorkshop(s),'maxLevel');
});
test('M5 DrillTruck service starts and ends at covered bay using one fixed gate',()=>{
 const model=new T.Group();initTruckRouteState(model);
 startTruckRoute(model,'BH-01','out',true);
 const out=model.userData._truckRoute.route;
 assert.deepEqual({x:out[0].x,z:out[0].z},PATIO_L1.truckBay);
 assert(out.some(p=>p.x===PATIO_L1.gate.x&&p.z===PATIO_L1.gate.z));
 assert.deepEqual({x:out.at(-1).x,z:out.at(-1).z},{x:15,z:4});
 startTruckRoute(model,'BH-01','return',true);
 const back=model.userData._truckRoute.route;
 assert.deepEqual({x:back.at(-1).x,z:back.at(-1).z},PATIO_L1.truckBay);
 startTruckRoute(model,null,'relocate');
 let arrived=false;
 for(let i=0;i<500;i++)if(updateTruckRoute(model,.25)==='yard-arrived'){arrived=true;break;}
 assert.equal(arrived,true);
 assert.deepEqual({x:model.position.x,z:model.position.z},PATIO_L1.truckBay);
});
