import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const game=readFileSync(new URL('../dist/chapter/game.mjs',import.meta.url),'utf8');
const truck=readFileSync(new URL('../dist/mission3/delivery-vehicle.mjs',import.meta.url),'utf8');
const start=game.indexOf(' // Sync truck collider position');
const end=game.indexOf(' // Animate drill',start);
assert(start>=0&&end>start,'Delivery collider handler must exist');
const block=game.slice(start,end);
function run(vehicle,world,initial=null){
 const fn=new Function('m3DeliveryVehicle','world','existing',`let m3TruckCollider=existing;\n${block}\nreturn m3TruckCollider;`);
 return fn(vehicle,world,initial);
}
test('delivery truck starts invisible but has no physical collider at its origin',()=>{
 assert.match(truck,/g\.name='delivery-truck';g\.visible=false/);
 const scene={},world={scene,colliders:[]};
 const vehicle={visible:false,parent:scene,position:{x:0,z:0}};
 run(vehicle,world);
 assert.deepEqual(world.colliders,[],'invisible truck must not block between office and maintenance');
});
test('visible delivery truck has precisely one collider following its position',()=>{
 const scene={},world={scene,colliders:[]};
 const vehicle={visible:true,parent:scene,position:{x:-7.6,z:-6.2}};
 let collider=run(vehicle,world);
 assert.equal(world.colliders.length,1);
 assert.deepEqual([collider.x,collider.z,collider.w,collider.d],[-7.6,-6.2,2.4,5]);
 vehicle.position={x:-4,z:-7.5};
 collider=run(vehicle,world,collider);
 assert.equal(world.colliders.length,1,'moving truck should not duplicate blockers');
 assert.deepEqual([collider.x,collider.z],[-4,-7.5]);
});
test('delivery truck departure cleans its collider without touching actual walls',()=>{
 const scene={},wall={x:-11.2,z:-9.3,w:.4,d:5.8},world={scene,colliders:[wall]};
 const vehicle={visible:true,parent:scene,position:{x:-7.6,z:-6.2}};
 const collider=run(vehicle,world);
 vehicle.visible=false;
 run(vehicle,world,collider);
 assert.deepEqual(world.colliders,[wall]);
});
test('truck not yet added to scene is nonblocking',()=>{
 const scene={},world={scene,colliders:[]};
 const vehicle={visible:true,parent:null,position:{x:0,z:0}};
 run(vehicle,world);
 assert.equal(world.colliders.length,0);
});
