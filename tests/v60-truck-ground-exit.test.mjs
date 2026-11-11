import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../dist/scene.mjs';
import {desertGroundHeight} from '../dist/graphics/desert.mjs';
import {visualTruckGroundHeight} from '../dist/graphics/personal-truck-grounding.mjs';
import {personalTruckExitCandidates,findSafePersonalTruckExit} from '../dist/animation/personal-truck-exit.mjs';
import {exitPersonalTruck} from '../dist/mission5/personal-drilltruck.mjs';
const game=readFileSync(new URL('../dist/chapter/game.mjs',import.meta.url),'utf8');
const close=(x,y,eps=1e-8)=>Math.abs(x-y)<=eps;
const world=()=>{
 const w=Object.create(World.prototype);
 w.chapterMode=true;w.officeEnabled=false;
 w.colliders=[];w.physicalBoundaries=[];w.chapterCollision=null;
 return w;
};
test('V60 flat asphalt support stays exact; a single high tyre no longer lifts the truck',()=>{
 assert(close(visualTruckGroundHeight({x:0,z:0},0,()=>.19,0),.205));
 assert(close(visualTruckGroundHeight({x:0,z:0},0,()=>.48,-.16),.655));
 const isolated=(x,z)=>x>.75&&z>1?.9:.19;
 const support=visualTruckGroundHeight({x:0,z:0},0,isolated,0);
 assert(support>=.19&&support<.25,'isolated .9m obstacle must not cause hover');
 const flat=visualTruckGroundHeight({x:0,z:0},0,()=>.19,0);
 assert(support-flat<.05);
});
test('V60 natural desert grounding tracks rendered mesh without spikes on slopes',()=>{
 for(const [x,z,heading] of [[55,40,.9],[-96,40,2.1],[42,-50,-1],[80,-70,.4],[-50,-50,Math.PI/2]]){
  const center=desertGroundHeight(x,z);
  const y=visualTruckGroundHeight({x,z},heading,desertGroundHeight,0);
  assert(Number.isFinite(y));
  assert(Math.abs(y-center-.015)<=.031,'raised out of sand at '+x+','+z);
 }
});
test('V60 exit candidate list is relative to the truck heading and close to its doors',()=>{
 for(const heading of [0,Math.PI/4,Math.PI/2,Math.PI,2.8]){
  const truck={position:{x:-24,z:15},heading};
  const pts=personalTruckExitCandidates(truck);
  assert(pts.length>=12);
  assert(pts.every(p=>Math.hypot(p.x+24,p.z-15)<=4.1));
  const choice=findSafePersonalTruckExit(truck,()=>true);
  assert.deepEqual(choice,{x:pts[0].x,z:pts[0].z});
 }
});
test('V60 reproduces diagonal self-collider deadlock and finds an actual exit when ignored',()=>{
 const truck={position:{x:12,z:7},heading:Math.PI/4,speed:0,mode:'driving'};
 const w=world();
 const own={x:12,z:7,w:2.55,d:5,angle:truck.heading,_personalTruck:true};
 w.colliders.push(own);
 const first=personalTruckExitCandidates(truck).slice(0,2);
 assert(first.every(p=>w.isBlocked(p.x,p.z,.37)),
  'old two-side exits should be falsely blocked by the rotated own footprint');
 // This is the temporary try/finally exclusion the game must perform.
 const index=w.colliders.indexOf(own);w.colliders.splice(index,1);
 let chosen;
 try{chosen=findSafePersonalTruckExit(truck,p=>!w.isBlocked(p.x,p.z,.37));}
 finally{w.colliders.push(own);}
 assert(chosen);
 assert(!w.physicalBoundaries.length);
 assert.equal(w.colliders.includes(own),true,'car must remain solid to others');
});
test('V60 respects perimeter walls and searches a safe alternative, never through them',()=>{
 const truck={position:{x:0,z:0},heading:0,speed:0,mode:'driving'};
 const w=world();
 // Driver-right side is obstructed by a real fence; left side stays clear.
 w.physicalBoundaries.push({x:2.15,z:0,w:.20,d:10,angle:0});
 const choice=findSafePersonalTruckExit(truck,p=>!w.isBlocked(p.x,p.z,.37));
 assert(choice,'another door should remain usable');
 assert(choice.x<0,'must choose clear side and not jump across the fence');
 w.physicalBoundaries.push({x:-2.15,z:0,w:.20,d:10,angle:0});
 const next=findSafePersonalTruckExit(truck,p=>!w.isBlocked(p.x,p.z,.37));
 assert(next,'safe exit behind the truck still exists');
 assert(Math.abs(next.z)>2.5);
 // Solid ring with no safe passage: exiting must be refused.
 assert.equal(findSafePersonalTruckExit(truck,()=>false),null);
});
test('V60 exit is state-safe: no second truck or reward created',()=>{
 const truck={id:'drilltruck-personal-02',mode:'driving',position:{x:1,z:1},speed:0};
 const s={mission5:{personalTruck:truck},position:{x:1,z:1},cash:44610,
  ledger:[{amount:100,at:10}],mission4:{drillTruck:{id:'drilltruck-01'}}};
 const before=structuredClone({cash:s.cash,ledger:s.ledger,mission4:s.mission4});
 exitPersonalTruck(s,{x:3.35,z:1},123456);
 assert.equal(truck.mode,'parked');
 assert.deepEqual(s.position,{x:3.35,z:1});
 assert.equal(s.mission5.personalTruck,truck);
 assert.deepEqual({cash:s.cash,ledger:s.ledger,mission4:s.mission4},before);
});
test('V60 game only omits own collider during exit and reinstates it in finally',()=>{
 assert.match(game,/import \{findSafePersonalTruckExit\} from '\.\.\/animation\/personal-truck-exit\.mjs'/);
 assert.match(game,/const ownIndex=world\.colliders\.indexOf\(m5PersonalTruckCollider\)/);
 assert.match(game,/if\(ownIndex>=0\)world\.colliders\.splice\(ownIndex,1\)/);
 assert.match(game,/findSafePersonalTruckExit\(truck,/);
 assert.match(game,/\}finally\{\s*if\(ownIndex>=0&&m5PersonalTruckCollider/);
 assert.match(game,/exitPersonalTruck\(s,location\)/);
 assert.match(game,/visualTruckGroundHeight\(truck\.position,truck\.heading/);
});
