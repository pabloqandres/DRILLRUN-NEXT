import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {drivePersonalTruck} from '../dist/mission5/personal-drilltruck.mjs';
import {PersonalTruckWheels,fallbackWheelPose} from '../dist/graphics/personal-truck-wheels-v66.mjs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
function stationary(){
 return {position:{x:0,z:0},mission5:{personalTruck:{
  mode:'driving',position:{x:0,z:0},speed:0,heading:0,steerAngle:0
 }}};
}
test('V67: reverse engages from stationary on the very first 60fps frame',()=>{
 const s=stationary();
 const result=drivePersonalTruck(s,{throttle:-1},1/60,()=>false);
 assert(result.speed<0,'first reverse tick must not be reset by the idle deadzone');
 assert(s.mission5.personalTruck.position.z<0,'car must move backwards');
 for(let i=0;i<20;i++)drivePersonalTruck(s,{throttle:-1},1/60,()=>false);
 assert(s.mission5.personalTruck.speed<-.3,'held reverse accelerates gradually');
 assert(s.position.z<0);
});
test('V67: idle dead zone still settles drift and full brake stays progressive',()=>{
 const s=stationary(),truck=s.mission5.personalTruck;
 truck.speed=.02;
 drivePersonalTruck(s,{},1/60,()=>false);
 assert.equal(truck.speed,0);
 drivePersonalTruck(s,{throttle:1},1/60,()=>false);
 assert(truck.speed>0);
 drivePersonalTruck(s,{brake:true},1/60,()=>false);
 assert.equal(truck.speed,0);
});
test('V67: tyre-sized fallback face respects four actual axle corners',()=>{
 const p=fallbackWheelPose({x:2.2,y:2.5,z:5},{x:0,y:1.25,z:0},0,-1,false);
 assert(p.x<-.95&&p.x>-1.20,'hub should sit over left outward wheel face');
 assert(p.z< -1.55&&p.z> -1.85,'rear axle should be behind cabin');
 assert(p.y>.40&&p.y<.55,'hub stays near the physical tyre centre');
 assert(p.radius>.45&&p.radius<.53,'visible rim should not be miniature');
 const q=fallbackWheelPose({x:2.2,y:2.5,z:5},{x:0,y:1.25,z:0},0,1,true);
 assert(q.x>0&&q.z>0);
});
test('V67: anonymous wheel meshes rotate without creating extra tyres',()=>{
 const root=new T.Group();
 const chassis=new T.Mesh(new T.BoxGeometry(2.2,1.4,4.5));
 chassis.position.y=1;root.add(chassis);
 const tyres=[];
 for(const z of [-1.55,1.55])for(const x of [-1.0,1.0]){
  const tyre=new T.Mesh(new T.CylinderGeometry(.46,.46,.27,16));
  tyre.rotation.z=Math.PI/2;tyre.position.set(x,.5,z);
  root.add(tyre);tyres.push(tyre);
 }
 const rig=new PersonalTruckWheels(root);
 assert.equal(rig.mode,'geometry');
 assert.equal(rig.wheels.length,4);
 for(const tyre of tyres)assert.equal(tyre.parent.name,'Wheel-spin-V66');
 rig.update(-2,.14,.03);
 assert(rig.wheels.every(w=>w.spin.rotation.x<0));
 rig.dispose();
});
test('V67: title preserves aspect ratio; fullscreen is requested only on real taps',()=>{
 const title=read('dist/title-preview-v65.html');
 const game=read('dist/chapter/game.mjs');
 const html=read('dist/index.html');
 assert.match(title,/#art\{[^\n]*aspect-ratio:1672\/941/);
 assert.doesNotMatch(title,/@media\(min-aspect-ratio:\s*1\.9\)\{#art\{width:100vw/);
 assert(title.includes('parentDoc.documentElement.requestFullscreen'));
 assert(html.includes('allow="fullscreen" allowfullscreen'));
 assert.match(game,/\$\('#play'\)\.onclick=async\(\)=>\{[\s\S]{0,180}requestImmersive\(\)/);
 assert(game.includes("window.parent.postMessage")===false,'fullscreen enhancement never writes into game message protocol');
});
