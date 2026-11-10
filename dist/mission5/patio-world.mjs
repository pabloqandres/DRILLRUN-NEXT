// M5 · Fixed north-west industrial yard: detailed modular geometry and timed
// blueprint-to-commissioning visualisation. No equipment is ever created here.
// Heavy vehicles and DTH/RC stay in OPEN pads; only small fleet under roof.
import * as T from '../vendor/three.module.js';
import {PATIO_L1,patioProgress,patioState} from './patio-state.mjs';

const C={red:0xb92832,redBright:0xe04542,ink:0x172e40,dark:0x243b4a,
 steel:0x657a86,aluminium:0x8296a1,white:0xf4eee3,concrete:0x85918f,
 road:0x3c474a,road2:0x4a5556,blue:0x56dcf8,yellow:0xebc45b,
 fence:0x8ba9aa,glass:0x89c9d4,light:0xffdda0,earth:0xb29a7c};
const matCache=new Map(),geoCache=new Map();
function mat(color){
 if(!matCache.has(color))matCache.set(color,new T.MeshToonMaterial({color,roughness:0.83}));
 return matCache.get(color);
}
function block(g,w,h,d,x,y,z,color,cast=false){
 const key=[w,h,d].join('_');
 if(!geoCache.has(key))geoCache.set(key,new T.BoxGeometry(w,h,d));
 const mesh=new T.Mesh(geoCache.get(key),mat(color));
 mesh.position.set(x,y,z);mesh.castShadow=cast;mesh.receiveShadow=true;g.add(mesh);
 return mesh;
}
function mark(g,x,z,w,d,color=C.yellow){
 const thick=.095,y=.26;
 block(g,w,.015,thick,x,y,z-d/2,color);
 block(g,w,.015,thick,x,y,z+d/2,color);
 block(g,thick,.015,d,x-w/2,y,z,color);
 block(g,thick,.015,d,x+w/2,y,z,color);
}
function stripes(g,ax,az,bx,bz,step=2,color=C.white){
 const dx=bx-ax,dz=bz-az,n=Math.max(1,Math.floor(Math.hypot(dx,dz)/step));
 for(let i=0;i<n;i++){
  const u=(i+.4)/n;
  const m=block(g,.13,.012,.9,ax+dx*u,.255,az+dz*u,color);
  m.rotation.y=Math.atan2(dx,dz);
 }
}
function roof(g,x,z,w,d,h){
 for(const px of[x-w/2+1,x+w/2-1])for(const pz of[z-d/2+1,z+d/2-1]){
  block(g,.22,h,.22,px,h/2+.15,pz,C.steel,true);
  block(g,.38,.22,.38,px,h+.1,pz,C.red);
 }
 block(g,w,.28,d,x,h+.2,z,C.aluminium,true);
 for(let rx=x-w/2+1;rx<x+w/2-1;rx+=1.6)
  block(g,.065,.055,d,rx,h+.36,z,C.white);
 for(const pz of[z-d/2,z+d/2])block(g,w,.12,.21,x,h+.38,pz,C.red,true);
}
function sign(w,g,label,size,x,y,z){
 w.sign(g,label,size,.42,x,y,z,C.ink,'#f7f0e2');
}
function spotlight(g,x,z,h=6){
 block(g,.17,h,.17,x,h/2+.1,z,C.steel);
 block(g,1.3,.17,.32,x+.55,h+.14,z,C.steel);
 block(g,1,.08,.26,x+.62,h+.06,z,C.light);
}
function fences(g){
 // The ONLY gate is at the east wall of L1: local x=+27, z=+3.
 const X=27,Z=22;
 const segment=(ax,az,bx,bz)=>{
  const length=Math.hypot(bx-ax,bz-az),count=Math.ceil(length/3.1);
  for(let i=0;i<=count;i++){
   const u=i/count,x=ax+(bx-ax)*u,z=az+(bz-az)*u;
   block(g,.20,2.5,.20,x,1.35,z,C.red);
  }
  const beam=(y)=>{
   const o=block(g,.10,.12,length,(ax+bx)/2,y,(az+bz)/2,C.steel);
   o.rotation.y=Math.atan2(bx-ax,bz-az);
  };
  beam(.75);beam(2.45);
  for(let i=0;i<count;i++){
   const u=(i+.5)/count,x=ax+(bx-ax)*u,z=az+(bz-az)*u;
   block(g,.035,1.4,.035,x,1.52,z,C.fence);
  }
 };
 segment(-X,-Z,X,-Z);segment(-X,Z,X,Z);segment(-X,-Z,-X,Z);
 segment(X,-Z,X,-2);segment(X,8,X,Z);
}
function markings(g){
 block(g,53.4,.19,43.4,0,.085,0,C.road);
 block(g,52,.02,9.7,0,.20,3,C.road2);
 // Two-way, wide truck turning spine toward fixed east entrance.
 stripes(g,-24,3.2,23,3.2,4.5,C.yellow);
 for(const z of[-2,8])block(g,50,.015,.13,0,.25,z,C.yellow);
 // Heavy-equipment bays: open air, turning clearances 12–13m.
 for(const x of[-7,5,17])mark(g,x,-13,11.2,15.7,C.yellow);
 // RC and DTH open bays, no overhead canopies or fake static rigs.
 for(const x of[9.4,17.2])mark(g,x,15.25,6.6,10.3,C.yellow);
 // Roofed light fleet: six narrow slots only for pickups and DrillTruck.
 for(const x of[-23,-19.4,-15.8,-12.2,-8.6,-5]){
  mark(g,x,14.1,3.4,7.4,C.yellow);
 }
 // Segregated protected pedestrian route outside the truck turning spine.
 block(g,50,.10,1.7,0,.265,20.2,0x536b6b);
 for(let x=-23;x<24;x+=3)block(g,.25,1.12,.25,x,.74,18.75,C.yellow);
 for(let z=-1;z<8;z+=.75)block(g,2.8,.015,.36,21.5,.27,z,C.white);
}
function buildAccess(w,g){
 const q=new T.Group();q.name='M5 · caseta de acceso y control';g.add(q);
 // Guardhouse kept to the side of a 10m unobstructed portal.
 block(q,4.2,3.1,4.6,24.0,1.75,13.9,C.ink,true);
 block(q,4.6,.26,5.0,24,3.5,13.9,C.red,true);
 for(const z of[12.3,14.9])block(q,.08,1.3,1.2,26.15,2.2,z,C.glass);
 sign(w,q,'CONTROL HSEC',3.6,24,3.5,16.29);
 block(q,1.2,.7,.95,25.9,.60,-1.2,C.red);
 const arm=new T.Group();arm.position.set(25.9,1.25,-1.2);q.add(arm);
 block(arm,.19,.16,8.7,0,0,4.35,C.white);
 for(let z=.65;z<8.7;z+=1.5)block(arm,.21,.18,.65,0,0,z,C.red);
 block(q,.6,.7,.45,25.9,.45,8.9,C.steel);
 sign(w,q,'PATIO DE MAQUINARIAS L1',9.6,12.8,4.15,20.5);
 return arm;
}
function buildCoveredFleet(w,g){
 const q=new T.Group();q.name='M5 · Techumbre solo camionetas y DrillTruck';g.add(q);
 roof(q,-14.4,14.1,22.7,11.8,4.65);
 sign(w,q,'DRILLTRUCK Y CAMIONETAS',11,-14.4,5.32,20.05);
 return q;
}
function buildLogistics(w,g){
 const q=new T.Group();q.name='M5 · Galpón logístico y preparación';g.add(q);
 block(q,13,.28,13.5,-19,.34,-11.2,C.concrete);
 block(q,13.2,4.7,.24,-19,2.72,-18,C.white,true);
 for(const x of[-25.6,-12.4])block(q,.25,4.7,13.5,x,2.7,-11.2,C.white,true);
 roof(q,-19,-11.2,14.6,14.3,5.0);
 block(q,13.2,.55,.22,-19,4.28,-4.3,C.red,true);
 sign(w,q,'GALPÓN DE APOYO',8.0,-19,4.4,-4.16);
 // Real physical racks and stacks: cosmetic, no free inventory.
 for(const x of[-23.2,-19,-14.8]){
  for(const y of[.9,1.95])block(q,3.4,.17,1.5,x,y,-13.6,C.steel);
  for(const z of[-14.1,-12.9])block(q,1.1,.75,.95,x,.58,z,0x94765b);
 }
 return q;
}
function buildFuel(w,g){
 const q=new T.Group();q.name='M5 · Combustible aislado HSEC';g.add(q);
 block(q,6.4,.22,10,1.5,.37,14.3,C.concrete);
 roof(q,1.5,14.3,6.4,10.4,4.6);
 for(const x of[.5,2.5]){
  block(q,1.05,2.0,1.1,x,1.40,15.0,C.red,true);
  block(q,.7,.62,.07,x,1.88,15.6,C.ink);
  block(q,.12,1.1,.11,x+.43,1.01,15.6,C.ink);
 }
 // Bunded fuel vessel, safely isolated inside the fuel module.
 block(q,5.8,.55,2.5,1.5,.55,10.65,C.steel);
 const tank=new T.Mesh(new T.CylinderGeometry(1,1,5.8,14),mat(C.white));
 tank.rotation.z=Math.PI/2;tank.position.set(1.5,1.52,10.65);q.add(tank);
 block(q,5.8,.12,.15,1.5,2.2,10.65,C.red);
 sign(w,q,'COMBUSTIBLE · HSEC',6.4,1.5,5.32,20.08);
 return q;
}
function operationalDetails(w,g){
 fences(g);
 for(const [x,z]of [[-24,-19],[-6,-19],[11,-19],[25,-19],[-24,19],[-7,19],[8,19],[25,19]])
  spotlight(g,x,z,6.4);
 for(let z=-17;z<-6;z+=2.3)block(g,.18,.65,.18,25,.48,z,C.yellow);
 const hsec=new T.Group();g.add(hsec);hsec.name='M5 · Señalética seguridad HSEC';
 sign(w,hsec,'SEGURIDAD Y ORDEN',8.2,-4,3.75,19.89);
 sign(w,hsec,'EQUIPOS PESADOS · ABIERTO',10,5,3.9,-20.1);
 sign(w,hsec,'PERFORADORAS · ABIERTO',11,15,3.9,20.06);
 for(const x of[-22,22])for(const z of[-17,17]){
  block(g,.38,1.15,.38,x,.70,z,C.red);
  block(g,.56,.1,.56,x,1.31,z,C.white);
 }
}
function blueprint(w,root){
 const g=new T.Group();g.name='M5 · Holograma blueprint';root.add(g);
 const m=new T.LineBasicMaterial({color:C.blue,transparent:true,opacity:.85});
 const makeOutline=(x,z,ww,dd)=>{
  const pts=[new T.Vector3(x-ww/2,.33,z-dd/2),new T.Vector3(x+ww/2,.33,z-dd/2),
   new T.Vector3(x+ww/2,.33,z+dd/2),new T.Vector3(x-ww/2,.33,z+dd/2),
   new T.Vector3(x-ww/2,.33,z-dd/2)];
  g.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),m));
 };
 makeOutline(0,0,54,44);
 for(const [x,z,ww,dd]of[[-14.4,14.1,22.7,11.8],[-19,-11.2,14.6,14.3],[1.5,14.3,6.4,10.4],
   [-7,-13,11.2,15.7],[5,-13,11.2,15.7],[17,-13,11.2,15.7],[15,15.25,21,10.3]])makeOutline(x,z,ww,dd);
 for(const x of[-27,27])for(const z of[-22,22])
  block(g,.32,.38,.32,x,.45,z,C.blue);
 sign(w,g,'BLUEPRINT · PATIO L1',10,0,1.2,22);
 return g;
}
function futurePlots(w){
 const g=new T.Group();g.name='Futuras ampliaciones bloqueadas';w.scene.add(g);
 // Reserved land: visible outlines, never functional or billed.
 const m=new T.LineDashedMaterial({color:0x8798a0,transparent:true,opacity:.56,dashSize:1,gapSize:1});
 for(const p of[{x:-105,z:-17,w:44,d:42,label:'PATIO L2 · BLOQUEADO'},
                 {x:-104,z:-65,w:44,d:42,label:'PATIO L3 · BLOQUEADO'}]){
  const pts=[new T.Vector3(p.x-p.w/2,.5,p.z-p.d/2),new T.Vector3(p.x+p.w/2,.5,p.z-p.d/2),
    new T.Vector3(p.x+p.w/2,.5,p.z+p.d/2),new T.Vector3(p.x-p.w/2,.5,p.z+p.d/2),
    new T.Vector3(p.x-p.w/2,.5,p.z-p.d/2)];
  const l=new T.Line(new T.BufferGeometry().setFromPoints(pts),m);l.computeLineDistances();g.add(l);
  // Only a visual reservation. No colliders and no gameplay actions.
 }
 return g;
}
export function createPatioWorld(w){
 const root=new T.Group();root.name='M5 · Patio de Maquinarias L1';root.position.set(-51,0,-17);w.scene.add(root);
 const hologram=blueprint(w,root);
 const grading=new T.Group();grading.name='M5 · Suelo y vialidad';root.add(grading);markings(grading);
 const structures=new T.Group();root.add(structures);
 buildCoveredFleet(w,structures);
 buildLogistics(w,structures);
 buildFuel(w,structures);
 const access=buildAccess(w,structures);
 const final=new T.Group();root.add(final);operationalDetails(w,final);
 const future=futurePlots(w);
 let previousState='',registered=false;
 return {
  root,access,future,
  update(s,now=Date.now()){
   const status=patioState(s),enabled=!!(s?.mission4?.phase==='complete');
   if(!enabled){root.visible=false;future.visible=false;w.yardL1Open=false;return;}
   root.visible=true;future.visible=status!=='locked';
   const info=patioProgress(s,now);
   const stateKey=status+':'+info.phase;
   if(stateKey!==previousState){
    previousState=stateKey;
    hologram.visible=status==='locked'||(status==='building'&&info.progress<.98);
    grading.visible=status==='operational'||(status==='building'&&info.progress>=.10);
    structures.visible=status==='operational'||(status==='building'&&info.progress>=.30);
    final.visible=status==='operational'||(status==='building'&&info.progress>=.80);
    w.yardL1Open=enabled;
   }
   if(status==='operational'&&!registered){
    registered=true;
    // Static walls are actual collision boundaries with a single 10m-wide
    // east gate. Clear the gate route, work areas and all pedestrian lanes.
    for(const [ax,az,bx,bz]of[
     [-27,-22,27,-22],[-27,22,27,22],[-27,-22,-27,22],
     [27,-22,27,-2],[27,8,27,22]
    ])w.registerBoundary(root,ax,az,bx,bz,.20,'patio-fence');
    for(const item of[
     {x:-70,z:-28.2,w:13.2,d:13.5},
     {x:-27,z:-3.1,w:4.2,d:4.6},
     {x:-49.5,z:-2.7,w:6.4,d:10}
    ])w.colliders.push({...item,_patio:true});
    w.walkSurfaces??=[];
    w.walkSurfaces.push({x:-51,z:-17,w:53.4,d:43.4,y:.19});
    // Real fixed road connector, from the single gate to the M4 road spine.
    const connector=new T.Group();connector.name='Patio L1 · conector vial';
    w.scene.add(connector);
    block(connector,11.4,.13,8.5,-18.6,.07,-14,C.road);
    for(const z of[-18.05,-9.95])block(connector,11.4,.016,.10,-18.6,.16,z,C.yellow);
    w.walkSurfaces.push({x:-18.6,z:-14,w:11.4,d:8.5,y:.17});
   }
   if(status==='building'){
    // The hologram pulses while real time (including offline time) advances.
    const pulse=.66+.29*Math.sin(now*.003);
    hologram.traverse(x=>{if(x.material?.isLineBasicMaterial)x.material.opacity=pulse;});
   }
   // Barrier is up for vehicles using its one fixed entrance.
   const truck=s.mission4?.drillTruck;
   const truckNear=!!truck?.position&&
    Math.hypot(truck.position.x-PATIO_L1.gate.x,truck.position.z-PATIO_L1.gate.z)<12;
   const desired=truckNear||w.fleetGateInUse?-Math.PI/2:0;
   access.rotation.x+=(desired-access.rotation.x)*.12;
  },
  dispose(){root.removeFromParent();future.removeFromParent();}
 };
}
