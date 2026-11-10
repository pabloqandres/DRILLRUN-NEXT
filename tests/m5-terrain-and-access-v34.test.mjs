import {test} from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../dist/scene.mjs';
import {desertGroundHeight,reliefHeight} from '../dist/graphics/desert.mjs';
import {newGame,restore} from '../dist/chapter/state.mjs';

function mapFixture(open){
 const w=Object.create(World.prototype);
 w.chapterMode=true;w.hsecActive=true;w._workshopBuilt=true;
 w.officeEnabled=false;w.yardL1Open=open;
 w.chapterCollision=()=>false;w.colliders=[];w.physicalBoundaries=[];
 w.walkSurfaces=[];
 return w;
}
test('M5 survey plot can be walked after M4, even BEFORE construction',()=>{
 const w=mapFixture(true),r=.35;
 for(const [x,z] of[[-15,-14],[-20,-14],[-24,-14],[-30,-14],
  [-50,-17],[-71,-20],[-50,-5]]){
  assert.equal(w.isBlocked(x,z,r),false,`M5 accessible point (${x},${z}) blocked`);
 }
});
test('Before M4, legacy boundaries prevent walking off the original chapter',()=>{
 const w=mapFixture(false);
 assert.equal(w.isBlocked(-50,-17,.35),true);
 assert.equal(w.isBlocked(-24,-14,.35),true);
 assert.equal(w.isBlocked(0,0,.35),false);
});
test('World foot height tracks actual desert mesh, not zero outside initial chapter',()=>{
 const w=mapFixture(true);
 for(const [x,z] of[[-40,-17],[-50,-5],[-23,-14],[-14,-14],[-8,-14],
   [-19,-6],[40,2],[-86,-17]]){
  const height=w.sampleGround(x,z);
  assert(Number.isFinite(height));
  assert(Math.abs(height-desertGroundHeight(x,z))<1e-8);
  assert(height>=0,`ground below 0 at ${x},${z}`);
 }
 assert.equal(reliefHeight(-50,-17),0,'reserved yard is graded');
 assert.equal(desertGroundHeight(-50,-17),0,'avatar is on yard terrain');
 assert.equal(reliefHeight(-24,-14),0,'entrance connection graded');
});
test('Resuming in M5 survey or its connector must not reset avatar to M1 spawn',()=>{
 const t=Date.UTC(2026,10,10,4);
 for(const [x,z] of[[-50,-17],[-24,-14],[-15,-14]]){
  const state=newGame('es','operator01',t);
  state.position={x,z};
  state.mission4={phase:'complete'};
  const restored=restore(state,t);
  assert(restored,`valid saved state restored at ${x},${z}`);
  assert.deepEqual(restored.position,{x,z});
 }
});
