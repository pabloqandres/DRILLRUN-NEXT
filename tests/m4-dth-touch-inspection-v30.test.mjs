import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dthRigInspection} from '../dist/mission4/rig-inspection.mjs';
const T=Date.UTC(2026,10,9,21);
const build=()=>{
 const s={
  cash:73421,ledger:[],spentMaterials:[],
  toolInventory:[
   {id:'bit-1',type:'bit',model:'dth-button-8',status:'installed',lifeTotal:350,lifeRemaining:230,metersUsed:120},
   {id:'hammer-1',type:'hammer',model:'puma-dth-8',status:'installed',lifeTotal:2800,lifeRemaining:2680,metersUsed:120}
  ],
  mission4:{phase:'complete',productionMode:'single-dth-v2',productionCycles:5,zone1Meterage:120,
   zones:[{id:'BH-01',status:'producing',lastCycleAt:T-180000,position:{x:20,z:4}}],
   productionDrill:{id:'rig_dth_production',assignedZone:'BH-01',installedBit:'bit-1',installedHammer:'hammer-1',state:'producing'}}
 };
 return s;
};
test('DTH tap reads the real installed tool IDs and remaining metres',()=>{
 const s=build(),before=JSON.stringify(s);
 const report=dthRigInspection(s,T);
 assert.equal(report.bit.id,'bit-1');
 assert.equal(report.bit.remaining,230);
 assert.equal(report.bit.total,350);
 assert.equal(report.bit.used,120);
 assert.equal(report.hammer.remaining,2680);
 assert.equal(report.hammer.total,2800);
 assert.equal(report.zoneId,'BH-01');
 assert.equal(report.nextSeconds,720);
 assert.equal(JSON.stringify(s),before,'inspection is read-only');
});
test('Exhausted DTH bit stays visible with 0 m until real replacement',()=>{
 const s=build();
 s.toolInventory[0].lifeRemaining=0;
 s.toolInventory[0].status='spent';
 s.mission4.productionDrill.state='paused';
 s.mission4.serviceRequested=true;
 const report=dthRigInspection(s,T);
 assert.equal(report.bit.remaining,0);
 assert.equal(report.bit.percent,0);
 assert.equal(report.bit.status,'spent');
 assert.equal(report.state,'paused');
});
test('Missing tool IDs do not crash touch card',()=>{
 const s=build();
 s.mission4.productionDrill.installedBit=null;
 const report=dthRigInspection(s,T);
 assert.equal(report.bit.status,'missing');
 assert.equal(report.bit.total,0);
 assert.equal(dthRigInspection({mission4:{}},T),null);
});
