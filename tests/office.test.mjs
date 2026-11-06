import {test} from 'node:test';
import assert from 'node:assert/strict';
import {OFFICE,OFFICE_WALLS,officeBlocked,officeGround,circleHitsRect} from '../dist/assets3d/office-layout.mjs';
import {createMotion,moveController} from '../dist/animation/movement.mjs';

function travel(start,intent,seconds,angles={}){const p={...start},motion=createMotion();for(let i=0;i<seconds*60;i++)moveController(p,motion,intent,1/60,(x,z)=>officeBlocked(x,z,.33,angles));return p;}
test('closed entrance stops the approved controller; opening the actual leaf frees the same route',()=>{
 const start={x:-1.99,z:2.9};const closed=travel(start,{x:0,z:-1},2);assert(closed.z>1.59&&closed.z<1.64);
 const open=travel(start,{x:0,z:-1},1.65,{entry:Math.PI/2});assert(open.z<.5&&open.z>-.84);
});
test('the whole office is an uninterrupted furnishing area, including former partitions and bathroom',()=>{
 assert.equal(OFFICE.zones.length,1);assert.equal(OFFICE.zones[0].id,'work');assert.equal(OFFICE.doors.length,1);
 assert(!OFFICE_WALLS.some(c=>/bath|rest/.test(c.id)));
 for(let x=-1.99;x<=2.5;x+=.1)for(let z=-.7;z<=.7;z+=.1)assert(!officeBlocked(x,z,.33,{entry:Math.PI/2}),`hidden collider ${x},${z}`);
});

test('closed leaves stop variable-rate frames before contact, within one maximum movement step',()=>{
 for(const dt of[1/60,1/30,.05,.08]){
  for(const config of[{p:{x:-1.99,z:3.05},input:{x:0,z:-1},axis:'z',boundary:1.6125,sign:1}]){
   const p={...config.p},motion=createMotion();for(let i=0;i<5/dt;i++)moveController(p,motion,config.input,dt,(x,z)=>officeBlocked(x,z,.33));
   const gap=(p[config.axis]-config.boundary)*config.sign;assert(gap>=-1e-8&&gap<2*dt+1e-8,`${dt}: ${gap}`);assert(motion.speed<.005);assert(!officeBlocked(p.x,p.z,.33));
  }
 }
});
test('windows, outer walls, AC and railings have physical volume',()=>{
 for(const [x,z]of[[-.55,1.2],[0,-1.2],[2.95,-.6],[-2.95,0],[-3.31,-.42],[-2.64,2],[-1.32,2]])assert(officeBlocked(x,z,.33),`${x},${z}`);
});
test('raised floor and stair heights agree with rendered treads; surrounding land is unchanged',()=>{
 assert.equal(OFFICE.width,6);assert.equal(OFFICE.depth,2.5);assert.equal(officeGround(0,0),.42);
 for(const [z,y]of[[1.5,.42],[1.92,.32],[2.23,.22],[2.51,.12],[2.9,0]])assert.equal(officeGround(-1.99,z),y);
 assert.equal(officeGround(5,0),0);
});
test('rounded rectangle contact leaves diagonal corners and rotated clearances accessible',()=>{
 assert(!circleHitsRect(.75,.75,.33,{x:0,z:0,w:1,d:1}));assert(circleHitsRect(.7,.7,.33,{x:0,z:0,w:1,d:1}));
 assert(circleHitsRect(0,.8,.2,{x:0,z:0,w:2,d:.1,angle:Math.PI/2}));assert(!circleHitsRect(.6,0,.2,{x:0,z:0,w:2,d:.1,angle:Math.PI/2}));
});

test('the assembled shell stays within budget and opening a door is reversible without touching the player',async()=>{
 const T=await import('../dist/vendor/three.module.js'),{World}=await import('../dist/scene.mjs'),{createOffice}=await import('../dist/assets3d/office-shell.mjs');
 const previous=globalThis.document;globalThis.document={createElementNS:()=>({addEventListener(){},removeEventListener(){},set src(v){}})};
 try{
  const w=Object.create(World.prototype);Object.assign(w,{gradient:null,materials:new Map(),bevelCache:new Map(),unit:new T.BoxGeometry(1,1,1),edges:new T.EdgesGeometry(new T.BoxGeometry(1,1,1)),edgeMat:new T.LineBasicMaterial(),renderer:{}});
  w.sign=(g,text,width,height,x,y,z)=>{const m=new T.Mesh(new T.PlaneGeometry(width,height),new T.MeshBasicMaterial());m.position.set(x,y,z);g.add(m);return m;};
  const office=createOffice(w);let triangles=0,meshes=0;office.traverse(o=>{if(!o.isMesh)return;meshes++;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;assert([...o.geometry.attributes.position.array].every(Number.isFinite));});
  assert(triangles<18000,`${triangles} triangles`);assert(meshes<100,`${meshes} meshes`);console.log('office budget',{triangles,meshes});
  const api=office.userData.api;assert(api.toggle('entry',-1.99,1.8));for(let i=0;i<40;i++)api.update(1/60,-1.99,1.8,{x:4,z:6});assert.equal(api.angles.entry,Math.PI/2);assert(!api.blocked(-1.99,1.25,.33));
  assert(!api.toggle('entry',-2.1,.85),'swing is blocked when the player occupies its arc');
  assert(api.toggle('entry',-1.99,1.8));for(let i=0;i<40;i++)api.update(1/60,-1.99,1.8,{x:4,z:6});assert.equal(api.angles.entry,0);assert(api.blocked(-1.99,1.25,.33));
  api.update(0,0,0,{x:4,z:6});assert(!office.getObjectByName('03 · Techo desmontable').visible);
  api.update(0,-1.99,1.8,{x:4,z:6},true);assert(!office.getObjectByName('03 · Techo desmontable').visible);
  api.update(0,-1.99,1.8,{x:4,z:6},false);assert(office.getObjectByName('03 · Techo desmontable').visible);
 }finally{globalThis.document=previous;}
});
