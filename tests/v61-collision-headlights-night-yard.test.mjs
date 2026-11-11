import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {World} from '../dist/scene.mjs';
import {drivePersonalTruck} from '../dist/mission5/personal-drilltruck.mjs';
import {
 personalTruckFootprintProbes,countPersonalTruckCollision,
 sweptPersonalTruckCollision,PERSONAL_TRUCK_SWEEP_STEP
} from '../dist/animation/personal-truck-swept-collision.mjs';
import {projectPersonalTruckRoadLight} from '../dist/graphics/personal-drilltruck-headlights.mjs';

const source=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const near=(x,y,margin=.001)=>Math.abs(x-y)<=margin;
const makeState=(heading=0,speed=8.3)=>({
 mission5:{personalTruck:{mode:'driving',heading,speed,position:{x:0,z:0}}},
 position:{x:0,z:0},cash:48010
});
const sandbox=()=>{
 const w=Object.create(World.prototype);
 w.chapterMode=true;w.officeEnabled=false;w.colliders=[];w.physicalBoundaries=[];
 w.chapterCollision=null;w.walkSurfaces=[];
 return w;
};
test('V61 hull samples the actual long side instead of sparse 9 points',()=>{
 assert.equal(personalTruckFootprintProbes(0).length,21);
 assert.equal(PERSONAL_TRUCK_SWEEP_STEP,.12);
 assert.equal(countPersonalTruckCollision(0,0,0,()=>false),0);
 assert(personalTruckFootprintProbes(0).some(([x,z])=>near(x,1.08)&&near(z,.78)));
});
test('V61 30 km/h truck cannot tunnel through a narrow steel railing',()=>{
 const s=makeState(),w=sandbox();
 // Guard railing 13cm thick, just ahead of the initial front bumper:
 // a 0.66m move skips it if only old and final positions are checked.
 w.colliders.push({x:0,z:2.65,w:3.3,d:.13});
 const isBlocked=(x,z,r)=>w.isBlocked(x,z,r);
 assert.equal(countPersonalTruckCollision(0,0,0,isBlocked),0);
 assert.equal(countPersonalTruckCollision(0,.664,0,isBlocked),0);
 const sweep=sweptPersonalTruckCollision(0,0,0,.664,0,isBlocked);
 assert.equal(sweep.blocked,true,'substeps must detect intermediate railing');
 const moved=drivePersonalTruck(s,{throttle:1},.08,isBlocked);
 assert.equal(moved.blocked,true);
 assert.equal(s.position.z,0,'truck bumper may not cut through HSEC railing');
 assert.equal(s.cash,48010);
});
test('V61 all-clear desert supports continuous movement and unchanged steering',()=>{
 const s=makeState(0,3);
 const before=s.mission5.personalTruck.heading;
 const moved=drivePersonalTruck(s,{throttle:1,steer:.3},.08,()=>false);
 assert.equal(moved.blocked,false);assert(moved.position.z>0);
 assert.notEqual(s.mission5.personalTruck.heading,before);
 assert.equal(s.cash,48010);
});
test('V61 existing rail overlap can back out but not plow deeper into it',()=>{
 const s=makeState(0,-2.5),w=sandbox();
 // Already intersecting front bumper: reversing must be possible for a
 // previously saved stuck vehicle, without moving forward into more rails.
 w.colliders.push({x:0,z:2.35,w:3.6,d:.24});
 const blocked=(x,z,r)=>w.isBlocked(x,z,r);
 assert(countPersonalTruckCollision(0,0,0,blocked)>0);
 const result=drivePersonalTruck(s,{throttle:-1},.08,blocked);
 assert(result.position.z<0,'existing penetration must not trap reverse');
 assert.equal(result.blocked,true);
});
test('V61 projected headlights follow road terrain, both heading and grade',()=>{
 const vertices=new T.BufferAttribute(new Float32Array((9*23)*3),3);
 const projector={geo:{
  getAttribute:()=>vertices,computeBoundingSphere(){}
 }};
 const sample=(x,z)=>x*.06+z*.02;
 assert.equal(projectPersonalTruckRoadLight(projector,{x:5,z:6},0,sample),true);
 const first=[vertices.getX(4),vertices.getY(4),vertices.getZ(4)];
 assert(near(first[0],5));assert(first[2]>8);
 assert(near(first[1],sample(first[0],first[2])+.055));
 assert.equal(projectPersonalTruckRoadLight(projector,{x:5,z:6},Math.PI/2,sample),true);
 const turned=[vertices.getX(4),vertices.getY(4),vertices.getZ(4)];
 assert(turned[0]>first[0],'light should rotate to the direction of movement');
 assert(near(turned[2],6));
 assert(near(turned[1],sample(turned[0],turned[2])+.055));
});
test('V61 road projector only exists while headlights are on and is disposed safely',()=>{
 const sourceCode=source('dist/graphics/personal-drilltruck-headlights.mjs');
 const game=source('dist/chapter/game.mjs');
 assert.match(sourceCode,/projector\.mesh\.visible=illuminated/);
 assert.match(sourceCode,/projector\.mesh\.removeFromParent\(\)/);
 assert.match(sourceCode,/projector\.geo\.dispose\(\)/);
 assert.match(sourceCode,/scene\.add\(mesh\)/);
 assert.match(sourceCode,/blending:T\.AdditiveBlending/);
 assert.match(game,/installPersonalTruckHeadlights\(m5PersonalTruckModel,world\)/);
 assert.match(game,/m5TruckLighting\?\.project\(truck\.position,truck\.heading/);
 assert.match(game,/m5TruckLighting\?\.set\(truck\.mode==='driving'&&!!truck\.headlightsOn/);
});
test('V61 patio working areas receive continuous visible illumination even on mobile',()=>{
 const patio=source('dist/mission5/patio-world.mjs');
 assert.match(patio,/const canopyLights=\[/);
 assert.match(patio,/const taskLights=/);
 assert.match(patio,/\[-17,3\.2,18,\.295\]/);
 assert.match(patio,/\[0,3\.2,21,\.295\]/);
 assert.match(patio,/lamp\.pool\.material\.opacity=night\?\(selected\?\.76:\.47\):0/);
 assert.match(patio,/lamp\.pool\.material\.opacity=night\?\(selected\?\.72:\.50\):0/);
 assert.match(patio,/for\(const pool of bayPools\)pool\.material\.opacity=night\?\.62:0/);
});
