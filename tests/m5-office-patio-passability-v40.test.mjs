import {test} from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../dist/scene.mjs';
import {isM5FreeWalkArea,isPlayableTerrain,PLAYABLE_TERRAIN,OFFICE_PATIO_LINK,M5_PLOT} from '../dist/chapter/navigation-areas.mjs';
import {newGame,restore} from '../dist/chapter/state.mjs';
import {desertGroundHeight} from '../dist/graphics/desert.mjs';

function world(active){
 const w=Object.create(World.prototype);
 w.chapterMode=true;w.officeEnabled=false;
 w._workshopBuilt=true;w.hsecActive=true;w.yardL1Open=active;
 w.chapterCollision=()=>false;w.colliders=[];w.physicalBoundaries=[];
 w.walkSurfaces=[];
 return w;
}
const route=[
 [-7,3],[-10,3],[-14,4],[-17,5],[-19,5],[-22,5],
 [-25,3],[-28,-2],[-29,-10],[-31,-15],[-39,-17],[-51,-17]
];
test('M5 office to northwest plot has NO invisible transition wall after M4',()=>{
 const w=world(true);
 for(const [x,z] of route){
  assert.equal(isM5FreeWalkArea(x,z),true,`corridor not covered at ${x},${z}`);
  assert.equal(w.isBlocked(x,z,.42),false,`invisible boundary at ${x},${z}`);
 }
});
test('V57 removes pre-M4 invisible limits but protects actual world mesh edge',()=>{
 const w=world(false);
 for(const [x,z] of [[-19,5],[-26,4],[0,0],[38,0],[-90,-50],[75,75]])
  assert.equal(w.isBlocked(x,z,.42),false,'free terrain blocked at '+x+','+z);
 for(const [x,z] of [[109,0],[-109,0],[0,109],[0,-109]])
  assert.equal(w.isBlocked(x,z,.42),true,'true outer edge not enforced');
 assert.equal(PLAYABLE_TERRAIN.halfSize,120);
 assert.equal(PLAYABLE_TERRAIN.edgeMargin,12);
});
test('Real built-object and safety colliders still block movement in the new connector',()=>{
 const w=world(true);
 w.colliders.push({x:-19,z:5,w:1.6,d:3});
 assert.equal(w.isBlocked(-19,5,.42),true);
 w.colliders=[];
 w.chapterCollision=()=>true;
 assert.equal(w.isBlocked(-19,5,.42),true);
});
test('V57 valid saves survive anywhere on the full open terrain before and after M4',()=>{
 const now=Date.UTC(2026,10,10,12);
 for(const [x,z] of [[-19,5],[-25,4],[-30,-10],[-45,-17],[90,88],[-97,75]]){
  for(const phase of [null,{phase:'complete'}]){
   const s=newGame('es','operator01',now);
   s.position={x,z};s.mission4=phase;
   const loaded=restore(s,now);
   assert.deepEqual(loaded.position,{x,z},`restore moved player at ${x},${z}`);
  }
 }
 for(const p of [{x:120,z:0},{x:0,z:NaN},{x:-999,z:0}]){
  const s=newGame('es','operator01',now);s.position=p;
  assert.deepEqual(restore(s,now).position,newGame('es','operator01',now).position);
 }
});
test('Connector and plot share ground height with the visible desert terrain',()=>{
 const w=world(true);
 for(const [x,z] of route){
  assert.equal(w.sampleGround(x,z),desertGroundHeight(x,z));
  assert(Number.isFinite(w.sampleGround(x,z)));
 }
 assert(OFFICE_PATIO_LINK.maxZ>=12);
 assert(M5_PLOT.maxX>=-22);
});
