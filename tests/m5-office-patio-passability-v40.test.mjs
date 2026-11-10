import {test} from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../dist/scene.mjs';
import {isM5FreeWalkArea,canWalkM5Area,OFFICE_PATIO_LINK,M5_PLOT} from '../dist/chapter/navigation-areas.mjs';
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
test('Old chapter limits still prevent wandering outside the map before M4',()=>{
 const w=world(false);
 assert.equal(w.isBlocked(-19,5,.42),true);
 assert.equal(w.isBlocked(-26,4,.42),true);
 assert.equal(w.isBlocked(0,0,.42),false);
 assert.equal(w.isBlocked(38,0,.42),true);
});
test('Real built-object and safety colliders still block movement in the new connector',()=>{
 const w=world(true);
 w.colliders.push({x:-19,z:5,w:1.6,d:3});
 assert.equal(w.isBlocked(-19,5,.42),true);
 w.colliders=[];
 w.chapterCollision=()=>true;
 assert.equal(w.isBlocked(-19,5,.42),true);
});
test('Valid saved position anywhere in the office-to-patio link survives restore',()=>{
 const now=Date.UTC(2026,10,10,12);
 for(const [x,z] of [[-19,5],[-25,4],[-30,-10],[-45,-17]]){
  const s=newGame('es','operator01',now);
  s.position={x,z};s.mission4={phase:'complete'};
  const loaded=restore(s,now);
  assert.deepEqual(loaded.position,{x,z},`restore moved player at ${x},${z}`);
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
