import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {PATIO_L1,startPatio,finishPatio,patioCanStart} from '../dist/mission5/patio-state.mjs';
import {FLEET_BAYS,FLEET_GATE,patioFleetActive,rcAvailableToPark,dthAvailableToPark,
 fleetOccupancy} from '../dist/mission5/fleet-base.mjs';
import {rigRouteToPatio,rigRouteFromPatio,advanceRigRoute} from '../dist/mission5/fleet-routes.mjs';
import {initTruckRouteState,startTruckRoute,updateTruckRoute} from '../dist/mission4/truck-routes.mjs';

const NOW=Date.UTC(2026,10,9,22);
function fixture(){return {
 cash:65000,nextId:101,ledger:[],
 mission4:{phase:'complete',productionCycles:17,totalAutomatedIncome:12000,
  drillTruck:{state:'parked',maintenancePhase:null,position:{x:-13.5,z:-9.3}},
  productionDrill:{id:'rig_dth_production',state:'producing',assignedZone:'BH-01'}},
 drill:{id:'rig_rc_compact',state:'idle',position:{x:9,z:-7.2}},
 contract:{status:'delivered'},
 mission5:null
};}
function runTruck(model,stop){
 let event=null;
 for(let i=0;i<3200;i++){
  event=updateTruckRoute(model,.10);
  if(event)return event;
 }
 throw new Error('Route unfinished: '+stop);
}
test('Patio L1 unlocks strictly after M4; bills once; finishes after exactly 20 minutes',()=>{
 const s=fixture();
 assert.equal(patioCanStart({cash:90000}), 'needsM4');
 assert.equal(patioFleetActive(s),false);
 const originalM4=JSON.stringify(s.mission4);
 startPatio(s,NOW);
 assert.equal(s.cash,65000-PATIO_L1.price);
 assert.equal(s.ledger.length,1);
 assert.equal(patioFleetActive(s),false);
 assert.equal(finishPatio(s,NOW+1199999),false);
 assert.equal(finishPatio(s,NOW+1200000),true);
 assert.equal(finishPatio(s,NOW+1400000),false);
 assert.equal(s.ledger.length,1);
 assert.equal(JSON.stringify(s.mission4),originalM4);
 assert.equal(patioFleetActive(s),true);
});
test('RC enters via sole fixed gate and takes uncovered D01, not a roofed bay',()=>{
 const s=fixture();startPatio(s,NOW);finishPatio(s,NOW+1200000);
 assert.equal(rcAvailableToPark(s),true);
 const route=rigRouteToPatio({x:9,z:-7.2},'rc');
 assert.deepEqual(route.find(p=>p.x===FLEET_GATE.x&&p.z===FLEET_GATE.z),FLEET_GATE);
 assert.equal(FLEET_BAYS.rc.area,'open-drill');
 const model=new T.Group();model.position.set(9,0,-7.2);
 let done=false;
 for(let i=0;i<3200&&!done;i++)done=advanceRigRoute(model,route,.05);
 assert.equal(done,true);
 assert(Math.abs(model.position.x-FLEET_BAYS.rc.x)<.01);
 assert(Math.abs(model.position.z-FLEET_BAYS.rc.z)<.01);
});
test('DTH actively drilling remains at BH-01, idle unassigned uses uncovered D02',()=>{
 const s=fixture();startPatio(s,NOW);finishPatio(s,NOW+1200000);
 assert.equal(dthAvailableToPark(s),false);
 assert.equal(fleetOccupancy(s).openDrill[1].state,'working');
 s.mission4.productionDrill.assignedZone=null;
 assert.equal(dthAvailableToPark(s),true);
 assert.equal(FLEET_BAYS.dth.area,'open-drill');
 const route=rigRouteToPatio({x:15,z:-7.2},'dth');
 const outbound=rigRouteFromPatio(FLEET_BAYS.dth,{x:20,z:4});
 assert(route.some(p=>p.x===FLEET_GATE.x&&p.z===FLEET_GATE.z));
 assert(outbound.some(p=>p.x===FLEET_GATE.x&&p.z===FLEET_GATE.z));
});
test('DrillTruck drives old->yard then all work orders start/return through single gate',()=>{
 const model=new T.Group();model.position.set(-13.5,0,-9.3);
 initTruckRouteState(model);
 startTruckRoute(model,null,'relocate');
 assert.equal(runTruck(model,'relocate'),'yard-arrived');
 assert.equal(Math.round(model.position.x),FLEET_BAYS.drillTruck.x);
 assert.equal(Math.round(model.position.z),FLEET_BAYS.drillTruck.z);
 assert.equal(FLEET_BAYS.drillTruck.area,'covered');
 startTruckRoute(model,'BH-01','out',true);
 const path=model.userData._truckRoute.route;
 assert(path.some(p=>p.x===FLEET_GATE.x&&p.z===FLEET_GATE.z));
 assert.equal(runTruck(model,'out'),'arrived');
 assert(model.position.distanceTo(new T.Vector3(20,0,4))>=4.5);
 startTruckRoute(model,'BH-01','return',true);
 assert.equal(runTruck(model,'return'),'returned');
 assert(Math.abs(model.position.x-FLEET_BAYS.drillTruck.x)<.01);
 assert(Math.abs(model.position.z-FLEET_BAYS.drillTruck.z)<.01);
});
test('No imaginary heavy equipment; historic M4 parking flags not removed by purchase',()=>{
 const s=fixture();s.mission4.parkingBuilt=true;
 startPatio(s,NOW);finishPatio(s,NOW+1200000);
 assert.equal(s.mission4.parkingBuilt,true);
 const occ=fleetOccupancy(s);
 assert.equal(occ.openHeavy.length,0);
 assert.equal(occ.covered.length,1);
 assert.equal(occ.openDrill.length,2);
});
