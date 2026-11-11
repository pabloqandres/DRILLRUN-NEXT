import {test} from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../dist/scene.mjs';
import {newGame,restore} from '../dist/chapter/state.mjs';
import {isPlayableTerrain,PLAYABLE_TERRAIN} from '../dist/chapter/navigation-areas.mjs';
import {deliverPersonalTruck,repairPersonalTruckPose,personalTruck,drivePersonalTruck} from '../dist/mission5/personal-drilltruck.mjs';
import {FLEET_BAYS} from '../dist/mission5/fleet-base.mjs';

const now=Date.UTC(2026,10,10,20);
function world(){
 const w=Object.create(World.prototype);
 w.chapterMode=true;w.officeEnabled=false;w.hsecActive=true;
 w.yardL1Open=false;w.colliders=[];w.physicalBoundaries=[];
 w.chapterCollision=null;w.walkSurfaces=[];
 return w;
}
function paidState(){
 const s=newGame('es','operator01',now);
 s.position={x:-31,z:-20.2};s.mission5={status:'operational',commissionedAt:now};
 s.narrative={accepted:['m5'],rewardsCollected:['m5']};
 deliverPersonalTruck(s,now);
 return s;
}
test('V57 walking and driving occupy the same 240m-rendered desert with an edge margin',()=>{
 assert.deepEqual(PLAYABLE_TERRAIN,{halfSize:120,edgeMargin:12,bound:108});
 const w=world();
 for(const [x,z] of [[-97,-97],[98,80],[-90,70],[70,-70],[-60,-42],[-17,15],[40,15],[106,0]]){
  assert.equal(isPlayableTerrain(x,z),true);
  assert.equal(w.isBlocked(x,z,.34),false,'old phantom wall at '+x+','+z);
 }
 for(const [x,z] of [[109,0],[-109,0],[0,109],[0,-109],[Infinity,0],[NaN,3]]){
  assert.equal(isPlayableTerrain(x,z),false);
  assert.equal(w.isBlocked(x,z,.34),true,'outside rendered mesh not blocked');
 }
 assert.equal(w.isBlocked(107.8,0,.4),true,'avatar radius must fit within safe map');
});
test('V57 existing physical colliders, safety boundaries and gate still block',()=>{
 const w=world();
 w.colliders.push({x:-42,z:40,w:6,d:7,_workshop:true});
 assert.equal(w.isBlocked(-42,40,.4),true);
 assert.equal(w.isBlocked(-35,40,.4),false);
 w.colliders.length=0;
 w.physicalBoundaries.push({x:55,z:16,w:12,d:.22,angle:0,kind:'patio-fence'});
 assert.equal(w.isBlocked(55,16,.4),true);
 assert.equal(w.isBlocked(55,18,.4),false);
 w.physicalBoundaries.length=0;
 w.chapterCollision=()=>true;
 assert.equal(w.isBlocked(72,42,.4),true,'HSEC collision still enforced');
});
test('V57 restore preserves valid remote player and paid truck poses across stages',()=>{
 for(const p of [{x:95,z:78},{x:-99,z:68},{x:76,z:-86}]){
  const s=paidState(),before=s.cash,ledger=structuredClone(s.ledger);
  s.position={...p};s.mission4=null;
  const t=personalTruck(s);t.position={...p};t.mode='parked';t.speed=0;
  const restored=restore(structuredClone(s),now);
  assert.deepEqual(restored.position,p);
  assert.deepEqual(personalTruck(restored).position,p);
  assert.equal(repairPersonalTruckPose(restored,now),false,'legal truck must not teleport');
  assert.equal(restored.cash,before);
  assert.deepEqual(restored.ledger,ledger);
 }
});
test('V57 bad saves are clamped safely, and truck recovery never mints money',()=>{
 const s=paidState(),cash=s.cash,ledger=structuredClone(s.ledger);
 s.position={x:122,z:0};s.mission5.personalTruck.position={x:-800,z:500};
 const loaded=restore(structuredClone(s),now);
 assert.deepEqual(loaded.position,newGame('es','operator01',now).position);
 assert.equal(repairPersonalTruckPose(loaded,now),true);
 assert.deepEqual(personalTruck(loaded).position,{x:FLEET_BAYS.personalTruck.x,z:FLEET_BAYS.personalTruck.z});
 assert.equal(loaded.cash,cash);assert.deepEqual(loaded.ledger,ledger);
});
test('V57 personal vehicle moves outside the old rectangle but cannot drive off the real terrain',()=>{
 const w=world(),s=paidState(),truck=personalTruck(s);
 truck.mode='driving';truck.position={x:60,z:30};truck.heading=0;truck.speed=0;
 const before=truck.position.z;
 const result=drivePersonalTruck(s,{throttle:1},.08,(x,z,r)=>w.isBlocked(x,z,r));
 assert(result?.moving&&truck.position.z>before);
 truck.position={x:106,z:0};truck.heading=Math.PI/2;truck.speed=6;
 const edge=drivePersonalTruck(s,{throttle:1},.08,(x,z,r)=>w.isBlocked(x,z,r));
 assert.equal(edge.moving,false,'truck should never cross the safe terrain edge');
 assert.equal(truck.position.x,106);
});
