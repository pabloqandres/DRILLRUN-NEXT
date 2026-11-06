import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../dist/scene.mjs';
import {circleHitsRect} from '../dist/assets3d/office-layout.mjs';

function workingWorld(colliders){
 // Exercise World.isBlocked without initializing a WebGL renderer or save.
 return Object.assign(Object.create(World.prototype),{
  chapterMode:true,hsecActive:true,_workshopBuilt:true,
  officeEnabled:false,chapterCollision:()=>false,
  colliders,physicalBoundaries:[]
 });
}
test('parking apron at workshop L2 remains a walkable yard, without a phantom parked truck',()=>{
 const w=workingWorld([]);
 assert.equal(w.isBlocked(.9,-3.5,.38),false);
 assert.equal(w.isBlocked(1.7,-3.5,.38),false);
 // Prove that the old, mistaken 3.8m parking box would have blocked this path.
 assert.equal(circleHitsRect(.9,-3.5,.38,{x:.9,z:-3.5,w:3.8,d:2.6}),true);
});
test('real workshop side walls and front pillars are still solid',()=>{
 const walls=[
  {x:-11.2,z:-9.3,w:.4,d:5.8},
  {x:-.5,z:-9.3,w:.4,d:5.8},
  {x:-5.85,z:-12,w:11,d:.4},
  {x:-10.6,z:-6.6,w:1.4,d:.4},
  {x:-1.1,z:-6.6,w:1.4,d:.4},
  {x:-3.65,z:-6.6,w:1,d:.4}
 ];
 const w=workingWorld(walls);
 assert.equal(w.isBlocked(-.5,-9.3,.38),true);
 assert.equal(w.isBlocked(-10.6,-6.6,.38),true);
 assert.equal(w.isBlocked(-7.6,-6.3,.38),false,'main workshop front opening stays accessible');
 assert.equal(w.isBlocked(.9,-3.5,.38),false,'the outdoor approach is traversable');
});
test('actual workshop update removes old phantom parking collision instead of recreating it',()=>{
 const source=readFileSync(new URL('../dist/scene.mjs',import.meta.url),'utf8');
 assert.match(source,/if\(this\.colliders\[i\]\._workshopNv2\)this\.colliders\.splice\(i,1\)/);
 assert.doesNotMatch(source,/this\.colliders\.push\(\{[^}]*_workshopNv2:true/);
});
test('original PUMA red office color is restored, without replacing architecture',()=>{
 const office=readFileSync(new URL('../dist/assets3d/office-shell.mjs',import.meta.url),'utf8');
 assert.match(office,/red:0x701e30,edge:0x461b28/);
 assert.match(office,/const design=new T\.Group\(\)/);
});
