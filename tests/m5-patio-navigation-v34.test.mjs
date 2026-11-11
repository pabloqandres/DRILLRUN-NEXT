import {test} from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../dist/scene.mjs';
import {reliefHeight,desertGroundHeight} from '../dist/graphics/desert.mjs';
const world=enabled=>{
 const w=Object.create(World.prototype);
 w.chapterMode=true;
 w.hsecActive=true;
 w._workshopBuilt=true;
 w.yardL1Open=enabled;
 w.officeEnabled=false;
 w.chapterCollision=null;
 w.colliders=[];
 w.physicalBoundaries=[];
 w.walkSurfaces=[];
 return w;
};
test('M5 can be walked into BEFORE L1 is purchased; continuous route from old faena',()=>{
 const w=world(true);
 for(const [x,z] of [[-8,-9],[-12,-12],[-19,-14],[-24,-14],[-51,-17],[-76,-36]]){
  assert.equal(w.isBlocked(x,z,.34),false,'unexpected invisible blocker at '+x+','+z);
 }
 for(const [x,z] of [[-90,-50],[50,30],[98,98]]){
  assert.equal(w.isBlocked(x,z,.34),false,'V57 open desert blocked');
 }
 for(const [x,z] of [[-200,0],[110,0],[0,-110]]){
  assert.equal(w.isBlocked(x,z,.34),true,'physical terrain edge must remain blocked');
 }
});
test('V57 no invisible M4-gated map walls: non-built parcel is walkable',()=>{
 const w=world(false);
 assert.equal(w.isBlocked(-51,-17,.34),false);
 assert.equal(w.isBlocked(-24,-14,.34),false);
 assert.equal(w.isBlocked(40,20,.34),false);
});
test('player support height matches desert mesh on plot and access, not buried at y=0',()=>{
 const w=world(true);
 for(const [x,z] of [[-51,-17],[-25,-14],[-12,-14],[-44,5],[-76,-36]]){
  const visual=desertGroundHeight(x,z);
  assert(Math.abs(w.sampleGround(x,z)-visual)<.001,'foot/mesh mismatch at '+x+','+z);
  assert(visual>=0,'below ground');
 }
});
test('M5 grading floor can lift player to finished asphalt during the 20-minute build',()=>{
 const w=world(true);
 w.walkSurfaces.push({x:-51,z:-17,w:54.4,d:43.4,y:.19});
 assert(w.sampleGround(-51,-17)>=.19);
 assert(w.sampleGround(-24,-14)>=.19);
});
