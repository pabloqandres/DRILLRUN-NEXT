import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {PersonalTruckWheels} from '../dist/graphics/personal-truck-wheels-v66.mjs';
import {initTruckRouteState,startTruckRoute,updateTruckRoute,truckRouteActive} from '../dist/mission4/truck-routes.mjs';
import {readFileSync} from 'node:fs';
const game=readFileSync(new URL('../dist/chapter/game.mjs',import.meta.url),'utf8');
function model(){
 const g=new T.Group(),body=new T.Mesh(new T.BoxGeometry(2.2,1.4,4.5));
 body.position.y=1.0;g.add(body);return g;
}
test('V66 M4 automatic wheels spin using M4 route velocity without modifying the route',()=>{
 const truck=model(),wheels=new PersonalTruckWheels(truck);
 assert.equal(wheels.wheels.length,4);
 initTruckRouteState(truck);
 startTruckRoute(truck,'BH-01','out',false);
 wheels.updateFromPose(.033,truckRouteActive(truck));
 let rotations=0,routeSteps=0;
 for(let i=0;i<30;i++){
  const before=truck.userData._truckRoute;
  const phase=before.phase,index=before.index,t=before.t;
  updateTruckRoute(truck,.033);routeSteps++;
  const position=truck.position.clone(),heading=truck.rotation.y;
  wheels.updateFromPose(.033,truckRouteActive(truck));
  assert(truck.position.equals(position),'wheel visual never modifies M4 position');
  assert.equal(truck.rotation.y,heading,'wheel visual never steers M4');
  assert.equal(truck.userData._truckRoute, before,'no route replacement');
  assert.equal(before.phase,phase,'visual animation does not advance mission');
  assert(before.index>=index);assert(before.t>=0);
  rotations=wheels.wheels[0].spin.rotation.x;
 }
 assert(routeSteps>0&&Math.abs(rotations)>0.02,'wheels roll with route');
 const frozen=rotations;
 wheels.updateFromPose(.033,false);
 assert.equal(wheels.wheels[0].spin.rotation.x,frozen,'no rotation while service parked');
 wheels.dispose();
});
test('V66 automatic truck clone shares rig mesh shape but never duplicates wheel overlays',()=>{
 const automatic=model(),autoRig=new PersonalTruckWheels(automatic);
 assert.equal(autoRig.mode,'hubs');
 assert.equal(autoRig.wheels.length,4);
 const personalClone=automatic.clone(true);
 const personalRig=new PersonalTruckWheels(personalClone);
 assert.equal(personalRig.mode,'inherited');
 assert.equal(personalRig.wheels.length,4);
 autoRig.update(4,.14,.03);
 personalRig.update(2,-.18,.03);
 assert.notEqual(autoRig.wheels[0].spin.rotation.x,personalRig.wheels[0].spin.rotation.x);
 assert.notEqual(autoRig.wheels[0].spin,personalRig.wheels[0].spin);
});
test('V66 M4 wheel visual hooks are outside mission production/route/economy modules',()=>{
 assert.match(game,/m4TruckWheels=new PersonalTruckWheels\(m4DrillTruckModel\)/);
 assert.match(game,/m4TruckWheels\.updateFromPose\(dt,truckRouteActive\(m4DrillTruckModel\)\)/);
 assert.match(game,/const routeEvent=updateTruckRoute\(m4DrillTruckModel,dt\)/);
 assert.match(game,/advanceMaintenancePhase\(s\)/);
 assert.match(game,/autoDispatchTruck\(s\)/);
 assert.match(game,/m4DrillTruckModel\.clone\(true\)/);
 assert.match(game,/m5TruckWheels=new PersonalTruckWheels\(m5PersonalTruckModel\)/);
 const code=readFileSync(new URL('../dist/graphics/personal-truck-wheels-v66.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(code,/mission4\/|cash|bank|save\(|startTruckRoute|advanceMaintenancePhase/);
});
