import {test} from 'node:test';
import assert from 'node:assert/strict';
import {completeMaintenance} from '../dist/mission4/maintenance.mjs';
import {FLEET_BAYS} from '../dist/mission5/fleet-base.mjs';
const T=Date.UTC(2026,10,9,23);
function state(operational,relocated){
 return {mission5:operational?{status:'operational',truckRelocated:relocated}:null,
  mission4:{phase:'complete',productionMode:'single-dth-v2',serviceRequested:false,
   productionDrill:{assignedZone:'BH-01',state:'producing'},
   drillTruck:{state:'maintenance',maintenancePhase:'return',maintenanceZone:'BH-01'},
   zones:[{id:'BH-01',status:'maintenance',lastCycleAt:null}]},
  cash:1000,ledger:[],spentMaterials:[]};
}
test('M5 commissioned fleet returns persistently to C03, not obsolete M4 pad',()=>{
 const s=state(true,true);
 completeMaintenance(s,T);
 assert.equal(s.mission4.drillTruck.state,'parked');
 assert.deepEqual(s.mission4.drillTruck.position,
  {x:FLEET_BAYS.drillTruck.x,z:FLEET_BAYS.drillTruck.z});
 assert.equal(s.mission4.zones[0].status,'producing');
 assert.equal(s.cash,1000);
});
test('Until truck actually relocates, maintenance can still finish at temporary M4 base',()=>{
 const s=state(true,false);
 completeMaintenance(s,T);
 assert.deepEqual(s.mission4.drillTruck.position,{x:-13.5,z:-9.3});
});
test('Existing pre-M5 saves retain their original M4 home and production logic',()=>{
 const s=state(false,false);
 completeMaintenance(s,T);
 assert.deepEqual(s.mission4.drillTruck.position,{x:-13.5,z:-9.3});
 assert.equal(s.mission4.zones[0].status,'producing');
});
