import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {World} from '../dist/scene.mjs';
import {createMotion,moveController} from '../dist/animation/movement.mjs';

function fixture(){
 const w=Object.create(World.prototype);Object.assign(w,{scene:new T.Scene(),gradient:null,materials:new Map(),bevelCache:new Map(),unit:new T.BoxGeometry(1,1,1),edges:new T.EdgesGeometry(new T.BoxGeometry(1,1,1)),edgeMat:new T.LineBasicMaterial(),colliders:[],physicalBoundaries:[],labels:[],office:new T.Group()});
 w.office.userData.api={blocked:()=>false};w.sign=()=>new T.Group();w.makeRig();return w;
}
function walk(w,start,input,seconds,dt=1/60){const p={...start},motion=createMotion();for(let i=0;i<seconds/dt;i++)moveController(p,motion,input,dt,(x,z)=>w.isBlocked(x,z,.33));return {p,motion};}
test('the actual rig builder registers all three rail spans and its translated cones',()=>{
 const w=fixture();assert.equal(w.physicalBoundaries.filter(c=>c.kind==='rail').length,3);
 const cones=w.physicalBoundaries.filter(c=>c.kind==='cone');assert.equal(cones.length,2);assert(Math.abs(cones[0].x-2.9)<1e-10);assert(Math.abs(cones[0].z+1.3)<1e-10);
 for(const x of[2.1,9.9])for(let z=-8.35;z<=-.85;z+=.2)assert(w.isBlocked(x,z,.33),`gap between rail posts ${x},${z}`);
 for(let x=2.1;x<=9.9;x+=.2)assert(w.isBlocked(x,-8.35,.33));
});
test('walking at full speed from either side never crosses the rig railings at variable frame rates',()=>{
 const w=fixture();for(const dt of[1/60,1/30,.08])for(const c of[
  {start:{x:1.2,z:-4.6},input:{x:1,z:0},axis:'x',boundary:1.725,side:-1},
  {start:{x:3,z:-3.5},input:{x:-1,z:0},axis:'x',boundary:2.475,side:1},
  {start:{x:10.8,z:-4.6},input:{x:-1,z:0},axis:'x',boundary:10.275,side:1},
  {start:{x:6,z:-9.4},input:{x:0,z:1},axis:'z',boundary:-8.725,side:-1}
 ]){const {p,motion}=walk(w,c.start,c.input,3,dt),gap=(p[c.axis]-c.boundary)*c.side;assert(gap>=-1e-9&&gap<=2*dt+1e-9,JSON.stringify({dt,p,gap}));assert(motion.speed<.005);}
});
test('the open front remains accessible, cones block and diagonal input slides along the rail',()=>{
 const w=fixture();const entry=walk(w,{x:6,z:.3},{x:0,z:-1},1);assert(entry.p.z<-.85&&entry.p.z>-2.17);
 const cone=walk(w,{x:2.9,z:.7},{x:0,z:-1},2);assert(cone.p.z>=-.745-1e-9&&cone.p.z<-.68);assert(cone.motion.speed<.005);
 const slide=walk(w,{x:1.6,z:-6.3},{x:1,z:1},1.5);assert(slide.p.x<=1.725&&slide.p.z>-5.0);
});
test('closed rail fronts and rotated boundaries remain solid; construction props do not leak colliders',()=>{
 const w=fixture(),g=new T.Group();g.position.set(-5,0,3);g.rotation.y=Math.PI/4;w.scene.add(g);
 w.rail(g,0,0,2,2,true);const p=g.localToWorld(new T.Vector3(0,0,1));assert(w.physicalBoundaries.some(c=>c.kind==='rail'&&Math.hypot(c.x-p.x,c.z-p.z)<1e-9));
 w.registerBoundary(g,-1,0,1,0,.11,'fence');const mid=g.localToWorld(new T.Vector3(0,0,0));assert(w.isBlocked(mid.x,mid.z,.33));
 w.construction=new T.Group();const count=w.physicalBoundaries.length;for(let i=0;i<10;i++)w.cone(w.construction,0,0,0);assert.equal(w.physicalBoundaries.length,count);
});
