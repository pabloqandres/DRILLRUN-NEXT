import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PersonalTruckFreeLook} from '../dist/camera/personal-truck-free-look.mjs';
import {installWorldGestures} from '../dist/camera/gestures.mjs';
const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const near=(a,b,tol=1e-8)=>Math.abs(a-b)<tol;
test('V58 default truck camera stays at the original elevated chase pose',()=>{
 const cam=new PersonalTruckFreeLook(),v=cam.view({x:12,z:8},0);
 assert(near(v.target.x,12)&&near(v.target.y,1.8)&&near(v.target.z,8));
 assert(near(v.offset.x,0)&&near(v.offset.y,7.2)&&near(v.offset.z,-10.7));
});
test('V58 camera can look to vehicle right and rear without turning the truck',()=>{
 const cam=new PersonalTruckFreeLook(),truck={position:{x:10,z:15},heading:0.3,speed:4.5};
 const original=structuredClone(truck),before=cam.view(truck.position,truck.heading);
 cam.rotate(-140,0,1); // drag screen to the left => orbit relative to truck
 const side=cam.view(truck.position,truck.heading);
 assert(!near(before.offset.x,side.offset.x));
 assert(!near(before.offset.z,side.offset.z));
 assert.deepEqual(truck,original,'camera interaction may not mutate car physics');
 // Orbit heading remains relative to actual truck heading on a bend.
 truck.heading+=0.9;truck.position={x:12,z:19};
 const following=cam.view(truck.position,truck.heading);
 assert.deepEqual(following.target,{x:12,y:1.8,z:19});
 assert(near(Math.hypot(following.offset.x,following.offset.z),
  Math.hypot(side.offset.x,side.offset.z)));
 assert(!near(side.offset.x,following.offset.x));
});
test('V58 pitch/zoom clamp, invalid deltas ignored, home restores chase view',()=>{
 const cam=new PersonalTruckFreeLook();
 cam.rotate(90000,90000);
 assert(near(cam.pitch,.34));
 cam.rotate(0,-90000);
 assert(near(cam.pitch,-.26));
 cam.zoomBy(9000);assert(near(cam.zoom,.65));
 cam.zoomBy(-9000);assert(near(cam.zoom,1.55));
 cam.rotate(Infinity,NaN);cam.zoomBy(NaN);
 assert(Number.isFinite(cam.yaw)&&Number.isFinite(cam.pitch)&&Number.isFinite(cam.zoom));
 cam.reset();
 assert.deepEqual({yaw:cam.yaw,pitch:cam.pitch,zoom:cam.zoom},{yaw:0,pitch:0,zoom:1});
 assert(near(cam.view({x:0,z:0}).offset.y,7.2));
});
test('V58 real world gestures only rotate when starting in the right half',()=>{
 const c={style:{},setPointerCapture(){},clientHeight:390,
  getBoundingClientRect:()=>({left:0,width:844}),addEventListener(){}};
 const cam=new PersonalTruckFreeLook();
 let steering=0;
 installWorldGestures(c,{canLook:()=>true,dragAnywhere:()=>false,
  onLook:(dx,dy)=>cam.rotate(dx,dy),
  onTap:()=>{},onZoom:delta=>cam.zoomBy(delta)});
 const pointer=(id,x,y)=>({pointerId:id,button:0,clientX:x,clientY:y,preventDefault(){}});
 c.onpointerdown(pointer(1,200,160));
 c.onpointermove(pointer(1,260,160));c.onpointerup(pointer(1,260,160));
 assert.equal(cam.yaw,0,'left joystick area must remain free of view rotation');
 c.onpointerdown(pointer(2,650,160));
 c.onpointermove(pointer(2,700,160));c.onpointerup(pointer(2,700,160));
 assert.notEqual(cam.yaw,0,'right screen drag must orbit camera');
 assert.equal(steering,0);
});
test('V58 shared game integration is scoped to camera while driving',()=>{
 const game=source('dist/chapter/game.mjs');
 assert.match(game,/import \{PersonalTruckFreeLook\} from '\.\.\/camera\/personal-truck-free-look\.mjs'/);
 assert.match(game,/if\(personalTruck\(s\)\?\.mode==='driving'\)\{[\s\S]*?truckFreeLook\.rotate\(dx,dy/);
 assert.match(game,/truckFreeLook\.view\(pt\.position,pt\.heading\)/);
 assert.match(game,/truckFreeLook\.zoomBy\(delta\)/);
 assert.match(game,/truckFreeLook\.reset\(\);world\.chapterCamera=null/);
 assert.match(game,/world\.cameraRig\.reset\(\);truckFreeLook\.reset\(\)/);
 assert.match(game,/drivePersonalTruck\(s,\{throttle,steer:personalTruckVisualSteer\(steer\)/);
});
